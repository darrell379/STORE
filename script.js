/* GLOBAL UI + FEATURES: loading, music control, theme toggle, chat, fireworks */

// ----- LOADING SCREEN ----- //
window.addEventListener("load", () => {
  // ensure canvas sized before hide
  resizeCanvas();
  setTimeout(() => {
    document.getElementById("loading").style.display = "none";
    document.getElementById("main-content").classList.remove("hidden");
    // start music after UI shown (some browsers require user gesture; we'll try)
    tryPlayMusic();
    // show chat after a bit
    setTimeout(() => openChat(), 2200);
  }, 1800);
});

// ----- MUSIC CONTROLS ----- //
const audio = document.getElementById("bg-music");
const musicToggle = document.getElementById("music-toggle");
const muteToggle = document.getElementById("mute-toggle");
let isPlaying = false;
let isMuted = false;

function tryPlayMusic(){
  audio.play().then(() => {
    isPlaying = true;
    musicToggle.textContent = "⏸ Pause";
  }).catch(()=> {
    // autoplay blocked — show play button state
    isPlaying = false;
    musicToggle.textContent = "⏯ Play";
  });
}

musicToggle.addEventListener("click", () => {
  if(isPlaying){ audio.pause(); musicToggle.textContent = "⏯ Play"; isPlaying=false; }
  else { audio.play(); musicToggle.textContent = "⏸ Pause"; isPlaying=true; }
});
muteToggle.addEventListener("click", () => {
  isMuted = !isMuted;
  audio.muted = isMuted;
  muteToggle.textContent = isMuted ? "🔈 Muted" : "🔊";
});

// ----- THEME / NIGHT MODE ----- //
const themeToggle = document.getElementById("theme-toggle");
let darkMode = false;
themeToggle.addEventListener("click", () => {
  darkMode = !darkMode;
  if(darkMode){
    document.documentElement.style.setProperty('--pink-1','#2b2b3a');
    document.documentElement.style.setProperty('--pink-2','#11111b');
    document.body.style.background = "linear-gradient(135deg,#0b0b12,#1a1a2b)";
    themeToggle.textContent = "☀️ Mode Terang";
  } else {
    // restore defaults
    document.documentElement.style.setProperty('--pink-1','#ffb6d9');
    document.documentElement.style.setProperty('--pink-2','#ff66a3');
    document.body.style.background = "linear-gradient(135deg,#ffe6f2,#ffffff)";
    themeToggle.textContent = "🌙 Mode Malam";
  }
});

// ----- SMOOTH SCROLL ----- //
function scrollToSection(id){
  document.getElementById(id).scrollIntoView({behavior:'smooth'});
}

// ----- CHAT POPUP (simple simulated) ----- //
const chatPopup = document.getElementById("chat-popup");
const chatBody = document.getElementById("chat-body");
const chatInput = document.getElementById("chat-input");

function openChat(){
  chatPopup.classList.remove('hidden');
}
document.getElementById('chat-close')?.addEventListener('click', () => {
  chatPopup.classList.add('hidden');
});
chatInput && chatInput.addEventListener('keypress', (e) => {
  if(e.key === 'Enter' && chatInput.value.trim()){
    const user = document.createElement('p');
    user.innerHTML = `<b>Kamu:</b> ${escapeHtml(chatInput.value)}`;
    chatBody.appendChild(user);
    chatBody.scrollTop = chatBody.scrollHeight;
    const reply = document.createElement('p');
    reply.innerHTML = `<b>Panitia:</b> Terima kasih! Info tiket dan lokasi sudah kami catat. 😉`;
    setTimeout(()=>{ chatBody.appendChild(reply); chatBody.scrollTop = chatBody.scrollHeight; }, 800);
    chatInput.value = '';
  }
});
function escapeHtml(str){ return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// ----- FIREWORKS (simple particle system) ----- //
const canvas = document.getElementById('fireworks');
const ctx = canvas.getContext('2d');
let W = canvas.width = window.innerWidth;
let H = canvas.height = window.innerHeight;
let particles = [];

function resizeCanvas(){
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);

function createFirework(){
  const cx = Math.random() * W;
  const cy = Math.random() * H * 0.5;
  const hue = Math.floor(Math.random() * 360);
  for(let i=0;i<60;i++){
    const angle = (i/60) * Math.PI * 2;
    particles.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * (Math.random()*4 + 2),
      vy: Math.sin(angle) * (Math.random()*4 + 2),
      life: Math.random()*40+40,
      hue: hue + Math.random()*40 - 20
    });
  }
}
function render(){
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.fillRect(0,0,W,H);
  for(let i=particles.length-1;i>=0;i--){
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy + 0.6; // gravity-ish
    p.vx *= 0.99;
    p.vy *= 0.99;
    p.life--;
    const alpha = Math.max(0, p.life/80);
    ctx.beginPath();
    ctx.fillStyle = `hsla(${p.hue}, 100%, 65%, ${alpha})`;
    ctx.arc(p.x,p.y, Math.max(1, p.life/20), 0, Math.PI*2);
    ctx.fill();
    if(p.life <= 0) particles.splice(i,1);
  }
  requestAnimationFrame(render);
}
setInterval(createFirework, 1400);
render();

// ----- Attempt autoplay best-effort, browsers may block until user gesture ----- //
document.addEventListener('click', tryPlayMusic, {once:true});
