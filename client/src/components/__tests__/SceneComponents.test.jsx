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
import DialogueScene from '../scenes/DialogueScene';
import ProcedureSim from '../scenes/ProcedureSim';
import * as audioModule from '../../utils/audio';
import * as soundModule from '../../utils/feedbackSounds';
import * as statsModule from '../../utils/studyStats';
import * as wordBookModule from '../../utils/wordBook';
import { LanguageProvider } from '../../context/LanguageContext';

vi.mock('../../services/api', () => ({
  saveProgress: vi.fn().mockResolvedValue({})
}));

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
    localStorage.clear();
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
      title: { fi: 'Sää ja vaatteet', en: 'Weather and clothes', ja: '天気と服' },
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

    it('adds a vocabulary word to the word book and updates button to added and disabled', () => {
      const addWordSpy = vi.spyOn(wordBookModule, 'addWord');

      render(
        <MemoryRouter>
          <LanguageProvider>
            <SceneResult game={game} mode="en" onRetry={vi.fn()} />
          </LanguageProvider>
        </MemoryRouter>
      );

      const addButtons = screen.getAllByRole('button', { name: /＋単語帳|\+ Words/i });
      expect(addButtons).toHaveLength(2);
      expect(addButtons[0]).toBeEnabled();

      fireEvent.click(addButtons[0]);

      expect(addWordSpy).toHaveBeenCalledWith({
        word: 'pipo',
        translation: 'beanie',
        translationJa: 'ニット帽',
        source: {
          type: 'scene',
          gameId: 'vaatteet',
          title: 'Sää ja vaatteet'
        }
      });

      const addedBtn = screen.getByRole('button', { name: /✓ 追加済み|✓ Added/i });
      expect(addedBtn).toBeDisabled();
      expect(screen.getAllByRole('button', { name: /＋単語帳|\+ Words/i })).toHaveLength(1);
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

    it('uses the default prompt and bins label, or the ones in the game data in the UI language', () => {
      const { unmount } = renderGame();
      expect(screen.getByText(/どの箱に入れる？|Which bin does it go in\?/)).toBeInTheDocument();
      expect(screen.getByRole('group', { name: /ごみの箱|Bins/ })).toBeInTheDocument();
      unmount();

      const officeGame = {
        ...sortGame,
        prompt: { en: 'Which office handles it?', ja: 'どの役所で手続きする？' },
        binsLabel: { en: 'Offices', ja: '役所' }
      };
      for (const [lang, prompt, binsLabel] of [
        ['en', 'Which office handles it?', 'Offices'],
        ['ja', 'どの役所で手続きする？', '役所']
      ]) {
        const view = render(
          <LanguageProvider defaultLanguage={lang}>
            <SortGame game={officeGame} mode="en" onFinish={vi.fn()} />
          </LanguageProvider>
        );
        expect(screen.getByText(prompt)).toBeInTheDocument();
        expect(screen.getByRole('group', { name: binsLabel })).toBeInTheDocument();
        expect(screen.queryByText(/どの箱に入れる？|Which bin does it go in\?/)).toBeNull();
        view.unmount();
      }
    });
  });

  describe('DialogueScene', () => {
    const miniDialogueGame = {
      id: 'test-dialogue',
      characters: [
        {
          id: 'naapuri',
          name: 'Matti',
          icon: '👨',
          speakerId: 'matti',
          role: { fi: 'naapuri', en: 'neighbour', ja: '近所の人' }
        }
      ],
      dialogues: [
        {
          id: 'd1',
          startNodeId: 'n1',
          nodes: [
            {
              id: 'n1',
              speaker: 'naapuri',
              line: {
                fi: 'Hei, oletko uusi naapuri?',
                spoken: 'Moi, ootko uus naapuri?',
                en: 'Hi, are you the new neighbour?',
                ja: 'こんにちは、新しい近所の人？',
                spokenNotes: {
                  en: 'hei -> moi, oletko -> ootko, uusi -> uus',
                  ja: 'hei -> moi、oletko -> ootko、uusi -> uus'
                }
              },
              choices: [
                {
                  id: 'c1-good',
                  quality: 'good',
                  next: 'n2',
                  text: {
                    fi: 'Kyllä, muutin tänne eilen.',
                    spoken: 'Joo, muutin tänne eilen.',
                    en: 'Yes, I moved here yesterday.',
                    ja: 'はい、昨日ここに越してきました。'
                  },
                  feedback: {
                    fi: 'Hyvä vastaus!',
                    selko: 'Selko: Hyvä vastaus!',
                    en: 'Good answer!',
                    ja: '良い返事です！'
                  }
                },
                {
                  id: 'c1-bad',
                  quality: 'bad',
                  text: {
                    fi: 'Ei kiitos.',
                    spoken: 'Ei kiitti.',
                    en: 'No, thank you.',
                    ja: 'いいえ、結構です。'
                  },
                  feedback: {
                    fi: 'Ei kiitos ei sovi tähän.',
                    selko: 'Selko: Ei sovi.',
                    en: 'Ei kiitos does not fit here.',
                    ja: '「Ei kiitos」は合いません。'
                  }
                },
                {
                  id: 'c1-repeat',
                  quality: 'repeat',
                  text: {
                    fi: 'Anteeksi, mitä?',
                    spoken: 'Sori, mitä?',
                    en: 'Sorry, what?',
                    ja: 'すみません、何ですか？'
                  },
                  feedback: {
                    fi: 'Naapuri toistaa hitaammin.',
                    selko: 'Selko: Toistetaan.',
                    en: 'The neighbour repeats more slowly.',
                    ja: 'もう一度ゆっくり言ってくれます。'
                  }
                }
              ]
            },
            {
              id: 'n2',
              speaker: 'naapuri',
              line: {
                fi: 'Tervetuloa taloon!',
                spoken: 'Tervetuloa taloon!',
                en: 'Welcome to the building!',
                ja: 'ようこそ！',
                spokenNotes: { en: 'Same in speech', ja: '会話でも同じ' }
              },
              choices: [
                {
                  id: 'c2-good',
                  quality: 'good',
                  next: 'n3',
                  text: {
                    fi: 'Kiitos paljon!',
                    spoken: 'Kiitti paljon!',
                    en: 'Thanks a lot!',
                    ja: 'どうもありがとう！'
                  },
                  feedback: {
                    fi: 'Loistavaa!',
                    selko: 'Selko: Loistavaa!',
                    en: 'Great!',
                    ja: '素晴らしい！'
                  }
                },
                {
                  id: 'c2-ok',
                  quality: 'ok',
                  next: 'n3',
                  text: {
                    fi: 'Joo.',
                    spoken: 'Joo.',
                    en: 'Yeah.',
                    ja: 'うん。'
                  },
                  feedback: {
                    fi: 'Käy, mutta vähän lyhyt.',
                    selko: 'Selko: Vähän lyhyt.',
                    en: 'Works, but a bit brief.',
                    ja: '通じますが少し短いです。'
                  },
                  spokenNotes: {
                    en: 'Choice-specific spoken note',
                    ja: '選択肢ごとの口語メモ'
                  }
                },
                {
                  id: 'c2-bad',
                  quality: 'bad',
                  text: {
                    fi: 'Näkemiin!',
                    spoken: 'Moi moi!',
                    en: 'Goodbye!',
                    ja: 'さようなら！'
                  },
                  feedback: {
                    fi: 'Keskustelu jatkuu vielä.',
                    selko: 'Selko: Ei lopu vielä.',
                    en: 'The conversation continues.',
                    ja: '会話はまだ続きます。'
                  }
                }
              ]
            },
            {
              id: 'n3',
              speaker: 'naapuri',
              line: {
                fi: 'Nähdään taas!',
                spoken: 'Nähdään taas!',
                en: 'See you again!',
                ja: 'また会いましょう！'
              },
              choices: [
                {
                  id: 'c3-good',
                  quality: 'good',
                  next: null,
                  text: {
                    fi: 'Näkemiin!',
                    spoken: 'Moi moi!',
                    en: 'Bye bye!',
                    ja: 'またね！'
                  },
                  feedback: {
                    fi: 'Hyvää päivänjatkoa!',
                    selko: 'Selko: Hyvää päivää!',
                    en: 'Have a nice day!',
                    ja: '良い一日を！'
                  }
                }
              ]
            }
          ]
        }
      ]
    };

    const renderDialogue = (onFinish = vi.fn(), mode = 'en') =>
      render(
        <LanguageProvider>
          <DialogueScene game={miniDialogueGame} mode={mode} onFinish={onFinish} />
        </LanguageProvider>
      );

    it('renders nothing when game has no dialogues', () => {
      const { container } = render(
        <LanguageProvider>
          <DialogueScene game={{ id: 'empty' }} mode="en" onFinish={vi.fn()} />
        </LanguageProvider>
      );
      expect(container.firstChild).toBeNull();
    });

    it('defaults to puhekieli, switches to kirjakieli, and preserves visited progress', () => {
      renderDialogue();

      // Initially puhekieli form is rendered
      expect(screen.getByText('Moi, ootko uus naapuri?')).toBeInTheDocument();
      expect(screen.getByText('Joo, muutin tänne eilen.')).toBeInTheDocument();
      expect(screen.getByText('1 / 3')).toBeInTheDocument();

      const spokenToggle = screen.getByRole('button', { name: /^puhekieli$/i });
      const writtenToggle = screen.getByRole('button', { name: /^kirjakieli$/i });
      expect(spokenToggle).toHaveAttribute('aria-pressed', 'true');
      expect(writtenToggle).toHaveAttribute('aria-pressed', 'false');

      // Switch to kirjakieli
      fireEvent.click(writtenToggle);
      expect(screen.getByText('Hei, oletko uusi naapuri?')).toBeInTheDocument();
      expect(screen.getByText('Kyllä, muutin tänne eilen.')).toBeInTheDocument();
      expect(writtenToggle).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByText('1 / 3')).toBeInTheDocument();
    });

    it('auto-plays speaker audio on node entry once, does not re-play on speech toggle, plays again on next node', () => {
      renderDialogue();

      // Auto-played once on entry with Matti's voice
      expect(audioModule.playAudio).toHaveBeenCalledTimes(1);
      expect(audioModule.playAudio.mock.calls[0][0]).toBe('Moi, ootko uus naapuri?');
      expect(audioModule.playAudio.mock.calls[0][3]).toBe(1.0);
      expect(audioModule.playAudio.mock.calls[0][4].id).toBe('matti');

      // Toggling to kirjakieli does not re-trigger playback
      const writtenToggle = screen.getByRole('button', { name: /^kirjakieli$/i });
      fireEvent.click(writtenToggle);
      expect(audioModule.playAudio).toHaveBeenCalledTimes(1);

      // Advance to next node
      const goodChoice = screen.getByRole('button', { name: /Kyllä, muutin tänne eilen/i });
      fireEvent.click(goodChoice);
      const nextBtn = screen.getByRole('button', { name: /次へ|Next/i });
      fireEvent.click(nextBtn);

      // Second auto-play occurs for node 2
      expect(audioModule.playAudio).toHaveBeenCalledTimes(2);
      expect(audioModule.playAudio.mock.calls[1][0]).toBe('Tervetuloa taloon!');
      expect(audioModule.playAudio.mock.calls[1][4].id).toBe('matti');
    });

    it('repeat choice plays audio at speed 0.6, stays on same node, and does not record answer', () => {
      renderDialogue();

      const repeatBtn = screen.getByRole('button', { name: /Sori, mitä\?/i });
      fireEvent.click(repeatBtn);

      // Audio played for repeat at speed 0.6
      expect(audioModule.playAudio).toHaveBeenCalledTimes(2);
      expect(audioModule.playAudio.mock.calls[1][3]).toBe(0.6);
      expect(statsModule.recordAnswer).not.toHaveBeenCalled();

      // Still on node 1
      expect(screen.getByText('1 / 3')).toBeInTheDocument();
      expect(screen.getByText('Naapuri toistaa hitaammin.')).toBeInTheDocument();
      expect(repeatBtn).not.toBeDisabled();
    });

    it('bad choice disables only that button with wrong-choice, calls recordAnswer once; subsequent good does not call recordAnswer again', () => {
      renderDialogue();

      const badBtn = screen.getByRole('button', { name: /Ei kiitti/i });
      const goodBtn = screen.getByRole('button', { name: /Joo, muutin tänne eilen/i });

      fireEvent.click(badBtn);
      expect(badBtn).toHaveClass('wrong-choice');
      expect(badBtn).toBeDisabled();
      expect(goodBtn).not.toBeDisabled();
      expect(soundModule.playIncorrectSound).toHaveBeenCalledTimes(1);
      expect(statsModule.recordAnswer).toHaveBeenCalledTimes(1);

      // Now click good
      fireEvent.click(goodBtn);
      expect(goodBtn).toHaveClass('correct-choice');
      expect(soundModule.playCorrectSound).toHaveBeenCalledTimes(1);
      // recordAnswer should still be called only once
      expect(statsModule.recordAnswer).toHaveBeenCalledTimes(1);
    });

    it('good choice shows correct-choice, other variant, spokenNotes, and next button; ok choice shows better reply', () => {
      renderDialogue();

      const goodBtn = screen.getByRole('button', { name: /Joo, muutin tänne eilen/i });
      fireEvent.click(goodBtn);

      expect(goodBtn).toHaveClass('correct-choice');
      // All choices disabled after good answer
      screen.getAllByRole('button', { name: /Joo, muutin|Ei kiitti|Sori, mitä/i }).forEach((btn) => {
        expect(btn).toBeDisabled();
      });

      // Written variant and spoken notes are displayed
      expect(screen.getByText(/📖 Written:|📖 書き言葉:/)).toBeInTheDocument();
      expect(screen.getByText(/Kyllä, muutin tänne eilen/)).toBeInTheDocument();
      expect(screen.getByText(/hei -> moi, oletko -> ootko/)).toBeInTheDocument();

      // Click next to node 2
      fireEvent.click(screen.getByRole('button', { name: /次へ|Next/i }));
      expect(screen.getByText('2 / 3')).toBeInTheDocument();

      // Select ok choice on node 2
      const okBtn = screen.getByRole('button', { name: /^Joo\./i });
      fireEvent.click(okBtn);

      expect(okBtn).toHaveClass('correct-choice');
      expect(soundModule.playCorrectSound).toHaveBeenCalled();
      // "A more natural reply" should display the good choice text
      expect(screen.getByText(/A more natural reply|もっと自然な返事/)).toBeInTheDocument();
      expect(screen.getAllByText(/Kiitti paljon!/).length).toBeGreaterThanOrEqual(2);
      // Choice-level spokenNotes takes priority over node-level spokenNotes
      expect(screen.getByText('Choice-specific spoken note')).toBeInTheDocument();
      expect(screen.queryByText('Same in speech')).toBeNull();
    });

    it('falls back to node spokenNotes when chosen reply has no spokenNotes', () => {
      renderDialogue();

      // Advance from node 1 to node 2
      fireEvent.click(screen.getByRole('button', { name: /Joo, muutin tänne eilen/i }));
      fireEvent.click(screen.getByRole('button', { name: /次へ|Next/i }));

      // Select good choice on node 2 (which has no choice.spokenNotes)
      fireEvent.click(screen.getByRole('button', { name: /Kiitti paljon!/i }));
      expect(screen.getByText('Same in speech')).toBeInTheDocument();
    });

    it('last node shows Valmis! and calls onFinish with playLessonCompleteSound', () => {
      const onFinish = vi.fn();
      renderDialogue(onFinish);

      // Node 1
      fireEvent.click(screen.getByRole('button', { name: /Joo, muutin tänne eilen/i }));
      fireEvent.click(screen.getByRole('button', { name: /次へ|Next/i }));

      // Node 2
      fireEvent.click(screen.getByRole('button', { name: /Kiitti paljon!/i }));
      fireEvent.click(screen.getByRole('button', { name: /次へ|Next/i }));

      // Node 3 (final)
      expect(screen.getByText('3 / 3')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /Moi moi!/i }));

      const doneBtn = screen.getByRole('button', { name: /Valmis!/i });
      expect(doneBtn).toBeInTheDocument();

      fireEvent.click(doneBtn);
      expect(soundModule.playLessonCompleteSound).toHaveBeenCalledTimes(1);
      expect(onFinish).toHaveBeenCalledTimes(1);
    });

    it('supports ja mode with Japanese translations and selko mode with selko feedback', () => {
      const { unmount } = renderDialogue(vi.fn(), 'ja');
      expect(screen.getByText('こんにちは、新しい近所の人？')).toBeInTheDocument();
      expect(screen.getByText('はい、昨日ここに越してきました。')).toBeInTheDocument();
      unmount();

      renderDialogue(vi.fn(), 'selko');
      fireEvent.click(screen.getByRole('button', { name: /Joo, muutin tänne eilen/i }));
      expect(screen.getByText('Selko: Hyvä vastaus!')).toBeInTheDocument();
    });

    it('provides audio button for each choice and plays with player voice (DEFAULT_SPEAKER)', () => {
      renderDialogue();

      const choiceAudioBtns = screen.getAllByRole('button', { name: /発音を聞く|Listen$/i });
      // Line audio button + 3 choices audio buttons = at least 4
      expect(choiceAudioBtns.length).toBeGreaterThanOrEqual(4);

      // Click the audio button for the first choice
      fireEvent.click(choiceAudioBtns[1]);
      expect(audioModule.playAudio).toHaveBeenCalled();
      const lastCall = audioModule.playAudio.mock.calls[audioModule.playAudio.mock.calls.length - 1];
      expect(lastCall[0]).toBe('Joo, muutin tänne eilen.');
      expect(lastCall[4].id).toBe('aino');
    });

    it('does not crash if playAudio throws or rejects', () => {
      audioModule.playAudio.mockRejectedValueOnce(new Error('TTS failure'));
      renderDialogue();

      const audioBtns = screen.getAllByRole('button', { name: /発音を聞く|Listen$/i });
      expect(() => fireEvent.click(audioBtns[0])).not.toThrow();
    });
  });

  describe('ProcedureSim', () => {
    const procedureGame = {
      id: 'atm-test',
      playLength: 1,
      procedures: [
        {
          id: 'nosto',
          goal: {
            fi: 'Nosta 40 euroa.',
            selko: 'Ota 40 euroa.',
            en: 'Withdraw 40 euros.'
          },
          steps: [
            {
              id: 's1',
              screen: [
                {
                  fi: 'Valitse kieli',
                  selko: 'Valitse kieli, jota käytät.',
                  en: 'Choose a language'
                }
              ],
              question: null,
              buttons: [
                {
                  id: 'fi',
                  label: { fi: 'Suomi', en: 'Finnish' },
                  key: null,
                  correct: true,
                  feedback: {
                    fi: 'Hyvä! Valitsit suomen.',
                    selko: 'Hyvä! Valitsit suomen.',
                    en: 'Good! You chose Finnish.'
                  }
                },
                {
                  id: 'sv',
                  label: { fi: 'Svenska', en: 'Swedish' },
                  key: null,
                  correct: false,
                  feedback: {
                    fi: 'Svenska on ruotsi.',
                    selko: 'Se on ruotsi.',
                    en: 'Svenska is Swedish.'
                  }
                }
              ]
            },
            {
              id: 's2',
              screen: [
                {
                  fi: 'Näppäile tunnusluku ja paina OK',
                  selko: 'Kirjoita tunnusluku. Paina OK.',
                  en: 'Enter PIN and press OK'
                },
                { fi: '****', en: '****' }
              ],
              question: null,
              buttons: [
                {
                  id: 'ok',
                  label: { fi: 'OK', en: 'OK' },
                  key: 'ok',
                  correct: true,
                  feedback: {
                    fi: 'Hyvä! OK vahvistaa.',
                    selko: 'Hyvä! OK vahvistaa.',
                    en: 'Good! OK confirms.'
                  }
                },
                {
                  id: 'korjaa',
                  label: { fi: 'Korjaa', en: 'Correct' },
                  key: 'korjaa',
                  correct: false,
                  feedback: {
                    fi: 'Korjaa pyyhkii numeron.',
                    selko: 'Korjaa poistaa numeron.',
                    en: 'Korjaa clears a digit.'
                  }
                },
                {
                  id: 'peruuta',
                  label: { fi: 'Peruuta', en: 'Cancel' },
                  key: 'peruuta',
                  correct: false,
                  feedback: {
                    fi: 'Peruuta keskeyttää tapahtuman.',
                    selko: 'Peruuta lopettaa.',
                    en: 'Peruuta cancels the transaction.'
                  }
                }
              ]
            }
          ]
        }
      ]
    };

    const renderProcedure = (onFinish = vi.fn(), mode = 'en') =>
      render(
        <LanguageProvider>
          <ProcedureSim game={procedureGame} mode={mode} onFinish={onFinish} />
        </LanguageProvider>
      );

    it('renders nothing when game has no procedures', () => {
      const { container } = render(
        <LanguageProvider>
          <ProcedureSim game={{ procedures: [] }} mode="en" onFinish={vi.fn()} />
        </LanguageProvider>
      );
      expect(container.firstChild).toBeNull();
    });

    it('always renders screen text in fi, shows translation in en mode, hides translation in fi mode, and falls back to en in ja mode when ja is missing', () => {
      const { container, rerender } = render(
        <LanguageProvider>
          <ProcedureSim game={procedureGame} mode="en" onFinish={vi.fn()} />
        </LanguageProvider>
      );

      const atmScreen = container.querySelector('.scene-atm-screen');
      expect(atmScreen.querySelector('.scene-text-main')?.textContent).toBe('Valitse kieli');
      expect(atmScreen.querySelector('.scene-text-sub')?.textContent).toBe('Choose a language');

      // fi mode: no sub translation on screen or buttons
      rerender(
        <LanguageProvider>
          <ProcedureSim game={procedureGame} mode="fi" onFinish={vi.fn()} />
        </LanguageProvider>
      );
      expect(atmScreen.querySelector('.scene-text-main')?.textContent).toBe('Valitse kieli');
      expect(atmScreen.querySelector('.scene-text-sub')).toBeNull();

      // selko mode: main stays fi on the ATM screen, sub shows selko
      rerender(
        <LanguageProvider>
          <ProcedureSim game={procedureGame} mode="selko" onFinish={vi.fn()} />
        </LanguageProvider>
      );
      expect(atmScreen.querySelector('.scene-text-main')?.textContent).toBe('Valitse kieli');
      expect(atmScreen.querySelector('.scene-text-sub')?.textContent).toBe('Valitse kieli, jota käytät.');

      // ja mode on data without ja: falls back to en
      rerender(
        <LanguageProvider>
          <ProcedureSim game={procedureGame} mode="ja" onFinish={vi.fn()} />
        </LanguageProvider>
      );
      expect(atmScreen.querySelector('.scene-text-main')?.textContent).toBe('Valitse kieli');
      expect(atmScreen.querySelector('.scene-text-sub')?.textContent).toBe('Choose a language');
    });

    it('marks wrong button red with feedback, records answer once per step, applies key color classes, skips **** in audio, and calls onFinish on the last step', () => {
      const onFinish = vi.fn();
      const { container } = renderProcedure(onFinish, 'en');

      expect(screen.getByText('1 / 2')).toBeInTheDocument();

      // Wrong tap on step 1
      const wrongBtn = screen.getByRole('button', { name: /Svenska/ });
      fireEvent.click(wrongBtn);
      expect(wrongBtn).toHaveClass('scene-atm-wrong');
      expect(wrongBtn).toBeDisabled();
      expect(screen.getByRole('status')).toHaveTextContent('Svenska on ruotsi.');
      expect(soundModule.playIncorrectSound).toHaveBeenCalledTimes(1);
      expect(statsModule.recordAnswer).toHaveBeenCalledTimes(1);

      // Correct tap on step 1 (retry should not call recordAnswer again)
      const rightBtn = screen.getByRole('button', { name: /Suomi/ });
      fireEvent.click(rightBtn);
      expect(statsModule.recordAnswer).toHaveBeenCalledTimes(1);
      expect(soundModule.playCorrectSound).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('status')).toHaveTextContent('Hyvä! Valitsit suomen.');

      // Advance to step 2
      fireEvent.click(screen.getByRole('button', { name: /次へ|Next/ }));
      expect(screen.getByText('2 / 2')).toBeInTheDocument();

      // Check **** line does not duplicate translation sub and is excluded from audio
      const lines = container.querySelectorAll('.scene-atm-screen-line');
      expect(lines).toHaveLength(2);
      expect(lines[1].querySelector('.scene-text-sub')).toBeNull();

      fireEvent.click(screen.getByRole('button', { name: /発音を聞く|Listen$/ }));
      expect(audioModule.playAudio).toHaveBeenCalledWith(
        'Näppäile tunnusluku ja paina OK',
        's2-screen',
        'fi-FI',
        1.0,
        expect.anything()
      );

      // Check key color classes on step 2
      const okBtn = screen.getByRole('button', { name: /^OK/ });
      const korjaaBtn = screen.getByRole('button', { name: /Korjaa/ });
      const peruutaBtn = screen.getByRole('button', { name: /Peruuta/ });
      expect(okBtn).toHaveClass('scene-atm-key', 'scene-atm-key-ok');
      expect(korjaaBtn).toHaveClass('scene-atm-key', 'scene-atm-key-korjaa');
      expect(peruutaBtn).toHaveClass('scene-atm-key', 'scene-atm-key-peruuta');

      // Correct tap on final step -> Valmis! -> onFinish
      fireEvent.click(okBtn);
      expect(statsModule.recordAnswer).toHaveBeenCalledTimes(2);
      const doneBtn = screen.getByRole('button', { name: /Valmis!/ });
      fireEvent.click(doneBtn);
      expect(soundModule.playLessonCompleteSound).toHaveBeenCalledTimes(1);
      expect(onFinish).toHaveBeenCalledTimes(1);
    });
  });
});
