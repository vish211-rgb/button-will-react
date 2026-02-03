let attempts = 0;

const noBtn = document.getElementById("noBtn");
const yesBtn = document.getElementById("yesBtn");
const question = document.getElementById("question");

// Safety check if elements exist
if (!noBtn || !yesBtn || !question) {
  console.error("Missing elements: noBtn, yesBtn, or question");
}

const texts = [
  "Why are you like this? 😭",
  "Stop playing 💔",
  "You know you want to say yes 😏",
  "I'm begging you now 🥺",
  "I'm not going to stop until you say YES 😌",
  "Last chance!",
  "Come ooooon 😩",
  "Just one little yes 🥺👉👈",
  "NO is not an option anymore 😌",
];

function handleNoDodge() {
  attempts++;
  // Update teasing text
  question.textContent = texts[Math.min(attempts - 1, texts.length - 1)];

  // Move NO randomly (using translate for smoother movement)
  const x = Math.random() > 0.5 ? Math.random() * 80 + 50 : -(Math.random() * 80 + 50);
  const y = Math.random() > 0.5 ? Math.random() * 80 + 50 : -(Math.random() * 80 + 50);
  const noScale = Math.max(0.3, 1 - attempts * 0.15);
  noBtn.style.transform = `translate(${x}px, ${y}px) scale(${noScale})`;

  // Grow YES
  const yesScale = 1 + attempts * 0.15;
  yesBtn.style.transform = `scale(${yesScale})`;
  yesBtn.style.zIndex = "10";

  // Hide NO after all texts
  if (attempts >= texts.length) {
    noBtn.style.display = "none";
    noBtn.style.pointerEvents = "none";
    question.textContent = "Okay okay 😌 Just press YES ❤️";
  }
}

// Hover for desktop
noBtn.addEventListener("mouseover", handleNoDodge);

// Touch for mobile (prevent default to avoid scroll)
noBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  handleNoDodge();
});

// YES click handler – your code, with safety check for form
yesBtn.addEventListener("click", () => {
  document.body.innerHTML = `
    <h1>Yayyyy 🥰💖</h1>
    <p>You are officially my Valentine 😍</p>
  `;
  const form = document.getElementById('yesNotify');
  if (form) {
    form.submit();
  } else {
    console.warn("Form #yesNotify not found – email not sent");
  }
});

console.log(texts.length);
