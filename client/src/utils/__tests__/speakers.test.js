import { describe, it, expect } from 'vitest';
import { SPEAKERS, getRandomSpeaker, getSpeakerById, DEFAULT_SPEAKER } from '../speakers';

describe('speakers utility', () => {
  it('should define a list of diverse speaker profiles', () => {
    expect(Array.isArray(SPEAKERS)).toBe(true);
    expect(SPEAKERS.length).toBeGreaterThanOrEqual(4);

    // Each speaker should have essential fields
    SPEAKERS.forEach(speaker => {
      expect(speaker).toHaveProperty('id');
      expect(typeof speaker.id).toBe('string');
      expect(speaker).toHaveProperty('name');
      expect(typeof speaker.name).toBe('string');
      expect(speaker).toHaveProperty('gender');
      expect(['female', 'male']).toContain(speaker.gender);
      expect(speaker).toHaveProperty('pitch');
      expect(typeof speaker.pitch).toBe('number');
      expect(speaker).toHaveProperty('speed');
      expect(typeof speaker.speed).toBe('number');
      expect(speaker).toHaveProperty('voiceName');
      expect(typeof speaker.voiceName).toBe('string');
    });

    // Verify presence of both male and female profiles
    const genders = SPEAKERS.map(s => s.gender);
    expect(genders).toContain('male');
    expect(genders).toContain('female');
  });

  it('should have a valid DEFAULT_SPEAKER', () => {
    expect(DEFAULT_SPEAKER).toBeDefined();
    expect(DEFAULT_SPEAKER.id).toBe('aino');
  });

  it('should get a random speaker from the list', () => {
    const randomSpeaker = getRandomSpeaker();
    expect(randomSpeaker).toBeDefined();
    expect(SPEAKERS.some(s => s.id === randomSpeaker.id)).toBe(true);
  });

  it('should get speaker by id', () => {
    const matti = getSpeakerById('matti');
    expect(matti).toBeDefined();
    expect(matti.id).toBe('matti');
    expect(matti.gender).toBe('male');

    // Unknown id fallback to default
    const fallback = getSpeakerById('unknown_id');
    expect(fallback).toBeDefined();
    expect(fallback.id).toBe(DEFAULT_SPEAKER.id);
  });
});
