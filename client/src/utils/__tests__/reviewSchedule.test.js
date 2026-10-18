import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  REVIEW_SCHEDULE_STORAGE_KEY,
  REVIEW_INTERVAL_DAYS,
  ensureReviewEntry,
  removeReviewEntry,
  getReviewSchedule,
  recordReviewResult,
  getDueKeys,
  getDueCount,
  getUpcomingCount,
  mergeReviewSchedules,
  migrateLegacyReviewItems
} from '../reviewSchedule';

describe('reviewSchedule utility', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('adds word entries once, includes them in due and upcoming counts, and merges them', () => {
    const now = new Date('2026-10-18T12:00:00Z');
    const initial = ensureReviewEntry('word:kissa', now);
    expect(initial['word:kissa'].lapses).toBe(0);
    expect(ensureReviewEntry('word:kissa', new Date('2026-10-19T12:00:00Z'))).toEqual(initial);
    expect(ensureReviewEntry('word: ', now)).toEqual(initial);
    expect(getDueKeys('word', now)).toEqual(['kissa']);
    expect(getDueCount(now)).toEqual({ total: 1, word: 1, sentence: 0, grammar: 0 });
    const advanced = recordReviewResult('word:kissa', true, now).schedule;
    expect(getDueKeys('word', now)).toEqual([]);
    expect(getUpcomingCount(7, now)).toBe(1);
    expect(mergeReviewSchedules({}, advanced)).toEqual(advanced);
    expect(removeReviewEntry('word:kissa')).toEqual({});
  });

  it('exports expected interval constants', () => {
    expect(REVIEW_INTERVAL_DAYS).toEqual([0, 1, 3, 7, 14, 30]);
    expect(REVIEW_SCHEDULE_STORAGE_KEY).toBe('finnishLearnerReviewSchedule');
  });

  describe('recordReviewResult', () => {
    it('creates box 1 entry with dueAt = now and lapses = 1 on first incorrect answer', () => {
      const now = new Date('2026-05-01T10:00:00.000Z');
      const res = recordReviewResult('sentence:s1', false, now);

      expect(res.status).toBe('scheduled');
      expect(res.schedule['sentence:s1']).toEqual({
        box: 1,
        dueAt: '2026-05-01T10:00:00.000Z',
        lastReviewedAt: '2026-05-01T10:00:00.000Z',
        lapses: 1
      });
      expect(getReviewSchedule()).toEqual(res.schedule);
    });

    it('leaves schedule unchanged when answering correctly for an unscheduled key', () => {
      const now = new Date('2026-05-01T10:00:00.000Z');
      const res = recordReviewResult('sentence:s1', true, now);

      expect(res.status).toBe('unchanged');
      expect(res.schedule).toEqual({});
      expect(getReviewSchedule()).toEqual({});
    });

    it('advances boxes 1 -> 2 -> 3 -> 4 -> 5 with Leitner intervals and graduates after box 5', () => {
      const t0 = new Date('2026-05-01T00:00:00.000Z');
      recordReviewResult('sentence:s1', false, t0);

      // Box 1 -> Box 2 (+3 days)
      const t1 = new Date('2026-05-01T12:00:00.000Z');
      let res = recordReviewResult('sentence:s1', true, t1);
      expect(res.status).toBe('scheduled');
      expect(res.schedule['sentence:s1'].box).toBe(2);
      expect(res.schedule['sentence:s1'].dueAt).toBe(
        new Date(t1.getTime() + 3 * 86400000).toISOString()
      );
      expect(res.schedule['sentence:s1'].lapses).toBe(1);

      // Box 2 -> Box 3 (+7 days)
      const t2 = new Date('2026-05-05T00:00:00.000Z');
      res = recordReviewResult('sentence:s1', true, t2);
      expect(res.schedule['sentence:s1'].box).toBe(3);
      expect(res.schedule['sentence:s1'].dueAt).toBe(
        new Date(t2.getTime() + 7 * 86400000).toISOString()
      );

      // Box 3 -> Box 4 (+14 days)
      const t3 = new Date('2026-05-13T00:00:00.000Z');
      res = recordReviewResult('sentence:s1', true, t3);
      expect(res.schedule['sentence:s1'].box).toBe(4);
      expect(res.schedule['sentence:s1'].dueAt).toBe(
        new Date(t3.getTime() + 14 * 86400000).toISOString()
      );

      // Box 4 -> Box 5 (+30 days)
      const t4 = new Date('2026-05-28T00:00:00.000Z');
      res = recordReviewResult('sentence:s1', true, t4);
      expect(res.schedule['sentence:s1'].box).toBe(5);
      expect(res.schedule['sentence:s1'].dueAt).toBe(
        new Date(t4.getTime() + 30 * 86400000).toISOString()
      );

      // Box 5 -> graduated (deleted)
      const t5 = new Date('2026-06-28T00:00:00.000Z');
      res = recordReviewResult('sentence:s1', true, t5);
      expect(res.status).toBe('graduated');
      expect(res.schedule['sentence:s1']).toBeUndefined();
      expect(getReviewSchedule()['sentence:s1']).toBeUndefined();
    });

    it('resets box to 1, increments lapses, and sets dueAt = now on incorrect answer for existing item', () => {
      const t0 = new Date('2026-05-01T00:00:00.000Z');
      recordReviewResult('grammar:q1', false, t0);
      recordReviewResult('grammar:q1', true, new Date('2026-05-02T00:00:00.000Z')); // box 2
      recordReviewResult('grammar:q1', true, new Date('2026-05-06T00:00:00.000Z')); // box 3

      const failTime = new Date('2026-05-14T08:00:00.000Z');
      const res = recordReviewResult('grammar:q1', false, failTime);

      expect(res.status).toBe('scheduled');
      expect(res.schedule['grammar:q1']).toEqual({
        box: 1,
        dueAt: failTime.toISOString(),
        lastReviewedAt: failTime.toISOString(),
        lapses: 2
      });
    });
  });

  describe('getDueKeys, getDueCount, and getUpcomingCount', () => {
    it('returns due keys sorted by oldest dueAt first with prefix removed', () => {
      const now = new Date('2026-05-10T12:00:00.000Z');
      const schedule = {
        'sentence:s_newer': {
          box: 1,
          dueAt: '2026-05-10T10:00:00.000Z',
          lastReviewedAt: '2026-05-09T10:00:00.000Z',
          lapses: 1
        },
        'sentence:s_older': {
          box: 2,
          dueAt: '2026-05-08T10:00:00.000Z',
          lastReviewedAt: '2026-05-05T10:00:00.000Z',
          lapses: 1
        },
        'sentence:s_exact_now': {
          box: 1,
          dueAt: '2026-05-10T12:00:00.000Z',
          lastReviewedAt: '2026-05-10T12:00:00.000Z',
          lapses: 1
        },
        'sentence:s_future_1d': {
          box: 1,
          dueAt: '2026-05-11T06:00:00.000Z',
          lastReviewedAt: '2026-05-10T06:00:00.000Z',
          lapses: 1
        },
        'grammar:g_due': {
          box: 1,
          dueAt: '2026-05-09T00:00:00.000Z',
          lastReviewedAt: '2026-05-09T00:00:00.000Z',
          lapses: 1
        },
        'grammar:g_future_5d': {
          box: 3,
          dueAt: '2026-05-15T00:00:00.000Z',
          lastReviewedAt: '2026-05-08T00:00:00.000Z',
          lapses: 1
        },
        'grammar:g_future_14d': {
          box: 4,
          dueAt: '2026-05-24T00:00:00.000Z',
          lastReviewedAt: '2026-05-10T00:00:00.000Z',
          lapses: 1
        }
      };
      localStorage.setItem(REVIEW_SCHEDULE_STORAGE_KEY, JSON.stringify(schedule));

      expect(getDueKeys('sentence', now)).toEqual(['s_older', 's_newer', 's_exact_now']);
      expect(getDueKeys('grammar', now)).toEqual(['g_due']);
      expect(getDueCount(now)).toEqual({ total: 4, sentence: 3, grammar: 1, word: 0 });

      expect(getUpcomingCount(1, now)).toBe(1); // s_future_1d
      expect(getUpcomingCount(7, now)).toBe(2); // s_future_1d + g_future_5d
    });
  });

  describe('mergeReviewSchedules', () => {
    it('picks the entry with newer lastReviewedAt per key and treats missing lastReviewedAt as older', () => {
      const a = {
        'sentence:s1': {
          box: 3,
          dueAt: '2026-05-10T00:00:00.000Z',
          lastReviewedAt: '2026-05-03T00:00:00.000Z',
          lapses: 1
        },
        'sentence:s2': {
          box: 1,
          dueAt: '2026-05-01T00:00:00.000Z',
          lapses: 1
        },
        'grammar:g1': {
          box: 2,
          dueAt: '2026-05-08T00:00:00.000Z',
          lastReviewedAt: '2026-05-05T00:00:00.000Z',
          lapses: 1
        }
      };
      const b = {
        'sentence:s1': {
          box: 1,
          dueAt: '2026-05-04T00:00:00.000Z',
          lastReviewedAt: '2026-05-04T00:00:00.000Z',
          lapses: 2
        },
        'sentence:s2': {
          box: 2,
          dueAt: '2026-05-05T00:00:00.000Z',
          lastReviewedAt: '2026-05-02T00:00:00.000Z',
          lapses: 1
        },
        'grammar:g1': {
          box: 1,
          dueAt: '2026-05-02T00:00:00.000Z',
          lastReviewedAt: '2026-05-01T00:00:00.000Z',
          lapses: 1
        },
        'grammar:g2': {
          box: 1,
          dueAt: '2026-05-06T00:00:00.000Z',
          lastReviewedAt: '2026-05-06T00:00:00.000Z',
          lapses: 1
        }
      };

      const merged = mergeReviewSchedules(a, b);
      expect(merged['sentence:s1'].box).toBe(1);
      expect(merged['sentence:s1'].lapses).toBe(2);
      expect(merged['sentence:s2'].box).toBe(2);
      expect(merged['grammar:g1'].box).toBe(2);
      expect(merged['grammar:g2'].box).toBe(1);
    });
  });

  describe('migrateLegacyReviewItems', () => {
    it('adds missing legacy sentence and grammar mistakes at box 1 with dueAt = now while preserving existing schedule and legacy data', () => {
      const now = new Date('2026-05-10T09:00:00.000Z');
      const existingSchedule = {
        'sentence:s1': {
          box: 3,
          dueAt: '2026-05-15T00:00:00.000Z',
          lastReviewedAt: '2026-05-08T00:00:00.000Z',
          lapses: 1
        }
      };
      localStorage.setItem(REVIEW_SCHEDULE_STORAGE_KEY, JSON.stringify(existingSchedule));
      localStorage.setItem(
        'finnishLearnerSentenceMistakes',
        JSON.stringify([
          { sentenceId: 's1', count: 1, lastMistakeAt: '2026-05-01T00:00:00.000Z' },
          { sentenceId: 's2', count: 2, lastMistakeAt: '2026-05-02T00:00:00.000Z' }
        ])
      );
      localStorage.setItem(
        'finnish_grammar_mistakes',
        JSON.stringify([
          { id: 'vokaaliharmonia_q1', question: 'Q1', answer: 'A1' }
        ])
      );

      const migrated = migrateLegacyReviewItems(now);

      // Existing s1 stays box 3
      expect(migrated['sentence:s1'].box).toBe(3);
      // Missing s2 and vokaaliharmonia_q1 added at box 1 with dueAt = now
      expect(migrated['sentence:s2'].box).toBe(1);
      expect(migrated['sentence:s2'].dueAt).toBe(now.toISOString());
      expect(migrated['grammar:vokaaliharmonia_q1'].box).toBe(1);
      expect(migrated['grammar:vokaaliharmonia_q1'].dueAt).toBe(now.toISOString());

      // Legacy keys are not deleted
      expect(localStorage.getItem('finnishLearnerSentenceMistakes')).not.toBeNull();
      expect(localStorage.getItem('finnish_grammar_mistakes')).not.toBeNull();
    });

    it('runs only once, so a graduated legacy sentence is not added back', () => {
      const now = new Date('2026-05-10T09:00:00.000Z');
      localStorage.setItem(
        'finnishLearnerSentenceMistakes',
        JSON.stringify([{ sentenceId: 's2', count: 1, lastMistakeAt: '2026-05-02T00:00:00.000Z' }])
      );

      migrateLegacyReviewItems(now);
      // Answer correctly through every box until it graduates
      let result;
      for (let i = 0; i < 5; i += 1) {
        result = recordReviewResult('sentence:s2', true, now);
      }
      expect(result.status).toBe('graduated');

      const again = migrateLegacyReviewItems(now);
      expect(again['sentence:s2']).toBeUndefined();
    });
  });
});
