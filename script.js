const chatOutput = document.getElementById("chat-output");
const chatInput = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");

sendBtn.addEventListener("click", () => {
  const userText = chatInput.value.trim();
  if (!userText) return;
  addMessage("Kamu", userText);
  chatInput.value = "";
  setTimeout(() => aiReply(userText), 800);
});

function addMessage(sender, text) {
  const msg = document.createElement("p");
  msg.innerHTML = `<strong>${sender}:</strong> ${text}`;
  chatOutput.appendChild(msg);
  chatOutput.scrollTop = chatOutput.scrollHeight;
}

function aiReply(text) {
  let reply = "Maaf, aku belum paham pertanyaanmu 😅";
  const lower = text.toLowerCase();

  if (lower.includes("sman 1 ngadiluwih")) {
    reply = "SMAN 1 Ngadiluwih adalah sekolah unggulan di Kediri yang berfokus pada prestasi, karakter, dan budaya.";
  } else if (lower.includes("ajeng febria")) {
    reply = "Ajeng Febria adalah penyanyi muda berbakat dengan lagu andalan 'Pelangi di Matamu 2.0'.";
  } else if (lower.includes("dj lancar")) {
    reply = "DJ Lancar adalah DJ asal Kediri yang dikenal dengan gaya EDM enerjik dan remix khas lokal.";
  } else if (lower.includes("dies natalis")) {
    reply = "Dies Natalis SMAN 1 Ngadiluwih adalah acara tahunan untuk merayakan hari jadi sekolah dengan berbagai kegiatan seru!";
  } else if (lower.includes("halo") || lower.includes("hai")) {
    reply = "Halo juga! Selamat datang di website Dies Natalis SMAN 1 Ngadiluwih 💖";
  }

  addMessage("AI Sekolah", reply);
}
