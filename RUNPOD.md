# Run MAYA on RunPod

One command from the repo root starts **maya-server**, **OWL worker** (port 5000), **opencode** (if installed), and **ngrok**.

## 1. One-time setup on the pod

```bash
# System + Node + OpenCode (optional)
apt-get update -qq && apt-get install -y curl wget git unzip
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
curl -fsSL https://opencode.ai/install | bash
source ~/.bashrc

# Clone repo (or use your fork)
git clone https://github.com/Kavin56/MAYA.git /workspace/MAYA
cd /workspace/MAYA
```

Secrets for RunPod are in **`src/owl-backend/runpod.env`** (committed). After `git pull`, the startup script sources it — no need to type keys in the terminal.

- **Security:** Keep this repo private. If the repo is ever made public or shared, rotate `OPENROUTER_API_KEY` and `NGROK_AUTHTOKEN` immediately.
- To use different keys (e.g. local only), create `src/owl-backend/.env` (gitignored); the script prefers `.env` when present, otherwise uses `runpod.env`.

## 2. Run everything

From the **project root** (e.g. `/workspace/MAYA`):

```bash
chmod +x runpod-start.sh
./runpod-start.sh
```

This will:

1. Install Bun, ngrok, and project deps if needed.
2. Start **opencode** on port 4096 (if `opencode` is in PATH).
3. Start **maya-server** on port 8787.
4. Start **OWL worker** on port 5000 (from `src/owl-backend`).
5. Start **ngrok** tunneling 8787 to the public URL.

If the OWL worker fails, check:

```bash
tail -50 /tmp/owl-worker.log
```

## 3. After it’s running

- **Public URL:** printed at the end (e.g. `https://nondetonating-cecile-nongrounded.ngrok-free.dev`).
- **Health:**  
  `https://<NGROK_DOMAIN>/health`  
  `https://<NGROK_DOMAIN>/ping` (proxies to OWL; expect `"message":"pong"` if OWL is up).
- **Debug key:**  
  `https://<NGROK_DOMAIN>/worker/debug/test-key`  
  Optional: `?model=google/gemini-2.5-flash`.

**Frontend (Netlify / Vercel / local):** set so the app uses this backend:

- `VITE_OPENWORK_URL=https://nondetonating-cecile-nongrounded.ngrok-free.dev`
- `VITE_API_URL=https://nondetonating-cecile-nongrounded.ngrok-free.dev/` (optional; same base URL)

The client token is printed by the script; the frontend can also fetch it from `/token`.
