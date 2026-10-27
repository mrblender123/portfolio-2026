"""Build project pages from one copy document and a numbered media folder.
Run: python3 scripts/build-projects.py [project-folder-name ...]
"""
from pathlib import Path
from string import Template
from collections import defaultdict
import html, json, re, subprocess, sys

ROOT = Path(__file__).resolve().parents[1]
EXTENSIONS = {'.png','.jpg','.jpeg','.webp','.gif','.avif','.svg','.mp4','.webm'}

def escape(value): return html.escape(str(value), quote=True)

def rich(text):
    text = escape(text)
    return re.sub(r'\*\*(.+?)\*\*',r'<strong>\1</strong>',text)

def paragraphs(text):
    return ''.join('<p>'+rich(part.strip()).replace('\n',' ')+'</p>' for part in re.split(r'\n\s*\n',text.strip()) if part.strip())

def copy_sections(path):
    source = re.sub(r'<!--.*?-->','',path.read_text(),flags=re.S) if path.exists() else ''
    sections, title, lines = {}, None, []
    for line in source.splitlines():
        match = re.match(r'^##\s+(.+?)\s*$',line)
        if match:
            if title is not None: sections[title] = '\n'.join(lines).strip()
            title, lines = match[1], []
        elif title is not None: lines.append(line)
    if title is not None: sections[title] = '\n'.join(lines).strip()
    return sections

def local_source(value,folder):
    if not value: raise ValueError('Every media item needs a source path.')
    if re.match(r'^(https?:|data:|javascript:)',value):
        raise ValueError('Store project media locally before building: '+value)
    source = ROOT / value
    if not source.is_file(): source = folder / value
    if not source.is_file(): raise FileNotFoundError('Missing media: '+value)
    return source.relative_to(ROOT).as_posix()

def media(item,folder,hero=False):
    if isinstance(item,str): item = {'src':item}
    src = local_source(item['src'],folder)
    alt = item.get('alt','')
    if Path(src).suffix.lower() in {'.mp4','.webm'}:
        poster = ' poster="'+escape(local_source(item['poster'],folder))+'"' if item.get('poster') else ''
        controls = ' controls' if item.get('controls') else ''
        dimensions = ' width="'+str(int(item['width']))+'" height="'+str(int(item['height']))+'"' if item.get('width') and item.get('height') else ''
        film = item.get('playback') == 'film'
        playback = ' data-playback="film"' if film else ' muted loop'
        visual = '<video src="'+escape(src)+'"'+poster+controls+dimensions+playback+' playsinline preload="metadata" aria-label="'+escape(alt or 'Project animation')+'"></video>'
        if film:
            visual = '<div class="project-film-frame" data-film>'+visual+'<button class="project-film-start" type="button" hidden aria-label="'+escape('Play: '+(alt or 'Project film'))+'"><span class="project-film-play-icon" data-film-icon aria-hidden="true">▶</span><span><span data-film-action>Play</span></span></button><span class="project-film-status sr-only" role="status" aria-live="polite"></span></div>'
    else:
        visual = '<img src="'+escape(src)+'" alt="'+escape(alt)+'" '+('fetchpriority="high"' if hero else 'loading="lazy"')+' decoding="async">'
    caption = ''
    if item.get('caption'):
        caption = '<figcaption>'+rich(item['caption'])+'</figcaption>'
    class_name = 'project-cover' if hero else 'project-media'
    frame_style = ''
    if not hero and item.get('presentation') == 'portrait':
        width, height = int(item['width']), int(item['height'])
        if not 0 < width < height:
            raise ValueError('Portrait presentation requires positive portrait dimensions.')
        class_name += ' project-media--portrait'
        frame_style = f' style="--media-aspect:{width/height:.8f}"'
    elif not hero and item.get('presentation') == 'compact':
        class_name += ' project-media--compact'
    if hero and item.get('frame'):
        frame = item['frame']
        left,top,width,height,source_width,source_height = (frame[key] for key in ['left','top','width','height','sourceWidth','sourceHeight'])
        if not (width > 0 and height > 0 and left >= 0 and top >= 0 and left + width <= source_width and top + height <= source_height):
            raise ValueError('Invalid transparent media frame.')
        class_name += ' project-cover--framed'
        frame_style = f' style="aspect-ratio:{width}/{height}"'
        image_style = f'width:{source_width/width*100:.6f}%;left:{-left/width*100:.6f}%;top:{-top/height*100:.6f}%'
        visual = visual.replace('<img ', '<img style="'+image_style+'" ', 1)
    return '<figure class="'+class_name+'"'+frame_style+'>'+visual+caption+'</figure>' 

def heading(title,body):
    return '<div class="project-section-heading">'+('<h2>'+rich(title)+'</h2>' if title else '')+paragraphs(body)+'</div>' if title or body else ''

def section(block,folder,index):
    items = block.get('media',[])
    layout = block.get('layout','stack')
    if layout not in {'stack','pair','gallery','text'}: raise ValueError('Unsupported layout: '+layout)
    content = heading(block.get('heading',''),block.get('body',''))
    if items:
        if layout == 'gallery' and len(items)>1:
            gallery_id = 'project-gallery-'+str(index)
            content += '<div class="project-gallery" data-project-gallery role="region" aria-roledescription="carousel" aria-label="'+escape(block.get('heading') or 'Project gallery')+'"><div class="project-gallery-track" id="'+gallery_id+'" tabindex="0">'+''.join(media(item,folder) for item in items)+'</div><div class="project-gallery-controls"><button type="button" data-gallery-previous aria-label="Previous slide" aria-controls="'+gallery_id+'">←</button><span role="status" aria-live="polite">1 / '+str(len(items))+'</span><button type="button" data-gallery-next aria-label="Next slide" aria-controls="'+gallery_id+'">→</button></div></div>'
        else:
            wrapper_class = 'project-pair' if layout=='pair' else 'project-media-stack'
            wrapper_style = ''
            if layout == 'stack' and len(items) == 1 and isinstance(items[0],dict) and items[0].get('ambient'):
                poster = local_source(items[0]['poster'],folder)
                wrapper_class += ' project-media-ambient'
                wrapper_style = ' style="--ambient-image:url('+escape(json.dumps(poster))+')"'
                if items[0].get('ambientColor'):
                    color = items[0]['ambientColor']
                    if not re.fullmatch(r'#[0-9a-fA-F]{6}',color):
                        raise ValueError('Ambient color must be a six-digit hex color.')
                    wrapper_class += ' project-media-ambient--color'
                    wrapper_style = ' style="--ambient-color:'+color+'"'
            content += '<div class="'+wrapper_class+'"'+wrapper_style+'>'+''.join(media(item,folder) for item in items)+'</div>'
    if block.get('dividerAfter') or any(isinstance(item,dict) and item.get('dividerAfter') for item in items):
        content += '<hr class="project-section-divider">'
    return '<section class="project-section" data-reveal="project-section">'+content+'</section>' if content else ''

def overview(copy):
    main = ''.join('<div><h2>'+escape(label)+'</h2>'+paragraphs(copy[label])+'</div>' for label in ['Overview','Problem','Solution','My involvement'] if copy.get(label))
    side = ''
    if copy.get('Deliverables'):
        items = [re.sub(r'^[-*•]\s*','',line.strip()) for line in copy['Deliverables'].splitlines() if line.strip()]
        side += '<div><h2>Deliverables</h2><ul>'+''.join('<li>'+rich(item)+'</li>' for item in items)+'</ul></div>'
    if copy.get('Type'): side += '<div><h2>Type</h2>'+paragraphs(copy['Type'])+'</div>'
    if not (main or side): return ''
    return '<div class="project-overview">'+('<div class="project-overview-main">'+main+'</div>' if main else '')+('<aside class="project-overview-side" aria-label="Project details">'+side+'</aside>' if side else '')+'</div>'

def build(folder,portfolio):
    data = json.loads((folder/'project.json').read_text())
    copy = copy_sections(folder/'copy.md')
    groups = defaultdict(list)
    for file in sorted((folder/'media').glob('*')):
        match = re.match(r'^(\d{2})[-_](.+)$',file.stem)
        if file.suffix.lower() in EXTENSIONS:
            if not match: raise ValueError('Number this media file first: '+str(file))
            groups[match[1]].append(file.relative_to(ROOT).as_posix())
    if len(groups.get('01',[])) > 1: raise ValueError('Use only one 01-cover file.')
    cover = (groups.get('01') or [None])[0] or data.get('cover')
    if isinstance(cover,str) and isinstance(data.get('cover'),dict):
        cover = dict(data['cover'],src=cover)
    if not cover: raise ValueError('Add 01-cover to the media folder or set cover in project.json.')
    numbered = {}
    for label,body in copy.items():
        match = re.match(r'^(\d{2})\s*[—–:-]\s*(.+)$',label)
        if match: numbered[match[1]] = (match[2],body)
    blocks = data.get('sections')
    if blocks is None:
        blocks = []
        for number in sorted((set(groups)|set(numbered))-{'01'}):
            items = groups.get(number,[])
            options = data.get('mediaOptions',{})
            configured_items = [dict(options.get(Path(src).name,{}),src=src) for src in items]
            title,body = numbered.get(number,('',''))
            is_pair = len(items)==2 and all('-pair-' in Path(src).stem for src in items)
            blocks.append({'heading':title,'body':body,'layout':'pair' if is_pair else 'gallery' if len(items)>1 else 'stack','media':configured_items})
    content = ''
    if data.get('preview'):
        content += '<p class="project-layout-note">Template layout preview · sample content and media panels</p>'
    content += '<div class="project-container"><h1 class="project-title">'+escape(data['title'])+'</h1>'+media(cover,folder,hero=True)+overview(copy)+'</div>'
    content += '<div class="project-container">'+''.join(section(block,folder,i) for i,block in enumerate(blocks))+'</div>'
    nav = []
    by_id = {item['id']:item for item in portfolio['projects']}
    for key,default in [('previous','Back to work'),('next','All work')]:
        item = by_id.get(data.get(key),{})
        href = item.get('href') or './index.html#work'
        label = item.get('menuTitle') or default
        external = ' target="_blank" rel="noopener"' if href.startswith('http') else ''
        nav.append('<a href="'+escape(href)+'"'+external+' aria-label="'+escape(('Previous project: ' if key=='previous' else 'Next project: ')+label)+'">'+('<span aria-hidden="true">←</span>' if key=='previous' else '')+escape(label)+('<span aria-hidden="true">→</span>' if key=='next' else '')+'</a>')
    content += '<div class="project-container"><nav class="project-navigation" aria-label="More projects">'+''.join(nav)+'</nav></div>'
    output = ROOT/data.get('output',folder.name+'.html')
    if output.parent!=ROOT: raise ValueError('Project pages must be built in the website root.')
    page = Template((ROOT/'templates/project.html').read_text()).substitute(PAGE_TITLE=escape(data['title']),DESCRIPTION=escape(data.get('description',data['title']+' — '+portfolio['firstName']+' '+portfolio['lastName'])),PROJECT_ID=escape(data.get('id',folder.name)),CONTENT=content)
    output.write_text(page)
    print(output.name+': '+str(len(blocks))+' content sections, '+str(sum(map(len,groups.values())))+' numbered media files')

if __name__=='__main__':
    result = subprocess.run(['node','-e',"global.window={};require('./content.js');process.stdout.write(JSON.stringify(window.PORTFOLIO))"],cwd=ROOT,capture_output=True,text=True,check=True)
    portfolio = json.loads(result.stdout)
    folders = [ROOT/'projects'/name for name in sys.argv[1:]] if sys.argv[1:] else sorted(folder.parent for folder in (ROOT/'projects').glob('*/project.json'))
    for folder in folders: build(folder,portfolio)
