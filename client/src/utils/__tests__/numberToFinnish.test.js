import {
  replaceNumbersWithFinnishWords,
  numberToFinnishWord,
  priceToFinnish,
  timeToFinnish
} from '../numberToFinnish';
import { describe, it, expect } from 'vitest';

describe('replaceNumbersWithFinnishWords', () => {
  it('should replace 0 with nolla', () => {
    expect(replaceNumbersWithFinnishWords('0')).toBe('nolla');
  });

  it('should replace single digits', () => {
    expect(replaceNumbersWithFinnishWords('1 kissa')).toBe('yksi kissa');
    expect(replaceNumbersWithFinnishWords('9 koiraa')).toBe('yhdeksän koiraa');
  });

  it('should replace tens', () => {
    expect(replaceNumbersWithFinnishWords('10')).toBe('kymmenen');
    expect(replaceNumbersWithFinnishWords('20')).toBe('kaksikymmentä');
    expect(replaceNumbersWithFinnishWords('90')).toBe('yhdeksänkymmentä');
  });

  it('should replace numbers 11 to 19', () => {
    expect(replaceNumbersWithFinnishWords('11')).toBe('yksitoista');
    expect(replaceNumbersWithFinnishWords('15')).toBe('viisitoista');
    expect(replaceNumbersWithFinnishWords('19')).toBe('yhdeksäntoista');
  });

  it('should replace numbers 21 to 99', () => {
    expect(replaceNumbersWithFinnishWords('21')).toBe('kaksikymmentäyksi');
    expect(replaceNumbersWithFinnishWords('55')).toBe('viisikymmentäviisi');
    expect(replaceNumbersWithFinnishWords('99')).toBe('yhdeksänkymmentäyhdeksän');
  });

  it('should replace hundreds', () => {
    expect(replaceNumbersWithFinnishWords('100')).toBe('sata');
    expect(replaceNumbersWithFinnishWords('105')).toBe('sataviisi');
    expect(replaceNumbersWithFinnishWords('200')).toBe('kaksisataa');
    expect(replaceNumbersWithFinnishWords('999')).toBe('yhdeksänsataayhdeksänkymmentäyhdeksän');
  });

  it('should not replace numbers >= 1000', () => {
    expect(replaceNumbersWithFinnishWords('1000')).toBe('1000');
    expect(replaceNumbersWithFinnishWords('vuonna 2023')).toBe('vuonna 2023');
  });

  it('should handle undefined or null', () => {
    expect(replaceNumbersWithFinnishWords('')).toBe('');
    expect(replaceNumbersWithFinnishWords(null)).toBe(null);
    expect(replaceNumbersWithFinnishWords(undefined)).toBe(undefined);
  });
});

describe('numberToFinnishWord', () => {
  it('should convert thousands and up to 999,999', () => {
    expect(numberToFinnishWord(0)).toBe('nolla');
    expect(numberToFinnishWord(1000)).toBe('tuhat');
    expect(numberToFinnishWord(2000)).toBe('kaksituhatta');
    expect(numberToFinnishWord(1984)).toBe('tuhatyhdeksänsataakahdeksankymmentäneljä');
    expect(numberToFinnishWord(10000)).toBe('kymmenentuhatta');
    expect(numberToFinnishWord(21000)).toBe('kaksikymmentäyksituhatta');
    expect(numberToFinnishWord(100000)).toBe('satatuhatta');
    expect(numberToFinnishWord(999999)).toBe(
      'yhdeksänsataayhdeksänkymmentäyhdeksäntuhattayhdeksänsataayhdeksänkymmentäyhdeksän'
    );
  });

  it('should fallback to string for out-of-range numbers', () => {
    expect(numberToFinnishWord(-1)).toBe('-1');
    expect(numberToFinnishWord(1000000)).toBe('1000000');
  });
});

describe('priceToFinnish', () => {
  it('should convert euros and cents into Finnish price phrases', () => {
    expect(priceToFinnish(12, 50)).toBe('kaksitoista euroa viisikymmentä senttiä');
    expect(priceToFinnish(1, 0)).toBe('yksi euro');
    expect(priceToFinnish(0, 99)).toBe('yhdeksänkymmentäyhdeksän senttiä');
    expect(priceToFinnish(1, 1)).toBe('yksi euro yksi sentti');
    expect(priceToFinnish(5, 0)).toBe('viisi euroa');
    expect(priceToFinnish(0, 1)).toBe('yksi sentti');
  });
});

describe('timeToFinnish', () => {
  it('should convert official 24-hour time to Finnish', () => {
    expect(timeToFinnish(14, 30, 'official')).toBe('kello neljätoista kolmekymmentä');
    expect(timeToFinnish(9, 5, 'official')).toBe('kello yhdeksän nolla viisi');
    expect(timeToFinnish(20, 0, 'official')).toBe('kello kaksikymmentä');
    expect(timeToFinnish(0, 0, 'official')).toBe('kello nolla');
  });

  it('should convert everyday 12-hour time to Finnish', () => {
    expect(timeToFinnish(3, 0, 'everyday')).toBe('kello kolme');
    expect(timeToFinnish(15, 0, 'everyday')).toBe('kello kolme');
    expect(timeToFinnish(3, 15, 'everyday')).toBe('varttia yli kolme');
    expect(timeToFinnish(3, 30, 'everyday')).toBe('puoli neljä');
    expect(timeToFinnish(3, 45, 'everyday')).toBe('varttia vaille neljä');
    expect(timeToFinnish(3, 10, 'everyday')).toBe('kymmenen yli kolme');
    expect(timeToFinnish(3, 50, 'everyday')).toBe('kymmenen vaille neljä');
    expect(timeToFinnish(12, 30, 'everyday')).toBe('puoli yksi');
    expect(timeToFinnish(12, 45, 'everyday')).toBe('varttia vaille yksi');
    expect(timeToFinnish(12, 40, 'everyday')).toBe('kaksikymmentä vaille yksi');
  });
});

