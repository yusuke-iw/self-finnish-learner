const { compareAnswers, levenshteinDistance } = require('../typoTolerance');

describe('Levenshtein Distance Utility', () => {
  test('should calculate distance correctly', () => {
    expect(levenshteinDistance('', '')).toBe(0);
    expect(levenshteinDistance('abc', 'abc')).toBe(0);
    expect(levenshteinDistance('abc', 'ac')).toBe(1); // deletion
    expect(levenshteinDistance('abc', 'abdc')).toBe(1); // insertion
    expect(levenshteinDistance('abc', 'axc')).toBe(1); // substitution
    expect(levenshteinDistance('kitten', 'sitting')).toBe(3);
  });
});

describe('compareAnswers (Typo Tolerance Engine)', () => {
  test('should return perfect match for exact matches', () => {
    expect(compareAnswers('Minä puhun suomea.', 'Minä puhun suomea.')).toEqual({
      isCorrect: true,
      isPerfect: true,
      hasTypo: false
    });
  });

  test('should return perfect match for case and punctuation differences', () => {
    expect(compareAnswers('minä puhun suomea', 'Minä puhun suomea.')).toEqual({
      isCorrect: true,
      isPerfect: true,
      hasTypo: false
    });
  });

  test('should tolerate minor typos (edit distance <= 15% of length, min 1 typo)', () => {
    // Length is 18 characters. 15% of 18 is 2.7, so 2 typos are tolerated.
    // "suomaa" instead of "suomea" (edit distance 1)
    expect(compareAnswers('minä puhun suomaa', 'Minä puhun suomea.')).toEqual({
      isCorrect: true,
      isPerfect: false,
      hasTypo: true
    });
  });

  test('should reject answers with too many typos', () => {
    // "minä" is missing and "suomea" is misspelled -> too far.
    expect(compareAnswers('puhun suomaa', 'Minä puhun suomea.').isCorrect).toBe(false);
  });

  test('should handle short answers with a minimum of 1 typo allowed', () => {
    // "Moi" -> "Mo" (length 3, 15% is 0.45. But we should allow at least 1 typo for short words).
    expect(compareAnswers('mo', 'Moi')).toEqual({
      isCorrect: true,
      isPerfect: false,
      hasTypo: true
    });
  });
});
