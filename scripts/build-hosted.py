"""Prepare the portfolio's live pages and media in dist/ for static hosting."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import unquote, urlsplit
import json, re, shutil, subprocess

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist'

subprocess.run(['python3', str(ROOT/'scripts/build-projects.py')], cwd=ROOT, check=True)
if DIST.exists(): shutil.rmtree(DIST)
DIST.mkdir()
pages = ['index.html', 'about.html']
for config in sorted((ROOT/'projects').glob('*/project.json')):
    project = json.loads(config.read_text())
    if project.get('preview'): continue
    pages.append(project.get('output', config.parent.name+'.html'))
    media = config.parent/'media'
    if media.exists(): shutil.copytree(media, DIST/media.relative_to(ROOT))
for name in pages:
    shutil.copy2(ROOT/name, DIST/name)
for pattern in ['*.css', '*.js']:
    for source in ROOT.glob(pattern): shutil.copy2(source, DIST/source.name)
shutil.copytree(ROOT/'assets', DIST/'assets', ignore=shutil.ignore_patterns('.DS_Store'))

# Keep source masters untouched. Large hosting copies use a high-quality web
# encode, at the same resolution, below static-hosting asset size limits.
for video in DIST.rglob('*.mp4'):
    if video.stat().st_size <= 24*1024*1024: continue
    temporary = video.with_name(video.stem+'.hosting.mp4')
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-i',str(video),
        '-map','0:v:0','-map','0:a?','-c:v','libx264','-preset','slow','-crf','17',
        '-pix_fmt','yuv420p','-c:a','copy','-movflags','+faststart',str(temporary)],check=True)
    temporary.replace(video)
    if video.stat().st_size > 24*1024*1024:
        raise ValueError('Hosting asset remains too large: '+str(video.relative_to(DIST)))

class Links(HTMLParser):
    def __init__(self): super().__init__(); self.paths=[]
    def handle_starttag(self, tag, attrs):
        self.paths += [value for key,value in attrs if key in {'src','href','poster'} and value]

def validate(value, base):
    parsed=urlsplit(value)
    if parsed.scheme or parsed.netloc or not parsed.path: return
    target = DIST/unquote(parsed.path).lstrip('/') if parsed.path.startswith('/') else base/unquote(parsed.path)
    if not target.exists(): raise FileNotFoundError('Missing hosted asset: '+value)

for name in pages:
    parser=Links(); parser.feed((DIST/name).read_text())
    for value in parser.paths: validate(value,DIST)
for css in DIST.glob('*.css'):
    for value in re.findall(r'url\([\"\']?([^\)\"\']+)',css.read_text()): validate(value,css.parent)
for js in [DIST/'app.js',DIST/'content.js']:
    for value in re.findall(r'[\"\'](assets/[^\"\']+)',js.read_text()): validate(value,DIST)
print(f'Prepared and checked {len(pages)} live pages in {DIST}.')
