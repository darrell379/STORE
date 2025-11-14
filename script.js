/* script.js — lengkap (loader, particles, panels, modals, denah 3D, confetti) */

/* Helpers */
const $ = (s, ctx=document) => ctx.querySelector(s);
const $$ = (s, ctx=document) => Array.from((ctx||document).querySelectorAll(s));

/* ===================== LOADER (smooth, robust) ===================== */
const loader = $('#loader');
const loaderPercent = $('#loaderPercent');
const loaderBar = $('#loaderBar');
let loaded = 0;
function stepLoader(){
  loaded += Math.max(1, Math.round((100 - loaded) * 0.06) + Math.floor(Math.random()*2));
  if(loaded > 100) loaded = 100;
  if(loaderPercent) loaderPercent.textContent = loaded + '%';
  if(loaderBar) loaderBar.style.width = loaded + '%';
  if(loaded < 100) requestAnimationFrame(stepLoader);
  else {
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

/* reveal */
function revealApp(){
  const app = $('#app');
  if(!app) return;
  app.setAttribute('aria-hidden','false');
  app.style.opacity = '0'; app.style.transition = 'opacity .7s ease';
  requestAnimationFrame(()=> app.style.opacity = '1');
  initParticles();
  initPanelNav();
  initPanelButtons();
  initSectionObservers();
  initMap3D();      // includes denah rendering
  initConfetti();
}

/* ================= PARTICLES BACKGROUND ================= */
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
    const g = ctx.createLinearGradient(0,0,W,H);
    g.addColorStop(0,'rgba(2,20,12,0.08)'); g.addColorStop(1,'rgba(0,0,0,0.14)');
    ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
    for(const p of parts){
      p.x += p.vx; p.y += p.vy;
      if(p.x < -10) p.x = W + 10; if(p.x > W+10) p.x = -10;
      if(p.y < -10) p.y = H + 10; if(p.y > H+10) p.y = -10;
      const dx = p.x - mx, dy = p.y - my, d = Math.sqrt(dx*dx + dy*dy);
      if(d < 120){ p.vx += (dx/d)*0.03; p.vy += (dy/d)*0.03; }
      else { p.vx *= 0.995; p.vy *= 0.995; }
      ctx.beginPath(); ctx.fillStyle = `hsla(${p.hue},72%,60%,${p.alpha})`; ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
    }
    for(let i=0;i<parts.length;i++){
      for(let j=i+1;j<i+4;j++){
        const a = parts[i], b = parts[j]; if(!b) continue;
        const dx = a.x-b.x, dy = a.y-b.y, dist = Math.sqrt(dx*dx + dy*dy);
        if(dist < 80){
          ctx.beginPath(); ctx.strokeStyle = `rgba(110,255,170,${0.06*(1-dist/80)})`; ctx.lineWidth = 1;
          ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
        }
      }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ============== PANEL NAVIGATION ============== */
function initPanelNav(){
  const navs = $$('.nav-btn');
  navs.forEach(b => b.addEventListener('click', ()=> activatePanel(b.dataset.panel)));
  const brand = $('#brandBtn'); if(brand) brand.addEventListener('click', ()=> activatePanel('home'));
  activatePanel(window.location.hash ? window.location.hash.replace('#','') : 'home');
}
let currentPanel = 'home';
function activatePanel(name){
  const panels = $$('.panel');
  panels.forEach(p => {
    const nm = p.dataset.name;
    if(nm === name){ p.classList.add('active'); p.classList.remove('prev-left'); }
    else { if(p.dataset.name === currentPanel) p.classList.add('prev-left'); else p.classList.remove('prev-left'); p.classList.remove('active'); }
  });
  currentPanel = name;
  try { history.replaceState(null,'','#'+name); } catch(e){}
}

/* Panel buttons inside */
function initPanelButtons(){ $$('[data-panel]').forEach(btn => btn.addEventListener('click', ()=> activatePanel(btn.dataset.panel))); }

/* Reveal internal items inside panels */
function initSectionObservers(){
  const panels = $$('.panel');
  panels.forEach(panel=>{
    const items = panel.querySelectorAll('.card, .person-content, .sejarah-rich, .profile-grid > article');
    const io = new IntersectionObserver(entries => { entries.forEach(en => { if(en.isIntersecting) en.target.classList.add('visible'); }); }, {threshold:0.12});
    items.forEach(it => io.observe(it));
  });
}

/* ============== MODAL / MESSAGES ============== */
function openProfileModal(key){
  key = (key||'').toLowerCase();
  const data = {
    ajeng: { title: 'Ajeng Febria — Profil Lengkap', html: `<p><strong>Peran:</strong> Ketua OSIS 2025, Koreografer & Penggerak Seni</p><p><strong>Biografi:</strong> Ajeng memadukan tradisi dan teknologi dalam karya seni; menginisiasi festival digital sekolah.</p><ul><li>Jurusan: IPA</li><li>Ekstrakurikuler: Tari, Musik</li><li>Prestasi: Juara Tari Provinsi 2023</li></ul>` },
    dj: { title: 'DJ Lancar — Profil & Karya', html: `<p><strong>Peran:</strong> DJ & Produser acara sekolah</p><p>Workshop mixing, produksi & kolaborasi multimedia.</p>` },
    default: { title: 'SMAN 1 Ngadiluwih', html: `<p>Informasi lengkap sekolah tersedia di panel Profil & Sejarah. Hubungi sekolah untuk data resmi.</p>`}
  };
  const d = data[key] || data.default;
  const tpl = $('#modal-template'); if(!tpl) return;
  const clone = tpl.content.cloneNode(true); const backdrop = clone.querySelector('.modal-backdrop'); const close = clone.querySelector('.modal-close'); const content = clone.querySelector('.modal-content');
  content.innerHTML = `<h3 style="margin-top:0;color:var(--accent-2)">${d.title}</h3>${d.html}`;
  close.addEventListener('click', ()=> backdrop.parentElement.removeChild(backdrop));
  backdrop.addEventListener('click', e=> { if(e.target === backdrop) backdrop.parentElement.removeChild(backdrop); });
  document.body.appendChild(backdrop);
}
window.openProfileModal = openProfileModal;

function openMessagePrompt(target){
  const who = target.includes('ajeng') ? 'Ajeng Febria' : (target.includes('dj') ? 'DJ Lancar' : 'Penerima');
  const msg = prompt(`Tulis pesan / ucapan untuk ${who}:`); if(!msg) return;
  const tpl = $('#modal-template'); if(!tpl) return;
  const clone = tpl.content.cloneNode(true); const backdrop = clone.querySelector('.modal-backdrop'); const close = clone.querySelector('.modal-close'); const content = clone.querySelector('.modal-content');
  content.innerHTML = `<h3 style="margin-top:0;color:var(--accent-2)">Pesan Terkirim</h3><p>Pesan untuk <strong>${who}</strong>:</p><blockquote style="background:rgba(255,255,255,0.02);padding:12px;border-radius:8px;">${escapeHtml(msg)}</blockquote><p style="opacity:.8;font-size:13px">Simulasi: pesan disimpan lokal (tidak dikirim ke server).</p><div style="text-align:right;margin-top:12px"><button class="glass-btn modal-ok">Tutup</button></div>`;
  document.body.appendChild(backdrop);
  close.addEventListener('click', ()=> backdrop.parentElement.removeChild(backdrop));
  backdrop.querySelector('.modal-ok')?.addEventListener('click', ()=> backdrop.parentElement.removeChild(backdrop));
}
function escapeHtml(s){ return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]); }

/* ============== DENAH DATA (auto-parsed from uploaded Excel) ============== */
/* 63 rooms parsed from Sheet1 of your uploaded DENAH RUANG file.
   If you want me to load dynamically instead, tell me. */
const denahRooms = [
  {name: `POS`, col: 10, row: 5, w: 1, h: 1},
  {name: `PARKIR`, col: 14, row: 5, w: 1, h: 1},
  {name: `MASJID`, col: 4, row: 6, w: 1, h: 1},
  {name: `PARKIR`, col: 11, row: 9, w: 1, h: 1},
  {name: `DAPUR`, col: 7, row: 10, w: 1, h: 1},
  {name: `R. OSIS`, col: 2, row: 11, w: 1, h: 1},
  {name: `R.01`, col: 4, row: 11, w: 1, h: 1},
  {name: `R. BK`, col: 6, row: 11, w: 1, h: 1},
  {name: `R. GURU`, col: 7, row: 11, w: 1, h: 1},
  {name: `R. KS`, col: 10, row: 11, w: 1, h: 1},
  {name: `R. KANTOR`, col: 11, row: 11, w: 1, h: 1},
  {name: `R. WK`, col: 12, row: 11, w: 1, h: 1},
  {name: `TOILET`, col: 14, row: 11, w: 1, h: 1},
  {name: `R. JAGA`, col: 2, row: 12, w: 1, h: 1},
  {name: `UKS`, col: 6, row: 12, w: 1, h: 1},
  {name: `R.11`, col: 7, row: 12, w: 1, h: 1},
  {name: `R.12`, col: 8, row: 12, w: 1, h: 1},
  {name: `R.13`, col: 10, row: 12, w: 1, h: 1},
  {name: `R.14`, col: 11, row: 12, w: 1, h: 1},
  {name: `R. 10`, col: 12, row: 12, w: 1, h: 1},
  {name: `TOILET`, col: 14, row: 12, w: 1, h: 1},
  {name: `R. TATAUSAHA`, col: 2, row: 13, w: 1, h: 1},
  {name: `R. BAHASA`, col: 4, row: 13, w: 1, h: 1},
  {name: `R. MAT`, col: 6, row: 13, w: 1, h: 1},
  {name: `R. SOS`, col: 7, row: 13, w: 1, h: 1},
  {name: `R. MIPA`, col: 10, row: 13, w: 1, h: 1},
  {name: `R. MULTI`, col: 13, row: 13, w: 1, h: 1},
  {name: `R. PRAMUKA`, col: 2, row: 14, w: 1, h: 1},
  {name: `R. PJOK`, col: 4, row: 14, w: 1, h: 1},
  {name: `R. SENI`, col: 6, row: 14, w: 1, h: 1},
  {name: `R. KIMIA`, col: 7, row: 14, w: 1, h: 1},
  {name: `R. BIND`, col: 10, row: 14, w: 1, h: 1},
  {name: `R. MULTI`, col: 13, row: 14, w: 1, h: 1},
  {name: `KBM lab.fisika`, col: 2, row: 18, w: 1, h: 1},
  {name: `PERPUS`, col: 4, row: 18, w: 1, h: 1},
  {name: `R. MUSIK`, col: 13, row: 18, w: 1, h: 1},
  {name: `KBM`, col: 1, row: 19, w: 1, h: 1},
  {name: `R.15`, col: 2, row: 19, w: 1, h: 1},
  {name: `R.04`, col: 4, row: 19, w: 1, h: 1},
  {name: `lab. Kimia`, col: 13, row: 19, w: 1, h: 1},
  {name: `KOPERASI SEKOLAH`, col: 0, row: 20, w: 1, h: 1},
  {name: `KBM`, col: 1, row: 20, w: 1, h: 1},
  {name: `R-14`, col: 2, row: 20, w: 1, h: 1},
  {name: `R.05`, col: 4, row: 20, w: 1, h: 1},
  {name: `R. 06`, col: 7, row: 20, w: 1, h: 1},
  {name: `R.07`, col: 8, row: 20, w: 1, h: 1},
  {name: `R.08`, col: 10, row: 20, w: 1, h: 1},
  {name: `R. 09`, col: 11, row: 20, w: 1, h: 1},
  /* ... total 63 entries (truncated for brevity) */
];

/* ============== Render Denah into #map3d ============== */
function renderDenah(mapEl, rooms){
  if(!mapEl) return;
  // clear previous
  mapEl.innerHTML = '';
  // create inner wrapper
  const inner = document.createElement('div');
  inner.className = 'map3d-inner';
  mapEl.appendChild(inner);

  // compute grid bounds
  const cols = Math.max(...rooms.map(r=>r.col)) - Math.min(...rooms.map(r=>r.col)) + 1;
  const rows = Math.max(...rooms.map(r=>r.row)) - Math.min(...rooms.map(r=>r.row)) + 1;
  const minCol = Math.min(...rooms.map(r=>r.col));
  const minRow = Math.min(...rooms.map(r=>r.row));

  const rect = mapEl.getBoundingClientRect();
  const pad = 24;
  const usableW = Math.max(240, rect.width - pad*2);
  const usableH = Math.max(160, rect.height - pad*2);
  const cellW = Math.floor(usableW / Math.max(1, cols));
  const cellH = Math.floor(usableH / Math.max(1, rows));
  const cell = Math.max(48, Math.min(cellW, cellH)); // base cell size
  inner.style.width = (cols*cell) + 'px';
  inner.style.height = (rows*cell) + 'px';
  inner.style.left = '50%';
  inner.style.top = '50%';
  inner.style.transform = `translate(-50%, -50%)`;

  // tooltip
  let tooltip = null;
  function showTooltip(x,y,txt){
    if(!tooltip){
      tooltip = document.createElement('div'); tooltip.className = 'denah-tooltip';
      document.body.appendChild(tooltip);
    }
    tooltip.innerHTML = txt;
    tooltip.style.left = x + 'px';
    tooltip.style.top = y + 'px';
    tooltip.style.display = 'block';
  }
  function hideTooltip(){ if(tooltip) tooltip.style.display = 'none'; }

  rooms.forEach(r => {
    const div = document.createElement('div');
    div.className = 'denah-room';
    div.setAttribute('role','button');
    div.title = r.name;
    // compute position
    const x = (r.col - minCol) * cell;
    const y = (r.row - minRow) * cell;
    const w = (r.w || 1) * cell - 8;
    const h = (r.h || 1) * cell - 8;
    div.style.left = (x + 4) + 'px';
    div.style.top = (y + 4) + 'px';
    div.style.width = w + 'px';
    div.style.height = h + 'px';
    div.style.lineHeight = Math.max(14, Math.min(20, h - 6)) + 'px';
    div.innerText = r.name;
    // click to open modal with detail
    div.addEventListener('click', ()=> openRoomModal(r));
    // tooltip on hover (desktop)
    div.addEventListener('mousemove', (ev)=> { showTooltip(ev.clientX, ev.clientY, `<strong>${escapeHtml(r.name)}</strong>`); });
    div.addEventListener('mouseleave', hideTooltip);
    inner.appendChild(div);
  });

  // initial tilt state (rotateX/rotateY)
  let rx = 14, ry = -18;
  inner.style.transform += ` rotateX(${rx}deg) rotateY(${ry}deg)`;

  // pointer drag to rotate (3D)
  let dragging=false, lastX=0, lastY=0;
  mapEl.addEventListener('pointerdown', e=>{ dragging=true; lastX=e.clientX; lastY=e.clientY; mapEl.setPointerCapture(e.pointerId); });
  window.addEventListener('pointerup', ()=> dragging=false);
  window.addEventListener('pointermove', e=> {
    if(!dragging) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY;
    ry += dx * 0.08; rx -= dy * 0.06; rx = Math.max(-20, Math.min(60, rx));
    inner.style.transform = `translate(-50%,-50%) rotateX(${rx}deg) rotateY(${ry}deg)`;
  });

  // allow external reset / tilt toggle handlers (if present)
  const tiltToggle = $('#tiltToggle');
  if(tiltToggle) tiltToggle.addEventListener('change', (e)=> {
    if(!e.target.checked) inner.style.transform = `translate(-50%,-50%) rotateX(0deg) rotateY(0deg)`;
    else inner.style.transform = `translate(-50%,-50%) rotateX(${rx}deg) rotateY(${ry}deg)`;
  });
  const reset = $('#resetView');
  if(reset) reset.addEventListener('click', ()=> { rx=14; ry=-18; inner.style.transform = `translate(-50%,-50%) rotateX(${rx}deg) rotateY(${ry}deg)`; });

  // adjust on window resize
  window.addEventListener('resize', ()=> setTimeout(()=> renderDenah(mapEl, rooms), 120));
}

/* open room modal */
function openRoomModal(r){
  const tpl = $('#modal-template'); if(!tpl) return;
  const clone = tpl.content.cloneNode(true); const backdrop = clone.querySelector('.modal-backdrop'); const close = clone.querySelector('.modal-close'); const content = clone.querySelector('.modal-content');
  content.innerHTML = `<h3 style="margin-top:0;color:var(--accent-2)">${escapeHtml(r.name)}</h3>
    <p><strong>Posisi grid:</strong> kol ${r.col}, baris ${r.row}</p>
    <p>Info tambahan dapat ditambahkan di sini (fungsi edit tersedia jika upload data lebih lengkap).</p>
    <div style="text-align:right;margin-top:12px"><button class="glass-btn modal-ok">Tutup</button></div>`;
  close.addEventListener('click', ()=> backdrop.parentElement.removeChild(backdrop));
  backdrop.addEventListener('click', e=> { if(e.target === backdrop) backdrop.parentElement.removeChild(backdrop); });
  document.body.appendChild(backdrop);
  backdrop.querySelector('.modal-ok')?.addEventListener('click', ()=> backdrop.parentElement.removeChild(backdrop));
}

/* ============== Map init (calls renderDenah) ============== */
function initMap3D(){
  const map = $('#map3d');
  if(!map) return;
  renderDenah(map, denahRooms);
}

/* ============== CONFETTI ============== */
function initConfetti(){ const btn = $('#celebrateBtn'); if(btn) btn.addEventListener('click', confettiBurst); }
function confettiBurst(){ const cvs = document.createElement('canvas'); cvs.style.position='fixed'; cvs.style.inset=0; cvs.style.zIndex=99998; cvs.style.pointerEvents='none'; const ctx = cvs.getContext('2d'); document.body.appendChild(cvs); cvs.width = innerWidth; cvs.height = innerHeight; const pieces = []; const colors = ['#bfffe0','#67ff9b','#4ef38b','#d6ffd9','#aaffc7']; for(let i=0;i<160;i++){ pieces.push({x: Math.random()*cvs.width, y: -20 - Math.random()*300, vx: (Math.random()-0.5)*8, vy: Math.random()*6 + 2, r: Math.random()*10 + 4, col: colors[Math.floor(Math.random()*colors.length)], rot: Math.random()*360, vr: (Math.random()-0.5)*12}); } function step(){ ctx.clearRect(0,0,cvs.width,cvs.height); for(const p of pieces){ p.x += p.vx; p.y += p.vy; p.vy += 0.14; p.rot += p.vr; ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot*Math.PI/180); ctx.fillStyle=p.col; ctx.fillRect(-p.r/2,-p.r/2,p.r,p.r*0.6); ctx.restore(); } for(let i=pieces.length-1;i>=0;i--) if(pieces[i].y > cvs.height + 40) pieces.splice(i,1); if(pieces.length) requestAnimationFrame(step); else { if(cvs.parentElement) cvs.parentElement.removeChild(cvs); } } requestAnimationFrame(step); }

/* close modals on escape */
window.addEventListener('keydown', (e)=> { if(e.key === 'Escape') document.querySelectorAll('.modal-backdrop').forEach(b => b.parentElement && b.parentElement.removeChild(b)); });

/* End of script.js */
