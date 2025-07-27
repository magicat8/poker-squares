function scoreHand(hand, system = 'american') {
  if (hand.length !== 5 || hand.some(c => c == null)) return 0;

  const values = hand.map(c => c.value);
  const suits = hand.map(c => c.suit);

  const rankOrder = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
  const valueCounts = {};
  values.forEach(v => valueCounts[v] = (valueCounts[v] || 0) + 1);

  const counts = Object.values(valueCounts).sort((a, b) => b - a);
  const isFlush = suits.every(s => s === suits[0]);

  const sortedIndexes = values.map(v => rankOrder.indexOf(v)).sort((a, b) => a - b);
  let isStraight = true;
  for (let i = 1; i < sortedIndexes.length; i++) {
    if (sortedIndexes[i] !== sortedIndexes[i - 1] + 1) {
      isStraight = false;
      break;
    }
  }

  if (!isStraight && values.includes('A') && values.includes('2') && values.includes('3') && values.includes('4') && values.includes('5')) {
    isStraight = true;
  }

  const isRoyal = isFlush && isStraight && values.includes('A') && values.includes('10');

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

  return scoring[system][handType];
}
