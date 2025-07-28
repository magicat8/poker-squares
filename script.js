// Current game mode, can be 'standard' or 'shuffle'
let gameMode = 'standard';

// Current scoring system, can be 'american' or another system
let scoringSystem = 'american';

// Array representing the current deck of cards
let deck = [];

// Array representing the cards placed on the 5x5 grid (25 slots)
let placedCards = Array(25).fill(null);

// Stores the index or object of the currently selected card (from deck or grid)
let selectedCard = null;

// Initializes the game when the player starts
function startGame() {
  // Get selected game mode and scoring system from the UI
  gameMode = document.getElementById('game-mode').value;
  scoringSystem = document.getElementById('scoring-system').value;

  // Hide the menu and show the game screen
  document.getElementById('menu').style.display = 'none';
  document.getElementById('game').style.display = 'block';

  // Update title to reflect selected mode and scoring system
  document.getElementById('mode-title').textContent = `Mode: ${gameMode} | Scoring: ${scoringSystem}`;

  // Generate a fresh shuffled deck of 25 cards
  deck = generateDeck();

  // If in shuffle mode, reset grid and render deck in pool
  if (gameMode === 'shuffle') {
    placedCards = Array(25).fill(null);
    renderCardPool(deck);
  } else {
    // In standard mode, render full card pool (only top card will be used per move)
    renderCardPool(deck);
  }

  // Render the empty or pre-filled grid
  renderGrid();
}

// Creates and shuffles a 52-card deck and returns the first 25
function generateDeck() {
  const suits = ['♠', '♥', '♦', '♣']; // Card suits
  const values = ['A','2','3','4','5','6','7','8','9','10','J','Q','K']; // Card values
  const cards = []; // Full deck

  // Create all 52 cards
  for (let s of suits) {
    for (let v of values) {
      cards.push({ suit: s, value: v });
    }
  }

  // Shuffle the deck using Fisher-Yates algorithm
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  // Return only the top 25 cards for the game
  return cards.slice(0, 25);
}

// Renders the remaining cards in the card pool (deck area)
function renderCardPool(cards) {
  const pool = document.getElementById('card-pool');
  pool.innerHTML = ''; // Clear previous cards

  // Loop through each card and render it
  cards.forEach((card, index) => {
    if (!card) return; // Skip null entries

    const div = document.createElement('div');
    div.className = 'card' + (card.suit === '♥' || card.suit === '♦' ? ' red' : ''); // Add red class for red suits
    div.draggable = true;
    div.textContent = `${card.value} ${card.suit}`; // Card label
    div.dataset.index = index; // Store index for drag-and-drop

    // Allow dragging cards from the pool
    div.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('card-index', index);
    });

    // Handle click selection (for touch devices or manual click)
    div.addEventListener('click', () => {
      selectedCard = index;
      document.querySelectorAll('.card').forEach(el => el.classList.remove('selected'));
      div.classList.add('selected');
    });

    pool.appendChild(div);
  });
}

// Renders the 5x5 grid and cards placed in it
function renderGrid() {
  const grid = document.getElementById('grid');
  grid.innerHTML = ''; // Clear grid

  // Loop through each of the 25 grid cells
  for (let i = 0; i < 25; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.cell = i;

    const card = placedCards[i]; // Get card at this grid position
    if (card) {
      const div = document.createElement('div');
      div.className = 'card' + (card.suit === '♥' || card.suit === '♦' ? ' red' : '');
      div.textContent = `${card.value} ${card.suit}`;
      div.draggable = (gameMode === 'shuffle'); // Only draggable in shuffle mode
      div.dataset.grid = i;

      // Enable dragging cards within the grid (shuffle mode only)
      if (gameMode === 'shuffle') {
        div.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('from-grid', i);
        });

        // Click selection for grid cards in shuffle mode
        div.addEventListener('click', () => {
          selectedCard = { from: 'grid', index: i };
        });
      }

      cell.appendChild(div);
    }

    // Allow card drops into this cell
    cell.addEventListener('dragover', (e) => {
      e.preventDefault(); // Required for drop to work
    });

    cell.addEventListener('drop', (e) => {
      const poolIndex = e.dataTransfer.getData('card-index'); // Card from pool
      const fromGrid = e.dataTransfer.getData('from-grid');   // Card from grid
      const cellIndex = parseInt(cell.dataset.cell);

      if (fromGrid !== '') {
        // Move a card from another grid cell
        const moving = placedCards[fromGrid];
        placedCards[fromGrid] = null;
        placedCards[cellIndex] = moving;
      } else if (poolIndex !== '') {
        // Place a card from the pool (deck)
        if (gameMode === 'standard' && placedCards[cellIndex]) return; // Prevent overwrite
        placedCards[cellIndex] = deck[poolIndex];
        deck[poolIndex] = null;
      }

      // Re-render UI
      renderCardPool(deck.filter(c => c !== null));
      renderGrid();
    });

    // Allow click-based card movement (no drag-and-drop)
    cell.addEventListener('click', () => {
      const cellIndex = parseInt(cell.dataset.cell);

      if (typeof selectedCard === 'number') {
        // Card selected from pool
        if (gameMode === 'standard' && placedCards[cellIndex]) return;
        placedCards[cellIndex] = deck[selectedCard];
        deck[selectedCard] = null;
        selectedCard = null;
      } else if (selectedCard && selectedCard.from === 'grid' && gameMode === 'shuffle') {
        // Move card within grid
        placedCards[cellIndex] = placedCards[selectedCard.index];
        placedCards[selectedCard.index] = null;
        selectedCard = null;
      }

      // Re-render updated UI
      renderCardPool(deck.filter(c => c !== null));
      renderGrid();
    });

    grid.appendChild(cell);
  }
}

// Ends the game, evaluates hands, scores them, and updates leaderboard
function endGame() {
  const hands = [];

  // Create row hands (5 total)
  for (let r = 0; r < 5; r++) {
    hands.push(placedCards.slice(r * 5, r * 5 + 5));
  }

  // Create column hands (5 total)
  for (let c = 0; c < 5; c++) {
    hands.push([0,1,2,3,4].map(r => placedCards[r * 5 + c]));
  }

  // Score each hand and sum total
  const score = hands.reduce((total, hand) => total + scoreHand(hand, scoringSystem), 0);

  // Show final score and save it
  alert(`Final Score: ${score} (${scoringSystem} system)`);
  saveScoreToLeaderboard(score);
  updateLeaderboardDisplay();
}

// Resets the game and returns to the main menu
function resetGame() {
  selectedCard = null;
  deck = [];
  placedCards = Array(25).fill(null);
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
  // Prompt for player name
  const name = prompt("Enter your name for the leaderboard:", "Anonymous") || "Anonymous";

  const key = getLeaderboardKey();
  const entry = { name, score, mode: gameMode, scoring: scoringSystem };

  // Load and update the leaderboard
  let list = JSON.parse(localStorage.getItem(key)) || [];
  list.push(entry);
  list.sort((a, b) => b.score - a.score); // Sort high to low
  list = list.slice(0, 5); // Keep top 5 scores
  localStorage.setItem(key, JSON.stringify(list));
}

// Updates the leaderboard display on the page
function updateLeaderboardDisplay() {
  // Get current mode and scoring values
  const mode = document.getElementById('game-mode')?.value || 'standard';
  const scoring = document.getElementById('scoring-system')?.value || 'american';
  const key = `leaderboard_${mode}_${scoring}`;
  const list = JSON.parse(localStorage.getItem(key)) || [];

  // Build HTML from leaderboard entries
  const out = list.map((entry, i) =>
    `<div>#${i + 1}: ${entry.name} - ${entry.score} pts</div>`
  ).join('') || '<div>No scores yet!</div>';

  document.getElementById('leaderboard-list').innerHTML = out;
}