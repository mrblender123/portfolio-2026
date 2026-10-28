/* Shared portfolio behavior. No Framer runtime or external scripts required. */
(() => {
  'use strict';
  const site = window.PORTFOLIO;
  const isAbout = document.body.dataset.page === 'about';
  const isProject = document.body.dataset.page === 'project';
  const pageProject = isProject ? site.projects.find(project => project.id === document.body.dataset.project) : null;
  const homeUrl = isAbout || isProject ? './index.html' : '#hero';
  const all = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 1200px)');
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const link = (text, href, className) => {
    const node = el('a', className, text); node.href = href;
    if (/^https?:/.test(href)) { node.target = '_blank'; node.rel = 'noopener'; }
    return node;
  };

  // Clear only entrance-animation offsets. Percentage translations and rotations
  // position the artwork and must survive initialization.
  all('[style]').forEach(node => {
    const hasEntranceOffset = /translateY\([^)]*px\)/.test(node.style.transform);
    if (hasEntranceOffset && node.style.opacity !== '' && Number(node.style.opacity) < 1) {
      node.style.opacity = '1';
      node.style.transform = node.style.transform.replace(/translateY\([^)]*px\)/g, '').trim();
    }
  });
  const caseTitle = pageProject?.menuTitle || document.body.dataset.projectTitle;
  document.title = `${isAbout ? 'About — ' : isProject && caseTitle ? caseTitle + ' — ' : ''}${site.firstName} ${site.lastName}`;
  document.querySelector('meta[name=description]').content = pageProject
    ? `${pageProject.menuTitle} — a design project by ${site.firstName} ${site.lastName}.`
    : `${site.firstName} ${site.lastName} — ${site.introLead} ${site.intro}`;
  const hero = document.querySelector('#hero');
  if (hero && !isAbout && !isProject) {
    hero.classList.add('home-hero');
    const inner = el('div','home-hero-inner');
    const copy = el('div','home-hero-copy');
    const heading = el('h1','home-hero-name');
    heading.append(el('span','',site.firstName.toUpperCase()),el('span','',site.lastName.toUpperCase()));
    const intro = el('p','home-hero-intro');
    intro.append(el('strong','',site.introLead+' '),document.createTextNode(site.intro+' '),link(site.email,`mailto:${site.email}`));
    copy.append(heading,intro,link(site.heroButton,`mailto:${site.email}`,'home-hero-contact'));
    const media = el('figure','home-hero-media');
    const video = el('video');
    video.src = site.heroMedia.video; video.poster = site.heroMedia.poster;
    video.muted = true; video.loop = true; video.playsInline = true; video.preload = 'auto';
    video.width = 1920; video.height = 1080; video.setAttribute('aria-label',site.heroMedia.alt);
    media.append(video); inner.append(copy,media); hero.replaceChildren(inner);
  }
  all('.framer-118s05h p').forEach(p => {
    const lead = el('strong', '', site.introLead + ' ');
    lead.style.fontFamily = 'PP Neue Montreal Bold';
    const email = el('strong', '', site.email); email.style.fontFamily = 'PP Neue Montreal Bold';
    const intro = el('strong', 'framer-text', site.intro + ' ');
    p.replaceChildren(lead, intro, email);
  });
  all('a[href^="mailto:"]').forEach(a => {
    a.href = `mailto:${site.email}`;
    if (a.textContent.includes('@')) a.textContent = site.email;
  });
  all('.framer-15ftbch-container .framer-15dlpq1 p').forEach(p => p.textContent = site.heroButton);
  all('.framer-9p9dh2-container .framer-15dlpq1 p').forEach(p => p.textContent = site.footerButton);
  all('.framer-19um4ar p').forEach(p => {
    const emphasis = el('span', 'framer-text', site.philosophyEmphasis); emphasis.style.color = '#212514';
    const words = site.philosophy.split('into visuals');
    // Keep the reference's intentional desktop line break.
    const desktopVariant = Boolean(p.querySelector('br'));
    p.replaceChildren(document.createTextNode(words[0]));
    if (words.length > 1) {
      if (desktopVariant) p.append(el('br'));
      p.append(document.createTextNode('into visuals' + words.slice(1).join('into visuals')));
    }
    p.append(emphasis, document.createTextNode('.'));
  });
  all('.framer-nfeni0 p').forEach(p => {
    p.replaceChildren(document.createTextNode(site.availability + ' '),link(site.email,`mailto:${site.email}`,'framer-text'));
    if (site.linkedin) p.append(document.createTextNode(' or drop a message: '),link(`${site.firstName} ${site.lastName}`,site.linkedin,'framer-text'),document.createTextNode(' on Linkedin'));
  });

  if (isAbout) {
    document.querySelector('.framer-1uo7mgz').setAttribute('role','main');
    document.querySelector('.framer-mzx553 p').textContent = site.about.label;
    const aboutHeading = document.querySelector('.framer-iubjsj p');
    aboutHeading.setAttribute('role','heading'); aboutHeading.setAttribute('aria-level','1');
    const headingSpans = aboutHeading.querySelectorAll('span');
    headingSpans[0].textContent = site.about.headline;
    headingSpans[headingSpans.length - 1].textContent = site.about.introduction;
    const biography = document.querySelector('.framer-1jhzsyd p');
    biography.replaceChildren();
    site.about.paragraphs.forEach((paragraph,index) => {
      if (index) biography.append(el('br','framer-text'),el('br','framer-text'));
      paragraph.forEach(part => biography.append(typeof part === 'string'
        ? document.createTextNode(part) : el('strong','about-emphasis',part.emphasis)));
    });
    document.querySelector('.framer-15dlpq1 p').textContent = site.about.button;
  }

  // Personal wordmark with semantic, keyboard-accessible navigation.
  const header = el('header','site-header');
  const navInner = el('div','nav-inner');
  const logo = link(`${site.firstName} ${site.lastName}`,homeUrl,'site-logo'); logo.setAttribute('aria-label','Home');
  const toggle = el('button','menu-toggle'); toggle.type = 'button'; toggle.setAttribute('aria-label','Open menu'); toggle.setAttribute('aria-expanded','false'); toggle.setAttribute('aria-controls','site-nav'); toggle.append(el('span'));
  const nav = el('nav','site-nav'); nav.id = 'site-nav'; nav.setAttribute('aria-label','Main navigation');
  const work = el('div','work-menu');
  const workToggle = el('button','work-toggle','WORK'); workToggle.type = 'button'; workToggle.setAttribute('aria-expanded','false'); workToggle.setAttribute('aria-controls','work-list'); workToggle.append(el('span','chevron'));
  const workList = el('div','work-list'); workList.id = 'work-list'; workList.inert = true;
  site.projects.forEach(project => {
    if (project.hidden) return;
    const item = link('',project.href || `mailto:${site.email}`);
    const image = el('img'); image.src = project.image; image.alt = ''; item.append(image, el('span','',project.menuTitle)); workList.append(item);
  });
  work.append(workToggle,workList);
  const aboutLink = link('ABOUT',site.aboutUrl);
  if (isAbout) aboutLink.setAttribute('aria-current','page');
  nav.append(link('HOME',homeUrl,'mobile-home'),work,aboutLink);
  if (site.linkedin) nav.append(link('LINKEDIN',site.linkedin));
  nav.append(link('EMAIL',`mailto:${site.email}`));
  navInner.append(logo,toggle,nav); header.append(navInner);
  document.querySelector('.framer-1tvqxqd-container,.framer-1qefhim-container').replaceWith(header);
  let menuOpen = false, workOpen = false, openedByHover = false, pointerTimer;
  function setWork(open) { workOpen = open; work.classList.toggle('is-open',open); workToggle.setAttribute('aria-expanded',String(open)); workList.inert = !open; }
  function setMenu(open) {
    menuOpen = open; header.classList.toggle('mobile-open',open);
    toggle.setAttribute('aria-expanded',String(open)); toggle.setAttribute('aria-label',open ? 'Close menu':'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
    if (!open) setWork(false);
  }
  toggle.addEventListener('click',()=>setMenu(!menuOpen));
  workToggle.addEventListener('click',()=>{
    if (openedByHover) { openedByHover=false; setWork(true); }
    else setWork(!workOpen);
  });
  work.addEventListener('pointerenter',()=>{
    clearTimeout(pointerTimer);
    if(desktop.matches) { openedByHover=!workOpen; setWork(true); }
  });
  work.addEventListener('pointerleave',()=>{if(desktop.matches) pointerTimer=setTimeout(()=>setWork(false),180);});
  document.addEventListener('click',event=>{if(!work.contains(event.target)) setWork(false);});
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape') {
      if(workOpen) { setWork(false); workToggle.focus(); }
      else if(menuOpen) { setMenu(false); toggle.focus(); }
    }
    if(event.key==='Tab' && menuOpen) {
      const focusable=all('a,button',header).filter(e=>e.getClientRects().length&&!e.closest('[inert]'));
      if(event.shiftKey && document.activeElement===focusable[0]) {event.preventDefault();focusable.at(-1).focus();}
      else if(!event.shiftKey && document.activeElement===focusable.at(-1)) {event.preventDefault();focusable[0].focus();}
    }
  });
  header.addEventListener('click',event=>{if(event.target.closest('a')) setMenu(false);});
  header.addEventListener('focusout',()=>requestAnimationFrame(()=>{if(!work.contains(document.activeElement)&&!work.matches(':hover')) setWork(false);}));
  desktop.addEventListener('change',()=>setMenu(false));

  // Project content retains the original responsive layout and art direction.
  const titleSelectors=['.framer-1u1pmrd','.framer-16xtaev','.framer-ysascz','.framer-1mrbflt','.framer-f2q8p7','.framer-lv75vo'];
  const descriptionSelectors=['.framer-1t5w591','.framer-1b4zltz','.framer-hxtrij','.framer-65vtzf','.framer-1eug3gt','.framer-1aanatc'];
  site.projects.forEach((project,index)=>{
    const cards=all(index===5?'.framer-8bwrpg':`a[data-project="${project.id}"]`);
    cards.forEach(card=>{
      if (project.hidden) { card.remove(); return; }
      if(project.href && card.tagName!=='A') {
        const anchor=el('a');
        [...card.attributes].forEach(attribute=>anchor.setAttribute(attribute.name,attribute.value));
        anchor.append(...card.childNodes);
        card.replaceWith(anchor);card=anchor;
      }
      card.classList.add('project-card');
      card.classList.toggle('has-vignette-glow', project.thumbnailEffect === 'vignette-glow');
      card.dataset.projectId = project.id;
      if(project.href) {
        card.href=project.href;
        if (!/^https?:/.test(project.href)) { card.removeAttribute('target'); card.removeAttribute('rel'); }
      }
      all(`${titleSelectors[index]} p`,card).forEach(p=>p.textContent=project.title);
      all(`${descriptionSelectors[index]} p`,card).forEach(p=>p.textContent=project.description);
      const tags=card.querySelector('[data-framer-name="Frame 5"]');
      if(tags && !project.tags.length) tags.remove();
      if(tags && project.tags.length) [...tags.children].forEach((group,i)=>all('p',group).forEach(p=>p.textContent=project.tags[i]||''));
      all('img',card).forEach(image=>{image.src=project.image;image.alt='';});
      if(project.video && !card.querySelector('video')) {
        all('.framer-paow2q',card).forEach(poster=>{
          const media=el('div','framer-N5zll project-thumbnail-video');
          const video=el('video');
          video.preload='metadata';
          video.setAttribute('aria-label',`${project.title} animated thumbnail`);
          media.append(video);poster.append(media);
        });
      }
      all('video',card).forEach(video=>{
        // Retain the original large-desktop/tablet video crops until media is replaced.
        const original=video.getAttribute('src');
        const isAlternate=['assets/Druye0mdMNYfG73xPfADCk9yE.mp4','assets/PHEMYHPHji0ZzGYPoJAZrNr2jg.mp4'].includes(original);
        const defaultVideo=['assets/cbtroU1oZlZyn7MCaZzU5maVXQ.mp4','assets/Bq7IKttLvDbjn0RLAv7GJTmn8M.mp4'].includes(project.video);
        if(!isAlternate || !defaultVideo) video.src=project.video;
        video.poster=project.image;
        const media=video.closest('.framer-N5zll');media.classList.add('project-media');
        video.addEventListener('loadeddata',()=>video.classList.add('is-ready'));
        if(video.readyState>=2)video.classList.add('is-ready');
        const pause=()=>video.pause();
        media.addEventListener('pointerenter',pause);card.addEventListener('focus',pause);
        media.addEventListener('pointerleave',()=>playVisible(video));card.addEventListener('blur',()=>playVisible(video));
        if(!project.video)media.remove();
      });
      if(index===5){
        card.tabIndex=0;
        card.setAttribute('aria-label',project.title);
        all('.framer-fDg33',card).forEach(node=>node.remove());
        if(project.overlay) {
          card.classList.add('shell-card');
          card.setAttribute('aria-label',`${project.title}. ${project.overlay.replaceAll('\n',' ')}`);
          all('.framer-paow2q',card).forEach(media=>media.append(el('div','shell-overlay',project.overlay)));
        }
      }
    });
  });
  const workSection = document.querySelector('.framer-ykvlyp');
  if (workSection) workSection.id='work';

  const videos=all('video');
  const visibleVideos=new Set();
  function playVisible(video) {
    if(video.dataset.playback==='film'||!visibleVideos.has(video)||reducedMotion.matches||document.hidden||video.closest('.project-card')?.matches(':focus-visible')||video.closest('.project-media')?.matches('.project-card .project-media:hover')) return;
    video.play().catch(()=>{}); // Autoplay restrictions retain the image poster.
  }
  const videoObserver=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting,intersectionRatio})=>{
    if(target.dataset.playback==='film') {
      if(!isIntersecting||intersectionRatio<.15)target.pause();
      return;
    }
    if(isIntersecting&&target.getClientRects().length){visibleVideos.add(target);playVisible(target);}
    else {visibleVideos.delete(target);target.pause();}
  }),{threshold:[.05,.15]});
  videos.forEach(video=>{
    const film=video.dataset.playback==='film';
    if(!film)video.muted=true;
    video.playsInline=true;video.loop=!film;videoObserver.observe(video);
  });
  document.addEventListener('visibilitychange',()=>videos.forEach(video=>document.hidden?video.pause():playVisible(video)));
  reducedMotion.addEventListener('change',()=>videos.forEach(video=>reducedMotion.matches?video.pause():playVisible(video)));

  // Seamless skills and client-logo marquees, measured after fonts are ready.
  const tickers=all('ul').filter(list=>list.querySelector('.ticker-item'));
  tickers.forEach(list=>{
    if(list.closest('.framer-1bkoyq9')) {
      const template=list.querySelector('li');
      if(template)list.replaceChildren(...site.skills.map((skill,index)=>{
        const item=template.cloneNode(true);
        item.removeAttribute('id');
        all('[id]',item).forEach(node=>node.removeAttribute('id'));
        all('p',item).forEach(p=>p.textContent=skill);
        all('[data-framer-name]',item).forEach(node=>node.dataset.framerName=skill);
        item.setAttribute('aria-hidden','false');
        item.setAttribute('aria-posinset',String(index+1));
        item.setAttribute('aria-setsize',String(site.skills.length));
        return item;
      }));
    }
    const items=[...list.children];
    items.forEach(item=>{const copy=item.cloneNode(true);copy.setAttribute('aria-hidden','true');copy.inert=true;all('[id]',copy).forEach(n=>n.removeAttribute('id'));list.append(copy);});
    list.classList.add('ticker-track');list.parentElement.classList.add('ticker-window');
    function measure(){
      if(!list.getClientRects().length)return;
      const gap=parseFloat(getComputedStyle(list).gap)||0;
      const distance=items.reduce((sum,item)=>sum+item.getBoundingClientRect().width+gap,0);
      list.style.setProperty('--ticker-distance',`${distance}px`);
      list.style.setProperty('--ticker-duration',`${distance/40}s`);
    }
    new ResizeObserver(measure).observe(list.parentElement);
    document.fonts.ready.then(measure);
  });

  // Reveal the hero and footer gently; static content stays available without JS.
  if(!reducedMotion.matches){
    const revealObserver=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{
      if(isIntersecting){target.classList.remove('reveal-pending');revealObserver.unobserve(target);}
    }),{threshold:.05});
    all('[data-reveal],.framer-wezipw,.project-card,.framer-qv3dqf').forEach(node=>{
      node.classList.add('reveal','reveal-pending');revealObserver.observe(node);
    });
  }
})();
