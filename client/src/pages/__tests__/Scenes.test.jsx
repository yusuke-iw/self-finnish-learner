import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Scenes from '../Scenes';
import { LanguageProvider } from '../../context/LanguageContext';
import { markGamePlayed } from '../../utils/sceneProgress';
import { getSceneTextMode } from '../../utils/sceneText';

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

    // Upcoming games cards (jatekatos and rappukaytava)
    expect(screen.getByText(/Jätekatoksessa/i)).toBeInTheDocument();
    expect(screen.getByText(/Rappukäytävässä/i)).toBeInTheDocument();
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
