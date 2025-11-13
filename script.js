// script.js — robust loading (1..100) + initialize Three.js denah after loading
document.addEventListener('DOMContentLoaded', () => {
  const loadingScreen = document.getElementById('loading-screen');
  const progressNum = document.getElementById('progressNum');
  const barFill = document.getElementById('barFill');
  const progressStroke = document.getElementById('progressStroke');
  const app = document.getElementById('app');
  const yearEl = document.getElementById('year');

  if(yearEl) yearEl.textContent = new Date().getFullYear();

  // Safety: if elements missing, avoid errors
  if(!loadingScreen || !progressNum || !barFill || !progressStroke || !app) {
    console.warn('Elemen loading atau app tidak ditemukan — pastikan HTML sesuai.');
    // still attempt to init app
    app.classList.remove('hidden');
    init3DMapIfAvailable();
    return;
  }

  // Nonlinear progress simulation (fast start, slow end)
  let progress = 0;
  const minInterval = 25; // ms between ticks
  let tickTimeout = null;

  function tick() {
    // compute step: larger when far, small when near 100 for drama
    const remaining = 100 - progress;
    const randomness = Math.random() * 0.06 + 0.03; // 0.03..0.09
    const step = Math.max(1, Math.ceil(remaining * randomness));
    progress = Math.min(100, progress + step);

    // update UI
    progressNum.textContent = `${progress}%`;
    barFill.style.width = `${progress}%`;

    // svg circle strokeDashoffset (dasharray 100)
    const dash = Math.max(0, 100 - progress);
    progressStroke.style.strokeDashoffset = `${dash}`;

    // decorative change to loader subtext near finish
    const loaderSub = document.getElementById('loaderSub');
    if(loaderSub) {
      if(progress < 70) loaderSub.textContent = 'Memuat aset & efek…';
      else if(progress < 95) loaderSub.textContent = 'Mengoptimalkan tampilan…';
      else loaderSub.textContent = 'Hampir selesai — selamat menikmati!';
    }

    if(progress < 100) {
      tickTimeout = setTimeout(tick, minInterval + Math.random()*40);
    } else {
      // small pause so user sees 100%
      setTimeout(finalizeLoad, 500);
    }
  }

  function finalizeLoad() {
    // fade out loading screen
    loadingScreen.style.transition = 'opacity 600ms ease';
    loadingScreen.style.opacity = '0';
    // show app
    app.classList.remove('hidden');
    // after opacity transition remove from DOM flow
    setTimeout(() => {
      loadingScreen.style.display = 'none';
      // init 3D map after loading removed
      init3DMapIfAvailable();
    }, 650);
  }

  // Start ticking
  tick();

  // --- Three.js denah initialization (simple interactive map) ---
  function init3DMapIfAvailable() {
    const mapEl = document.getElementById('map3D');
    if(!mapEl) return;

    // prepare renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(mapEl.clientWidth, mapEl.clientHeight, false);
    mapEl.appendChild(renderer.domElement);

    // scene & camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x021209);
    const camera = new THREE.PerspectiveCamera(45, mapEl.clientWidth / mapEl.clientHeight, 0.1, 1000);
    camera.position.set(0, 30, 60);

    // lights
    const amb = new THREE.AmbientLight(0xffffff, 0.55); scene.add(amb);
    const dir = new THREE.DirectionalLight(0xffffff, 0.6); dir.position.set(30, 40, 10); scene.add(dir);

    // ground (green base)
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x053016, roughness: 0.8 });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(140, 90), groundMat);
    ground.rotation.x = -Math.PI / 2; ground.position.y = -0.5; scene.add(ground);

    // sample "buildings" – create a few boxes representing the school layout
    function makeBox(w,h,d, color) {
      const geo = new THREE.BoxGeometry(w, h, d);
      const mat = new THREE.MeshStandardMaterial({ color, metalness: 0.1, roughness: 0.7 });
      return new THREE.Mesh(geo, mat);
    }

    const main = makeBox(24, 8, 14, 0x66ffb3); main.position.set(-22, 4, 0); scene.add(main);
    const lab  = makeBox(16, 6, 10, 0xffd166); lab.position.set(14, 3, -6); scene.add(lab);
    const field = makeBox(60, 1, 30, 0xa9f6b7); field.position.set(8, 0.5, 22); scene.add(field);

    // markers / labels (simple sprite)
    function makeLabel(text, pos) {
      const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d');
      canvas.width = 256; canvas.height = 64;
      ctx.fillStyle = 'rgba(0,0,0,0)';
      ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.font = 'bold 28px Poppins, sans-serif';
      ctx.fillStyle = '#e9fff1';
      ctx.fillText(text, 10, 38);
      const tex = new THREE.CanvasTexture(canvas);
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
      const sp = new THREE.Sprite(mat);
      sp.scale.set(18, 4.5, 1);
      sp.position.set(pos.x, pos.y, pos.z);
      scene.add(sp);
    }
    makeLabel('Gedung Utama', {x:-22, y:9.5, z:0});
    makeLabel('Laboratorium', {x:14, y:7.5, z:-6});
    makeLabel('Lapangan', {x:8, y:2.5, z:22});

    // orbit-like simple interaction (drag rotate & wheel zoom)
    let isDrag=false, prevX=0, prevY=0;
    renderer.domElement.style.touchAction = 'none';
    renderer.domElement.addEventListener('pointerdown', (e)=>{ isDrag=true; prevX=e.clientX; prevY=e.clientY; renderer.domElement.setPointerCapture(e.pointerId); });
    renderer.domElement.addEventListener('pointerup', (e)=>{ isDrag=false; renderer.domElement.releasePointerCapture(e.pointerId); });
    renderer.domElement.addEventListener('pointermove', (e)=> {
      if(!isDrag) return;
      const dx = e.clientX - prevX; const dy = e.clientY - prevY;
      prevX = e.clientX; prevY = e.clientY;
      // rotate camera around center
      const angleY = dx * 0.005;
      camera.position.applyAxisAngle(new THREE.Vector3(0,1,0), angleY);
      camera.position.y += dy * 0.02;
      camera.lookAt(0,0,0);
    });
    // wheel zoom
    renderer.domElement.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY * 0.01;
      camera.position.addScaledVector(camera.getWorldDirection(new THREE.Vector3()), delta * 6);
    }, { passive:false });

    // responsive
    const ro = new ResizeObserver(()=> {
      renderer.setSize(mapEl.clientWidth, mapEl.clientHeight, false);
      camera.aspect = mapEl.clientWidth / mapEl.clientHeight;
      camera.updateProjectionMatrix();
    });
    ro.observe(mapEl);

    // animate
    (function animate() {
      requestAnimationFrame(animate);
      // gentle rotation of field for subtle motion
      field.rotation.y += 0.001;
      renderer.render(scene, camera);
    })();
  }

  // Expose for manual init (if needed)
  window.init3DMapIfAvailable = init3DMapIfAvailable;
});
