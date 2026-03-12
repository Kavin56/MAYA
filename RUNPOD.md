# Run MAYA on RunPod

One command from the repo root starts **maya-server**, **OWL worker** (port 5000), **opencode** (if installed), and **Cloudflare Tunnel** (cloudflared).

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
# Edit .env: set OPENROUTER_API_KEY, CLOUDFLARE_TUNNEL_TOKEN, and CLOUDFLARE_PUBLIC_URL
```

Required in `.env` for Cloudflare Tunnel: `CLOUDFLARE_TUNNEL_TOKEN` (from Zero Trust → Networks → Connectors → your tunnel → Install), and `CLOUDFLARE_PUBLIC_URL=https://maya.cfargotunnel.com`.

**Frontend (remote workspace / chat):** To avoid 401 on health and chat, add the worker token in the app. Get it from `https://maya.cfargotunnel.com/token` and paste it when connecting to the MAYA worker so requests include `Authorization: Bearer <token>`.

## 2. Run everything

### After you push code — on RunPod (copy-paste)

From repo root, reset scripts (so pull doesn’t fail on local changes), pull, then start:

```bash
cd /workspace/MAYA && git checkout -- runpod-start.sh runpod-run.sh 2>/dev/null; sed -i 's/\r$//' runpod-run.sh runpod-start.sh 2>/dev/null; git pull origin master && chmod +x runpod-run.sh runpod-start.sh && ./runpod-run.sh
```

If you see **"bad interpreter: Permission denied"**, fix CRLF then run again:

```bash
cd /workspace/MAYA && sed -i 's/\r$//' runpod-run.sh runpod-start.sh && chmod +x runpod-run.sh runpod-start.sh && ./runpod-run.sh
```

**First run only** (no git conflict):

```bash
chmod +x runpod-start.sh
./runpod-start.sh
```

This will:

1. Install Bun, cloudflared, and project deps if needed.
2. Start **opencode** on port 4096 (if `opencode` is in PATH).
3. Start **maya-server** on port 8787.
4. Start **OWL worker** on port 5000 (from `src/owl-backend`).
5. Start **Cloudflare Tunnel** (if `CLOUDFLARE_TUNNEL_TOKEN` is set in `.env`).

If the public URL does not load (e.g. ERR_NAME_NOT_RESOLVED):

- The hostname must resolve: use **https://maya.cfargotunnel.com** (subdomain `maya`, domain `cfargotunnel.com` in Route tunnel). Names like `maya.mayarunpod` fail because `mayarunpod` is not a real domain.
- In **Route tunnel**, set the service to `http://localhost:8787`.
- Ensure `CLOUDFLARE_PUBLIC_URL` in `.env` matches the hostname you set in Route tunnel.
- Check tunnel logs: `tail -30 /tmp/cloudflared.log`. If the tunnel exits, run `pkill -9 cloudflared; sleep 2` then `./runpod-start.sh` again.

If the OWL worker fails, check: `tail -50 /tmp/owl-worker.log`

**CAMEL / `camel_available`:** PyPI has no `camel-ai>=0.2.0`. The script tries `camel-ai[all]` from PyPI; if the `camel` module is not available, it clones [camel-ai/owl](https://github.com/camel-ai/owl) and installs with `uv` (Python 3.10, `uv venv` + `uv pip install -e .`), then runs the OWL backend with that env so `/ping` can report `camel_available: true`. To do it manually: `git clone https://github.com/camel-ai/owl.git`, `cd owl`, `pip install uv`, `uv venv .venv --python=3.10`, `source .venv/bin/activate`, `uv pip install -e .`.

## 3. After it’s running

- **Public URL:** `https://maya.cfargotunnel.com` (set `CLOUDFLARE_PUBLIC_URL=https://maya.cfargotunnel.com` in `.env`).
- **Health:** `https://maya.cfargotunnel.com/health`
- **Token:** `https://maya.cfargotunnel.com/token`
- **OWL ping:** `https://maya.cfargotunnel.com/worker/ping` (expect `"message":"pong"` if OWL is up).
- **Debug key:** `https://maya.cfargotunnel.com/worker/debug/test-key` (optional: `?model=google/gemini-2.5-flash`).

**Frontend (Netlify / Vercel / local):** set so the app uses this backend:

- `VITE_OPENWORK_URL=https://maya.cfargotunnel.com`
- `VITE_API_URL=https://maya.cfargotunnel.com/` (optional; same base URL)

The client token is printed by the script; the frontend can also fetch it from `/token`.
