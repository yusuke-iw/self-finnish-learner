import { describe, it, expect, beforeEach, vi } from 'vitest';
import { collectFinnishTexts, correctChoices, findMistakeVocabulary, addMistakeWords } from '../sceneMistakes';
import { findGameById } from '../../data/scenes/index';
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

describe('mistake texts per game type (scope of what gets learned)', () => {
  const sceneGame = (id) => findGameById(id);
  const wrongSort = (g, keep) => g.items.flatMap((i) => collectFinnishTexts(...keep(i)));
  const wrongProcedure = (g) =>
    g.procedures.flatMap((p) =>
      p.steps.flatMap((s) => collectFinnishTexts(s.question, (s.buttons || []).filter((b) => b.correct)))
    );
  const wrongOutfit = (g) =>
    g.conditions.flatMap((c) =>
      Object.keys(c.accept).flatMap((slotId) => {
        const slot = g.slots.find((s) => s.id === slotId);
        return collectFinnishTexts(slot.options.filter((o) => c.accept[slotId].includes(o.id)));
      })
    );
  const wrongDialogue = (g) =>
    g.dialogues.flatMap((d) => d.nodes.flatMap((n) => collectFinnishTexts(correctChoices(n))));
  const learned = (id, texts) => findMistakeVocabulary(sceneGame(id), texts).map((e) => e.word);

  it('sort: the hint no longer pulls in other places (mista-apua, ampiaisen-pisto)', () => {
    const g = sceneGame('mista-apua');
    const item = g.items.find((i) => i.id === 'ampiaisen-pisto');
    const texts = collectFinnishTexts(item.label, item.sentence);
    expect(learned('mista-apua', texts)).not.toContain('apteekki');
    expect(learned('mista-apua', collectFinnishTexts(item.label, item.sentence, item.hint))).toContain('apteekki');
  });

  it('procedure: one wrong answer learns far fewer words than the whole screen did', () => {
    const g = sceneGame('laskut');
    const step = g.procedures[0].steps[0];
    const texts = collectFinnishTexts(step.question, step.buttons.filter((b) => b.correct));
    const oldTexts = collectFinnishTexts(g.procedures[0].goal, step.question, step.screen, step.buttons);
    expect(learned('laskut', texts).length).toBeLessThan(learned('laskut', oldTexts).length);
    expect(learned('laskut', texts).length).toBeLessThanOrEqual(2);
  });

  it('outfit: weather sentence and hints (räntä, pipo) are not learned by an unrelated slot', () => {
    const g = sceneGame('vaatteet');
    const c = g.conditions.find((x) => x.id === 'kova-pakkanen');
    const slotOptions = g.slots.find((s) => s.id === 'ylla').options.filter((o) => c.accept.ylla.includes(o.id));
    const words = learned('vaatteet', collectFinnishTexts(slotOptions));
    expect(words).not.toContain('pipo');
  });

  it('dialogue: the correct phrase is learned, not the wrong one', () => {
    const node = {
      id: 'n1',
      line: { fi: 'Haluatko kahvia?' },
      choices: [
        { id: 'a', quality: 'good', fi: 'Ei kestä' },
        { id: 'b', quality: 'bad', fi: 'Ei kiitos' }
      ]
    };
    expect(collectFinnishTexts(correctChoices(node))).toEqual(['Ei kestä']);
    expect(correctChoices({ choices: [{ quality: 'ok', fi: 'Joo' }, { quality: 'bad', fi: 'Ei' }] })).toHaveLength(1);
  });

  it('reports words learned when every question is answered wrong (new rule)', () => {
    const counts = {
      jatekatos: learned('jatekatos', wrongSort(sceneGame('jatekatos'), (i) => [i.label, i.sentence])).length,
      mistaApua: learned('mista-apua', wrongSort(sceneGame('mista-apua'), (i) => [i.label, i.sentence])).length,
      laskut: learned('laskut', wrongProcedure(sceneGame('laskut'))).length,
      vaatteet: learned('vaatteet', wrongOutfit(sceneGame('vaatteet'))).length,
      rappukaytava: learned('rappukaytava', wrongDialogue(sceneGame('rappukaytava'))).length
    };
    console.info('all-wrong counts', JSON.stringify(counts));
    for (const n of Object.values(counts)) expect(n).toBeGreaterThan(0);
  });
});
