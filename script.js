/* SCRIPT PERBAIKAN DENAH — debug-friendly
   Ganti seluruh script.js dengan ini, lalu reload index.html
*/

const $ = (s, ctx=document) => ctx.querySelector(s);
const $$ = (s, ctx=document) => Array.from((ctx||document).querySelectorAll(s));

/* ---------- small debug panel (visible on page) ---------- */
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
  dbg.innerText = 'Denah: menunggu...';
  document.body.appendChild(dbg);
})();

function debug(msg){
  console.log('[DENAH]', msg);
  const dbg = $('#denah-debug');
  if(dbg) dbg.innerText = typeof msg === 'string' ? `Denah: ${msg}` : `Denah: ${JSON.stringify(msg).slice(0,200)}`;
}

/* ---------- sample embedded fallback (only used if fetch fails) ---------- */
/* If you already have denahRooms embedded, this will be replaced by your full array.
   For brevity here is a short fallback example — real array will be used when available. */
const embeddedFallback = [
  {name: 'R.01', col: 4, row: 11, w:1, h:1},
  {name: 'PERPUS', col: 4, row: 18, w:1, h:1},
  {name: 'LAB KOMPUTER', col: 6, row: 14, w:1, h:1}
];

/* ---------- Try to load denah from denah_parsed.json (optional) ---------- */
async function loadDenahData(){
  // 1) if variable denahRooms already exists (from previous embed), use it
  if(typeof denahRooms !== 'undefined' && Array.isArray(denahRooms) && denahRooms.length){
    debug(`Menggunakan denahRooms embedded (${denahRooms.length} entri)`);
    return denahRooms;
  }

  // 2) try fetch local denah_parsed.json (put this file in same folder as index.html)
  try {
    debug('Mencoba fetch denah_parsed.json...');
    const resp = await fetch('denah_parsed.json', {cache: 'no-store'});
    if(resp.ok){
      const j = await resp.json();
      if(j.rooms && Array.isArray(j.rooms) && j.rooms.length){
        debug(`denah_parsed.json dimuat (${j.rooms.length} entri)`);
        return j.rooms;
      }
      // maybe the JSON itself is array
      if(Array.isArray(j) && j.length){
        debug(`denah_parsed.json (array) dimuat (${j.length} entri)`);
        return j;
      }
    } else {
      debug(`denah_parsed.json tidak ditemukan (status ${resp.status})`);
    }
  } catch(err){
    debug('Fetch denah_parsed.json gagal: ' + err.message);
    // continue to fallback
  }

  // 3) fallback to embeddedFallback
  debug('Menggunakan fallback embedded kecil (' + embeddedFallback.length + ' entri)');
  return embeddedFallback;
}

/* ---------- renderDenah (robust) ---------- */
function renderDenah(mapEl, rooms){
  if(!mapEl){
    debug('Elemen #map3d tidak ditemukan di DOM');
    return;
  }
  if(!rooms || !rooms.length){
    debug('Data rooms kosong — tidak ada yang dirender');
    mapEl.innerHTML = '<div style="color:#bfffe0;padding:18px">Tidak ada data denah untuk ditampilkan.</div>';
    return;
  }

  debug(`Render denah ke elemen (rooms: ${rooms.length})`);
  mapEl.innerHTML = '';

  // create container
  const inner = document.createElement('div');
  inner.className = 'map3d-inner';
  inner.style.position = 'absolute';
  inner.style.left = '50%';
  inner.style.top = '50%';
  inner.style.transform = 'translate(-50%,-50%) rotateX(14deg) rotateY(-18deg)';
  inner.style.transformStyle = 'preserve-3d';
  mapEl.appendChild(inner);

  // compute grid bounding boxes (use min/max)
  const cols = Math.max(...rooms.map(r=>r.col)) - Math.min(...rooms.map(r=>r.col)) + 1;
  const rows = Math.max(...rooms.map(r=>r.row)) - Math.min(...rooms.map(r=>r.row)) + 1;
  const minCol = Math.min(...rooms.map(r=>r.col));
  const minRow = Math.min(...rooms.map(r=>r.row));

  // set cell size based on container
  const rect = mapEl.getBoundingClientRect();
  const pad = 28;
  const usableW = Math.max(240, rect.width - pad*2);
  const usableH = Math.max(160, rect.height - pad*2);
  const cellW = Math.floor(usableW / Math.max(1, cols));
  const cellH = Math.floor(usableH / Math.max(1, rows));
  const cell = Math.max(44, Math.min(cellW, cellH));
  inner.style.width = (cols * cell) + 'px';
  inner.style.height = (rows * cell) + 'px';

  // create tooltip element
  let tooltip = null;
  function showTooltip(x,y,html){
    if(!tooltip){
      tooltip = document.createElement('div');
      tooltip.className = 'denah-tooltip';
      // minimal inline styles to ensure visibility even if CSS missing
      tooltip.style.position='fixed';
      tooltip.style.pointerEvents='none';
      tooltip.style.padding='8px 10px';
      tooltip.style.borderRadius='8px';
      tooltip.style.background='rgba(3,20,12,0.96)';
      tooltip.style.color='#bfffe0';
      tooltip.style.zIndex='999999';
      tooltip.style.fontSize='13px';
      document.body.appendChild(tooltip);
    }
    tooltip.innerHTML = html;
    tooltip.style.left = (x + 8) + 'px';
    tooltip.style.top = (y - 12) + 'px';
    tooltip.style.display = 'block';
  }
  function hideTooltip(){ if(tooltip) tooltip.style.display = 'none'; }

  // add rooms
  rooms.forEach(r => {
    const d = document.createElement('div');
    d.className = 'denah-room';
    d.textContent = r.name;
    // position
    const x = (r.col - minCol) * cell;
    const y = (r.row - minRow) * cell;
    const w = (r.w || 1) * cell - 8;
    const h = (r.h || 1) * cell - 8;
    d.style.position = 'absolute';
    d.style.left = (x + 4) + 'px';
    d.style.top = (y + 4) + 'px';
    d.style.width = w + 'px';
    d.style.height = h + 'px';
    d.style.lineHeight = Math.max(14, Math.min(20, h - 6)) + 'px';
    d.style.borderRadius = '8px';
    d.style.padding = '6px';
    d.style.boxSizing = 'border-box';
    d.style.cursor = 'pointer';
    d.style.background = 'linear-gradient(180deg, rgba(110,255,170,0.06), rgba(2,20,12,0.12))';
    d.style.border = '1px solid rgba(103,255,155,0.06)';
    d.style.color = '#eaffef';
    d.style.fontWeight = '700';
    d.style.fontSize = '12px';
    d.style.textAlign = 'center';
    d.addEventListener('click', ()=> openRoomModal(r));
    d.addEventListener('mousemove', (ev)=> showTooltip(ev.clientX, ev.clientY, `<strong>${escapeHtml(r.name)}</strong>`));
    d.addEventListener('mouseleave', hideTooltip);
    inner.appendChild(d);
  });

  // pointer-drag rotate (3D feel)
  let dragging=false, lastX=0, lastY=0, rx=14, ry=-18;
  inner.style.transform = `translate(-50%,-50%) rotateX(${rx}deg) rotateY(${ry}deg)`;
  mapEl.addEventListener('pointerdown', e => { dragging=true; lastX=e.clientX; lastY=e.clientY; mapEl.setPointerCapture?.(e.pointerId); });
  window.addEventListener('pointerup', ()=> dragging=false);
  window.addEventListener('pointermove', e => {
    if(!dragging) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY; lastX = e.clientX; lastY = e.clientY;
    ry += dx * 0.08; rx -= dy * 0.06; rx = Math.max(-30, Math.min(60, rx));
    inner.style.transform = `translate(-50%,-50%) rotateX(${rx}deg) rotateY(${ry}deg)`;
  });

  // expose reset if button exists
  const resetBtn = $('#resetView');
  if(resetBtn) resetBtn.onclick = ()=> { rx=14; ry=-18; inner.style.transform = `translate(-50%,-50%) rotateX(${rx}deg) rotateY(${ry}deg)`; };

  debug('Denah dirender (sel ' + cell + 'px)');
}

/* ---------- helper: open modal for room ---------- */
function openRoomModal(r){
  const tpl = $('#modal-template');
  if(!tpl){
    alert('Modal template tidak ditemukan. Nama ruang: ' + r.name);
    return;
  }
  const clone = tpl.content.cloneNode(true);
  const backdrop = clone.querySelector('.modal-backdrop');
  const close = clone.querySelector('.modal-close');
  const content = clone.querySelector('.modal-content');
  content.innerHTML = `<h3 style="margin-top:0;color:#67ff9b">${escapeHtml(r.name)}</h3>
    <p><strong>Grid:</strong> col ${r.col}, row ${r.row}</p>
    <p>Informasi tambahan dapat kamu tambahkan di Excel lalu saya update denah.</p>
    <div style="text-align:right;margin-top:12px"><button class="glass-btn modal-ok">Tutup</button></div>`;
  close.addEventListener('click', ()=> backdrop.parentElement.removeChild(backdrop));
  backdrop.addEventListener('click', e=> { if(e.target === backdrop) backdrop.parentElement.removeChild(backdrop); });
  document.body.appendChild(backdrop);
  backdrop.querySelector('.modal-ok')?.addEventListener('click', ()=> backdrop.parentElement.removeChild(backdrop));
}

/* ---------- escape html ---------- */
function escapeHtml(s){ return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]); }

/* ---------- initialize map when DOM ready ---------- */
document.addEventListener('DOMContentLoaded', async ()=>{
  debug('DOMContentLoaded — memulai inisialisasi denah');
  const rooms = await loadDenahData();
  // find map element (panel-denah might be hidden initially)
  const mapEl = document.getElementById('map3d');
  if(!mapEl){
    debug('Gagal: elemen #map3d tidak ditemukan. Pastikan index.html memiliki <div id=\"map3d\" class=\"map3d\">');
    return;
  }
  // Render now (also re-render when panel becomes active)
  renderDenah(mapEl, rooms);

  // Re-render when panel aktivasi (in case panel was off-screen)
  const observer = new MutationObserver(()=> {
    // if panel becomes visible, re-render to ensure sizes correct
    const panel = document.querySelector('.panel.active');
    if(panel && panel.dataset.name === 'denah'){
      debug('Panel denah aktif — re-render denah to fit container');
      setTimeout(()=> renderDenah(mapEl, rooms), 120);
    }
  });
  observer.observe(document.getElementById('panels') || document.body, { attributes:true, subtree:true, childList:true });

  // Rerender on resize
  window.addEventListener('resize', ()=> setTimeout(()=> renderDenah(mapEl, rooms), 120));
  debug('Inisialisasi denah selesai');
});

/* ---------- fallback console instruction to user ---------- */
console.log('Jika denah masih tidak muncul: buka Console (F12 → Console) dan kirim log terakhirnya ke aku. Aku perbaiki sesuai pesan error.');
