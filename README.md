# Ogden English Learning Dashboard

Static dashboard generated from `/opt/data/ogden/learning_profile`.

Deploy with Cloudflare Pages as a static site.

## Local preview

```bash
python3 -m http.server 8080
```

## Data sync

```bash
python3 scripts/sync_learning_data.py
```

## Azure TTS

Do not commit secrets. Copy `.env.example` to `.env` locally and fill in keys.
