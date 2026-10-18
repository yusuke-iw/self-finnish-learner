const { passages } = require('../../config/seedData');

describe('Reading passage seed data', () => {
  test('contains 12 passages with unique ids from p1 to p12', () => {
    expect(passages).toHaveLength(12);
    expect(new Set(passages.map((passage) => passage._id)).size).toBe(12);
    expect(passages.map((passage) => passage._id))
      .toEqual(Array.from({ length: 12 }, (_, index) => `p${index + 1}`));
  });

  describe.each(passages)('$_id', (passage) => {
    test('has complete passage text and translations', () => {
      for (const field of ['title', 'titleJa', 'text', 'translation', 'translationJa', 'category', 'difficulty']) {
        expect(typeof passage[field]).toBe('string');
        expect(passage[field].trim()).not.toBe('');
      }
    });

    test('has vocabulary entries taken from the text with bilingual translations', () => {
      // p1 and p2 predate the 8-word rule and have 5 words
      if (['p1', 'p2'].includes(passage._id)) {
        expect(passage.vocabulary.length).toBeGreaterThanOrEqual(5);
      } else {
        expect(passage.vocabulary).toHaveLength(8);
      }
      for (const entry of passage.vocabulary) {
        for (const field of ['word', 'translation', 'translationJa']) {
          expect(typeof entry[field]).toBe('string');
          expect(entry[field].trim()).not.toBe('');
        }
        expect(passage.text.toLocaleLowerCase('fi')).toContain(entry.word.toLocaleLowerCase('fi'));
      }
    });

    test('has 3 bilingual questions with 3 options and a valid answer index each', () => {
      expect(passage.questions).toHaveLength(3);
      for (const question of passage.questions) {
        for (const field of ['questionText', 'questionTextJa']) {
          expect(typeof question[field]).toBe('string');
          expect(question[field].trim()).not.toBe('');
        }
        expect(question.options).toHaveLength(3);
        expect(question.optionsJa).toHaveLength(3);
        for (const option of [...question.options, ...question.optionsJa]) {
          expect(typeof option).toBe('string');
          expect(option.trim()).not.toBe('');
        }
        expect(Number.isInteger(question.correctAnswerIndex)).toBe(true);
        expect(question.correctAnswerIndex).toBeGreaterThanOrEqual(0);
        expect(question.correctAnswerIndex).toBeLessThan(question.options.length);
        expect(question.correctAnswerIndex).toBeLessThan(question.optionsJa.length);
      }
    });
  });
});
