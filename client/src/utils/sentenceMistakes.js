export const SENTENCE_MISTAKES_STORAGE_KEY = 'finnishLearnerSentenceMistakes';

function isValidItem(item) {
  return (
    item &&
    typeof item === 'object' &&
    typeof item.sentenceId === 'string' &&
    item.sentenceId.trim().length > 0 &&
    !item.sentenceId.startsWith('matching-warmup-')
  );
}

function normalizeItem(item) {
  return {
    sentenceId: item.sentenceId,
    count: typeof item.count === 'number' && item.count > 0 ? item.count : 1,
    lastMistakeAt: typeof item.lastMistakeAt === 'string' ? item.lastMistakeAt : new Date(0).toISOString()
  };
}

export function getSentenceMistakes() {
  try {
    const saved = localStorage.getItem(SENTENCE_MISTAKES_STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidItem).map(normalizeItem);
  } catch {
    return [];
  }
}

export function addSentenceMistake(sentenceId) {
  const current = getSentenceMistakes();
  if (
    typeof sentenceId !== 'string' ||
    sentenceId.trim().length === 0 ||
    sentenceId.startsWith('matching-warmup-')
  ) {
    return current;
  }

  const now = new Date().toISOString();
  const existingIndex = current.findIndex((m) => m.sentenceId === sentenceId);
  let updated;

  if (existingIndex >= 0) {
    updated = current.map((item, idx) =>
      idx === existingIndex
        ? {
            sentenceId,
            count: (item.count || 1) + 1,
            lastMistakeAt: now
          }
        : item
    );
  } else {
    updated = [
      ...current,
      {
        sentenceId,
        count: 1,
        lastMistakeAt: now
      }
    ];
  }

  try {
    localStorage.setItem(SENTENCE_MISTAKES_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore storage errors
  }

  return updated;
}

export function removeSentenceMistake(sentenceId) {
  const current = getSentenceMistakes();
  if (typeof sentenceId !== 'string' || sentenceId.trim().length === 0) {
    return current;
  }

  const updated = current.filter((m) => m.sentenceId !== sentenceId);
  try {
    localStorage.setItem(SENTENCE_MISTAKES_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore storage errors
  }

  return updated;
}

export function mergeSentenceMistakes(a, b) {
  const listA = Array.isArray(a) ? a : [];
  const listB = Array.isArray(b) ? b : [];
  const map = new Map();

  for (const raw of [...listA, ...listB]) {
    if (!isValidItem(raw)) continue;
    const item = normalizeItem(raw);
    if (!map.has(item.sentenceId)) {
      map.set(item.sentenceId, item);
    } else {
      const prev = map.get(item.sentenceId);
      const mergedCount = Math.max(prev.count, item.count);
      const prevTime = Date.parse(prev.lastMistakeAt);
      const nextTime = Date.parse(item.lastMistakeAt);
      let newerAt = prev.lastMistakeAt;

      if (!Number.isNaN(nextTime) && (Number.isNaN(prevTime) || nextTime > prevTime)) {
        newerAt = item.lastMistakeAt;
      } else if (Number.isNaN(prevTime) && Number.isNaN(nextTime) && item.lastMistakeAt > prev.lastMistakeAt) {
        newerAt = item.lastMistakeAt;
      }

      map.set(item.sentenceId, {
        sentenceId: item.sentenceId,
        count: mergedCount,
        lastMistakeAt: newerAt
      });
    }
  }

  return Array.from(map.values());
}
