
let deck = [];
let placedCards = Array(25).fill(null);
let selectedCard = null;
let gameMode = 'standard';
let scoringSystem = 'american';
let cardPool = [];

function startGame() {
  gameMode = document.getElementById('game-mode').value;
  scoringSystem = document.getElementById('scoring-system').value;

  document.getElementById('menu').style.display = 'none';
  document.getElementById('game').style.display = 'block';
  document.getElementById('mode-title').textContent = `Mode: ${gameMode} | Scoring: ${scoringSystem}`;

  deck = generateDeck();
  placedCards = Array(25).fill(null);
  cardPool = [];

  if (gameMode === 'shuffle') {
    cardPool = [...deck.slice(0, 25)];
  } else {
    cardPool = [deck.shift()];
  }

  renderCardPool();
  renderGrid();
}

function renderCardPool() {
  const pool = document.getElementById('card-pool');
  pool.innerHTML = '';
  cardPool.forEach((card, index) => {
    const div = createCardElement(card);
    div.onclick = () => {
      selectedCard = { card, index };
      document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
      div.classList.add('selected');
    };
    pool.appendChild(div);
  });
}

function createCardElement(card) {
  const div = document.createElement('div');
  div.className = 'card';
  div.textContent = `${card.value}${card.suit}`;
  if (card.suit === '♥' || card.suit === '♦') div.classList.add('red');
  return div;
}

function renderGrid() {
  const container = document.getElementById('card-container');
  container.innerHTML = '';
  for (let i = 0; i < 25; i++) {
    const div = document.createElement('div');
    div.className = 'card';
    if (placedCards[i]) {
      div.textContent = `${placedCards[i].value}${placedCards[i].suit}`;
      if (placedCards[i].suit === '♥' || placedCards[i].suit === '♦') div.classList.add('red');
    }
    div.onclick = () => {
      if (gameMode === 'shuffle' && placedCards[i]) {
        cardPool.push(placedCards[i]);
        placedCards[i] = null;
        renderCardPool();
        renderGrid();
        return;
      }

      if (!selectedCard || placedCards[i]) return;
      placedCards[i] = selectedCard.card;
      cardPool.splice(selectedCard.index, 1);
      selectedCard = null;

      if (gameMode === 'standard' && deck.length > 0) {
        cardPool = [deck.shift()];
      }

      renderCardPool();
      renderGrid();

      if (placedCards.every(card => card)) calculateScore();
    };
    container.appendChild(div);
  }
}

function calculateScore() {
  // Placeholder
  alert('All cards placed. Scoring not yet implemented.');
}

function resetGame() {
  selectedCard = null;
  deck = [];
  placedCards = Array(25).fill(null);
  document.getElementById('menu').style.display = 'block';
  document.getElementById('game').style.display = 'none';
}
