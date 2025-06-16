const cardRanks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const cardValues = Object.fromEntries(cardRanks.map((r, i) => [r, i + 2]));
let currentCard = getRandomCard();
let balance = parseFloat(localStorage.getItem('balance')) || 100;

const currentCardDiv = document.getElementById('currentCard');
const lowerOption = document.getElementById('lowerOption');
const higherOption = document.getElementById('higherOption');
const balanceSpan = document.getElementById('balance');
const drawBtn = document.getElementById('drawBtn');

function updateBalanceDisplay() {
  balanceSpan.textContent = balance.toFixed(2);
  localStorage.setItem('balance', balance);
}

function getRandomCard() {
  const rank = cardRanks[Math.floor(Math.random() * cardRanks.length)];
  return { rank, value: cardValues[rank] };
}

function renderCard(card) {
  currentCardDiv.textContent = card.rank;
}

function calcOdds(value) {
  const higherCount = cardRanks.length - (value - 2);
  const lowerCount = value - 2;
  const total = cardRanks.length;
  const higherChance = higherCount / total;
  const lowerChance = lowerCount / total;

  return {
    higher: {
      chance: (higherChance * 100).toFixed(2),
      multiplier: (1 / higherChance).toFixed(2)
    },
    lower: {
      chance: (lowerChance * 100).toFixed(2),
      multiplier: (1 / lowerChance).toFixed(2)
    }
  };
}

function renderOptions() {
  const odds = calcOdds(currentCard.value);
  higherOption.innerHTML = `
    <strong>Higher or Same</strong><br>
    Chance: ${odds.higher.chance}%<br>
    x${odds.higher.multiplier}
  `;
  lowerOption.innerHTML = `
    <strong>Lower or Same</strong><br>
    Chance: ${odds.lower.chance}%<br>
    x${odds.lower.multiplier}
  `;
}

function makeGuess(type) {
  const nextCard = getRandomCard();
  const win = (
    type === 'higher' ? nextCard.value >= currentCard.value :
    nextCard.value <= currentCard.value
  );

  const odds = calcOdds(currentCard.value);
  const multiplier = parseFloat(odds[type].multiplier);

  if (win) {
    balance += 10 * multiplier;
    alert(`You won! New card: ${nextCard.rank}`);
  } else {
    balance -= 10;
    alert(`You lost! New card: ${nextCard.rank}`);
  }

  currentCard = nextCard;
  renderCard(currentCard);
  renderOptions();
  updateBalanceDisplay();
}

lowerOption.onclick = () => makeGuess('lower');
higherOption.onclick = () => makeGuess('higher');

drawBtn.onclick = () => {
  currentCard = getRandomCard();
  renderCard(currentCard);
  renderOptions();
};

renderCard(currentCard);
renderOptions();
updateBalanceDisplay();