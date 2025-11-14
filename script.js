/* Panel single-page JS: loader, particles, panel navigation, modals, denah interaction, confetti */

/* Helpers */
const $ = (s, ctx=document) => ctx.querySelector(s);
const $$ = (s, ctx=document) => Array.from((ctx||document).querySelectorAll(s));

/* ===== LOADER (robust & smooth) ===== */
const loader = $('#loader');
const loaderPercent = $('#loaderPercent');
const loaderBar = $('#loaderBar');

let loaded = 0;
function stepLoader(){
  // easing towards 100
  loaded += Math.max(1, Math.round((100 - loaded) * 0.06) + Math.floor(Math.random()*2));
  if(loaded > 100) loaded = 100;
  if(loaderPercent) loaderPercent.textContent = loaded + '%';
  if(loaderBar) loaderBar.style.width = loaded + '%';

  if(loaded < 100){
    requestAnimationFrame(stepLoader);
  } else {
    setTimeout(()=> {
      if(loader){
        loader.style.opacity = '0';
        loader.style.transform = 'translateY(-12px)';
        setTimeout(()=> { if(loader.parentElement) loader.parentElement.removeChild(loader); revealApp(); }, 650);
      } else revealApp();
    }, 250);
  }
}
requestAnimationFrame(stepLoader);

function revealApp(){
  const app = $('#app');
  if(!app) return;
  app.setAttribute('aria-hidden','false');
  app.style.opacity = '0';
  app.style.transition = 'opacity .7s ease';
  requestAnimationFrame(()=> app.style.opacity = '1');
  // init features
  initParticles();
  initPanelNav();
  initPanelButtons();
  initSectionObservers(); // for internal reveals in panels
  initMap3D();
  initConfetti();
}

/* ===== PARTICLES (neon dots + connecting lines) ===== */
function initParticles(){
  const canvas = $('#particleCanvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = canvas.width = innerWidth;
  let H = canvas.height = innerHeight;
  window.addEventListener('resize', ()=> { W = canvas.width = innerWidth; H = canvas.height = innerHeight; });

  const COUNT = Math.max(60, Math.floor((W*H)/90000));
  const parts = Array.from({length:COUNT}).map(()=>({
    x: Math.random()*W, y: Math.random()*H,
    r: Math.random()*1.6+0.6, vx:(Math.random()-0.5)*0.6, vy:(Math.random()-0.5)*0.6,
    hue:120 + Math.random()*60, alpha:0.06 + Math.random()*0.28
  }));

  let mx=-9999, my=-9999;
  window.addEventListener('mousemove', e=>{ mx=e.clientX; my=e.clientY; });
  window.addEventListener('mouseleave', ()=>{ mx=-9999; my=-9999; });

  function frame(){
    ctx.clearRect(0,0,W,H);
    // soft background overlay
    const g = ctx.createLinearGradient(0,0,W,H);
    g.addColorStop(0,'rgba(2,20,12,0.08)'); g.addColorStop(1,'rgba(0,0,0,0.14)');
    ctx.fillStyle = g; ctx.fillRect(0,0,W,H);

    for(const p of parts){
      p.x += p.vx; p.y += p.vy;
      if(p.x < -10) p.x = W + 10; if(p.x > W+10) p.x = -10;
      if(p.y < -10) p.y = H + 10; if(p.y > H+10) p.y = -10;

      const dx = p.x - mx, dy = p.y - my, d = Math.sqrt(dx*dx + dy*dy);
      if(d < 120){
        p.vx += (dx/d)*0.03; p.vy += (dy/d)*0.03;
      } else { p.vx *= 0.995; p.vy *= 0.995; }

      ctx.beginPath();
      ctx.fillStyle = `hsla(${p.hue},72%,60%,${p.alpha})`;
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
    }

    // subtle lines
    for(let i=0;i<parts.length;i++){
      for(let j=i+1;j<i+4;j++){
        const a = parts[i], b = parts[j]; if(!b) continue;
        const dx = a.x-b.x, dy = a.y-b.y, dist=Math.sqrt(dx*dx + dy*dy);
        if(dist < 80){
          ctx.beginPath();
          ctx.strokeStyle = `rgba(110,255,170,${0.06*(1-dist/80)})`;
          ctx.lineWidth = 1; ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
        }
      }
    }

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ===== Panel navigation (slide panels) ===== */
function initPanelNav(){
  const navs = $$('.nav-btn');
  navs.forEach(b=>{
    b.addEventListener('click', ()=> activatePanel(b.dataset.panel));
  });

  // brand click -> home
  const brand = $('#brandBtn');
  if(brand) brand.addEventListener('click', ()=> activatePanel('home'));

  // set initial active
  activatePanel('home');
}

let currentPanel = 'home';
function activatePanel(name){
  const panels = $$('.panel');
  panels.forEach(p=>{
    const nm = p.dataset.name;
    if(nm === name){
      p.classList.add('active'); p.classList.remove('prev-left');
    } else {
      // set prev-left for previous active (subtle)
      if(p.dataset.name === currentPanel) p.classList.add('prev-left'); else p.classList.remove('prev-left');
      p.classList.remove('active');
    }
  });
  currentPanel = name;
  // update URL hash (non-breaking)
  try { history.replaceState(null, '', '#'+name); } catch(e){}
  // focus first heading for accessibility
  const active = document.querySelector(`.panel[data-name="${name}"]`);
  if(active) active.querySelector('h2, h1')?.focus?.();
}

/* ===== Panel buttons inside (data-panel) ===== */
function initPanelButtons(){
  // any button with data-panel
  $$('[data-panel]').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      const dest = btn.dataset.panel;
      if(dest) activatePanel(dest);
    });
  });
}

/* ===== Reveal items inside panels (when panel becomes active) ===== */
function initSectionObservers(){
  const panels = $$('.panel');
  panels.forEach(panel=>{
    const items = panel.querySelectorAll('.card, .person-content, .sejarah-rich, .profile-grid > article');
    const io = new IntersectionObserver(entries=>{
      entries.forEach(en=>{
        if(en.isIntersecting) en.target.classList.add('visible');
      });
    }, {threshold:0.12});
    items.forEach(it=> io.observe(it));
  });
}

/* ===== PROFILE modal & message prompt ===== */
function openProfileModal(key){
  key = (key||'').toLowerCase();
  const data = {
    ajeng: {
      title:'Ajeng Febria — Profil Lengkap',
      html:`<p><strong>Peran:</strong> Ketua OSIS 2025, Koreografer & Penggerak Seni</p>
            <p><strong>Biografi:</strong> Ajeng memadukan tradisi dan teknologi dalam karya seni; menginisiasi festival digital sekolah.</p>
            <ul><li>Jurusan: IPA</li><li>Ekstrakurikuler: Tari, Musik</li><li>Prestasi: Juara Tari Provinsi 2023</li></ul>`
    },
    dj: {
      title:'DJ Lancar — Profil & Karya',
      html:`<p><strong>Peran:</strong> DJ & Produser acara sekolah</p>
            <p><strong>Ringkasan:</strong> DJ Lancar menyelenggarakan workshop mixing dan memimpin komunitas musik siswa.</p>
            <ul><li>Genre: EDM / Chill House</li><li>Aktivitas: Workshop & Perform</li></ul>`
    },
    default:{
      title:'SMAN 1 Ngadiluwih',
      html:`<p>Informasi lengkap sekolah tersedia di panel Profil & Sejarah. Hubungi sekolah untuk data resmi.</p>`
    }
  };
  const d = data[key] || data.default;
  const tpl = $('#modal-template');
  if(!tpl) return;
  const clone = tpl.content.cloneNode(true);
  const backdrop = clone.querySelector('.modal-backdrop');
  const close = clone.querySelector('.modal-close');
  const content = clone.querySelector('.modal-content');
  content.innerHTML = `<h3 style="margin-top:0;color:var(--accent-2)">${d.title}</h3>${d.html}`;
  close.addEventListener('click', ()=> backdrop.parentElement.removeChild(backdrop));
  backdrop.addEventListener('click', e=> { if(e.target === backdrop) backdrop.parentElement.removeChild(backdrop); });
  document.body.appendChild(backdrop);
}
window.openProfileModal = openProfileModal;

function openMessagePrompt(target){
  const who = target.includes('ajeng') ? 'Ajeng Febria' : (target.includes('dj') ? 'DJ Lancar' : 'Penerima');
  const msg = prompt(`Tulis pesan / ucapan untuk ${who}:`);
  if(!msg) return;
  const tpl = $('#modal-template');
  if(!tpl) return;
  const clone = tpl.content.cloneNode(true);
  const backdrop = clone.querySelector('.modal-backdrop');
  const close = clone.querySelector('.modal-close');
  const content = clone.querySelector('.modal-content');
  content.innerHTML = `<h3 style="margin-top:0;color:var(--accent-2)">Pesan Terkirim</h3>
    <p>Pesan untuk <strong>${who}</strong>:</p><blockquote style="background:rgba(255,255,255,0.02);padding:12px;border-radius:8px;">${escapeHtml(msg)}</blockquote>
    <p style="opacity:.8;font-size:13px">Simulasi: pesan disimpan lokal (tidak dikirim ke server).</p>
    <div style="text-align:right;margin-top:12px"><button class="glass-btn modal-ok">Tutup</button></div>`;
  document.body.appendChild(backdrop);
  close.addEventListener('click', ()=> backdrop.parentElement.removeChild(backdrop));
  backdrop.querySelector('.modal-ok')?.addEventListener('click', ()=> backdrop.parentElement.removeChild(backdrop));
}
window.openMessagePrompt = openMessagePrompt;
function escapeHtml(s){ return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]); }

/* ===== MAP 3D interactions ===== */
function initMap3D(){
  const map = $('#map3d');
  if(!map) return;
  let dragging=false, lastX=0, lastY=0, rx=14, ry=-18;
  map.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
  map.addEventListener('pointerdown', e=>{ dragging=true; lastX=e.clientX; lastY=e.clientY; map.setPointerCapture(e.pointerId); });
  window.addEventListener('pointerup', ()=> dragging=false);
  window.addEventListener('pointermove', e=> {
    if(!dragging) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY; lastX=e.clientX; lastY=e.clientY;
    ry += dx * 0.08; rx -= dy * 0.06;
    rx = Math.max(-10, Math.min(60, rx));
    map.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
  });
  const tiltToggle = $('#tiltToggle');
  if(tiltToggle) tiltToggle.addEventListener('change', e=>{
    if(!e.target.checked) map.style.transform = 'rotateX(0deg) rotateY(0deg)';
    else map.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
  });
  const reset = $('#resetView');
  if(reset) reset.addEventListener('click', ()=> { rx=14; ry=-18; map.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`; });
}

/* ===== CONFETTI ===== */
function initConfetti(){
  const btn = $('#celebrateBtn');
  if(btn) btn.addEventListener('click', confettiBurst);
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

/* ===== Accessibility: close modals on ESC ===== */
window.addEventListener('keydown', (e)=> {
  if(e.key === 'Escape') document.querySelectorAll('.modal-backdrop').forEach(b => b.parentElement && b.parentElement.removeChild(b));
});

/* End of script.js */
/* ============================= */
/*        DENAH POPUP JS         */
/* ============================= */

function openDenah() {
    const popup = document.getElementById("denahPopup");
    const img = document.getElementById("popupImg");
    img.src = "assets/denah_foto3d.png";
    popup.style.display = "block";
}

function closeDenah() {
   // OPEN 3D DENAH  
function openDenah3D() {
    window.open("https://chat.z.ai/space/y0rnz93nb001-art", "_blank");
}

}

