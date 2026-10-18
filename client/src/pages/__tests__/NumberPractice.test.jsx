import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import NumberPractice from '../NumberPractice';
import { BrowserRouter } from 'react-router-dom';
import { playAudio } from '../../utils/audio';

vi.mock('../../utils/audio', () => ({
  playAudio: vi.fn()
}));

describe('NumberPractice Page', () => {
  let randomSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // 0.42 * 100 = 42 -> number 42 ("neljäkymmentäkaksi")
    randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.42);
  });

  afterEach(() => {
    randomSpy.mockRestore();
  });

  it('displays a question, auto-plays audio, and marks correct answer as correct', () => {
    render(
      <BrowserRouter>
        <NumberPractice />
      </BrowserRouter>
    );

    expect(playAudio).toHaveBeenCalledTimes(1);
    expect(playAudio).toHaveBeenCalledWith(
      'neljäkymmentäkaksi',
      'neljäkymmentäkaksi',
      'fi-FI',
      1.0,
      expect.any(Object)
    );

    // Replay buttons (normal and 0.6x slow)
    fireEvent.click(screen.getByTitle('Listen (Normal Speed)'));
    expect(playAudio).toHaveBeenLastCalledWith(
      'neljäkymmentäkaksi',
      'neljäkymmentäkaksi',
      'fi-FI',
      1.0,
      expect.any(Object)
    );

    fireEvent.click(screen.getByTitle('Listen (Slow)'));
    expect(playAudio).toHaveBeenLastCalledWith(
      'neljäkymmentäkaksi',
      'neljäkymmentäkaksi',
      'fi-FI',
      0.6,
      expect.any(Object)
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '42' } });
    fireEvent.click(screen.getByRole('button', { name: /Check|回答/i }));

    expect(screen.getByText(/Correct!|正解！/)).toBeInTheDocument();
    expect(screen.getByText(/42/)).toBeInTheDocument();
    expect(screen.getByText(/neljäkymmentäkaksi/)).toBeInTheDocument();

    const stats = JSON.parse(localStorage.getItem('finnishLearnerStudyStats'));
    expect(Object.values(stats.days)[0]).toBe(1);
  });

  it('marks wrong number as incorrect and shows the correct number and Finnish text', () => {
    render(
      <BrowserRouter>
        <NumberPractice />
      </BrowserRouter>
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '99' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(screen.getByText(/Incorrect|不正解/)).toBeInTheDocument();
    expect(screen.getByText(/42/)).toBeInTheDocument();
    expect(screen.getByText(/neljäkymmentäkaksi/)).toBeInTheDocument();
  });

  it('switches modes and finishes a 10-question set with score summary and retry button', () => {
    render(
      <BrowserRouter>
        <NumberPractice />
      </BrowserRouter>
    );

    // Switch to everyday 12h time mode
    // With Math.random() = 0.42: h = floor(0.42 * 12) + 1 = 6, m = floor(0.42 * 60) = 25 -> 6:25
    fireEvent.click(screen.getByRole('button', { name: /Time \(12h Everyday\)|時刻（日常・12時間）/i }));

    for (let i = 0; i < 10; i++) {
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: i < 8 ? '18:25' : '1:00' } });
      fireEvent.click(screen.getByRole('button', { name: /Check|回答/i }));
      fireEvent.click(screen.getByRole('button', { name: /Next|次へ/i }));
    }

    expect(screen.getByText(/8 \/ 10|10問中 8問正解/)).toBeInTheDocument();

    const retryBtn = screen.getByRole('button', { name: /Try Again|もう一度/i });
    fireEvent.click(retryBtn);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});
