#!/usr/bin/env python3
"""Generate Azure/Microsoft Speech TTS audio for current review items.

Secrets are read from environment or .env in the site root:
  AZURE_SPEECH_KEY
  AZURE_SPEECH_REGION=eastasia
  AZURE_SPEECH_ENDPOINT=https://eastasia.api.cognitive.microsoft.com/
  AZURE_SPEECH_VOICE=en-US-JennyNeural

This uses Azure Cognitive Services Speech REST API. It writes MP3 files to audio/review/.
"""
from __future__ import annotations
import json
import os
import re
import sys
import urllib.request
import urllib.error
from pathlib import Path
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parents[1]


def load_env():
    env_path = ROOT / '.env'
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding='utf-8').splitlines():
        line = line.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue
        k, v = line.split('=', 1)
        os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


def slugify(text: str) -> str:
    s = re.sub(r'[^a-zA-Z0-9]+', '-', text.lower()).strip('-')
    return s[:80] or 'audio'


def synthesize(text: str, out_path: Path):
    key = os.environ.get('AZURE_SPEECH_KEY')
    region = os.environ.get('AZURE_SPEECH_REGION', 'eastasia')
    voice = os.environ.get('AZURE_SPEECH_VOICE', 'en-US-JennyNeural')
    if not key:
        raise SystemExit('Missing AZURE_SPEECH_KEY. Put it in .env or environment.')

    def request_tts(headers: dict):
        url = f'https://{region}.tts.speech.microsoft.com/cognitiveservices/v1'
        ssml = f'''<speak version="1.0" xml:lang="en-US">
  <voice xml:lang="en-US" name="{escape(voice)}">
    {escape(text)}
  </voice>
</speak>'''.encode('utf-8')
        req_headers = {
            'Content-Type': 'application/ssml+xml',
            'X-Microsoft-OutputFormat': 'audio-16khz-32kbitrate-mono-mp3',
            'User-Agent': 'ogden-learning-dashboard',
        }
        req_headers.update(headers)
        req = urllib.request.Request(url, data=ssml, method='POST', headers=req_headers)
        with urllib.request.urlopen(req, timeout=60) as r:
            return r.read()

    out_path.parent.mkdir(parents=True, exist_ok=True)
    try:
        audio = request_tts({'Ocp-Apim-Subscription-Key': key})
    except urllib.error.HTTPError as direct_error:
        # Some Azure resources work more reliably by first exchanging the key for
        # a bearer token at the regional cognitive endpoint, then calling TTS.
        if direct_error.code != 401:
            detail = direct_error.read().decode('utf-8', 'ignore')
            raise RuntimeError(f'TTS HTTP {direct_error.code}: {detail}') from direct_error
        token_url = f'https://{region}.api.cognitive.microsoft.com/sts/v1.0/issuetoken'
        token_req = urllib.request.Request(token_url, data=b'', method='POST', headers={
            'Ocp-Apim-Subscription-Key': key,
            'Content-Length': '0',
        })
        try:
            with urllib.request.urlopen(token_req, timeout=30) as r:
                token = r.read().decode('utf-8')
            audio = request_tts({'Authorization': f'Bearer {token}'})
        except urllib.error.HTTPError as token_error:
            detail = token_error.read().decode('utf-8', 'ignore')
            raise RuntimeError(
                f'Azure Speech authentication failed. Check that AZURE_SPEECH_KEY matches region {region}. '
                f'HTTP {token_error.code}: {detail}'
            ) from token_error
    out_path.write_bytes(audio)


def main():
    load_env()
    queue = json.loads((ROOT / 'data/review_queue.json').read_text(encoding='utf-8')).get('queue', [])
    generated = []
    for item in queue:
        text = item.get('item', '')
        prompt = item.get('prompt', '')
        # Generate the expression plus a short prompt, not private raw learner content.
        tts_text = f'{text}. {prompt}' if prompt else text
        out = ROOT / 'audio/review' / f'{slugify(text)}.mp3'
        if out.exists() and out.stat().st_size > 1000:
            continue
        synthesize(tts_text, out)
        generated.append(str(out.relative_to(ROOT)))
    print(json.dumps({'generated': generated, 'count': len(generated)}, ensure_ascii=False, indent=2))

if __name__ == '__main__':
    main()
