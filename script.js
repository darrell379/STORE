// merged_denah_script.js
// Gabungan: script.js (loader, particles, panels, modal, confetti, denah foto3D) + Denah 3D Three.js
// Pastikan file ini di-<script type="module" src="merged_denah_script.js"></script>

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js";

/* ---------------- Helpers ---------------- */
const $ = (s, ctx=document) => ctx.querySelector(s);
const $$ = (s, ctx=document) => Array.from((ctx||document).querySelectorAll(s));
function escapeHtml(s){ return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]); }

/* --------------- Debug overlay ------------- */
(function createDebug(){
  if($('#__debug_denah')) return;
  const d = document.createElement('div');
  d.id = '__debug_denah';
  d.style.cssText = 'position:fixed;right:12px;bottom:12px;z-index:999999;padding:8px 10px;border-radius:8px;background:rgba(0,0,0,0.6);color:#bfffe0;font-family:Inter,Arial,sans-serif;font-size:13px;max-width:300px';
  d.innerHTML = '<strong>Status:</strong> Inisialisasi...';
  document.body.appendChild(d);
})();
function dbgSet(txt){ const el = $('#__debug_denah'); if(el) el.innerHTML = `<strong>Status:</strong> ${txt}`; console.log('[APP]', txt); }

/* ---------------- LOADER (robust) ---------------- */
const loaderEl = $('#loader');
const loaderPercentEl = $('#loaderPercent');
const loaderBarEl = $('#loaderBar');

let _prog = 0, _rafActive = true, _fallbackInterval = null;
function setProg(v){ _prog = Math.max(0, Math.min(100, Math.round(v))); if(loaderPercentEl) loaderPercentEl.textContent = _prog + '%'; if(loaderBarEl) loaderBarEl.style.width = _prog + '%'; }
function finishLoader(){ try{ if(loaderEl){ loaderEl.style.transition = 'opacity .6s, transform .6s'; loaderEl.style.opacity = '0'; loaderEl.style.transform = 'translateY(-12px)'; setTimeout(()=> loaderEl.parentElement && loaderEl.parentElement.removeChild(loaderEl), 650); } revealApp(); }catch(e){ console.error(e); revealApp(); } }

let _last = performance.now();
function loaderRAF(){
  try{
    const now = performance.now(); const dt = Math.min(60, now - _last); _last = now;
    const rem = 100 - _prog;
    let step = Math.max(1, Math.round(rem * 0.02) + Math.floor(Math.random()*2));
    step = Math.max(1, Math.round(step * (dt/35)));
    setProg(_prog + step);
    if(_prog < 100 && _rafActive) requestAnimationFrame(loaderRAF);
    else if(_prog >= 100) finishLoader();
  }catch(e){
    console.error('loaderRAF error', e);
    startFallbackInterval();
  }
}
function startFallbackInterval(){
  if(_fallbackInterval) return;
  dbgSet('Fallback loader aktif');
  _fallbackInterval = setInterval(()=> {
    try{
      const inc = Math.max(1, Math.ceil((100 - _prog) * 0.04));
      setProg(_prog + inc);
      if(_prog >= 100){ clearInterval(_fallbackInterval); finishLoader(); }
    }catch(e){ console.error(e); clearInterval(_fallbackInterval); setProg(100); finishLoader(); }
  }, 45);
}

try{ requestAnimationFrame(loaderRAF); setTimeout(()=>{ if(_prog <= 2) startFallbackInterval(); }, 2800); dbgSet('Loader dimulai'); }catch(e){ console.error(e); startFallbackInterval(); }

/* --------------- reveal app & init features --------------- */
function revealApp(){
  const app = $('#app');
  if(!app){ dbgSet('APP DOM tidak ditemukan'); return; }
  app.setAttribute('aria-hidden','false');
  app.style.opacity = '0';
  app.style.transition = 'opacity .6s';
  requestAnimationFrame(()=> app.style.opacity = '1');
  try{ initParticles(); }catch(e){ console.error('particles failed', e); }
  try{ initPanelNav(); initPanelButtons(); initSectionObservers(); }catch(e){ console.error('panel init failed', e); }
  try{ initMap3D(); }catch(e){ console.error('map init failed', e); }
  try{ initConfetti(); }catch(e){ console.error('confetti failed', e); }
  dbgSet('Aplikasi siap — memuat denah...');
}

/* ---------------- PARTICLES BACKGROUND ---------------- */
function initParticles(){
  try{
    const canvas = $('#particleCanvas'); if(!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = canvas.width = innerWidth, H = canvas.height = innerHeight;
    window.addEventListener('resize', ()=> { W = canvas.width = innerWidth; H = canvas.height = innerHeight; });
    const COUNT = Math.max(60, Math.floor((W*H)/90000));
    const parts = Array.from({length:COUNT}).map(()=>({ x:Math.random()*W, y:Math.random()*H, r:Math.random()*1.6+0.6, vx:(Math.random()-0.5)*0.6, vy:(Math.random()-0.5)*0.6, hue:120+Math.random()*60, alpha:0.06+Math.random()*0.28 }));
    let mx=-9999,my=-9999;
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
          const a = parts[i], b = parts[j]; if(!b) continue;
          const dx = a.x-b.x, dy = a.y-b.y, dist = Math.sqrt(dx*dx + dy*dy);
          if(dist < 80){ ctx.beginPath(); ctx.strokeStyle = `rgba(110,255,170,${0.06*(1-dist/80)})`; ctx.lineWidth = 1; ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke(); }
        }
      }
      requestAnimationFrame(frame);
    })();
    dbgSet('Particles aktif');
  }catch(e){ console.error('initParticles error', e); }
}

/* ---------------- Panel nav & helpers ---------------- */
function initPanelNav(){
  try{
    $$('.nav-btn').forEach(b => b.addEventListener('click', ()=> activatePanel(b.dataset.panel)));
    $('#brandBtn')?.addEventListener('click', ()=> activatePanel('home'));
    activatePanel(window.location.hash ? window.location.hash.replace('#','') : 'home');
    dbgSet('Panel nav siap');
  }catch(e){ console.error(e); }
}
let currentPanel = 'home';
function activatePanel(name){
  $$('.panel').forEach(p => {
    const nm = p.dataset.name;
    if(nm === name){ p.classList.add('active'); p.classList.remove('prev-left'); }
    else { if(p.dataset.name === currentPanel) p.classList.add('prev-left'); else p.classList.remove('prev-left'); p.classList.remove('active'); }
  });
  currentPanel = name;
  try{ history.replaceState(null,'','#'+name); }catch(e){}
}
function initPanelButtons(){ try{ $$('[data-panel]').forEach(btn => btn.addEventListener('click', ()=> activatePanel(btn.dataset.panel))); }catch(e){} }
function initSectionObservers(){ try{ $$('.panel').forEach(panel=>{ const items = panel.querySelectorAll('.card, .person-content, .sejarah-rich, .profile-grid > article'); const io = new IntersectionObserver(entries => { entries.forEach(en => { if(en.isIntersecting) en.target.classList.add('visible'); }); }, {threshold:0.12}); items.forEach(it => io.observe(it)); }); }catch(e){} }

/* ---------------- Modal / message ---------------- */
function openProfileModal(key){
  try{
    const data = {
      ajeng: { title:'Ajeng Febria — Profil Lengkap', html:`<p><strong>Peran:</strong> Ketua OSIS 2025, Koreografer & Penggerak Seni</p><p>Ajeng menginisiasi festival digital sekolah dan pembinaan seni.</p>` },
      dj: { title:'DJ Lancar — Profil & Karya', html:`<p><strong>Peran:</strong> DJ & Produser acara sekolah</p><p>Workshop mixing & produksi.</p>` },
      default: { title:'SMAN 1 Ngadiluwih', html:`<p>Info lengkap tersedia pada panel Profil & Sejarah.</p>` }
    };
    const d = data[key] || data.default;
    const tpl = $('#modal-template'); if(!tpl) return;
    const clone = tpl.content.cloneNode(true); const backdrop = clone.querySelector('.modal-backdrop'); const close = clone.querySelector('.modal-close'); const content = clone.querySelector('.modal-content');
    content.innerHTML = `<h3 style="margin-top:0;color:#67ff9b">${d.title}</h3>${d.html}`;
    close.addEventListener('click', ()=> backdrop.parentElement.removeChild(backdrop));
    backdrop.addEventListener('click', e=> { if(e.target === backdrop) backdrop.parentElement.removeChild(backdrop); });
    document.body.appendChild(backdrop);
  }catch(e){ console.error(e); }
}
window.openProfileModal = openProfileModal;

function openMessagePrompt(target){
  try{
    const who = target.includes('ajeng') ? 'Ajeng Febria' : (target.includes('dj') ? 'DJ Lancar' : 'Penerima');
    const msg = prompt(`Tulis pesan / ucapan untuk ${who}:`);
    if(!msg) return;
    const tpl = $('#modal-template'); if(!tpl) return;
    const clone = tpl.content.cloneNode(true); const backdrop = clone.querySelector('.modal-backdrop'); const close = clone.querySelector('.modal-close'); const content = clone.querySelector('.modal-content');
    content.innerHTML = `<h3 style="margin-top:0;color:#67ff9b">Pesan Terkirim</h3><p>Pesan untuk <strong>${who}</strong>:</p><blockquote style="background:rgba(255,255,255,0.02);padding:12px;border-radius:8px;">${escapeHtml(msg)}</blockquote><div style="text-align:right;margin-top:12px"><button class="glass-btn modal-ok">Tutup</button></div>`;
    document.body.appendChild(backdrop);
    close.addEventListener('click', ()=> backdrop.parentElement.removeChild(backdrop));
    backdrop.querySelector('.modal-ok')?.addEventListener('click', ()=> backdrop.parentElement.removeChild(backdrop));
  }catch(e){ console.error(e); }
}

/* ---------------- Denah load (try JSON else embedded) ---------------- */
async function loadDenah(){
  const paths = ['denah_parsed.json','./denah_parsed.json','/denah_parsed.json'];
  for(const p of paths){
    try{
      dbgSet('Mencoba fetch ' + p);
      const r = await fetch(p, {cache:'no-store'});
      if(r.ok){
        const j = await r.json();
        const rooms = Array.isArray(j.rooms) ? j.rooms : (Array.isArray(j) ? j : (Array.isArray(j) ? j : null));
        if(rooms && rooms.length){ dbgSet(`denah_parsed.json dimuat (${rooms.length} ruangan)`); return rooms; }
        if(Array.isArray(j) && j.length){ dbgSet(`denah_parsed.json (array) dimuat (${j.length})`); return j; }
      } else dbgSet(`Gagal fetch ${p} (status ${r.status})`);
    }catch(e){ dbgSet('Fetch error: ' + (e.message||e)); console.warn('fetch denah error', e); }
  }
  dbgSet('Pakai fallback embedded denah Excel');
  return denahRoomsEmbedded;
}

/* ---------- EMBEDDED denah (63 entri) ---------- */
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

/* ------------- Photo3D denah: init, draw & interactions ------------- */
async function initMap3D(){
  try{
    const container = document.getElementById('map3d');
    if(!container){ dbgSet('#map3d tidak ditemukan'); return; }

    // get rooms: prefer JSON, else embedded
    let rooms = [];
    try { rooms = await loadDenah(); } catch(e){ rooms = denahRoomsEmbedded; dbgSet('loadDenah error — pakai embedded'); }
    if(!rooms || !rooms.length) rooms = denahRoomsEmbedded;

    // prepare wrapper
    const wrap = container.querySelector('.photo3d-wrap') || (function(){ const w = document.createElement('div'); w.className='photo3d-wrap'; container.appendChild(w); return w; })();

    // ensure canvas exists for photo3D
    let canvas = document.getElementById('mapPhotoCanvas');
    if(!canvas){
      canvas = document.createElement('canvas'); canvas.id = 'mapPhotoCanvas'; wrap.appendChild(canvas);
      if(!$('#mapPhotoCaption')){ const c = document.createElement('div'); c.id='mapPhotoCaption'; c.className='map-photo-caption'; c.textContent='Denah 3D (klik & drag untuk tilt, scroll untuk zoom)'; wrap.appendChild(c); }
    }

    // create 3D container for Three.js (denah3d)
    let denah3dContainer = document.getElementById('denah3d-container');
    if(!denah3dContainer){ denah3dContainer = document.createElement('div'); denah3dContainer.id = 'denah3d-container'; denah3dContainer.style.cssText = 'width:100%;height:360px;margin-top:12px;border-radius:12px;overflow:hidden;background:#060d08'; wrap.appendChild(denah3dContainer); }

    // resize & DPR-aware draw for photo canvas
    function resizeCanvas(){
      const rect = canvas.getBoundingClientRect();
      const DPR = window.devicePixelRatio || 1;
      canvas.width = Math.max(300, Math.floor(rect.width * DPR));
      canvas.height = Math.max(200, Math.floor(rect.height * DPR));
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      drawMapPhoto(canvas, rooms);
      // also update 3D renderer size
      if(denah3d && denah3d.renderer){
        denah3d.renderer.setSize(denah3dContainer.clientWidth, denah3dContainer.clientHeight);
        denah3d.camera.aspect = denah3dContainer.clientWidth / denah3dContainer.clientHeight;
        denah3d.camera.updateProjectionMatrix();
      }
    }
    window.addEventListener('resize', debounce(()=> resizeCanvas(), 120));
    resizeCanvas();

    // interactions: drag tilt, wheel zoom, dblclick reset (for photo canvas)
    let down=false, lastX=0, lastY=0, rotX=8, rotY=-12, scale=1;
    function applyCssTransform(){ canvas.style.transform = `perspective(1200px) translateZ(0px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale})`; }
    canvas.style.transformOrigin = '50% 50%';
    applyCssTransform();
    canvas.style.cursor = 'grab';

    canvas.addEventListener('pointerdown', e=>{ down=true; lastX=e.clientX; lastY=e.clientY; canvas.setPointerCapture?.(e.pointerId); canvas.style.cursor='grabbing'; });
    window.addEventListener('pointerup', ()=>{ down=false; canvas.style.cursor='grab'; });
    window.addEventListener('pointermove', e=>{ if(!down) return; const dx=e.clientX-lastX, dy=e.clientY-lastY; lastX=e.clientX; lastY=e.clientY; rotY += dx*0.08; rotX -= dy*0.06; rotX = Math.max(-40, Math.min(60, rotX)); applyCssTransform(); });

    canvas.addEventListener('wheel', e=>{ e.preventDefault(); const delta = -e.deltaY || -e.wheelDelta; scale *= (delta > 0 ? 1.06 : 0.94); scale = Math.max(0.6, Math.min(2.5, scale)); applyCssTransform(); }, {passive:false});
    canvas.addEventListener('dblclick', ()=>{ rotX=8; rotY=-12; scale=1; applyCssTransform(); });

    // convenience: redraw on demand
    canvas.drawMap = ()=> drawMapPhoto(canvas, rooms);

    dbgSet(`Foto denah siap — ${rooms.length} ruangan`);
    // show count badge
    const badgeId='__denah_count_badge';
    let badge = document.getElementById(badgeId);
    if(!badge){ badge = document.createElement('div'); badge.id = badgeId; badge.style.cssText = 'position:fixed;left:18px;bottom:18px;padding:8px 10px;border-radius:8px;background:rgba(2,8,4,0.6);color:#bfffe0;z-index:99999;font-weight:700'; document.body.appendChild(badge); }
    badge.textContent = `Denah (foto3D) — ${rooms.length} ruangan`;

    /* --------- INIT Three.js denah (photo3D -> mesh placeholder) --------- */
    // create 3D scene with simple box as example — can replace with GLTF or photo-mapped planes later
    let denah3d = null;
    (function initThree(){
      try{
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x060d08);

        const camera = new THREE.PerspectiveCamera(55, denah3dContainer.clientWidth / denah3dContainer.clientHeight, 0.1, 1000);
        camera.position.set(0, 40, 60);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha:true });
        renderer.setSize(denah3dContainer.clientWidth, denah3dContainer.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        denah3dContainer.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true; controls.dampingFactor = 0.08; controls.rotateSpeed = 0.4; controls.zoomSpeed = 1.0;

        // grid (floor)
        const grid = new THREE.GridHelper(80, 20, 0x00ffbf, 0x00332e);
        grid.position.y = 0;
        scene.add(grid);

        // placeholder building mesh (use photo material or GLTF in future)
        const material = new THREE.MeshStandardMaterial({ color: 0x1affb2, roughness:0.6, metalness:0.05 });
        const ruang = new THREE.Mesh(new THREE.BoxGeometry(12, 6, 8), material);
        ruang.position.set(0, 3, 0);
        scene.add(ruang);

        // lights
        const light1 = new THREE.DirectionalLight(0xffffff, 1.2);
        light1.position.set(50, 80, 50);
        scene.add(light1);
        const light2 = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(light2);

        // handle resize
        window.addEventListener('resize', ()=>{
          renderer.setSize(denah3dContainer.clientWidth, denah3dContainer.clientHeight);
          camera.aspect = denah3dContainer.clientWidth / denah3dContainer.clientHeight;
          camera.updateProjectionMatrix();
        });

        // animate
        let rafId = null;
        function animate(){
          rafId = requestAnimationFrame(animate);
          controls.update();
          renderer.render(scene, camera);
        }
        animate();

        // expose for resizing from outer scope
        denah3d = { scene, camera, renderer, controls, dispose: ()=>{ cancelAnimationFrame(rafId); renderer.domElement && renderer.domElement.parentElement && renderer.domElement.parentElement.removeChild(renderer.domElement); }};
        dbgSet('Denah 3D (Three.js) siap');
      }catch(e){ console.error('initThree error', e); dbgSet('initThree gagal'); }
    })();

  }catch(e){ console.error('initMap3D', e); dbgSet('initMap3D error'); }
}

/* draw stylized denah onto canvas */
function drawMapPhoto(canvas, rooms){
  try{
    const ctx = canvas.getContext('2d');
    const DPR = window.devicePixelRatio || 1;
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0,0,W,H);

    // background card
    const g = ctx.createLinearGradient(0,0,W,H); g.addColorStop(0,'#03140b'); g.addColorStop(1,'#05261a');
    ctx.fillStyle = g;
    roundRect(ctx, 8*DPR, 8*DPR, W-16*DPR, H-16*DPR, 20*DPR); ctx.fill();

    if(!rooms || !rooms.length){
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.font = `${16*DPR}px Inter, Arial`; ctx.textAlign='center'; ctx.fillText('Tidak ada data denah', W/2, H/2);
      return;
    }

    // compute grid
    const cols = Math.max(...rooms.map(r=>r.col)) - Math.min(...rooms.map(r=>r.col)) + 1;
    const rows = Math.max(...rooms.map(r=>r.row)) - Math.min(...rooms.map(r=>r.row)) + 1;
    const minCol = Math.min(...rooms.map(r=>r.col));
    const minRow = Math.min(...rooms.map(r=>r.row));
    const pad = 36*DPR;
    const usableW = W - pad*2;
    const usableH = H - pad*2;
    const cellW = Math.max(24*DPR, Math.floor(usableW / Math.max(1, cols)));
    const cellH = Math.max(24*DPR, Math.floor(usableH / Math.max(1, rows)));

    // subtle grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.03)'; ctx.lineWidth = Math.max(1, DPR*0.6);
    for(let c=0;c<=cols;c++){ const x = pad + c*cellW; ctx.beginPath(); ctx.moveTo(x, pad); ctx.lineTo(x, pad + rows*cellH); ctx.stroke(); }
    for(let r=0;r<=rows;r++){ const y = pad + r*cellH; ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(pad + cols*cellW, y); ctx.stroke(); }

    // draw rooms
    rooms.forEach(r=>{
      const cx = (r.col - minCol) * cellW + pad;
      const cy = (r.row - minRow) * cellH + pad;
      const w = (r.w || 1) * cellW - 6*DPR;
      const h = (r.h || 1) * cellH - 6*DPR;
      // shadow
      ctx.fillStyle = 'rgba(8,32,18,0.45)'; roundRect(ctx, cx+4*DPR, cy+4*DPR, w, h, 8*DPR); ctx.fill();
      // main
      const grad = ctx.createLinearGradient(cx, cy, cx + w, cy + h); grad.addColorStop(0, 'rgba(90,255,160,0.14)'); grad.addColorStop(1, 'rgba(10,30,20,0.08)');
      ctx.fillStyle = grad; roundRect(ctx, cx, cy, w, h, 8*DPR); ctx.fill();
      // border
      ctx.strokeStyle = 'rgba(100,255,150,0.16)'; ctx.lineWidth = Math.max(1, DPR*0.8); roundRect(ctx, cx, cy, w, h, 8*DPR); ctx.stroke();
      // label
      ctx.fillStyle = '#eaffef'; ctx.font = `${12*DPR}px Inter, Arial`; ctx.textAlign='center'; ctx.textBaseline='middle';
      const label = String(r.name).replace(/\s{2,}/g,' ').trim();
      ctx.fillText(label, cx + w/2, cy + h/2);
    });

    // watermark
    ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.font = `${11*DPR}px Inter`; ctx.textAlign='right';
    ctx.fillText('SMAN 1 Ngadiluwih • Denah', W - 36*DPR, H - 12*DPR);
  }catch(e){ console.error('drawMapPhoto', e); }
}

/* roundRect helper */
function roundRect(ctx, x, y, w, h, r){
  const radius = Math.min(r, w/2, h/2);
  ctx.beginPath();
  ctx.moveTo(x+radius, y);
  ctx.arcTo(x+w, y, x+w, y+h, radius);
  ctx.arcTo(x+w, y+h, x, y+h, radius);
  ctx.arcTo(x, y+h, x, y, radius);
  ctx.arcTo(x, y, x+w, y, radius);
  ctx.closePath();
}

/* debounce */
function debounce(fn, wait){ let t; return function(...a){ clearTimeout(t); t = setTimeout(()=> fn.apply(this,a), wait); }; }

/* ---------------- Confetti ---------------- */
function initConfetti(){
  try{
    $('#celebrateBtn')?.addEventListener('click', ()=> {
      const cvs = document.createElement('canvas'); cvs.style.position='fixed'; cvs.style.inset=0; cvs.style.zIndex=99998; cvs.style.pointerEvents='none';
      const ctx = cvs.getContext('2d'); document.body.appendChild(cvs); cvs.width = innerWidth; cvs.height = innerHeight;
      const pieces = []; const colors = ['#bfffe0','#67ff9b','#4ef38b','#d6ffd9','#aaffc7'];
      for(let i=0;i<140;i++){ pieces.push({x:Math.random()*cvs.width,y:-20-Math.random()*300,vx:(Math.random()-0.5)*8,vy:Math.random()*6+2,r:Math.random()*9+4,col:colors[Math.floor(Math.random()*colors.length)],rot:Math.random()*360,vr:(Math.random()-0.5)*12}); }
      (function step(){
        ctx.clearRect(0,0,cvs.width,cvs.height);
        for(const p of pieces){ p.x+=p.vx; p.y+=p.vy; p.vy+=0.12; p.rot+=p.vr; ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot*Math.PI/180); ctx.fillStyle=p.col; ctx.fillRect(-p.r/2,-p.r/2,p.r,p.r*0.6); ctx.restore(); }
        for(let i=pieces.length-1;i>=0;i--) if(pieces[i].y > cvs.height+40) pieces.splice(i,1);
        if(pieces.length) requestAnimationFrame(step); else cvs.parentElement && cvs.parentElement.removeChild(cvs);
      })();
    });
    dbgSet('Confetti siap');
  }catch(e){ console.error(e); }
}

/* close modals with ESC */
window.addEventListener('keydown', (e)=> { if(e.key === 'Escape') document.querySelectorAll('.modal-backdrop').forEach(b => b.parentElement && b.parentElement.removeChild(b)); });

/* ----------------- End of merged_denah_script.js ----------------- */

/* USAGE:
  - Pasang <script type="module" src="merged_denah_script.js"></script> di index.html.
  - Pastikan index.html punya: #loader (#loaderPercent,#loaderBar), #app, #map3d, <template id="modal-template">, #particleCanvas, dan tombol dengan id #celebrateBtn jika ingin confetti.
  - (Opsional) Upload denah_parsed.json ke root repo untuk memuat langsung dari file.
*/
