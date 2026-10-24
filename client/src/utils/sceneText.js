export const SCENE_TEXT_MODE_STORAGE_KEY = 'finnishLearnerSceneTextMode';
export const VALID_SCENE_TEXT_MODES = ['fi', 'selko', 'en', 'ja'];

export function pickText(text, mode) {
  if (!text || typeof text !== 'object') {
    return { main: '', sub: null };
  }

  const fi = text.fi || '';
  const selko = text.selko;
  const en = text.en || '';
  const ja = text.ja;

  switch (mode) {
    case 'fi':
      return { main: fi, sub: null };
    case 'selko':
      return { main: selko ?? fi, sub: null };
    case 'ja':
      return { main: fi, sub: ja ?? en };
    case 'en':
    default:
      return { main: fi, sub: en };
  }
}

export function pickWord(text, mode) {
  if (!text || typeof text !== 'object') {
    return { main: '', sub: null };
  }

  const fi = text.fi || '';
  const en = text.en || null;
  const ja = text.ja;

  let sub = null;
  if (mode === 'en') {
    sub = en;
  } else if (mode === 'ja') {
    sub = ja ?? en;
  }

  return { main: fi, sub };
}

export function hasJapanese(game) {
  if (!game || typeof game !== 'object') {
    return false;
  }

  let foundAny = false;
  let allHaveJa = true;

  function walk(node, key) {
    if (key === 'vocabulary') {
      return;
    }

    if (!node || typeof node !== 'object') {
      return;
    }

    if (Array.isArray(node)) {
      for (const item of node) {
        walk(item, key);
      }
      return;
    }

    // Check if this looks like a LocalizedText object
    if (typeof node.fi === 'string' && typeof node.en === 'string') {
      foundAny = true;
      if (typeof node.ja !== 'string' || node.ja.trim() === '') {
        allHaveJa = false;
      }
    }

    for (const [k, v] of Object.entries(node)) {
      walk(v, k);
    }
  }

  walk(game, '');
  return foundAny && allHaveJa;
}

export function getSceneTextMode() {
  try {
    const saved = localStorage.getItem(SCENE_TEXT_MODE_STORAGE_KEY);
    if (saved && VALID_SCENE_TEXT_MODES.includes(saved)) {
      return saved;
    }
  } catch {
    // ignore storage error
  }
  return 'en';
}

export function setSceneTextMode(mode) {
  if (!VALID_SCENE_TEXT_MODES.includes(mode)) {
    return;
  }
  try {
    localStorage.setItem(SCENE_TEXT_MODE_STORAGE_KEY, mode);
  } catch {
    // ignore storage error
  }
}

export function resolveMode(mode, hasJa) {
  if (mode === 'ja' && !hasJa) {
    return 'en';
  }
  return mode;
}
