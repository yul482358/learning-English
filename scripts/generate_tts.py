#!/usr/bin/env python3
from __future__ import annotations
import json, os, subprocess, urllib.request, urllib.error
from pathlib import Path
from xml.sax.saxutils import escape
ROOT=Path(__file__).resolve().parents[1]

def load_env():
    p=ROOT/'.env'
    if p.exists():
        for line in p.read_text(encoding='utf-8').splitlines():
            line=line.strip()
            if not line or line.startswith('#') or '=' not in line: continue
            k,v=line.split('=',1); os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

def synthesize_azure(text:str, out:Path):
    key=os.environ.get('AZURE_SPEECH_KEY')
    region=os.environ.get('AZURE_SPEECH_REGION','eastasia')
    voice=os.environ.get('AZURE_SPEECH_VOICE','en-US-JennyNeural')
    if not key: raise RuntimeError('Missing AZURE_SPEECH_KEY')
    ssml=f'''<speak version="1.0" xml:lang="en-US"><voice xml:lang="en-US" name="{escape(voice)}"><prosody rate="-8%">{escape(text)}</prosody></voice></speak>'''.encode('utf-8')
    url=f'https://{region}.tts.speech.microsoft.com/cognitiveservices/v1'
    headers={'Content-Type':'application/ssml+xml','X-Microsoft-OutputFormat':'audio-24khz-48kbitrate-mono-mp3','User-Agent':'ogden-memory-deck'}
    def call(auth):
        h=dict(headers); h.update(auth)
        req=urllib.request.Request(url,data=ssml,method='POST',headers=h)
        with urllib.request.urlopen(req,timeout=60) as r: return r.read()
    try:
        return call({'Ocp-Apim-Subscription-Key':key})
    except urllib.error.HTTPError as e:
        if e.code != 401: raise
        token_url=f'https://{region}.api.cognitive.microsoft.com/sts/v1.0/issuetoken'
        token_req=urllib.request.Request(token_url,data=b'',method='POST',headers={'Ocp-Apim-Subscription-Key':key,'Content-Length':'0'})
        with urllib.request.urlopen(token_req,timeout=30) as r: token=r.read().decode()
        return call({'Authorization':'Bearer '+token})

def synthesize_edge(text:str, out:Path):
    voice=os.environ.get('EDGE_TTS_VOICE','en-US-JennyNeural')
    cmd=['uvx','--from','edge-tts','edge-tts','--voice',voice,'--rate=-8%','--text',text,'--write-media',str(out)]
    subprocess.run(cmd,check=True,cwd=str(ROOT))

def synthesize(text:str, out:Path):
    out.parent.mkdir(parents=True,exist_ok=True)
    try:
        audio=synthesize_azure(text,out)
        out.write_bytes(audio)
        return 'azure'
    except Exception as e:
        print(f'Azure TTS failed for {out.name}: {e}; falling back to edge-tts')
        synthesize_edge(text,out)
        return 'edge'

def main():
    load_env()
    deck=json.loads((ROOT/'data/deck.json').read_text(encoding='utf-8'))
    generated=[]
    for item in deck['items']:
        text='. '.join([item['pattern'], *item['sentences']])
        out=ROOT/'audio'/f"{item['id']}.mp3"
        if out.exists() and out.stat().st_size>1000: continue
        provider=synthesize(text,out)
        generated.append({'file':str(out.relative_to(ROOT)),'provider':provider})
    print(json.dumps({'generated':generated,'count':len(generated)},ensure_ascii=False,indent=2))
if __name__=='__main__': main()
