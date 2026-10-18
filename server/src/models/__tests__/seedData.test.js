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
