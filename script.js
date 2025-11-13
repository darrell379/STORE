/* script.js - complete & robust (no loading errors) */

/* Utility: safe query */
const $ = (s, ctx = document) => (ctx || document).querySelector(s);
const $$ = (s, ctx = document) => Array.from((ctx || document).querySelectorAll(s));

/* ===== Loader (fixed, robust) ===== */
const loaderWrap = $('#loaderWrap');
const percentEl = loaderWrap ? loaderWrap.querySelector('.percent') || $('#percent') : $('#percent');
const barEl = loaderWrap ? loaderWrap.querySelector('#bar') || $('#bar') : $('#bar');

let progress = 0;
function bootProgress(){
  try {
    progress += Math.floor(Math.random()*8) + 6;
    if(progress > 100) progress = 100;
    if(percentEl) percentEl.textContent = progress + '%';
    if(barEl) barEl.style.width = progress + '%';
    if(progress < 100){
      setTimeout(bootProgress, 160 + Math.random()*240);
    } else {
      setTimeout(() => {
        if(loaderWrap){
          loaderWrap.style.transition = 'opacity .6s ease';
          loaderWrap.style.opacity = '0';
          loaderWrap.style.pointerEvents = 'none';
          setTimeout(()=> { if(loaderWrap && loaderWrap.parentElement) loaderWrap.parentElement.removeChild(loaderWrap); }, 700);
        }
        initPage(); // start features after loader
      }, 400);
    }
  } catch (err){
    // in case of unexpected error, hide loader gracefully
    console.error('Loader error:', err);
    if(loaderWrap){ loaderWrap.style.display = 'none'; }
    initPage();
  }
}
bootProgress();

/* ===== Init page after load ===== */
function initPage(){
  initParticles();        // background particles
  initNavLinks();         // smooth nav
  initSectionObserver();  // reveal on scroll
  enhanceProfiles();      // click-to-modal profiles
  initConfettiTrigger();  // celebration if click header title
  // small UX: focus top to ensure scroll starts at top
  window.scrollTo(0,0);
}

/* ================= Particles Background (futuristic neon dots + lines) ================= */
function initParticles(){
  const canvas = document.getElementById('particleCanvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = canvas.width = innerWidth;
  let H = canvas.height = innerHeight;
  window.addEventListener('resize', ()=>{ W = canvas.width = innerWidth; H = canvas.height = innerHeight; });

  const COUNT = Math.max(60, Math.floor((W*H)/90000));
  const particles = Array.from({length:COUNT}).map(()=>({
    x: Math.random()*W,
    y: Math.random()*H,
    r: Math.random()*1.6 + 0.6,
    vx: (Math.random()-0.5)*0.5,
    vy: (Math.random()-0.5)*0.5,
    hue: 120 + Math.random()*60,
    alpha: 0.06 + Math.random()*0.28
  }));

  let mouse = {x:-9999, y:-9999};
  window.addEventListener('mousemove', e=>{ mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('mouseleave', ()=>{ mouse.x = -9999; mouse.y = -9999; });

  function frame(){
    ctx.clearRect(0,0,W,H);
    // soft vignette background
    const g = ctx.createLinearGradient(0,0,W,H);
    g.addColorStop(0, 'rgba(2,20,12,0.09)');
    g.addColorStop(1, 'rgba(0,0,0,0.16)');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,W,H);

    // draw particles
    for(let p of particles){
      p.x += p.vx; p.y += p.vy;
      if(p.x < -10) p.x = W + 10; if(p.x > W + 10) p.x = -10;
      if(p.y < -10) p.y = H + 10; if(p.y > H + 10) p.y = -10;

      const dx = p.x - mouse.x; const dy = p.y - mouse.y;
      const d = Math.sqrt(dx*dx + dy*dy);
      if(d < 120){
        p.vx += (dx/d)*0.03;
        p.vy += (dy/d)*0.03;
      } else { p.vx *= 0.995; p.vy *= 0.995; }

      ctx.beginPath();
      ctx.fillStyle = `hsla(${p.hue}, 72%, 60%, ${p.alpha})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fill();
    }

    // subtle connecting lines for nearby particles
    for(let i=0;i<particles.length;i++){
      for(let j=i+1;j<i+4;j++){
        const a = particles[i]; const b = particles[j];
        if(!b) continue;
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if(dist < 80){
          ctx.beginPath();
          ctx.strokeStyle = `rgba(110,255,170,${0.06*(1 - dist/80)})`;
          ctx.lineWidth = 1;
          ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke(
