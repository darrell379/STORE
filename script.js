let i = 0;
const percent = document.getElementById('percent');
const bar = document.getElementById('bar');
const loader = document.getElementById('loaderWrap');

// Loader progres
function loadProgress() {
  i += Math.floor(Math.random() * 8) + 5;
  if (i > 100) i = 100;
  percent.textContent = i + '%';
  bar.style.width = i + '%';
  if (i < 100) {
    setTimeout(loadProgress, 200);
  } else {
    setTimeout(() => {
      loader.style.display = 'none';
      animateSections();
    }, 700);
  }
}
loadProgress();

// Slide hero otomatis
let slideIndex = 0;
const slides = document.querySelectorAll('.slide');
function showSlides() {
  slides.forEach(slide => slide.classList.remove('active'));
  slides[slideIndex].classList.add('active');
  slideIndex = (slideIndex + 1) % slides.length;
  setTimeout(showSlides, 4000);
}
showSlides();

// Animasi muncul tiap section
function animateSections() {
  const sections = document.querySelectorAll('.section');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.2 });
  sections.forEach(sec => observer.observe(sec));
}

// Info pop-up Ajeng & DJ
function openInfo(name) {
  let content = '';
  if (name === 'ajeng') {
    content = 'Ajeng Febria adalah siswi berprestasi SMAN 1 Ngadiluwih dalam seni & akademik. Ia sering mewakili sekolah di lomba nasional dan menjadi inspirasi bagi siswa lain.';
  } else if (name === 'dj') {
    content = 'DJ Lancar adalah ikon musik kreatif SMAN 1 Ngadiluwih. Ia sering tampil di acara sekolah dan Dies Natalis membawa musik EDM yang membangkitkan semangat.';
  }
  alert(content);
}
