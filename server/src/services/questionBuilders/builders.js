// One builder per question type. Each takes a sentence plus a context object
// and returns a question. The order of Math.random() calls inside each builder
// is part of the behavior, so keep it when editing.
//
// ctx: { lang, category, distractorPool, extraDistractors }
const { shuffle } = require('../../utils/shuffle');
const { getMatchingVocab } = require('./vocabulary');

const PUNCTUATION = /[.,\/#!$%\^&\*;:{}=\-_`~()?]/g;

const spokenFieldsOf = (sentence) => (sentence.spokenText ? {
  spokenText: sentence.spokenText,
  spokenNotes: sentence.spokenNotes,
  spokenNotesJa: sentence.spokenNotesJa
} : {});

const promptTextOf = (sentence, lang) =>
  ((lang === 'ja' && sentence.translationJa) ? sentence.translationJa : sentence.translation);

const promptFieldsOf = (sentence) => ({
  promptJa: sentence.translationJa || sentence.translation,
  promptEn: sentence.translation
});

// Level 2 (exerciseType 'spoken'): pick the written form of a spoken sentence
function buildSpokenChoice(sentence, ctx) {
  const wrongTexts = [...new Set(shuffle(ctx.distractorPool).map(s => s.text))]
    .filter(text => text !== sentence.text).slice(0, 3);
  for (const other of shuffle(ctx.extraDistractors)) {
    if (wrongTexts.length === 3) break;
    if (other.text !== sentence.text && !wrongTexts.includes(other.text)) wrongTexts.push(other.text);
  }
  return {
    ...spokenFieldsOf(sentence),
    sentenceId: sentence._id.toString(),
    level: 2,
    type: 'spoken-choice',
    prompt: sentence.spokenText,
    correctAnswer: sentence.text,
    options: shuffle([sentence.text, ...wrongTexts])
  };
}

// Level 3: read the sentence aloud
function buildSpeaking(sentence) {
  return {
    ...spokenFieldsOf(sentence),
    sentenceId: sentence._id.toString(),
    level: 3,
    type: 'speaking',
    prompt: sentence.text,
    ...promptFieldsOf(sentence),
    correctAnswer: sentence.text
  };
}

// Level 3: type the sentence. `listening` is fixed (true) for dictation and
// random when omitted.
function buildTyping(sentence, ctx, { listening } = {}) {
  return {
    ...spokenFieldsOf(sentence),
    sentenceId: sentence._id.toString(),
    level: 3,
    type: 'typing',
    prompt: promptTextOf(sentence, ctx.lang),
    ...promptFieldsOf(sentence),
    correctAnswer: sentence.text,
    isListening: listening === undefined ? Math.random() > 0.5 : listening
  };
}

// Level 1: match Finnish words to translations
function buildMatching(sentence, ctx) {
  const selectedVocab = getMatchingVocab(ctx.category);
  const pairs = selectedVocab.map(v => ({ id: Math.random().toString(36).substring(7), ...v }));

  let fiTokens = [];
  let targetTokens = [];
  const targetLang = (ctx.lang === 'ja') ? 'ja' : 'en';

  pairs.forEach(p => {
    fiTokens.push({ id: p.id, text: p.fi, lang: 'fi' });
    targetTokens.push({ id: p.id, text: p[targetLang] || p.en || p.ja, lang: targetLang });
  });
  fiTokens = shuffle(fiTokens);
  targetTokens = shuffle(targetTokens);

  const isFiLeft = Math.random() > 0.5;
  const tokens = [];
  for (let i = 0; i < 5; i++) {
    if (isFiLeft) {
      tokens.push(fiTokens[i]);
      tokens.push(targetTokens[i]);
    } else {
      tokens.push(targetTokens[i]);
      tokens.push(fiTokens[i]);
    }
  }

  return {
    ...spokenFieldsOf(sentence),
    sentenceId: 'matching-warmup-' + Math.random(),
    level: 1,
    type: 'matching',
    tokens,
    pairs
  };
}

// Level 1: pick the right Finnish sentence for a translation
function buildChoice(sentence, ctx) {
  const wrongSentences = ctx.distractorPool.filter(s => s._id.toString() !== sentence._id.toString());
  const wrongOptions = shuffle(wrongSentences)
    .slice(0, 3)
    .map(s => s.text);
  const options = shuffle([sentence.text, ...wrongOptions]);

  return {
    ...spokenFieldsOf(sentence),
    sentenceId: sentence._id.toString(),
    level: 1,
    type: 'choice',
    prompt: promptTextOf(sentence, ctx.lang),
    ...promptFieldsOf(sentence),
    correctAnswer: sentence.text,
    options
  };
}

// Words of `text` with punctuation removed
const cleanWordsOf = (text) => text
  .replace(PUNCTUATION, '')
  .split(/\s+/)
  .filter(w => w.length > 0);

// One random word (longer than 2 chars) from a random other sentence, as a decoy
function pickDistractors(wrongSentences, field) {
  const distractors = [];
  if (wrongSentences.length > 0) {
    const randomWrongText = wrongSentences[Math.floor(Math.random() * wrongSentences.length)][field];
    const randomWrongWords = randomWrongText.split(/\s+/).filter(w => w.length > 2);
    if (randomWrongWords.length > 0) {
      distractors.push(randomWrongWords[Math.floor(Math.random() * randomWrongWords.length)]);
    }
  }
  return distractors;
}

// Level 2: build the sentence from a word bank. For English users it may be
// the reverse direction (English words, Finnish prompt); Japanese users always
// get the standard Finnish word bank.
function buildWordBank(sentence, ctx) {
  const wrongSentences = ctx.distractorPool.filter(s => s._id.toString() !== sentence._id.toString());
  const isReverse = ctx.lang === 'en' ? Math.random() > 0.5 : false;

  if (!isReverse) {
    const cleanWords = cleanWordsOf(sentence.text);
    const distractors = pickDistractors(wrongSentences, 'text');
    const wordBank = shuffle([...cleanWords, ...distractors]);

    return {
      ...spokenFieldsOf(sentence),
      sentenceId: sentence._id.toString(),
      level: 2,
      type: 'word-bank',
      prompt: promptTextOf(sentence, ctx.lang),
      ...promptFieldsOf(sentence),
      correctAnswer: sentence.text,
      wordBank
    };
  }

  const cleanWords = cleanWordsOf(sentence.translation);
  const distractors = pickDistractors(wrongSentences, 'translation');
  const wordBank = shuffle([...cleanWords, ...distractors]);

  return {
    ...spokenFieldsOf(sentence),
    sentenceId: sentence._id.toString(),
    level: 2,
    type: 'word-bank-reverse',
    prompt: sentence.text,
    promptJa: sentence.text,
    promptEn: sentence.text,
    correctAnswer: sentence.translation,
    wordBank
  };
}

// Level 3: type the one missing word
function buildFillInTheBlank(sentence, ctx) {
  const words = sentence.text.split(' ');
  const candidateWords = words.filter(w => w.replace(PUNCTUATION, '').length > 2);
  const targetWordRaw = candidateWords.length > 0
    ? candidateWords[Math.floor(Math.random() * candidateWords.length)]
    : words[Math.floor(Math.random() * words.length)];

  const missingWord = targetWordRaw.replace(PUNCTUATION, '');
  const matchIndex = sentence.text.indexOf(missingWord);
  const prefix = sentence.text.substring(0, matchIndex);
  const suffix = sentence.text.substring(matchIndex + missingWord.length);

  return {
    ...spokenFieldsOf(sentence),
    sentenceId: sentence._id.toString(),
    level: 3,
    type: 'fill-in-the-blank',
    prompt: promptTextOf(sentence, ctx.lang),
    ...promptFieldsOf(sentence),
    prefix,
    missingWord,
    suffix,
    correctAnswer: sentence.text,
    isListening: Math.random() > 0.5
  };
}

module.exports = {
  buildSpokenChoice,
  buildSpeaking,
  buildTyping,
  buildMatching,
  buildChoice,
  buildWordBank,
  buildFillInTheBlank
};
