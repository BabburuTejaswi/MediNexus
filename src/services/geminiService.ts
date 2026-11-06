/**
 * MediNexus Gemini Service Client
 * Handles communication with server-side AI endpoints.
 * Never exposes the GEMINI_API_KEY to the client bundle.
 */

import { ReportAnalysis } from '../types/index.ts';

export interface ChatResponse {
  reply: string;
  disclaimer: string;
}

export interface AnalyzeReportResponse {
  success: boolean;
  analysis: ReportAnalysis;
  analyzedAt: string;
}

export async function sendChatMessage(messages: { role: string; content: string }[], userQuery: string): Promise<ChatResponse> {
  const response = await fetch('/api/gemini/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages, userQuery }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to communicate with MediNexus AI Assistant.');
  }

  return data;
}

export async function analyzeMedicalReport(
  reportText: string,
  reportName: string,
  imageBase64?: string,
  mimeType?: string
): Promise<AnalyzeReportResponse> {
  const response = await fetch('/api/gemini/analyze-report', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      reportText,
      reportName,
      imageBase64,
      mimeType,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to analyze report with MediNexus AI.');
  }

  return data;
}
