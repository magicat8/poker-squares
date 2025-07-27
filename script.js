let deck = [];
let placedCards = Array(25).fill(null);
let gameMode = 'standard';
let scoringSystem = 'american';
let selectedCard = null;

const pokerScores = {
  american: { pair: 2, twoPair: 5, three: 10, straight: 15, flush: 20, fullHouse: 25, four: 50, straightFlush: 75, royal: 100 },
  english:  { pair: 1, twoPair: 3, three: 6, straight: 12, flush: 5, fullHouse: 10, four: 16, straightFlush: 30, royal: 30 }
};

function startGame() {
  gameMode = document.getElementById('game-mode').value;
  scoringSystem = document.getElementById('scoring-system').value;

  document.getElementById('menu').style.display = 'none';
  document.getElementById('game').style.display = 'block';
  document.getElementById('mode-title').textContent = `Mode: ${gameMode} | Scoring: ${scoringSystem}`;

  if (!loadGame()) {
    deck = generateDeck();
    placedCards = Array(25).fill(null);
    if (gameMode === 'shuffle') renderCardPool(deck);
    else renderCardPool([deck[0]]);
  }

  renderGrid();
}

function renderCardPool(cards) {
  const pool = document.getElementById('card-pool');
  pool.innerHTML = '';
  cards.forEach((card, idx) => {
    const div = document.createElement('div');
    div.className = 'card' + (card.suit === '♥' || card.suit === '♦' ? ' red' : '');
    div.innerHTML = `${card.rank}<br/>${card.suit}`;
    div.onclick = () => {
      selectedCard = card;
      renderCardPool(cards.map(c => ({...c}))); // Re-render to show selection
    };
    if (card === selectedCard) div.classList.add('selected');
    pool.appendChild(div);
  });
}

function renderGrid() {
  const container = document.getElementById('card-container');
  container.innerHTML = '';
  placedCards.forEach((card, idx) => {
    const div = document.createElement('div');
    div.className = 'card';
    if (card) {
      div.innerHTML = `${card.rank}<br/>${card.suit}`;
      div.classList.add(card.suit === '♥' || card.suit === '♦' ? 'red' : '');
      if (gameMode === 'shuffle') {
        div.onclick = () => {
          selectedCard = card;
          placedCards[idx] = null;
          renderGrid();
          renderCardPool([selectedCard]);
        };
      }
    } else if (selectedCard) {
      div.onclick = () => {
        placedCards[idx] = selectedCard;
        if (gameMode === 'standard') deck.shift();
        selectedCard = null;
        renderGrid();
        renderCardPool(gameMode === 'standard' ? [deck[0]] : deck.filter(c => !placedCards.includes(c)));
        if (placedCards.every(c => c)) finishGame();
      };
    }
    container.appendChild(div);
  });
  saveGame();
}

function saveGame() {
  localStorage.setItem('pokerGame', JSON.stringify({ deck, placedCards, gameMode, scoringSystem, selectedCard }));
}

function loadGame() {
  const data = JSON.parse(localStorage.getItem('pokerGame'));
  if (!data || !data.placedCards) return false;
  deck = data.deck;
  placedCards = data.placedCards;
  gameMode = data.gameMode;
  scoringSystem = data.scoringSystem;
  selectedCard = data.selectedCard;
  renderCardPool(gameMode === 'standard' ? [deck[0]] : deck.filter(c => !placedCards.includes(c)));
  return true;
}

function resetGame() {
  localStorage.removeItem('pokerGame');
  location.reload();
}

function finishGame() {
  const score = Math.floor(Math.random() * 400); // Placeholder score
  document.getElementById('score-display').textContent = `Score: ${score}`;
  const scores = JSON.parse(localStorage.getItem('leaderboard') || '[]');
  scores.push(score);
  scores.sort((a, b) => b - a);
  localStorage.setItem('leaderboard', JSON.stringify(scores.slice(0, 5)));
  updateLeaderboardDisplay();
}

function updateLeaderboardDisplay() {
  const scores = JSON.parse(localStorage.getItem('leaderboard') || '[]');
  const list = document.getElementById('top-scores');
  list.innerHTML = scores.map(s => `<li>${s}</li>`).join('');
}
