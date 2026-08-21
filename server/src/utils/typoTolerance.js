/**
 * Standard Levenshtein Distance algorithm to calculate the edit distance between two strings.
 */
function levenshteinDistance(a, b) {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1  // deletion
          )
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Normalizes a sentence by making it lowercase, trimming extra whitespaces,
 * and removing common punctuation marks.
 */
function canonicalize(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '') // remove common punctuation
    .replace(/\s+/g, ' ');                         // normalize multiple spaces to single
}

/**
 * Compares a user input against a correct target sentence and determines
 * if it's correct (perfect or with warning) or incorrect.
 */
function compareAnswers(input, target) {
  const normInput = canonicalize(input);
  const normTarget = canonicalize(target);

  if (normInput === normTarget) {
    return {
      isCorrect: true,
      isPerfect: true,
      hasTypo: false
    };
  }

  const distance = levenshteinDistance(normInput, normTarget);
  
  // Calculate threshold: 15% of target length, but at least 1 typo allowed.
  const threshold = Math.max(1, Math.floor(normTarget.length * 0.15));

  if (distance <= threshold) {
    return {
      isCorrect: true,
      isPerfect: false,
      hasTypo: true
    };
  }

  return {
    isCorrect: false,
    isPerfect: false,
    hasTypo: false
  };
}

module.exports = {
  levenshteinDistance,
  canonicalize,
  compareAnswers
};
