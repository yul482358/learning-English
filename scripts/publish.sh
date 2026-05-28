#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
python3 scripts/generate_tts.py
git add .
git commit -m "update daily English memory deck" || true
git push origin main
