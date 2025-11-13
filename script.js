/* ========= Loader + Boot ========= */
const percentEl = document.getElementById('percent');
const barEl = document.getElementById('bar');
const loaderWrap = document.getElementById('loaderWrap');
const app = document.getElementById('app');

let progress = 0;
function fakeLoadStep(){
  progress += Math.floor(Math.random()*7)+6;
  if(progress > 100) progress = 100;
  percentEl.textContent = progress + '%';
  barEl.style.width = progress + '%';
  if(progress < 100){
    setTimeout(fakeLoadStep, 180 + Math.random()*260);
  } else {
    // finished
    setTimeout(() => {
      loaderWrap.style.opacity = '0';
      loaderWrap.style.pointerEvents = 'none';
      app.hidden = false;
      setTimeout(()=> loaderWrap.style.display='none', 600);
      initPage(); // start page features
    }, 500);
  }
}
fakeLoadStep();

/* ========= Page Init ========= */
function initPage(){
  initParticles();
  initNav();
  initHeroSlides();
  initSectionObserver();
  initMapInteractions();
  initCelebrate();
}

/* ========= Particles Background ========= */
function initParticles(){
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');
  let W = canvas.width = innerWidth;
  let H = canvas.height = innerHeight;
  window.addEventListener('resize', ()=>{W = canvas.width = innerWidth; H = canvas.height = innerHeight});

  const particles = [];
  const COUNT = Math.floor((W*H)/60000) * 30 + 60; // scale with screen
  for(let i=0;i<COUNT;i++){
    particles.push({
      x: Math.random()*W,
      y: Math.random()*H,
      r: Math.random()*1.8 + 0.6,
      vx: (Math.random()-0.5)*0.25,
      vy: (Math.random()-0.5)*0.25,
      hue: 120 + Math.random()*60,
      alpha: 0.05 + Math.random()*0.25
    });
  }

  let mouse = {x:-9999,y:-9999};
  window.addEventListener('mousemove', (e)=>{mouse.x=e.clientX;mouse.y=e.clientY});
  window.addEventListener('mouseleave', ()=>{mouse.x=-9999;mouse.y=-9999});

  function draw(){
    ctx.clearRect(0,0,W,H);
    // subtle gradient overlay
    const g = ctx.createLinearGradient(0,0,W,H);
    g.addColorStop(0, 'rgba(2,20,12,0.12)');
    g.addColorStop(1, 'rgba(0,0,0,0.2)');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,W,H);

    for(let p of particles){
      p.x += p.vx;
      p.y += p.vy;
      // wrap
      if(p.x < -10) p.x = W + 10;
      if(p.x > W + 10) p.x = -10;
      if(p.y < -10) p.y = H + 10;
      if(p.y > H + 10) p.y = -10;

      // attraction to mouse
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if(dist < 120){
        p.vx += (dx/dist)*0.04;
        p.vy += (dy/dist)*0.04;
      } else {
        // gentle stabilization
        p.vx *= 0.995;
        p.vy *= 0.995;
      }

      // draw
      ctx.beginPath();
      ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${p.alpha})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fill();
    }

    // connecting lines (subtle)
    for(let i=0;i<COUNT;i++){
      for(let j=i+1;j<i+5;j++){ // limit connections for perf
        const a = particles[i];
        const b = particles[j];
        const dx = a.x-b.x; const dy = a.y-b.y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if(d < 90){
          ctx.beginPath();
          ctx.strokeStyle = `rgba(100,255,170,${0.06*(1 - d/90)})`;
          ctx.lineWidth = 1;
          ctx.moveTo(a.x,a.y);
          ctx.lineTo(b.x,b.y);
          ctx.stroke();
