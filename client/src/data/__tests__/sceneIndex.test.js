import { describe, it, expect } from 'vitest';
import {
  scenes,
  games,
  findGameById,
  getGamesByScene,
  getRecommendedGames,
  getNextRecommended,
  getUpcomingGames
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
    expect(lahioGames.map((g) => g.id)).toEqual(['jatekatos', 'rappukaytava']);

    expect(getGamesByScene('kaupunki').map((g) => g.id)).toEqual(['ajanvaraus', 'pankkiautomaatti', 'virastot']);

    const unknownGames = getGamesByScene('unknown');
    expect(unknownGames).toEqual([]);
  });

  it('getRecommendedGames returns games with sequential numbers and scenes in order', () => {
    const recs = getRecommendedGames();
    expect(Array.isArray(recs)).toBe(true);
    expect(recs.length).toBe(6);
    expect(recs.map((r) => r.game.id)).toEqual([
      'vaatteet',
      'jatekatos',
      'rappukaytava',
      'ajanvaraus',
      'pankkiautomaatti',
      'virastot'
    ]);

    recs.forEach((item, idx) => {
      expect(item.number).toBe(idx + 1);
      expect(item.game).toBeDefined();
      expect(item.scene).toBeDefined();
      expect(item.scene.gameIds).toContain(item.game.id);
    });
  });

  it('getUpcomingGames lists only games that are not built yet', () => {
    expect(getUpcomingGames('lahio')).toEqual([]);
    expect(getUpcomingGames('koti')).toEqual([]);
    expect(getUpcomingGames('kaupunki')).toEqual([]);
  });

  it('getNextRecommended returns the next game or null if last/unknown', () => {
    expect(getNextRecommended('vaatteet').game.id).toBe('jatekatos');
    const nextAfterJatekatos = getNextRecommended('jatekatos');
    expect(nextAfterJatekatos.game.id).toBe('rappukaytava');
    expect(nextAfterJatekatos.number).toBe(3);
    expect(getNextRecommended('rappukaytava').game.id).toBe('ajanvaraus');
    const nextAfterAjanvaraus = getNextRecommended('ajanvaraus');
    expect(nextAfterAjanvaraus.game.id).toBe('pankkiautomaatti');
    expect(nextAfterAjanvaraus.number).toBe(5);
    const nextAfterPankkiautomaatti = getNextRecommended('pankkiautomaatti');
    expect(nextAfterPankkiautomaatti.game.id).toBe('virastot');
    expect(nextAfterPankkiautomaatti.number).toBe(6);
    expect(getNextRecommended('virastot')).toBeNull();
    expect(getNextRecommended('non-existent')).toBeNull();
    expect(getNextRecommended(null)).toBeNull();
  });
});
