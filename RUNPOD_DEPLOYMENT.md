# MAYA Cloud Worker Deployment Guide

This guide details how to seamlessly deploy the remote backend of the MAYA AI stack (OpenCode Engine + MAYA Server + OpenWork API) on a Linux Virtual Private Server (VPS) or a RunPod instance.

By deploying this into the cloud, you can run the MAYA Desktop application locally on any low-end hardware, while all heavy AI execution, terminal commands, and workspace file generations safely happen on the remote cloud worker!

## 🚀 Step-by-Step Deployment

When you spin up a new Pod on RunPod (e.g., using a PyTorch or Ubuntu template) and connect via SSH or the Web Terminal, simply copy and paste the following commands.

This will install all necessary dependencies, clone the repository, and start all services securely in the background using `tmux`.

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

Because we used `tmux`, the services are running safely in the background. Even if you close your RunPod terminal, they will continue to run perpetually.

**To view the real-time logs and the active Ngrok tunnel:**
```bash
tmux attach-session -t dev
```
*(To detach and leave it running in the background again, press `Ctrl+B`, then press `D`)*

## 🌐 Connecting your Desktop App

Because the latest versions of the MAYA Desktop `.exe` are uniquely pre-configured to communicate with the cloud endpoint automatically, connecting is literally a single click.

1. Open your **MAYA Desktop App** (`.exe`).
2. Go to **Settings** -> **Advanced**.
3. Under the **OWL Remote Worker** section, click **Cloud Worker**.

🎉 That's it! 

The Desktop App will elegantly bypass the Ngrok security layers, securely fetch its internal authorization tokens, dynamically mount the Remote Workspace, and establish a permanent streaming 5-minute timeout connection to the Cloud Worker! All subsequent queries to the MAYA AI will be seamlessly executed on your RunPod VPS.
