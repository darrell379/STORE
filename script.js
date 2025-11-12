window.addEventListener("load", () => {
  const loading = document.getElementById("loading-screen");
  setTimeout(() => {
    loading.style.opacity = "0";
    setTimeout(() => loading.style.display = "none", 500);
  }, 2500);
});

document.getElementById("playMusic").addEventListener("click", () => {
  document.getElementById("bgMusic").play();
});

// Mini AI Chat
const chatOutput = document.getElementById("chat-output");
const chatInput = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");

sendBtn.addEventListener("click", () => {
  const text = chatInput.value.trim();
  if (!text) return;

  addMessage("Kamu", text);
  chatInput.value = "";

  setTimeout(() => {
    const reply = getAIResponse(text);
    addMessage("Asisten", reply);
  }, 700);
});

function addMessage(sender, message) {
  const msg = document.createElement("p");
  msg.innerHTML = `<strong>${sender}:</strong> ${message}`;
  chatOutput.appendChild(msg);
  chatOutput.scrollTop = chatOutput.scrollHeight;
}

function getAIResponse(input) {
  input = input.toLowerCase();
  if (input.includes("ajeng")) return "Ajeng Febria adalah penyanyi muda berbakat dengan suara merdu dari Kediri. Ia akan tampil membawakan lagu 'Pelangi di Matamu 2.0' 🎤";
  if (input.includes("dj lancar")) return "DJ Lancar adalah DJ enerjik yang terkenal dengan remix khas 'Ngadiluwih Beat Party' 🔊";
  if (input.includes("sman 1 ngadiluwih")) return "SMAN 1 Ngadiluwih adalah sekolah unggulan di Kediri dengan semangat prestasi dan kreativitas tinggi 🏫";
  if (input.includes("acara") || input.includes("dies natalis")) return "Acara Dies Natalis ini akan menampilkan berbagai penampilan seni, musik, dan kreativitas siswa SMAN 1 Ngadiluwih 🎉";
  if (input.includes("hai") || input.includes("halo")) return "Hai Bro Deril! Siap meriah bareng Ajeng Febria & DJ Lancar? 😎";
  return "Wah, pertanyaan bagus! Coba tanyakan lagi seputar acara, Ajeng Febria, DJ Lancar, atau SMAN 1 Ngadiluwih 💡";
}
