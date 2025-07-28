// Function to score a poker hand based on a given system ('american' or 'english')
function scoreHand(hand, system = 'american') {
  // Return 0 if the hand doesn't have exactly 5 cards or contains null/invalid cards
  if (hand.length !== 5 || hand.some(c => c == null)) return 0;

  // Extract the value (e.g., 'A', 'K', '10') of each card in the hand
  const values = hand.map(c => c.value);

  // Extract the suit (e.g., 'hearts', 'clubs') of each card in the hand
  const suits = hand.map(c => c.suit);

  // The order of card ranks, used to determine straights and hand strength
  const rankOrder = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];

  // Object to count how many times each card value appears in the hand
  const valueCounts = {};
  values.forEach(v => valueCounts[v] = (valueCounts[v] || 0) + 1);

  // Array of how many times each value appears, sorted from most to least frequent
  // (e.g., [3,2] for a full house, [2,2,1] for two pair)
  const counts = Object.values(valueCounts).sort((a, b) => b - a);

  // Boolean: true if all cards have the same suit (i.e., it's a flush)
  const isFlush = suits.every(s => s === suits[0]);

  // Convert card values to their indexes in rankOrder, then sort ascending
  // Used to detect sequential order (i.e., a straight)
  const sortedIndexes = values.map(v => rankOrder.indexOf(v)).sort((a, b) => a - b);

  // Boolean: true if the card values form a continuous sequence (i.e., a straight)
  let isStraight = true;
  for (let i = 1; i < sortedIndexes.length; i++) {
    if (sortedIndexes[i] !== sortedIndexes[i - 1] + 1) {
      isStraight = false;
      break;
    }
  }

  // Special case: check for Ace-low straight (A, 2, 3, 4, 5)
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

  // Boolean: true if it's a royal flush (10, J, Q, K, A all same suit)
  const isRoyal = isFlush && isStraight && values.includes('A') && values.includes('10');

  // String that will represent the identified type of poker hand
  let handType = '';
  if (isRoyal) handType = 'royal_flush';
  else if (isFlush && isStraight) handType = 'straight_flush';
  else if (counts[0] === 4) handType = 'four_of_a_kind';            // e.g., [4,1]
  else if (counts[0] === 3 && counts[1] === 2) handType = 'full_house'; // e.g., [3,2]
  else if (isFlush) handType = 'flush';
  else if (isStraight) handType = 'straight';
  else if (counts[0] === 3) handType = 'three_of_a_kind';           // e.g., [3,1,1]
  else if (counts[0] === 2 && counts[1] === 2) handType = 'two_pair';   // e.g., [2,2,1]
  else if (counts[0] === 2) handType = 'one_pair';                  // e.g., [2,1,1,1]
  else handType = 'high_card';                                      // No other match

  // Scoring tables for each hand type under two different systems
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

  // Return the final score based on the chosen system and the detected hand type
  return scoring[system][handType];
}