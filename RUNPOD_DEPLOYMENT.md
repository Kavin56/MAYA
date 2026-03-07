# MAYA RunPod Deployment Guide

This guide details how to seamlessly deploy the entire MAYA AI stack (OpenCode Engine, MAYA Server, and Python OWL Worker) on a fresh RunPod instance.

## 🚀 Step-by-Step Deployment

When you spin up a new Pod on RunPod (e.g., using a PyTorch or Ubuntu template) and connect via SSH or the Web Terminal, simply copy and paste the following commands.

This will install all necessary dependencies, clone your repository, and start all services securely in the background using `tmux`.

```bash
# ── 1. System packages ─────────────────────────────────────
apt-get update -qq && apt-get install -y curl wget git unzip python3-venv python3-pip tmux

# ── 2. Node.js 20 ──────────────────────────────────────────
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# ── 3. opencode (AI engine) ────────────────────────────────
curl -fsSL https://opencode.ai/install | bash
source ~/.bashrc

# ── 4. Clone your repo ─────────────────────────────────────
git clone https://github.com/Kavin56/MAYA.git /workspace/MAYA
cd /workspace/MAYA

# ── 5. Run the unified startup script inside tmux ──────────
tmux new -s dev

# (Once inside the tmux session "dev", run the script)
chmod +x runpod-start.sh
./runpod-start.sh
```

## 🔍 Monitoring the Services

Because we used `tmux`, the services are running safely in the background. Even if you close your RunPod terminal, they will continue to run.

**To view the real-time logs and the ngrok URL:**
```bash
tmux attach-session -t dev
```
*(To detach and leave it running in the background again, press `Ctrl+B`, then press `D`)*

## 🌐 Connecting your Desktop App

1. Once the setup script finishes, it will print a public **ngrok URL** (e.g. `https://nondetonating-cecile-nongrounded.ngrok-free.dev`).
2. Open your MAYA Desktop App (`.exe`).
3. Go to **Settings** -> **Advanced**.
4. In the **OWL Remote Worker** section, select **Cloud Worker**.
5. Paste the ngrok URL into the Remote Worker URL field.

**Note on internal routing:** You only need *one* ngrok URL. The MAYA server automatically handles routing API requests to `/worker/...` directly into the Python OWL backend running on port 5000 inside the pod.
