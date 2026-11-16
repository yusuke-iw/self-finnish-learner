import { describe, it, expect, beforeEach, vi } from 'vitest';
import { collectFinnishTexts, findMistakeVocabulary, addMistakeWords } from '../sceneMistakes';
import { getWords, addWord } from '../wordBook';

vi.mock('../../services/api', () => ({
  saveProgress: vi.fn().mockResolvedValue({ success: true })
}));

const game = {
  id: 'test-game',
  title: { fi: 'Testi' },
  vocabulary: [
    { word: 'biojäte', translation: 'biowaste', translationJa: '生ごみ' },
    { word: 'pantti', translation: 'deposit', translationJa: 'デポジット' },
    { word: 'lajitella', translation: 'to sort', translationJa: '分別する' }
  ]
};

describe('sceneMistakes', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('collects fi and spoken strings from nested fragments', () => {
    const texts = collectFinnishTexts({ fi: 'a', en: 'x' }, [{ line: { spoken: 'b', ja: 'y' } }], null);
    expect(texts).toEqual(['a', 'b']);
  });

  it('matches inflected vocabulary words in the mistake texts', () => {
    const found = findMistakeVocabulary(game, ['Banaaninkuori kuuluu biojätteeseen.']);
    expect(found.map((e) => e.word)).toEqual(['biojäte']);
  });

  it('adds mistaken words to the word book with their scene source', () => {
    const added = addMistakeWords(game, ['Palauta pullo, niin saat pantin.']);
    expect(added.map((e) => e.word)).toEqual(['pantti']);
    const words = getWords();
    expect(words).toHaveLength(1);
    expect(words[0]).toMatchObject({
      word: 'pantti',
      translation: 'deposit',
      source: { type: 'scene', gameId: 'test-game', title: 'Testi' }
    });
  });

  it('does not duplicate words already in the word book', () => {
    addWord({ word: 'pantti', translation: 'deposit' });
    const added = addMistakeWords(game, ['pantin palautus']);
    expect(added).toEqual([]);
    expect(getWords()).toHaveLength(1);
  });

  it('adds nothing when there were no mistakes', () => {
    expect(addMistakeWords(game, [])).toEqual([]);
    expect(addMistakeWords(game, undefined)).toEqual([]);
    expect(getWords()).toHaveLength(0);
  });
});
