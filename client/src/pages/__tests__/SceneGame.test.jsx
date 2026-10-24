import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import SceneGame from '../SceneGame';
import { LanguageProvider } from '../../context/LanguageContext';
import * as apiModule from '../../services/api';
import { hasPlayed } from '../../utils/sceneProgress';

vi.mock('../../services/api', () => ({
  saveProgress: vi.fn().mockResolvedValue({ success: true })
}));

vi.mock('../../utils/audio', () => ({
  playAudio: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('../../utils/feedbackSounds', () => ({
  playCorrectSound: vi.fn(),
  playIncorrectSound: vi.fn(),
  playLessonCompleteSound: vi.fn()
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('SceneGame Page', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders not found message with link to scenes list for invalid gameId', () => {
    render(
      <MemoryRouter initialEntries={['/scenes/nonexistent']}>
        <LanguageProvider>
          <Routes>
            <Route path="/scenes/:gameId" element={<SceneGame />} />
          </Routes>
        </LanguageProvider>
      </MemoryRouter>
    );

    expect(screen.getByText(/場面が見つかりません|Scene not found/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /場面一覧へ|Back to scenes/i })).toHaveAttribute('href', '/scenes');
  });

  it('renders outfit game for /scenes/vaatteet, plays through, and marks game as played', async () => {
    render(
      <MemoryRouter initialEntries={['/scenes/vaatteet']}>
        <LanguageProvider>
          <Routes>
            <Route path="/scenes/:gameId" element={<SceneGame />} />
          </Routes>
        </LanguageProvider>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 2, name: /Sää ja vaatteet/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /戻る|Back/i })).toHaveAttribute('href', '/scenes');

    // Play through the 3 conditions in vaatteet
    // For each round, we select the accepted items
    for (let roundIdx = 0; roundIdx < 3; roundIdx++) {
      // Look at weather text to determine condition
      const checkBtn = screen.getByRole('button', { name: /Lähden ulos!/i });

      // If text mentions pakkasta -> pipo, talvitakki, talvikengat, lapaset
      // If text mentions sadetta / sataa vettä -> lippis/ei-paa, sadetakki, kumisaappaat, sateenvarjo/ei-kadet
      // If text mentions helle / 25 -> lippis/ei-paa, t-paita, sandaalit, ei-kadet
      if (screen.queryByText(/pakkasta/i)) {
        fireEvent.click(screen.getByRole('button', { name: /🧶.*pipo/i }));
        fireEvent.click(screen.getByRole('button', { name: /🧥.*talvitakki/i }));
        fireEvent.click(screen.getByRole('button', { name: /🥾.*talvikengät/i }));
        fireEvent.click(screen.getByRole('button', { name: /🧤.*lapaset/i }));
      } else if (screen.queryByText(/sataa vettä/i)) {
        fireEvent.click(screen.getByRole('button', { name: /🧢.*lippis/i }));
        fireEvent.click(screen.getByRole('button', { name: /🧥.*sadetakki/i }));
        fireEvent.click(screen.getByRole('button', { name: /👢.*kumisaappaat/i }));
        fireEvent.click(screen.getByRole('button', { name: /☂️.*sateenvarjo/i }));
      } else {
        // helle
        fireEvent.click(screen.getByRole('button', { name: /🧢.*lippis/i }));
        fireEvent.click(screen.getByRole('button', { name: /👕.*t-paita/i }));
        fireEvent.click(screen.getByRole('button', { name: /🩴.*sandaalit/i }));
        // hands: ei mitään (has icon ➖)
        const handSlot = screen.getByText(/Käsissä/i).closest('.scene-slot');
        const noHandBtn = within(handSlot).getByRole('button', { name: /➖.*ei mitään/i });
        fireEvent.click(noHandBtn);
      }

      fireEvent.click(checkBtn);

      // Click Next / Complete button
      const nextBtn = screen.getByRole('button', { name: /次へ|完了|Next|Valmis!/i });
      fireEvent.click(nextBtn);
    }

    // Now on Result screen
    expect(screen.getByText(/Valmis!/)).toBeInTheDocument();
    expect(hasPlayed('vaatteet')).toBe(true);
    expect(apiModule.saveProgress).toHaveBeenCalled();

    // Related lesson button test
    const lessonBtn = screen.getByRole('button', { name: /このテーマの例文を練習|Practice sentences/i });
    fireEvent.click(lessonBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/sessions?lessonId=l11&level=1');

    // Retry button resets back to OutfitGame
    const retryBtn = screen.getByRole('button', { name: /もう一度|Try again/i });
    fireEvent.click(retryBtn);
    expect(screen.queryByText(/Valmis!/)).toBeNull();
    expect(screen.getByRole('button', { name: /Lähden ulos!/i })).toBeInTheDocument();
  });

  it('allows toggling text mode within the game header', () => {
    render(
      <MemoryRouter initialEntries={['/scenes/vaatteet']}>
        <LanguageProvider>
          <Routes>
            <Route path="/scenes/:gameId" element={<SceneGame />} />
          </Routes>
        </LanguageProvider>
      </MemoryRouter>
    );

    const fiBtn = screen.getByRole('button', { name: /FI/i });
    fireEvent.click(fiBtn);
    expect(screen.getByRole('button', { name: /FI/i })).toHaveClass('active');
  });
});
