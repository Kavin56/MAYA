#!/bin/bash

# =============================================================================

# MAYA RunPod Startup Script

# Starts maya-server (OpenWork backend) + ngrok tunnel

# Usage: chmod +x runpod-start.sh && ./runpod-start.sh

# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
OWL_ENV_DIR="$SCRIPT_DIR/src/owl-backend"
SERVER_PORT=8787
OPENCODE_PORT=4096

# Load .env FIRST so NGROK_* and OPENROUTER_* from .env override any defaults below
if [ -f "$OWL_ENV_DIR/.env" ]; then
  set -a
  source "$OWL_ENV_DIR/.env"
  set +a
  echo "[env] Loaded from src/owl-backend/.env"
else
  echo "[warn] No src/owl-backend/.env — copy .env.example to .env and set OPENROUTER_API_KEY, NGROK_AUTHTOKEN, NGROK_DOMAIN"
fi

# Defaults only when not set by .env or RunPod env
export NGROK_DOMAIN="${NGROK_DOMAIN:-nondetonating-cecile-nongrounded.ngrok-free.dev}"
export NGROK_AUTHTOKEN="${NGROK_AUTHTOKEN:-}"



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



# ─── 2. Install ngrok ────────────────────────────────────────────────────────

if ! command -v ngrok &>/dev/null; then

  echo "[2/5] Installing ngrok..."
  curl -sSL https://ngrok-agent.s3.amazonaws.com/ngrok.asc -o /etc/apt/trusted.gpg.d/ngrok.asc
  echo "deb https://ngrok-agent.s3.amazonaws.com buster main" > /etc/apt/sources.list.d/ngrok.list
  apt-get update -qq && apt-get install -y ngrok -qq

  echo "      ngrok installed: $(ngrok version)"

else

  echo "[2/5] ngrok already installed: $(ngrok version)"

fi



# ─── 3. Authenticate ngrok (only if token set) ─────────────────────────────────
echo "[3/5] Configuring ngrok..."
if [ -n "$NGROK_AUTHTOKEN" ]; then
  ngrok config add-authtoken "$NGROK_AUTHTOKEN"
  echo "      ngrok authenticated."
else
  echo "      [warn] NGROK_AUTHTOKEN empty — set in src/owl-backend/.env; tunnel will be skipped."
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



# ─── Start opencode server ───────────────────────────────────────────────────

if command -v opencode &>/dev/null; then

  echo "▶ Starting opencode server on port $OPENCODE_PORT..."

  nohup opencode serve --port "$OPENCODE_PORT" > /tmp/opencode.log 2>&1 &

  OPENCODE_PID=$!

  echo "  opencode PID: $OPENCODE_PID"

  sleep 2  # give opencode time to start

else

  echo "⚠  opencode not found — the server will work but AI features require opencode installed."

  echo "   Install: curl -fsSL https://opencode.ai/install | bash"

fi



# ─── Start maya-server (OpenWork) on port 8787 ───────────────────────────────

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



# Give the server a moment to bind the port

sleep 3



# Health check (don't exit so we still start ngrok and user can see logs)
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

# ─── Start ngrok tunnel (right after server is up so tunnel is ready early) ────
if [ -z "$NGROK_AUTHTOKEN" ]; then
  echo "  [skip] ngrok tunnel — NGROK_AUTHTOKEN not set in .env"
else
  echo "  Stopping any existing ngrok..."
  pkill -9 ngrok 2>/dev/null || true
  killall -9 ngrok 2>/dev/null || true
  sleep 4
  echo "▶ Starting ngrok tunnel → port $SERVER_PORT (https://$NGROK_DOMAIN)..."
  set +e
  nohup ngrok http "$SERVER_PORT" --url="https://$NGROK_DOMAIN" >> /tmp/ngrok.log 2>&1 &
  NGROK_PID=$!
  disown $NGROK_PID 2>/dev/null || true
  sleep 3
  if ps -p $NGROK_PID > /dev/null 2>&1; then
    echo "  ✓ ngrok tunnel running (PID $NGROK_PID)"
  else
    echo "  ⚠️ ngrok exited — see: tail -30 /tmp/ngrok.log"
    tail -15 /tmp/ngrok.log
  fi
  set -e
fi

# ─── Start OWL Python Worker on port 5000 ────────────────────────────────────
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
  ./venv/bin/pip install "camel-ai>=0.2.0" --no-deps -q 2>/dev/null || true
  set -e

  echo "  Starting OWL backend (uvicorn 0.0.0.0:5000)..."
  nohup ./venv/bin/uvicorn main:app --host 0.0.0.0 --port 5000 > /tmp/owl-worker.log 2>&1 &
  OWL_PID=$!
  echo "  OWL worker PID: $OWL_PID"
  sleep 3

  set +e
  if ps -p $OWL_PID > /dev/null 2>&1; then
    echo "  ✓ OWL worker is running."
  else
    echo "  ⚠️ OWL worker failed to start — check /tmp/owl-worker.log:"
    tail -30 /tmp/owl-worker.log
  fi
  set -e

  cd "$PROJECT_ROOT"
fi

set -e

echo ""

echo "╔════════════════════════════════════════════════════════════════╗"

echo "║  🚀 All services running!                                      ║"

echo "╟────────────────────────────────────────────────────────────────╢"

echo "║  Local server:  http://localhost:$SERVER_PORT                      ║"

echo "║  Public URL: https://$NGROK_DOMAIN      ║"

echo "║  Health check URL:                                             ║"

echo "║    https://$NGROK_DOMAIN/health        ║"

echo "╟────────────────────────────────────────────────────────────────╢"

echo "║  Logs:                                                         ║"

echo "║    opencode:    /tmp/opencode.log                              ║"

echo "║    maya-server: /tmp/maya-server.log                           ║"

echo "║    owl-worker:  /tmp/owl-worker.log                             ║"

echo "║    ngrok:       /tmp/ngrok.log                                 ║"

echo "╟────────────────────────────────────────────────────────────────╢"

echo "║  Set these in your Vercel / frontend:                          ║"

echo "║  VITE_OPENWORK_URL=https://$NGROK_DOMAIN ║"

echo "╚════════════════════════════════════════════════════════════════╝"

echo ""

echo "Client token (use in web UI): $MAYA_TOKEN"

echo ""



# Keep the script alive so the pod doesn't exit

wait $SERVER_PID