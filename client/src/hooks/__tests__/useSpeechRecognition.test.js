import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSpeechRecognition } from '../useSpeechRecognition';

describe('useSpeechRecognition', () => {
  let instance;

  beforeEach(() => {
    instance = null;
    window.SpeechRecognition = class {
      constructor() {
        instance = this;
        this.start = vi.fn();
      }
    };
  });

  afterEach(() => {
    delete window.SpeechRecognition;
    delete window.webkitSpeechRecognition;
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('alerts and does not record when the browser has no speech recognition', () => {
    delete window.SpeechRecognition;
    delete window.webkitSpeechRecognition;
    const alertSpy = vi.fn();
    vi.stubGlobal('alert', alertSpy);
    const { result } = renderHook(() => useSpeechRecognition(vi.fn()));
    act(() => result.current.startRecording());
    expect(alertSpy).toHaveBeenCalled();
    expect(result.current.isRecording).toBe(false);
  });

  it('configures fi-FI, delivers the transcript with numbers spelled out and stops recording', () => {
    const onTranscript = vi.fn();
    const { result } = renderHook(() => useSpeechRecognition(onTranscript));
    act(() => result.current.startRecording());
    expect(instance.lang).toBe('fi-FI');
    expect(instance.start).toHaveBeenCalled();
    expect(result.current.isRecording).toBe(true);

    act(() => instance.onresult({ results: [[{ transcript: 'minulla on 2 koiraa' }]] }));
    expect(onTranscript).toHaveBeenCalledTimes(1);
    expect(onTranscript.mock.calls[0][0]).not.toMatch(/\d/);
    expect(result.current.isRecording).toBe(false);
  });

  it('uses the webkit prefix when the standard constructor is missing', () => {
    delete window.SpeechRecognition;
    window.webkitSpeechRecognition = class {
      constructor() {
        instance = this;
        this.start = vi.fn();
      }
    };
    const { result } = renderHook(() => useSpeechRecognition(vi.fn()));
    act(() => result.current.startRecording());
    expect(instance.start).toHaveBeenCalled();
  });

  it('stops recording on error and on end', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useSpeechRecognition(vi.fn()));
    act(() => result.current.startRecording());
    act(() => instance.onerror({ error: 'no-speech' }));
    expect(result.current.isRecording).toBe(false);

    act(() => result.current.startRecording());
    expect(result.current.isRecording).toBe(true);
    act(() => instance.onend());
    expect(result.current.isRecording).toBe(false);
  });
});
