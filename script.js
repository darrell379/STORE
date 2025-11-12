// LOADING SCREEN
window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("loading").style.display = "none";
    document.getElementById("main-content").classList.remove("hidden");
  }, 2500);
});

// SMOOTH SCROLL
function scrollToSection(id) {
  document.getElementById(id).scrollIntoView({ behavior: "smooth" });
}

// TITLE BLINK EFFECT
setInterval(() => {
  document.title = document.title === "💖 Dies Natalis SMAN 1 Ngadiluwih 🎶"
    ? "🎉 Ajeng Febria & DJ Lancar Live Show!"
    : "💖 Dies Natalis SMAN 1 Ngadiluwih 🎶";
}, 2500);
