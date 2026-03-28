# Fit2All — Deploy Guide

## 🚀 Option A — Vercel (Recommended, fastest)

### Step 1 — Push to GitHub
1. Create a free account at https://github.com
2. Create a new repository called `fit2all`
3. Upload all files from this folder (drag & drop on GitHub works)

### Step 2 — Deploy on Vercel
1. Go to https://vercel.com and sign in with GitHub
2. Click **Add New → Project**
3. Select your `fit2all` repository
4. Vercel auto-detects Vite — just click **Deploy**
5. Done! Your app is live at `https://fit2all-xxxx.vercel.app`

Every push to GitHub auto-redeploys. No commands needed.

---

## 🔥 Option B — Firebase Hosting

### Step 1 — Install Firebase CLI
  npm install -g firebase-tools
  firebase login

### Step 2 — Set your project ID in .firebaserc
  { "projects": { "default": "fit2all-xxxxx" } }

### Step 3 — Build & deploy
  npm install
  npm run deploy

Live at: https://YOUR_PROJECT_ID.web.app

---

## 💻 Local Development
  npm install
  npm run dev

Opens at http://localhost:5173

---

## 📱 Install as App on Phone
Once deployed, open the URL on mobile:
- iOS: tap Share → Add to Home Screen
- Android: tap menu → Add to Home Screen

Installs like a native app — no App Store needed.

---

## App Info
- Admin: hold the FIT2ALL logo 5 seconds on splash screen
- Admin password: Fit2AllAdmin2024
- Developer contact: Jcsc04@gmail.com
- PayPal: jcsc0912@hotmail.com
