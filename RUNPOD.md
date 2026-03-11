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

**Secrets:** The script loads `src/owl-backend/.env` **first** (before any defaults). Create it from the example:

```bash
cp src/owl-backend/.env.example src/owl-backend/.env
# Edit .env: set OPENROUTER_API_KEY, NGROK_AUTHTOKEN, and NGROK_DOMAIN (your reserved ngrok domain)
```

Required in `.env` for ngrok tunnel: `NGROK_AUTHTOKEN`, and `NGROK_DOMAIN` (e.g. `nondetonating-cecile-nongrounded.ngrok-free.dev`). Or set these as RunPod pod environment variables.

## 2. Run everything

### RunPod run script (copy-paste every time)

From the **project root** on the pod (e.g. `/workspace/MAYA`), run this block to pull latest and start:

```bash
cd /workspace/MAYA
git checkout -- runpod-start.sh
git pull origin master
chmod +x runpod-start.sh
pkill -9 ngrok 2>/dev/null || true
sleep 4
./runpod-start.sh
```

Or, after the first time you have `runpod-run.sh` in the repo, just run: `./runpod-run.sh`

**First run only** (no git conflict):

```bash
chmod +x runpod-start.sh
./runpod-start.sh
```

This will:

1. Install Bun, ngrok, and project deps if needed.
2. Start **opencode** on port 4096 (if `opencode` is in PATH).
3. Start **maya-server** on port 8787.
4. Start **ngrok** tunnel (right after server health check) so the public URL is up early.
5. Start **OWL worker** on port 5000 (from `src/owl-backend`).

If the public URL shows **endpoint is offline (ERR_NGROK_3200)**:

- Ensure you have the latest script: `git checkout -- runpod-start.sh && git pull origin master`
- Ensure `src/owl-backend/.env` contains `NGROK_AUTHTOKEN` and `NGROK_DOMAIN` (no quotes, no spaces around `=`).
- On the pod run: `tail -30 /tmp/ngrok.log` — if you see `ERR_NGROK_334` (endpoint already online), run `pkill -9 ngrok; sleep 4` then `./runpod-start.sh` again.

If the OWL worker fails, check: `tail -50 /tmp/owl-worker.log`

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
