# MediNexus — Complete Windows Setup & Developer Guide

This guide provides beginner-friendly, step-by-step instructions for setting up, running, debugging, and maintaining **MediNexus** on Windows using **Visual Studio Code**, connecting your Gemini API key and Firebase credentials, and pushing your project to **GitHub**.

---

## 1. Prerequisites (Windows)

Before running the project on your Windows computer, install the three required free tools:

### Step 1: Install Node.js LTS
1. Visit the official Node.js website: [https://nodejs.org/](https://nodejs.org/)
2. Download the installer labeled **LTS (Recommended For Most Users)** (e.g., Node.js v20.x or v22.x).
3. Run the downloaded `.msi` file.
4. During installation, accept the license agreement and leave all default options selected (specifically ensure the checkbox **"Add to PATH"** is checked).
5. Click **Finish**.

### Step 2: Install Git for Windows
1. Visit [https://git-scm.com/download/win](https://git-scm.com/download/win)
2. Download the **64-bit Git for Windows Setup**.
3. Run the installer. You can safely accept the default recommended options through the wizard.
4. Click **Install** and then **Finish**.

### Step 3: Install Visual Studio Code
1. Visit [https://code.visualstudio.com/](https://code.visualstudio.com/)
2. Download and run the Windows installer.
3. During setup, check the boxes for:
   - **"Add 'Open with Code' action to Windows Explorer file context menu"**
   - **"Add 'Open with Code' action to Windows Explorer directory context menu"**
   - **"Add to PATH"**
4. Click **Install** and **Finish**.

### Step 4: Verify Your Installations
1. Press the Windows key, type **PowerShell** or **cmd**, and press **Enter**.
2. Run the following three verification commands:
   ```powershell
   node --version
   npm --version
   git --version
   ```
3. Each command should print a version number (for example: `v20.18.0`, `10.8.2`, `git version 2.44.0.windows.1`). If you see version numbers, your Windows environment is ready!

---

## 2. Obtaining the Code

You can obtain the project either by downloading a ZIP from Google AI Studio or by cloning a repository.

### Option A: Download ZIP from Google AI Studio
1. In Google AI Studio, click the project menu or export option to download your project as a `.zip` archive.
2. Open your Windows **Downloads** folder, right-click the `.zip` file, and select **Extract All...**.
3. Choose an easy destination folder, such as `C:\Projects\MediNexus` (avoid deeply nested temporary folders).
4. **Locate the project root**:
   - Open the extracted folder in Windows File Explorer.
   - The correct project root is the folder that directly contains `package.json`, `server.ts`, and `vite.config.ts`.
5. Right-click this folder and select **Open with Code** (or open VS Code, click **File > Open Folder...**, and select this folder).

> **Important Note on AI Studio Secrets:** When you download a project as a ZIP from Google AI Studio, your private secrets (such as `GEMINI_API_KEY`) are **never included** in the download for security. You must configure your key in a local `.env` file as shown in Section 4.

### Option B: Clone from GitHub
If you or your team have already pushed the repository to GitHub:
1. Open Windows PowerShell or Command Prompt.
2. Navigate to your projects directory:
   ```powershell
   cd C:\Projects
   ```
3. Run the clone command:
   ```powershell
   git clone https://github.com/YOUR_USERNAME/MediNexus.git
   cd MediNexus
   ```
4. Open the project in VS Code:
   ```powershell
   code .
   ```

---

## 3. Installing Dependencies & Available Scripts

### Open the Integrated Terminal in VS Code
1. In VS Code, press ``Ctrl + ` `` (Ctrl + backtick) or click **Terminal > New Terminal** in the top menu.
2. Verify you are in the directory containing `package.json`. You can check by running:
   ```powershell
   dir package.json
   ```

### Install npm Packages
Run the install command:
```powershell
npm install
```
This downloads and populates the `node_modules` directory with the exact versions required by MediNexus (including React 19, Tailwind CSS v4, Express, and `@google/genai`).

### Project Scripts in `package.json`
| Command | What It Does |
| :--- | :--- |
| `npm run dev` | Starts the full-stack development server with Express backend and Vite frontend on `http://localhost:3000` |
| `npm run build` | Compiles the TypeScript application and builds production bundles into `dist/` |
| `npm run start` | Runs the compiled production server (`node dist/server.js`) |
| `npm run test` | Executes the automated test suite (`tests/run-tests.ts`) |
| `npm run lint` | Runs the TypeScript compiler (`tsc --noEmit`) to check for type errors |

---

## 4. Environment Variables & API Key Configuration

MediNexus keeps all API keys strictly on the server side (`server.ts`). The frontend browser never sees or stores your secret keys.

### All Environment Variables Recognized by MediNexus:
- `GEMINI_API_KEY`: **(Required for AI)** Your Google Gemini API key. Requests to Gemini are processed server-side via `/api/gemini/chat` and `/api/gemini/analyze-report`.
- `GEMINI_MODEL`: *(Optional, default: `gemini-2.5-flash`)* Primary model for AI Health Assistant. The server automatically cascades to fallback models if high global demand occurs.
- `PORT`: *(Optional, default: `3000`)* The HTTP server port.
- `APP_URL`: *(Optional, default: `http://localhost:3000`)* Base URL of the app.
- `VITE_FIREBASE_API_KEY`: *(Optional)* Firebase Web API Key for cloud sync.
- `VITE_FIREBASE_AUTH_DOMAIN`: *(Optional)* Firebase Auth domain.
- `VITE_FIREBASE_PROJECT_ID`: *(Optional)* Firebase project identifier.
- `VITE_FIREBASE_STORAGE_BUCKET`: *(Optional)* Firebase cloud storage bucket.
- `VITE_FIREBASE_MESSAGING_SENDER_ID`: *(Optional)* Firebase messaging sender ID.
- `VITE_FIREBASE_APP_ID`: *(Optional)* Firebase web application ID.

### Step-by-Step `.env` Setup
1. In the VS Code terminal, create your local `.env` from the provided template:
   ```powershell
   copy .env.example .env
   ```
   *(Or in PowerShell / Bash: `cp .env.example .env`)*

2. Open the newly created `.env` file in VS Code.

3. **Get your free Gemini API Key:**
   - Open your browser and go to: [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
   - Sign in with your Google account.
   - Click **Create API Key**.
   - Copy the generated key (starts with `AIzaSy...`).

4. In `.env`, paste your key:
   ```env
   GEMINI_API_KEY="AIzaSyYourActualKeyHere"
   GEMINI_MODEL="gemini-2.5-flash"
   APP_URL="http://localhost:3000"
   PORT="3000"
   ```

5. Save the file (`Ctrl + S`).

> **Security Rule:** `.env` is listed in `.gitignore` and must **never** be committed to Git. Only the template `.env.example` should be shared in repositories.

---

## 5. Setting Up Firebase (Optional)

MediNexus features a dual-mode storage architecture:
1. **Local Persistent Mode (Default, Zero-Config):** Works immediately offline with local storage and test user accounts. No Firebase setup is required to run the app, browse records, or use the AI Assistant.
2. **Firebase Cloud Mode (Optional):** If you wish to connect real Firebase Authentication and Cloud Firestore:
   - Go to [Firebase Console](https://console.firebase.google.com/).
   - Click **Add Project** and name it (e.g. `medinexus-portal`).
   - In Project Settings > General, click the **Web icon (`</>`)** to register a web app.
   - Copy the values into your `.env`:
     ```env
     VITE_FIREBASE_API_KEY="AIzaSy..."
     VITE_FIREBASE_AUTH_DOMAIN="medinexus-portal.firebaseapp.com"
     VITE_FIREBASE_PROJECT_ID="medinexus-portal"
     VITE_FIREBASE_STORAGE_BUCKET="medinexus-portal.appspot.com"
     VITE_FIREBASE_MESSAGING_SENDER_ID="1234567890"
     VITE_FIREBASE_APP_ID="1:1234567890:web:abcdef"
     ```
   - In Firebase Console, enable **Authentication > Email/Password**.
   - Under **Firestore Database**, create a database in production mode.
   - Deploy the included `firestore.rules` and `storage.rules`.

---

## 6. Running the Application Locally

1. In your VS Code terminal, start the development server:
   ```powershell
   npm run dev
   ```
2. You will see output similar to:
   ```
   MediNexus server running on port 3000 [Mode: development]
   ```
3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```
4. You will see the MediNexus start page: **"Your Health, Better Understood."**
5. Click **Get Started** to log in or test the app.
6. To test the backend health endpoint, visit `http://localhost:3000/api/health`.

### How to Stop the Server
To stop the server at any time, click into the VS Code terminal and press:
`Ctrl + C`
When prompted with `Terminate batch job (Y/N)?`, type `Y` and press **Enter**.

---

## 7. Troubleshooting Common Issues

### Issue 1: Port 3000 is already in use (`EADDRINUSE`)
- **Cause:** Another process or previously running server is occupying port 3000.
- **Solution A (Kill process on Windows):**
  Open PowerShell as Administrator and run:
  ```powershell
  netstat -ano | findstr :3000
  ```
  Look at the number in the last column (the Process ID / PID), then run:
  ```powershell
  taskkill /PID <PID_NUMBER> /F
  ```
- **Solution B (Change port in `.env`):**
  In `.env`, set:
  ```env
  PORT="3001"
  APP_URL="http://localhost:3001"
  ```
  Then restart with `npm run dev` and open `http://localhost:3001`.

### Issue 2: `Cannot find module` or Missing Dependencies
- **Cause:** `npm install` was interrupted or not run.
- **Solution:**
  Run:
  ```powershell
  npm install
  ```

### Issue 3: Gemini 503 "High Demand" or API Key Error
- **Cause:** The Google Gemini API key is missing from `.env`, or the Gemini model is experiencing a temporary global traffic spike.
- **Solutions:**
  1. Check `http://localhost:3000/api/health` to confirm `geminiConfigured: true`.
  2. If `geminiConfigured: false`, verify `.env` exists in the project root and contains `GEMINI_API_KEY="AIzaSy..."` without extra spaces.
  3. If a temporary 503 error occurs, MediNexus displays an automatic "Retry" button. Simply click **Retry** after a few seconds. MediNexus also automatically retries with fallback models on the server.

### Issue 4: Vite WebSocket Error in Browser Console
- **Explanation:** In the Google AI Studio online preview, the preview reverse proxy does not route WebSocket upgrade handshakes (`Upgrade: websocket`). MediNexus automatically detects the AI Studio environment and disables HMR WebSockets to prevent console errors.
- When running locally in VS Code on your machine (`http://localhost:3000`), normal Hot Module Reloading is active and attached directly to the Express HTTP server.

---

## 8. Pushing Your Project to GitHub

Follow these steps to store your code safely on GitHub:

### Step 1: Configure Git Identity (First time only)
In the VS Code terminal, run:
```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Step 2: Initialize and Commit Locally
1. Check if git is initialized:
   ```powershell
   git status
   ```
2. If it says `fatal: not a git repository`, initialize it:
   ```powershell
   git init
   git branch -M main
   ```
3. Stage all files (the updated `.gitignore` will ensure `.env` and `node_modules` are excluded):
   ```powershell
   git add .
   ```
4. Verify that `.env` is **NOT** listed in the staged files:
   ```powershell
   git status
   ```
5. Commit the code:
   ```powershell
   git commit -m "Initial commit: MediNexus healthcare platform"
   ```

### Step 3: Create a GitHub Repository & Push
1. Go to [https://github.com/new](https://github.com/new).
2. Enter Repository name: `medinexus`.
3. Choose **Public** or **Private**.
4. **Do NOT** check "Add a README file", ".gitignore", or "license" (we already have them).
5. Click **Create repository**.
6. Copy the commands under **"…or push an existing repository from the command line"**:
   ```powershell
   git remote add origin https://github.com/YOUR_USERNAME/medinexus.git
   git push -u origin main
   ```

### Optional: Using GitHub Desktop
If you prefer a graphical user interface over terminal commands:
1. Download and install [GitHub Desktop](https://desktop.github.com/).
2. Sign in with your GitHub account.
3. Click **File > Add Local Repository...** and select your `MediNexus` folder.
4. Review changes, enter a commit summary ("Initial commit"), and click **Commit to main**.
5. Click **Publish repository** to create and sync with your GitHub account.

---

## 9. Understanding Environments and URLs

It is important to understand the difference between each URL:

1. **GitHub Repository URL** (`https://github.com/username/medinexus`):
   - Stores your source code, documentation, and version history.
   - Pushing code to GitHub does **NOT** automatically launch a live public website unless you connect a hosting service (like Google Cloud Run, Render, or Railway).

2. **Local Development URL** (`http://localhost:3000`):
   - Runs exclusively on your personal Windows machine.
   - Accessible only from your computer's browser while `npm run dev` is running.

3. **Google AI Studio Preview URL** (`https://...aistudio-hub...`):
   - The interactive cloud development preview inside Google AI Studio.
   - Uses managed secrets stored in AI Studio Settings > Secrets.

4. **Production Deployment URL** (e.g., `https://medinexus.up.railway.app` or Google Cloud Run):
   - A live 24/7 web server reachable by patients on the internet.
   - Configured with environment variables set in the hosting provider's dashboard.
