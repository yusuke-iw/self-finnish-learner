import { describe, it, expect } from 'vitest';
import {
  createOutfitRound,
  checkOutfit,
  getWearSentences
} from '../outfitGame';

describe('outfitGame utility', () => {
  const sampleGame = {
    id: 'vaatteet',
    playLength: 2,
    slots: [
      {
        id: 'paa',
        label: { fi: 'Päässä', en: 'Head' },
        options: [
          { id: 'pipo', icon: '🧶', label: { fi: 'pipo', en: 'beanie' }, wear: { fi: 'Laitan pipon päähän.', en: 'I put on a beanie.' } },
          { id: 'lippis', icon: '🧢', label: { fi: 'lippis', en: 'cap' }, wear: { fi: 'Laitan lippiksen päähän.', en: 'I put on a cap.' } },
          { id: 'ei-paa', icon: '➖', label: { fi: 'ei mitään', en: 'nothing' } }
        ]
      },
      {
        id: 'ylla',
        label: { fi: 'Päällä', en: 'Body' },
        options: [
          { id: 'talvitakki', icon: '🧥', label: { fi: 'talvitakki', en: 'winter coat' }, wear: { fi: 'Puen talvitakin päälle.', en: 'I put on a winter coat.' } },
          { id: 't-paita', icon: '👕', label: { fi: 't-paita', en: 'T-shirt' }, wear: { fi: 'Puen t-paidan päälle.', en: 'I put on a T-shirt.' } }
        ]
      }
    ],
    conditions: [
      {
        id: 'pakkanen',
        weather: { fi: 'Pakkasta', en: 'Freezing' },
        accept: { paa: ['pipo'], ylla: ['talvitakki'] },
        hints: { paa: { fi: 'Pue pipo' }, ylla: { fi: 'Pue talvitakki' } }
      },
      {
        id: 'helle',
        weather: { fi: 'Hellettä', en: 'Hot' },
        accept: { paa: ['lippis', 'ei-paa'], ylla: ['t-paita'] },
        hints: { paa: { fi: 'Ota lippis' }, ylla: { fi: 'Pue t-paita' } }
      },
      {
        id: 'sade',
        weather: { fi: 'Sadetta', en: 'Rainy' },
        accept: { paa: ['lippis'], ylla: ['t-paita'] },
        hints: { paa: { fi: 'Sataa' }, ylla: { fi: 'Sadetakki' } }
      }
    ]
  };

  describe('createOutfitRound', () => {
    it('returns playLength number of conditions', () => {
      const round = createOutfitRound(sampleGame);
      expect(round.length).toBe(2);
      expect(round[0]).toHaveProperty('id');
      expect(round[1]).toHaveProperty('id');
    });

    it('returns all conditions if playLength exceeds conditions count', () => {
      const smallGame = { ...sampleGame, playLength: 10 };
      const round = createOutfitRound(smallGame);
      expect(round.length).toBe(3);
    });

    it('shuffles predictably using the provided random function', () => {
      // Deterministic reverse
      let callCount = 0;
      const fakeRandom = () => {
        callCount++;
        return 0; // always choose 0 index in Fisher-Yates
      };

      const round1 = createOutfitRound(sampleGame, fakeRandom);
      const round2 = createOutfitRound(sampleGame, fakeRandom);
      expect(round1.map((c) => c.id)).toEqual(round2.map((c) => c.id));
      expect(callCount).toBeGreaterThan(0);
    });

    it('handles missing or empty conditions gracefully', () => {
      expect(createOutfitRound({ playLength: 3, conditions: [] })).toEqual([]);
      expect(createOutfitRound(null)).toEqual([]);
    });
  });

  describe('checkOutfit', () => {
    const condition = sampleGame.conditions[0]; // pakkanen: paa -> pipo, ylla -> talvitakki

    it('returns allCorrect: true when all slots match accepted options', () => {
      const selection = { paa: 'pipo', ylla: 'talvitakki' };
      const res = checkOutfit(condition, selection);
      expect(res).toEqual({
        allCorrect: true,
        wrongSlotIds: []
      });
    });

    it('identifies wrong slots when selection does not match accept', () => {
      const selection = { paa: 'lippis', ylla: 'talvitakki' };
      const res = checkOutfit(condition, selection);
      expect(res.allCorrect).toBe(false);
      expect(res.wrongSlotIds).toEqual(['paa']);
    });

    it('flags unselected slots as wrong', () => {
      const selection = { paa: 'pipo' }; // missing ylla
      const res = checkOutfit(condition, selection);
      expect(res.allCorrect).toBe(false);
      expect(res.wrongSlotIds).toEqual(['ylla']);
    });

    it('handles multiple accepted options per slot', () => {
      const helleCondition = sampleGame.conditions[1]; // paa accepts lippis or ei-paa
      expect(checkOutfit(helleCondition, { paa: 'lippis', ylla: 't-paita' }).allCorrect).toBe(true);
      expect(checkOutfit(helleCondition, { paa: 'ei-paa', ylla: 't-paita' }).allCorrect).toBe(true);
      expect(checkOutfit(helleCondition, { paa: 'pipo', ylla: 't-paita' }).allCorrect).toBe(false);
    });

    it('handles null condition or selection', () => {
      expect(checkOutfit(null, {}).allCorrect).toBe(false);
      expect(checkOutfit(condition, null).allCorrect).toBe(false);
    });
  });

  describe('getWearSentences', () => {
    it('returns LocalizedText sentences of selected options that have wear', () => {
      const selection = { paa: 'pipo', ylla: 'talvitakki' };
      const sentences = getWearSentences(sampleGame, selection);

      expect(sentences).toEqual([
        { fi: 'Laitan pipon päähän.', en: 'I put on a beanie.' },
        { fi: 'Puen talvitakin päälle.', en: 'I put on a winter coat.' }
      ]);
    });

    it('omits options that do not have wear (e.g. ei mitään)', () => {
      const selection = { paa: 'ei-paa', ylla: 't-paita' };
      const sentences = getWearSentences(sampleGame, selection);

      expect(sentences).toEqual([
        { fi: 'Puen t-paidan päälle.', en: 'I put on a T-shirt.' }
      ]);
    });

    it('handles missing selection or empty game slots', () => {
      expect(getWearSentences(sampleGame, {})).toEqual([]);
      expect(getWearSentences(null, { paa: 'pipo' })).toEqual([]);
    });
  });
});
