import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  pickText,
  pickWord,
  hasJapanese,
  getSceneTextMode,
  setSceneTextMode,
  resolveMode,
  SCENE_TEXT_MODE_STORAGE_KEY
} from '../sceneText';

describe('sceneText utility', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('pickText', () => {
    const fullText = {
      fi: 'Katso sää ja pukeudu sen mukaan.',
      selko: 'Katso sää. Valitse vaatteet.',
      en: 'Check the weather and dress for it.',
      ja: '天気を見て、合う服を選ぼう。'
    };

    it('returns main=fi and sub=null for fi mode', () => {
      expect(pickText(fullText, 'fi')).toEqual({
        main: 'Katso sää ja pukeudu sen mukaan.',
        sub: null
      });
    });

    it('returns main=selko and sub=null for selko mode when selko exists', () => {
      expect(pickText(fullText, 'selko')).toEqual({
        main: 'Katso sää. Valitse vaatteet.',
        sub: null
      });
    });

    it('falls back to fi for selko mode when selko is missing', () => {
      const withoutSelko = { fi: 'Hei', en: 'Hi' };
      expect(pickText(withoutSelko, 'selko')).toEqual({
        main: 'Hei',
        sub: null
      });
    });

    it('returns main=fi and sub=en for en mode', () => {
      expect(pickText(fullText, 'en')).toEqual({
        main: 'Katso sää ja pukeudu sen mukaan.',
        sub: 'Check the weather and dress for it.'
      });
    });

    it('returns main=fi and sub=ja for ja mode when ja exists', () => {
      expect(pickText(fullText, 'ja')).toEqual({
        main: 'Katso sää ja pukeudu sen mukaan.',
        sub: '天気を見て、合う服を選ぼう。'
      });
    });

    it('falls back to en for ja mode when ja is missing', () => {
      const withoutJa = { fi: 'Hei', en: 'Hi' };
      expect(pickText(withoutJa, 'ja')).toEqual({
        main: 'Hei',
        sub: 'Hi'
      });
    });

    it('returns empty main and null sub when text is null or undefined', () => {
      expect(pickText(null, 'fi')).toEqual({ main: '', sub: null });
      expect(pickText(undefined, 'en')).toEqual({ main: '', sub: null });
    });
  });

  describe('pickWord', () => {
    const fullWord = {
      fi: 'pipo',
      en: 'beanie',
      ja: 'ニット帽'
    };

    it('returns fi as main and null sub for fi and selko modes', () => {
      expect(pickWord(fullWord, 'fi')).toEqual({ main: 'pipo', sub: null });
      expect(pickWord(fullWord, 'selko')).toEqual({ main: 'pipo', sub: null });
    });

    it('returns fi as main and en sub for en mode', () => {
      expect(pickWord(fullWord, 'en')).toEqual({ main: 'pipo', sub: 'beanie' });
    });

    it('returns fi as main and ja sub for ja mode', () => {
      expect(pickWord(fullWord, 'ja')).toEqual({ main: 'pipo', sub: 'ニット帽' });
    });

    it('falls back to en for ja mode if ja is missing', () => {
      const withoutJa = { fi: 'pipo', en: 'beanie' };
      expect(pickWord(withoutJa, 'ja')).toEqual({ main: 'pipo', sub: 'beanie' });
    });

    it('handles null and undefined', () => {
      expect(pickWord(null, 'en')).toEqual({ main: '', sub: null });
      expect(pickWord(undefined, 'ja')).toEqual({ main: '', sub: null });
    });
  });

  describe('hasJapanese', () => {
    it('returns true when all LocalizedTexts have non-empty ja', () => {
      const gameWithJa = {
        id: 'test-game',
        title: { fi: 'Testi', en: 'Test', ja: 'テスト' },
        instruction: { fi: 'Ohje', en: 'Guide', selko: 'Helppo ohje', ja: 'ガイド' },
        slots: [
          {
            id: 'paa',
            label: { fi: 'Päässä', en: 'Head', ja: '頭' },
            options: [
              {
                id: 'pipo',
                label: { fi: 'pipo', en: 'beanie', ja: 'ニット帽' },
                wear: { fi: 'Laitan pipon.', en: 'I put on a beanie.', ja: '帽子をかぶる。' }
              }
            ]
          }
        ],
        vocabulary: [
          // vocabulary should be ignored even without ja
          { word: 'pipo', translation: 'beanie' }
        ]
      };

      expect(hasJapanese(gameWithJa)).toBe(true);
    });

    it('returns false when at least one LocalizedText is missing ja or has empty ja', () => {
      const gameMissingJa = {
        title: { fi: 'Testi', en: 'Test', ja: 'テスト' },
        instruction: { fi: 'Ohje', en: 'Guide', selko: 'Helppo ohje' } // no ja
      };
      expect(hasJapanese(gameMissingJa)).toBe(false);

      const gameEmptyJa = {
        title: { fi: 'Testi', en: 'Test', ja: '   ' }
      };
      expect(hasJapanese(gameEmptyJa)).toBe(false);
    });

    it('returns false for invalid game object', () => {
      expect(hasJapanese(null)).toBe(false);
      expect(hasJapanese(undefined)).toBe(false);
      expect(hasJapanese({})).toBe(false);
    });
  });

  describe('storage and mode resolution', () => {
    it('defaults to en when storage is empty or corrupt', () => {
      expect(getSceneTextMode()).toBe('en');

      localStorage.setItem(SCENE_TEXT_MODE_STORAGE_KEY, 'invalid-mode');
      expect(getSceneTextMode()).toBe('en');
    });

    it('reads and writes valid modes', () => {
      setSceneTextMode('fi');
      expect(getSceneTextMode()).toBe('fi');

      setSceneTextMode('selko');
      expect(getSceneTextMode()).toBe('selko');

      setSceneTextMode('ja');
      expect(getSceneTextMode()).toBe('ja');

      setSceneTextMode('en');
      expect(getSceneTextMode()).toBe('en');
    });

    it('ignores invalid modes when setting', () => {
      setSceneTextMode('fi');
      setSceneTextMode('invalid');
      expect(getSceneTextMode()).toBe('fi');
    });

    it('handles localStorage errors gracefully', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage denied');
      });
      expect(getSceneTextMode()).toBe('en');

      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage denied');
      });
      expect(() => setSceneTextMode('ja')).not.toThrow();
    });

    it('resolveMode falls back to en only if mode is ja and hasJa is false', () => {
      expect(resolveMode('ja', false)).toBe('en');
      expect(resolveMode('ja', true)).toBe('ja');
      expect(resolveMode('fi', false)).toBe('fi');
      expect(resolveMode('selko', false)).toBe('selko');
      expect(resolveMode('en', false)).toBe('en');
    });
  });
});
