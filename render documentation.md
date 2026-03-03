# Frontend Deployment Guide to Render

This guide documents the complete setup for deploying a Vite React frontend to Render.

---

## Prerequisites

- Git repository with Vite React project
- Render account (render.com)
- Backend API running (e.g., on Render)

---

## Step 1: Create `server.js` for SPA Routing

Create `server.js` in the project root:

```javascript
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.VITE_FRONTEND_PORT || 8080;

// Serve static files from dist folder
app.use(express.static(path.join(__dirname, "dist")));

// SPA routing - serve index.html for all routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Frontend server is running on port ${PORT}`);
});
```

**Why needed:** 
- Serves the built Vite app from `dist/` folder
- Handles SPA routing (React Router works for all routes)
- Required for production deployment as a Web Service

---

## Step 2: Update `package.json`

### Add Express Dependency

In `dependencies`, add:
```json
"express": "^4.18.2"
```

Install locally:
```bash
npm install express
```

### Add Start Script

In `scripts`, add:
```json
"start": "node server.js"
```

Full scripts section should look like:
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "start": "node server.js",
  "preview": "vite preview"
}
```

---

## Step 3: Configure Vite (`vite.config.ts`)

Minimum required config:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: ["YOUR_RENDER_DOMAIN.onrender.com"], // Replace with your domain
    hmr: {
      overlay: false,
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
```

**Important:** 
- Update `allowedHosts` with your actual Render domain
- Keep `build.outDir: "dist"` - the server expects this directory

---

## Step 4: Configure TypeScript (`tsconfig.app.json`)

Ensure JSX is properly configured:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": false,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noImplicitAny": false,
    "noFallthroughCasesInSwitch": false,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

---

## Step 5: Add React Imports (Fix JSX Transform)

In any file using JSX, ensure React is imported:

**main.tsx:**
```typescript
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
```

**App.tsx:**
```typescript
import React from "react";
// ...rest of imports
```

---

## Step 6: Create `.env` File

Create `frontend/.env`:

```env
# API Configuration - Point to your backend
VITE_API_BASE_URL=https://YOUR_BACKEND_URL.onrender.com/api

# Frontend Server Configuration
VITE_FRONTEND_PORT=8080

# App Configuration
VITE_APP_NAME=Your App Name
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_ADMIN_FEATURES=true
VITE_ENABLE_ANALYTICS=false
```

**Replace:**
- `YOUR_BACKEND_URL` with actual backend Render domain
- Other values with your app's configuration

---

## Step 7: Configure on Render Dashboard

### Create Web Service

1. Go to **Render.com Dashboard**
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Fill in the form:

| Field | Value |
|-------|-------|
| **Environment** | Node |
| **Region** | Your preferred region |
| **Branch** | main (or your default branch) |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |

### Add Environment Variables (Optional)

If you want to override ports or other settings:

1. Go to **Settings** (in Render dashboard)
2. Scroll to **Environment**
3. Add variables:
   ```
   VITE_FRONTEND_PORT=8080
   ```

### Configure Auto-Deploy

- Enable **Auto-Deploy from Git**
- Set **Deploy on Push** to automatically redeploy when you push

---

## Step 8: Deploy

### Initial Deploy

1. **Commit all changes:**
   ```bash
   git add -A
   git commit -m "Setup frontend for Render deployment"
   git push
   ```

2. **On Render Dashboard:**
   - Service will auto-deploy if auto-deploy is enabled
   - Or click **"Manual Deploy"** → **"Deploy latest commit"**
   - Wait for build to complete (shows ✅ when done)

### After Changes

```bash
git add -A
git commit -m "Your changes description"
git push
```

Frontend will redeploy automatically if auto-deploy is enabled.

---

## Step 9: Troubleshooting

### Clear Build Cache

If you encounter build issues:

1. Go to **Settings** in Render dashboard
2. Click **"Clear Build Cache"**
3. Click **"Manual Deploy"**

### Hard Refresh Browser

If page shows old content:

- **Windows/Linux:** `Ctrl+Shift+R`
- **Mac:** `Cmd+Shift+R`

### Check Logs

Click **"Logs"** in Render dashboard to see:
- Build output
- Server startup messages
- Any runtime errors

---

## Common Issues & Solutions

### Issue: `_jsxDEV is not a function`
**Solution:** 
- Ensure `import React from "react"` in main.tsx and App.tsx
- Check `jsx: "react-jsx"` in tsconfig.app.json

### Issue: Blocked request - host not allowed
**Solution:** 
- Update `allowedHosts` in vite.config.ts with your Render domain

### Issue: API calls to localhost fail
**Solution:** 
- Update `VITE_API_BASE_URL` in .env to your deployed backend URL

### Issue: Routes not working (404 on refresh)
**Solution:** 
- Ensure server.js exists and `npm start` is the Start Command
- This enables SPA routing

### Issue: Build takes too long
**Solution:** 
- Run `npm install` locally to verify dependencies are correct
- Check for unnecessary packages in package.json

---

## File Checklist

Before deploying, ensure these files exist and are configured:

- ✅ `server.js` - Express server for static serving
- ✅ `package.json` - Has `express` dependency and `start` script
- ✅ `vite.config.ts` - Configured with correct allowedHosts
- ✅ `tsconfig.app.json` - `jsx: "react-jsx"`
- ✅ `src/main.tsx` - Imports React
- ✅ `src/App.tsx` - Imports React
- ✅ `.env` - Has VITE_API_BASE_URL pointing to backend

---

## Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `https://api.onrender.com/api` |
| `VITE_FRONTEND_PORT` | Frontend server port | `8080` |
| `VITE_APP_NAME` | App name for display | `My App` |
| `VITE_ENABLE_ADMIN_FEATURES` | Feature flag for admin | `true` |

---

## Useful Commands

```bash
# Local development
npm run dev              # Start Vite dev server on port 5173

# Build for production
npm run build           # Creates dist/ folder

# Test production build locally
npm run build           # Build first
npm start              # Run production server on port 8080

# Push to trigger Render deploy
git push origin main
```

---

## Quick Deploy Checklist

- [ ] Created `server.js`
- [ ] Added `express` to package.json dependencies
- [ ] Added `start` script to package.json
- [ ] Updated `vite.config.ts` with correct domain
- [ ] Created `.env` with correct API URL
- [ ] Added React imports to main.tsx and App.tsx
- [ ] Committed all changes to git
- [ ] Created Web Service on Render
- [ ] Set Build Command: `npm install && npm run build`
- [ ] Set Start Command: `npm start`
- [ ] Deployed and checked logs for ✅ success

---

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vite Documentation](https://vitejs.dev)
- [Express.js Guide](https://expressjs.com)
- [React Router SPA Setup](https://reactrouter.com/start)
