// 🌟 Efek sambutan suara Google
const welcomeMessage = new SpeechSynthesisUtterance(
  "Selamat datang di perayaan Dies Natalis SMA Negeri 1 Ngadiluwih. Nikmati kemeriahannya!"
);
welcomeMessage.lang = "id-ID";

document.getElementById("musicToggle").addEventListener("click", () => {
  speechSynthesis.speak(welcomeMessage);
});
