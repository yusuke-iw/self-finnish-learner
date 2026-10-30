import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryRouter, Routes, Route, Link } from 'react-router-dom';
import SceneGame from '../SceneGame';
import { LanguageProvider } from '../../context/LanguageContext';
import * as apiModule from '../../services/api';
import { hasPlayed } from '../../utils/sceneProgress';
import vaatteet from '../../data/scenes/vaatteet.json';
import jatekatos from '../../data/scenes/jatekatos.json';
import rappukaytava from '../../data/scenes/rappukaytava.json';
import ajanvaraus from '../../data/scenes/ajanvaraus.json';
import { setSceneTextMode } from '../../utils/sceneText';
import { hasJapanese } from '../../utils/sceneText';

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

    // Play through playLength rounds. For each round, find the shown weather
    // in the data and pick the first accepted option in every slot.
    for (let roundIdx = 0; roundIdx < vaatteet.playLength; roundIdx++) {
      const checkBtn = screen.getByRole('button', { name: /Lähden ulos!/i });

      const condition = vaatteet.conditions.find((c) => screen.queryByText(c.weather.fi));
      expect(condition).toBeDefined();

      for (const slot of vaatteet.slots) {
        const option = slot.options.find((o) => o.id === condition.accept[slot.id][0]);
        const slotEl = screen.getByText(slot.label.fi).closest('.scene-slot');
        const optionBtn = within(slotEl)
          .getAllByRole('button')
          .find((btn) => btn.textContent.includes(option.label.fi));
        fireEvent.click(optionBtn);
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

  const renderGame = (id) =>
    render(
      <MemoryRouter initialEntries={[`/scenes/${id}`]}>
        <LanguageProvider>
          <Routes>
            <Route path="/scenes/:gameId" element={<SceneGame />} />
          </Routes>
        </LanguageProvider>
      </MemoryRouter>
    );

  it('plays the sort game through with wrong taps, then marks it played and offers no next game', () => {
    renderGame('jatekatos');
    expect(screen.getByRole('heading', { level: 2, name: /Jätekatoksessa/ })).toBeInTheDocument();

    for (let i = 0; i < jatekatos.playLength; i++) {
      const item = jatekatos.items.find((it) => screen.queryByText(it.label.fi));
      expect(item).toBeDefined();
      const wrongBin = jatekatos.bins.find((b) => b.id !== item.binId);
      const rightBin = jatekatos.bins.find((b) => b.id === item.binId);
      const binsGroup = screen.getByRole('group', { name: /ごみの箱|Bins/ });
      const pick = (bin) =>
        within(binsGroup).getAllByRole('button').find((btn) => btn.textContent.includes(bin.label.fi));

      fireEvent.click(pick(wrongBin));
      expect(pick(wrongBin)).toHaveClass('wrong-choice');
      fireEvent.click(pick(rightBin));
      fireEvent.click(screen.getByRole('button', { name: /次へ|完了|Next|Valmis!/i }));
    }

    expect(screen.getByText(/Valmis!/)).toBeInTheDocument();
    expect(hasPlayed('jatekatos')).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: /次のおすすめ|Next recommended/ }));
    expect(mockNavigate).toHaveBeenCalledWith('/scenes/rappukaytava');
    fireEvent.click(screen.getByRole('button', { name: /このテーマの例文を練習|Practice sentences/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/sessions?lessonId=l10&level=1');
  });

  it('starts the next game fresh when the route changes after a finished game', () => {
    render(
      <MemoryRouter initialEntries={['/scenes/jatekatos']}>
        <LanguageProvider>
          <Link to="/scenes/rappukaytava">go-dialogue</Link>
          <Routes>
            <Route path="/scenes/:gameId" element={<SceneGame />} />
          </Routes>
        </LanguageProvider>
      </MemoryRouter>
    );

    for (let i = 0; i < jatekatos.playLength; i++) {
      const item = jatekatos.items.find((it) => screen.queryByText(it.label.fi));
      const rightBin = jatekatos.bins.find((b) => b.id === item.binId);
      const binsGroup = screen.getByRole('group', { name: /ごみの箱|Bins/ });
      fireEvent.click(
        within(binsGroup).getAllByRole('button').find((btn) => btn.textContent.includes(rightBin.label.fi))
      );
      fireEvent.click(screen.getByRole('button', { name: /次へ|完了|Next|Valmis!/i }));
    }
    expect(screen.getByText(/Valmis!/)).toBeInTheDocument();

    fireEvent.click(screen.getByText('go-dialogue'));
    expect(screen.getByRole('heading', { level: 2, name: /Rappukäytävässä/ })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /Reply choices|返事の選択肢/ })).toBeInTheDocument();
    expect(screen.queryByText(/Valmis!/)).toBeNull();
  });

  it('plays the dialogue scene for /scenes/rappukaytava through to the end, then marks it played and offers the phone call next', () => {
    // The scene picks one of the dialogues at random; pin it to the first one
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
    renderGame('rappukaytava');
    expect(screen.getByRole('heading', { level: 2, name: /Rappukäytävässä/ })).toBeInTheDocument();

    const dialogue = rappukaytava.dialogues[0];
    let currNodeId = dialogue.startNodeId;

    while (currNodeId) {
      const node = dialogue.nodes.find((n) => n.id === currNodeId);
      expect(node).toBeDefined();

      const goodChoice = node.choices.find((c) => c.quality === 'good');
      expect(goodChoice).toBeDefined();

      const choiceBtn = screen.getByRole('button', {
        name: new RegExp(goodChoice.text.spoken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      });
      fireEvent.click(choiceBtn);

      const isLast = !goodChoice.next;
      const nextBtn = screen.getByRole('button', { name: isLast ? /Valmis!/ : /次へ|Next/i });
      fireEvent.click(nextBtn);

      currNodeId = goodChoice.next;
    }

    expect(screen.getByText(/Valmis!/)).toBeInTheDocument();
    expect(hasPlayed('rappukaytava')).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: /次のおすすめ|Next recommended/ }));
    expect(mockNavigate).toHaveBeenCalledWith('/scenes/ajanvaraus');
    fireEvent.click(screen.getByRole('button', { name: /このテーマの例文を練習|Practice sentences/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/sessions?lessonId=l10&level=1');
    randomSpy.mockRestore();
  });

  it.each(ajanvaraus.dialogues.map((d, i) => [d.id, i]))(
    'plays the /scenes/ajanvaraus dialogue %s through to the end and offers no next game',
    (_id, index) => {
      // Pin the random pick to this dialogue
      const randomSpy = vi.spyOn(Math, 'random').mockReturnValue((index + 0.5) / ajanvaraus.dialogues.length);
      renderGame('ajanvaraus');
      expect(screen.getByRole('heading', { level: 2, name: /Ajanvaraus puhelimessa/ })).toBeInTheDocument();

      const dialogue = ajanvaraus.dialogues[index];
      let currNodeId = dialogue.startNodeId;

      while (currNodeId) {
        const node = dialogue.nodes.find((n) => n.id === currNodeId);
        expect(node).toBeDefined();

        const goodChoice = node.choices.find((c) => c.quality === 'good');
        const choiceBtn = screen.getByRole('button', {
          name: new RegExp(goodChoice.text.spoken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        });
        fireEvent.click(choiceBtn);

        const isLast = !goodChoice.next;
        fireEvent.click(screen.getByRole('button', { name: isLast ? /Valmis!/ : /次へ|Next/i }));
        currNodeId = goodChoice.next;
      }

      expect(screen.getByText(/Valmis!/)).toBeInTheDocument();
      expect(hasPlayed('ajanvaraus')).toBe(true);
      expect(screen.queryByRole('button', { name: /次のおすすめ|Next recommended/ })).toBeNull();
      fireEvent.click(screen.getByRole('button', { name: /このテーマの例文を練習|Practice sentences/i }));
      expect(mockNavigate).toHaveBeenCalledWith('/sessions?lessonId=l9&level=1');
      randomSpy.mockRestore();
    }
  );

  it('offers the sort game as the next recommended game after the outfit game', () => {
    renderGame('vaatteet');
    for (let roundIdx = 0; roundIdx < vaatteet.playLength; roundIdx++) {
      const condition = vaatteet.conditions.find((c) => screen.queryByText(c.weather.fi));
      for (const slot of vaatteet.slots) {
        const option = slot.options.find((o) => o.id === condition.accept[slot.id][0]);
        const slotEl = screen.getByText(slot.label.fi).closest('.scene-slot');
        fireEvent.click(
          within(slotEl).getAllByRole('button').find((btn) => btn.textContent.includes(option.label.fi))
        );
      }
      fireEvent.click(screen.getByRole('button', { name: /Lähden ulos!/i }));
      fireEvent.click(screen.getByRole('button', { name: /次へ|完了|Next|Valmis!/i }));
    }
    fireEvent.click(screen.getByRole('button', { name: /次のおすすめ|Next recommended/ }));
    expect(mockNavigate).toHaveBeenCalledWith('/scenes/jatekatos');
  });

  it('shows the resolved mode as pressed when the saved mode is ja but the game has no Japanese', () => {
    setSceneTextMode('ja');
    const original = jatekatos.title.ja;
    delete jatekatos.title.ja;
    try {
      expect(hasJapanese(jatekatos)).toBe(false);
      renderGame('jatekatos');
      expect(screen.queryByRole('button', { name: /^JA$/ })).toBeNull();
      expect(screen.getByRole('button', { name: /^EN$/ })).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByRole('button', { name: /^EN$/ })).toHaveClass('active');
    } finally {
      jatekatos.title.ja = original;
    }
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
