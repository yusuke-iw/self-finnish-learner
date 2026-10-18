import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getSentenceMistakes,
  addSentenceMistake,
  removeSentenceMistake,
  mergeSentenceMistakes
} from '../sentenceMistakes';

describe('sentenceMistakes utility', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('getSentenceMistakes', () => {
    it('returns an empty array when nothing is stored', () => {
      expect(getSentenceMistakes()).toEqual([]);
    });

    it('returns stored mistakes when valid JSON array is present', () => {
      const items = [
        { sentenceId: 's1', count: 2, lastMistakeAt: '2026-01-01T00:00:00.000Z' }
      ];
      localStorage.setItem('finnishLearnerSentenceMistakes', JSON.stringify(items));
      expect(getSentenceMistakes()).toEqual(items);
    });

    it('returns an empty array on invalid JSON or localStorage error', () => {
      localStorage.setItem('finnishLearnerSentenceMistakes', 'not-json');
      expect(getSentenceMistakes()).toEqual([]);

      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage error');
      });
      expect(getSentenceMistakes()).toEqual([]);
    });
  });

  describe('addSentenceMistake', () => {
    it('adds a new mistake with count 1 and ISO lastMistakeAt', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-05-01T10:00:00.000Z'));

      const result = addSentenceMistake('s1');
      expect(result).toEqual([
        { sentenceId: 's1', count: 1, lastMistakeAt: '2026-05-01T10:00:00.000Z' }
      ]);
      expect(getSentenceMistakes()).toEqual(result);
    });

    it('increments count and updates lastMistakeAt if sentenceId already exists', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-05-01T10:00:00.000Z'));
      addSentenceMistake('s1');

      vi.setSystemTime(new Date('2026-05-02T12:30:00.000Z'));
      const result = addSentenceMistake('s1');

      expect(result).toEqual([
        { sentenceId: 's1', count: 2, lastMistakeAt: '2026-05-02T12:30:00.000Z' }
      ]);
      expect(getSentenceMistakes()).toEqual(result);
    });

    it('ignores matching-warmup- or empty sentenceIds', () => {
      expect(addSentenceMistake('matching-warmup-123')).toEqual([]);
      expect(addSentenceMistake('')).toEqual([]);
      expect(addSentenceMistake(null)).toEqual([]);
      expect(getSentenceMistakes()).toEqual([]);
    });
  });

  describe('removeSentenceMistake', () => {
    it('removes the specified sentenceId from storage', () => {
      addSentenceMistake('s1');
      addSentenceMistake('s2');

      const remaining = removeSentenceMistake('s1');
      expect(remaining).toHaveLength(1);
      expect(remaining[0].sentenceId).toBe('s2');
      expect(getSentenceMistakes()).toEqual(remaining);
    });
  });

  describe('mergeSentenceMistakes', () => {
    it('deduplicates by sentenceId, taking larger count and newer lastMistakeAt', () => {
      const a = [
        { sentenceId: 's1', count: 3, lastMistakeAt: '2026-05-01T10:00:00.000Z' },
        { sentenceId: 's2', count: 1, lastMistakeAt: '2026-05-03T10:00:00.000Z' }
      ];
      const b = [
        { sentenceId: 's1', count: 1, lastMistakeAt: '2026-05-02T10:00:00.000Z' },
        { sentenceId: 's2', count: 4, lastMistakeAt: '2026-05-01T08:00:00.000Z' },
        { sentenceId: 's3', count: 2, lastMistakeAt: '2026-05-04T00:00:00.000Z' }
      ];

      const merged = mergeSentenceMistakes(a, b);
      expect(merged).toEqual([
        { sentenceId: 's1', count: 3, lastMistakeAt: '2026-05-02T10:00:00.000Z' },
        { sentenceId: 's2', count: 4, lastMistakeAt: '2026-05-03T10:00:00.000Z' },
        { sentenceId: 's3', count: 2, lastMistakeAt: '2026-05-04T00:00:00.000Z' }
      ]);
    });

    it('handles non-array inputs safely', () => {
      expect(mergeSentenceMistakes(null, undefined)).toEqual([]);
    });
  });
});
