import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import Review from '../Review';
import { LanguageProvider } from '../../context/LanguageContext';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn()
  };
});

describe('Review Page', () => {
  let mockNavigate;

  beforeEach(() => {
    mockNavigate = vi.fn();
    useNavigate.mockReturnValue(mockNavigate);
    localStorage.clear();
  });

  it('disables start buttons when due counts are 0', () => {
    render(
      <LanguageProvider defaultLanguage="ja">
        <BrowserRouter>
          <Review />
        </BrowserRouter>
      </LanguageProvider>
    );

    expect(screen.getByText('今日の復習')).toBeInTheDocument();
    const startButtons = screen.getAllByRole('button', { name: '始める' });
    expect(startButtons).toHaveLength(2);
    expect(startButtons[0]).toBeDisabled();
    expect(startButtons[1]).toBeDisabled();
  });

  it('displays due counts, upcoming counts, and navigates to sentence and grammar review', () => {
    const now = Date.now();
    const pastIso = new Date(now - 3600 * 1000).toISOString();
    const in12hIso = new Date(now + 12 * 3600 * 1000).toISOString();
    const in3dIso = new Date(now + 3 * 24 * 3600 * 1000).toISOString();

    localStorage.setItem(
      'finnishLearnerReviewSchedule',
      JSON.stringify({
        'sentence:s1': { box: 1, dueAt: pastIso, lastReviewedAt: pastIso, lapses: 1 },
        'sentence:s2': { box: 1, dueAt: pastIso, lastReviewedAt: pastIso, lapses: 1 },
        'grammar:g1': { box: 1, dueAt: pastIso, lastReviewedAt: pastIso, lapses: 1 },
        'sentence:s_1d': { box: 1, dueAt: in12hIso, lastReviewedAt: pastIso, lapses: 1 },
        'grammar:g_3d': { box: 2, dueAt: in3dIso, lastReviewedAt: pastIso, lapses: 1 }
      })
    );

    render(
      <LanguageProvider defaultLanguage="en">
        <BrowserRouter>
          <Review />
        </BrowserRouter>
      </LanguageProvider>
    );

    expect(screen.getByText("Today's Review")).toBeInTheDocument();
    expect(screen.getByText('2 due')).toBeInTheDocument();
    expect(screen.getByText('1 due')).toBeInTheDocument();
    expect(screen.getByText('1 items')).toBeInTheDocument();
    expect(screen.getByText('2 items')).toBeInTheDocument();

    const startButtons = screen.getAllByRole('button', { name: 'Start' });
    expect(startButtons[0]).not.toBeDisabled();
    expect(startButtons[1]).not.toBeDisabled();

    fireEvent.click(startButtons[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/sessions?review=1');

    fireEvent.click(startButtons[1]);
    expect(mockNavigate).toHaveBeenCalledWith('/grammar/practice?review=1');
  });
});
