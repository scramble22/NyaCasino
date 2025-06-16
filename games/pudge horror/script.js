const roulette = document.getElementById("roulette");
const resultText = document.getElementById("resultText");
const balanceText = document.getElementById("balanceText");
const historyElem = document.getElementById("history");
const modalBg = document.getElementById("modalBg");
const modalHistoryList = document.getElementById("modalHistoryList");
const betChartCtx = document.getElementById("betChart").getContext("2d");
const chanceRedElem = document.getElementById("chanceRed");
const chanceGemElem = document.getElementById("chanceGem");
const chanceBlackElem = document.getElementById("chanceBlack");

let balance = 100;
let betAmount = 1;
let history = []; // {color, multiplier, won, amount}
const colors = ["red", "black", "gem"];
const multipliers = { red: 2, black: 2, gem: 19 };

function setHalf() {
  betAmount = Math.max(1, Math.floor(betAmount / 2));
  updateBetInput();
}
function setDouble() {
  betAmount = betAmount * 2;
  updateBetInput();
}
function updateBetInput() {
  document.getElementById("betAmount").value = betAmount;
}
document.getElementById("betAmount").addEventListener("input", (e) => {
  let val = parseInt(e.target.value);
  if (isNaN(val) || val < 1) val = 1;
  betAmount = val;
  updateBetInput();
});

function placeBet(color, multiplier) {
  if (betAmount > balance) {
    alert("Недостаточно баланса");
    return;
  }

  balance -= betAmount;
  updateBalance();

  spinRoulette(color, multiplier, betAmount);
}

function spinRoulette(betColor, multiplier, amount) {
  // Создаём массив для рулетки: 10 слотов
  // Вероятности: красный и чёрный примерно по 33%, gem ~ 3-5%
  // Здесь делаем генерацию результата с ограничением по разнице красного и черного ≤9%

  let redCount = 0;
  let blackCount = 0;
  let gemCount = 0;

  // Сначала создадим массив с 10 цветов по вероятностям (примерно)
  // Будем гарантировать, что разница между red и black не больше 1 (чтобы соблюсти 9%)

  // Для демонстрации с фиксированным распределением:
  // 4 red, 4 black, 2 gem
  // Потом перемешаем

  let slots = [];
  for (let i = 0; i < 4; i++) slots.push("red");
  for (let i = 0; i < 4; i++) slots.push("black");
  for (let i = 0; i < 2; i++) slots.push("gem");

  shuffleArray(slots);

  // Покажем рулетку и анимируем кручение
  renderSlots(slots);

  // Выбор результата — центральный слот (позиция 4 или 5, например 4)
  const resultIndex = 4;
  const resultColor = slots[resultIndex];

  // Рассчитаем выигрыш
  let won = 0;
  if (betColor === resultColor) {
    won = amount * multiplier;
    balance += won;
    updateBalance();
  }

  // Добавим в историю
  history.push({
    color: resultColor,
    multiplier,
    won,
    amount,
  });

  addHistoryItem(resultColor);

  // Обновим шансы (в данном примере просто считаем на основе последних 50 результатов)
  updateChances();

  resultText.textContent = `Выпало: ${resultColor.toUpperCase()}. ${
    won > 0 ? `Вы выиграли ${won}₽!` : "Вы проиграли"
  }`;
}

// Функция для отрисовки рулетки
function renderSlots(slots) {
  roulette.innerHTML = "";
  for (const color of slots) {
    const slotDiv = document.createElement("div");
    slotDiv.classList.add("slot", color);
    roulette.appendChild(slotDiv);
  }
}

// Добавить элемент истории слева (без фона)
function addHistoryItem(color) {
  const item = document.createElement("div");
  item.classList.add("history-item", color);
  historyElem.appendChild(item);

  // Ограничим историю максимум 50 элементов
  if (historyElem.children.length > 50) {
    historyElem.removeChild(historyElem.children[0]);
  }
}

// Обновить баланс на странице
function updateBalance() {
  balanceText.textContent = `Баланс: ${balance}₽`;
}

// Перемешивание массива (Fisher-Yates)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// --- Модальное окно и история ставок ---

function openHistoryModal() {
  modalBg.classList.add("active");
  renderModalHistory();
  renderChart();
}
function closeHistoryModal() {
  modalBg.classList.remove("active");
}

function renderModalHistory() {
  modalHistoryList.innerHTML = "";
  if (history.length === 0) {
    modalHistoryList.textContent = "История пуста.";
    return;
  }
  history.slice().reverse().forEach((entry, i) => {
    const div = document.createElement("div");
    div.classList.add("modal-history-item");
    div.innerHTML = `
      <span>${entry.color.toUpperCase()}</span>
      <span>Ставка: ${entry.amount}₽</span>
      <span>Множитель: x${entry.multiplier}</span>
      <span>${entry.won > 0 ? `Выигрыш: ${entry.won}₽` : "Проигрыш"}</span>
    `;
    modalHistoryList.appendChild(div);
  });
}

// --- Обновление полоски шансов ---
// Рассчитываем шансы на основе последних 50 результатов, 
// корректируем, чтобы разница между красным и черным была не больше 9%

function updateChances() {
  const recent = history.slice(-50);
  if (recent.length === 0) {
    setChances(33, 33, 34);
    return;
  }

  let redCount = 0, blackCount = 0, gemCount = 0;
  recent.forEach((r) => {
    if (r.color === "red") redCount++;
    else if (r.color === "black") blackCount++;
    else if (r.color === "gem") gemCount++;
  });

  const total = redCount + blackCount + gemCount;

  let redPerc = Math.round((redCount / total) * 100);
  let blackPerc = Math.round((blackCount / total) * 100);
  let gemPerc = Math.round((gemCount / total) * 100);

  // Корректируем разницу между red и black не более 9%
  const diff = Math.abs(redPerc - blackPerc);
  if (diff > 9) {
    const avg = Math.round((redPerc + blackPerc) / 2);
    redPerc = avg;
    blackPerc = avg;
    // Adjust gem percentage accordingly
    gemPerc = 100 - redPerc - blackPerc;
  }

  setChances(redPerc, gemPerc, blackPerc);
}

function setChances(redPerc, gemPerc, blackPerc) {
  chanceRedElem.textContent = `Red: ${redPerc}%`;
  chanceGemElem.textContent = `Gem: ${gemPerc}%`;
  chanceBlackElem.textContent = `Black: ${blackPerc}%`;

  // Можно менять ширину для визуализации (не обязательно)
  chanceRedElem.style.flexGrow = redPerc;
  chanceGemElem.style.flexGrow = gemPerc;
  chanceBlackElem.style.flexGrow = blackPerc;
}

// --- График в модальном окне ---
let chart;
function renderChart() {
  if (chart) {
    chart.destroy();
  }
  const labels = history.map((_, i) => i + 1);
  const bets = history.map((h) => h.amount);
  const wins = history.map((h) => h.won);

  chart = new Chart(betChartCtx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Ставка",
          data: bets,
          borderColor: "#6cf",
          backgroundColor: "#6cf44",
          fill: false,
          tension: 0.3,
        },
        {
          label: "Выигрыш",
          data: wins,
          borderColor: "#f66",
          backgroundColor: "#f66444",
          fill: false,
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}