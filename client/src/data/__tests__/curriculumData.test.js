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

  it('findLessonByTitle returns the matching lesson across units', () => {
    const lesson = findLessonByTitle('Ruoka ja Juoma');
    expect(lesson).toBeDefined();
    expect(lesson.id).toBe('l1b');

    const lastLesson = findLessonByTitle(units[3].lessons[0].title);
    expect(lastLesson).toBeDefined();
    expect(lastLesson.id).toBe('l7');
  });

  it('findLessonByTitle returns undefined for unknown or empty title', () => {
    expect(findLessonByTitle('Unknown Title')).toBeUndefined();
    expect(findLessonByTitle('')).toBeUndefined();
    expect(findLessonByTitle(null)).toBeUndefined();
  });
});
