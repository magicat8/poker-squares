let gameMode = 'standard';
let scoringSystem = 'american';
let deck = [];
let placedCards = Array(25).fill(null);
let selectedCard = null;

function startGame() {
  gameMode = document.getElementById('game-mode').value;
  scoringSystem = document.getElementById('scoring-system').value;

  document.getElementById('menu').style.display = 'none';
  document.getElementById('game').style.display = 'block';
  document.getElementById('mode-title').textContent = `Mode: ${gameMode} | Scoring: ${scoringSystem}`;

  deck = generateDeck();

  if (gameMode === 'shuffle') {
    placedCards = Array(25).fill(null);
    renderCardPool(deck);
  } else {
    renderCardPool(deck);
  }

  renderGrid();
}

function generateDeck() {
  const suits = ['♠', '♥', '♦', '♣'];
  const values = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  const cards = [];

  for (let s of suits) {
    for (let v of values) {
      cards.push({ suit: s, value: v });
    }
  }

  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  return cards.slice(0, 25);
}

function renderCardPool(cards) {
  const pool = document.getElementById('card-pool');
  pool.innerHTML = '';

  cards.forEach((card, index) => {
    if (!card) return;

    const div = document.createElement('div');
    div.className = 'card' + (card.suit === '♥' || card.suit === '♦' ? ' red' : '');
    div.draggable = true;
    div.textContent = `${card.value} ${card.suit}`;
    div.dataset.index = index;

    div.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('card-index', index);
    });

    div.addEventListener('click', () => {
      selectedCard = index;
      document.querySelectorAll('.card').forEach(el => el.classList.remove('selected'));
      div.classList.add('selected');
    });

    pool.appendChild(div);
  });
}

function renderGrid() {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';

  for (let i = 0; i < 25; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.cell = i;

    const card = placedCards[i];
    if (card) {
      const div = document.createElement('div');
      div.className = 'card' + (card.suit === '♥' || card.suit === '♦' ? ' red' : '');
      div.textContent = `${card.value} ${card.suit}`;
      div.draggable = (gameMode === 'shuffle');
      div.dataset.grid = i;

      if (gameMode === 'shuffle') {
        div.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('from-grid', i);
        });

        div.addEventListener('click', () => {
          selectedCard = { from: 'grid', index: i };
        });
      }

      cell.appendChild(div);
    }

    cell.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    cell.addEventListener('drop', (e) => {
      const poolIndex = e.dataTransfer.getData('card-index');
      const fromGrid = e.dataTransfer.getData('from-grid');
      const cellIndex = parseInt(cell.dataset.cell);

      if (fromGrid !== '') {
        const moving = placedCards[fromGrid];
        placedCards[fromGrid] = null;
        placedCards[cellIndex] = moving;
      } else if (poolIndex !== '') {
        if (gameMode === 'standard' && placedCards[cellIndex]) return;
        placedCards[cellIndex] = deck[poolIndex];
        deck[poolIndex] = null;
      }

      renderCardPool(deck.filter(c => c !== null));
      renderGrid();
    });

    cell.addEventListener('click', () => {
      const cellIndex = parseInt(cell.dataset.cell);

      if (typeof selectedCard === 'number') {
        if (gameMode === 'standard' && placedCards[cellIndex]) return;
        placedCards[cellIndex] = deck[selectedCard];
        deck[selectedCard] = null;
        selectedCard = null;
      } else if (selectedCard && selectedCard.from === 'grid' && gameMode === 'shuffle') {
        placedCards[cellIndex] = placedCards[selectedCard.index];
        placedCards[selectedCard.index] = null;
        selectedCard = null;
      }

      renderCardPool(deck.filter(c => c !== null));
      renderGrid();
    });

    grid.appendChild(cell);
  }
}

function endGame() {
  const hands = [];

  for (let r = 0; r < 5; r++) {
    hands.push(placedCards.slice(r * 5, r * 5 + 5));
  }

  for (let c = 0; c < 5; c++) {
    hands.push([0,1,2,3,4].map(r => placedCards[r * 5 + c]));
  }

  const score = hands.reduce((total, hand) => total + scoreHand(hand, scoringSystem), 0);
  alert(`Final Score: ${score} (${scoringSystem} system)`);
  saveScoreToLeaderboard(score);
  updateLeaderboardDisplay();
}

function resetGame() {
  selectedCard = null;
  deck = [];
  placedCards = Array(25).fill(null);
  document.getElementById('menu').style.display = 'block';
  document.getElementById('game').style.display = 'none';
  updateLeaderboardDisplay();
}

function getLeaderboardKey() {
  return `leaderboard_${gameMode}_${scoringSystem}`;
}

function saveScoreToLeaderboard(score) {
  const name = prompt("Enter your name for the leaderboard:", "Anonymous") || "Anonymous";
  const key = getLeaderboardKey();
  const entry = { name, score, mode: gameMode, scoring: scoringSystem };

  let list = JSON.parse(localStorage.getItem(key)) || [];
  list.push(entry);
  list.sort((a, b) => b.score - a.score);
  list = list.slice(0, 5);
  localStorage.setItem(key, JSON.stringify(list));
}

function updateLeaderboardDisplay() {
  const mode = document.getElementById('game-mode')?.value || 'standard';
  const scoring = document.getElementById('scoring-system')?.value || 'american';
  const key = `leaderboard_${mode}_${scoring}`;
  const list = JSON.parse(localStorage.getItem(key)) || [];

  const out = list.map((entry, i) =>
    `<div>#${i + 1}: ${entry.name} - ${entry.score} pts</div>`
  ).join('') || '<div>No scores yet!</div>';

  document.getElementById('leaderboard-list').innerHTML = out;
}
