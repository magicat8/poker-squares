// Constants
const GRID_SIZE = 5;
const TOTAL_CARDS = GRID_SIZE * GRID_SIZE;

// Current game mode, can be 'standard' or 'shuffle'
let gameMode = 'standard';

// Current scoring system, can be 'american' or another system
let scoringSystem = 'american';

// Array representing the current deck of cards
let deck = [];

// Array representing the cards placed on the 5x5 grid (25 slots)
let placedCards = Array(TOTAL_CARDS).fill(null);

// Stores the index or object of the currently selected card (from deck or grid)
let selectedCard = null;

// Initializes the game when the player starts
function startGame() {
  gameMode = document.getElementById('game-mode').value;
  scoringSystem = document.getElementById('scoring-system').value;

  document.getElementById('menu').style.display = 'none';
  document.getElementById('game').style.display = 'block';

  document.getElementById('mode-title').textContent = `Mode: ${gameMode} | Scoring: ${scoringSystem}`;

  deck = generateDeck();
  placedCards = Array(TOTAL_CARDS).fill(null);

  renderCardPool(deck);
  renderGrid();
}

// Creates and shuffles a 52-card deck and returns the first 25
function generateDeck() {
  const suits = ['♠', '♥', '♦', '♣'];
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
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

  return cards.slice(0, TOTAL_CARDS);
}

// Renders the remaining cards in the card pool (deck area)
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

    // Prevent selecting non-top card in standard mode
    if (gameMode === 'standard') {
      const topIndex = deck.findIndex(c => c !== null);
      if (index !== topIndex) return;
    }
    
    if (gameMode === 'shuffle') {
      const topIndex = deck.findIndex(c => c !== null);
      if (index !== topIndex) return;
    }

    div.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('card-index', index);
      e.dataTransfer.setDragImage(div, 10, 10);
    });

    div.addEventListener('click', () => {
      selectedCard = index;
      clearSelection();
      div.classList.add('selected');
    });

    pool.appendChild(div);
  });
}

// Clears all .selected card highlights
function clearSelection() {
  document.querySelectorAll('.card').forEach(el => el.classList.remove('selected'));
}

// Renders the 5x5 grid and cards placed in it
function renderGrid() {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';

  for (let i = 0; i < TOTAL_CARDS; i++) {
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
          e.dataTransfer.setDragImage(div, 10, 10);
        });

        div.addEventListener('click', () => {
          selectedCard = { from: 'grid', index: i };
          clearSelection();
          div.classList.add('selected');
        });
      }

      cell.appendChild(div);
    }

    cell.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    cell.addEventListener('drop', (e) => {
      e.preventDefault();
      const poolIndex = e.dataTransfer.getData('card-index');
      const fromGrid = e.dataTransfer.getData('from-grid');
      const cellIndex = parseInt(cell.dataset.cell);

      if (fromGrid !== '') {
        const fromIndex = parseInt(fromGrid);
        if (!isNaN(fromIndex)) {
          const moving = placedCards[fromIndex];
          placedCards[fromIndex] = null;
          placedCards[cellIndex] = moving;
        }
      } else if (poolIndex !== '') {
        const cardIndex = parseInt(poolIndex);
        if (gameMode === 'standard' && placedCards[cellIndex]) return;
        placedCards[cellIndex] = deck[cardIndex];
        deck[cardIndex] = null;
      }

      selectedCard = null;
      clearSelection();
      renderCardPool(deck);
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

      clearSelection();
      renderCardPool(deck);
      renderGrid();
    });

    grid.appendChild(cell);
  }
}

// Ends the game, evaluates hands, scores them, and updates leaderboard
function endGame() {
  if (placedCards.includes(null)) {
    alert("Please complete the grid before ending the game.");
    return;
  }

  const hands = [];

  for (let r = 0; r < GRID_SIZE; r++) {
    hands.push(placedCards.slice(r * GRID_SIZE, r * GRID_SIZE + GRID_SIZE));
  }

  for (let c = 0; c < GRID_SIZE; c++) {
    hands.push([0, 1, 2, 3, 4].map(r => placedCards[r * GRID_SIZE + c]));
  }

  const score = hands.reduce((total, hand) => total + scoreHand(hand, scoringSystem), 0);

  alert(`Final Score: ${score} (${scoringSystem} system)`);
  saveScoreToLeaderboard(score);
  updateLeaderboardDisplay();
}

// Resets the game and returns to the main menu
function resetGame() {
  selectedCard = null;
  deck = [];
  placedCards = Array(TOTAL_CARDS).fill(null);
  document.getElementById('menu').style.display = 'block';
  document.getElementById('game').style.display = 'none';
  updateLeaderboardDisplay();
}

// Helper function to build a unique key for current mode and scoring system
function getLeaderboardKey() {
  return `leaderboard_${gameMode}_${scoringSystem}`;
}

// Saves a score to the local leaderboard in localStorage
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

// Updates the leaderboard display on the page
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

document.addEventListener('DOMContentLoaded', updateLeaderboardDisplay);