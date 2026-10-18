import { getSentenceMistakes } from './sentenceMistakes';

export const REVIEW_SCHEDULE_STORAGE_KEY = 'finnishLearnerReviewSchedule';
export const REVIEW_INTERVAL_DAYS = [0, 1, 3, 7, 14, 30];

const GRAMMAR_MISTAKES_STORAGE_KEY = 'finnish_grammar_mistakes';
const REVIEW_MIGRATED_STORAGE_KEY = 'finnishLearnerReviewMigrated';
const DAY_MS = 24 * 60 * 60 * 1000;

function toDate(value = new Date()) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function isValidKey(key) {
  if (typeof key !== 'string') return false;
  if (key.startsWith('sentence:')) {
    const id = key.slice('sentence:'.length).trim();
    return id.length > 0 && !id.startsWith('matching-warmup-');
  }
  if (key.startsWith('grammar:') || key.startsWith('word:')) {
    const id = key.slice(key.indexOf(':') + 1).trim();
    return id.length > 0;
  }
  return false;
}

function normalizeEntry(entry) {
  const rawBox = typeof entry?.box === 'number' ? Math.floor(entry.box) : 1;
  const box = Math.min(5, Math.max(1, rawBox));
  const dueAt = typeof entry?.dueAt === 'string' ? entry.dueAt : new Date(0).toISOString();
  const lastReviewedAt = typeof entry?.lastReviewedAt === 'string' ? entry.lastReviewedAt : dueAt;
  const lapses = typeof entry?.lapses === 'number' && entry.lapses >= 0 ? Math.floor(entry.lapses) : 1;
  return {
    box,
    dueAt,
    lastReviewedAt,
    lapses
  };
}

export function getReviewSchedule() {
  try {
    const saved = localStorage.getItem(REVIEW_SCHEDULE_STORAGE_KEY);
    if (!saved) return {};
    const parsed = JSON.parse(saved);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }
    const schedule = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (isValidKey(key) && value && typeof value === 'object' && !Array.isArray(value)) {
        schedule[key] = normalizeEntry(value);
      }
    }
    return schedule;
  } catch {
    return {};
  }
}

export function saveReviewSchedule(schedule) {
  const normalized = {};
  if (schedule && typeof schedule === 'object' && !Array.isArray(schedule)) {
    for (const [key, value] of Object.entries(schedule)) {
      if (isValidKey(key) && value && typeof value === 'object' && !Array.isArray(value)) {
        normalized[key] = normalizeEntry(value);
      }
    }
  }
  try {
    localStorage.setItem(REVIEW_SCHEDULE_STORAGE_KEY, JSON.stringify(normalized));
  } catch {
    // ignore storage errors
  }
  return normalized;
}

export function ensureReviewEntry(key, now = new Date()) {
  const schedule = getReviewSchedule();
  if (isValidKey(key) && !schedule[key]) {
    const nowIso = toDate(now).toISOString();
    schedule[key] = { box: 1, dueAt: nowIso, lastReviewedAt: nowIso, lapses: 0 };
    saveReviewSchedule(schedule);
  }
  return schedule;
}

export function removeReviewEntry(key) {
  const schedule = getReviewSchedule();
  delete schedule[key];
  return saveReviewSchedule(schedule);
}

export function recordReviewResult(key, isCorrect, now = new Date()) {
  const schedule = getReviewSchedule();
  if (!isValidKey(key)) {
    return { status: 'unchanged', schedule };
  }

  const nowDate = toDate(now);
  const nowIso = nowDate.toISOString();
  const existing = schedule[key];

  if (!isCorrect) {
    const prevLapses = existing && typeof existing.lapses === 'number' ? existing.lapses : 0;
    const nextSchedule = {
      ...schedule,
      [key]: {
        box: 1,
        dueAt: nowIso,
        lastReviewedAt: nowIso,
        lapses: prevLapses + 1
      }
    };
    saveReviewSchedule(nextSchedule);
    return { status: 'scheduled', schedule: nextSchedule };
  }

  if (!existing) {
    return { status: 'unchanged', schedule };
  }

  const currentBox = typeof existing.box === 'number' ? existing.box : 1;
  const nextBox = currentBox + 1;

  if (nextBox > 5) {
    const nextSchedule = { ...schedule };
    delete nextSchedule[key];
    saveReviewSchedule(nextSchedule);
    return { status: 'graduated', schedule: nextSchedule };
  }

  const intervalDays = REVIEW_INTERVAL_DAYS[nextBox] ?? 1;
  const dueDate = new Date(nowDate.getTime() + intervalDays * DAY_MS);
  const nextSchedule = {
    ...schedule,
    [key]: {
      box: nextBox,
      dueAt: dueDate.toISOString(),
      lastReviewedAt: nowIso,
      lapses: typeof existing.lapses === 'number' ? existing.lapses : 0
    }
  };
  saveReviewSchedule(nextSchedule);
  return { status: 'scheduled', schedule: nextSchedule };
}

export function getDueKeys(kind, now = new Date()) {
  if (kind !== 'sentence' && kind !== 'grammar' && kind !== 'word') {
    return [];
  }
  const prefix = `${kind}:`;
  const nowTime = toDate(now).getTime();
  const schedule = getReviewSchedule();
  const dueItems = [];

  for (const [key, entry] of Object.entries(schedule)) {
    if (!key.startsWith(prefix)) continue;
    const id = key.slice(prefix.length);
    if (!id) continue;
    const dueTime = Date.parse(entry.dueAt);
    if (!Number.isNaN(dueTime) && dueTime <= nowTime) {
      dueItems.push({ id, dueTime });
    }
  }

  dueItems.sort((a, b) => a.dueTime - b.dueTime);
  return dueItems.map((item) => item.id);
}

export function getDueCount(now = new Date()) {
  const sentence = getDueKeys('sentence', now).length;
  const grammar = getDueKeys('grammar', now).length;
  const word = getDueKeys('word', now).length;
  return {
    total: sentence + grammar + word,
    sentence,
    grammar,
    word
  };
}

export function getUpcomingCount(days, now = new Date()) {
  const numDays = Number(days);
  if (!Number.isFinite(numDays) || numDays <= 0) {
    return 0;
  }
  const nowTime = toDate(now).getTime();
  const upperTime = nowTime + numDays * DAY_MS;
  const schedule = getReviewSchedule();
  let count = 0;

  for (const entry of Object.values(schedule)) {
    const dueTime = Date.parse(entry.dueAt);
    if (!Number.isNaN(dueTime) && dueTime > nowTime && dueTime <= upperTime) {
      count += 1;
    }
  }

  return count;
}

export function mergeReviewSchedules(a, b) {
  const objA = a && typeof a === 'object' && !Array.isArray(a) ? a : {};
  const objB = b && typeof b === 'object' && !Array.isArray(b) ? b : {};
  const keys = new Set([...Object.keys(objA), ...Object.keys(objB)]);
  const merged = {};

  for (const key of keys) {
    if (!isValidKey(key)) continue;
    const itemA = objA[key];
    const itemB = objB[key];
    const validA = itemA && typeof itemA === 'object' && !Array.isArray(itemA);
    const validB = itemB && typeof itemB === 'object' && !Array.isArray(itemB);

    if (validA && !validB) {
      merged[key] = normalizeEntry(itemA);
    } else if (!validA && validB) {
      merged[key] = normalizeEntry(itemB);
    } else if (validA && validB) {
      const timeA = typeof itemA.lastReviewedAt === 'string' ? Date.parse(itemA.lastReviewedAt) : NaN;
      const timeB = typeof itemB.lastReviewedAt === 'string' ? Date.parse(itemB.lastReviewedAt) : NaN;
      const scoreA = Number.isNaN(timeA) ? -Infinity : timeA;
      const scoreB = Number.isNaN(timeB) ? -Infinity : timeB;
      merged[key] = normalizeEntry(scoreB >= scoreA ? itemB : itemA);
    }
  }

  return merged;
}

// Runs once per browser. The legacy lists are kept, so running it again would
// re-add items that have since graduated (been removed from the schedule).
export function migrateLegacyReviewItems(now = new Date()) {
  try {
    if (localStorage.getItem(REVIEW_MIGRATED_STORAGE_KEY) === '1') {
      return getReviewSchedule();
    }
  } catch {
    // ignore storage errors
  }

  const nowIso = toDate(now).toISOString();
  const schedule = getReviewSchedule();
  let changed = false;

  const sentenceMistakes = getSentenceMistakes();
  for (const item of sentenceMistakes) {
    if (!item?.sentenceId) continue;
    const key = `sentence:${item.sentenceId}`;
    if (isValidKey(key) && !schedule[key]) {
      schedule[key] = {
        box: 1,
        dueAt: nowIso,
        lastReviewedAt: nowIso,
        lapses: 1
      };
      changed = true;
    }
  }

  try {
    const rawGrammar = localStorage.getItem(GRAMMAR_MISTAKES_STORAGE_KEY);
    if (rawGrammar) {
      const parsedGrammar = JSON.parse(rawGrammar);
      if (Array.isArray(parsedGrammar)) {
        for (const item of parsedGrammar) {
          const id = typeof item?.id === 'string' ? item.id.trim() : '';
          if (!id) continue;
          const key = `grammar:${id}`;
          if (isValidKey(key) && !schedule[key]) {
            schedule[key] = {
              box: 1,
              dueAt: nowIso,
              lastReviewedAt: nowIso,
              lapses: 1
            };
            changed = true;
          }
        }
      }
    }
  } catch {
    // ignore storage errors
  }

  if (changed) {
    saveReviewSchedule(schedule);
  }
  try {
    localStorage.setItem(REVIEW_MIGRATED_STORAGE_KEY, '1');
  } catch {
    // ignore storage errors
  }
  return schedule;
}
