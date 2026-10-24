import { describe, it, expect } from 'vitest';
import {
  createSortRound,
  getCurrentSortItem,
  answerSortItem,
  nextSortItem
} from '../sortGame';

const game = {
  playLength: 2,
  items: [
    { id: 'a', binId: 'x' },
    { id: 'b', binId: 'y' },
    { id: 'c', binId: 'x' }
  ]
};

describe('sortGame', () => {
  it('picks playLength items, or all of them when there are fewer or no playLength', () => {
    expect(createSortRound(game).items).toHaveLength(2);
    expect(createSortRound({ ...game, playLength: 10 }).items).toHaveLength(3);
    expect(createSortRound({ items: game.items }).items).toHaveLength(3);
  });

  it('does not repeat items and is deterministic for a fixed random', () => {
    const round = createSortRound({ ...game, playLength: 3 }, () => 0);
    expect(new Set(round.items.map((i) => i.id)).size).toBe(3);
    expect(createSortRound({ ...game, playLength: 3 }, () => 0).items).toEqual(round.items);
  });

  it('returns an empty round for missing data', () => {
    expect(createSortRound(null).items).toEqual([]);
    expect(getCurrentSortItem(createSortRound(null))).toBeNull();
    expect(getCurrentSortItem(null)).toBeNull();
    const result = answerSortItem(createSortRound(null), 'x');
    expect(result.isCorrect).toBe(false);
    expect(result.isNewItem).toBe(false);
  });

  it('stays on the item after a wrong answer and flags isNewItem only once', () => {
    const round = createSortRound(game, () => 0.99);
    const item = getCurrentSortItem(round);
    const wrongBin = item.binId === 'x' ? 'y' : 'x';

    const first = answerSortItem(round, wrongBin);
    expect(first.isCorrect).toBe(false);
    expect(first.isNewItem).toBe(true);
    expect(first.finished).toBe(false);
    expect(first.state.solved).toBe(false);
    expect(getCurrentSortItem(first.state)).toBe(item);

    const second = answerSortItem(first.state, item.binId);
    expect(second.isCorrect).toBe(true);
    expect(second.isNewItem).toBe(false);
    expect(second.state.solved).toBe(true);
  });

  it('marks a correct first answer as new, ignores taps once solved, then advances to the end', () => {
    let state = createSortRound(game, () => 0.99);
    let result = answerSortItem(state, getCurrentSortItem(state).binId);
    expect(result.isCorrect).toBe(true);
    expect(result.isNewItem).toBe(true);
    expect(result.finished).toBe(false);

    const ignored = answerSortItem(result.state, 'x');
    expect(ignored.state).toBe(result.state);
    expect(ignored.isCorrect).toBe(false);

    state = nextSortItem(result.state);
    expect(state.index).toBe(1);
    expect(state.solved).toBe(false);

    result = answerSortItem(state, getCurrentSortItem(state).binId);
    expect(result.isCorrect).toBe(true);
    expect(result.finished).toBe(true);
  });

  it('nextSortItem does nothing before the item is solved', () => {
    const state = createSortRound(game);
    expect(nextSortItem(state)).toBe(state);
    expect(nextSortItem(null)).toBeNull();
  });
});
