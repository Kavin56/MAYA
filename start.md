# MAYA — Start Guide

## Local Dev (Browser UI + local backend)

```powershell
cd D:\MAYA

# Clear any inherited tunnel env vars, then start everything
$env:VITE_OPENWORK_URL = ''; $env:VITE_OPENWORK_TOKEN = ''
pnpm dev:headless-web
```

Open: **http://localhost:5173**

- OpenCode + MAYA auto-connect via local orchestrator (port 4500)
- Full chat, sessions, scheduled jobs work
- No RunPod or tunnel needed

> **Note:** `packages/app/.env.local` points to `http://127.0.0.1:4500` (fixed port).

---

## Desktop App (Tauri)

```powershell
cd D:\MAYA
pnpm dev
```

Opens the native desktop app with OpenCode embedded.

---

## RunPod Production (Netlify/Vercel → Cloudflare Tunnel → RunPod)

### 1. Start backend on RunPod
```bash
# In RunPod terminal
bash runpod-start.sh
# Use tunnel URL https://maya.cfargotunnel.com (set CLOUDFLARE_PUBLIC_URL in RunPod .env)
```

### 2. Set env vars on Netlify/Vercel dashboard
```
VITE_OPENWORK_URL=https://maya.cfargotunnel.com
```

### 3. Redeploy frontend (or env vars take effect on next deploy)

---

## OWL Multi-Agent (Google Gemini)

```powershell
cd D:\MAYA
python src/maya_workforce.py
```

- Requires `GOOGLE_API_KEY` in `.env`
- Uses Gemini Flash — 3 agents: Researcher, Strategist, Analyst
- No GPU needed, runs locally

---

## Key Files

| File | Purpose |
|---|---|
| `packages/app/.env.local` | Local dev — points to `http://127.0.0.1:4500` |
| `.env` | Root env — `OPENWORK_PORT=4500`, `GOOGLE_API_KEY` |
| `runpod-start.sh` | RunPod setup + Cloudflare tunnel |
| `src/maya_workforce.py` | OWL multi-agent system |
