#!/bin/bash

# =============================================================================

# MAYA RunPod Startup Script

# Starts maya-server (OpenWork backend) + ngrok tunnel

# Usage: chmod +x runpod-start.sh && ./runpod-start.sh

# =============================================================================

set -e



NGROK_DOMAIN="nondetonating-cecile-nongrounded.ngrok-free.dev"

NGROK_AUTHTOKEN="3841GHziqbUnXfyEo7KhmabjLvm_QyAUhK2Qb2phjEK59T5o"

SERVER_PORT=8787

OPENCODE_PORT=4096



# Load secrets from .env (never commit .env to git)

if [ -f "$(dirname "$0")/src/owl-backend/.env" ]; then

  set -a

  source "$(dirname "$0")/src/owl-backend/.env"

  set +a

  echo "[env] Loaded secrets from src/owl-backend/.env"

else

  echo "[warn] No .env found at src/owl-backend/.env — set OPENROUTER_API_KEY manually"

fi



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

  curl -sSL https://ngrok-agent.s3.amazonaws.com/ngrok.asc \

    | tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null

  echo "deb https://ngrok-agent.s3.amazonaws.com buster main" \

    | tee /etc/apt/sources.list.d/ngrok.list

  apt-get update -qq && apt-get install -y ngrok -qq

  echo "      ngrok installed: $(ngrok version)"

else

  echo "[2/5] ngrok already installed: $(ngrok version)"

fi



# ─── 3. Authenticate ngrok ───────────────────────────────────────────────────

echo "[3/5] Configuring ngrok authtoken..."

ngrok config add-authtoken "$NGROK_AUTHTOKEN"

echo "      ngrok authenticated."



# ─── 4. Install project dependencies ─────────────────────────────────────────

echo "[4/5] Installing project dependencies..."

cd "$(dirname "$0")"   # switch to the script's directory (project root)



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



# Health check

if curl -sf "http://localhost:$SERVER_PORT/health" >/dev/null; then

  echo "  ✓ maya-server is healthy"

else

  echo "  ✗ maya-server health check failed — check /tmp/maya-server.log"

  cat /tmp/maya-server.log

fi



# ─── Start OWL Python Worker on port 5000 ───────────────────────────────

echo "▶ Starting OWL remote worker on port 5000..."

set +e

cd /workspace/MAYA/src/owl-backend

if [ ! -d "venv" ]; then

    python3 -m venv venv >> /tmp/owl-install.log 2>&1

fi

source venv/bin/activate >> /tmp/owl-install.log 2>&1

echo "  Installing Python dependencies (this may take a minute)..."

pip install -r requirements.txt >> /tmp/owl-install.log 2>&1

echo "  Installing Playwright browsers..."

playwright install chromium >> /tmp/owl-install.log 2>&1

nohup uvicorn main:app --host 0.0.0.0 --port 5000 > /tmp/owl-worker.log 2>&1 &

OWL_PID=$!

echo "  OWL Worker PID: $OWL_PID"

cd /workspace/MAYA

set -e



# ─── Start ngrok tunnel ───────────────────────────────────────────────────────

echo "▶ Starting ngrok tunnel → port $SERVER_PORT..."

ngrok http \

  --domain="$NGROK_DOMAIN" \

  "$SERVER_PORT" \

  > /tmp/ngrok.log 2>&1 &

NGROK_PID=$!

echo "  ngrok PID: $NGROK_PID"

sleep 2



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