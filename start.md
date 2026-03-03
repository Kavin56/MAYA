# MAYA — Start Guide

## 🌐 Frontend (Vercel — already live)

**URL:** https://maya-du1npxgvh-kavinkumar-vss-projects.vercel.app

No action needed. Auto-deploys from GitHub on every `git push`.

---

## 🖥️ Backend (RunPod)

### First Time Setup

SSH into your RunPod pod and run this **once**:

```bash
# 1. System packages + Node.js
apt-get update -qq && apt-get install -y curl wget git unzip
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# 2. opencode AI engine
curl -fsSL https://opencode.ai/install | bash
source ~/.bashrc

# 3. Clone the repo
git clone https://github.com/Kavin56/MAYA.git /workspace/MAYA
cd /workspace/MAYA

# 4. Run the startup script
chmod +x runpod-start.sh
./runpod-start.sh
```

### Every Time You Restart the Pod

```bash
cd /workspace/MAYA
./runpod-start.sh
```

### What the Startup Script Does
1. Installs **Bun** (server runtime)
2. Installs **ngrok** + authenticates
3. Installs **pnpm** + project dependencies
4. Starts `opencode` on port `4096`
5. Starts `maya-server` (OpenWork) on port `8787`
6. Opens ngrok tunnel → `https://nondetonating-cecile-nongrounded.ngrok-free.dev`

---

## 🔗 Connecting Frontend to Backend

1. Start the backend on RunPod (see above)
2. At the end of startup, it prints a **client token** — copy it
3. Open the Vercel frontend URL
4. In the **"Connect to Server"** dialog enter:
   - **URL:** `https://nondetonating-cecile-nongrounded.ngrok-free.dev`
   - **Token:** *(printed by runpod-start.sh)*

### Verify Backend is Running
```bash
curl https://nondetonating-cecile-nongrounded.ngrok-free.dev/health
# Expected: {"ok":true,"version":"...","uptimeMs":...}
```

---

## 📋 Logs (on RunPod)

| Service | Log File |
|---|---|
| opencode | `/tmp/opencode.log` |
| maya-server | `/tmp/maya-server.log` |
| ngrok | `/tmp/ngrok.log` |

```bash
# View logs live
tail -f /tmp/maya-server.log
tail -f /tmp/ngrok.log
```
