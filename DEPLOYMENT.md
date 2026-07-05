# 🚀 Full-Stack Deployment Guide

This document provides step-by-step instructions for deploying your React + Express full-stack application (with WebSockets, Gemini Live Audio, and Firebase) to **GitHub**, **Vercel**, or persistent container hosts like **Render**, **Railway**, and **Fly.io**.

---

## 🛠️ Deployment Architecture Overview

Because this is a feature-rich, full-stack application, here is how the architectural parts should be hosted:

1. **Vite Frontend (React)**: Served as static HTML, JS, and CSS files.
2. **Express Backend (Node.js)**: Runs as a persistent server to support:
   - **Real-time WebSockets (`ws`)** for the Multimodal Gemini Live Voice Conversation.
   - **Background periodic timers (`setInterval`)** for reminders checks and Web Push triggers.
   - **Proxy Endpoints** to securely keep your secret API keys (Gemini, GIPHY, Brave Search) hidden from the browser.

---

## 📦 Option 1: Persistent Container Hosts (Highly Recommended)
*Platforms: Railway, Render, Fly.io, or Heroku*

This is the **easiest and most robust way** to deploy your app because both the frontend and backend run together in a single persistent container. This fully supports WebSockets and background intervals.

### Step-by-Step for Render or Railway:

1. **Connect to GitHub**: Create a repository and push your code (see the [GitHub Steps](#-step-1-push-your-code-to-github) section below).
2. **Create a Web Service**:
   - On **Render**, click **New +** -> **Web Service**.
   - On **Railway**, click **New Project** -> **Deploy from GitHub repo**.
3. **Configure Settings**:
   - **Environment / Runtime**: `Node.js`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start` (this runs the compiled `node dist/server.cjs` file)
4. **Define Environment Variables** (see [Environment Variables Reference](#-environment-variables-reference)).

---

## ⚡ Option 2: Split Deployment (Vercel + Render/Railway)
*Frontend on Vercel, Backend on a Container Service*

If you prefer to host your React frontend on Vercel's edge network, you can do so, but since Vercel's serverless platform does not natively support WebSockets or long-running background tasks, you must run the backend on Render/Railway.

### 1. Deploy the Frontend to Vercel:
1. Go to [Vercel.com](https://vercel.com) and click **Add New** -> **Project**.
2. Select your GitHub repository.
3. Vercel will automatically detect **Vite** as the framework.
4. Expand the **Build and Output Settings**:
   - Change the **Build Command** to: `npm run build` (or `vite build` if you only want to build static files).
   - Change the **Output Directory** to: `dist`.
5. Click **Deploy**.

### 2. Connect the Frontend to your Hosted Backend:
To point the frontend to your custom backend domain, update the WebSocket and API endpoint base URLs in your frontend configuration files (such as `src/services/geminiService.ts`) to use your hosted backend domain instead of relative paths.

---

## 🖥️ Step-by-Step GitHub Setup

Follow these steps to push your code from your machine or workspace to a secure GitHub repository:

1. **Initialize Git**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Full-Stack Voice Assistant & Workspace Hub"
   ```
2. **Create a GitHub Repository**:
   - Go to [GitHub](https://github.com) and click **New Repository**.
   - Name your repository and click **Create Repository** (do not add a README, license, or `.gitignore` since your project already has them).
3. **Link and Push**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
   git branch -M main
   git push -u origin main
   ```

---

## 🔑 Environment Variables Reference

When deploying, make sure to add these environment variables in your hosting provider's settings console. Do **not** commit actual secrets or keys directly to GitHub.

| Variable Name | Description | Required / Optional |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Your Gemini developer API key from Google AI Studio. | **Required** (Server-side) |
| `GIPHY_API_KEY` | API Key to fetch GIFs inside Chat and Notepad. | **Optional** |
| `BRAVE_SEARCH_API_KEY` | API Key used for automatic search fallbacks. | **Optional** |
| `VITE_VAPID_PUBLIC_KEY`| Public Web Push VAPID key. | **Auto-configured** (or provide custom) |
| `VAPID_PRIVATE_KEY`   | Private Web Push VAPID key. | **Auto-configured** (or provide custom) |
| `VAPID_SUBJECT`       | Web Push mailto identifier. | **Auto-configured** (or provide custom) |

---

## 🔒 Firebase Security Notice

Your app uses Firebase Firestore for persistent notes, tasks, and settings syncing:
- Make sure to deploy the security rules defined in your `/firestore.rules` file to your production Firebase console.
- In your Firebase Console, navigate to **Project Settings** -> **General** to retrieve your client config if you ever decide to replace the existing blueprinted app configuration in `/firebase-applet-config.json`.
