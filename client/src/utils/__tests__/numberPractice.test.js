import { describe, it, expect } from 'vitest';
import { generateNumberQuestion, checkNumberAnswer } from '../numberPractice';

describe('numberPractice utils', () => {
  describe('generateNumberQuestion', () => {
    it('generates a number question within the requested range using custom random', () => {
      const q0 = generateNumberQuestion('number', { max: 99 }, () => 0);
      expect(q0.mode).toBe('number');
      expect(q0.value).toBe(0);
      expect(q0.finnishText).toBe('nolla');
      expect(q0.displayAnswer).toBe('0');

      const qMax = generateNumberQuestion('number', { max: 9999 }, () => 0.1984);
      expect(qMax.value).toBe(1984);
      expect(qMax.finnishText).toBe('tuhatyhdeksänsataakahdeksankymmentäneljä');
      expect(qMax.displayAnswer).toBe('1984');
    });

    it('generates a price question between 0,10 and 99,99 €', () => {
      const qMin = generateNumberQuestion('price', {}, () => 0);
      expect(qMin.mode).toBe('price');
      expect(qMin.euros).toBe(0);
      expect(qMin.cents).toBeGreaterThanOrEqual(10);
      expect(qMin.finnishText).toBe('kymmenen senttiä');
      expect(qMin.displayAnswer).toBe('0,10');

      const seq = [0.125, 0.1, 0.5];
      let idx = 0;
      const qMid = generateNumberQuestion('price', {}, () => seq[idx++ % seq.length]);
      expect(qMid.euros).toBe(12);
      expect(qMid.cents).toBe(50);
      expect(qMid.finnishText).toBe('kaksitoista euroa viisikymmentä senttiä');
      expect(qMid.displayAnswer).toBe('12,50');
    });

    it('generates an official 24-hour time question', () => {
      const seq = [14 / 24, 30 / 60];
      let idx = 0;
      const q = generateNumberQuestion('time-official', {}, () => seq[idx++]);
      expect(q.hours).toBe(14);
      expect(q.minutes).toBe(30);
      expect(q.finnishText).toBe('kello neljätoista kolmekymmentä');
      expect(q.displayAnswer).toBe('14:30');
    });

    it('generates an everyday 12-hour time question', () => {
      const seq = [2 / 12, 15 / 60]; // hour = 2 + 1 = 3, minute = 15
      let idx = 0;
      const q = generateNumberQuestion('time-everyday', {}, () => seq[idx++]);
      expect(q.hours).toBe(3);
      expect(q.minutes).toBe(15);
      expect(q.finnishText).toBe('varttia yli kolme');
      expect(q.displayAnswer).toBe('3:15');
    });
  });

  describe('checkNumberAnswer', () => {
    it('checks number mode answers accurately', () => {
      const q = { mode: 'number', value: 1984 };
      expect(checkNumberAnswer(q, '1984')).toBe(true);
      expect(checkNumberAnswer(q, ' 1984 ')).toBe(true);
      expect(checkNumberAnswer(q, '1985')).toBe(false);
      expect(checkNumberAnswer(q, '')).toBe(false);
      expect(checkNumberAnswer(q, 'tuhat')).toBe(false);
    });

    it('checks price mode answers accepting comma, dot, and single trailing decimal for tens of cents', () => {
      const q = { mode: 'price', euros: 12, cents: 50 };
      expect(checkNumberAnswer(q, '12,50')).toBe(true);
      expect(checkNumberAnswer(q, '12.50')).toBe(true);
      expect(checkNumberAnswer(q, '12,5')).toBe(true);
      expect(checkNumberAnswer(q, '12.5')).toBe(true);
      expect(checkNumberAnswer(q, '12,05')).toBe(false);
      expect(checkNumberAnswer(q, '12')).toBe(false);

      const qSingleCent = { mode: 'price', euros: 1, cents: 1 };
      expect(checkNumberAnswer(qSingleCent, '1,01')).toBe(true);
      expect(checkNumberAnswer(qSingleCent, '1.01')).toBe(true);
      expect(checkNumberAnswer(qSingleCent, '1,1')).toBe(false);

      const qWholeEuro = { mode: 'price', euros: 5, cents: 0 };
      expect(checkNumberAnswer(qWholeEuro, '5,00')).toBe(true);
      expect(checkNumberAnswer(qWholeEuro, '5.00')).toBe(true);
      expect(checkNumberAnswer(qWholeEuro, '5')).toBe(true);
    });

    it('checks official 24-hour time answers with colon or dot', () => {
      const q = { mode: 'time-official', hours: 14, minutes: 30 };
      expect(checkNumberAnswer(q, '14:30')).toBe(true);
      expect(checkNumberAnswer(q, '14.30')).toBe(true);
      expect(checkNumberAnswer(q, '2:30')).toBe(false);

      const qMorning = { mode: 'time-official', hours: 9, minutes: 5 };
      expect(checkNumberAnswer(qMorning, '9:05')).toBe(true);
      expect(checkNumberAnswer(qMorning, '09:05')).toBe(true);
      expect(checkNumberAnswer(qMorning, '9.05')).toBe(true);
      expect(checkNumberAnswer(qMorning, '9:5')).toBe(false);
    });

    it('checks everyday 12-hour time answers ignoring AM/PM', () => {
      const q = { mode: 'time-everyday', hours: 3, minutes: 15 };
      expect(checkNumberAnswer(q, '3:15')).toBe(true);
      expect(checkNumberAnswer(q, '03:15')).toBe(true);
      expect(checkNumberAnswer(q, '3.15')).toBe(true);
      expect(checkNumberAnswer(q, '15:15')).toBe(true);
      expect(checkNumberAnswer(q, '15.15')).toBe(true);
      expect(checkNumberAnswer(q, '4:15')).toBe(false);
      expect(checkNumberAnswer(q, '3:45')).toBe(false);
    });
  });
});
