const grid = document.getElementById("grid");
const result = document.getElementById("result");
const balanceSpan = document.getElementById("balance-value");
const betInput = document.getElementById("bet-amount");
const riskSelect = document.getElementById("risk-level");

let selectedCells = new Set();
let balance = parseInt(localStorage.getItem("keno-balance")) || 1000;

balanceSpan.textContent = balance;

function updateBalanceDisplay() {
  balanceSpan.textContent = balance;
  localStorage.setItem("keno-balance", balance);
}

function createGrid() {
  grid.innerHTML = "";
  for (let i = 1; i <= 40; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.textContent = i;
    cell.addEventListener("click", () => toggleSelect(cell, i));
    grid.appendChild(cell);
  }
}
createGrid();

function toggleSelect(cell, number) {
  if (selectedCells.has(number)) {
    selectedCells.delete(number);
    cell.classList.remove("selected");
  } else {
    if (selectedCells.size >= 10) return;
    selectedCells.add(number);
    cell.classList.add("selected");
  }
}

function getMultipliers(risk, picks, hits) {
  const tables = {
    low:   [0, 0, 1.2, 1.5, 2, 3, 5, 8, 12, 18, 25],
    medium:[0, 0, 1.5, 2, 3, 5, 8, 12, 20, 30, 50],
    high:  [0, 0, 2, 3, 5, 8, 15, 25, 40, 60, 100]
  };
  const table = tables[risk];
  return table[Math.min(hits, table.length - 1)];
}

function placeBet() {
  const bet = parseInt(betInput.value);
  const risk = riskSelect.value;

  if (selectedCells.size < 1 || selectedCells.size > 10) {
    alert("Select 1 to 10 cells.");
    return;
  }

  if (bet <= 0 || bet > balance) {
    alert("Invalid bet amount.");
    return;
  }

  balance -= bet;
  updateBalanceDisplay();

  const picks = Array.from(selectedCells);
  const rolls = new Set();
  while (rolls.size < 10) {
    rolls.add(Math.floor(Math.random() * 40) + 1);
  }

  let hits = 0;
  const cells = grid.children;
  for (let cell of cells) {
    const num = parseInt(cell.textContent);
    if (picks.includes(num)) {
      if (rolls.has(num)) {
        cell.classList.add("hit");
        hits++;
      } else {
        cell.classList.add("miss");
      }
    } else if (rolls.has(num)) {
      cell.classList.add("hit");
    }
  }

  const multiplier = getMultipliers(risk, picks.length, hits);
  const winnings = Math.floor(bet * multiplier);
  balance += winnings;
  updateBalanceDisplay();

  result.innerHTML = `🎯 Hits: ${hits} | Multiplier: x${multiplier} | You won: $${winnings}`;

  selectedCells.clear();

  setTimeout(() => {
    createGrid();
    result.innerHTML = "";
  }, 4000);
}