import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import App from '../App';

vi.mock('../services/api');

describe('App Component', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
    localStorage.clear();
  });

  it('opens the word book from its navigation link', async () => {
    window.history.pushState({}, '', '/words');
    render(<App />);
    expect(screen.getByRole('link', { name: /Words|単語帳/ })).toHaveAttribute('href', '/words');
    expect(await screen.findByRole('searchbox')).toBeInTheDocument();
  });

  it('renders without crashing and displays the navbar', () => {
    render(<App />);
    expect(screen.getByText('Finnish Learner')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Passages')).toBeInTheDocument();
  });

  it('renders drill studio when navigating to /grammar/practice', async () => {
    window.history.pushState({}, 'Test page', '/grammar/practice');
    render(<App />);
    expect(await screen.findByText(/🎯 (文法演習スタジオ|Grammar Drill Studio)/i)).toBeInTheDocument();
  });

  it('renders the grammar hub when navigating to /grammar', async () => {
    window.history.pushState({}, 'Grammar page', '/grammar');
    render(<App />);
    expect(await screen.findByRole('heading', { name: /Finnish Grammar & Idioms Curriculum|文法・イディオム体系学習/ })).toBeInTheDocument();
  });

  it('switches UI language when language toggle in navbar is clicked', () => {
    render(<App />);
    const jaBtn = screen.getByRole('button', { name: /日本語/i });
    fireEvent.click(jaBtn);
    expect(screen.getByText('ホーム')).toBeInTheDocument();
    expect(screen.getByText('演習スタジオ')).toBeInTheDocument();

    const enBtn = screen.getByRole('button', { name: /English/i });
    fireEvent.click(enBtn);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Drill Studio')).toBeInTheDocument();
  });

  it('renders Review page when navigating to /review', async () => {
    window.history.pushState({}, 'Review page', '/review');
    render(<App />);
    expect(screen.getByRole('link', { name: /Review|復習/i })).toBeInTheDocument();
    expect(await screen.findByText(/Today's Review|今日の復習/i)).toBeInTheDocument();
  });

  it('renders Numbers practice page when navigating to /numbers', async () => {
    window.history.pushState({}, 'Numbers page', '/numbers');
    render(<App />);
    expect(screen.getByRole('link', { name: /^Numbers$|^数字$/i })).toBeInTheDocument();
    expect(await screen.findByText(/Numbers, Prices & Time Listening|数字・値段・時刻の聞き取り練習/i)).toBeInTheDocument();
  });
});

