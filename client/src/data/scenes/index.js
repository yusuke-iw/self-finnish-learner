import rawScenes from './scenes.json';
import vaatteet from './vaatteet.json';
import jatekatos from './jatekatos.json';
import upcoming from './upcoming.json';

export const scenes = [...rawScenes].sort((a, b) => a.order - b.order);

export const games = [vaatteet, jatekatos];

const gamesMap = new Map(games.map((g) => [g.id, g]));

export function findGameById(id) {
  if (!id) return null;
  return gamesMap.get(id) || null;
}

export function getGamesByScene(sceneId) {
  const scene = scenes.find((s) => s.id === sceneId);
  if (!scene || !Array.isArray(scene.gameIds)) return [];
  return scene.gameIds
    .map((id) => findGameById(id))
    .filter((g) => g !== null);
}

export function getRecommendedGames() {
  const list = [];
  let number = 1;

  for (const scene of scenes) {
    if (!Array.isArray(scene.gameIds)) continue;
    for (const gameId of scene.gameIds) {
      const game = findGameById(gameId);
      if (game) {
        list.push({ game, number: number++, scene });
      }
    }
  }

  return list;
}

export function getNextRecommended(gameId) {
  if (!gameId) return null;
  const list = getRecommendedGames();
  const index = list.findIndex((item) => item.game.id === gameId);
  if (index === -1 || index === list.length - 1) {
    return null;
  }
  return list[index + 1];
}

// Games announced but not built yet. Once a game with the same id exists in `games`,
// the real card replaces the placeholder.
export function getUpcomingGames(sceneId) {
  return upcoming.filter((u) => u.sceneId === sceneId && !gamesMap.has(u.id));
}
