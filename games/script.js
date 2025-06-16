const multipliers = [1.96, 3.92, 7.84, 15.68, 31.36, 62.72, 125.44];
let currentSeries = 0;
let currentBet = 0;
let winnings = 0;

function getBalance() {
  return parseFloat(localStorage.getItem("balance") || "100.00");
}

function setBalance(val) {
  localStorage.setItem("balance", val.toFixed(2));
  document.getElementById("balance").textContent = val.toFixed(2);
}

function halveBet() {
  const input = document.getElementById("betInput");
  input.value = Math.max(1, parseFloat(input.value) / 2).toFixed(2);
}

function doubleBet() {
  const input = document.getElementById("betInput");
  input.value = (parseFloat(input.value) * 2).toFixed(2);
}

function makeChoice(userChoice) {
  const bet = parseFloat(document.getElementById("betInput").value);
  const balance = getBalance();
  if (currentSeries === 0 && bet > balance) return alert("Недостаточно средств!");
  const result = Math.random() < 0.5 ? "heads" : "tails";

  animateCoin(result);

  if (currentSeries === 0) {
    currentBet = bet;
    setBalance(balance - bet);
    winnings = bet;
  }

  setTimeout(() => {
    if (result === userChoice) {
      winnings = currentBet * multipliers[currentSeries];
      addMultiplier(multipliers[currentSeries]);
      addHistory(currentBet, multipliers[currentSeries], winnings);
      currentSeries++;
      updateWithdraw();
    } else {
      currentSeries = 0;
      winnings = 0;
      clearMultipliers();
      updateWithdraw();
    }
  }, 1100);
}

function animateCoin(result) {
  const coin = document.getElementById("coin");
  const img = document.getElementById("coinImage");

  const headsImg = "img/heads.png";
  const tailsImg = "img/tails.png";

  let flips = 8; // Сколько раз "переключить" картинку до финального результата
  let current = "heads";
  let delay = 100;

  const flipInterval = setInterval(() => {
    current = current === "heads" ? "tails" : "heads";
    img.src = current === "heads" ? headsImg : tailsImg;

    coin.style.transform = `rotateY(${Math.random() * 360}deg)`;
    flips--;

    if (flips <= 0) {
      clearInterval(flipInterval);
      setTimeout(() => {
        // Показываем финальный результат
        img.src = result === "heads" ? headsImg : tailsImg;
        coin.style.transform = "rotateY(0deg)";
      }, delay);
    }
  }, delay);
}

function addMultiplier(mult) {
  const el = document.createElement("div");
  el.textContent = `x${mult}`;
  document.getElementById("multiplierContainer").appendChild(el);
}

function clearMultipliers() {
  document.getElementById("multiplierContainer").innerHTML = "";
  document.getElementById("history").innerHTML = "";
}

function addHistory(startBet, mult, total) {
  const line = `${startBet}₽ × x${mult} → ${total.toFixed(2)}₽`;
  const entry = document.createElement("div");
  entry.textContent = line;
  document.getElementById("history").appendChild(entry);
}

function updateWithdraw() {
  document.getElementById("winnings").textContent = winnings.toFixed(2);
}

function withdraw() {
  const balance = getBalance();
  setBalance(balance + winnings);
  winnings = 0;
  currentSeries = 0;
  updateWithdraw();
  clearMultipliers();
}

setBalance(getBalance()); // Init