export const SESSION_LENGTH_STORAGE_KEY = 'finnishLearnerSessionLength';
export const DEFAULT_SESSION_LENGTH = 5;
export const VALID_SESSION_LENGTHS = [3, 5, 10];

export function getSessionLength() {
  try {
    const saved = localStorage.getItem(SESSION_LENGTH_STORAGE_KEY);
    if (saved === null) return DEFAULT_SESSION_LENGTH;
    const parsed = Number(saved);
    if (VALID_SESSION_LENGTHS.includes(parsed)) {
      return parsed;
    }
    return DEFAULT_SESSION_LENGTH;
  } catch {
    return DEFAULT_SESSION_LENGTH;
  }
}

export function setSessionLength(n) {
  if (n === null || n === undefined || n === '' || typeof n === 'boolean') {
    return false;
  }
  const parsed = Number(n);
  if (!VALID_SESSION_LENGTHS.includes(parsed)) {
    return false;
  }
  try {
    localStorage.setItem(SESSION_LENGTH_STORAGE_KEY, String(parsed));
    return true;
  } catch {
    return false;
  }
}
