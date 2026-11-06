import express, { Request, Response } from 'express';
import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

// Middleware for parsing JSON with a 20MB limit for report uploads
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Helper to get GoogleGenAI client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  if (apiKey.startsWith('AQ.')) {
    console.warn('[MediNexus AI] Warning: GEMINI_API_KEY begins with "AQ.", which is an internal AI Studio session token rather than an official API key. If requests fail, replace it with your Google AI Studio API key starting with "AIzaSy..." from https://aistudio.google.com/app/apikey');
  }
  return new GoogleGenAI({
    apiKey: apiKey.trim(),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Candidate models in preference order
const PRIMARY_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const FALLBACK_MODELS = ['gemini-2.5-flash', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'];

async function executeGeminiWithFallback(
  ai: GoogleGenAI,
  generateParams: { contents: any; config?: any }
) {
  const modelsToTry = [
    PRIMARY_MODEL,
    ...FALLBACK_MODELS.filter((m) => m !== PRIMARY_MODEL),
  ];

  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`[MediNexus AI] Calling model: ${model} (attempt ${attempt})`);
        const response = await ai.models.generateContent({
          model,
          contents: generateParams.contents,
          config: generateParams.config,
        });
        return { response, modelUsed: model };
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || JSON.stringify(err);
        const isTemporary =
          errMsg.includes('503') ||
          errMsg.includes('high demand') ||
          errMsg.includes('UNAVAILABLE') ||
          errMsg.includes('429') ||
          errMsg.includes('RESOURCE_EXHAUSTED');

        console.warn(`[MediNexus AI] ${model} attempt ${attempt} failed: ${errMsg}`);

        if (isTemporary && attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 800));
          continue;
        }

        // Move to next candidate model if available
        break;
      }
    }
  }

  throw lastError;
}

// -------------------------------------------------------------
// Health Check Endpoint
// -------------------------------------------------------------
app.get('/api/health', (_req: Request, res: Response) => {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  res.json({
    status: 'healthy',
    service: 'MediNexus Healthcare Platform',
    timestamp: new Date().toISOString(),
    geminiConfigured: hasGeminiKey,
    primaryModel: PRIMARY_MODEL,
  });
});

// -------------------------------------------------------------
// AI Health Assistant Chat Endpoint
// -------------------------------------------------------------
app.post('/api/gemini/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const { messages, userQuery } = req.body;
    
    if (!userQuery && (!messages || !Array.isArray(messages) || messages.length === 0)) {
      res.status(400).json({ error: 'User query or messages array is required.' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: 'Gemini API key is not configured on the server. Please set GEMINI_API_KEY in your .env or AI Studio Secrets.',
        code: 'API_KEY_MISSING',
      });
      return;
    }

    const systemInstruction = `You are the MediNexus AI Health Assistant, a compassionate, informative, and medically responsible digital healthcare educator.
Your purpose is to explain health concepts, wellness guidance, and medical terminology in clear, reassuring, patient-friendly language.

CRITICAL RULES AND SAFETY BOUNDARIES:
1. You are NOT a doctor and cannot diagnose conditions, prescribe medications, or replace personal clinical evaluation.
2. Never tell the patient to alter, cease, or begin prescription dosages without clinician supervision.
3. If the user mentions symptoms that could be an immediate medical emergency (e.g. crushing chest pain, sudden numbness or facial droop, severe respiratory arrest, major trauma, uncontrollable bleeding, anaphylaxis), prioritize advising them with utmost urgency to call India's national emergency number 112 immediately (or 108/102 for state ambulance assistance, noting availability can vary by state/service), or proceed to the nearest hospital emergency department right away. Do not delay urgent safety guidance. Clarify that calls must be dialed by the user and are not placed automatically.
4. Always recommend consulting a certified physician for personalized medical advice.
5. Format your answers clearly with concise paragraphs, bullet points when appropriate, and plain-language definitions of clinical terms.`;

    // Prepare contents array for Gemini
    let conversationContents: any[] = [];

    if (Array.isArray(messages) && messages.length > 0) {
      // Map previous messages to Gemini format
      conversationContents = messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));
    } else {
      conversationContents = [{ role: 'user', parts: [{ text: userQuery }] }];
    }

    const { response, modelUsed } = await executeGeminiWithFallback(ai, {
      contents: conversationContents,
      config: {
        systemInstruction,
        temperature: 0.3,
      },
    });

    const reply = response.text || "I apologize, but I could not formulate a response at this time. Please try again.";
    
    res.json({
      reply,
      modelUsed,
      disclaimer: "Informational assistance only. Not medical advice.",
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/chat:', error);
    const errMsg = error?.message || JSON.stringify(error);
    const isHighDemand =
      errMsg.includes('503') ||
      errMsg.includes('high demand') ||
      errMsg.includes('UNAVAILABLE') ||
      errMsg.includes('429');

    const statusCode = isHighDemand ? 503 : 500;
    const userMessage = isHighDemand
      ? 'The AI model service is temporarily experiencing high global demand. Please click "Retry" in a few seconds.'
      : (error?.message || 'An error occurred while generating the AI response.');

    res.status(statusCode).json({
      error: userMessage,
      isRetryable: isHighDemand,
      code: isHighDemand ? 'HIGH_DEMAND_503' : 'GENERATE_CONTENT_ERROR',
    });
  }
});

// -------------------------------------------------------------
// Medical Report Analysis Endpoint
// -------------------------------------------------------------
app.post('/api/gemini/analyze-report', async (req: Request, res: Response): Promise<void> => {
  try {
    const { reportText, reportName, imageBase64, mimeType } = req.body;

    if (!reportText && !imageBase64) {
      res.status(400).json({ error: 'Extracted report text or image data is required for analysis.' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: 'Gemini API key is not configured on the server. Please set GEMINI_API_KEY in your .env or AI Studio Secrets.',
        code: 'API_KEY_MISSING',
      });
      return;
    }

    const prompt = `You are a clinical laboratory scientist and medical communicator analyzing a patient's medical report: "${reportName || 'Medical Report'}".
Your task is to provide an objective, educational, plain-English breakdown of this medical report so the patient can understand their health data and have a constructive discussion with their doctor.

STRICT INSTRUCTIONS:
- You must NOT invent or hallucinate test names, values, or reference ranges that do not exist in the source report.
- Clearly differentiate between:
  * "normal" (value within stated reference interval)
  * "abnormal" (outside normal range, e.g. mildly elevated or decreased)
  * "critical" (significantly aberrant or flagged critical by the lab, requiring prompt medical review)
- Explain medical terms in simple language (e.g. "Erythrocytes = Red Blood Cells that carry oxygen").
- Provide 3-5 thoughtful questions the patient can ask their physician during their next consultation.
- Clearly note any extraction uncertainties, blurred text, or missing data.

Return ONLY a valid JSON object matching this exact structure:
{
  "reportType": "e.g., Complete Blood Count (CBC) / Lipid Panel / Metabolic Panel / Radiology",
  "reportDate": "Report date or 'Not specified'",
  "summary": "Clear, patient-friendly 2-3 paragraph overview of the findings.",
  "metrics": [
    {
      "name": "Test or Biomarker name",
      "value": "Patient's measured value as a string (e.g., '14.2')",
      "unit": "Unit of measurement (e.g., 'g/dL', 'mg/dL', 'fl')",
      "referenceRange": "Normal reference interval printed on report (e.g., '12.0 - 16.0')",
      "status": "normal" | "abnormal" | "critical",
      "explanation": "Brief explanation of what this test represents and why it matters."
    }
  ],
  "medicalTerms": [
    {
      "term": "Clinical Term",
      "plainDefinition": "Everyday language definition."
    }
  ],
  "questionsForDoctor": [
    "Question 1 for clinician",
    "Question 2 for clinician"
  ],
  "potentialConcerns": [
    "Specific items warranting clinician review (or 'No major flags detected')"
  ],
  "uncertaintiesOrNotes": "Any unreadable sections, artifacts, or missing pages, or 'None'"
}

Report Content to analyze:
${reportText || 'Analyze the attached report image.'}`;

    let contentsPayload: any;

    if (imageBase64 && mimeType) {
      contentsPayload = {
        parts: [
          {
            inlineData: {
              data: imageBase64.replace(/^data:[^;]+;base64,/, ''),
              mimeType: mimeType,
            },
          },
          { text: prompt },
        ],
      };
    } else {
      contentsPayload = prompt;
    }

    const { response, modelUsed } = await executeGeminiWithFallback(ai, {
      contents: contentsPayload,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const responseText = response.text || '{}';
    let parsedResult;
    try {
      parsedResult = JSON.parse(responseText);
    } catch {
      // In case markdown ticks were included
      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedResult = JSON.parse(cleaned);
    }

    res.json({
      success: true,
      analysis: parsedResult,
      modelUsed,
      analyzedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/analyze-report:', error);
    const errMsg = error?.message || JSON.stringify(error);
    const isHighDemand =
      errMsg.includes('503') ||
      errMsg.includes('high demand') ||
      errMsg.includes('UNAVAILABLE') ||
      errMsg.includes('429');

    const statusCode = isHighDemand ? 503 : 500;
    const userMessage = isHighDemand
      ? 'The AI model service is temporarily experiencing high global demand. Please try analyzing again in a few moments.'
      : (error?.message || 'Failed to analyze the medical report with Gemini.');

    res.status(statusCode).json({
      error: userMessage,
      isRetryable: isHighDemand,
    });
  }
});

// -------------------------------------------------------------
// Vite Middleware / Static Server
// -------------------------------------------------------------
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  const httpServer = http.createServer(app);

  if (!isProduction) {
    // Development mode: attach Vite dev server middleware.
    // In AI Studio or when DISABLE_HMR is set, the preview proxy does not support WebSocket upgrades.
    // Disabling HMR in AI Studio eliminates futile WebSocket connection attempts and unhandled rejections.
    // In local VS Code development, HMR is attached to httpServer for instant hot module reloading.
    const isAiStudio = Boolean(
      process.env.APPLET_ID ||
      (process.env.APP_URL && !process.env.APP_URL.includes('localhost') && !process.env.APP_URL.includes('127.0.0.1')) ||
      process.env.DISABLE_HMR === 'true' ||
      process.env.K_SERVICE
    );

    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: isAiStudio ? false : { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: serve built assets from dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  httpServer.listen(port, '0.0.0.0', () => {
    console.log(`MediNexus server running on port ${port} [Mode: ${isProduction ? 'production' : 'development'}]`);
  });
}

startServer();
