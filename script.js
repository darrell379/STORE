/* Main interactions, animations, UI wiring (no external libs) */
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const loading = document.getElementById('loading-screen');
  const barPath = document.getElementById('barPath');
  const progressNum = document.getElementById('progressNum');
  const confettiRoot = document.getElementById('confetti-root');
  const app = document.getElementById('app');
  const navBtns = document.querySelectorAll('.nav-btn');
  const pages = document.querySelectorAll('.page');
  const panels = document.querySelectorAll('.panel');
  const openGallery = document.getElementById('openGallery');
  const modal = document.getElementById('modal');
  const modalInner = document.getElementById('modalInner');
  const modalClose = document.getElementById('modalClose');
  const themeToggle = document.getElementById('themeToggle');
  const bgPhoto = document.getElementById('bgPhoto');
  const particlesCanvas = document.getElementById('particles');
  const miniPlay = document.getElementById('miniPlay');
  const miniPlayer = document.getElementById('miniPlayer');
  const playBtn = document.getElementById('playBtn');

  // YEAR
  document.getElementById('year').textContent = new Date().getFullYear();

  // Loading simulation ( lively steps )
  let p = 0;
  const loadInt = setInterval(()=> {
    const step = Math.max(1, Math.ceil((100 - p) * (0.05 + Math.random()*0.06)));
    p = Math.min(100, p + step);
    progressNum.textContent = `${p}%`;
    barPath.style.strokeDashoffset = Math.max(0, 100 - p);
    if(p >= 100){
      clearInterval(loadInt);
      setTimeout(()=> {
        loading.style.opacity = 0;
        loading.setAttribute('aria-hidden','true');
        setTimeout(()=> loading.style.display = 'none', 600);
        app.setAttribute('aria-hidden','false');
        confettiBurst();
      }, 600);
    }
  }, 35);

  function confettiBurst(){
    if(!confettiRoot) return;
    for(let i=0;i<40;i++){
      const el = document.createElement('span');
      el.style.position='absolute';
      el.style.left = (10 + Math.random()*80) + '%';
      el.style.top = (10 + Math.random()*20) + '%';
      el.style.width = (6 + Math.random()*8) + 'px';
      el.style.height = (10 + Math.random()*14) + 'px';
      el.style.background = `hsl(${Math.floor(Math.random()*360)},70%,55%)`;
      el.style.transform = `rotate(${Math.floor(Math.random()*360)}deg)`;
      el.style.borderRadius = '2px';
      el.style.transition = 'transform 1.8s cubic-bezier(.2,.9,.2,1), opacity 1.8s linear';
      confettiRoot.appendChild(el);
      setTimeout(()=> { el.style.transform = `translateY(${120 + Math.random()*200}px) rotate(${Math.random()*1080}deg)`; el.style.opacity = 0; }, 20 + Math.random()*200);
      setTimeout(()=> el.remove(), 2400);
    }
  }

  /* Page switching with slide/fade */
  function showPage(id){
    pages.forEach(p => {
      if(p.id === id){
        p.classList.add('active');
        p.style.opacity = 0;
        p.style.transform = 'translateY(12px)';
        requestAnimationFrame(()=> {
          p.style.transition = 'opacity .36s ease, transform .36s ease';
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
    navBtns.forEach(b => b.classList.toggle('active', b.dataset.page === id));
  }

  navBtns.forEach(btn => btn.addEventListener('click', ()=> showPage(btn.dataset.page)));
  panels.forEach(panel => panel.addEventListener('click', ()=> showPage(panel.dataset.page)));

  // quick scroll from hero CTA
  document.querySelectorAll('[data-scroll]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-scroll');
      showPage(id);
    });
  });

  // open gallery modal (demo images)
  if(openGallery) openGallery.addEventListener('click', ()=> {
    openModalGallery();
  });
  document.getElementById('openGalleryFooter')?.addEventListener('click', openModalGallery);

  function openModalGallery(){
    const html = `
      <h3>Galeri Sekolah</h3>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">
        <img src="school-1.jpg" style="width:30%;border-radius:8px" />
        <img src="school-2.jpg" style="width:30%;border-radius:8px" />
        <img src="school-3.jpg" style="width:30%;border-radius:8px" />
      </div>
      <p class="muted" style="margin-top:10px">Ganti gambar ini dengan foto resmi sekolah untuk galeri lengkap.</p>
    `;
    openModal(html);
  }

  // modal helpers
  function openModal(html){
    modalInner.innerHTML = html;
    modal.setAttribute('aria-hidden','false');
  }
  function closeModal(){
    modal.setAttribute('aria-hidden','true');
    modalInner.innerHTML = '';
  }
  if(modalClose) modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if(e.target === modal) closeModal(); });

  // theme toggle (switch accent)
  themeToggle.addEventListener('click', ()=> {
    const root = document.documentElement;
    const cur = getComputedStyle(root).getPropertyValue('--accent').trim();
    if(cur === '#00ff88') root.style.setProperty('--accent', '#66ccff');
    else root.style.setProperty('--accent', '#00ff88');
  });

  // openMap button
  document.getElementById('openMap')?.addEventListener('click', ()=> {
    const q = encodeURIComponent('SMAN 1 Ngadiluwih Kediri');
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank');
  });

  // artist actions (delegation)
  document.addEventListener('click', (e)=> {
    const btn = e.target.closest('[data-action]');
    if(!btn) return;
    const action = btn.dataset.action;
    const person = btn.dataset.person;
    if(action === 'openProfile'){
      if
