// Musik
const bgMusic = document.getElementById("bg-music");
const musicToggle = document.getElementById("music-toggle");
let isPlaying = false;

musicToggle.addEventListener("click", () => {
  if (!isPlaying) {
    bgMusic.play();
    musicToggle.textContent = "🔊 Matikan Musik";
    isPlaying = true;
  } else {
    bgMusic.pause();
    musicToggle.textContent = "🔈 Hidupkan Musik";
    isPlaying = false;
  }
});

// Animasi masuk ke website
window.addEventListener("load", () => {
  const intro = document.getElementById("intro");
  const main = document.getElementById("main-content");
  setTimeout(() => {
    main.classList.remove("hidden");
    main.style.opacity = 1;
  }, 4000);
});
