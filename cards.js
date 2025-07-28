// Function to score a poker hand based on a given system ('american' or 'english')
function scoreHand(hand, system = 'american') {
  // Return 0 if the hand doesn't have exactly 5 cards or contains null/invalid cards
  if (hand.length !== 5 || hand.some(c => c == null)) return 0;

  // Extract the value and suit of each card in the hand
  const values = hand.map(c => c.value);
  const suits = hand.map(c => c.suit);

  // Order of card ranks for comparison
  const rankOrder = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];

  // Count the frequency of each card value
  const valueCounts = {};
  values.forEach(v => valueCounts[v] = (valueCounts[v] || 0) + 1);
  const counts = Object.values(valueCounts).sort((a, b) => b - a);

  // Check for flush (all suits the same)
  const isFlush = suits.every(s => s === suits[0]);

  // Convert card values to their rank indexes for straight detection
  const sortedIndexes = values.map(v => rankOrder.indexOf(v)).sort((a, b) => a - b);
  const uniqueIndexes = [...new Set(sortedIndexes)];

  // Check for standard straight (5 consecutive unique ranks)
  let isStraight = uniqueIndexes.length === 5 && uniqueIndexes[4] - uniqueIndexes[0] === 4;

  // Special case: Ace-low straight (A, 2, 3, 4, 5)
  if (
    !isStraight &&
    values.includes('A') &&
    values.includes('2') &&
    values.includes('3') &&
    values.includes('4') &&
    values.includes('5')
  ) {
    isStraight = true;
  }

  // Check for royal flush (10, J, Q, K, A all in the same suit)
  const isRoyal = isFlush && isStraight && values.includes('A') && values.includes('10');

  // Determine hand type based on card patterns
  let handType = '';
  if (isRoyal) handType = 'royal_flush';
  else if (isFlush && isStraight) handType = 'straight_flush';
  else if (counts[0] === 4) handType = 'four_of_a_kind';
  else if (counts[0] === 3 && counts[1] === 2) handType = 'full_house';
  else if (isFlush) handType = 'flush';
  else if (isStraight) handType = 'straight';
  else if (counts[0] === 3) handType = 'three_of_a_kind';
  else if (counts[0] === 2 && counts[1] === 2) handType = 'two_pair';
  else if (counts[0] === 2) handType = 'one_pair';
  else handType = 'high_card';

  // Scoring systems
  const scoring = {
    american: {
      royal_flush: 100,
      straight_flush: 75,
      four_of_a_kind: 50,
      full_house: 25,
      flush: 20,
      straight: 15,
      three_of_a_kind: 10,
      two_pair: 5,
      one_pair: 2,
      high_card: 0,
    },
    english: {
      royal_flush: 30,
      straight_flush: 30,
      four_of_a_kind: 16,
      full_house: 10,
      flush: 5,
      straight: 12,
      three_of_a_kind: 6,
      two_pair: 3,
      one_pair: 1,
      high_card: 0,
    },
  };

  // Return score, defaulting to 0 if system or hand type is unknown
  return (scoring[system]?.[handType] ?? 0);
}
