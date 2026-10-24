import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getSceneProgress,
  markGamePlayed,
  hasPlayed,
  SCENE_PROGRESS_STORAGE_KEY
} from '../sceneProgress';

describe('sceneProgress utility', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('returns empty progress when storage is empty', () => {
    const progress = getSceneProgress();
    expect(progress).toEqual({
      version: 1,
      played: {}
    });
  });

  it('discards corrupted JSON or invalid structure and returns empty progress', () => {
    localStorage.setItem(SCENE_PROGRESS_STORAGE_KEY, '{ broken json');
    expect(getSceneProgress()).toEqual({ version: 1, played: {} });

    localStorage.setItem(SCENE_PROGRESS_STORAGE_KEY, JSON.stringify({ version: 2, played: {} }));
    expect(getSceneProgress()).toEqual({ version: 1, played: {} });

    localStorage.setItem(SCENE_PROGRESS_STORAGE_KEY, JSON.stringify({ version: 1, played: 'not an object' }));
    expect(getSceneProgress()).toEqual({ version: 1, played: {} });

    localStorage.setItem(SCENE_PROGRESS_STORAGE_KEY, JSON.stringify({
      version: 1,
      played: {
        game1: { firstPlayedAt: 12345 } // non-string timestamps
      }
    }));
    expect(getSceneProgress()).toEqual({ version: 1, played: {} });
  });

  it('markGamePlayed records firstPlayedAt and lastPlayedAt on first completion', () => {
    const fixedDate = new Date('2026-10-24T12:00:00.000Z');
    const updated = markGamePlayed('vaatteet', fixedDate);

    expect(updated).toEqual({
      version: 1,
      played: {
        vaatteet: {
          firstPlayedAt: '2026-10-24T12:00:00.000Z',
          lastPlayedAt: '2026-10-24T12:00:00.000Z'
        }
      }
    });

    expect(hasPlayed('vaatteet')).toBe(true);
    expect(hasPlayed('other')).toBe(false);
  });

  it('markGamePlayed retains firstPlayedAt and updates lastPlayedAt on subsequent plays', () => {
    const firstDate = new Date('2026-10-24T10:00:00.000Z');
    markGamePlayed('vaatteet', firstDate);

    const secondDate = new Date('2026-10-24T15:30:00.000Z');
    const updated = markGamePlayed('vaatteet', secondDate);

    expect(updated.played.vaatteet.firstPlayedAt).toBe('2026-10-24T10:00:00.000Z');
    expect(updated.played.vaatteet.lastPlayedAt).toBe('2026-10-24T15:30:00.000Z');
  });

  it('markGamePlayed ignores empty or invalid gameId without throwing', () => {
    const initial = getSceneProgress();
    expect(markGamePlayed('')).toEqual(initial);
    expect(markGamePlayed(null)).toEqual(initial);
  });

  it('handles storage errors without throwing', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage quota exceeded');
    });

    const fixedDate = new Date('2026-10-24T12:00:00.000Z');
    let res;
    expect(() => {
      res = markGamePlayed('vaatteet', fixedDate);
    }).not.toThrow();

    expect(res.played.vaatteet.firstPlayedAt).toBe('2026-10-24T12:00:00.000Z');
  });

  it('hasPlayed accepts custom progress object', () => {
    const custom = {
      version: 1,
      played: {
        gameA: { firstPlayedAt: '2026-10-24T10:00:00.000Z', lastPlayedAt: '2026-10-24T10:00:00.000Z' }
      }
    };
    expect(hasPlayed('gameA', custom)).toBe(true);
    expect(hasPlayed('gameB', custom)).toBe(false);
  });
});
