(function(){
  const $ = (sel, el=document)=>el.querySelector(sel);
  const $$ = (sel, el=document)=>Array.from(el.querySelectorAll(sel));

  // Year
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Scroll-to-top
  const toTop = $('#toTop');
  if (toTop){
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) toTop.classList.add('show'); else toTop.classList.remove('show');
      const nav = document.querySelector('.site-nav'); if (nav){ nav.classList.toggle('scrolled', window.scrollY > 8); }
    });
    toTop.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
  }

  // Nav menu toggle
  const menuBtn = document.querySelector('.menu-toggle');
  const links = document.getElementById('nav-links');
  if (menuBtn && links){
    menuBtn.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
    links.addEventListener('click', (e)=>{
      const t = e.target; if (t && t.tagName === 'A') links.classList.remove('open');
    });
  }

  // Active link on scroll
  const sections = ['home','about','education','skills','projects','certificates','social','contact'].map(id=>document.getElementById(id)).filter(Boolean);
  const navAnchors = $$('.links a');
  const activeObs = new IntersectionObserver((entries)=>{
    entries.forEach(ent=>{
      if(ent.isIntersecting){
        const id = ent.target.id;
        navAnchors.forEach(a=> a.classList.toggle('active', a.getAttribute('href') === '#' + id));
      }
    });
  },{ threshold:0.6 });
  sections.forEach(s=>activeObs.observe(s));

  // Reveal on scroll
  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if (e.isIntersecting){ e.target.classList.add('in'); observer.unobserve(e.target); } });
  },{threshold:0.2});
  $$('.reveal').forEach(el=>observer.observe(el));

  // Radial progress animation
  $$('.skill').forEach((el, i)=>{
    const p = Number(el.getAttribute('data-progress')||'0');
    const radial = $('.radial', el);
    if (!radial) return;
    let cur = 0; const duration = 900; const start = performance.now() + i*90;
    function step(t){
      const k = Math.min(1, (t-start)/duration);
      cur = Math.floor(p * (k<0?0:k));
      radial.style.setProperty('--p', String(cur));
      radial.setAttribute('data-label', cur+'%');
      if (k<1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });

  // Slider
  class Slider{
    constructor(root){
      this.root = root;
      this.slidesWrap = $('.slides', root);
      this.slides = $$('.slide', this.slidesWrap);
      this.prevBtn = $('.prev', root); this.nextBtn = $('.next', root);
      this.dotsWrap = $('.dots', root);
      this.index = 0; this.lock=false;
      this.init();
    }
    init(){
      this.slidesWrap.style.transition = 'transform .6s cubic-bezier(.2,.7,.2,1)';
      // progress bar
      this.progress = document.createElement('div'); this.progress.className='progress';
      this.bar = document.createElement('span'); this.bar.className='bar'; this.progress.appendChild(this.bar); this.root.appendChild(this.progress);
      this.updateDots();
      this.prevBtn.addEventListener('click', ()=>this.go(this.index-1));
      this.nextBtn.addEventListener('click', ()=>this.go(this.index+1));
      this.auto();
      this.bindSwipe();
    }
    update(){ this.slidesWrap.style.transform = `translateX(${-this.index*100}%)`; this.updateDots(); }
    go(n){ if(this.lock) return; const m=this.slides.length; this.index=(n+m)%m; this.lock=true; this.update(); setTimeout(()=>this.lock=false, 620); this.resetAuto(); }
    updateDots(){
      this.dotsWrap.innerHTML='';
      this.slides.forEach((_,i)=>{
        const b=document.createElement('button'); if(i===this.index) b.classList.add('active'); b.addEventListener('click',()=>this.go(i)); this.dotsWrap.appendChild(b);
      });
    }
    auto(){ this.startProgress(); this.timer = setInterval(()=>{ this.startProgress(); this.go(this.index+1); }, 5000); }
    resetAuto(){ clearInterval(this.timer); this.startProgress(); this.auto(); }
    startProgress(){ if(!this.bar) return; this.bar.style.animation='none'; void this.bar.offsetWidth; this.bar.style.animation='progress 5s linear'; }
    bindSwipe(){
      let startX=0, dx=0, active=false;
      const onDown=(e)=>{ active=true; startX=(e.touches?e.touches[0].clientX:e.clientX); };
      const onMove=(e)=>{ if(!active) return; const x=(e.touches?e.touches[0].clientX:e.clientX); dx=x-startX; this.slidesWrap.style.transform=`translateX(calc(${-this.index*100}% + ${dx}px))`; };
      const onUp=()=>{ if(!active) return; active=false; if(Math.abs(dx)>60){ this.go(this.index + (dx<0?1:-1)); } else { this.update(); } dx=0; };
      this.root.addEventListener('mousedown', onDown); this.root.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp);
      this.root.addEventListener('touchstart', onDown, {passive:true}); this.root.addEventListener('touchmove', onMove, {passive:true}); this.root.addEventListener('touchend', onUp);
    }
  }
  $$('[data-slider]').forEach(el=>new Slider(el));

  // 3D tilt on cards
  const tiltTargets = [...$$('.project-card'), ...$$('.cert-card')];
  tiltTargets.forEach(card=>{
    const max = 8; const reset = ()=>{ card.style.transform='perspective(700px) rotateX(0deg) rotateY(0deg)'; };
    card.addEventListener('mousemove', (e)=>{
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      const rx = (-py * max).toFixed(2);
      const ry = (px * max).toFixed(2);
      card.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    card.addEventListener('mouseleave', reset);
    reset();
  });

  // Parallax orbs
  const orbs = $$('.orb');
  if (orbs.length){
    window.addEventListener('mousemove', (e)=>{
      const cx = innerWidth/2, cy = innerHeight/2; const dx = (e.clientX - cx)/cx; const dy = (e.clientY - cy)/cy;
      orbs.forEach((o,i)=>{ const f = i===0?12:(i===1?8:15); o.style.transform = `translate3d(${dx*f}px, ${dy*f}px, 0)`; });
    });
  }

  // Lightbox
  const lightbox = $('#lightbox');
  if (lightbox){
    const img = $('img', lightbox);
    window.__lightbox = {
      open(url){ lightbox.setAttribute('aria-hidden','false'); img.src = url; document.body.style.overflow='hidden'; },
      close(){ lightbox.setAttribute('aria-hidden','true'); img.src=''; document.body.style.overflow=''; }
    };
    lightbox.addEventListener('click', (e)=>{ if(e.target===lightbox) window.__lightbox.close(); });
    $$('[data-lightbox]').forEach(a=>{
      a.addEventListener('click', (e)=>{
        e.preventDefault();
        const thumb = $('.thumb', a);
        const bg = getComputedStyle(thumb).backgroundImage; // e.g., linear-gradient..., url("...")
        const match = bg.match(/url\(("|')?(.*?)\1\)/);
        const url = match ? match[2] : '';
        if (url) window.__lightbox.open(url);
      });
    });
  }

  // Starfield
  const canvas = $('#starfield');
  if (canvas){
    const ctx = canvas.getContext('2d');
    let w=0,h=0, dpr=1; let stars=[]; let t=0;
    const STAR_COUNT = 220;
    function resize(){ dpr = Math.min(2, window.devicePixelRatio||1); w = canvas.width = Math.floor(innerWidth * dpr); h = canvas.height = Math.floor(innerHeight * dpr); canvas.style.width = innerWidth + 'px'; canvas.style.height = innerHeight + 'px'; }
    function makeStar(){ return { x: Math.random()*w, y: Math.random()*h, z: Math.random()*0.5 + 0.5, r: Math.random()*1.6 + .2, tw: Math.random()*2*Math.PI, c: `hsla(${Math.random()*30+220}, 100%, ${Math.random()*40+60}%, ${Math.random()*0.7+0.15})` }; }
    function init(){ stars = Array.from({length:STAR_COUNT}, makeStar); }
    function step(){ t+=0.002; ctx.clearRect(0,0,w,h); ctx.globalCompositeOperation='lighter';
      for (const s of stars){ s.x += (s.z*0.12); if (s.x > w+10) s.x = -10; const twinkle = (1+Math.sin(t*6 + s.tw))/2; ctx.beginPath(); ctx.fillStyle = s.c; ctx.globalAlpha = 0.35 + twinkle*0.35; ctx.arc(s.x, s.y, s.r * dpr, 0, Math.PI*2); ctx.fill(); }
      ctx.globalAlpha = 1; requestAnimationFrame(step);
    }
    resize(); init(); step();
    window.addEventListener('resize', resize);
  }
})();
