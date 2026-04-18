const canvas = document.querySelector("#sky");
const ctx = canvas.getContext("2d");
const planetButton = document.querySelector("#planetButton");
const toast = document.querySelector("#toast");
const wishCards = document.querySelectorAll(".wish-card");
const stars = document.querySelectorAll(".star");
const line = document.querySelector("#constellationLine");
const secret = document.querySelector("#secret");
const giftBox = document.querySelector("#giftBox");
const giftCaption = document.querySelector("#giftCaption");
const cake = document.querySelector("#cake");
const blowButton = document.querySelector("#blowButton");
const typedTitle = document.querySelector("#typedTitle");
const loveNote = document.querySelector("#loveNote");
const memoryStage = document.querySelector(".memory-stage");
const memoryFront = document.querySelector("#memoryFront");
const memoryBack = document.querySelector("#memoryBack");
const memoryCaption = document.querySelector("#memoryCaption");
const memoryReel = document.querySelector("#memoryReel");

const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2, active: false };
let particles = [];
let fireworks = [];
let width = 0;
let height = 0;
let chargeFrame = 0;
let charge = 0;
let constellationIndex = 0;
let toastTimer = 0;
let activeMemory = 1;

const memoryImages = Array.from({ length: 24 }, (_, index) => {
  const number = index + 1;
  const extension = number === 22 || number === 23 ? "jpg" : "png";
  return {
    number,
    extension,
    src: `./jzy-imgs/${number}.${extension}`,
  };
});

const starPoints = [
  [84, 269],
  [168, 134],
  [301, 185],
  [392, 92],
  [497, 214],
  [602, 126],
];

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

function seedParticles() {
  particles = Array.from({ length: Math.min(150, Math.floor(width / 8)) }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    r: Math.random() * 1.9 + 0.5,
    hue: Math.random() > 0.45 ? 178 : Math.random() > 0.5 ? 43 : 348,
  }));
}

function makeBurst(x, y, amount = 72) {
  for (let i = 0; i < amount; i += 1) {
    const angle = (Math.PI * 2 * i) / amount + Math.random() * 0.25;
    const speed = 1.5 + Math.random() * 6;
    fireworks.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: 0.012 + Math.random() * 0.018,
      hue: [348, 43, 178, 145][Math.floor(Math.random() * 4)],
      size: 2 + Math.random() * 4,
    });
  }
}

function animate() {
  ctx.clearRect(0, 0, width, height);

  particles.forEach((p) => {
    const dx = pointer.x - p.x;
    const dy = pointer.y - p.y;
    const dist = Math.hypot(dx, dy);
    if (pointer.active && dist < 190) {
      p.vx -= dx * 0.00008;
      p.vy -= dy * 0.00008;
    }

    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.992;
    p.vy *= 0.992;

    if (p.x < -20) p.x = width + 20;
    if (p.x > width + 20) p.x = -20;
    if (p.y < -20) p.y = height + 20;
    if (p.y > height + 20) p.y = -20;

    ctx.beginPath();
    ctx.fillStyle = `hsla(${p.hue}, 92%, 68%, 0.75)`;
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  });

  for (let i = fireworks.length - 1; i >= 0; i -= 1) {
    const f = fireworks[i];
    f.x += f.vx;
    f.y += f.vy;
    f.vy += 0.035;
    f.life -= f.decay;
    ctx.beginPath();
    ctx.fillStyle = `hsla(${f.hue}, 94%, 64%, ${Math.max(f.life, 0)})`;
    ctx.arc(f.x, f.y, f.size * f.life, 0, Math.PI * 2);
    ctx.fill();
    if (f.life <= 0) fireworks.splice(i, 1);
  }

  requestAnimationFrame(animate);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

function setCharge(value) {
  charge = Math.max(0, Math.min(1, value));
  planetButton.style.setProperty("--charge", `${charge * 360}deg`);
}

function unlockPlanet() {
  document.body.classList.add("is-unlocked");
  setCharge(1);
  makeBurst(width * 0.28, height * 0.42, 120);
  makeBurst(width * 0.72, height * 0.36, 100);
  typeTitle("生日快乐，我最喜欢的人。");
  loveNote.classList.add("is-awake");
  showToast("生日星球已点亮。今天的好运开始排队进场。");
  document.querySelector("#message").scrollIntoView({ behavior: "smooth", block: "start" });
}

function beginCharge() {
  cancelAnimationFrame(chargeFrame);
  const startedAt = performance.now();
  const tick = (now) => {
    setCharge((now - startedAt) / 1200);
    if (charge >= 1) {
      unlockPlanet();
      return;
    }
    chargeFrame = requestAnimationFrame(tick);
  };
  chargeFrame = requestAnimationFrame(tick);
}

function endCharge() {
  cancelAnimationFrame(chargeFrame);
  if (charge < 1) setCharge(0);
}

function typeTitle(text) {
  typedTitle.textContent = "";
  [...text].forEach((char, index) => {
    setTimeout(() => {
      typedTitle.textContent += char;
    }, index * 72);
  });
}

function updateConstellation() {
  const points = starPoints.slice(0, constellationIndex).map((point) => point.join(","));
  line.setAttribute("points", points.join(" "));
}

function resetConstellation() {
  constellationIndex = 0;
  stars.forEach((star) => star.classList.remove("is-lit"));
  secret.classList.remove("is-visible");
  updateConstellation();
}

function launchConfettiFromElement(element, amount) {
  const rect = element.getBoundingClientRect();
  makeBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, amount);
}

function setActiveMemory(number) {
  const item = memoryImages.find((image) => image.number === number);
  if (!item || number === activeMemory) return;

  const previous = memoryImages.find((image) => image.number === activeMemory);
  activeMemory = number;
  memoryStage.classList.add("is-switching");

  setTimeout(() => {
    memoryBack.src = previous ? previous.src : memoryBack.src;
    memoryFront.src = item.src;
    memoryBack.classList.toggle("is-jpg", previous?.extension === "jpg");
    memoryFront.classList.toggle("is-jpg", item.extension === "jpg");
    memoryCaption.textContent = `第 ${number} 枚心动贴纸`;
    memoryStage.classList.remove("is-switching");
  }, 180);

  document.querySelectorAll(".memory-chip").forEach((chip) => {
    chip.classList.toggle("is-active", Number(chip.dataset.memory) === number);
  });

  launchConfettiFromElement(memoryStage, 46);
}

function buildMemoryReel() {
  memoryImages.forEach((image) => {
    const button = document.createElement("button");
    button.className = "memory-chip";
    if (image.extension === "jpg") button.classList.add("is-jpg");
    button.type = "button";
    button.dataset.memory = image.number;
    button.setAttribute("aria-label", `查看第 ${image.number} 张回忆贴纸`);
    if (image.number === activeMemory) button.classList.add("is-active");

    const badge = document.createElement("span");
    badge.textContent = String(image.number).padStart(2, "0");

    const img = document.createElement("img");
    img.src = image.src;
    img.alt = "";
    img.loading = "lazy";

    button.append(badge, img);
    button.addEventListener("click", () => setActiveMemory(image.number));
    memoryReel.append(button);
  });
}

window.addEventListener("resize", () => {
  resizeCanvas();
  seedParticles();
});

window.addEventListener("pointermove", (event) => {
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  pointer.active = true;
});

window.addEventListener("pointerleave", () => {
  pointer.active = false;
});

planetButton.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  planetButton.setPointerCapture(event.pointerId);
  beginCharge();
});

planetButton.addEventListener("pointerup", endCharge);
planetButton.addEventListener("pointercancel", endCharge);
planetButton.addEventListener("pointerleave", endCharge);

wishCards.forEach((card) => {
  card.addEventListener("click", () => {
    launchConfettiFromElement(card, 54);
    showToast(`${card.dataset.wish}：已偷偷塞进他的下一岁。`);
  });
});

stars.forEach((star, index) => {
  star.addEventListener("click", () => {
    if (index !== constellationIndex) {
      showToast("这颗星还没轮到出场，先从最左下角那颗开始。");
      resetConstellation();
      return;
    }

    constellationIndex += 1;
    star.classList.add("is-lit");
    updateConstellation();
    launchConfettiFromElement(star, 18);

    if (constellationIndex === stars.length) {
      secret.classList.add("is-visible");
      showToast("悄悄话解锁成功。");
      launchConfettiFromElement(document.querySelector(".star-map"), 100);
    }
  });
});

giftBox.addEventListener("click", () => {
  const isOpen = giftBox.classList.toggle("is-open");
  if (isOpen) {
    giftCaption.textContent = "礼物是：今年也要被我明目张胆地喜欢。";
    launchConfettiFromElement(giftBox, 150);
    showToast("礼物打开了，里面全是偏爱。");
  } else {
    giftCaption.textContent = "礼物正在等一阵心跳。";
  }
});

blowButton.addEventListener("click", () => {
  cake.classList.add("is-out");
  launchConfettiFromElement(cake, 96);
  showToast("愿望已发送。下一岁，请继续闪闪发光。");
});

resizeCanvas();
seedParticles();
buildMemoryReel();
animate();
