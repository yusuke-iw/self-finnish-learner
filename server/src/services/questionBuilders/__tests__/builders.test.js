const builders = require('../builders');
const { buildQuestionsForSentence, buildQuestions } = require('../index');
const { getMatchingVocab, categoryVocab, vocabularyBank } = require('../vocabulary');

const sentence = {
  _id: 's1',
  text: 'Minä puhun suomea.',
  translation: 'I speak Finnish.',
  translationJa: '私はフィンランド語を話します。'
};
const spokenSentence = { ...sentence, spokenText: 'Mä puhun suomee.', spokenNotes: 'n', spokenNotesJa: 'nj' };
const others = [
  { _id: 's2', text: 'Tämä on helppoa.', translation: 'This is easy.' },
  { _id: 's3', text: 'Hän asuu Helsingissä.', translation: 'He lives in Helsinki.' },
  { _id: 's4', text: 'Kahvi on kuumaa.', translation: 'The coffee is hot.' },
  { _id: 's5', text: 'Kirja on pöydällä.', translation: 'The book is on the table.' }
];
const baseCtx = { lang: 'ja', category: undefined, distractorPool: [sentence, ...others], extraDistractors: [] };

afterEach(() => jest.restoreAllMocks());

describe('getMatchingVocab', () => {
  it('returns 5 items from the category, padded from the common bank', () => {
    const fromCategory = getMatchingVocab('Ruoka ja Juoma');
    expect(fromCategory).toHaveLength(5);
    expect(fromCategory.every(v => categoryVocab['Ruoka ja Juoma'].includes(v))).toBe(true);
    const unknown = getMatchingVocab('nope');
    expect(unknown).toHaveLength(5);
    expect(unknown.every(v => vocabularyBank.includes(v))).toBe(true);
  });
});

describe('buildChoice', () => {
  it('has the sentence plus 3 other sentences as options', () => {
    const q = builders.buildChoice(sentence, baseCtx);
    expect(q).toMatchObject({
      sentenceId: 's1', level: 1, type: 'choice', correctAnswer: sentence.text,
      prompt: sentence.translationJa, promptEn: sentence.translation
    });
    expect(q.options).toHaveLength(4);
    expect(q.options).toContain(sentence.text);
    expect(new Set(q.options).size).toBe(4);
  });
  it('prompts in English for non-ja users and copes with a small pool', () => {
    const q = builders.buildChoice(sentence, { ...baseCtx, lang: 'en', distractorPool: [sentence, others[0]] });
    expect(q.prompt).toBe(sentence.translation);
    expect(q.options).toHaveLength(2);
  });
});

describe('buildMatching', () => {
  it('makes 5 pairs and 10 interleaved tokens in the target language', () => {
    const q = builders.buildMatching(sentence, baseCtx);
    expect(q).toMatchObject({ level: 1, type: 'matching' });
    expect(q.sentenceId).toMatch(/^matching-warmup-/);
    expect(q.pairs).toHaveLength(5);
    expect(q.tokens).toHaveLength(10);
    expect(q.tokens.filter(t => t.lang === 'ja')).toHaveLength(5);
    expect(q.tokens.filter(t => t.lang === 'fi')).toHaveLength(5);
  });
  it('uses English tokens for non-ja users and puts Finnish on the left or right', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.9);
    const left = builders.buildMatching(sentence, { ...baseCtx, lang: 'en' });
    expect(left.tokens[0].lang).toBe('fi');
    expect(left.tokens[1].lang).toBe('en');
    Math.random.mockReturnValue(0.1);
    const right = builders.buildMatching(sentence, { ...baseCtx, lang: 'en' });
    expect(right.tokens[0].lang).toBe('en');
  });
  it('carries spoken fields', () => {
    expect(builders.buildMatching(spokenSentence, baseCtx)).toMatchObject({ spokenText: 'Mä puhun suomee.' });
  });
});

describe('buildWordBank', () => {
  it('builds the Finnish word bank without punctuation, plus one decoy', () => {
    const q = builders.buildWordBank(sentence, baseCtx);
    expect(q).toMatchObject({ level: 2, type: 'word-bank', correctAnswer: sentence.text });
    expect(q.wordBank).toEqual(expect.arrayContaining(['Minä', 'puhun', 'suomea']));
    expect(q.wordBank).toHaveLength(4);
    expect(q.wordBank.some(w => w.includes('.') && w.startsWith('suomea'))).toBe(false);
  });
  it('adds no decoy when there is no other sentence', () => {
    const q = builders.buildWordBank(sentence, { ...baseCtx, distractorPool: [sentence] });
    expect(q.wordBank).toHaveLength(3);
  });
  it('builds the reverse bank for English users when random says so', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.9);
    const q = builders.buildWordBank(sentence, { ...baseCtx, lang: 'en' });
    expect(q).toMatchObject({ type: 'word-bank-reverse', prompt: sentence.text, correctAnswer: sentence.translation });
    expect(q.wordBank).toEqual(expect.arrayContaining(['speak', 'Finnish']));
  });
  it('never reverses for Japanese users', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.99);
    expect(builders.buildWordBank(sentence, baseCtx).type).toBe('word-bank');
  });
});

describe('level 3 builders', () => {
  it('buildFillInTheBlank splits the sentence around the missing word', () => {
    const q = builders.buildFillInTheBlank(sentence, baseCtx);
    expect(q).toMatchObject({ level: 3, type: 'fill-in-the-blank', correctAnswer: sentence.text });
    expect(q.prefix + q.missingWord + q.suffix).toBe(sentence.text);
    expect(typeof q.isListening).toBe('boolean');
  });
  it('buildFillInTheBlank falls back to any word when all are short', () => {
    const q = builders.buildFillInTheBlank({ ...sentence, text: 'Ei ole.' }, baseCtx);
    expect(q.prefix + q.missingWord + q.suffix).toBe('Ei ole.');
  });
  it('buildSpeaking asks to read the Finnish text', () => {
    expect(builders.buildSpeaking(spokenSentence)).toMatchObject({
      level: 3, type: 'speaking', prompt: sentence.text, promptJa: sentence.translationJa, spokenNotesJa: 'nj'
    });
  });
  it('buildTyping fixes isListening only when asked', () => {
    expect(builders.buildTyping(sentence, baseCtx, { listening: true }).isListening).toBe(true);
    expect(builders.buildTyping(sentence, baseCtx, { listening: false }).isListening).toBe(false);
    jest.spyOn(Math, 'random').mockReturnValue(0.9);
    expect(builders.buildTyping(sentence, baseCtx).isListening).toBe(true);
    expect(builders.buildTyping(sentence, baseCtx).type).toBe('typing');
  });
});

describe('buildSpokenChoice', () => {
  it('offers the written form among 3 distractors from the pool', () => {
    const q = builders.buildSpokenChoice(spokenSentence, baseCtx);
    expect(q).toMatchObject({ level: 2, type: 'spoken-choice', prompt: 'Mä puhun suomee.', correctAnswer: sentence.text });
    expect(q.options).toHaveLength(4);
    expect(q.options).toContain(sentence.text);
  });
  it('tops up from extra distractors and skips duplicates', () => {
    const ctx = {
      ...baseCtx,
      distractorPool: [sentence, others[0]],
      extraDistractors: [others[0], sentence, others[1], others[2], others[3]]
    };
    const q = builders.buildSpokenChoice(spokenSentence, ctx);
    expect(q.options).toHaveLength(4);
    expect(new Set(q.options).size).toBe(4);
  });
});

describe('buildQuestionsForSentence', () => {
  const opts = (extra) => ({ ...baseCtx, exerciseType: undefined, requestedLevel: null, ...extra });
  const types = (built) => ({
    l1: built.level1.map(q => q.type), l2: built.level2.map(q => q.type), l3: built.level3.map(q => q.type)
  });

  it('builds one question per level by default', () => {
    const built = buildQuestionsForSentence(sentence, opts());
    expect(built.level1).toHaveLength(1);
    expect(built.level2).toHaveLength(1);
    expect(built.level3).toHaveLength(1);
  });
  it('limits to the requested level', () => {
    expect(types(buildQuestionsForSentence(sentence, opts({ requestedLevel: 2 })))).toMatchObject({ l1: [], l3: [] });
    expect(buildQuestionsForSentence(sentence, opts({ requestedLevel: 3 })).level3).toHaveLength(1);
    expect(buildQuestionsForSentence(sentence, opts({ requestedLevel: 1 })).level2).toHaveLength(0);
  });
  it('picks level 1 and level 3 types from random', () => {
    const spy = jest.spyOn(Math, 'random');
    spy.mockReturnValue(0.9);
    let t = types(buildQuestionsForSentence(sentence, opts()));
    expect(t.l1).toEqual(['matching']);
    expect(t.l3).toEqual(['fill-in-the-blank']);
    spy.mockReturnValue(0.5);
    t = types(buildQuestionsForSentence(sentence, opts()));
    expect(t.l1).toEqual(['choice']);
    expect(t.l3).toEqual(['speaking']);
    spy.mockReturnValue(0.1);
    t = types(buildQuestionsForSentence(sentence, opts()));
    expect(t.l1).toEqual(['choice']);
    expect(t.l3).toEqual(['typing']);
  });
  it.each([
    ['spoken', 'l2', 'spoken-choice'],
    ['speaking', 'l3', 'speaking'],
    ['dictation', 'l3', 'typing'],
    ['matching', 'l1', 'matching'],
    ['word-bank', 'l2', 'word-bank']
  ])('exerciseType %s builds only %s %s', (exerciseType, level, type) => {
    const t = types(buildQuestionsForSentence(spokenSentence, opts({ exerciseType })));
    expect(t[level]).toEqual([type]);
    expect(Object.values(t).flat()).toHaveLength(1);
  });
  it('dictation questions are always listening', () => {
    expect(buildQuestionsForSentence(sentence, opts({ exerciseType: 'dictation' })).level3[0].isListening).toBe(true);
  });
  it('builds nothing for an unknown exerciseType', () => {
    expect(Object.values(types(buildQuestionsForSentence(sentence, opts({ exerciseType: 'bogus' })))).flat()).toEqual([]);
  });
});

describe('buildQuestions', () => {
  it('orders all level 1 questions, then level 2, then level 3', () => {
    const questions = buildQuestions([sentence, others[0], others[1]], {
      ...baseCtx, exerciseType: undefined, requestedLevel: null
    });
    expect(questions).toHaveLength(9);
    expect(questions.map(q => q.level)).toEqual([1, 1, 1, 2, 2, 2, 3, 3, 3]);
  });
  it('returns an empty list for no sentences', () => {
    expect(buildQuestions([], baseCtx)).toEqual([]);
  });
});
