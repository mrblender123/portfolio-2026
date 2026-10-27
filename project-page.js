/* Main-film playback and native gallery controls. */
(() => {
  const films = [...document.querySelectorAll('[data-film]')];
  films.forEach(frame => {
    const video = frame.querySelector('video');
    const button = frame.querySelector('.project-film-start');
    const status = frame.querySelector('[role=status]');
    let started = false;
    const update = () => {
      const playing = !video.paused && !video.ended;
      button.hidden = playing;
    };
    // Native controls remain a working fallback when JavaScript is unavailable.
    video.controls = false;
    button.hidden = false;
    button.addEventListener('click', () => {
      if (!started || video.ended) video.currentTime = 0;
      video.muted = false;
      video.volume = 1;
      video.controls = true;
      status.textContent = '';
      const playback = video.play();
      if (playback) playback.catch(() => {
        status.textContent = 'The film could not start. Please try Play again.';
        update();
      });
    });
    video.addEventListener('play', () => {
      films.forEach(other => { if (other !== frame) other.querySelector('video').pause(); });
      started = true;
      if (document.activeElement === button) video.focus({preventScroll:true});
      update();
    });
    video.tabIndex = 0;
    ['pause','ended'].forEach(event => video.addEventListener(event, update));
    update();
  });

  document.querySelectorAll('[data-project-gallery]').forEach(gallery => {
    const track = gallery.querySelector('.project-gallery-track');
    const slides = [...track.children];
    const previous = gallery.querySelector('[data-gallery-previous]');
    const next = gallery.querySelector('[data-gallery-next]');
    const status = gallery.querySelector('[role=status]');
    let index = 0;
    const update = () => {
      index = slides.reduce((best,slide,i) => Math.abs(slide.offsetLeft-track.scrollLeft-track.offsetLeft) < Math.abs(slides[best].offsetLeft-track.scrollLeft-track.offsetLeft) ? i : best,0);
      previous.disabled = index === 0;
      next.disabled = index === slides.length - 1;
      status.textContent = `${index + 1} / ${slides.length}`;
      slides.forEach((slide,i) => slide.setAttribute('aria-label',`Slide ${i+1} of ${slides.length}`));
    };
    const move = delta => {
      const slide = slides[Math.max(0,Math.min(slides.length-1,index+delta))];
      track.scrollTo({left:slide.offsetLeft-track.offsetLeft,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    };
    previous.addEventListener('click',() => move(-1));
    next.addEventListener('click',() => move(1));
    track.addEventListener('keydown',event => {
      if(event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();move(event.key === 'ArrowRight' ? 1 : -1);
      }
    });
    track.addEventListener('scroll',update,{passive:true});
    new ResizeObserver(update).observe(track);
    update();
  });
})();
