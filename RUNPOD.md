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
# Edit .env: set OPENROUTER_API_KEY.
# For Cloudflare access, pick ONE:
# - Managed tunnel (Cloudflare account): CLOUDFLARE_TUNNEL_TOKEN + CLOUDFLARE_PUBLIC_URL
# - Quick Tunnel (no domain/account): CLOUDFLARE_QUICK_TUNNEL=1 (public URL changes each run)
```

### No domain? Use Cloudflare Quick Tunnel

If you do not want to buy a domain, set `CLOUDFLARE_QUICK_TUNNEL=1` in `src/owl-backend/.env` and run `./runpod-start.sh`.
The script will print a public URL like `https://<random>.trycloudflare.com` (ephemeral — changes each run).

**Frontend (remote workspace / chat):** Use the printed public URL.
Get the worker token from `<public-url>/token` and paste it when connecting so requests include `Authorization: Bearer <token>`.

### Optional: stable URL via GitHub Pages (free)

Quick Tunnel URLs change each time you restart `cloudflared`. If you want a stable link **without buying a domain**, you can use GitHub Pages as a “pointer” that redirects to the *current* tunnel URL.

This repo includes:

- `docs/index.html` — reads `docs/tunnel.json` and redirects
- `docs/tunnel.json` — stores the current `https://<random>.trycloudflare.com` URL

**One-time setup**

1. In GitHub, open repo settings → **Pages**
2. Set **Source** to “Deploy from a branch”
3. Set **Branch** to `master` and **Folder** to `/docs`
4. Save. Your stable URL will look like `https://<username>.github.io/MAYA/` (GitHub shows it).

**Updating the redirect when the tunnel URL changes**

- **Automatic (recommended):** In `src/owl-backend/.env` set `GITHUB_TOKEN` (a [GitHub fine-grained PAT](https://github.com/settings/tokens) with **Contents** read/write) and `GITHUB_REPO=YourUsername/MAYA`. Each time you run `./runpod-start.sh`, the script will update `docs/tunnel.json` with the new Quick Tunnel URL and push to GitHub so your Pages URL redirects to it.
- **Manual:** Copy the new Quick Tunnel URL from the script output, edit `docs/tunnel.json` `"url"` to that value, then push to GitHub.

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
5. Start **Cloudflare Tunnel** (managed tunnel if `CLOUDFLARE_TUNNEL_TOKEN` is set, or Quick Tunnel if `CLOUDFLARE_QUICK_TUNNEL=1`).

**Do I need "Your hostname routes" (Beta)?** No. For exposing a public URL you use **Published application routes** only. The **Hostname routes** (Beta) section is for a different feature (traffic steering / private hostnames) and is not required for this setup.

If the public URL does not load (e.g. ERR_NAME_NOT_RESOLVED or ERR_CONNECTION_TIMED_OUT):

- If you used **Quick Tunnel** (`CLOUDFLARE_QUICK_TUNNEL=1`), use the printed `https://<random>.trycloudflare.com` URL; it changes each run.
- If you used a **managed tunnel**, ensure `CLOUDFLARE_PUBLIC_URL` in `.env` matches the hostname you configured.
- Check tunnel logs: `tail -30 /tmp/cloudflared.log`. Look for `Registered tunnel connection`; if you see `context canceled` or QUIC/control stream errors, add to `.env`: `CLOUDFLARE_PROTOCOL=http2` and restart. If the tunnel exited, run `pkill -9 cloudflared; sleep 2` then `./runpod-start.sh` again.
- **Tunnel HEALTHY but site still times out:** On the RunPod shell run: `curl -s http://localhost:8787/health` (should return JSON with `ok: true`). If that fails, maya-server isn’t up. If it succeeds, the connector may be a different run—ensure the token in `.env` is the one for the connector that shows HEALTHY in the dashboard (Zero Trust → Connectors → your tunnel). From your own machine try: `nslookup maya.cfargotunnel.com` to confirm the hostname resolves.

If the OWL worker fails, check: `tail -50 /tmp/owl-worker.log`

**CAMEL / `camel_available`:** PyPI has no `camel-ai>=0.2.0`. The script tries `camel-ai[all]` from PyPI; if the `camel` module is not available, it clones [camel-ai/owl](https://github.com/camel-ai/owl) and installs with `uv` (Python 3.10, `uv venv` + `uv pip install -e .`), then runs the OWL backend with that env so `/ping` can report `camel_available: true`. To do it manually: `git clone https://github.com/camel-ai/owl.git`, `cd owl`, `pip install uv`, `uv venv .venv --python=3.10`, `source .venv/bin/activate`, `uv pip install -e .`.

## 3. After it’s running

- **Public URL:** either your managed-tunnel hostname, or the printed Quick Tunnel `https://<random>.trycloudflare.com`.
- **Health:** `<public-url>/health`
- **Token:** `<public-url>/token`
- **OWL ping:** `<public-url>/worker/ping` (expect `"message":"pong"` if OWL is up).
- **Debug key:** `<public-url>/worker/debug/test-key` (optional: `?model=google/gemini-2.5-flash`).

**Frontend (Netlify / Vercel / local):** set so the app uses this backend:

- `VITE_OPENWORK_URL=<public-url>`
- `VITE_API_URL=<public-url>/` (optional; same base URL)

The client token is printed by the script; the frontend can also fetch it from `/token`.
