
function generateDeck() {
  const suits = ['♠', '♥', '♦', '♣'];
  const values = [
    'A', '2', '3', '4', '5', '6', '7', '8',
    '9', '10', 'J', 'Q', 'K'
  ];
  const deck = [];
  for (const suit of suits) {
    for (const value of values) {
      deck.push({ suit, value });
    }
  }
  return shuffle(deck);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
