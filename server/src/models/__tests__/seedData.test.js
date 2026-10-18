const { sentences } = require('../../config/seedData');

// These titles mirror every lesson in client/src/data/curriculumData.js.
const lessonTitles = [
  'Asiointi ja Matkustaminen',
  'Ruoka ja Juoma',
  'Perhe ja Ystävät',
  'Menneet ajat',
  'Työelämä ja Opiskelu',
  'Konditionaali ja Potentiaali',
  'Yhteiskunta ja Ympäristö',
  'Lauseenvastikkeet',
  'Abstraktit keskustelut',
  'Kaupassa ja apteekissa',
  'Terveys ja lääkärissä',
  'Asuminen',
  'Sää ja vuodenajat',
  'Virastoissa',
  'Vapaa-aika ja harrastukset',
];

const lifeLessons = [
  [8, 'Kaupassa ja apteekissa', ['easy']],
  [9, 'Terveys ja lääkärissä', ['easy', 'medium']],
  [10, 'Asuminen', ['medium']],
  [11, 'Sää ja vuodenajat', ['easy']],
  [12, 'Virastoissa', ['medium', 'hard']],
  [13, 'Vapaa-aika ja harrastukset', ['easy']],
];

describe('Curriculum seed sentences', () => {
  const excludedSpokenLessons = ['Yhteiskunta ja Ympäristö', 'Lauseenvastikkeet', 'Abstraktit keskustelut'];

  test.each(lessonTitles.filter(title => !excludedSpokenLessons.includes(title)))('%s has spoken text and bilingual notes on every sentence', (title) => {
    for (const sentence of sentences.filter(s => s.category === title)) {
      for (const field of ['spokenText', 'spokenNotes', 'spokenNotesJa']) {
        expect(typeof sentence[field]).toBe('string');
        expect(sentence[field].trim()).not.toBe('');
      }
      if (sentence.spokenText === sentence.text) {
        expect(sentence.spokenNotes).toBe('Same in speech');
        expect(sentence.spokenNotesJa).toBe('会話でもこのまま使う');
      }
    }
  });

  test.each(excludedSpokenLessons)('%s remains without spoken annotations', (title) => {
    expect(sentences.filter(s => s.category === title).every(s => s.spokenText === undefined)).toBe(true);
  });

  test('Sentence schema preserves optional spoken fields and trims spokenText', () => {
    const Sentence = require('../Sentence');
    const sentence = new Sentence({ text: 'Minä olen täällä.', translation: 'I am here.',
      spokenText: '  Mä oon täällä.  ', spokenNotes: 'minä → mä', spokenNotesJa: 'minä → mä（私）' });
    expect(sentence.spokenText).toBe('Mä oon täällä.');
    expect(sentence.spokenNotes).toBe('minä → mä');
    expect(sentence.spokenNotesJa).toBe('minä → mä（私）');
    expect(new Sentence({ text: 'Hei.', translation: 'Hi.' }).validateSync()).toBeUndefined();
  });

  test.each(lessonTitles)('%s has exactly 18 sentences', (title) => {
    expect(sentences.filter((sentence) => sentence.category === title)).toHaveLength(18);
  });

  test('contains only curriculum categories and has no duplicate ids', () => {
    expect([...new Set(sentences.map((sentence) => sentence.category))].sort())
      .toEqual([...lessonTitles].sort());
    expect(new Set(sentences.map((sentence) => sentence._id)).size).toBe(sentences.length);
  });

  test.each(lifeLessons)('module %i has the expected ids and difficulty levels', (moduleId, title, difficulties) => {
    const lessonSentences = sentences.filter((sentence) => sentence.category === title);
    const expectedIds = Array.from({ length: 18 }, (_, index) => `m${moduleId}_${index + 1}`);

    expect(lessonSentences.map((sentence) => sentence._id)).toEqual(expectedIds);
    expect([...new Set(lessonSentences.map((sentence) => sentence.difficulty))].sort())
      .toEqual([...difficulties].sort());
  });

  test.each(lifeLessons)('module %i has complete, unique learning content', (moduleId, title) => {
    const lessonSentences = sentences.filter((sentence) => sentence.category === title);

    for (const sentence of lessonSentences) {
      for (const field of ['text', 'translation', 'translationJa', 'grammarNotes', 'grammarNotesJa']) {
        expect(typeof sentence[field]).toBe('string');
        expect(sentence[field].trim()).not.toBe('');
      }
      expect(sentences.filter((other) => other.text === sentence.text)).toHaveLength(1);
    }
  });
});
