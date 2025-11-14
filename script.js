/* script.js (debug-friendly, loader anti-stuck, dynamic denah load & fallback) */
/* Helpers */
const $ = (s, ctx=document) => ctx.querySelector(s);
const $$ = (s, ctx=document) => Array.from((ctx||document).querySelectorAll(s));

/* ---------- debug banner ---------- */
(function createDebugBanner(){
  if($('#denah-debug')) return;
  const dbg = document.createElement('div');
  dbg.id = 'denah-debug';
  dbg.style.position = 'fixed';
  dbg.style.right = '12px';
  dbg.style.bottom = '12px';
  dbg.style.zIndex = '999999';
  dbg.style.background = 'rgba(0,0,0,0.6)';
  dbg.style.color = '#bfffe0';
  dbg.style.padding = '8px 10px';
  dbg.style.borderRadius = '8px';
  dbg.style.fontSize = '12px';
  dbg.style.fontFamily = 'Inter, Arial, sans-serif';
  dbg.innerText = 'Status: memulai...';
  document.body.appendChild(dbg);
})();
function dbg(text){ console.log('[APP]', text); const d = $('#denah-debug'); if(d) d.innerText = (typeof text==='string'? text : JSON.stringify(text).slice(0,200)); }

/* ---------- robust loader (RAF + interval fallback) ---------- */
const loaderEl = $('#loader');
const loaderPercentEl = $('#loaderPercent');
const loaderBarEl = $('#loaderBar');

let _loaded = 0;
let _rafActive = true;
let _forceInterval = null;

function safeSetProgress(v){
  _loaded = Math.max(_loaded, Math.min(100, Math.round(v)));
  if(loaderPercentEl) loaderPercentEl.textContent = _loaded + '%';
  if(loaderBarEl) loaderBarEl.style.width = _loaded + '%';
}

function finishLoader(){
  try {
    if(loaderEl){
      loaderEl.style.transition = 'opacity .6s ease, transform .6s ease';
      loaderEl.style.opacity = '0';
      loaderEl.style.transform = 'translateY(-12px)';
      setTimeout(()=> { if(loaderEl.parentElement) loaderEl.parentElement.removeChild(loaderEl); revealApp(); }, 700);
    } else revealApp();
  } catch(err){
    console.error('finishLoader err', err);
    revealApp();
  }
}

function revealApp(){
  try{
    const app = $('#app');
    if(!app) { dbg('APP root tidak ditemukan'); return; }
    app.setAttribute('aria-hidden','false');
    app.style.opacity = '0';
    app.style.transition = 'opacity .7s ease';
    requestAnimationFrame(()=> app.style.opacity = '1');
    // init features
    try{ initParticles(); }catch(e){ console.error('particles failed',e); }
    try{ initPanelNav(); initPanelButtons(); initSectionObservers(); }catch(e){ console.error('panel init failed',e); }
    try{ initMap3D(); }catch(e){ console.error('map init failed',e); }
    try{ initConfetti(); }catch(e){ console.error('confetti failed',e); }
  }catch(e){ console.error('revealApp failed', e); }
}

/* RAF loader step */
let last = performance.now();
function loaderRAF(){
  try{
    const now = performance.now();
    const dt = Math.min(60, now - last);
    last = now;
    // progress easing: faster at start, slower near end
    const remaining = 100 - _loaded;
    let step = Math.max(1, Math.round((remaining) * 0.02) + Math.floor(Math.random()*2));
    // tie step to time delta to keep it consistent
    step = Math.max(1, Math.round(step * (dt / 35)));
    safeSetProgress(_loaded + step);
    if(_loaded < 100 && _rafActive){
      requestAnimationFrame(loaderRAF);
    } else if(_loaded >= 100){
      finishLoader();
    }
  }catch(err){
    console.error('loaderRAF error', err);
    // start interval fallback if RAF errors
    startIntervalFallback();
  }
}

/* Interval fallback if RAF blocked by earlier script error */
function startIntervalFallback(){
  if(_forceInterval) return;
  dbg('RAF gagal — menggunakan interval fallback');
  _forceInterval = setInterval(()=>{
    try{
      const inc = Math.max(1, Math.ceil((100 - _loaded) * 0.04));
      safeSetProgress(_loaded + inc);
      if(_loaded >= 100){
        clearInterval(_forceInterval);
        finishLoader();
      }
    }catch(err){
      console.error('interval fallback error', err);
      clearInterval(_forceInterval);
      // if all fails, force finish after 2s
      setTimeout(()=> { safeSetProgress(100); finishLoader(); }, 2000);
    }
  }, 40);
}

/* Start loader robustly */
try{
  dbg('Memulai loader');
  requestAnimationFrame(loaderRAF);
  // as safety, if nothing changes in 3s, start fallback interval to avoid stuck
  setTimeout(()=> {
    if(_loaded <= 2 && !_forceInterval){
      dbg('Loader bergerak perlahan - memicu fallback');
      startIntervalFallback();
    }
  }, 3000);
} catch(e){
  console.error('Loader start failed', e);
  startIntervalFallback();
}

/* ========== particles, panels, modal, confetti — simplified wrappers ========== */
/* (We re-use the versions already provided but wrapped in try/catch so they don't break loader) */

function initParticles(){
  try{
    const canvas = $('#particleCanvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = canvas.width = innerWidth, H = canvas.height = innerHeight;
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
    (function frame(){
      ctx.clearRect(0,0,W,H);
      const g = ctx.createLinearGradient(0,0,W,H); g.addColorStop(0,'rgba(2,20,12,0.08)'); g.addColorStop(1,'rgba(0,0,0,0.14)');
      ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
      for(const p of parts){
        p.x += p.vx; p.y += p.vy;
        if(p.x < -10) p.x = W + 10; if(p.x > W+10) p.x = -10;
        if(p.y < -10) p.y = H + 10; if(p.y > H+10) p.y = -10;
        const dx = p.x - mx, dy = p.y - my, d = Math.sqrt(dx*dx + dy*dy);
        if(d < 120){ p.vx += (dx/d)*0.03; p.vy += (dy/d)*0.03; } else { p.vx *= 0.995; p.vy *= 0.995; }
        ctx.beginPath(); ctx.fillStyle = `hsla(${p.hue},72%,60%,${p.alpha})`; ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
      }
      for(let i=0;i<parts.length;i++){
        for(let j=i+1;j<i+4;j++){
          const a=parts[i], b=parts[j]; if(!b) continue;
          const dx=a.x-b.x, dy=a.y-b.y, dist=Math.sqrt(dx*dx + dy*dy);
          if(dist<80){ ctx.beginPath(); ctx.strokeStyle = `rgba(110,255,170,${0.06*(1-dist/80)})`; ctx.lineWidth=1; ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke(); }
        }
      }
      requestAnimationFrame(frame);
    })();
    dbg('Particles aktif');
  }catch(e){ console.error('initParticles error', e); }
}

/* minimal panel nav (as before) */
function initPanelNav(){ try{
  $$('.nav-btn').forEach(b => b.addEventListener('click', ()=> activatePanel(b.dataset.panel)));
  $('#brandBtn')?.addEventListener('click', ()=> activatePanel('home'));
  activatePanel(window.location.hash ? window.location.hash.replace('#','') : 'home');
  dbg('Panel nav siap');
}catch(e){ console.error('initPanelNav',e);} }
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

/* small helpers */
function initPanelButtons(){ try{ $$('[data-panel]').forEach(btn => btn.addEventListener('click', ()=> activatePanel(btn.dataset.panel))); }catch(e){console.error(e);} }
function initSectionObservers(){ try{
  const panels = $$('.panel');
  panels.forEach(panel=>{
    const items = panel.querySelectorAll('.card, .person-content, .sejarah-rich, .profile-grid > article');
    const io = new IntersectionObserver(entries => { entries.forEach(en => { if(en.isIntersecting) en.target.classList.add('visible'); }); }, {threshold:0.12});
    items.forEach(it => io.observe(it));
  });
}catch(e){console.error(e);} }

/* modal & message (kept simple) */
function openProfileModal(key){ try{
  const data = {
    ajeng:{title:'Ajeng Febria — Profil', html:'<p>Profil Ajeng...</p>'},
    dj:{title:'DJ Lancar — Profil', html:'<p>Profil DJ...</p>'},
    default:{title:'SMAN1', html:'<p>Info sekolah</p>'}
  };
  const d = data[key] || data.default;
  const tpl = $('#modal-template'); if(!tpl) return;
  const clone = tpl.content.cloneNode(true); const backdrop = clone.querySelector('.modal-backdrop'); const close = clone.querySelector('.modal-close'); const content = clone.querySelector('.modal-content');
  content.innerHTML = `<h3>${d.title}</h3>${d.html}`;
  close.addEventListener('click', ()=> backdrop.parentElement.removeChild(backdrop));
  backdrop.addEventListener('click', e=> { if(e.target === backdrop) backdrop.parentElement.removeChild(backdrop); });
  document.body.appendChild(backdrop);
}catch(e){console.error('openProfileModal',e);} }
window.openProfileModal = openProfileModal;
function openMessagePrompt(target){ try{
  const who = target.includes('ajeng') ? 'Ajeng' : (target.includes('dj') ? 'DJ' : 'Penerima');
  const msg = prompt(`Kirim pesan ke ${who}:`); if(!msg) return;
  const tpl = $('#modal-template'); if(!tpl) return;
  const clone = tpl.content.cloneNode(true); const backdrop = clone.querySelector('.modal-backdrop'); const close = clone.querySelector('.modal-close'); const content = clone.querySelector('.modal-content');
  content.innerHTML = `<h3>Pesan dikirim</h3><p>${escapeHtml(msg)}</p><div style="text-align:right"><button class="glass-btn modal-ok">Tutup</button></div>`;
  document.body.appendChild(backdrop);
  backdrop.querySelector('.modal-ok')?.addEventListener('click', ()=> backdrop.parentElement.removeChild(backdrop));
}catch(e){console.error(e);} }
function escapeHtml(s){ return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]); }

/* ========== DENAH: try fetch JSON, else embedded fallback ========== */
/* If you have 'denah_parsed.json' place it next to index.html. Format: { "rooms":[{name, col,row,w,h}, ...] } */
async function loadDenah(){
  try {
    // prefer external JSON (easier to keep Excel updates)
    dbg('Mencoba memuat denah_parsed.json...');
    const r = await fetch('denah_parsed.json', {cache:'no-store'});
    if(r.ok){
      const j = await r.json();
      if(j && (Array.isArray(j.rooms) || Array.isArray(j))){
        dbg('denah_parsed.json dimuat');
        return Array.isArray(j.rooms) ? j.rooms : j;
      }
      dbg('denah_parsed.json format tidak terduga, pakai fallback');
    } else dbg('denah_parsed.json tidak ditemukan (status ' + r.status + ')');
  } catch(err){ dbg('fetch denah failed: ' + err.message); }

  dbg('Menggunakan fallback embedded denah');
  return denahRoomsEmbedded;
}

/* Fallback embedded sample (replace/extend with full parsed list if perlu) */
const denahRoomsEmbedded = [
  {name:'R.01', col:4, row:11, w:1, h:1},
  {name:'PERPUS', col:4, row:18, w:1, h:1},
  {name:'LAB KOMPUTER', col:6, row:14, w:1, h:1},
  {name:'R. OSIS', col:2, row:11, w:1, h:1},
  {name:'R. GURU', col:7, row:11, w:1, h:1},
  {name:'TOILET', col:14, row:11, w:1, h:1},
  // ... kalau mau, aku bisa inject seluruh 63 entri hasil parsing Excel
];

/* Render denah (ke #map3d) */
function renderDenah(mapEl, rooms){
  if(!mapEl){ dbg('#map3d tidak ditemukan'); return; }
  try{
    mapEl.innerHTML = '';
    const inner = document.createElement('div'); inner.className='map3d-inner'; mapEl.appendChild(inner);

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
    const cell = Math.max(44, Math.min(cellW, cellH));
    inner.style.width = (cols*cell) + 'px';
    inner.style.height= (rows*cell) + 'px';

    // tooltip
    let tooltip = null;
    function showTip(x,y,txt){
      if(!tooltip){
        tooltip = document.createElement('div'); tooltip.className='denah-tooltip';
        tooltip.style.position='fixed'; tooltip.style.pointerEvents='none'; tooltip.style.padding='8px 10px';
        tooltip.style.borderRadius='8px'; tooltip.style.background='rgba(3,20,12,0.96)'; tooltip.style.color='#67ff9b';
        document.body.appendChild(tooltip);
      }
      tooltip.innerHTML = txt; tooltip.style.left = x + 'px'; tooltip.style.top = y + 'px'; tooltip.style.display='block';
    }
    function hideTip(){ if(tooltip) tooltip.style.display='none'; }

    rooms.forEach(r=>{
      const d = document.createElement('div'); d.className='denah-room'; d.textContent = r.name;
      const x = (r.col - minCol) * cell, y = (r.row - minRow) * cell;
      const w = (r.w||1)*cell - 8, h = (r.h||1)*cell - 8;
      d.style.left = (x+4)+'px'; d.style.top = (y+4)+'px';
      d.style.width = w+'px'; d.style.height = h+'px'; d.style.lineHeight = Math.max(14, Math.min(20, h-6)) + 'px';
      d.addEventListener('click', ()=> openRoomModal(r));
      d.addEventListener('mousemove', (ev)=> showTip(ev.clientX, ev.clientY, `<strong>${escapeHtml(r.name)}</strong>`));
      d.addEventListener('mouseleave', hideTip);
      inner.appendChild(d);
    });

    // tilt & drag
    let rx=14, ry=-18, dragging=false, lastX=0, lastY=0;
    inner.style.transform = `translate(-50%,-50%) rotateX(${rx}deg) rotateY(${ry}deg)`;
    mapEl.addEventListener('pointerdown', e=>{ dragging=true; lastX=e.clientX; lastY=e.clientY; mapEl.setPointerCapture?.(e.pointerId); });
    window.addEventListener('pointerup', ()=> dragging=false);
    window.addEventListener('pointermove', e=>{ if(!dragging) return; const dx=e.clientX-lastX, dy=e.clientY-lastY; lastX=e.clientX; lastY=e.clientY; ry += dx*0.08; rx -= dy*0.06; rx = Math.max(-30, Math.min(60, rx)); inner.style.transform = `translate(-50%,-50%) rotateX(${rx}deg) rotateY(${ry}deg)`; });

    $('#resetView')?.addEventListener('click', ()=> { rx=14; ry=-18; inner.style.transform = `translate(-50%,-50%) rotateX(${rx}deg) rotateY(${ry}deg)`; });
    $('#tiltToggle')?.addEventListener('change', e=> { if(!e.target.checked) inner.style.transform = `translate(-50%,-50%) rotateX(0deg) rotateY(0deg)`; else inner.style.transform = `translate(-50%,-50%) rotateX(${rx}deg) rotateY(${ry}deg)`; });

    dbg('Denah dirender (' + rooms.length + ' ruangan)');
  }catch(err){ console.error('renderDenah err', err); }
}

function openRoomModal(r){
  try{
    const tpl = $('#modal-template'); if(!tpl) { alert(r.name); return; }
    const clone = tpl.content.cloneNode(true); const backdrop = clone.querySelector('.modal-backdrop'); const close = clone.querySelector('.modal-close'); const content = clone.querySelector('.modal-content');
    content.innerHTML = `<h3 style="margin-top:0;color:#67ff9b">${escapeHtml(r.name)}</h3><p>Grid: col ${r.col}, row ${r.row}</p><div style="text-align:right;margin-top:12px"><button class="glass-btn modal-ok">Tutup</button></div>`;
    close.addEventListener('click', ()=> backdrop.parentElement.removeChild(backdrop));
    backdrop.addEventListener('click', e=> { if(e.target === backdrop) backdrop.parentElement.removeChild(backdrop); });
    document.body.appendChild(backdrop);
    backdrop.querySelector('.modal-ok')?.addEventListener('click', ()=> backdrop.parentElement.removeChild(backdrop));
  }catch(e){console.error(e);}
}

/* Load denah and initialize map */
async function initMap3D(){
  try{
    const mapEl = document.getElementById('map3d'); if(!mapEl){ dbg('#map3d not found'); return; }
    const rooms = await loadDenah();
    renderDenah(mapEl, rooms);
  }catch(e){ console.error('initMap3D', e); }
}

/* confetti (unchanged) */
function initConfetti(){ try{ $('#celebrateBtn')?.addEventListener('click', ()=> {
  // small burst
  const cvs = document.createElement('canvas'); cvs.style.position='fixed'; cvs.style.inset=0; cvs.style.zIndex=99998; cvs.style.pointerEvents='none'; const ctx = cvs.getContext('2d'); document.body.appendChild(cvs); cvs.width = innerWidth; cvs.height = innerHeight; const pieces=[]; const colors=['#bfffe0','#67ff9b','#4ef38b','#d6ffd9','#aaffc7']; for(let i=0;i<120;i++) pieces.push({x:Math.random()*cvs.width,y:-20-Math.random()*200,vx:(Math.random()-0.5)*8,vy:Math.random()*6+2,r:Math.random()*8+4,col:colors[Math.floor(Math.random()*colors.length)],rot:Math.random()*360,vr:(Math.random()-0.5)*12}); (function step(){ ctx.clearRect(0,0,cvs.width,cvs.height); for(const p of pieces){ p.x+=p.vx; p.y+=p.vy; p.vy+=0.12; p.rot+=p.vr; ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot*Math.PI/180); ctx.fillStyle=p.col; ctx.fillRect(-p.r/2,-p.r/2,p.r,p.r*0.6); ctx.restore(); } for(let i=pieces.length-1;i>=0;i--) if(pieces[i].y > cvs.height+40) pieces.splice(i,1); if(pieces.length) requestAnimationFrame(step); else { if(cvs.parentElement) cvs.parentElement.removeChild(cvs); } })();
}); }catch(e){console.error(e);} }

/* Close modals on ESC */
window.addEventListener('keydown', (e)=> { if(e.key === 'Escape') document.querySelectorAll('.modal-backdrop').forEach(b => b.parentElement && b.parentElement.removeChild(b)); });

/* Lastly: if something still blocks loader, open console and copy last errors to me. */
/* End of script.js */
