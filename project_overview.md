# MAYA Architecture & Deployment Documentation

## 1. Project Overview

**MAYA** is an advanced local-first desktop application with AI-agentic capabilities. It is designed around a modular architecture combining a responsive desktop user interface with powerful internal LLM coordination engines, allowing developers and creatives to automate complex codebase generation, analysis, and tasks directly on their machines—or routed to a highly-scalable dedicated cloud worker.

### Core Stack Components

The MAYA application is built atop three critical synergistic pieces:

1. **The MAYA Desktop App (Tauri + SolidJS + Vite)**
   A cross-platform native execution shell containing the rich graphical user interface. It manages settings, themes, user sessions, chat context, API keys, and securely communicates via IPC (Inter-Process Communication) and native `tauriFetch` APIs to bypass browser networking restrictions (such as CORS).
   
2. **The OpenCode Engine & Router (Rust)**
   The core intelligence processing unit. Supplied as a pre-compiled sidecar binary within the desktop bundle, OpenCode acts as the translation layer evaluating user prompts, formatting Large Language Model inputs, and interpreting streams back into actionable code differences or terminal interactions. The routing service proxies and orchestrates messages seamlessly.

3. **The MAYA OpenWork Server (Node.js)**
   The underlying operational service layer. This orchestrates file system read/write access, tool capabilities (MCP integrations), token authentication, routing proxy logic, and workspace management.

---

## 2. The OWL Multi-Agent Framework

**OWL** (OpenCode Worker Layer) represents the pinnacle of autonomous execution within MAYA, enabling complex tasks to be distributed across specialized AI agents.

### Abstract 
Instead of a monolithic single-prompt chat, the OWL framework decomposes complex development requirements into discrete actionable phases (Planning, Execution, Verification) handed to specialized AI "workers".

### How It Connects
- The OWL worker logic is largely instantiated as a Python backend execution layer (`src/owl-backend`).
- The Python component boots up a REST/WebSocket API wrapper (often a FastAPI or similar server) listening on port `5000`.
- When the Desktop App submits a multi-agent orchestrated task, it does not evaluate it locally. Instead, it securely transmits the prompt and file context over to the active OWL worker.

---

## 3. Execution Modes: Local vs. Cloud

A primary tenant of MAYA's architecture is the ability to easily toggle between Execution Modes inside the Desktop settings.

### Mode A: Local Worker (Default)
In Local Mode, the entire stack (The Desktop GUI, the OpenCode instance, the MAYA Server, and the OWL logic environment) are executing directly on the user's host machine. This guarantees complete data privacy and relies on the user's own CPU/GPU horsepower and network bandwidth to interface with upstream LLM providers (e.g. OpenAI, Anthropic endpoints).

### Mode B: Cloud Worker (RunPod Deployment)
In Cloud Worker mode, the heavyweight AI reasoning (OpenCode Engine + MAYA Server + OWL Framework workspaces) are deployed entirely separate from the machine hosting the Desktop application interface.

**Benefits:**
- **Zero Local Footprint:** The local machine becomes a lightweight "thin-client".
- **Unlimited Scalability:** Code runs isolated on high-end external hardware, preventing the local PC from crashing or locking up during intensive agent loop executions, multi-container docker builds, or bulk data processing operations.

**The Ngrok Bridge:**
Because cloud VPS providers (like RunPod) assign randomized fluctuating IP addresses to dynamically provisioned pods, we establish a permanent, static URL tunnel via **Ngrok**. 

When MAYA is toggled into Cloud Worker mode, all LLM polling (`/opencode/session/...`) and worker executions are serialized and shipped securely across the internet straight into the Ngrok tunnel, directly hitting the remote engine. 

*(**Note:** The Tauri HTTP plugin explicitly ignores the browser preflight CORS restrictions intercepting the `ngrok-skip-browser-warning` headers, guaranteeing secure seamless injection behind Ngrok's anti-bot protections.)*

---

## 4. RunPod "Cloud Worker" Setup Instructions

Transforming any generic Linux VPS or RunPod instance into a fully authorized MAYA Cloud Worker is automated to a single bash script run.

### Pre-Requisites
1. A fresh Linux Ubuntu instance (or a PyTorch template on RunPod).
2. Root/SSH terminal access to the active instance.
3. Your Ngrok Authtoken.

### Cloud Server Deployment Steps

1. Attach to your server's web terminal or SSH shell.
2. Clone the MAYA repository directly onto the VPS workspace:
   ```bash
   git clone https://github.com/Kavin56/MAYA.git /workspace/MAYA
   cd /workspace/MAYA
   ```
3. Initialize the backend environment within a permanent (`tmux`) background shell so it survives terminal disconnections:
   ```bash
   tmux new -s dev
   chmod +x runpod-start.sh
   ./runpod-start.sh
   ```
4. **Automated Provisioning:** The script will automatically:
   - Install `bun` and `nodejs`.
   - Install the `ngrok` routing agent.
   - Install the `opencode` CLI engine binaries.
   - Boot the integrated Node.js `maya-server`.
   - Establish the Ngrok endpoint tunneling to local port `8787`.

To detach from the running shell, press `Ctrl+B`, then press `D`.

### Desktop Client Connection Steps

In prior iterations, users had to copy/paste complex API endpoint tokens. However, the connection protocol is now built permanently into the application!

1. Open your **MAYA Desktop Installer** (`.exe`) and complete the installation locally.
2. Launch the application.
3. Open the **Settings** menu via the bottom left gear icon.
4. Navigate to the **Advanced** tab.
5. In the **OWL Remote Worker** section, simply select the prominent **Cloud Worker** toggle button.

**What happens under the hood?**
Clicking the button engages a Tauri-backed system fetch against the pre-provisioned Ngrok cloud URL. It requests a `clientToken` and a `host` signature from the remote backend. Receiving this token unlocks the remote agent, mounts the cloud filesystem as a virtual "Remote Workspace", and instantly bridges the chat UI to the OpenCode engine executing 1000 miles away on the VPS.
