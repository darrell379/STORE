// helper for scrolling
function scrollTo(sel){ document.querySelector(sel).scrollIntoView({behavior:'smooth'}); }

// NAV mobile toggle
const menuToggle = document.getElementById('menu-toggle');
menuToggle && menuToggle.addEventListener('click', ()=> {
  const nav = document.querySelector('.nav-links');
  if(nav.style.display === 'flex') nav.style.display = 'none'; else nav.style.display = 'flex';
});

// Modal
function openModal(title, text){
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-text').textContent = text;
  document.getElementById('modal').classList.remove('hidden');
}
function closeModal(){
  document.getElementById('modal').classList.add('hidden');
}

// toggle detail quick-scroll
function toggleDetail(id){
  const el = document.getElementById(id);
  if(el) el.scrollIntoView({behavior:'smooth'});
}

// audio control
const bgAudio = document.getElementById('bgAudio');
const playBtn = document.getElementById('playBtn');
let playing = false;
playBtn.addEventListener('click', async () => {
  try {
    if(!playing){ await bgAudio.play(); playBtn.textContent = '⏸ Pause'; playing = true; }
    else { bgAudio.pause(); playBtn.textContent = '▶️ Putar Musik'; playing = false; }
  } catch(e){ alert('Autoplay diblokir — klik halaman lalu coba lagi.'); }
});

// Chat AI logic (simple + math)
const chatOutput = document.getElementById('chatOutput');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');

function appendMsg(role, text){
  const p = document.createElement('div');
  p.className = 'msg';
  p.innerHTML = <strong>${role}:</strong> ${text};
  chatOutput.appendChild(p);
  chatOutput.scrollTop = chatOutput.scrollHeight;
}

sendBtn.addEventListener('click', handleChat);
chatInput.addEventListener('keydown', (e)=> { if(e.key === 'Enter') handleChat(); });

function handleChat(){
  const question = (chatInput.value || '').trim();
  if(!question) return;
  appendMsg('Kamu', question);
  chatInput.value = '';
  setTimeout(()=> { const ans = aiAnswer(question); appendMsg('AI Sekolah', ans); }, 600);
}

// safe evaluate basic math expressions
function safeEval(expr){
  // allow digits, spaces and +-*/().^ and percent
  if(!/^[0-9+\-*/().%\s]+$/.test(expr)) return null;
  try {
    // replace % with /100
    const safe = expr.replace(/%/g, '/100');
    // eslint-disable-next-line no-eval
    const res = eval(safe);
    if(Number.isFinite(res)) return res;
    return null;
  } catch { return null; }
}

function aiAnswer(input){
  const q = input.toLowerCase();

  // math? check if contains digit and operator
  if(/[0-9]/.test(q) && /[\+\-\*\/\%]/.test(q)){
    const val = safeEval(q.replace(/[^0-9+\-*/().% ]/g, ''));
    if(val !== null) return Hasilnya: ${val};
    // try extract numbers + words for simple problems like "berapa 12 dikali 3"
    const mapOp = { 'kali':'','x':'','dikalikan':'*','dibagi':'/','bagi':'/','tambah':'+','kurang':'-'};
    let replaced = q;
    Object.keys(mapOp).forEach(k=> replaced = replaced.replaceAll(k, mapOp[k]));
    const val2 = safeEval(replaced.replace(/[^0-9+\-*/().% ]/g, ''));
    if(val2 !== null) return Hasilnya: ${val2};
    return "Maaf, saya belum bisa menghitung itu. Coba format angka dan operator (mis. 12*8 atau 10 + 5).";
  }

  // info commands
  if(q.includes('sman 1') || q.includes('sekolah') || q.includes('ngadiluwih')) {
    return "SMAN 1 Ngadiluwih adalah sekolah unggulan di Kabupaten Kediri, fokus pada prestasi akademik, seni, dan karakter. Dies Natalis: acara tahunan dengan pentas seni, konser, dan bazaar.";
  }
  if(q.includes('ajeng') || q.includes('ajeng febria')) {
    return "Ajeng Febria: penyanyi muda berbakat dari Kediri, terkenal dengan lagu 'Pelangi di Matamu 2.0'. Akan tampil membawakan setlist spesial di acara.";
  }
  if(q.includes('dj') || q.includes('lancar') || q.includes('dj lancar')) {
    return "DJ Lancar: DJ enerjik yang membawa suasana pesta dengan remix dan beat dance—siap menjadi penutup acara dengan party mix yang hits.";
  }
  if(q.includes('dies natalis') || q.includes('acara')) {
    return "Dies Natalis adalah perayaan ulang tahun sekolah berisi parade, pentas seni, konser, bazaar, dan kegiatan kompetitif antar siswa.";
  }
  if(q.includes('tiket') || q.includes('ticket') || q.includes('harga')) {
    return "Informasi tiket: cek booth resmi sekolah atau hubungi panitia via WA: 0812-3456-7890. (Ini contoh; tiket belum tersedia lewat web demo).";
  }
  if(q.includes('halo') || q.includes('hai') || q.includes('halo bro')) {
    return "Halo! Ada yang bisa kubantu? Kamu bisa tanya tentang sekolah, artis, jadwal, atau minta bantuan mengerjakan soal.";
  }

  // fallback
  return "Pertanyaan bagus! Coba tanyakan tentang 'Sman 1 Ngadiluwih', 'Ajeng Febria', 'DJ Lancar', 'dies natalis', atau '12*8' untuk menghitung.";
}

// small UX: prefill placeholders images if not present (checks optional)
(function precheckImages(){
  const heroImg = document.querySelector('.hero-image');
  // if file missing, replace with Wikimedia sample (already recommended)
  // (No network checks to keep simple)
})();
