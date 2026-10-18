import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useProgressStore, migrateProgressKeys } from '../useProgressStore';
import * as api from '../../services/api';

vi.mock('../../services/api', () => ({
  fetchProgress: vi.fn(),
  saveProgress: vi.fn()
}));

describe('migrateProgressKeys', () => {
  it('converts lesson title keys to lesson.id', () => {
    const input = {
      'Asiointi ja Matkustaminen': 3,
      'Ruoka ja Juoma': 2
    };
    expect(migrateProgressKeys(input)).toEqual({
      l1: 3,
      l1b: 2
    });
  });

  it('takes the higher level when both title key and lesson.id key exist', () => {
    expect(
      migrateProgressKeys({
        'Asiointi ja Matkustaminen': 4,
        l1: 2
      })
    ).toEqual({ l1: 4 });

    expect(
      migrateProgressKeys({
        l1: 3,
        'Asiointi ja Matkustaminen': 1
      })
    ).toEqual({ l1: 3 });
  });

  it('preserves unknown keys as-is', () => {
    const input = {
      l2: 2,
      'Unknown Custom Key': 3
    };
    expect(migrateProgressKeys(input)).toEqual({
      l2: 2,
      'Unknown Custom Key': 3
    });
  });

  it('returns an empty object for null or non-object inputs', () => {
    expect(migrateProgressKeys(null)).toEqual({});
    expect(migrateProgressKeys(undefined)).toEqual({});
  });
});

describe('useProgressStore', () => {
  it('merges word books using the oldest entry and preserves word review schedules', async () => {
    const older = { id: 'kissa', word: 'kissa', translation: 'cat', addedAt: '2026-10-01T00:00:00Z' };
    localStorage.setItem('finnishLearnerWordBook', JSON.stringify([older, { word: 'koira' }]));
    const entry = { box: 2, dueAt: '2026-10-20T00:00:00Z', lastReviewedAt: '2026-10-17T00:00:00Z', lapses: 0 };
    api.fetchProgress.mockResolvedValue({ data: { success: true, data: {
      wordBook: [{ ...older, translation: 'new cat', addedAt: '2026-10-02T00:00:00Z' }, { word: 'talo' }],
      reviewSchedule: { 'word:kissa': entry }
    } } });
    api.saveProgress.mockResolvedValue({});
    await useProgressStore.getState().syncWithServer();
    const words = JSON.parse(localStorage.getItem('finnishLearnerWordBook'));
    expect(words).toHaveLength(3);
    expect(words.find(w => w.id === 'kissa')).toMatchObject(older);
    expect(api.saveProgress).toHaveBeenCalledWith(expect.objectContaining({ wordBook: words, reviewSchedule: { 'word:kissa': entry } }));
  });

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    useProgressStore.setState({ progress: {} });
  });

  it('updates level progress locally and syncs to server', async () => {
    api.saveProgress.mockResolvedValue({ data: { success: true } });

    await useProgressStore.getState().updateLevelProgress('l1b', 2);

    expect(useProgressStore.getState().progress['l1b']).toBe(2);
    expect(JSON.parse(localStorage.getItem('finnishLearnerProgress'))['l1b']).toBe(2);
    expect(api.saveProgress).toHaveBeenCalledWith(expect.objectContaining({
      learningPath: expect.objectContaining({ l1b: 2 })
    }));
  });

  it('syncs with server and migrates legacy lesson title keys on syncWithServer call', async () => {
    localStorage.setItem('finnishLearnerProgress', JSON.stringify({ 'Ruoka ja Juoma': 1 }));
    api.fetchProgress.mockResolvedValue({
      data: {
        success: true,
        data: {
          learningPath: { 'Ruoka ja Juoma': 3, 'Perhe ja Ystävät': 2 },
          passagesProgress: { 'p1': true }
        }
      }
    });
    api.saveProgress.mockResolvedValue({ data: { success: true } });

    await useProgressStore.getState().syncWithServer();

    // Merged highest level under migrated lessonId keys
    expect(useProgressStore.getState().progress['l1b']).toBe(3);
    expect(useProgressStore.getState().progress['l1c']).toBe(2);
    expect(api.saveProgress).toHaveBeenCalledWith(expect.objectContaining({
      learningPath: { l1b: 3, l1c: 2 }
    }));
    // Preserved passages in localStorage
    expect(JSON.parse(localStorage.getItem('finnishLearnerPassagesProgress'))['p1']).toBe(true);
  });

  it('handles server network failure gracefully during sync', async () => {
    localStorage.setItem('finnishLearnerProgress', JSON.stringify({ 'Ruoka ja Juoma': 2 }));
    api.fetchProgress.mockRejectedValue(new Error('Network Error'));

    // Should not throw
    await expect(useProgressStore.getState().syncWithServer()).resolves.not.toThrow();
    // Local progress remains intact and migrated to lessonId
    expect(useProgressStore.getState().progress['l1b']).toBe(2);
  });

  it('merges server and local sentenceMistakes on syncWithServer and saves back to server', async () => {
    localStorage.setItem(
      'finnishLearnerSentenceMistakes',
      JSON.stringify([
        { sentenceId: 's1', count: 2, lastMistakeAt: '2026-05-01T10:00:00.000Z' },
        { sentenceId: 's2', count: 1, lastMistakeAt: '2026-05-03T10:00:00.000Z' }
      ])
    );
    api.fetchProgress.mockResolvedValue({
      data: {
        success: true,
        data: {
          learningPath: {},
          sentenceMistakes: [
            { sentenceId: 's1', count: 1, lastMistakeAt: '2026-05-02T10:00:00.000Z' },
            { sentenceId: 's3', count: 4, lastMistakeAt: '2026-05-04T10:00:00.000Z' }
          ]
        }
      }
    });
    api.saveProgress.mockResolvedValue({ data: { success: true } });

    await useProgressStore.getState().syncWithServer();

    const expectedMerged = [
      { sentenceId: 's1', count: 2, lastMistakeAt: '2026-05-02T10:00:00.000Z' },
      { sentenceId: 's3', count: 4, lastMistakeAt: '2026-05-04T10:00:00.000Z' },
      { sentenceId: 's2', count: 1, lastMistakeAt: '2026-05-03T10:00:00.000Z' }
    ];

    expect(JSON.parse(localStorage.getItem('finnishLearnerSentenceMistakes'))).toEqual(expectedMerged);
    expect(api.saveProgress).toHaveBeenCalledWith(expect.objectContaining({
      sentenceMistakes: expectedMerged
    }));
  });

  it('migrates legacy review items and merges reviewSchedule and studyStats on syncWithServer', async () => {
    localStorage.setItem(
      'finnishLearnerSentenceMistakes',
      JSON.stringify([
        { sentenceId: 's_legacy', count: 1, lastMistakeAt: '2026-05-01T00:00:00.000Z' }
      ])
    );
    localStorage.setItem(
      'finnishLearnerReviewSchedule',
      JSON.stringify({
        'sentence:s1': {
          box: 2,
          dueAt: '2026-05-10T00:00:00.000Z',
          lastReviewedAt: '2026-05-07T00:00:00.000Z',
          lapses: 1
        }
      })
    );
    localStorage.setItem(
      'finnishLearnerStudyStats',
      JSON.stringify({
        days: { '2026-05-07': 5 },
        dailyGoal: 10
      })
    );

    api.fetchProgress.mockResolvedValue({
      data: {
        success: true,
        data: {
          learningPath: {},
          reviewSchedule: {
            'sentence:s1': {
              box: 1,
              dueAt: '2026-05-05T00:00:00.000Z',
              lastReviewedAt: '2026-05-05T00:00:00.000Z',
              lapses: 1
            },
            'grammar:g1': {
              box: 3,
              dueAt: '2026-05-12T00:00:00.000Z',
              lastReviewedAt: '2026-05-05T00:00:00.000Z',
              lapses: 1
            }
          },
          studyStats: {
            days: { '2026-05-06': 12, '2026-05-07': 3 },
            dailyGoal: 30
          }
        }
      }
    });
    api.saveProgress.mockResolvedValue({ data: { success: true } });

    await useProgressStore.getState().syncWithServer();

    const storedSchedule = JSON.parse(localStorage.getItem('finnishLearnerReviewSchedule'));
    expect(storedSchedule['sentence:s1'].box).toBe(2);
    expect(storedSchedule['grammar:g1'].box).toBe(3);
    expect(storedSchedule['sentence:s_legacy'].box).toBe(1);

    const storedStats = JSON.parse(localStorage.getItem('finnishLearnerStudyStats'));
    expect(storedStats).toEqual({
      days: { '2026-05-06': 12, '2026-05-07': 5 },
      dailyGoal: 10
    });

    expect(api.saveProgress).toHaveBeenCalledWith(
      expect.objectContaining({
        reviewSchedule: storedSchedule,
        studyStats: storedStats
      })
    );
  });
});

