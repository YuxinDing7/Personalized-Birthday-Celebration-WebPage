const canvas = document.querySelector("#sky");
const ctx = canvas.getContext("2d");
const confettiButton = document.querySelector("#confettiButton");
const musicButton = document.querySelector("#musicButton");
const birthdayAudio = document.querySelector("#birthdayAudio");

const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2, active: false };
let flecks = [];
let width = 0;
let height = 0;
let confettiLocked = false;

const confettiColors = ["#ff6b8a", "#ffd166", "#7bdff2", "#b2f7a8", "#cdb4ff", "#ffb86b", "#8be0c6"];

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function seedFlecks() {
  flecks = Array.from({ length: Math.min(120, Math.floor(width / 10)) }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.26,
    vy: (Math.random() - 0.5) * 0.26,
    r: Math.random() * 1.7 + 0.4,
    hue: Math.random() > 0.55 ? 8 : Math.random() > 0.5 ? 42 : 178,
  }));
}

function animate() {
  ctx.clearRect(0, 0, width, height);

  flecks.forEach((fleck) => {
    const dx = pointer.x - fleck.x;
    const dy = pointer.y - fleck.y;
    const dist = Math.hypot(dx, dy);
    if (pointer.active && dist < 160) {
      fleck.vx += dx * 0.000035;
      fleck.vy += dy * 0.000035;
    }

    fleck.x += fleck.vx;
    fleck.y += fleck.vy;
    fleck.vx *= 0.994;
    fleck.vy *= 0.994;

    if (fleck.x < -20) fleck.x = width + 20;
    if (fleck.x > width + 20) fleck.x = -20;
    if (fleck.y < -20) fleck.y = height + 20;
    if (fleck.y > height + 20) fleck.y = -20;

    ctx.beginPath();
    ctx.fillStyle = `hsla(${fleck.hue}, 82%, 62%, 0.68)`;
    ctx.arc(fleck.x, fleck.y, fleck.r, 0, Math.PI * 2);
    ctx.fill();
  });

  requestAnimationFrame(animate);
}

window.addEventListener("resize", () => {
  resizeCanvas();
  seedFlecks();
});

window.addEventListener("pointermove", (event) => {
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  pointer.active = true;
});

window.addEventListener("pointerleave", () => {
  pointer.active = false;
});

function launchConfetti() {
  if (confettiLocked) return;

  confettiLocked = true;
  confettiButton.disabled = true;

  const amount = Math.min(180, Math.max(90, Math.floor(window.innerWidth / 8)));
  for (let i = 0; i < amount; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.background = confettiColors[Math.floor(Math.random() * confettiColors.length)];
    piece.style.width = `${6 + Math.random() * 10}px`;
    piece.style.height = `${10 + Math.random() * 18}px`;
    piece.style.borderRadius = Math.random() > 0.72 ? "999px" : "2px";
    piece.style.setProperty("--drift", `${(Math.random() - 0.5) * 280}px`);
    piece.style.setProperty("--spin", `${(Math.random() > 0.5 ? 1 : -1) * (540 + Math.random() * 720)}deg`);
    piece.style.setProperty("--fall-duration", `${3.2 + Math.random() * 2.2}s`);
    piece.style.animationDelay = `${Math.random() * 0.9}s`;
    document.body.append(piece);
    piece.addEventListener("animationend", () => piece.remove(), { once: true });
  }

  setTimeout(() => {
    confettiLocked = false;
    confettiButton.disabled = false;
  }, 5000);
}

confettiButton.addEventListener("click", launchConfetti);

function stopBirthdaySong() {
  birthdayAudio.pause();
  musicButton.classList.remove("is-playing");
  musicButton.setAttribute("aria-label", "播放生日快乐歌");
}

function playBirthdaySong() {
  if (!birthdayAudio.paused) {
    stopBirthdaySong();
    return;
  }

  birthdayAudio.play().then(() => {
    musicButton.classList.add("is-playing");
    musicButton.setAttribute("aria-label", "停止生日快乐歌");
  });
}

musicButton.addEventListener("click", playBirthdaySong);
birthdayAudio.addEventListener("ended", stopBirthdaySong);

resizeCanvas();
seedFlecks();
animate();
