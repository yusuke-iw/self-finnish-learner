export const SCENE_PROGRESS_STORAGE_KEY = 'finnishLearnerSceneProgress';

function normalizePlayed(played) {
  if (!played || typeof played !== 'object' || Array.isArray(played)) {
    return {};
  }
  const normalized = {};
  for (const [key, val] of Object.entries(played)) {
    if (
      val &&
      typeof val === 'object' &&
      !Array.isArray(val) &&
      typeof val.firstPlayedAt === 'string' &&
      typeof val.lastPlayedAt === 'string'
    ) {
      normalized[key] = {
        firstPlayedAt: val.firstPlayedAt,
        lastPlayedAt: val.lastPlayedAt
      };
    }
  }
  return normalized;
}

export function getSceneProgress() {
  try {
    const saved = localStorage.getItem(SCENE_PROGRESS_STORAGE_KEY);
    if (!saved) {
      return { version: 1, played: {} };
    }
    const parsed = JSON.parse(saved);
    if (!parsed || typeof parsed !== 'object' || parsed.version !== 1) {
      return { version: 1, played: {} };
    }
    return {
      version: 1,
      played: normalizePlayed(parsed.played)
    };
  } catch {
    return { version: 1, played: {} };
  }
}

export function markGamePlayed(gameId, now = new Date()) {
  const current = getSceneProgress();
  if (!gameId || typeof gameId !== 'string') {
    return current;
  }

  const d = now instanceof Date && !Number.isNaN(now.getTime()) ? now : new Date(now);
  const isoTime = Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();

  const existingEntry = current.played[gameId];
  const firstPlayedAt = existingEntry?.firstPlayedAt || isoTime;
  const lastPlayedAt = isoTime;

  const updated = {
    version: 1,
    played: {
      ...current.played,
      [gameId]: {
        firstPlayedAt,
        lastPlayedAt
      }
    }
  };

  try {
    localStorage.setItem(SCENE_PROGRESS_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore storage errors
  }

  return updated;
}

export function hasPlayed(gameId, progress = getSceneProgress()) {
  if (!gameId || !progress || !progress.played) {
    return false;
  }
  return Boolean(progress.played[gameId]);
}
