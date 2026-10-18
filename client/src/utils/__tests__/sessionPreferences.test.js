import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getSessionLength, setSessionLength } from '../sessionPreferences';

describe('sessionPreferences utility', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('getSessionLength', () => {
    it('returns default 5 when nothing is stored in localStorage', () => {
      expect(getSessionLength()).toBe(5);
    });

    it('returns stored value when it is 3, 5, or 10', () => {
      localStorage.setItem('finnishLearnerSessionLength', '3');
      expect(getSessionLength()).toBe(3);

      localStorage.setItem('finnishLearnerSessionLength', '5');
      expect(getSessionLength()).toBe(5);

      localStorage.setItem('finnishLearnerSessionLength', '10');
      expect(getSessionLength()).toBe(10);
    });

    it('returns 5 when stored value is not 3, 5, or 10', () => {
      localStorage.setItem('finnishLearnerSessionLength', '4');
      expect(getSessionLength()).toBe(5);

      localStorage.setItem('finnishLearnerSessionLength', '0');
      expect(getSessionLength()).toBe(5);

      localStorage.setItem('finnishLearnerSessionLength', 'invalid');
      expect(getSessionLength()).toBe(5);
    });

    it('returns 5 when localStorage.getItem throws an error', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage blocked');
      });
      expect(getSessionLength()).toBe(5);
    });
  });

  describe('setSessionLength', () => {
    it('saves 3, 5, or 10 to localStorage and returns true', () => {
      expect(setSessionLength(3)).toBe(true);
      expect(localStorage.getItem('finnishLearnerSessionLength')).toBe('3');
      expect(getSessionLength()).toBe(3);

      expect(setSessionLength(10)).toBe(true);
      expect(localStorage.getItem('finnishLearnerSessionLength')).toBe('10');
      expect(getSessionLength()).toBe(10);

      expect(setSessionLength('5')).toBe(true);
      expect(localStorage.getItem('finnishLearnerSessionLength')).toBe('5');
      expect(getSessionLength()).toBe(5);
    });

    it('ignores values other than 3, 5, or 10 and returns false', () => {
      setSessionLength(3);
      expect(setSessionLength(7)).toBe(false);
      expect(setSessionLength(0)).toBe(false);
      expect(setSessionLength(-5)).toBe(false);
      expect(setSessionLength('abc')).toBe(false);
      expect(setSessionLength(null)).toBe(false);
      expect(setSessionLength(undefined)).toBe(false);
      expect(localStorage.getItem('finnishLearnerSessionLength')).toBe('3');
    });

    it('returns false when localStorage.setItem throws an error', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Quota exceeded');
      });
      expect(setSessionLength(10)).toBe(false);
    });
  });
});
