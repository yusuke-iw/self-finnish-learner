import { addWord, hasWord } from './wordBook';

// Collects every Finnish string (fi / spoken) found in the given scene data fragments.
export function collectFinnishTexts(...fragments) {
  const texts = [];
  const walk = (node) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    for (const [key, value] of Object.entries(node)) {
      if ((key === 'fi' || key === 'spoken') && typeof value === 'string') {
        texts.push(value);
      } else {
        walk(value);
      }
    }
  };
  fragments.forEach(walk);
  return texts;
}

function escapeRegExp(text) {
  return text.replace(/[\\^$.*+?()[\]{}|]/g, (ch) => `\\${ch}`);
}

// Finnish words inflect, so match on the start of the word (the stem) at a word boundary.
function mentionsWord(word, texts) {
  const lower = word.trim().toLowerCase();
  if (!lower) return false;
  const stem = lower.slice(0, Math.max(4, lower.length - 2));
  const pattern = new RegExp(`(^|[^\\p{L}])${escapeRegExp(stem)}`, 'u');
  return texts.some((text) => pattern.test(text.toLowerCase()));
}

// Vocabulary entries of the game that appear in the texts of the questions answered wrong.
export function findMistakeVocabulary(game, mistakeTexts) {
  if (!Array.isArray(game?.vocabulary) || !Array.isArray(mistakeTexts) || mistakeTexts.length === 0) {
    return [];
  }
  return game.vocabulary.filter(
    (entry) => typeof entry?.word === 'string' && mentionsWord(entry.word, mistakeTexts)
  );
}

// Adds the mistaken vocabulary to the word book (skipping words already there).
// Returns the entries that were newly added.
export function addMistakeWords(game, mistakeTexts) {
  const added = [];
  for (const entry of findMistakeVocabulary(game, mistakeTexts)) {
    if (hasWord(entry.word)) continue;
    const saved = addWord({
      word: entry.word,
      translation: entry.translation,
      translationJa: entry.translationJa,
      source: { type: 'scene', gameId: game.id, title: game.title?.fi }
    });
    if (saved) added.push(entry);
  }
  return added;
}
