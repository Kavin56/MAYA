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

**Secrets:** Never commit API keys. Create `src/owl-backend/.env` (gitignored) from the example:

```bash
cp src/owl-backend/.env.example src/owl-backend/.env
# Edit .env and set OPENROUTER_API_KEY, NGROK_AUTHTOKEN, and optionally VITE_API_URL
```

Or set **RunPod environment variables** in the pod template: `OPENROUTER_API_KEY`, `NGROK_AUTHTOKEN`. The startup script sources `src/owl-backend/.env` when present.

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
