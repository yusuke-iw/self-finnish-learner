import { describe, it, expect } from 'vitest';
import { PASS_THRESHOLD, isSessionPassed } from '../sessionResult';

describe('sessionResult utility', () => {
  it('exports PASS_THRESHOLD as 0.8', () => {
    expect(PASS_THRESHOLD).toBe(0.8);
  });

  it('returns true when accuracy is exactly 0.8 (boundary)', () => {
    expect(isSessionPassed({ correct: 4, typo: 0, incorrect: 1 }, 5)).toBe(true);
    expect(isSessionPassed({ correct: 8, typo: 0, incorrect: 2 }, 10)).toBe(true);
  });

  it('counts typos as correct answers toward the pass threshold', () => {
    expect(isSessionPassed({ correct: 3, typo: 1, incorrect: 1 }, 5)).toBe(true);
    expect(isSessionPassed({ correct: 0, typo: 4, incorrect: 1 }, 5)).toBe(true);
  });

  it('returns true when accuracy is above 0.8', () => {
    expect(isSessionPassed({ correct: 5, typo: 0, incorrect: 0 }, 5)).toBe(true);
  });

  it('returns false when accuracy is below 0.8', () => {
    expect(isSessionPassed({ correct: 3, typo: 0, incorrect: 2 }, 5)).toBe(false);
    expect(isSessionPassed({ correct: 7, typo: 0, incorrect: 3 }, 10)).toBe(false);
    expect(isSessionPassed({ correct: 2, typo: 1, incorrect: 2 }, 5)).toBe(false);
  });

  it('returns false when total is 0 or invalid', () => {
    expect(isSessionPassed({ correct: 0, typo: 0, incorrect: 0 }, 0)).toBe(false);
    expect(isSessionPassed({ correct: 5, typo: 0, incorrect: 0 }, 0)).toBe(false);
    expect(isSessionPassed({ correct: 1, typo: 0, incorrect: 0 }, -1)).toBe(false);
    expect(isSessionPassed(null, 5)).toBe(false);
  });
});
