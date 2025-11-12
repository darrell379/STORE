// LOADING ANIMATION
window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("loading").style.display = "none";
    document.getElementById("main-content").classList.remove("hidden");
  }, 3000);
});

// SMOOTH SCROLL
function scrollToSection(id) {
  document.getElementById(id).scrollIntoView({ behavior: "smooth" });
}

// ANIMATED TITLE EFFECT
document.title = "🎉 Dies Natalis SMAN 1 Ngadiluwih 🎶";
setInterval(() => {
  document.title = document.title === "🎉 Dies Natalis SMAN 1 Ngadiluwih 🎶"
    ? "✨ Ajeng Febria & DJ Lancar Live!"
    : "🎉 Dies Natalis SMAN 1 Ngadiluwih 🎶";
}, 2500);
