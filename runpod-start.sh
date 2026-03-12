#!/bin/bash

# =============================================================================

# MAYA RunPod Startup Script

# Starts maya-server (OpenWork backend) + Cloudflare Tunnel (cloudflared)

# Usage: chmod +x runpod-start.sh && ./runpod-start.sh

# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
OWL_ENV_DIR="$SCRIPT_DIR/src/owl-backend"
SERVER_PORT=8787
OPENCODE_PORT=4096

# Load .env FIRST so CLOUDFLARE_* and OPENROUTER_* from .env override any defaults below
if [ -f "$OWL_ENV_DIR/.env" ]; then
  set -a
  source "$OWL_ENV_DIR/.env"
  set +a
  echo "[env] Loaded from src/owl-backend/.env"
else
  echo "[warn] No src/owl-backend/.env — copy .env.example to .env and set OPENROUTER_API_KEY, CLOUDFLARE_TUNNEL_TOKEN, CLOUDFLARE_PUBLIC_URL"
fi

# Cloudflare Tunnel: token from dashboard (Zero Trust → Networks → Connectors → your tunnel → Install). Public URL = hostname you set in "Route tunnel".
export CLOUDFLARE_TUNNEL_TOKEN="${CLOUDFLARE_TUNNEL_TOKEN:-}"
export CLOUDFLARE_PUBLIC_URL="${CLOUDFLARE_PUBLIC_URL:-}"
export CLOUDFLARE_QUICK_TUNNEL="${CLOUDFLARE_QUICK_TUNNEL:-0}"



echo ""

echo "╔════════════════════════════════════════════╗"

echo "║         MAYA RunPod Startup                ║"

echo "╚════════════════════════════════════════════╝"

echo ""



# ─── 1. Install Bun ──────────────────────────────────────────────────────────

if ! command -v bun &>/dev/null; then

  echo "[1/5] Installing Bun..."

  curl -fsSL https://bun.sh/install | bash

  export BUN_INSTALL="$HOME/.bun"

  export PATH="$BUN_INSTALL/bin:$PATH"

  echo "      Bun installed: $(bun --version)"

else

  echo "[1/5] Bun already installed: $(bun --version)"

fi



# Ensure bun is on PATH for subsequent commands

export BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"

export PATH="$BUN_INSTALL/bin:$PATH"



# ─── 2. Install cloudflared (Cloudflare Tunnel) ─────────────────────────────────

if ! command -v cloudflared &>/dev/null; then
  echo "[2/5] Installing cloudflared..."
  sudo mkdir -p --mode=0755 /usr/share/keyrings
  curl -fsSL https://pkg.cloudflare.com/cloudflare-public-v2.gpg | sudo tee /usr/share/keyrings/cloudflare-public-v2.gpg >/dev/null
  echo 'deb [signed-by=/usr/share/keyrings/cloudflare-public-v2.gpg] https://pkg.cloudflare.com/cloudflared any main' | sudo tee /etc/apt/sources.list.d/cloudflared.list
  sudo apt-get update -qq && sudo apt-get install -y cloudflared -qq
  echo "      cloudflared installed: $(cloudflared --version 2>/dev/null || echo 'installed')"
else
  echo "[2/5] cloudflared already installed: $(cloudflared --version 2>/dev/null || echo 'ok')"
fi

# ─── 3. Cloudflare tunnel token ───────────────────────────────────────────────
echo "[3/5] Configuring Cloudflare Tunnel..."
if [ -n "$CLOUDFLARE_TUNNEL_TOKEN" ]; then
  echo "      CLOUDFLARE_TUNNEL_TOKEN set; tunnel will start after services."
else
  echo "      [warn] CLOUDFLARE_TUNNEL_TOKEN empty — set in src/owl-backend/.env; tunnel will be skipped."
fi



# ─── 4. Install project dependencies ─────────────────────────────────────────

echo "[4/5] Installing project dependencies..."

cd "$(dirname "$0")"   # switch to the script's directory (project root)
PROJECT_ROOT="$(pwd)"

if ! command -v pnpm &>/dev/null; then

  echo "      Installing pnpm..."

  npm install -g pnpm

fi



pnpm install --frozen-lockfile 2>/dev/null || pnpm install

echo "      Dependencies installed."



# ─── 5. Set environment variables ────────────────────────────────────────────

echo "[5/5] Configuring environment..."



# OpenWork server settings

export MAYA_HOST=0.0.0.0

export MAYA_PORT=$SERVER_PORT

export MAYA_APPROVAL_MODE=auto

export MAYA_CORS_ORIGINS="*"



# Connect the OpenWork server to the local opencode engine

export MAYA_OPENCODE_BASE_URL="http://127.0.0.1:$OPENCODE_PORT"



# Workspace path (adjust if your code is somewhere else)

export MAYA_WORKSPACES="${MAYA_WORKSPACES:-/workspace}"



# Token setup:

# Set MAYA_TOKEN and MAYA_HOST_TOKEN as RunPod environment variables

# (in the RunPod pod config / secrets panel) so they are not hardcoded here.

# Fallback values below are OK for initial testing but change them for production!

if [ -z "$MAYA_TOKEN" ]; then

  export MAYA_TOKEN="ow-client-$(head -c 16 /dev/urandom | base64 | tr -d '/+=' | head -c 24)"

  echo "      Generated client token: $MAYA_TOKEN"

  echo "      ⚠️  Save this token — you'll need it to connect the web UI"

else

  echo "      Using MAYA_TOKEN from environment."

fi



if [ -z "$MAYA_HOST_TOKEN" ]; then

  export MAYA_HOST_TOKEN="ow-host-$(head -c 16 /dev/urandom | base64 | tr -d '/+=' | head -c 24)"

  echo "      Generated host token: $MAYA_HOST_TOKEN"

else

  echo "      Using MAYA_HOST_TOKEN from environment."

fi



echo ""

echo "─────────────────────────────────────────────"

echo " Starting services..."

echo "─────────────────────────────────────────────"



# Free ports from a previous run so re-runs don't hit EADDRINUSE
for p in $OPENCODE_PORT $SERVER_PORT 5000; do
  pid=$(lsof -ti ":$p" 2>/dev/null || true)
  if [ -n "$pid" ]; then
    echo "  Stopping existing process on port $p (PID $pid)"
    kill $pid 2>/dev/null || true
    sleep 1
  fi
done



# ─── 1. Start opencode server ─────────────────────────────────────────────────
if command -v opencode &>/dev/null; then
  echo "▶ Starting opencode server on port $OPENCODE_PORT..."
  nohup opencode serve --port "$OPENCODE_PORT" > /tmp/opencode.log 2>&1 &
  OPENCODE_PID=$!
  echo "  opencode PID: $OPENCODE_PID"
  sleep 2
else
  echo "⚠  opencode not found — the server will work but AI features require opencode installed."
  echo "   Install: curl -fsSL https://opencode.ai/install | bash"
fi



# ─── 2. Start maya-server (OpenWork) on port 8787 ─────────────────────────────
echo "▶ Starting OpenWork server (maya-server) on port $SERVER_PORT..."
pnpm --filter maya-server dev \
  --host 0.0.0.0 \
  --port "$SERVER_PORT" \
  --approval auto \
  --cors "*" \
  --opencode-base-url "http://127.0.0.1:$OPENCODE_PORT" \
  --workspace "$MAYA_WORKSPACES" \
  > /tmp/maya-server.log 2>&1 &
SERVER_PID=$!
echo "  maya-server PID: $SERVER_PID"
sleep 3

set +e
if curl -sf "http://localhost:$SERVER_PORT/health" >/dev/null; then
  echo "  ✓ maya-server is healthy"
  SERVER_OK=1
else
  echo "  ✗ maya-server health check failed — check /tmp/maya-server.log"
  cat /tmp/maya-server.log
  SERVER_OK=0
fi
set -e

# ─── 3. Start OWL Python Worker on port 5000 ──────────────────────────────────
OWL_DIR="$PROJECT_ROOT/src/owl-backend"
if [ ! -d "$OWL_DIR" ]; then
  echo "⚠️  OWL backend not found at $OWL_DIR — skipping OWL worker."
else
  echo "▶ Starting OWL worker on port 5000..."
  cd "$OWL_DIR"

  if [ ! -d "venv" ]; then
    echo "  Creating Python virtual environment..."
    python3 -m venv venv
  fi

  echo "  Installing Python dependencies..."
  set +e
  ./venv/bin/pip install --upgrade pip -q
  ./venv/bin/pip install -r requirements.txt -q 2>/dev/null || ./venv/bin/pip install fastapi uvicorn pydantic python-dotenv requests -q
  ./venv/bin/pip install openai -q
  ./venv/bin/pip install "camel-ai[all]" -q 2>/dev/null || true
  OWL_PYTHON="./venv/bin/python"
  if ! ./venv/bin/python -c "from camel.agents import ChatAgent" 2>/dev/null; then
    echo "  camel-ai 0.2.x not on PyPI; cloning camel-ai/owl and installing with uv..."
    OWL_CLONE="$OWL_DIR/owl-repo"
    if [ ! -d "$OWL_CLONE" ]; then
      git clone --depth 1 https://github.com/camel-ai/owl.git "$OWL_CLONE" 2>/dev/null || true
    fi
    if [ -d "$OWL_CLONE" ]; then
      (cd "$OWL_CLONE" && pip install uv -q 2>/dev/null; uv venv .venv --python=3.10 2>/dev/null; . .venv/bin/activate && uv pip install -e . -q 2>/dev/null && uv pip install -r "$OWL_DIR/requirements.txt" -q 2>/dev/null)
      if [ -x "$OWL_CLONE/.venv/bin/python" ]; then
        OWL_PYTHON="$OWL_CLONE/.venv/bin/python"
        echo "  Using CAMEL from camel-ai/owl repo."
      fi
    fi
  fi
  set -e

  echo "  Starting OWL backend (uvicorn 0.0.0.0:5000)..."
  nohup "$OWL_PYTHON" -m uvicorn main:app --host 0.0.0.0 --port 5000 > /tmp/owl-worker.log 2>&1 &
  OWL_PID=$!
  echo "  OWL worker PID: $OWL_PID"
  sleep 3

  set +e
  if ps -p $OWL_PID > /dev/null 2>&1; then
    echo "  ✓ OWL worker process running; waiting for /ping..."
    for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20; do
      if curl -sf http://127.0.0.1:5000/ping > /dev/null 2>&1; then
        echo "  ✓ OWL worker reachable on port 5000."
        break
      fi
      if [ "$i" -eq 20 ]; then
        echo "  ⚠️ OWL /ping did not respond after 20 attempts — check /tmp/owl-worker.log"
        tail -20 /tmp/owl-worker.log
      fi
      sleep 1
    done
  else
    echo "  ⚠️ OWL worker failed to start — check /tmp/owl-worker.log:"
    tail -30 /tmp/owl-worker.log
  fi
  set -e

  cd "$PROJECT_ROOT"
fi



# ─── 4. Start Cloudflare Tunnel (after server is up so tunnel can forward) ───
# Token is read from src/owl-backend/.env (CLOUDFLARE_TUNNEL_TOKEN). Set it once; never commit .env.
# If you do NOT have a domain, you can use a Cloudflare Quick Tunnel (trycloudflare.com):
#   set CLOUDFLARE_QUICK_TUNNEL=1 (no token needed; URL changes each run).
if [ "$CLOUDFLARE_QUICK_TUNNEL" = "1" ] || [ "$CLOUDFLARE_QUICK_TUNNEL" = "true" ] || [ "$CLOUDFLARE_QUICK_TUNNEL" = "yes" ]; then
  echo ""
  echo "========== Cloudflare Quick Tunnel =========="
  pkill -9 cloudflared 2>/dev/null || true
  sleep 2
  : > /tmp/cloudflared.log
  # Quick Tunnel does NOT require a Cloudflare account or domain, but the URL is ephemeral (changes each run).
  if command -v setsid &>/dev/null; then
    setsid nohup cloudflared tunnel --url "http://localhost:$SERVER_PORT" --no-autoupdate >> /tmp/cloudflared.log 2>&1 </dev/null &
  else
    nohup cloudflared tunnel --url "http://localhost:$SERVER_PORT" --no-autoupdate >> /tmp/cloudflared.log 2>&1 </dev/null &
  fi
  CLOUDFLARE_PID=$!
  disown $CLOUDFLARE_PID 2>/dev/null || true
  sleep 4
  if ps -p $CLOUDFLARE_PID > /dev/null 2>&1; then
    echo "  *** Quick Tunnel running *** (PID $CLOUDFLARE_PID)"
    QUICK_URL="$(grep -Eo 'https://[a-zA-Z0-9-]+\.trycloudflare\.com' /tmp/cloudflared.log | tail -1)"
    if [ -n "$QUICK_URL" ]; then
      export CLOUDFLARE_PUBLIC_URL="$QUICK_URL"
      echo "  Public URL: $CLOUDFLARE_PUBLIC_URL"
    else
      echo "  Public URL not detected yet. Run: tail -50 /tmp/cloudflared.log"
    fi
  else
    echo "  *** Quick Tunnel failed or exited *** Run: tail -50 /tmp/cloudflared.log"
    tail -50 /tmp/cloudflared.log
  fi
  echo "============================================"
  echo ""
elif [ -n "$CLOUDFLARE_TUNNEL_TOKEN" ]; then
  echo ""
  echo "========== Cloudflare Tunnel =========="
  CLOUDFLARE_SERVICE_INSTALL="${CLOUDFLARE_SERVICE_INSTALL:-0}"
  if [ "$CLOUDFLARE_SERVICE_INSTALL" = "1" ] || [ "$CLOUDFLARE_SERVICE_INSTALL" = "true" ] || [ "$CLOUDFLARE_SERVICE_INSTALL" = "yes" ]; then
    echo "  Installing cloudflared as system service (runs on boot)..."
    sudo cloudflared service install "$CLOUDFLARE_TUNNEL_TOKEN" 2>/dev/null || true
    sudo systemctl start cloudflared 2>/dev/null || true
    sleep 3
    if systemctl is-active cloudflared &>/dev/null; then
      echo "  *** Cloudflare tunnel service running (survives reboot) ***"
    else
      echo "  Service install attempted. Check: systemctl status cloudflared"
    fi
  else
    pkill -9 cloudflared 2>/dev/null || true
    sleep 2
    : > /tmp/cloudflared.log
    # Run cloudflared in background. Use HTTP/2 if QUIC fails (e.g. RunPod blocks UDP).
    CLOUDFLARE_PROTOCOL="${CLOUDFLARE_PROTOCOL:-}"
    CMD="cloudflared tunnel run --token $CLOUDFLARE_TUNNEL_TOKEN"
    [ -n "$CLOUDFLARE_PROTOCOL" ] && CMD="$CMD --protocol $CLOUDFLARE_PROTOCOL"
    if command -v setsid &>/dev/null; then
      setsid nohup $CMD >> /tmp/cloudflared.log 2>&1 </dev/null &
    else
      nohup $CMD >> /tmp/cloudflared.log 2>&1 </dev/null &
    fi
    CLOUDFLARE_PID=$!
    disown $CLOUDFLARE_PID 2>/dev/null || true
    sleep 4
    if ps -p $CLOUDFLARE_PID > /dev/null 2>&1; then
      echo "  *** Cloudflare tunnel running *** (PID $CLOUDFLARE_PID)"
      echo "  Keep the script running in tmux (Ctrl+B D to detach) so the tunnel stays up."
    else
      echo "  *** Cloudflare tunnel failed or exited *** Run: tail -30 /tmp/cloudflared.log"
      tail -20 /tmp/cloudflared.log
      echo "  If you see 'context canceled' / QUIC errors, add to .env: CLOUDFLARE_PROTOCOL=http2"
      echo "  Tip: Set CLOUDFLARE_SERVICE_INSTALL=1 in .env to run tunnel as a system service (survives terminal close)."
    fi
  fi
  if [ -n "$CLOUDFLARE_PUBLIC_URL" ]; then
    echo "  Public URL: $CLOUDFLARE_PUBLIC_URL"
  else
    echo "  Set CLOUDFLARE_PUBLIC_URL in .env (e.g. https://maya.cfargotunnel.com)"
  fi
  echo "========================================"
  echo ""
fi

set -e

PUBLIC_URL="${CLOUDFLARE_PUBLIC_URL:-https://maya.cfargotunnel.com}"
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  🚀 All services running!                                      ║"
echo "╟────────────────────────────────────────────────────────────────╢"
echo "║  Local server:  http://localhost:$SERVER_PORT                      ║"
echo "║  Public URL:   $PUBLIC_URL"
echo "║  Health:       $PUBLIC_URL/health                                ║"
echo "║  Token:        $PUBLIC_URL/token                                 ║"
echo "║  OWL /ping:    $PUBLIC_URL/worker/ping (via maya-server proxy)   ║"
echo "╟────────────────────────────────────────────────────────────────╢"
echo "║  Logs:                                                         ║"
echo "║    opencode:    /tmp/opencode.log                              ║"
echo "║    maya-server: /tmp/maya-server.log                           ║"
echo "║    owl-worker:  /tmp/owl-worker.log                            ║"
echo "║    cloudflared: /tmp/cloudflared.log                           ║"
echo "╟────────────────────────────────────────────────────────────────╢"
echo "║  Set in .env and frontend: CLOUDFLARE_PUBLIC_URL=$PUBLIC_URL"
echo "╚════════════════════════════════════════════════════════════════╝"

echo ""

echo "Client token (use in web UI): $MAYA_TOKEN"

echo ""



# Keep the script alive so the pod doesn't exit

wait $SERVER_PID