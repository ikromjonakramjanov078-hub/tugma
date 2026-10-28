
const arena = document.getElementById("arena");
const runner = document.getElementById("runner");
const runnerText = document.getElementById("runnerText");
const startBtn = document.getElementById("startBtn");
const againBtn = document.getElementById("againBtn");
const difficulty = document.getElementById("difficulty");

const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const bestScoreDisplay = document.getElementById("bestScore");
const message = document.getElementById("message");
const intro = document.getElementById("intro");
const resultOverlay = document.getElementById("resultOverlay");
const resultTitle = document.getElementById("resultTitle");
const resultMessage = document.getElementById("resultMessage");
const finalScore = document.getElementById("finalScore");
const timerCard = document.querySelector(".timer-card");
const levelLabel = document.getElementById("levelLabel");

let score = 0;
let timeLeft = 30;
let bestScore = loadBestScore();
let gameRunning = false;
let timerInterval = null;
let dodgeTimeout = 0;
let lastDodge = 0;
let lastMessage = 0;
let caughtCount = 0;

const settings = {
  easy: {
    distance: 40,
    cooldown: 650,
    speed: 0.20,
    label: "OSON"
  },
  medium: {
    distance: 75,
    cooldown: 400,
    speed: 0.35,
    label: "O‘RTA"
  },
  hard: {
    distance: 115,
    cooldown: 240,
    speed: 0.52,
    label: "QIYIN"
  }
};

const jokes = [
  "Voy, sal qolding! 😂",
  "Meni ushlash oson emas!",
  "Tezroq harakat qil! ⚡",
  "Oltin tugma seni kutmaydi!",
  "Qo‘lingdan keladimi o‘zi? 😈",
  "Yana urinib ko‘r!",
  "Men chaqqonman! 🏃"
];

function loadBestScore() {
  try {
    return Number(localStorage.getItem("neonRunnerBest")) || 0;
  } catch {
    return 0;
  }
}

function saveBestScore(value) {
  try {
    localStorage.setItem("neonRunnerBest", String(value));
  } catch {
    // Xotira ishlamasa ham o‘yin davom etadi.
  }
}

function updateScore() {
  scoreDisplay.textContent = score;
  bestScoreDisplay.textContent = bestScore;
}

function setMessage(text) {
  message.textContent = text;
}

function updateDifficultyLabel() {
  levelLabel.textContent =
    "DARAJA: " + settings[difficulty.value].label;
}

difficulty.addEventListener("change", updateDifficultyLabel);

function randomPosition() {
  const padding = 55;
  const width = arena.clientWidth;
  const height = arena.clientHeight;

  const x = padding + Math.random() *
    Math.max(1, width - padding * 2);

  const y = padding + Math.random() *
    Math.max(1, height - padding * 2);

  runner.style.left = `${x}px`;
  runner.style.top = `${y}px`;
}

function moveRunner() {
  if (!gameRunning) return;

  runner.classList.remove("dodging");
  // Animatsiya qayta ishlashi uchun klassni qayta qo‘shamiz.
  void runner.offsetWidth;

  randomPosition();
  runner.classList.add("dodging");

  const now = performance.now();
  if (now - lastMessage > 1400) {
    setMessage(jokes[Math.floor(Math.random() * jokes.length)]);
    lastMessage = now;
  }
}

function distanceToRunner(pointerX, pointerY) {
  const rect = runner.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  return Math.hypot(pointerX - centerX, pointerY - centerY);
}

arena.addEventListener("pointermove", (event) => {
  if (!gameRunning || event.pointerType === "touch") return;

  const rect = runner.getBoundingClientRect();

  // Kursor tugma ichida bo‘lsa, bosish imkoniyatini saqlaymiz.
  const insideButton =
    event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom;

  if (insideButton) return;

  const config = settings[difficulty.value];
  const distance = distanceToRunner(event.clientX, event.clientY);
  const now = performance.now();

  if (
    distance < config.distance &&
    now - lastDodge > config.cooldown
  ) {
    lastDodge = now;
    moveRunner();
  }
});

runner.addEventListener("pointerdown", (event) => {
  if (!gameRunning) return;

  event.preventDefault();
  caughtCount++;
  score++;

  runner.classList.remove("dodging");
  runner.classList.remove("caught");
  void runner.offsetWidth;
  runner.classList.add("caught");

  if (score > bestScore) {
    bestScore = score;
    saveBestScore(bestScore);
  }

  updateScore();

  runnerText.textContent = "USHLADING!";
  setMessage(
    caughtCount % 5 === 0
      ? "VOOOY! " + caughtCount + " marta ushlading! 🔥"
      : "Zo‘r! +1 ochko! Endi yana ushla! ⚡"
  );

  clearTimeout(dodgeTimeout);

  // Ushlanganidan keyin tugma yangi joyga ko‘chadi.
  dodgeTimeout = setTimeout(() => {
    if (!gameRunning) return;
    runnerText.textContent = "MENI USHLA!";
    moveRunner();
  }, 180);
});

function startGame() {
  clearInterval(timerInterval);
  clearTimeout(dodgeTimeout);

  score = 0;
  timeLeft = 30;
  caughtCount = 0;
  lastDodge = 0;
  lastMessage = 0;
  gameRunning = true;

  updateScore();
  timerDisplay.textContent = timeLeft;
  timerCard.classList.remove("warning");

  intro.classList.add("hidden");
  resultOverlay.classList.add("hidden");

  runner.disabled = false;
  runnerText.textContent = "MENI USHLA!";
  runner.classList.remove("caught", "dodging");

  randomPosition();
  updateDifficultyLabel();

  startBtn.textContent = "↻ QAYTA BOSHLASH";
  setMessage("BOSHLANDI! Tugmani ushlashga harakat qil! 😈");

  timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = timeLeft;

    if (timeLeft <= 10) {
      timerCard.classList.add("warning");
    }

    if (timeLeft === 10) {
      setMessage("Oxirgi 10 soniya! Tezroq! ⚡");
    }

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function endGame() {
  gameRunning = false;
  clearInterval(timerInterval);
  clearTimeout(dodgeTimeout);

  runner.disabled = true;
  timerDisplay.textContent = "0";
  timerCard.classList.add("warning");

  runnerText.textContent = "VAQT TUGADI!";
  startBtn.textContent = "↻ QAYTA O‘YNASH";

  resultOverlay.classList.remove("hidden");
  finalScore.textContent = score;

  if (score >= 20) {
    resultTitle.textContent = "SEN AFSONASAN!";
    resultMessage.textContent =
      "Qochqin tugmani deyarli yengding! 🏆";
  } else if (score >= 10) {
    resultTitle.textContent = "ZO‘R NATIJA!";
    resultMessage.textContent =
      "Yaxshi o‘ynading! Yana rekordni yangila! ⚡";
  } else if (score > 0) {
    resultTitle.textContent = "YOMON EMAS!";
    resultMessage.textContent =
      "Tugma chaqqon ekan! Yana urinib ko‘r. 😈";
  } else {
    resultTitle.textContent = "QOCHQIN G‘ALABA QOZONDI!";
    resultMessage.textContent =
      "Birorta ham ushlay olmading! Qayta urinib ko‘r! 😂";
  }

  setMessage(`O‘yin tugadi! Jami ochko: ${score}`);
}

startBtn.addEventListener("click", startGame);
againBtn.addEventListener("click", startGame);

updateScore();
updateDifficultyLabel();
