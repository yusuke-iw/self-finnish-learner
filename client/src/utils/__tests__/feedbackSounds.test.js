import { playCorrectSound, playIncorrectSound, playLessonCompleteSound } from '../feedbackSounds';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('feedbackSounds utility', () => {
  let mockContext;
  let mockOscillator;
  let mockGain;

  beforeEach(() => {
    mockOscillator = {
      type: '',
      frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn()
    };

    mockGain = {
      gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
      connect: vi.fn()
    };

    mockContext = {
      currentTime: 0,
      createOscillator: vi.fn().mockReturnValue(mockOscillator),
      createGain: vi.fn().mockReturnValue(mockGain),
      destination: {}
    };

    global.window = {
      AudioContext: vi.fn().mockImplementation(() => mockContext)
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    delete global.window.AudioContext;
  });

  it('should play correct sound sequence', () => {
    playCorrectSound();
    expect(mockContext.createOscillator).toHaveBeenCalled();
    expect(mockContext.createGain).toHaveBeenCalled();
    expect(mockOscillator.start).toHaveBeenCalled();
    expect(mockOscillator.stop).toHaveBeenCalled();
  });

  it('should play incorrect sound sequence', () => {
    playIncorrectSound();
    expect(mockContext.createOscillator).toHaveBeenCalled();
    expect(mockContext.createGain).toHaveBeenCalled();
    expect(mockOscillator.start).toHaveBeenCalled();
    expect(mockOscillator.stop).toHaveBeenCalled();
  });

  it('should play lesson complete sound without errors', () => {
    expect(() => {
      playLessonCompleteSound();
    }).not.toThrow();
  });

  it('should handle lack of AudioContext gracefully', () => {
    delete global.window.AudioContext;
    global.window.webkitAudioContext = undefined;

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => playCorrectSound()).not.toThrow();
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
