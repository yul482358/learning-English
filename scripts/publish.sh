#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

python3 scripts/sync_learning_data.py

# Generate Azure TTS only if key exists in env or .env.
if [ -n "${AZURE_SPEECH_KEY:-}" ] || [ -f .env ] && grep -q '^AZURE_SPEECH_KEY=' .env; then
  python3 scripts/generate_azure_tts.py || echo "TTS generation failed; continuing publish without new audio" >&2
fi

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git init
  git branch -M main
fi

git add .
if git diff --cached --quiet; then
  echo "No changes to publish."
  exit 0
fi

git commit -m "Update English learning dashboard"
if git remote get-url origin >/dev/null 2>&1; then
  git push origin main
else
  echo "No git remote 'origin' configured. Set it with:" >&2
  echo "  git remote add origin git@github.com:YOUR_USER/YOUR_REPO.git" >&2
  exit 2
fi
