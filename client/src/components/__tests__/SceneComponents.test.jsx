import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import SceneText from '../scenes/SceneText';
import SceneTextToggle from '../scenes/SceneTextToggle';
import InfoCard from '../scenes/InfoCard';
import SceneResult from '../scenes/SceneResult';
import OutfitGame from '../scenes/OutfitGame';
import SortGame from '../scenes/SortGame';
import * as audioModule from '../../utils/audio';
import * as soundModule from '../../utils/feedbackSounds';
import * as statsModule from '../../utils/studyStats';
import { LanguageProvider } from '../../context/LanguageContext';

vi.mock('../../utils/audio', () => ({
  playAudio: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('../../utils/feedbackSounds', () => ({
  playCorrectSound: vi.fn(),
  playIncorrectSound: vi.fn(),
  playLessonCompleteSound: vi.fn()
}));

vi.mock('../../utils/studyStats', async () => {
  const actual = await vi.importActual('../../utils/studyStats');
  return {
    ...actual,
    recordAnswer: vi.fn()
  };
});

describe('Scene UI Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('SceneText', () => {
    const textSample = {
      fi: 'Katso sää',
      selko: 'Katso ulos',
      en: 'Look at the weather',
      ja: '天気を見る'
    };

    it('renders main in fi and sub in en when mode is en', () => {
      const { container } = render(<SceneText text={textSample} mode="en" />);
      expect(container.querySelector('.scene-text-main')?.textContent).toBe('Katso sää');
      expect(container.querySelector('.scene-text-sub')?.textContent).toBe('Look at the weather');
    });

    it('renders main in fi and no sub when mode is fi', () => {
      const { container } = render(<SceneText text={textSample} mode="fi" />);
      expect(container.querySelector('.scene-text-main')?.textContent).toBe('Katso sää');
      expect(container.querySelector('.scene-text-sub')).toBeNull();
    });

    it('renders main in selko and no sub when mode is selko', () => {
      const { container } = render(<SceneText text={textSample} mode="selko" />);
      expect(container.querySelector('.scene-text-main')?.textContent).toBe('Katso ulos');
      expect(container.querySelector('.scene-text-sub')).toBeNull();
    });

    it('renders word variant with main fi and sub en for en mode', () => {
      const wordSample = { fi: 'pipo', en: 'beanie', ja: 'ニット帽' };
      const { container } = render(<SceneText text={wordSample} mode="en" variant="word" />);
      expect(container.querySelector('.scene-text-main')?.textContent).toBe('pipo');
      expect(container.querySelector('.scene-text-sub')?.textContent).toBe('beanie');
    });

    it('renders word variant with main fi and sub ja for ja mode', () => {
      const wordSample = { fi: 'pipo', en: 'beanie', ja: 'ニット帽' };
      const { container } = render(<SceneText text={wordSample} mode="ja" variant="word" />);
      expect(container.querySelector('.scene-text-main')?.textContent).toBe('pipo');
      expect(container.querySelector('.scene-text-sub')?.textContent).toBe('ニット帽');
    });
  });

  describe('SceneTextToggle', () => {
    it('renders fi, selko, en buttons by default, and ja only when showJapanese is true', () => {
      const handleChange = vi.fn();
      const { rerender } = render(
        <LanguageProvider>
          <SceneTextToggle mode="en" onChange={handleChange} showJapanese={false} />
        </LanguageProvider>
      );

      expect(screen.getByRole('button', { name: /FI/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Selko/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /EN/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /JA/i })).toBeNull();

      rerender(
        <LanguageProvider>
          <SceneTextToggle mode="en" onChange={handleChange} showJapanese={true} />
        </LanguageProvider>
      );
      expect(screen.getByRole('button', { name: /JA/i })).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /FI/i }));
      expect(handleChange).toHaveBeenCalledWith('fi');
    });
  });

  describe('InfoCard', () => {
    it('returns null when card is null', () => {
      const { container } = render(<InfoCard card={null} mode="en" />);
      expect(container.firstChild).toBeNull();
    });

    const card = {
      id: 'test-card',
      title: { fi: 'Pukeutuminen', en: 'Dressing', selko: 'Pue vaatteet' },
      body: [
        { fi: 'Laita pipo päähän.', en: 'Put on a beanie.', selko: 'Laita pipo.' },
        { fi: 'Ota takki.', en: 'Take a coat.', selko: 'Ota takki.' }
      ],
      grammarNote: {
        fi: 'pukea + kohde + päälle',
        en: 'pukea + object + päälle',
        selko: 'pukea takki päälle'
      }
    };

    it('renders title, body sentences, audio buttons, and grammar note', () => {
      render(
        <LanguageProvider>
          <InfoCard card={card} mode="en" />
        </LanguageProvider>
      );

      expect(screen.getByText('Pukeutuminen')).toBeInTheDocument();
      expect(screen.getByText('Laita pipo päähän.')).toBeInTheDocument();
      expect(screen.getByText('Put on a beanie.')).toBeInTheDocument();
      expect(screen.getByText('pukea + kohde + päälle')).toBeInTheDocument();

      const audioBtns = screen.getAllByRole('button', { name: /発音を聞く|Listen/i });
      expect(audioBtns.length).toBe(2);

      fireEvent.click(audioBtns[0]);
      expect(audioModule.playAudio).toHaveBeenCalledWith(
        'Laita pipo päähän.',
        'test-card-0',
        'fi-FI',
        1.0,
        expect.anything()
      );
    });

    it('plays selko audio when in selko mode', () => {
      render(
        <LanguageProvider>
          <InfoCard card={card} mode="selko" />
        </LanguageProvider>
      );

      const audioBtns = screen.getAllByRole('button', { name: /発音を聞く|Listen/i });
      fireEvent.click(audioBtns[0]);
      expect(audioModule.playAudio).toHaveBeenCalledWith(
        'Laita pipo.',
        'test-card-0',
        'fi-FI',
        1.0,
        expect.anything()
      );
    });
  });

  describe('SceneResult', () => {
    const game = {
      id: 'vaatteet',
      relatedLessonId: 'l11',
      infoCards: [
        {
          id: 'c1',
          title: { fi: 'Otsikko', en: 'Title' },
          body: [{ fi: 'Lause 1', en: 'Sentence 1' }]
        }
      ],
      vocabulary: [
        { word: 'pipo', translation: 'beanie', translationJa: 'ニット帽' },
        { word: 'takki', translation: 'coat', translationJa: 'コート' }
      ]
    };

    it('renders Valmis!, info cards, vocabulary list, and action buttons', () => {
      const handleRetry = vi.fn();
      const handleNext = vi.fn();

      render(
        <MemoryRouter>
          <LanguageProvider>
            <SceneResult
              game={game}
              mode="en"
              onRetry={handleRetry}
              onNext={handleNext}
              next={{ game: { id: 'next-game', title: { fi: 'Seuraava' } }, number: 2 }}
            />
          </LanguageProvider>
        </MemoryRouter>
      );

      expect(screen.getByText(/Valmis!/)).toBeInTheDocument();
      expect(screen.getByText('Otsikko')).toBeInTheDocument();
      expect(screen.getByText('pipo')).toBeInTheDocument();
      expect(screen.getByText('beanie')).toBeInTheDocument();

      const retryBtn = screen.getByRole('button', { name: /もう一度|Try again/i });
      fireEvent.click(retryBtn);
      expect(handleRetry).toHaveBeenCalled();

      const nextBtn = screen.getByRole('button', { name: /次のおすすめ|Next recommended/i });
      expect(nextBtn).toBeInTheDocument();
      fireEvent.click(nextBtn);
      expect(handleNext).toHaveBeenCalled();

      const listBtn = screen.getByRole('button', { name: /一覧へ|To scenes list/i });
      fireEvent.click(listBtn);
    });

    it('renders cleanly with minimal game data and navigate fallback for next', () => {
      render(
        <MemoryRouter>
          <LanguageProvider>
            <SceneResult
              game={{ id: 'simple' }}
              mode="en"
              onRetry={vi.fn()}
              next={{ game: { id: 'next-simple' }, number: 2 }}
            />
          </LanguageProvider>
        </MemoryRouter>
      );

      expect(screen.getByText(/Valmis!/)).toBeInTheDocument();
      const nextBtn = screen.getByRole('button', { name: /次のおすすめ|Next recommended/i });
      fireEvent.click(nextBtn);
    });
  });

  describe('OutfitGame', () => {
    const miniGame = {
      id: 'vaatteet',
      playLength: 1,
      slots: [
        {
          id: 'paa',
          label: { fi: 'Päässä', en: 'Head' },
          options: [
            { id: 'pipo', icon: '🧶', label: { fi: 'pipo', en: 'beanie' }, wear: { fi: 'Laitan pipon päähän.', en: 'I put on a beanie.' } },
            { id: 'lippis', icon: '🧢', label: { fi: 'lippis', en: 'cap' }, wear: { fi: 'Laitan lippiksen päähän.', en: 'I put on a cap.' } }
          ]
        },
        {
          id: 'ylla',
          label: { fi: 'Päällä', en: 'Body' },
          options: [
            { id: 'talvitakki', icon: '🧥', label: { fi: 'talvitakki', en: 'winter coat' }, wear: { fi: 'Puen talvitakin päälle.', en: 'I put on a coat.' } },
            { id: 't-paita', icon: '👕', label: { fi: 't-paita', en: 'T-shirt' }, wear: { fi: 'Puen t-paidan päälle.', en: 'I put on a T-shirt.' } }
          ]
        }
      ],
      conditions: [
        {
          id: 'pakkanen',
          icon: '❄️',
          temperature: -15,
          weather: { fi: 'Ulkona on pakkasta.', en: "It's freezing outside.", selko: 'On kylmä.' },
          accept: { paa: ['pipo'], ylla: ['talvitakki'] },
          hints: {
            paa: { fi: 'Pakkasella tarvitset pipon.', en: 'You need a beanie in the cold.' },
            ylla: { fi: 'Pakkasella tarvitset talvitakin.', en: 'You need a winter coat.' }
          }
        }
      ]
    };

    it('renders null when there are no conditions in the game', () => {
      const { container } = render(
        <LanguageProvider>
          <OutfitGame game={{ conditions: [] }} mode="en" onFinish={vi.fn()} />
        </LanguageProvider>
      );
      expect(container.firstChild).toBeNull();
    });

    it('requires all slots selected before check button is enabled', () => {
      render(
        <LanguageProvider>
          <OutfitGame game={miniGame} mode="en" onFinish={vi.fn()} />
        </LanguageProvider>
      );

      const checkBtn = screen.getByRole('button', { name: /Lähden ulos!/i });
      expect(checkBtn).toBeDisabled();

      // Click pipo
      const pipoBtn = screen.getByRole('button', { name: /🧶.*pipo/i });
      fireEvent.click(pipoBtn);
      expect(checkBtn).toBeDisabled();

      // Click talvitakki
      const takkiBtn = screen.getByRole('button', { name: /🧥.*talvitakki/i });
      fireEvent.click(takkiBtn);
      expect(checkBtn).toBeEnabled();
    });

    it('shows error hint on wrong choices and calls recordAnswer only once per weather', () => {
      render(
        <LanguageProvider>
          <OutfitGame game={miniGame} mode="en" onFinish={vi.fn()} />
        </LanguageProvider>
      );

      // Select wrong outfit: lippis + t-paita
      fireEvent.click(screen.getByRole('button', { name: /🧢.*lippis/i }));
      fireEvent.click(screen.getByRole('button', { name: /👕.*t-paita/i }));

      const checkBtn = screen.getByRole('button', { name: /Lähden ulos!/i });
      fireEvent.click(checkBtn);

      expect(soundModule.playIncorrectSound).toHaveBeenCalledTimes(1);
      expect(statsModule.recordAnswer).toHaveBeenCalledTimes(1);

      // Hints for wrong slots should appear
      expect(screen.getByText('Pakkasella tarvitset pipon.')).toBeInTheDocument();
      expect(screen.getByText('Pakkasella tarvitset talvitakin.')).toBeInTheDocument();

      // Re-selection clears wrong highlight for that slot
      fireEvent.click(screen.getByRole('button', { name: /🧶.*pipo/i }));
      expect(screen.queryByText('Pakkasella tarvitset pipon.')).toBeNull();

      // Submit again with remaining wrong choice
      fireEvent.click(checkBtn);
      expect(soundModule.playIncorrectSound).toHaveBeenCalledTimes(2);
      // recordAnswer should still have been called only once!
      expect(statsModule.recordAnswer).toHaveBeenCalledTimes(1);
    });

    it('completes the weather on correct selection, shows wear sentences, and finishes', () => {
      const handleFinish = vi.fn();
      render(
        <LanguageProvider>
          <OutfitGame game={miniGame} mode="en" onFinish={handleFinish} />
        </LanguageProvider>
      );

      // Select correct outfit: pipo + talvitakki
      fireEvent.click(screen.getByRole('button', { name: /🧶.*pipo/i }));
      fireEvent.click(screen.getByRole('button', { name: /🧥.*talvitakki/i }));

      const checkBtn = screen.getByRole('button', { name: /Lähden ulos!/i });
      fireEvent.click(checkBtn);

      expect(soundModule.playCorrectSound).toHaveBeenCalledTimes(1);
      expect(statsModule.recordAnswer).toHaveBeenCalledTimes(1);

      // Wear sentences should be displayed
      expect(screen.getByText('Laitan pipon päähän.')).toBeInTheDocument();
      expect(screen.getByText('Puen talvitakin päälle.')).toBeInTheDocument();

      // Audio buttons for wear sentences
      const sentenceAudioBtns = screen.getAllByRole('button', { name: /発音を聞く|Listen/i });
      expect(sentenceAudioBtns.length).toBeGreaterThanOrEqual(2);
      fireEvent.click(sentenceAudioBtns[sentenceAudioBtns.length - 1]);
      expect(audioModule.playAudio).toHaveBeenCalled();

      // Next / Complete button
      const nextBtn = screen.getByRole('button', { name: /次へ|完了|Next|Valmis!/i });
      fireEvent.click(nextBtn);

      expect(soundModule.playLessonCompleteSound).toHaveBeenCalledTimes(1);
      expect(handleFinish).toHaveBeenCalledTimes(1);
    });

    it('plays normal and slow weather audio', () => {
      render(
        <LanguageProvider>
          <OutfitGame game={miniGame} mode="en" onFinish={vi.fn()} />
        </LanguageProvider>
      );

      const normalAudio = screen.getByRole('button', { name: /発音を聞く|Listen$/i });
      fireEvent.click(normalAudio);
      expect(audioModule.playAudio).toHaveBeenCalledWith(
        'Ulkona on pakkasta.',
        'pakkanen',
        'fi-FI',
        1.0,
        expect.anything()
      );

      const slowAudio = screen.getByRole('button', { name: /ゆっくり|slow/i });
      fireEvent.click(slowAudio);
      expect(audioModule.playAudio).toHaveBeenCalledWith(
        'Ulkona on pakkasta.',
        'pakkanen',
        'fi-FI',
        0.6,
        expect.anything()
      );
    });
  });

  describe('OutfitGame accessibility', () => {
    it('groups options per slot with the slot label as name, not the raw id', () => {
      const game = {
        playLength: 1,
        slots: [
          { id: 'paa', label: { fi: 'Päässä', en: 'Head' }, options: [{ id: 'pipo', icon: '🧶', label: { fi: 'pipo', en: 'beanie' } }] }
        ],
        conditions: [{
          id: 'c1', icon: '❄️', temperature: -5,
          weather: { fi: 'Pakkasta.', en: 'Frost.' },
          accept: { paa: ['pipo'] }, hints: {}
        }]
      };
      render(
        <LanguageProvider>
          <OutfitGame game={game} mode="en" onFinish={vi.fn()} />
        </LanguageProvider>
      );
      expect(screen.getByRole('group', { name: 'Päässä' })).toBeInTheDocument();
      expect(screen.queryByRole('radiogroup')).toBeNull();
    });
  });

  describe('SortGame', () => {
    const sortGame = {
      id: 'roskat',
      playLength: 2,
      bins: [
        { id: 'lasi', label: { fi: 'Lasi', en: 'Glass' }, color: '#3fa37a' },
        { id: 'metalli', label: { fi: 'Metalli', en: 'Metal' }, color: '#8a8f98' }
      ],
      items: [
        {
          id: 'purkki', icon: '🫙', binId: 'lasi',
          label: { fi: 'lasipurkki', en: 'glass jar' },
          sentence: { fi: 'Lasipurkki kuuluu lasinkeräykseen.', en: 'A jar goes in glass.' },
          hint: { fi: 'Lasille on oma astia.', en: 'Glass has its own bin.' }
        },
        {
          id: 'tolkki', icon: '🥫', binId: 'metalli',
          label: { fi: 'säilyketölkki', en: 'tin can' },
          sentence: { fi: 'Tölkki kuuluu metallinkeräykseen.', en: 'A can goes in metal.' },
          hint: { fi: 'Tölkki on metallia.', en: 'A can is metal.' }
        }
      ]
    };

    const renderGame = (onFinish = vi.fn(), mode = 'en') =>
      render(
        <LanguageProvider>
          <SortGame game={sortGame} mode={mode} onFinish={onFinish} />
        </LanguageProvider>
      );

    const correctBinName = (container) =>
      container.querySelector('.sort-item-label .scene-text-main').textContent === 'lasipurkki'
        ? /Lasi/
        : /Metalli/;
    const wrongBinName = (container) =>
      container.querySelector('.sort-item-label .scene-text-main').textContent === 'lasipurkki'
        ? /Metalli/
        : /Lasi/;

    it('renders nothing without items and names the bins group', () => {
      const { container } = render(
        <LanguageProvider>
          <SortGame game={{ bins: [], items: [] }} mode="en" onFinish={vi.fn()} />
        </LanguageProvider>
      );
      expect(container.firstChild).toBeNull();
    });

    it('shows the hint and marks the bin on a wrong tap, then lets the player retry', () => {
      const { container } = renderGame();
      expect(screen.getByRole('group')).toBeInTheDocument();

      const wrongBtn = screen.getByRole('button', { name: wrongBinName(container) });
      fireEvent.click(wrongBtn);
      expect(wrongBtn).toHaveClass('wrong-choice');
      expect(wrongBtn).toBeDisabled();
      expect(container.querySelector('.scene-slot-hint')).not.toBeNull();
      expect(soundModule.playIncorrectSound).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole('button', { name: /次へ|Next/ })).toBeNull();

      const rightBtn = screen.getByRole('button', { name: correctBinName(container) });
      fireEvent.click(rightBtn);
      expect(rightBtn).toHaveClass('correct-choice');
      expect(container.querySelector('.scene-slot-hint')).toBeNull();
      expect(soundModule.playCorrectSound).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('button', { name: /次へ|Next/ })).toBeInTheDocument();
    });

    it('records the answer once per item even after wrong taps, and finishes after the last item', () => {
      const onFinish = vi.fn();
      const { container } = renderGame(onFinish);

      for (let i = 0; i < 2; i++) {
        fireEvent.click(screen.getByRole('button', { name: wrongBinName(container) }));
        fireEvent.click(screen.getByRole('button', { name: correctBinName(container) }));
        expect(statsModule.recordAnswer).toHaveBeenCalledTimes(i + 1);
        fireEvent.click(screen.getByRole('button', { name: i === 1 ? /Valmis!/ : /次へ|Next/ }));
      }

      expect(onFinish).toHaveBeenCalledTimes(1);
      expect(soundModule.playLessonCompleteSound).toHaveBeenCalledTimes(1);
    });

    it('plays the item name and the sentence audio', () => {
      const { container } = renderGame();
      fireEvent.click(screen.getByRole('button', { name: /発音を聞く|Listen$/ }));
      expect(audioModule.playAudio).toHaveBeenCalledTimes(1);
      fireEvent.click(screen.getByRole('button', { name: /ゆっくり聞く|Listen slowly/ }));
      expect(audioModule.playAudio.mock.calls[1][3]).toBe(0.6);

      fireEvent.click(screen.getByRole('button', { name: correctBinName(container) }));
      const buttons = screen.getAllByRole('button', { name: /発音を聞く|Listen$/ });
      fireEvent.click(buttons[buttons.length - 1]);
      expect(audioModule.playAudio.mock.calls[2][0]).toMatch(/kuuluu/);
    });
  });
});
