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
});

