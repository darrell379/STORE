/* ================= Loader / Boot ================= */
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
    setTimeout(() => {
      loaderWrap.style.opacity = '0';
      loaderWrap.style.pointerEvents = 'none';
      app.hidden = false;
      setTimeout(()=> loaderWrap.style.display='none', 600);
      initPage();
    }, 500);
  }
}
fakeLoadStep();

/* ================= Initialize page features ================= */
function initPage(){
  initParticles();
  initNav();
  initHeroSlides();
  initSectionObserver();
  initMapInteractions();
  initCelebrate();
}

/* ================= Particles background ================= */
function initParticles(){
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');
  let W = canvas.width = innerWidth;
  let H = canvas.height = innerHeight;
  window.addEventListener('resize', ()=>{W = canvas.width = innerWidth; H = canvas.height = innerHeight});

  const particles = [];
  const COUNT = Math.max(60, Math.floor((W*H)/90000)); // scale safely
  for(let i=0;i<COUNT;i++){
    particles.push({
      x: Math.random()*W,
      y: Math.random()*H,
      r: Math.random()*1.8 + 0.6,
      vx: (Math.random()-0.5)*0.45,
      vy: (Math.random()-0.5)*0.45,
      hue: 120 + Math.random()*60,
      alpha: 0.06 + Math.random()*0.25
    });
  }

  let mouse = {x:-9999,y:-9999};
  window.addEventListener('mousemove', (e)=>{mouse.x=e.clientX;mouse.y=e.clientY});
  window.addEventListener('mouseleave', ()=>{mouse.x=-9999;mouse.y=-9999});

  function draw(){
    ctx.clearRect(0,0,W,H);
    // subtle vignette
    const g = ctx.createLinearGradient(0,0,W,H);
    g.addColorStop(0, 'rgba(2,20,12,0.09)');
    g.addColorStop(1, 'rgba(0,0,0,0.16)');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,W,H);

    for(let p of particles){
      p.x += p.vx; p.y += p.vy;
      if(p.x < -10) p.x = W + 10;
      if(p.x > W + 10) p.x = -10;
      if(p.y < -10) p.y = H + 10;
      if(p.y > H + 10) p.y = -10;

      // attraction to mouse
      const dx = p.x - mouse.x; const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if(dist < 120){
        p.vx += (dx/dist)*0.03;
        p.vy += (dy/dist)*0.03;
      } else {
        p.vx *= 0.995; p.vy *= 0.995;
      }

      // draw dot
      ctx.beginPath();
      ctx.fillStyle = `hsla(${p.hue}, 70%, 60%, ${p.alpha})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fill();
    }

    // lines (light)
    for(let i=0;i<COUNT;i++){
      for(let j=i+1;j<i+4;j++){
        const a = particles[i]; const b = particles[j];
        if(!b) continue;
        const dx = a.x-b.x; const dy = a.y-b.y; const d = Math.sqrt(dx*dx + dy*dy);
        if(d < 80){
          ctx.beginPath();
          ctx.strokeStyle = `rgba(110,255,170,${0.06*(1 - d/80)})`;
          ctx.lineWidth = 1;
          ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
}

/* ================= Navigation & smooth scroll ================= */
function initNav(){
  document.querySelectorAll('.nav-btn, .glass-btn').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      const t = btn.dataset.target;
      if(t) scrollToSection(t);
    });
  });
  function scrollToSection(id){
    const el = document.getElementById(id);
    if(!el) return;
    el.scrollIntoView({behavior:'smooth', block:'start'});
    // active state
    document.querySelectorAll('.nav-btn').forEach(n=>n.classList.remove('active'));
    const nav = Array.from(document.querySelectorAll('.nav-btn')).find(n=>n.dataset.target===id);
    if(nav) nav.classList.add('active');
  }
}

/* ================= Hero slides ================= */
function initHeroSlides(){
  const slides = document.querySelectorAll('.hero-section .slide');
  const dots = document.querySelectorAll('.dot');
  if(slides.length === 0) return;
  let si = 0;
  function show(i){
    slides.forEach((s, idx)=> s.classList.toggle('active', idx===i));
    dots.forEach((d, idx)=> d.classList.toggle('active', idx===i));
    si = i;
  }
  // fallback if slides not present — still handle dots
  show(0);
  setInterval(()=> show((si+1) % Math.max(slides.length, 1)), 4200);
  dots.forEach((d,i)=> d.addEventListener('click', ()=> show(i)));
}

/* ================= Observe sections appear ================= */
function initSectionObserver(){
  const secs = document.querySelectorAll('.section');
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{
      if(en.isIntersecting) en.target.classList.add('visible');
    });
  }, {threshold: 0.18});
  secs.forEach(s=> obs.observe(s));
}

/* ================= Map 3D interactions ================= */
function initMapInteractions(){
  const map = document.getElementById('map3d');
  if(!map) return;
  let dragging = false, lastX=0, lastY=0, rotX=14, rotY=-18;
  map.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
  map.addEventListener('pointerdown', (e)=>{
    dragging=true; lastX=e.clientX; lastY=e.clientY; map.setPointerCapture(e.pointerId);
  });
  window.addEventListener('pointerup', ()=> dragging=false);
  window.addEventListener('pointermove', (e)=>{
    if(!dragging) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY;
    rotY += dx * 0.08; rotX -= dy * 0.06;
    rotX = Math.max(-10, Math.min(60, rotX));
    map.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
  });
  const tiltToggle = document.getElementById('tiltToggle');
  if(tiltToggle) tiltToggle.addEventListener('change', (e)=>{
    if(!e.target.checked) map.style.transform = `rotateX(0deg) rotateY(0deg)`;
    else map.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
  });
  const reset = document.getElementById('resetView');
  if(reset) reset.addEventListener('click', ()=>{ rotX=14; rotY=-18; map.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`; });
}

/* ================= Modal / Profile / Message ================= */
function openInfo(name){
  const tpl = document.getElementById('modal-template');
  const clone = tpl.content.cloneNode(true);
  const backdrop = clone.querySelector('.modal-backdrop');
  const close = clone.querySelector('.modal-close');
  const content = clone.querySelector('.modal-content');

  if(name === 'ajeng'){
    content.innerHTML = `<h2>Ajeng Febria — Profil Lengkap</h2>
      <p><strong>Peran:</strong> Ketua OSIS, Koreografer, Aktivis Seni</p>
      <p><strong>Ringkasan:</strong> Ajeng memimpin proyek-proyek seni yang melibatkan ratusan siswa. Ia menekankan kreativitas berbasis tradisi dan teknologi.</p>
      <ul><li>Jurusan: IPA</li><li>Prestasi: Juara Tari Provinsi 2023</li><li>Program: Mentor Seni & Workshop Tari</li></ul>`;
  } else if(name === 'dj'){
    content.innerHTML = `<h2>DJ Lancar — Profil & Karya</h2>
      <p><strong>Peran:</strong> DJ event sekolah, Produser & Inisiator Komunitas Musik</p>
      <p><strong>Ringkasan:</strong> DJ Lancar menyatukan komunitas musik siswa melalui workshop, produksi, dan penampilan live.</p>
      <ul><li>Genre: EDM / Chill House</li><li>Aktivitas: Workshop Mixing & Produksi</li><li>Kolaborasi: Multimedia & Tari</li></ul>`;
  } else {
    content.innerHTML = `<p>Informasi belum tersedia.</p>`;
  }

  close.addEventListener('click', ()=> document.body.removeChild(backdrop));
  backdrop.addEventListener('click', (e)=> { if(e.target === backdrop) document.body.removeChild(backdrop); });
  document.body.appendChild(backdrop);
}

function openMessage(name){
  const msg = prompt('Ketik pesan / permintaan untuk ' + (name==='ajeng' ? 'Ajeng' : 'DJ Lancar') + ':');
  if(msg && msg.trim()){
    const tpl = document.getElementById('modal-template');
    const clone = tpl.content.cloneNode(true);
    const backdrop = clone.querySelector('.modal-backdrop');
    const close = clone.querySelector('.modal-close');
    const content = clone.querySelector('.modal-content');
    close.addEventListener('click', ()=> document.body.removeChild(backdrop));
    content.innerHTML = `<h3>Pesan untuk ${name === 'ajeng' ? 'Ajeng' : 'DJ Lancar'}</h3>
      <p>Pesan:</p><blockquote>${escapeHtml(msg)}</blockquote><p><em>Simulasi: pesan tersimpan (tidak benar-benar dikirim)</em></p>`;
    document.body.appendChild(backdrop);
  }
}
function escapeHtml(s){ return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]); }

/* ================= Celebrate / Confetti ================= */
function initCelebrate(){
  const btn = document.getElementById('celebrateBtn');
  if(!btn) return;
  btn.addEventListener('click', ()=> confettiBurst());
}
function confettiBurst(){
  const cvs = document.createElement('canvas'); cvs.style.position='fixed'; cvs.style.inset=0; cvs.style.zIndex=9998; cvs.style.pointerEvents='none';
  const ctx = cvs.getContext('2d'); document.body.appendChild(cvs);
  cvs.width = innerWidth; cvs.height = innerHeight;
  const pieces = []; const colors = ['#bfffe0','#67ff9b','#4ef38b','#d6ffd9','#aaffc7'];
  for(let i=0;i<160;i++){
    pieces.push({x: Math.random()*cvs.width, y: -20 - Math.random()*200, vx: (Math.random()-0.5)*6, vy: Math.random()*6+2, r: Math.random()*8+4, col: colors[Math.floor(Math.random()*colors.length)], rot: Math.random()*360, vr: (Math.random()-0.5)*10});
  }
  function frame(){
    ctx.clearRect(0,0,cvs.width,cvs.height);
    for(const p of pieces){ p.x+=p.vx; p.y+=p.vy; p.vy+=0.12; p.rot+=p.vr; ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot*Math.PI/180); ctx.fillStyle=p.col; ctx.fillRect(-p.r/2,-p.r/2,p.r,p.r*0.6); ctx.restore(); }
    for(let i=pieces.length-1;i>=0;i--) if(pieces[i].y > cvs.height + 40) pieces.splice(i,1);
    if(pieces.length) requestAnimationFrame(frame); else document.body.removeChild(cvs);
  }
  requestAnimationFrame(frame);
}

/* ================= Misc ================= */
window.addEventListener('keydown', (e)=> { if(e.key === 'Escape') document.querySelectorAll('.modal-backdrop').forEach(b=> b.parentElement.removeChild(b)); });
