#!/usr/bin/env python3
"""Sync private learning profile data into public/static site data files."""
from __future__ import annotations
import json
import datetime as dt
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OGDEN = Path('/opt/data/ogden')
PROFILE = OGDEN / 'learning_profile'


def read_json(path: Path):
    return json.loads(path.read_text(encoding='utf-8'))


def write_json(path: Path, data, compact: bool = False):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=None if compact else 2), encoding='utf-8')


def main():
    progress = read_json(PROFILE / 'progress.json')
    review = read_json(PROFILE / 'review_queue.json')
    words = read_json(OGDEN / 'ogden_850_words.json')
    exprs = progress.get('expression_progress', {})
    now = dt.datetime.now(dt.timezone.utc).isoformat()
    dashboard = {
        'generated_at': now,
        'goal': progress.get('learner_goal', 'Active English communication.'),
        'stats': {
            'expression_count': len(exprs),
            'review_count': len(review.get('queue', [])),
            'ogden_words': len(words),
            'mastered_count': sum(1 for v in exprs.values() if v.get('level', 0) >= 3),
            'weak_count': sum(1 for v in exprs.values() if v.get('status') in ['weak', 'target']),
        },
        'today_focus': [x['item'] for x in sorted(review.get('queue', []), key=lambda x: -x.get('priority', 0))[:5]],
        'suggested_task': 'Describe one real situation. Use today’s focus expressions naturally.',
    }
    write_json(ROOT / 'data/dashboard.json', dashboard)
    write_json(ROOT / 'data/progress.json', progress)
    write_json(ROOT / 'data/review_queue.json', review)
    (ROOT / 'data/error_log.md').write_text((PROFILE / 'error_log.md').read_text(encoding='utf-8'), encoding='utf-8')
    public_words = [
        {k: w.get(k) for k in ['id','word','category','category_en','category_zh','zh','ipa_uk','ipa_us','english_definition','core_meaning_zh','example_en','example_zh','synonyms']}
        for w in words
    ]
    write_json(ROOT / 'data/words.json', public_words, compact=True)
    print(f'Synced dashboard data at {now}')

if __name__ == '__main__':
    main()
