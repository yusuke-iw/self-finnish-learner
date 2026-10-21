const { shuffle } = require('../shuffle');

describe('shuffle', () => {
  it('returns a new array with the same items', () => {
    const input = [1, 2, 3, 4, 5];
    const out = shuffle(input);
    expect(out).not.toBe(input);
    expect([...out].sort()).toEqual(input);
    expect(input).toEqual([1, 2, 3, 4, 5]);
  });
  it('handles empty and single-item arrays', () => {
    expect(shuffle([])).toEqual([]);
    expect(shuffle(['a'])).toEqual(['a']);
  });
  it('is driven by Math.random', () => {
    const spy = jest.spyOn(Math, 'random').mockReturnValue(0);
    expect(shuffle([1, 2, 3])).toEqual([2, 3, 1]);
    spy.mockRestore();
  });
});
