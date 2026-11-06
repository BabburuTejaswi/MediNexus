# MediNexus 🩺
### Your Health, Better Understood.

MediNexus is a production-grade, patient-first digital healthcare portal engineered to explore health information, understand medical reports, and keep health documents organized. Built with modern full-stack web technologies, strict data isolation, deterministic emergency safety layers, and server-side Gemini AI integration.

Runs cleanly in Google AI Studio, locally in Visual Studio Code on Windows, macOS, and Linux, and deploys to Google Cloud Run, Render, or Railway.

---

## 🌟 Core Pillars

1. **AI Health Information with Medical Boundaries**
   - Natural language healthcare education powered server-side by Google's Gemini models (`gemini-2.5-flash` with automated resilient fallback).
   - Server-side API key proxying prevents secret exposure in the frontend client.
   - Versioned patient disclaimer acknowledgment requirement stored persistently.
   - Strictly non-diagnostic boundaries: provides educational clarity to discuss with a certified physician.

2. **Emergency Guidance & Triage**
   - Instant deterministic filter detecting life-threatening emergencies (acute chest pain, stroke symptoms FAST, severe respiratory distress, uncontrollable bleeding, loss of consciousness).
   - High-priority red alert banner with one-tap dialing to **India's National Emergency Number (112)** and state ambulance assistance (108 / 102).
   - Immediate 1-click nearby hospital routing. Independent of AI generation latency.

3. **Medical Report Explanations**
   - Client-side validation and parsing for PDF and image reports (up to 15MB).
   - Plain-language patient breakdown: translates complex clinical terminology, provides normal reference intervals, highlights out-of-range metrics, and generates thoughtful questions for your next doctor's visit.
   - Original document preservation with download, re-analysis, and deletion capabilities.

4. **Personal Health Records Library**
   - Permanent, confidential record management scoped strictly to the authenticated user.
   - Search by test name, filter by category (Lab Reports, Radiology, Cardiology, Prescriptions), and sort chronologically.
   - Complete export and deletion capabilities.

5. **Health Vitals Tracking**
   - Log blood pressure, fasting glucose, heart rate, and weight over time.
   - Visual trend charts and chronological history logs to track wellness patterns.

6. **Nearby Care Finder (₹0 Cost)**
   - Find nearby hospitals and emergency medical facilities using device location or manual city search.
   - Direct Google Maps routing, turn-by-turn navigation, and telephone calling links without expensive third-party Places API fees.

7. **Multi-User Isolation & Security**
   - User-scoped data isolation ensuring patients can only access their own medical data.
   - Dual-mode architecture: zero-friction persistent storage out-of-the-box, plus full Firebase Firestore & Auth compatibility with included `firestore.rules` and `storage.rules`.

---

## 🚀 Quick Start (Local Development)

For detailed beginner-friendly Windows instructions, see **[SETUP_GUIDE.md](./SETUP_GUIDE.md)**.

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
# Copy the example environment file and insert your Gemini API key
cp .env.example .env

# 3. Start full-stack development server
npm run dev
```

Open your browser at:
```
http://localhost:3000
```

To stop the server at any time, press `Ctrl + C` in your terminal.

---

## 🧪 Automated Testing & Verification

Run the comprehensive automated test suite (emergency symptom detection, negation handling, multi-user isolation, and disclaimer versioning):
```bash
npm run test
```

Check TypeScript types and compile production bundles:
```bash
npm run lint
npm run build
```

---

## ⚙️ Environment Variables

All environment variables used by the application are documented with defaults in [`.env.example`](./.env.example):

| Variable | Description | Default |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Google Gemini API key (server-side only) | *(Required for AI features)* |
| `GEMINI_MODEL` | Primary Gemini model for healthcare assistance | `gemini-2.5-flash` |
| `PORT` | Local Express backend port | `3000` |
| `APP_URL` | Local application base URL | `http://localhost:3000` |
| `VITE_FIREBASE_*` | Optional Firebase configuration variables | *(Optional cloud mode)* |

---

## 🌐 Understanding Environments and URLs

- **GitHub Repository URL** (`https://github.com/username/medinexus`): Source code and version control. Pushing here does not automatically deploy a live public website.
- **Local Development URL** (`http://localhost:3000`): Runs on your personal machine during `npm run dev`.
- **AI Studio Preview URL** (`https://...aistudio-hub...`): Real-time interactive cloud development preview in Google AI Studio.
- **Production URL**: Live public URL when hosted on Google Cloud Run, Render, or Railway.

---

## 🛡️ Medical & Safety Disclaimer

MediNexus is an educational and informational tool designed to facilitate patient understanding and health record organization. It is **not** a medical diagnostic device and does **not** provide clinical diagnosis, medical advice, or prescriptions. Always consult a qualified medical professional for health concerns. In the event of a medical emergency in India, call **112** (or **108/102** for ambulance assistance) or proceed to the nearest emergency room immediately.
