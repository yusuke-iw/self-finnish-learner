import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  LOCAL_STORAGE_MISTAKES_KEY,
  loadLocalMistakes,
  getDueMistakes,
  saveProgressSafe,
  mergeMistakes
} from '../grammarMistakes';
import { saveProgress } from '../../services/api';

vi.mock('../../services/api', () => ({ saveProgress: vi.fn() }));

describe('grammarMistakes', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });
  afterEach(() => vi.restoreAllMocks());

  describe('loadLocalMistakes', () => {
    it('returns an empty list when nothing is stored', () => {
      expect(loadLocalMistakes()).toEqual([]);
    });

    it('returns the stored bank', () => {
      localStorage.setItem(LOCAL_STORAGE_MISTAKES_KEY, JSON.stringify([{ id: 'a' }]));
      expect(loadLocalMistakes()).toEqual([{ id: 'a' }]);
    });

    it('returns an empty list and logs when the stored value is not valid JSON', () => {
      const err = vi.spyOn(console, 'error').mockImplementation(() => {});
      localStorage.setItem(LOCAL_STORAGE_MISTAKES_KEY, '{oops');
      expect(loadLocalMistakes()).toEqual([]);
      expect(err).toHaveBeenCalled();
    });
  });

  describe('getDueMistakes', () => {
    it('returns an empty list for a missing or empty bank', () => {
      expect(getDueMistakes(null)).toEqual([]);
      expect(getDueMistakes([])).toEqual([]);
    });

    it('keeps unscheduled and due mistakes and drops entries without an id or not yet due', () => {
      const future = new Date(Date.now() + 86400000).toISOString();
      const past = '2020-01-01T00:00:00.000Z';
      localStorage.setItem('finnishLearnerReviewSchedule', JSON.stringify({
        'grammar:due': { box: 1, dueAt: past, lastReviewedAt: past, lapses: 0 },
        'grammar:later': { box: 2, dueAt: future, lastReviewedAt: past, lapses: 0 }
      }));
      const bank = [{ id: 'new' }, { id: 'due' }, { id: 'later' }, { question: 'no id' }, null];
      expect(getDueMistakes(bank).map((m) => m.id)).toEqual(['new', 'due']);
    });
  });

  describe('saveProgressSafe', () => {
    it('forwards the payload to saveProgress', () => {
      saveProgress.mockResolvedValue({});
      saveProgressSafe({ studyStats: 1 });
      expect(saveProgress).toHaveBeenCalledWith({ studyStats: 1 });
    });

    it('swallows an async failure with a warning', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      saveProgress.mockRejectedValue(new Error('offline'));
      saveProgressSafe({});
      await Promise.resolve();
      await Promise.resolve();
      expect(warn).toHaveBeenCalledWith('[INFO] Failed to save progress to server:', 'offline');
    });

    it('swallows a synchronous throw with a warning', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      saveProgress.mockImplementation(() => { throw new Error('sync'); });
      expect(() => saveProgressSafe({})).not.toThrow();
      expect(warn).toHaveBeenCalledWith('[INFO] Failed to save progress to server:', 'sync');
    });

    it('does nothing when saveProgress returns a non-promise', () => {
      saveProgress.mockReturnValue(undefined);
      expect(() => saveProgressSafe({})).not.toThrow();
    });
  });

  describe('mergeMistakes', () => {
    it('merges by id, falls back to question, lets local win and skips entries with neither', () => {
      const server = [{ id: 'a', v: 'server' }, { question: 'q1', v: 'server' }, { v: 'junk' }, null];
      const local = [{ id: 'a', v: 'local' }, { id: 'b', v: 'local' }];
      const merged = mergeMistakes(server, local);
      expect(merged).toEqual([
        { id: 'a', v: 'local' },
        { question: 'q1', v: 'server' },
        { id: 'b', v: 'local' }
      ]);
    });
  });
});
