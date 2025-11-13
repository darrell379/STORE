/* script.js - final: robust loading + particles + UI behaviors */

/* small helpers */
const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

/* LOADER (smooth, no-bug) */
const loader = $('#loader');
const loaderPercent = $('#loaderPercent') || $('#loaderPercent');
const loaderBar = $('#loaderBar') || $('#loaderBar');
let loaded = 0;
let loadStart = performance.now();

// Smooth progress using RAF and ease
function animateLoader() {
  // increase loaded toward 100 with easing
  loaded += Math.max(1, Math.round((100 - loaded) * 0.06 + (Math.random() * 2)));
  if(loaded > 100) loaded = 100;
  if(loaderPercent) loaderPercent.textContent = loaded + '%';
  if(loaderBar) loaderBar.style.width = loaded + '%';

  if(loaded < 100) {
    requestAnimationFrame(animateLoader);
  } else {
    // final micro-delay then reveal
    setTimeout(() => {
      // fade out loader
      if(loader) {
        loader.style.transition = 'opacity .6s ease, transform .6s ease';
        loader.style.opacity = '0';
        loader.style.transform = 'translateY(-20px) scale(.995)';
        setTimeout(()=> {
          if(loader.parentElement) loader.parentElement.removeChild(loader);
          revealApp();
        }, 700);
      } else revealApp();
    }, 300);
  }
}
requestAnimationFrame(animateLoader);

/* Reveal main app content */
function revealApp(){
  const app = $('#app');
  if(!app) return;
  app.setAttribute('aria-hidden','false');
  app.style.opacity = '0';
  app.style.transition = 'opacity .7s ease';
  requestAnimationFrame(()=> { app.style.opacity = '1'; initPage(); });
}

/* INIT PAGE when loader done */
function initPage(){
  initParticles();
  initNav();
  initReveal();
  initProfiles();
  initMap3D();
  initConfettiTriggers();
  // header logo click shows confetti
  const headerLogo = $('#headerLogo');
  if(headerLogo) headerLogo.addEventListener('click', ()=> confettiBurst());
}

/* ---------- PARTICLES (neon dots + lines) ---------- */
function initParticles(){
  const canvas = $('#particleCanvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = canvas.width = innerWidth;
  let H = canvas.height = innerHeight;
  window.addEventListener('resize', ()=> { W = canvas.width = innerWidth; H = canvas.height = innerHeight; });

  const COUNT = Math.max(60, Math.floor((W*H)/90000));
  const particles = [];
  for(let i=0;i<COUNT;i++){
    particles.push({
      x: Math.random()*W,
      y: Math.random()*H,
      r: Math.random()*1.6 + 0.6,
      vx: (Math.random()-0.5)*0.6,
      vy: (Math.random()-0.5)*0.6,
      hue: 120 + Math.random()*60,
      alpha: 0.06 + Math.random()*0.28
    });
  }

  let mx = -9999, my = -9999;
  window.addEventListener('mousemove', e=> { mx = e.clientX; my = e.clientY; });
  window.addEventListener('mouseleave', ()=> { mx = -9999; my = -9999; });

  function frame(){
    ctx.clearRect(0,0,W,H);
    // soft background overlay
    const g = ctx.createLinearGradient(0,0,W,H);
    g.addColorStop(0, 'rgba(2,20,12,0.08)');
    g.addColorStop(1, 'rgba(0,0,0,0.14)');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,W,H);

    // draw particles
    for(let p of particles){
      p.x += p.vx; p.y += p.vy;
      if(p.x < -10) p.x = W + 10; if(p.x > W + 10) p.x = -10;
      if(p.y < -10) p.y = H + 10; if(p.y > H + 10) p.y = -10;

      // mouse attraction
      const dx = p.x - mx, dy = p.y - my; const d = Math.sqrt(dx*dx + dy*dy);
      if(d < 120){
        p.vx += (dx/d)*0.03;
        p.vy += (dy/d)*0.03;
      } else { p.vx *= 0.995; p.vy *= 0.995; }

      ctx.beginPath();
      ctx.fillStyle = `hsla(${p.hue},72%,60%,${p.alpha})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fill();
    }

    // subtle lines
    for(let i=0;i<particles.length;i++){
      for(let j=i+1;j<i+4;j++){
        const a = particles[i], b = particles[j];
        if(!b) continue;
        const dx = a.x - b.x, dy = a.y - b.y, dist = Math.sqrt(dx*dx + dy*dy);
        if(dist < 80){
          ctx.beginPath();
          ctx.strokeStyle = `rgba(110,255,170,${0.06*(1 - dist/80)})`;
          ctx.lineWidth = 1;
          ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ---------- NAV (smooth) ---------- */
function initNav(){
  // header links that point to anchors
  $$('.main-nav a').forEach(a=>{
    a.addEventListener('click', (e)=>{
      e.preventDefault();
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
    });
  });

  // hero CTA buttons
  $$('.glass-btn').forEach(btn=>{
    btn.addEventListener('click', ()=> {
      const t = btn.dataset.target;
      if(t){
        const el = document.getElementById(t);
        if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
      }
    });
  });
}

/* ---------- Reveal on scroll ---------- */
function initReveal(){
  const secs = $$('.section');
  if(!secs.length) return;
  const obs = new IntersectionObserver(entries=>{
    entries.forEach(en => {
      if(en.isIntersecting) en.target.classList.add('visible');
    });
  }, {threshold: 0.18});
  secs.forEach(s => obs.observe(s));
}

/* ---------- Profiles & modal ---------- */
function initProfiles(){
  // image click open modal
  $$('.profile-card img').forEach(img=>{
    img.addEventListener('click', ()=> {
      const parent = img.closest('.profile-card');
      const name = parent ? (parent.querySelector('h3')?.textContent || '').toLowerCase() : '';
      openProfileModal(name);
    });
  });

  // profile buttons already wired in HTML call openInfo/openMessagePrompt
}

/* open modal with content */
function openProfileModal(key){
  key = (key || '').toLowerCase();
  const data = {
    'ajeng febria': {
      title: 'Ajeng Febria — Profil Lengkap',
      html: `<p><strong>Peran:</strong> Ketua OSIS 2025, Koreografer & Aktivis Seni</p>
             <p><strong>Biografi:</strong> Ajeng memimpin proyek seni besar, mentor, dan menginisiasi festival digital. Ia memadukan tradisi dan teknologi dalam karya seni.</p>
             <ul><li>Jurusan: IPA</li><li>Ekstrakurikuler: Tari, Musik</li><li>Prestasi: Juara Tari Provinsi 2023</li></ul>`
    },
    'ajeng': null,
    'dj lancar': {
      title: 'DJ Lancar — Profil & Karya',
      html: `<p><strong>Peran:</strong> DJ & Produser acara sekolah</p>
             <p><strong>Ringkasan:</strong> DJ Lancar memfasilitasi workshop produksi, mengorganisir komunitas musik, dan menghadirkan nuansa modern di setiap acara Dies.</p>
             <ul><li>Genre: EDM / Chill House</li><li>Aktivitas: Workshop mixing & produksi</li><li>Performa: Dies Natalis 2022 & 2024</li></ul>`
    },
    'dj': null,
    '': {
      title: 'SMAN 1 Ngadiluwih',
      html: `<p><strong>Sejarah & Visi:</strong> Didirikan 1982, bertransformasi menjadi sekolah berbasis teknologi dan karakter. Visi: menjadi sekolah unggul berprestasi dan berintegritas.</p>
             <p><strong>Prestasi & Program:</strong> Prestasi di bidang sains, seni, dan olahraga; program coding, kewirausahaan, serta ekstrakurikuler beragam.</p>`
    }
  };
  data['ajeng'] = data['ajeng febria'];
  data['dj'] = data['dj lancar'];

  const d = data[key] || data[''];
  const tpl = $('#modal-template');
  if(!tpl) return;
  const clone = tpl.content.cloneNode(true);
  const backdrop = clone.querySelector('.modal-backdrop');
  const card = clone.querySelector('.modal-card');
  const close = clone.querySelector('.modal-close');
  const content = clone.querySelector('.modal-content');
  content.innerHTML = `<h3 style="margin-top:0;color:var(--accent-2)">${d.title}</h3><div>${d.html}</div>`;
  close.addEventListener('click', ()=> { if(backdrop.parentElement) backdrop.parentElement.removeChild(backdrop); });
  backdrop.addEventListener('click', e => { if(e.target === backdrop) backdrop.parentElement.removeChild(backdrop); });
  document.body.appendChild(backdrop);
}

/* message prompt */
function openMessagePrompt(target){
  const display = target.includes('ajeng') ? 'Ajeng Febria' : (target.includes('dj') ? 'DJ Lancar' : 'Penerima');
  const msg = prompt(`Tulis pesan / ucapan untuk ${display}:`);
  if(!msg) return;
  // show confirmation modal
  const tpl = $('#modal-template');
  if(!tpl) return;
  const clone = tpl.content.cloneNode(true);
  const backdrop = clone.querySelector('.modal-backdrop');
  const content = clone.querySelector('.modal-content');
  backdrop.querySelector('.modal-close').addEventListener('click', ()=> backdrop.parentElement.removeChild(backdrop));
  content.innerHTML = `<h3 style="margin-top:0;color:var(--accent-2)">Pesan untuk ${display}</h3>
    <p>${escapeHtml(msg)}</p><div style="text-align:right;margin-top:12px"><button class="glass-btn modal-ok">Tutup</button></div>`;
  document.body.appendChild(backdrop);
  const ok = document.querySelector('.modal-ok');
  if(ok) ok.addEventListener('click', ()=> { if(backdrop.parentElement) backdrop.parentElement.removeChild(backdrop); });
}
function escapeHtml(s){ return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]); }

/* ---------- Map 3D interactions (drag rotate) ---------- */
function initMap3D(){
  const map = $('#map3d');
  if(!map) return;
  let dragging=false, lastX=0, lastY=0, rx=14, ry=-18;
  map.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
  map.addEventListener('pointerdown', (e)=> { dragging=true; lastX=e.clientX; lastY=e.clientY; map.setPointerCapture(e.pointerId); });
  window.addEventListener('pointerup', ()=> dragging=false);
  window.addEventListener('pointermove', (e)=> {
    if(!dragging) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY;
    ry += dx * 0.08; rx -= dy * 0.06;
    rx = Math.max(-10, Math.min(60, rx));
    map.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
  });
  const tiltToggle = $('#tiltToggle');
  if(tiltToggle) tiltToggle.addEventListener('change', (e)=> { if(!e.target.checked) map.style.transform = 'rotateX(0deg) rotateY(0deg)'; else map.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`; });
  const reset = $('#resetView');
  if(reset) reset.addEventListener('click', ()=> { rx=14; ry=-18; map.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`; });
}

/* ---------- Confetti ---------- */
function initConfettiTriggers(){
  const btn = $('#celebrateBtn');
  if(btn) btn.addEventListener('click', ()=> confettiBurst());
}
function confettiBurst(){
  const cvs = document.createElement('canvas'); cvs.style.position='fixed'; cvs.style.inset=0; cvs.style.zIndex=99998; cvs.style.pointerEvents='none';
  const ctx = cvs.getContext('2d'); document.body.appendChild(cvs);
  cvs.width = innerWidth; cvs.height = innerHeight;
  const pieces = []; const colors = ['#bfffe0','#67ff9b','#4ef38b','#d6ffd9','#aaffc7'];
  for(let i=0;i<160;i++){
    pieces.push({x: Math.random()*cvs.width, y: -20 - Math.random()*300, vx: (Math.random()-0.5)*8, vy: Math.random()*6 + 2, r: Math.random()*10 + 4, col: colors[Math.floor(Math.random()*colors.length)], rot: Math.random()*360, vr: (Math.random()-0.5)*12});
  }
  function step(){
    ctx.clearRect(0,0,cvs.width,cvs.height);
    for(const p of pieces){ p.x += p.vx; p.y += p.vy; p.vy += 0.14; p.rot += p.vr; ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot*Math.PI/180); ctx.fillStyle=p.col; ctx.fillRect(-p.r/2,-p.r/2,p.r,p.r*0.6); ctx.restore(); }
    for(let i=pieces.length-1;i>=0;i--) if(pieces[i].y > cvs.height + 40) pieces.splice(i,1);
    if(pieces.length) requestAnimationFrame(step); else { if(cvs.parentElement) cvs.parentElement.removeChild(cvs); }
  }
  requestAnimationFrame(step);
}

/* fallback: close modals on ESC */
window.addEventListener('keydown', e=> { if(e.key === 'Escape') document.querySelectorAll('.modal-backdrop').forEach(b => b.parentElement && b.parentElement.removeChild(b)); });
