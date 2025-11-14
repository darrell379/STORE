/* REPLACE script.js with this file (robust loader + particles + denah embedded) */
/* Helpers */
const $ = (s, ctx=document) => ctx.querySelector(s);
const $$ = (s, ctx=document) => Array.from((ctx||document).querySelectorAll(s));

/* DEBUG OVERLAY */
(function createDebug(){
  if($('#__debug_denah')) return;
  const d = document.createElement('div');
  d.id = '__debug_denah';
  d.style.cssText = 'position:fixed;right:12px;bottom:12px;z-index:999999;padding:8px 10px;border-radius:8px;background:rgba(0,0,0,0.6);color:#bfffe0;font-family:Inter,Arial,sans-serif;font-size:13px;max-width:260px';
  d.innerHTML = '<strong>Status:</strong> Inisialisasi...';
  document.body.appendChild(d);
})();
function dbgSet(txt){ const el = $('#__debug_denah'); if(el) el.innerHTML = `<strong>Status:</strong> ${txt}`; console.log('[DENAH]', txt); }

/* ===== Robust loader (RAF + fallback interval) ===== */
const loaderEl = $('#loader');
const loaderPercentEl = $('#loaderPercent');
const loaderBarEl = $('#loaderBar');
let prog = 0, rafActive = true, fallbackInterval = null;
function setProg(v){ prog = Math.max(prog, Math.min(100, Math.round(v))); if(loaderPercentEl) loaderPercentEl.textContent = prog + '%'; if(loaderBarEl) loaderBarEl.style.width = prog + '%'; }
function finishLoading(){ try{ if(loaderEl){ loaderEl.style.transition = 'opacity .6s, transform .6s'; loaderEl.style.opacity = '0'; loaderEl.style.transform = 'translateY(-12px)'; setTimeout(()=> loaderEl.parentElement && loaderEl.parentElement.removeChild(loaderEl), 650); } revealApp(); }catch(e){ console.error(e); revealApp(); } }

let last = performance.now();
function loaderRAF(){
  try{
    const now = performance.now(); const dt = Math.min(60, now - last); last = now;
    const rem = 100 - prog;
    let step = Math.max(1, Math.round(rem * 0.02) + Math.floor(Math.random()*2));
    step = Math.max(1, Math.round(step * (dt/35)));
    setProg(prog + step);
    if(prog < 100 && rafActive) requestAnimationFrame(loaderRAF);
    else if(prog >= 100) finishLoading();
  }catch(e){
    console.error('loaderRAF error', e); startIntervalFallback();
  }
}
function startIntervalFallback(){
  if(fallbackInterval) return;
  dbgSet('Fallback loader aktif');
  fallbackInterval = setInterval(()=> {
    try{
      const inc = Math.max(1, Math.ceil((100 - prog) * 0.04));
      setProg(prog + inc);
      if(prog >= 100){ clearInterval(fallbackInterval); finishLoading(); }
    }catch(e){ console.error(e); clearInterval(fallbackInterval); setProg(100); finishLoading(); }
  }, 45);
}
try { requestAnimationFrame(loaderRAF); setTimeout(()=> { if(prog <= 2) startIntervalFallback(); }, 2800); dbgSet('Loader dimulai'); } catch(e){ console.error(e); startIntervalFallback(); }

/* reveal */
function revealApp(){
  const app = $('#app');
  if(!app) { dbgSet('APP DOM tidak ditemukan'); return; }
  app.setAttribute('aria-hidden','false'); app.style.opacity = '0'; app.style.transition = 'opacity .6s';
  requestAnimationFrame(()=> app.style.opacity = '1');
  try{ initParticles(); }catch(e){ console.error(e); }
  try{ initPanelNav(); initPanelButtons(); initSectionObservers(); }catch(e){ console.error(e); }
  try{ initMap3D(); }catch(e){ console.error(e); }
  try{ initConfetti(); }catch(e){ console.error(e); }
  dbgSet('Aplikasi siap — mencoba render denah...');
}

/* ========== Particles (unchanged) ========== */
function initParticles(){
  try{
    const canvas = $('#particleCanvas'); if(!canvas) return;
    const ctx = canvas.getContext('2d'); let W=canvas.width=innerWidth, H=canvas.height=innerHeight;
    window.addEventListener('resize', ()=> { W=canvas.width=innerWidth; H=canvas.height=innerHeight; });
    const COUNT = Math.max(60, Math.floor((W*H)/90000));
    const parts = Array.from({length:COUNT}).map(()=>({ x:Math.random()*W, y:Math.random()*H, r:Math.random()*1.6+0.6, vx:(Math.random()-0.5)*0.6, vy:(Math.random()-0.5)*0.6, hue:120+Math.random()*60, alpha:0.06+Math.random()*0.28 }));
    let mx=-9999,my=-9999; window.addEventListener('mousemove', e=>{ mx=e.clientX; my=e.clientY; }); window.addEventListener('mouseleave', ()=>{ mx=-9999; my=-9999; });
    (function f(){ ctx.clearRect(0,0,W,H); const g=ctx.createLinearGradient(0,0,W,H); g.addColorStop(0,'rgba(2,20,12,0.08)'); g.addColorStop(1,'rgba(0,0,0,0.14)'); ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
      for(const p of parts){ p.x+=p.vx; p.y+=p.vy; if(p.x<-10) p.x=W+10; if(p.x>W+10) p.x=-10; if(p.y<-10) p.y=H+10; if(p.y>H+10) p.y=-10; const dx=p.x-mx, dy=p.y-my, d=Math.sqrt(dx*dx+dy*dy); if(d<120){ p.vx+=(dx/d)*0.03; p.vy+=(dy/d)*0.03 } else { p.vx*=0.995; p.vy*=0.995 } ctx.beginPath(); ctx.fillStyle=`hsla(${p.hue},72%,60%,${p.alpha})`; ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill(); }
      for(let i=0;i<parts.length;i++){ for(let j=i+1;j<i+4;j++){ const a=parts[i], b=parts[j]; if(!b) continue; const dx=a.x-b.x, dy=a.y-b.y, dist=Math.sqrt(dx*dx+dy*dy); if(dist<80){ ctx.beginPath(); ctx.strokeStyle=`rgba(110,255,170,${0.06*(1-dist/80)})`; ctx.lineWidth=1; ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke(); } } }
      requestAnimationFrame(f);
    })();
    dbgSet('Particles aktif');
  }catch(e){ console.error('particles err', e); }
}

/* ========== Panel nav minimal ========== */
function initPanelNav(){ try{ $$('.nav-btn').forEach(b=>b.addEventListener('click', ()=> activatePanel(b.dataset.panel))); $('#brandBtn')?.addEventListener('click', ()=> activatePanel('home')); activatePanel(window.location.hash ? window.location.hash.replace('#','') : 'home'); dbgSet('Panel siap'); }catch(e){console.error(e);} }
let currentPanel='home';
function activatePanel(name){ $$('.panel').forEach(p=>{ const nm=p.dataset.name; if(nm===name){ p.classList.add('active'); p.classList.remove('prev-left'); } else { if(p.dataset.name===currentPanel) p.classList.add('prev-left'); else p.classList.remove('prev-left'); p.classList.remove('active'); } }); currentPanel=name; try{ history.replaceState(null,'','#'+name); }catch(e){} }

/* small helpers */
function initPanelButtons(){ try{ $$('[data-panel]').forEach(btn=>btn.addEventListener('click', ()=> activatePanel(btn.dataset.panel))); }catch(e){} }
function initSectionObservers(){ try{ $$('.panel').forEach(panel=>{ const items = panel.querySelectorAll('.card, .person-content, .sejarah-rich, .profile-grid > article'); const io = new IntersectionObserver(entries=>entries.forEach(en=>{ if(en.isIntersecting) en.target.classList.add('visible'); }), {threshold:0.12}); items.forEach(it=>io.observe(it)); }); }catch(e){} }

/* modal */
function openProfileModal(key){ try{ const dmap = { ajeng:{title:'Ajeng Febria', html:'<p>Profil Ajeng</p>'}, dj:{title:'DJ Lancar', html:'<p>Profil DJ</p>'}, default:{title:'SMAN1', html:'<p>Info sekolah</p>'} }; const d = dmap[key]||dmap.default; const tpl = $('#modal-template'); if(!tpl) return; const clone = tpl.content.cloneNode(true); const backdrop = clone.querySelector('.modal-backdrop'); const close = clone.querySelector('.modal-close'); const content = clone.querySelector('.modal-content'); content.innerHTML = `<h3>${d.title}</h3>${d.html}`; close.addEventListener('click', ()=> backdrop.parentElement.removeChild(backdrop)); backdrop.addEventListener('click', e=> { if(e.target === backdrop) backdrop.parentElement.removeChild(backdrop); }); document.body.appendChild(backdrop); }catch(e){console.error(e);} }
window.openProfileModal = openProfileModal;
function openMessagePrompt(target){ try{ const who = target.includes('ajeng') ? 'Ajeng' : (target.includes('dj') ? 'DJ' : 'Penerima'); const msg = prompt(`Kirim pesan ke ${who}:`); if(!msg) return; const tpl = $('#modal-template'); if(!tpl) return; const clone = tpl.content.cloneNode(true); const backdrop = clone.querySelector('.modal-backdrop'); const close = clone.querySelector('.modal-close'); const content = clone.querySelector('.modal-content'); content.innerHTML = `<h3>Pesan terkirim</h3><p>${escapeHtml(msg)}</p><div style="text-align:right"><button class="glass-btn modal-ok">Tutup</button></div>`; document.body.appendChild(backdrop); backdrop.querySelector('.modal-ok')?.addEventListener('click', ()=> backdrop.parentElement.removeChild(backdrop)); }catch(e){console.error(e);} }
function escapeHtml(s){ return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]); }

/* ========== DENAH LOADING: try JSON then fallback (embedded full list) ========== */
async function loadDenah(){
  // try variations of path
  const paths = ['denah_parsed.json','./denah_parsed.json','/denah_parsed.json'];
  for(const p of paths){
    try{
      dbgSet('Mencoba fetch ' + p);
      const r = await fetch(p, {cache:'no-store'});
      if(r.ok){
        const j = await r.json();
        if(j && (Array.isArray(j.rooms) || Array.isArray(j))){
          dbgSet(`denah_parsed.json dimuat (${ (j.rooms||j).length } ruangan)`);
          return Array.isArray(j.rooms)? j.rooms : j;
        }
      } else {
        dbgSet(`Gagal fetch ${p} (status ${r.status})`);
      }
    }catch(e){
      console.warn('fetch error', e);
      dbgSet('Fetch error: ' + (e.message||e));
    }
  }
  dbgSet('Pakai fallback embedded denah (Excel) — langsung render');
  return denahRoomsEmbedded;
}

/* --- EMBEDDED full list (63 entri) --- */
const denahRoomsEmbedded = [
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
  {name: `R. 09`, col: 11, row: 20, w: 1, h: 1}
];

/* ========== RENDER DENAH ========== */
function renderDenah(mapEl, rooms){
  if(!mapEl){ dbgSet('Elemen #map3d tidak ditemukan'); console.warn('#map3d missing'); return; }
  if(!rooms || !rooms.length){ dbgSet('Data denah kosong'); mapEl.innerHTML = '<div style="padding:18px;color:#bfffe0">Tidak ada data denah.</div>'; return; }
  try{
    mapEl.innerHTML = '';
    const inner = document.createElement('div'); inner.className = 'map3d-inner'; inner.style.position='absolute'; inner.style.left='50%'; inner.style.top='50%'; inner.style.transform='translate(-50%,-50%)'; inner.style.transformStyle='preserve-3d'; mapEl.appendChild(inner);

    const cols = Math.max(...rooms.map(r=>r.col)) - Math.min(...rooms.map(r=>r.col)) + 1;
    const rows = Math.max(...rooms.map(r=>r.row)) - Math.min(...rooms.map(r=>r.row)) + 1;
    const minCol = Math.min(...rooms.map(r=>r.col));
    const minRow = Math.min(...rooms.map(r=>r.row));
    const rect = mapEl.getBoundingClientRect(); const pad=24;
    const usableW = Math.max(240, rect.width - pad*2); const usableH = Math.max(160, rect.height - pad*2);
    const cellW = Math.floor(usableW / Math.max(1, cols)); const cellH = Math.floor(usableH / Math.max(1, rows));
    const cell = Math.max(44, Math.min(cellW, cellH));
    inner.style.width = (cols*cell) + 'px'; inner.style.height = (rows*cell) + 'px';

    // tooltip
    let tip = null;
    function showTip(x,y,html){ if(!tip){ tip=document.createElement('div'); tip.className='denah-tooltip'; tip.style.position='fixed'; tip.style.pointerEvents='none'; tip.style.padding='8px 10px'; tip.style.borderRadius='8px'; tip.style.background='rgba(3,20,12,0.96)'; tip.style.color='#67ff9b'; document.body.appendChild(tip);} tip.innerHTML=html; tip.style.left = x + 'px'; tip.style.top = y + 'px'; tip.style.display='block'; }
    function hideTip(){ if(tip) tip.style.display='none'; }

    rooms.forEach(r=>{
      const d = document.createElement('div'); d.className='denah-room'; d.textContent = r.name;
      const x = (r.col - minCol) * cell, y = (r.row - minRow) * cell;
      const w = (r.w||1) * cell - 8, h = (r.h||1)*cell - 8;
      d.style.position='absolute'; d.style.left=(x+4)+'px'; d.style.top=(y+4)+'px'; d.style.width = w+'px'; d.style.height = h+'px'; d.style.lineHeight = Math.max(14, Math.min(20, h-6)) + 'px';
      d.addEventListener('click', ()=> openRoomModal(r)); d.addEventListener('mousemove', ev=> showTip(ev.clientX, ev.clientY, `<strong>${escapeHtml(r.name)}</strong>`)); d.addEventListener('mouseleave', hideTip);
      inner.appendChild(d);
    });

    // tilt drag
    let rx=14, ry=-18, dragging=false, lastX=0, lastY=0; inner.style.transform = `translate(-50%,-50%) rotateX(${rx}deg) rotateY(${ry}deg)`;
    mapEl.addEventListener('pointerdown', e=>{ dragging=true; lastX=e.clientX; lastY=e.clientY; mapEl.setPointerCapture?.(e.pointerId);});
    window.addEventListener('pointerup', ()=> dragging=false);
    window.addEventListener('pointermove', e=>{ if(!dragging) return; const dx = e.clientX - lastX, dy = e.clientY - lastY; lastX=e.clientX; lastY=e.clientY; ry += dx*0.08; rx -= dy*0.06; rx = Math.max(-30, Math.min(60, rx)); inner.style.transform = `translate(-50%,-50%) rotateX(${rx}deg) rotateY(${ry}deg)`; });

    $('#resetView')?.addEventListener('click', ()=> { rx=14; ry=-18; inner.style.transform = `translate(-50%,-50%) rotateX(${rx}deg) rotateY(${ry}deg)`; });
    $('#tiltToggle')?.addEventListener('change', e=> { if(!e.target.checked) inner.style.transform = `translate(-50%,-50%) rotateX(0deg) rotateY(0deg)`; else inner.style.transform = `translate(-50%,-50%) rotateX(${rx}deg) rotateY(${ry}deg)`; });

    // show badge with count
    const badgeId = '__denah_count_badge';
    let badge = document.getElementById(badgeId);
    if(!badge){ badge = document.createElement('div'); badge.id = badgeId; badge.style.cssText = 'position:fixed;left:18px;bottom:18px;padding:8px 10px;border-radius:8px;background:rgba(2,8,4,0.6);color:#bfffe0;z-index:99999;font-weight:700'; document.body.appendChild(badge); }
    badge.textContent = `Denah dirender (${rooms.length} ruangan)`;
    dbgSet(`Denah dirender — ${rooms.length} ruangan`);
  }catch(e){ console.error('renderDenah error', e); dbgSet('Render denah error: '+ (e.message||e)); }
}

/* modal for room */
function openRoomModal(r){ try{ const tpl = $('#modal-template'); if(!tpl){ alert(r.name); return; } const clone = tpl.content.cloneNode(true); const backdrop = clone.querySelector('.modal-backdrop'); const close = clone.querySelector('.modal-close'); const content = clone.querySelector('.modal-content'); content.innerHTML = `<h3 style="margin-top:0;color:#67ff9b">${escapeHtml(r.name)}</h3><p>Grid: col ${r.col}, row ${r.row}</p><div style="text-align:right;margin-top:12px"><button class="glass-btn modal-ok">Tutup</button></div>`; close.addEventListener('click', ()=> backdrop.parentElement.removeChild(backdrop)); backdrop.addEventListener('click', e=> { if(e.target === backdrop) backdrop.parentElement.removeChild(backdrop); }); document.body.appendChild(backdrop); backdrop.querySelector('.modal-ok')?.addEventListener('click', ()=> backdrop.parentElement.removeChild(backdrop)); }catch(e){console.error(e);} }

function escapeHtml(s){ return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]); }

/* init map: load denah then render */
async function initMap3D(){ try{ const el = document.getElementById('map3d'); if(!el){ dbgSet('#map3d tidak ada di DOM'); console.warn('#map3d missing'); return; } const rooms = await loadDenah(); renderDenah(el, rooms); }catch(e){ console.error('initMap3D', e); dbgSet('initMap3D error'); } }

/* confetti */
function initConfetti(){ try{ $('#celebrateBtn')?.addEventListener('click', ()=> { const cvs = document.createElement('canvas'); cvs.style.position='fixed'; cvs.style.inset=0; cvs.style.zIndex=99998; cvs.style.pointerEvents='none'; const ctx = cvs.getContext('2d'); document.body.appendChild(cvs); cvs.width = innerWidth; cvs.height = innerHeight; const pieces=[]; const cols=['#bfffe0','#67ff9b','#4ef38b','#d6ffd9','#aaffc7']; for(let i=0;i<140;i++) pieces.push({x:Math.random()*cvs.width,y:-20-Math.random()*300,vx:(Math.random()-0.5)*8,vy:Math.random()*6+2,r:Math.random()*9+4,col:cols[Math.floor(Math.random()*cols.length)],rot:Math.random()*360,vr:(Math.random()-0.5)*12}); (function step(){ ctx.clearRect(0,0,cvs.width,cvs.height); for(const p of pieces){ p.x+=p.vx; p.y+=p.vy; p.vy+=0.12; p.rot+=p.vr; ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot*Math.PI/180); ctx.fillStyle=p.col; ctx.fillRect(-p.r/2,-p.r/2,p.r,p.r*0.6); ctx.restore(); } for(let i=pieces.length-1;i>=0;i--) if(pieces[i].y > cvs.height+40) pieces.splice(i,1); if(pieces.length) requestAnimationFrame(step); else cvs.parentElement && cvs.parentElement.removeChild(cvs); })(); }); dbgSet('Confetti siap'); }catch(e){console.error(e);} }

/* close modals on ESC */
window.addEventListener('keydown', (e)=> { if(e.key === 'Escape') document.querySelectorAll('.modal-backdrop').forEach(b => b.parentElement && b.parentElement.removeChild(b)); });

/* End of file */
