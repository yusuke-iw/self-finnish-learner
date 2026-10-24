function shuffle(list, random) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function createSortRound(game, random = Math.random) {
  const items = game && Array.isArray(game.items) ? game.items : [];
  const length = game && typeof game.playLength === 'number' && game.playLength > 0
    ? Math.min(game.playLength, items.length)
    : items.length;

  return {
    items: shuffle(items, random).slice(0, length),
    index: 0,
    solved: false,
    answeredIds: []
  };
}

export function getCurrentSortItem(state) {
  if (!state || !Array.isArray(state.items)) return null;
  return state.items[state.index] || null;
}

// Judge a tap on a bin. A correct answer marks the item solved (the caller shows the
// sentence and then calls nextSortItem); a wrong answer leaves the item to be retried.
// isNewItem is true only the first time the item is answered, so the caller can call
// recordAnswer() once per item.
export function answerSortItem(state, binId) {
  const item = getCurrentSortItem(state);
  if (!item || state.solved) {
    return { state, isCorrect: false, isNewItem: false, finished: false };
  }

  const isNewItem = !state.answeredIds.includes(item.id);
  const isCorrect = item.binId === binId;
  const nextState = {
    ...state,
    solved: isCorrect,
    answeredIds: isNewItem ? [...state.answeredIds, item.id] : state.answeredIds
  };

  return {
    state: nextState,
    isCorrect,
    isNewItem,
    finished: isCorrect && state.index + 1 >= state.items.length
  };
}

export function nextSortItem(state) {
  if (!state || !state.solved) return state;
  return { ...state, index: state.index + 1, solved: false };
}
