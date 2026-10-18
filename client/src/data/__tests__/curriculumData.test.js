import { describe, it, expect } from 'vitest';
import { units, findLessonById, findLessonByTitle } from '../curriculumData';

describe('curriculumData helpers', () => {
  it('findLessonById returns the matching lesson across units', () => {
    const l1 = findLessonById('l1');
    expect(l1).toBeDefined();
    expect(l1.title).toBe('Asiointi ja Matkustaminen');

    const l7 = findLessonById('l7');
    expect(l7).toBeDefined();
    expect(l7.title).toBe('Abstraktit keskustelut');
  });

  it('findLessonById returns undefined for unknown or empty id', () => {
    expect(findLessonById('unknown')).toBeUndefined();
    expect(findLessonById('')).toBeUndefined();
    expect(findLessonById(null)).toBeUndefined();
  });

  it.each([
    ['l8', 'Kaupassa ja apteekissa'],
    ['l9', 'Terveys ja lääkärissä'],
    ['l10', 'Asuminen'],
    ['l11', 'Sää ja vuodenajat'],
    ['l12', 'Virastoissa'],
    ['l13', 'Vapaa-aika ja harrastukset'],
  ])('finds Unit 5 lesson %s by id and title', (id, title) => {
    const unit = units.find((item) => item.id === 5);
    const lesson = findLessonById(id);

    expect(unit.lessons).toHaveLength(6);
    expect(unit.lessons).toContain(lesson);
    expect(lesson).toMatchObject({ id, title });
    expect(findLessonByTitle(title)).toBe(lesson);
  });

  it('keeps unit and lesson identifiers, titles, and colors unique', () => {
    const lessons = units.flatMap((unit) => unit.lessons);

    expect(new Set(units.map((unit) => unit.id)).size).toBe(units.length);
    expect(new Set(units.map((unit) => unit.color)).size).toBe(units.length);
    expect(new Set(lessons.map((lesson) => lesson.id)).size).toBe(lessons.length);
    expect(new Set(lessons.map((lesson) => lesson.title)).size).toBe(lessons.length);
  });

  it('findLessonByTitle returns the matching lesson across units', () => {
    const lesson = findLessonByTitle('Ruoka ja Juoma');
    expect(lesson).toBeDefined();
    expect(lesson.id).toBe('l1b');

    const lastLesson = findLessonByTitle(units.at(-1).lessons.at(-1).title);
    expect(lastLesson).toBeDefined();
    expect(lastLesson.id).toBe('l13');
  });

  it('findLessonByTitle returns undefined for unknown or empty title', () => {
    expect(findLessonByTitle('Unknown Title')).toBeUndefined();
    expect(findLessonByTitle('')).toBeUndefined();
    expect(findLessonByTitle(null)).toBeUndefined();
  });
});
