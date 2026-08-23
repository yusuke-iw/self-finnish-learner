import { replaceNumbersWithFinnishWords } from '../numberToFinnish';
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
