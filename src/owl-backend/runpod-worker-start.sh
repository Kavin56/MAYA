#!/bin/bash

# MAYA OWL Remote Worker - RunPod Startup Script

# ───────── API Keys — loaded from .env (never hardcode here) ─────────────────

if [ -f "$(dirname "$0")/.env" ]; then

  set -a

  source "$(dirname "$0")/.env"

  set +a

  echo "[env] Loaded secrets from .env"

else

  echo "[warn] No .env found — create src/owl-backend/.env with OPENROUTER_API_KEY"

fi

# 1. Update system packages

apt-get update -y

apt-get install -y python3-pip python3-venv git curl tmux

# 2. Setup workspace

mkdir -p /workspace/owl-worker

cd /workspace/owl-worker

# 3. Clone or pull latest code from git (update this URL to your fork)

if [ ! -d ".git" ]; then

    git clone https://github.com/Kavin56/MAYA.git .

fi

git pull origin main || true

# 4. Create virtual environment

python3 -m venv venv

source venv/bin/activate

# 5. Install Python dependencies

if [ -f "src/owl-backend/requirements.txt" ]; then

    pip install -r src/owl-backend/requirements.txt

fi

# 6. Start the FastAPI server on port 5000 inside a tmux session

cd src/owl-backend

echo "Starting OWL Remote Worker with OpenRouter integration..."

tmux new-session -d -s owl-worker "OPENROUTER_API_KEY=${OPENROUTER_API_KEY} uvicorn main:app --host 0.0.0.0 --port 5000"

echo "Worker started on port 5000 in tmux session 'owl-worker'."

echo "To expose to the internet, run: ngrok http 5000"