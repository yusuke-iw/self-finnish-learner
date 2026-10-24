import { describe, it, expect } from 'vitest';
import {
  scenes,
  games,
  findGameById,
  getGamesByScene,
  getRecommendedGames,
  getNextRecommended
} from '../scenes/index';

describe('Scene Index Module', () => {
  it('exports scenes ordered by order ascending', () => {
    expect(Array.isArray(scenes)).toBe(true);
    for (let i = 0; i < scenes.length - 1; i++) {
      expect(scenes[i].order).toBeLessThanOrEqual(scenes[i + 1].order);
    }
  });

  it('exports games list containing implemented games', () => {
    expect(Array.isArray(games)).toBe(true);
    expect(games.length).toBeGreaterThanOrEqual(1);
    expect(games.some((g) => g.id === 'vaatteet')).toBe(true);
  });

  it('findGameById returns the game or null for unknown ID', () => {
    const game = findGameById('vaatteet');
    expect(game).toBeDefined();
    expect(game.id).toBe('vaatteet');

    expect(findGameById('non-existent')).toBeNull();
    expect(findGameById('')).toBeNull();
    expect(findGameById(null)).toBeNull();
  });

  it('getGamesByScene returns games in gameIds order', () => {
    const kotiGames = getGamesByScene('koti');
    expect(kotiGames.map((g) => g.id)).toEqual(['vaatteet']);

    const lahioGames = getGamesByScene('lahio');
    expect(lahioGames).toEqual([]);

    const unknownGames = getGamesByScene('unknown');
    expect(unknownGames).toEqual([]);
  });

  it('getRecommendedGames returns games with sequential numbers and scenes', () => {
    const recs = getRecommendedGames();
    expect(Array.isArray(recs)).toBe(true);
    expect(recs.length).toBe(games.length);

    recs.forEach((item, idx) => {
      expect(item.number).toBe(idx + 1);
      expect(item.game).toBeDefined();
      expect(item.scene).toBeDefined();
      expect(item.scene.gameIds).toContain(item.game.id);
    });
  });

  it('getNextRecommended returns the next game or null if last/unknown', () => {
    const recs = getRecommendedGames();
    if (recs.length === 1) {
      // With only 1 game, next recommended is null
      expect(getNextRecommended('vaatteet')).toBeNull();
    } else {
      const next = getNextRecommended(recs[0].game.id);
      expect(next).toEqual(recs[1]);
    }

    expect(getNextRecommended('non-existent')).toBeNull();
    expect(getNextRecommended(null)).toBeNull();
  });
});
