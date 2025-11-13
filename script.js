/* ===========================
   Script utama: interaksi & animasi
   =========================== */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const loadingScreen = document.getElementById('loading-screen');
  const barPath = document.getElementById('barPath');
  const progressNum = document.getElementById('progressNum');
  const navBtns = document.querySelectorAll('.nav-btn');
  const pages = document.querySelectorAll('.page');
  const cards = document.querySelectorAll('.card.interactive');
  const modal = document.getElementById('modal');
  const modalContent = document.getElementById('modalContent');
  const modalClose = document.getElementById('modalClose');
  const bgLayer = document.getElementById('bgLayer');
  const bgMotionToggle = document.getElementById('bgMotionToggle');
  const themeBtn = document.getElementById('themeBtn');
  const yearEl = document.getElementById('year');
  const openMapBtn = document.getElementById('openMapBtn');

  // set year
  yearEl.textContent = new Date().getFullYear();

  // Loading progress (0 -> 100) with lively steps
  let progress = 0;
  const loadingInterval = setInterval(() => {
    // accelerate and decelerate
    const step = Math.max(1, Math.ceil((100 - progress) * (0.04 + Math.random() * 0.08)));
    progress = Math.min(100, progress + step);
    updateProgress(progress);
    if (progress >= 100) {
      clearInterval(loadingInterval);
      // leave for a short moment then hide
      setTimeout(() => {
        loadingScreen.style.opacity = '0';
        loadingScreen.style.pointerEvents = 'none';
        setTimeout(() => loadingScreen.style.display = 'none', 600);
      }, 600);
      // show subtle confetti burst
      confettiBurst();
    }
  }, 35);

  function updateProgress(p){
    progressNum.textContent = `${p}%`;
    // animate svg stroke-dashoffset (100->0)
    const dash = Math.max(0, 100 - p);
    barPath.style.strokeDashoffset = dash;
  }

  // confetti (simple DOM pieces)
  function confettiBurst(){
    const root = document.getElementById('confetti-root');
    if(!root) return;
    const N = 42;
    for(let i=0;i<N;i++){
      const el = document.createElement('span');
      el.className = 'confetti';
      el.style.position='absolute';
      el.style.left = (10 + Math.random()*80)+'%';
      el.style.top = (10 + Math.random()*30)+'%';
      el.style.width = (6 + Math.random()*8)+'px';
      el.style.height = (10 + Math.random()*14)+'px';
      el.style.background = `hsl(${Math.floor(Math.random()*360)},70%,55%)`;
      el.style.transform = `rotate(${Math.floor(Math.random()*360)}deg)`;
      el.style.opacity = 0.95;
      el.style.borderRadius = '2px';
      el.style.zIndex = 998;
      el.style.transition = `transform 1.8s cubic-bezier(.2,.9,.2,1), opacity 1.8s linear`;
      root.appendChild(el);
      // animate
      setTimeout(()=> {
        el.style.transform = `translateY(${120 + Math.random()*200}px) rotate(${Math.random()*1080}deg)`;
        el.style.opacity = 0;
      }, 20 + Math.random()*200);
      setTimeout(()=> el.remove(), 2200 + Math.random()*400);
    }
  }

  // Simple page switch with slide effect
  function showPage(id){
    pages.forEach(p => {
      if(p.id === id){
        // slide in
        p.classList.add('active');
        p.style.opacity = 0;
        p.style.transform = 'translateY(12px)';
        requestAnimationFrame(()=> {
          p.style.transition = 'opacity .35s ease, transform .35s ease';
          p.style.opacity = 1;
          p.style.transform = 'translateY(0)';
        });
      } else {
        p.classList.remove('active');
        p.style.opacity = '';
        p.style.transform = '';
        p.style.transition = '';
      }
    });

    // update nav active state
    navBtns.forEach(b => b.classList.toggle('active', b.dataset.page === id));
  }

  // attach nav events
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => showPage(btn.dataset.page));
  });

  // cards open respective pages
  cards.forEach(c => {
    c.addEventListener('click', () => {
      const page = c.dataset.page || c.getAttribute('data-page');
      if(page) showPage(page);
      // subtle pulse
      c.animate([{ transform:'scale(1)' }, { transform:'scale(.98)' }, { transform:'scale(1)' }], { duration:260 });
    });
  });

  // default open home
  showPage('home');

  // modal helpers (tap-app)
  function openModal(html){
    modalContent.innerHTML = html;
    modal.setAttribute('aria-hidden','false');
  }
  function closeModal(){
    modal.setAttribute('aria-hidden','true');
    modalContent.innerHTML = '';
  }
  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if(e.target === modal) closeModal(); });

  // tap-app actions for Ajeng & DJ (delegation)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if(!btn) return;
    const action = btn.dataset.action;
    const person = btn.dataset.person;

    if(action === 'open-profile'){
      if(person === 'ajeng'){
        openModal(`<h3>Ajeng Febria • Aplikasi Profil</h3>
          <p><strong>Tentang:</strong> Ajeng merupakan sosok kreatif... (isi lengkap di sekolah)</p>
          <p><strong>Kontak (contoh):</strong> ajeng@sman1ngadiluwih.sch.id</p>
          <div style="margin-top:12px"><button onclick="shareProfile('ajeng')">Bagikan Profil</button></div>`);
      } else if(person === 'dj'){
        openModal(`<h3>DJ Lancar • Aplikasi Musik</h3>
          <p><strong>Ringkasan:</strong> DJ Lancar siap membuat event meriah. Gunakan tombol putar untuk sample musik.</p>
          <div style="margin-top:12px"><button id="modalPlayDj">Putar Sample</button></div>`);
        // attach play handler after modal added
        setTimeout(()=> {
          const mp = document.getElementById('modalPlayDj');
          if(mp) mp.addEventListener('click', () => {
            const audio = document.getElementById('djSample');
            if(audio){ audio.play(); }
          });
        },50);
      }
    }

    if(action === 'play-sample' && person === 'dj'){
      const audio = document.getElementById('djSample');
      if(audio){
        if(audio.paused) { audio.play(); btn.textContent = 'Pause Sample'; }
        else { audio.pause(); btn.textContent = 'Putar Sample Musik'; }
      } else {
        alert('File sample tidak tersedia (letakkan file sample-dj-loop.mp3 pada folder yang sama).');
      }
    }

    if(action === 'share'){
      if(person === 'ajeng'){
        shareProfile('ajeng');
      } else if(person === 'dj'){
        shareProfile('dj');
      }
    }
  });

  window.shareProfile = function(name){
    // very simple share simulation
    const text = name === 'ajeng' ? 'Profil Ajeng Febria — SMAN1 Ngadiluwih' : 'Profil DJ Lancar — SMAN1 Ngadiluwih';
    if(navigator.share){
      navigator.share({ title:'Profil', text, url: location.href }).catch(()=>{});
    } else {
      navigator.clipboard.writeText(text + ' — ' + location.href).then(()=> alert('Tautan disalin ke clipboard'));
    }
  }

  // modal open from cards
  document.getElementById('openAjeng').addEventListener('click', ()=> showPage('ajeng'));
  document.getElementById('openDj').addEventListener('click', ()=> showPage('dj'));

  // theme toggle: for demo we swap accent colors
  themeBtn.addEventListener('click', ()=> {
    const root = document.documentElement;
    const current = getComputedStyle(root).getPropertyValue('--accent').trim();
    if(current === '#00ff88') root.style.setProperty('--accent', '#66ccff');
    else root.style.setProperty('--accent', '#00ff88');
  });

  // bg motion toggle
  bgMotionToggle.addEventListener('change', (e) => {
    bgLayer.style.animationPlayState = e.target.checked ? 'running' : 'paused';
  });

  // open google maps (sample)
  openMapBtn.addEventListener('click', ()=> {
    const q = encodeURIComponent('SMAN 1 Ngadiluwih Kediri');
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank');
  });

  /* ===========================
     Denah mode: CSS 3D / Three.js
     =========================== */
  const denahRadios = document.querySelectorAll('input[name="denahMode"]');
  const denahCSS = document.getElementById('denahCSS');
  const denahThree = document.getElementById('denahThree');

  denahRadios.forEach(r => r.addEventListener('change', (e) => {
    if(e.target.value === 'css'){
      denahCSS.style.display = 'flex';
      denahThree.style.display = 'none';
    } else {
      denahCSS.style.display = 'none';
      denahThree.style.display = 'block';
      initThreeDenah(); // initialize three.js scene
    }
  }));

  /* ===========================
     Three.js denah initialization (simple scene)
     =========================== */
  let threeInitialized = false;
  function initThreeDenah(){
    if(threeInitialized) return;
    threeInitialized = true;

    const canvas = document.getElementById('threeCanvas');
    if(!canvas) return;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
    renderer.setPixelRatio(window.devicePixelRatio);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x021209);

    const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.set(0, 40, 60);

    // lights
    const amb = new THREE.AmbientLight(0xffffff, 0.6); scene.add(amb);
    const dir = new THREE.DirectionalLight(0xffffff, 0.6); dir.position.set(30,50,30); scene.add(dir);

    // ground
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(120,80), new THREE.MeshStandardMaterial({ color:0x034022 }));
    ground.rotation.x = -Math.PI/2; scene.add(ground);

    // simple blocks
    const matMain = new THREE.MeshStandardMaterial({ color:0x66ffb3, metalness:0.1, roughness:0.6 });
    const matLab = new THREE.MeshStandardMaterial({ color:0xffd166, metalness:0.1, roughness:0.6 });

    const b1 = new THREE.Mesh(new THREE.BoxGeometry(20,8,12), matMain); b1.position.set(-18,4,0); scene.add(b1);
    const b2 = new THREE.Mesh(new THREE.BoxGeometry(14,6,10), matLab); b2.position.set(18,3,6); scene.add(b2);

    // simple orbit controls (lightweight)
    let isDragging=false;
    let previousMousePos={x:0,y:0};
    canvas.addEventListener('pointerdown', (e)=> { isDragging=true; previousMousePos={x:e.clientX,y:e.clientY}; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointerup', (e)=> { isDragging=false; canvas.releasePointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove', (e)=> {
      if(!isDragging) return;
