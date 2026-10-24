export function createOutfitRound(game, random = Math.random) {
  if (!game || !Array.isArray(game.conditions) || game.conditions.length === 0) {
    return [];
  }

  // Shallow copy of conditions
  const copy = [...game.conditions];

  // Fisher-Yates shuffle
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  const length = typeof game.playLength === 'number' && game.playLength > 0
    ? game.playLength
    : copy.length;

  return copy.slice(0, length);
}

export function checkOutfit(condition, selection) {
  if (!condition || !condition.accept || !selection || typeof selection !== 'object') {
    return { allCorrect: false, wrongSlotIds: [] };
  }

  const wrongSlotIds = [];
  const requiredSlotIds = Object.keys(condition.accept);

  for (const slotId of requiredSlotIds) {
    const acceptedOptions = condition.accept[slotId];
    const selectedOption = selection[slotId];

    if (!selectedOption || !Array.isArray(acceptedOptions) || !acceptedOptions.includes(selectedOption)) {
      wrongSlotIds.push(slotId);
    }
  }

  return {
    allCorrect: wrongSlotIds.length === 0,
    wrongSlotIds
  };
}

export function getWearSentences(game, selection) {
  if (!game || !Array.isArray(game.slots) || !selection || typeof selection !== 'object') {
    return [];
  }

  const sentences = [];

  for (const slot of game.slots) {
    const selectedOptionId = selection[slot.id];
    if (!selectedOptionId || !Array.isArray(slot.options)) continue;

    const option = slot.options.find((o) => o.id === selectedOptionId);
    if (option && option.wear) {
      sentences.push(option.wear);
    }
  }

  return sentences;
}
