import { saveProgress } from '../services/api';
import { getReviewSchedule, getDueKeys } from './reviewSchedule';

export const LOCAL_STORAGE_MISTAKES_KEY = 'finnish_grammar_mistakes';

export function loadLocalMistakes() {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_MISTAKES_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load mistakes from localStorage', e);
  }
  return [];
}

// Mistakes that were never scheduled, or whose review is due.
export function getDueMistakes(bank) {
  if (!Array.isArray(bank) || bank.length === 0) return [];
  const schedule = getReviewSchedule();
  const dueIdSet = new Set(getDueKeys('grammar'));
  return bank.filter((m) => {
    if (!m || !m.id) return false;
    const key = `grammar:${m.id}`;
    if (!schedule[key]) return true;
    return dueIdSet.has(m.id);
  });
}

// Fire-and-forget save to the server; failures are only logged.
export function saveProgressSafe(payload) {
  if (typeof saveProgress !== 'function') return;
  try {
    const p = saveProgress(payload);
    if (p && typeof p.catch === 'function') {
      p.catch((err) => {
        console.warn('[INFO] Failed to save progress to server:', err?.message);
      });
    }
  } catch (err) {
    console.warn('[INFO] Failed to save progress to server:', err?.message);
  }
}

// Merge server and local mistake banks (local wins on a duplicate key).
export function mergeMistakes(serverMistakes, localBank) {
  const map = new Map();
  [...serverMistakes, ...localBank].forEach(m => {
    if (m?.id || m?.question) map.set(m.id || m.question, m);
  });
  return Array.from(map.values());
}
