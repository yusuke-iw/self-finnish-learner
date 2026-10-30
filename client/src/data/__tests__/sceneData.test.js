import { describe, it, expect } from 'vitest';
import scenes from '../scenes/scenes.json';
import vaatteet from '../scenes/vaatteet.json';
import jatekatos from '../scenes/jatekatos.json';
import rappukaytava from '../scenes/rappukaytava.json';
import ajanvaraus from '../scenes/ajanvaraus.json';
import upcoming from '../scenes/upcoming.json';
import { getUpcomingGames, getRecommendedGames } from '../scenes/index';
import { findLessonById } from '../curriculumData';
import { hasJapanese } from '../../utils/sceneText';
import { SPEAKERS } from '../../utils/speakers';

describe('Scene Data Schema & Integrity', () => {
  const games = [vaatteet, jatekatos, rappukaytava, ajanvaraus];

  it('scenes.json items have valid IDs, order, and titles', () => {
    const seenIds = new Set();
    const seenOrders = new Set();

    for (const scene of scenes) {
      expect(scene.id).toMatch(/^[a-z0-9-]+$/);
      expect(seenIds.has(scene.id)).toBe(false);
      seenIds.add(scene.id);

      expect(typeof scene.order).toBe('number');
      expect(seenOrders.has(scene.order)).toBe(false);
      seenOrders.add(scene.order);

      expect(scene.icon).toBeTruthy();
      expect(scene.title?.fi).toBeTruthy();
      expect(scene.title?.en).toBeTruthy();
      expect(Array.isArray(scene.gameIds)).toBe(true);
    }
  });

  it('all gameIds in scenes.json correspond to existing games with matching sceneId', () => {
    const gameMap = new Map(games.map((g) => [g.id, g]));

    for (const scene of scenes) {
      for (const gameId of scene.gameIds) {
        const game = gameMap.get(gameId);
        expect(game).toBeDefined();
        expect(game.sceneId).toBe(scene.id);
      }
    }
  });

  it('games have unique ASCII lowercase/hyphen IDs and known types', () => {
    const seenGameIds = new Set();
    const knownTypes = ['outfit', 'sort', 'dialogue'];

    for (const game of games) {
      expect(game.id).toMatch(/^[a-z0-9-]+$/);
      expect(seenGameIds.has(game.id)).toBe(false);
      seenGameIds.add(game.id);

      expect(knownTypes).toContain(game.type);
      expect(game.schemaVersion).toBe(1);
      expect(game.icon).toBeTruthy();
      expect(game.title?.fi).toBeTruthy();
      expect(game.title?.en).toBeTruthy();
      expect(game.place?.fi).toBeTruthy();
      expect(game.place?.en).toBeTruthy();
      expect(game.instruction?.fi).toBeTruthy();
      expect(game.instruction?.selko).toBeTruthy();
      expect(game.instruction?.en).toBeTruthy();
      expect(typeof game.playLength).toBe('number');
      expect(game.playLength).toBeGreaterThan(0);
    }
  });

  it('relatedLessonId resolves to an existing curriculum lesson', () => {
    for (const game of games) {
      if (game.relatedLessonId) {
        const lesson = findLessonById(game.relatedLessonId);
        expect(lesson).toBeDefined();
        expect(lesson.id).toBe(game.relatedLessonId);
      }
    }
  });

  it('vocabulary has at least 6 entries with valid word and translation', () => {
    for (const game of games) {
      expect(Array.isArray(game.vocabulary)).toBe(true);
      expect(game.vocabulary.length).toBeGreaterThanOrEqual(6);

      for (const v of game.vocabulary) {
        expect(typeof v.word).toBe('string');
        expect(v.word.trim()).not.toBe('');
        expect(typeof v.translation).toBe('string');
        expect(v.translation.trim()).not.toBe('');
      }
    }
  });

  it('infoCards have valid structure and selko where expected', () => {
    for (const game of games) {
      expect(Array.isArray(game.infoCards)).toBe(true);
      expect(game.infoCards.length).toBeGreaterThanOrEqual(1);

      for (const card of game.infoCards) {
        expect(card.id).toMatch(/^[a-z0-9-]+$/);
        expect(card.title?.fi).toBeTruthy();
        expect(card.title?.en).toBeTruthy();
        expect(card.title?.selko).toBeTruthy();

        expect(Array.isArray(card.body)).toBe(true);
        expect(card.body.length).toBeGreaterThan(0);
        for (const sentence of card.body) {
          expect(sentence.fi).toBeTruthy();
          expect(sentence.en).toBeTruthy();
          expect(sentence.selko).toBeTruthy();
        }

        if (card.grammarNote) {
          expect(card.grammarNote.fi).toBeTruthy();
          expect(card.grammarNote.en).toBeTruthy();
          expect(card.grammarNote.selko).toBeTruthy();
        }
      }
    }
  });

  it('outfit games have valid slots, options, accept keys, and hints', () => {
    const outfitGames = games.filter((g) => g.type === 'outfit');

    for (const game of outfitGames) {
      expect(Array.isArray(game.slots)).toBe(true);
      expect(game.slots.length).toBeGreaterThan(0);

      const slotIdSet = new Set(game.slots.map((s) => s.id));
      const optionIdMap = new Map();

      for (const slot of game.slots) {
        expect(slot.label?.fi).toBeTruthy();
        expect(slot.label?.en).toBeTruthy();
        expect(Array.isArray(slot.options)).toBe(true);
        expect(slot.options.length).toBeGreaterThan(0);

        const optionsForSlot = new Set();
        for (const opt of slot.options) {
          expect(opt.id).toMatch(/^[a-z0-9-]+$/);
          expect(opt.icon).toBeTruthy();
          expect(opt.label?.fi).toBeTruthy();
          expect(opt.label?.en).toBeTruthy();
          if (opt.wear) {
            expect(opt.wear.fi).toBeTruthy();
            expect(opt.wear.en).toBeTruthy();
          }
          optionsForSlot.add(opt.id);
        }
        optionIdMap.set(slot.id, optionsForSlot);
      }

      expect(Array.isArray(game.conditions)).toBe(true);
      expect(game.conditions.length).toBeGreaterThanOrEqual(game.playLength);

      for (const cond of game.conditions) {
        expect(cond.id).toMatch(/^[a-z0-9-]+$/);
        expect(cond.icon).toBeTruthy();
        expect(typeof cond.temperature).toBe('number');
        expect(cond.weather?.fi).toBeTruthy();
        expect(cond.weather?.en).toBeTruthy();
        expect(cond.weather?.selko).toBeTruthy();

        // Check accept keys match slots
        expect(Object.keys(cond.accept).sort()).toEqual(Array.from(slotIdSet).sort());
        // Check hints keys match slots
        expect(Object.keys(cond.hints).sort()).toEqual(Array.from(slotIdSet).sort());

        for (const slot of game.slots) {
          const acceptedOptions = cond.accept[slot.id];
          expect(Array.isArray(acceptedOptions)).toBe(true);
          expect(acceptedOptions.length).toBeGreaterThan(0);

          // All accepted options must exist in that slot
          for (const optId of acceptedOptions) {
            expect(optionIdMap.get(slot.id).has(optId)).toBe(true);
          }

          // At least one non-accepted option exists in this slot for this condition
          const totalOptionsCount = optionIdMap.get(slot.id).size;
          expect(acceptedOptions.length).toBeLessThan(totalOptionsCount);

          // Hint must have fi, en, selko
          const hint = cond.hints[slot.id];
          expect(hint?.fi).toBeTruthy();
          expect(hint?.en).toBeTruthy();
          expect(hint?.selko).toBeTruthy();
        }
      }
    }
  });

  it('vaatteet has 6-8 unique weathers, more than playLength so "Try again" can vary', () => {
    const ids = vaatteet.conditions.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBeGreaterThanOrEqual(6);
    expect(ids.length).toBeLessThanOrEqual(8);
    expect(ids.length).toBeGreaterThan(vaatteet.playLength);
  });

  it('sort games have valid bins and items, and every item points to an existing bin', () => {
    const sortGames = games.filter((g) => g.type === 'sort');
    expect(sortGames.length).toBeGreaterThan(0);

    for (const game of sortGames) {
      const binIds = game.bins.map((b) => b.id);
      expect(new Set(binIds).size).toBe(binIds.length);
      for (const bin of game.bins) {
        expect(bin.id).toMatch(/^[a-z0-9-]+$/);
        expect(bin.label?.fi).toBeTruthy();
        expect(bin.label?.en).toBeTruthy();
        expect(bin.color).toMatch(/^#[0-9a-fA-F]{6}$/);
      }

      const itemIds = game.items.map((i) => i.id);
      expect(new Set(itemIds).size).toBe(itemIds.length);
      expect(game.items.length).toBeGreaterThanOrEqual(game.playLength);

      for (const item of game.items) {
        expect(item.id).toMatch(/^[a-z0-9-]+$/);
        expect(item.icon).toBeTruthy();
        expect(binIds).toContain(item.binId);
        expect(item.label?.fi).toBeTruthy();
        expect(item.label?.en).toBeTruthy();
        expect(item.sentence?.fi).toBeTruthy();
        expect(item.sentence?.en).toBeTruthy();
        expect(item.hint?.fi).toBeTruthy();
        expect(item.hint?.en).toBeTruthy();
        expect(item.hint?.selko).toBeTruthy();
      }
    }
  });

  it('jatekatos has 12-16 items, more than playLength, and at least one item per bin', () => {
    const ids = jatekatos.items.map((i) => i.id);
    expect(ids.length).toBeGreaterThanOrEqual(12);
    expect(ids.length).toBeLessThanOrEqual(16);
    expect(ids.length).toBeGreaterThan(jatekatos.playLength);
    for (const bin of jatekatos.bins) {
      expect(jatekatos.items.some((i) => i.binId === bin.id)).toBe(true);
    }
  });

  it('dialogue scenes have 4-6 lines, each with a good reply and at least one other kind', () => {
    for (const dlg of [...rappukaytava.dialogues, ...ajanvaraus.dialogues]) {
      expect(dlg.nodes.length).toBeGreaterThanOrEqual(4);
      expect(dlg.nodes.length).toBeLessThanOrEqual(6);
      for (const node of dlg.nodes) {
        expect(node.choices.some((c) => c.quality !== 'good')).toBe(true);
      }
    }
  });

  it('dialogue games have valid dialogues, nodes, speakers, choices, and reachability', () => {
    const dialogueGames = games.filter((g) => g.type === 'dialogue');
    expect(dialogueGames.length).toBeGreaterThan(0);
    const validQualities = ['good', 'ok', 'bad', 'repeat'];
    const speakerIds = SPEAKERS.map((s) => s.id);

    for (const game of dialogueGames) {
      expect(Array.isArray(game.characters)).toBe(true);
      expect(game.characters.length).toBeGreaterThan(0);
      for (const char of game.characters) {
        expect(char.id).toMatch(/^[a-z0-9-]+$/);
        expect(char.name).toBeTruthy();
        expect(char.icon).toBeTruthy();
        expect(speakerIds).toContain(char.speakerId);
        expect(char.role?.fi).toBeTruthy();
        expect(char.role?.en).toBeTruthy();
        expect(char.role?.ja).toBeTruthy();
      }

      expect(Array.isArray(game.dialogues)).toBe(true);
      expect(game.dialogues.length).toBeGreaterThan(0);

      for (const dlg of game.dialogues) {
        expect(dlg.id).toMatch(/^[a-z0-9-]+$/);
        expect(Array.isArray(dlg.nodes)).toBe(true);
        expect(dlg.nodes.length).toBeGreaterThan(0);

        const nodeMap = new Map(dlg.nodes.map((n) => [n.id, n]));
        expect(nodeMap.has(dlg.startNodeId)).toBe(true);

        for (const node of dlg.nodes) {
          expect(node.id).toMatch(/^[a-z0-9-]+$/);
          expect(game.characters.some((c) => c.id === node.speaker)).toBe(true);

          expect(node.line?.fi).toBeTruthy();
          expect(node.line?.en).toBeTruthy();
          expect(node.line?.spoken).toBeTruthy();
          expect(node.line?.spokenNotes?.en).toBeTruthy();

          expect(Array.isArray(node.choices)).toBe(true);
          expect(node.choices.length).toBeGreaterThan(0);

          const goodChoices = node.choices.filter((c) => c.quality === 'good');
          expect(goodChoices.length).toBeGreaterThanOrEqual(1);

          for (const choice of node.choices) {
            expect(choice.id).toMatch(/^[a-z0-9-]+$/);
            expect(validQualities).toContain(choice.quality);

            expect(choice.text?.fi).toBeTruthy();
            expect(choice.text?.en).toBeTruthy();
            expect(choice.text?.spoken).toBeTruthy();

            expect(choice.feedback?.fi).toBeTruthy();
            expect(choice.feedback?.en).toBeTruthy();
            expect(choice.feedback?.selko).toBeTruthy();

            if (choice.spokenNotes !== undefined) {
              expect(typeof choice.spokenNotes.en).toBe('string');
              expect(choice.spokenNotes.en.trim()).not.toBe('');
              if (choice.spokenNotes.ja !== undefined) {
                expect(typeof choice.spokenNotes.ja).toBe('string');
                expect(choice.spokenNotes.ja.trim()).not.toBe('');
              }
            }

            if (choice.quality === 'good' || choice.quality === 'ok') {
              if (choice.next !== null) {
                expect(nodeMap.has(choice.next)).toBe(true);
              }
            } else {
              expect(choice.next).toBeUndefined();
            }
          }
        }

        // Reachability check from startNodeId
        const reachable = new Set([dlg.startNodeId]);
        const queue = [dlg.startNodeId];
        let canReachEnd = false;

        while (queue.length > 0) {
          const currId = queue.shift();
          const currNode = nodeMap.get(currId);
          if (!currNode) continue;

          for (const choice of currNode.choices) {
            if (choice.quality === 'good' || choice.quality === 'ok') {
              if (choice.next === null) {
                canReachEnd = true;
              } else if (choice.next && !reachable.has(choice.next)) {
                reachable.add(choice.next);
                queue.push(choice.next);
              }
            }
          }
        }

        expect(reachable.size).toBe(dlg.nodes.length);
        expect(canReachEnd).toBe(true);
      }
    }
  });

  it('upcoming games point to a scene, and rappukaytava is no longer an upcoming game in lahio', () => {
    const sceneIds = scenes.map((s) => s.id);
    for (const u of upcoming) {
      expect(sceneIds).toContain(u.sceneId);
      expect(u.title?.fi).toBeTruthy();
      expect(u.title?.en).toBeTruthy();
    }
    expect(getUpcomingGames('lahio').some((u) => u.id === 'rappukaytava')).toBe(false);
  });

  it('kaupunki has the phone-call game as its first game and is no longer marked coming soon', () => {
    const kaupunki = scenes.find((s) => s.id === 'kaupunki');
    expect(kaupunki.gameIds).toContain('ajanvaraus');
    expect(kaupunki.comingSoon).toBeUndefined();
    expect(ajanvaraus.sceneId).toBe('kaupunki');
    expect(ajanvaraus.relatedLessonId).toBe('l9');
  });

  it('ajanvaraus is the 4th recommended game', () => {
    const recs = getRecommendedGames();
    expect(recs[3].game.id).toBe('ajanvaraus');
    expect(recs[3].number).toBe(4);
  });

  it('ajanvaraus has 3 dialogues, each with at least one repeat choice, and only Helmi speaks', () => {
    expect(ajanvaraus.dialogues.map((d) => d.id)).toEqual(['varaa-aika', 'oireet', 'siirra-aika']);
    expect(ajanvaraus.characters.map((c) => c.speakerId)).toEqual(['helmi']);
    for (const dlg of ajanvaraus.dialogues) {
      const choices = dlg.nodes.flatMap((n) => n.choices);
      expect(choices.some((c) => c.quality === 'repeat')).toBe(true);
    }
    expect(ajanvaraus.infoCards.length).toBe(3);
    expect(ajanvaraus.vocabulary.length).toBeGreaterThanOrEqual(10);
    expect(ajanvaraus.vocabulary.length).toBeLessThanOrEqual(12);
  });

  it('the ATM game is announced as upcoming in kaupunki', () => {
    const upcomingKaupunki = getUpcomingGames('kaupunki');
    const atm = upcomingKaupunki.find((u) => u.id === 'pankkiautomaatti');
    expect(atm).toBeDefined();
    expect(atm.number).toBe(5);
    expect(atm.title.fi).toBe('Pankkiautomaatilla');
    expect(upcomingKaupunki.some((u) => u.id === 'ajanvaraus')).toBe(false);
  });

  it('hasJapanese correctly identifies whether games have full Japanese text', () => {
    expect(hasJapanese(vaatteet)).toBe(true);
    expect(hasJapanese(jatekatos)).toBe(true);
    expect(hasJapanese(rappukaytava)).toBe(true);
    expect(hasJapanese(ajanvaraus)).toBe(true);
  });
});
