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

  it('does not show read-info button for unplayed games, shows it for played games, and opens/closes the info modal via button and Escape', () => {
    const { unmount } = render(
      <MemoryRouter>
        <LanguageProvider>
          <Scenes />
        </LanguageProvider>
      </MemoryRouter>
    );

    expect(screen.queryByRole('button', { name: /説明を読む|Read the notes/i })).toBeNull();
    unmount();

    markGamePlayed('vaatteet');
    render(
      <MemoryRouter>
        <LanguageProvider>
          <Scenes />
        </LanguageProvider>
      </MemoryRouter>
    );

    const readInfoBtn = screen.getByRole('button', { name: /説明を読む|Read the notes/i });
    expect(readInfoBtn).toBeInTheDocument();
    expect(readInfoBtn.closest('a')).toBeNull();

    // Click to open modal
    fireEvent.click(readInfoBtn);
    const dialog = screen.getByRole('dialog', { name: /Sää ja vaatteet/i });
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText('Pukeudu sään mukaan')).toBeInTheDocument();

    // Close via close button
    const closeBtn = screen.getByRole('button', { name: /閉じる|Close/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole('dialog')).toBeNull();

    // Reopen and close via Escape key
    fireEvent.click(readInfoBtn);
    expect(screen.getByRole('dialog', { name: /Sää ja vaatteet/i })).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();

    // Reopen and close via overlay click
    fireEvent.click(readInfoBtn);
    const reopenedDialog = screen.getByRole('dialog', { name: /Sää ja vaatteet/i });
    fireEvent.click(reopenedDialog.parentElement);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('hides read-info button even for played games when infoCards is empty', () => {
    markGamePlayed('vaatteet');
    const originalCards = vaatteet.infoCards;
    vaatteet.infoCards = [];
    try {
      render(
        <MemoryRouter>
          <LanguageProvider>
            <Scenes />
          </LanguageProvider>
        </MemoryRouter>
      );
      expect(screen.queryByRole('button', { name: /説明を読む|Read the notes/i })).toBeNull();
    } finally {
      vaatteet.infoCards = originalCards;
    }
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
