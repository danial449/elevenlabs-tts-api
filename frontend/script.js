document.addEventListener("DOMContentLoaded", function () {

  const textarea = document.querySelector(".chat-textarea");
  const generateBtn = document.querySelector(".generate-btn");
  const inputWrapper = document.querySelector(".chat-input-wrapper");

  const outputArea = document.getElementById("outputArea");
  const outputTextBox = document.querySelector(".output-text");

  const playBtn = document.getElementById("playBtn");
  const downloadBtn = document.getElementById("downloadBtn");
  const audio = document.getElementById("voiceAudio");

  let spans = [];
  let index = 0;
  let timer = null;
  let audioURL = null;

  // ===============================
  // PREPARE TEXT
  // ===============================
  function prepareText(text) {
    const words = text.split(" ");
    outputTextBox.innerHTML = `
      <div class="output-content">
        ${words.map(w => `<span class="word">${w}</span>`).join(" ")}
      </div>
    `;
    spans = document.querySelectorAll(".word");
  }

  // ===============================
  // GENERATE & FETCH AUDIO
  // ===============================
  generateBtn.addEventListener("click", async function () {

    const text = textarea.value.trim();
    if (!text) return;

    generateBtn.innerText = "Generating...";
    generateBtn.disabled = true;

    inputWrapper.style.display = "none";
    outputArea.classList.remove("d-none");

    prepareText(text);

    try {
      const response = await fetch(
        "https://elevenlabs-tts-api.onrender.com/tts?text=" + encodeURIComponent(text),
        { method: "POST" }
      );

      if (!response.ok) {
        throw new Error("TTS failed");
      }

      const blob = await response.blob();
      audioURL = URL.createObjectURL(blob);

      audio.src = audioURL;
      audio.load();

      playBtn.disabled = false;
      downloadBtn.disabled = false;

    } catch (err) {
      alert("Error generating voice");
      console.error(err);
    }

    generateBtn.innerText = "Generate";
    generateBtn.disabled = false;
  });

  // ===============================
  // PLAY / PAUSE WITH HIGHLIGHT
  // ===============================
  playBtn.addEventListener("click", function () {

    if (!audio.src) return;

    if (audio.paused) {
      audio.play();
      playBtn.innerText = "⏸ Pause";

      const duration = audio.duration || 1;
      const intervalTime = (duration / spans.length) * 1000;

      clearInterval(timer);

      timer = setInterval(() => {
        if (index < spans.length) {
          spans[index].classList.add("active");
          index++;
        } else {
          clearInterval(timer);
        }
      }, intervalTime);

    } else {
      audio.pause();
      playBtn.innerText = "▶ Play";
      clearInterval(timer);
    }
  });

  // ===============================
  // RESET ON END
  // ===============================
  audio.addEventListener("ended", () => {
    clearInterval(timer);
    index = 0;
    spans.forEach(w => w.classList.remove("active"));
    playBtn.innerText = "▶ Play";
  });

  // ===============================
  // DOWNLOAD
  // ===============================
  downloadBtn.addEventListener("click", () => {
    if (!audioURL) return;

    const a = document.createElement("a");
    a.href = audioURL;
    a.download = "voice.mp3";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });

});
