import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Scenes from '../Scenes';
import { LanguageProvider } from '../../context/LanguageContext';
import { markGamePlayed } from '../../utils/sceneProgress';
import vaatteet from '../../data/scenes/vaatteet.json';
import { getSceneTextMode, setSceneTextMode } from '../../utils/sceneText';

describe('Scenes Page', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders title, lead text, scene sections, and upcoming games', () => {
    render(
      <MemoryRouter>
        <LanguageProvider>
          <Scenes />
        </LanguageProvider>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: /暮らしの場面|Daily-Life Scenes/i })).toBeInTheDocument();
    expect(screen.getByText(/おすすめの順|recommended order/i)).toBeInTheDocument();

    // Scenes sections
    expect(screen.getByText(/Koti/)).toBeInTheDocument();
    expect(screen.getByText(/Lähiö/)).toBeInTheDocument();
    expect(screen.getByText(/Kaupunki/)).toBeInTheDocument();

    // Outfit game card
    expect(screen.getByText(/Sää ja vaatteet/i)).toBeInTheDocument();

    // Sort and dialogue games are real cards
    expect(screen.getByRole('link', { name: /Jätekatoksessa/i })).toHaveAttribute('href', '/scenes/jatekatos');
    expect(screen.getByRole('link', { name: /Rappukäytävässä/i })).toHaveAttribute('href', '/scenes/rappukaytava');
    expect(screen.getAllByText(/準備中|Coming soon/i).length).toBeGreaterThanOrEqual(1);
  });

  it('displays played checkmark when game has been completed in localStorage', () => {
    markGamePlayed('vaatteet');

    render(
      <MemoryRouter>
        <LanguageProvider>
          <Scenes />
        </LanguageProvider>
      </MemoryRouter>
    );

    const playedBadge = screen.getByLabelText(/プレイ済み|Played/i);
    expect(playedBadge).toBeInTheDocument();
  });

  it('shows no JA button and falls back to English when the saved mode is ja but some game lacks Japanese', () => {
    setSceneTextMode('ja');
    const original = vaatteet.title.ja;
    delete vaatteet.title.ja;
    try {
      render(
        <MemoryRouter>
          <LanguageProvider>
            <Scenes />
          </LanguageProvider>
        </MemoryRouter>
      );
      expect(screen.queryByRole('button', { name: /^JA$/ })).toBeNull();
      expect(screen.getByRole('button', { name: /^EN$/ })).toHaveAttribute('aria-pressed', 'true');
      expect(screen.queryByText('天気と服')).toBeNull();
      expect(screen.getByText('Weather and clothes')).toBeInTheDocument();
    } finally {
      vaatteet.title.ja = original;
    }
  });

  it('allows switching text mode and persists it to localStorage', () => {
    render(
      <MemoryRouter>
        <LanguageProvider>
          <Scenes />
        </LanguageProvider>
      </MemoryRouter>
    );

    const fiBtn = screen.getByRole('button', { name: /FI/i });
    fireEvent.click(fiBtn);
    expect(getSceneTextMode()).toBe('fi');
  });
});
