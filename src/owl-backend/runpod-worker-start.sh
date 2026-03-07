#!/bin/bash
# MAYA OWL Remote Worker - RunPod Startup Script

# 1. Update system packages
apt-get update -y
apt-get install -y python3-pip python3-venv git curl tmux

# 2. Setup workspace
mkdir -p /workspace/owl-worker
cd /workspace/owl-worker

# 3. Create virtual environment
python3 -m venv venv
source venv/bin/activate

# 4. Clone or write files (In a real scenario, clone from git repo)
# For now, we assume this script runs where the files are already present or we install via pip.
# The user will typically SCP this folder or clone their fork.
# We will just start the uvicorn server in a tmux session if files are here.

if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
    playwright install chromium
fi

# 5. Start the FastAPI server on port 5000
echo "Starting OWL Remote Worker..."
tmux new-session -d -s owl-worker "uvicorn main:app --host 0.0.0.0 --port 5000"

# Note: The user still needs to run ngrok manually to expose port 5000
echo "Worker started on port 5000 in tmux session 'owl-worker'."
echo "To expose to the internet, run: ngrok http 5000"
