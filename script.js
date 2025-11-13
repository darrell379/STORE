// Loading screen animation
let percent = document.getElementById("percent");
let progress = document.getElementById("progress");
let loadingScreen = document.getElementById("loading-screen");
let content = document.getElementById("content");
let load = 0;

let interval = setInterval(() => {
    load++;
    percent.innerText = load + "%";
    progress.style.width = load + "%";

    if (load >= 100) {
        clearInterval(interval);
        setTimeout(() => {
            loadingScreen.style.display = "none";
            content.classList.remove("hidden");
            document.body.style.overflow = "auto";
        }, 500);
    }
}, 30);

// Navbar navigation
const sections = document.querySelectorAll(".section");
const navItems = document.querySelectorAll(".navbar li");

navItems.forEach(item => {
    item.addEventListener("click", () => {
        const target = item.getAttribute("data-target");

        sections.forEach(sec => sec.classList.remove("active"));
        document.getElementById(target).classList.add("active");

        navItems.forEach(nav => nav.style.color = "#00ff9d");
        item.style.color = "#9cffcb";
    });
});

// Tap Info Button
function openInfo(name) {
    alert(`📢 Kamu membuka info tentang ${name}!\n\nSegera hadir fitur profil interaktif khusus untuk ${name}.`);
}
