import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { addWord, getWords, hasWord, mergeWordBooks, removeWord } from '../wordBook';
import { getDueCount, getDueKeys, getReviewSchedule, recordReviewResult } from '../reviewSchedule';
import { saveProgress } from '../../services/api';

vi.mock('../../services/api', () => ({ saveProgress: vi.fn() }));

describe('wordBook', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-18T12:00:00Z'));
    vi.clearAllMocks();
    saveProgress.mockResolvedValue({});
  });
  afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });

  it('normalizes IDs, keeps the original duplicate, and initializes a due entry without a lapse', () => {
    const original = addWord({ word: ' Kissa ', translationJa: '猫', source: { type: 'manual' } });
    expect(original).toMatchObject({ id: 'kissa', word: 'Kissa', translationJa: '猫', note: '', translation: '' });
    expect(addWord({ word: 'kissa', translationJa: '変更' })).toEqual(original);
    expect(hasWord(' KISSA ')).toBe(true);
    expect(getWords()).toEqual([original]);
    expect(getReviewSchedule()['word:kissa']).toEqual({
      box: 1, dueAt: new Date().toISOString(), lastReviewedAt: new Date().toISOString(), lapses: 0
    });
    expect(getDueKeys('word')).toEqual(['kissa']);
    expect(getDueCount()).toEqual({ total: 1, word: 1, sentence: 0, grammar: 0 });
    expect(saveProgress).toHaveBeenCalledTimes(1);
    expect(saveProgress).toHaveBeenCalledWith({ wordBook: [original], reviewSchedule: getReviewSchedule() });
  });

  it('does not reset an existing review and removes only the deleted word and its schedule', () => {
    addWord({ word: 'kissa' });
    addWord({ word: 'koira' });
    recordReviewResult('word:kissa', true);
    const advanced = getReviewSchedule()['word:kissa'];
    addWord({ word: 'KISSA' });
    expect(getReviewSchedule()['word:kissa']).toEqual(advanced);
    removeWord('kissa');
    expect(hasWord('kissa')).toBe(false);
    expect(getReviewSchedule()['word:kissa']).toBeUndefined();
    expect(getDueKeys('word')).toEqual(['koira']);
    expect(saveProgress).toHaveBeenLastCalledWith({ wordBook: getWords(), reviewSchedule: getReviewSchedule() });
  });

  it('merges by normalized ID and retains the oldest entry in either order', () => {
    const older = { id: 'kissa', word: 'kissa', translationJa: '猫', addedAt: '2026-10-01T00:00:00Z' };
    const newer = { ...older, word: 'Kissa', translationJa: '新', addedAt: '2026-10-02T00:00:00Z' };
    const result = mergeWordBooks([newer], [older, { word: 'koira' }]);
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject(older);
    expect(mergeWordBooks([older], [newer])[0]).toMatchObject(older);
    expect(mergeWordBooks(null, [null, {}, { word: ' ' }])).toEqual([]);
  });

  it('tolerates corrupt or unavailable storage and rejects blank words', () => {
    localStorage.setItem('finnishLearnerWordBook', '{broken');
    expect(getWords()).toEqual([]);
    expect(addWord({ word: '  ' })).toBeNull();
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    expect(() => addWord({ word: 'kissa' })).not.toThrow();
    expect(() => removeWord('kissa')).not.toThrow();
  });

  it('warns when saving fails asynchronously or synchronously', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    saveProgress.mockRejectedValueOnce(new Error('offline'));
    addWord({ word: 'kissa' });
    await Promise.resolve();
    expect(warn).toHaveBeenCalled();
    warn.mockClear();
    saveProgress.mockImplementationOnce(() => { throw new Error('offline'); });
    removeWord('kissa');
    expect(warn).toHaveBeenCalled();
  });
});
