import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getUserId, setUserId, isValidUserId } from '../userId';

describe('userId utility', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('isValidUserId', () => {
    it('accepts valid IDs matching /^[A-Za-z0-9_-]{1,40}$/ after trim', () => {
      expect(isValidUserId('default_user')).toBe(true);
      expect(isValidUserId('a')).toBe(true);
      expect(isValidUserId('User-123_ABC')).toBe(true);
      expect(isValidUserId('  trimmed_id  ')).toBe(true);
      expect(isValidUserId('a'.repeat(40))).toBe(true);
    });

    it('rejects empty, too long, or invalid character IDs', () => {
      expect(isValidUserId('')).toBe(false);
      expect(isValidUserId('   ')).toBe(false);
      expect(isValidUserId('a'.repeat(41))).toBe(false);
      expect(isValidUserId('invalid id')).toBe(false);
      expect(isValidUserId('user@domain.com')).toBe(false);
      expect(isValidUserId('日本語')).toBe(false);
      expect(isValidUserId(null)).toBe(false);
      expect(isValidUserId(undefined)).toBe(false);
      expect(isValidUserId(123)).toBe(false);
    });
  });

  describe('getUserId', () => {
    it('returns default_user when nothing is stored in localStorage', () => {
      expect(getUserId()).toBe('default_user');
    });

    it('returns stored userId when valid', () => {
      localStorage.setItem('finnishLearnerUserId', 'my_sync_id-01');
      expect(getUserId()).toBe('my_sync_id-01');
    });

    it('returns default_user if localStorage throws an error', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage blocked');
      });
      expect(getUserId()).toBe('default_user');
    });
  });

  describe('setUserId', () => {
    it('trims, saves valid ID to localStorage, and returns true', () => {
      const ok = setUserId('  custom_user-99  ');
      expect(ok).toBe(true);
      expect(localStorage.getItem('finnishLearnerUserId')).toBe('custom_user-99');
      expect(getUserId()).toBe('custom_user-99');
    });

    it('returns false and does not overwrite localStorage when ID is invalid', () => {
      localStorage.setItem('finnishLearnerUserId', 'existing_user');
      expect(setUserId('')).toBe(false);
      expect(setUserId('bad id!')).toBe(false);
      expect(setUserId('x'.repeat(41))).toBe(false);
      expect(localStorage.getItem('finnishLearnerUserId')).toBe('existing_user');
    });

    it('returns false if localStorage.setItem throws an error', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Quota exceeded');
      });
      expect(setUserId('valid_user')).toBe(false);
    });
  });
});
