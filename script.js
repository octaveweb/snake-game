
function preventReload() {
  // Prevent pull-to-refresh (common on Android Chrome)
  let touchStartY = 0;

  window.addEventListener("touchstart", e => {
    if (e.touches.length !== 1) return;
    touchStartY = e.touches[0].clientY;
  }, { passive: false });

  window.addEventListener("touchmove", e => {
    const touchY = e.touches[0].clientY;
    const scrollY = window.scrollY;

    // If user is at top and swiping down, block it
    if (scrollY === 0 && touchY > touchStartY) {
      e.preventDefault();
    }
  }, { passive: false });

  // Prevent reload using F5 or Ctrl+R (desktop fallback)
  window.addEventListener("keydown", e => {
    if ((e.key === "F5") || (e.ctrlKey && e.key === "r")) {
      e.preventDefault();
    }
  });
}
preventReload();
const grid = document.querySelector("#grid");
const startBtn = document.querySelector("#startGame");
const restartBtn = document.querySelector("#gameOver");
const modal = document.querySelector(".modal");
const highScoreElement = document.querySelector("#high_score");
const scoreElement = document.querySelector("#current_score");
const timeElement = document.querySelector("#time");

const blockSize = 30;
let highscore = localStorage.getItem("highScore") || 0;
let score = 0;
let time = "00:00";

highScoreElement.innerText = highscore;
grid.innerHTML = "";

const cols = Math.floor(grid.clientWidth / blockSize);
const rows = Math.floor(grid.clientHeight / blockSize);

let intervelId = null;
let timerIntervelId = null;
const blocks = [];
let snake = [{ x: 1, y: 3 }];
let food = {
  x: Math.floor(Math.random() * rows),
  y: Math.floor(Math.random() * cols)
};
let diraction = "right";

for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {
    const block = document.createElement("div");
    block.className = "block";
    blocks[`${row}-${col}`] = block;
    grid.appendChild(block);
  }
}

grid.style.display = "grid";
grid.style.gridTemplateColumns = `repeat(${cols}, minmax(${blockSize}px,1fr))`;
grid.style.gridTemplateRows = `repeat(${rows}, minmax(${blockSize}px,1fr))`;

function render() {
  let head = null;
  blocks[`${food.x}-${food.y}`].classList.add("food");

  if (diraction === "left") head = { x: snake[0].x, y: snake[0].y - 1 };
  else if (diraction === "right") head = { x: snake[0].x, y: snake[0].y + 1 };
  else if (diraction === "up") head = { x: snake[0].x - 1, y: snake[0].y };
  else if (diraction === "down") head = { x: snake[0].x + 1, y: snake[0].y };

  if (head.x == food.x && head.y == food.y) {
    blocks[`${food.x}-${food.y}`].classList.remove("food");
    food = {
      x: Math.floor(Math.random() * rows),
      y: Math.floor(Math.random() * cols)
    };
    blocks[`${food.x}-${food.y}`].classList.add("food");
    snake.unshift(head);
    score += 10;
    scoreElement.innerText = score;

    if (score > highscore) {
      highscore = score;
      localStorage.setItem("highScore", highscore.toString());
    }
  }

  if (head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols) {
    clearInterval(intervelId);
    clearInterval(timerIntervelId);
    modal.style.display = "flex";
    startBtn.style.display = "none";
    restartBtn.style.display = "flex";
    return;
  }

  snake.forEach(elm => blocks[`${elm.x}-${elm.y}`].classList.remove("fill"));
  snake.unshift(head);
  snake.pop();
  snake.forEach(elm => blocks[`${elm.x}-${elm.y}`].classList.add("fill"));
}

startBtn.addEventListener("click", () => {
  modal.style.display = "none";
  intervelId = setInterval(() => render(), 400);

  timerIntervelId = setInterval(() => {
    let [min, sec] = time.split(":").map(Number);
    if (sec == 59) {
      min += 1;
      sec = 0;
    } else {
      sec += 1;
    }
    time = `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    timeElement.innerText = time;
  }, 1000);
});

restartBtn.addEventListener("click", restGame);

function restGame() {
  clearInterval(intervelId);
  clearInterval(timerIntervelId);
  blocks[`${food.x}-${food.y}`].classList.remove("food");
  snake.forEach(elm => blocks[`${elm.x}-${elm.y}`].classList.remove("fill"));
  score = 0;
  time = "00:00";
  scoreElement.innerText = score;
  timeElement.innerText = time;
  highScoreElement.innerText = highscore;
  modal.style.display = "none";
  snake = [{ x: 1, y: 3 }];
  diraction = "right";
  food = {
    x: Math.floor(Math.random() * rows),
    y: Math.floor(Math.random() * cols)
  };
  intervelId = setInterval(() => render(), 400);
}

addEventListener("keydown", e => {
  if (e.key === "ArrowUp" && diraction !== "down") diraction = "up";
  else if (e.key === "ArrowLeft" && diraction !== "right") diraction = "left";
  else if (e.key === "ArrowRight" && diraction !== "left") diraction = "right";
  else if (e.key === "ArrowDown" && diraction !== "up") diraction = "down";
});

let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

grid.addEventListener("touchstart", e => {
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
});

grid.addEventListener("touchend", e => {
  const touch = e.changedTouches[0];
  touchEndX = touch.clientX;
  touchEndY = touch.clientY;

  const dx = touchEndX - touchStartX;
  const dy = touchEndY - touchStartY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 30 && diraction !== "left") diraction = "right";
    else if (dx < -30 && diraction !== "right") diraction = "left";
  } else {
    if (dy > 30 && diraction !== "up") diraction = "down";
    else if (dy < -30 && diraction !== "down") diraction = "up";
  }
});
