import { saveProgress } from '../services/api';
import { ensureReviewEntry, getReviewSchedule, removeReviewEntry } from './reviewSchedule';

export const WORD_BOOK_STORAGE_KEY = 'finnishLearnerWordBook';

function normalizeWord(entry) {
  if (typeof entry?.word !== 'string' || !entry.word.trim()) return null;
  const word = entry.word.trim();
  const text = (value) => typeof value === 'string' ? value : '';
  const source = entry.source?.type === 'passage'
    ? { type: 'passage', passageId: text(entry.source.passageId), title: text(entry.source.title) }
    : entry.source?.type === 'scene'
      ? { type: 'scene', gameId: text(entry.source.gameId), title: text(entry.source.title) }
      : { type: 'manual' };
  return {
    id: word.toLowerCase(),
    word,
    translation: text(entry.translation),
    translationJa: text(entry.translationJa),
    note: text(entry.note),
    source,
    addedAt: typeof entry.addedAt === 'string' && Number.isFinite(Date.parse(entry.addedAt))
      ? entry.addedAt : new Date(0).toISOString()
  };
}

export function mergeWordBooks(a, b) {
  const words = new Map();
  for (const raw of [...(Array.isArray(a) ? a : []), ...(Array.isArray(b) ? b : [])]) {
    const entry = normalizeWord(raw);
    if (!entry) continue;
    const existing = words.get(entry.id);
    if (!existing || Date.parse(entry.addedAt) < Date.parse(existing.addedAt)) {
      words.set(entry.id, entry);
    }
  }
  return Array.from(words.values());
}

export function getWords() {
  try {
    return mergeWordBooks(JSON.parse(localStorage.getItem(WORD_BOOK_STORAGE_KEY) || '[]'), []);
  } catch {
    return [];
  }
}

export function saveWords(words) {
  const normalized = mergeWordBooks(words, []);
  try {
    localStorage.setItem(WORD_BOOK_STORAGE_KEY, JSON.stringify(normalized));
  } catch {
    // Storage may be unavailable in private browsing.
  }
  return normalized;
}

function syncWords(wordBook) {
  try {
    const pending = saveProgress({ wordBook, reviewSchedule: getReviewSchedule() });
    pending?.catch((err) => console.warn('Failed to save word book:', err?.message));
  } catch (err) {
    console.warn('Failed to save word book:', err?.message);
  }
}

export function addWord(entry) {
  const normalized = normalizeWord({ ...entry, addedAt: new Date().toISOString() });
  if (!normalized) return null;
  const words = getWords();
  const existing = words.find(word => word.id === normalized.id);
  if (existing) return existing;
  const updated = saveWords([...words, normalized]);
  ensureReviewEntry(`word:${normalized.id}`);
  syncWords(updated);
  return normalized;
}

export function removeWord(id) {
  const updated = saveWords(getWords().filter(word => word.id !== id));
  removeReviewEntry(`word:${id}`);
  syncWords(updated);
  return updated;
}

export function hasWord(word) {
  const id = typeof word === 'string' ? word.trim().toLowerCase() : '';
  return getWords().some(entry => entry.id === id);
}
