#!/bin/bash
# RunPod: pull latest and start MAYA (use this after any code change so you get latest script).
# Usage: chmod +x runpod-run.sh && ./runpod-run.sh

set -e
cd "$(dirname "$0")"
git checkout -- runpod-start.sh
git pull origin master
chmod +x runpod-start.sh
pkill -9 ngrok 2>/dev/null || true
sleep 4
./runpod-start.sh
