# MediNexus — Complete Deployment & Cloud Hosting Guide

This guide details how to take your MediNexus application from your local computer and deploy it to a live public URL that you can share with evaluators, mentors, and on your resume.

---

## 1. Hosting Options Overview

MediNexus is a full-stack application (React client + Node/Express backend).
- **Frontend + Backend together (Recommended)**: Google Cloud Run, Render, or Railway.
- **Frontend static only**: Vercel/Netlify (Requires hosting the `/api` routes on a server or serverless functions).

### Why GitHub Pages Alone Is Not Sufficient
GitHub Pages only hosts static HTML/JS/CSS files. It cannot run Node.js code or server-side environment variables (`GEMINI_API_KEY`). MediNexus uses a secure backend so your Gemini API key is never exposed to the public internet. Therefore, we use **Google Cloud Run** or **Render / Railway** for full-stack hosting.

---

## 2. Option A: Google Cloud Run (Recommended for AI Studio Projects)

Google Cloud Run offers a generous free tier (2 million requests/month, 360,000 vCPU-seconds free per month).

### Step 1: Install Google Cloud CLI
1. Download from [https://cloud.google.com/sdk/docs/install](https://cloud.google.com/sdk/docs/install).
2. Run `gcloud init` and log in with your Google account.
3. Set your project:
   ```bash
   gcloud config set project YOUR_PROJECT_ID
   ```

### Step 2: Build and Deploy Container
In the root directory of MediNexus:
```bash
# Build the production bundle
npm run build

# Deploy directly via Google Cloud Build & Run
gcloud run deploy medinexus \
  --source . \
  --platform managed \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY="your-gemini-api-key",PORT="3000"
```

Cloud Run will output your live URL, e.g.:
`https://medinexus-xxxx-xx.a.run.app`

---

## 3. Option B: Free Full-Stack Deployment on Render / Railway

### Deploying on Render (Free Web Service)
1. Push your code to GitHub (see GitHub Guide below).
2. Go to [https://render.com/](https://render.com/) and create a free account.
3. Click **New +** > **Web Service**.
4. Connect your GitHub repository `MediNexus`.
5. Configure settings:
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
6. In **Environment Variables**, add:
   - `GEMINI_API_KEY` = your API key
   - `NODE_ENV` = `production`
7. Click **Create Web Service**. Render builds and deploys your live site with free SSL (`https://medinexus.onrender.com`).

---

## 4. GitHub Step-by-Step Guide for Beginners

### Step 1: Create a GitHub Repository
1. Log in to [GitHub](https://github.com/).
2. Click the **+** icon in the top right > **New repository**.
3. Name it `MediNexus`.
4. Choose **Public** (or **Private**). Do NOT initialize with README (we already have a complete one).
5. Click **Create repository**.

### Step 2: Push Your Local Code from VS Code Terminal
In your local MediNexus folder terminal, run:

```bash
# 1. Initialize git if not already initialized
git init

# 2. Check that .gitignore is properly preventing .env and node_modules from staging
git status

# 3. Add all project files
git add .

# 4. Commit your initial release
git commit -m "feat: complete MediNexus full-stack platform"

# 5. Set main branch
git branch -M main

# 6. Link to your GitHub repo (replace with your actual URL)
git remote add origin https://github.com/YOUR_USERNAME/MediNexus.git

# 7. Push the code
git push -u origin main
```

### Security Check Before Pushing:
Run `git status` and verify that `.env` is **NOT** listed in green (staged). Only `.env.example` should be committed. MediNexus's `.gitignore` protects you automatically.

---

## 5. Post-Deployment Verification Checklist

1. [ ] Open the public URL in an incognito window.
2. [ ] Register a new test patient account.
3. [ ] Open AI Assistant, verify the **"Before you start chatting"** disclaimer modal pops up.
4. [ ] Try entering an emergency symptom (e.g., "I have crushing chest pain") and verify immediate red alert.
5. [ ] Ask a normal health question (e.g., "What does HDL vs LDL cholesterol mean?") and verify Gemini response.
6. [ ] Upload a sample lab report (PDF or image) and test the AI Medical Report Analysis.
7. [ ] Save a manual blood pressure reading in Health History and check the chart update.
8. [ ] Click "Find Nearby Hospitals" and test directions/call buttons.
9. [ ] Log out, log in with a second account, and confirm that the second user cannot see the first user's records!
