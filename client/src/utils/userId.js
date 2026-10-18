const USER_ID_STORAGE_KEY = 'finnishLearnerUserId';
const DEFAULT_USER_ID = 'default_user';
const USER_ID_REGEX = /^[A-Za-z0-9_-]{1,40}$/;

export function isValidUserId(id) {
  if (typeof id !== 'string') return false;
  return USER_ID_REGEX.test(id.trim());
}

export function getUserId() {
  try {
    const saved = localStorage.getItem(USER_ID_STORAGE_KEY);
    if (saved && isValidUserId(saved)) {
      return saved.trim();
    }
    return DEFAULT_USER_ID;
  } catch {
    return DEFAULT_USER_ID;
  }
}

export function setUserId(id) {
  if (typeof id !== 'string') return false;
  const trimmed = id.trim();
  if (!USER_ID_REGEX.test(trimmed)) {
    return false;
  }
  try {
    localStorage.setItem(USER_ID_STORAGE_KEY, trimmed);
    return true;
  } catch {
    return false;
  }
}
