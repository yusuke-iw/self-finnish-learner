import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LanguageProvider } from '../../context/LanguageContext';
import QuestionPrompt from '../session/QuestionPrompt';
import ChoiceQuestion from '../session/ChoiceQuestion';
import WordBankQuestion from '../session/WordBankQuestion';
import MatchingQuestion from '../session/MatchingQuestion';
import SpeakingQuestion from '../session/SpeakingQuestion';
import SessionFeedback from '../session/SessionFeedback';
import SessionSummary from '../session/SessionSummary';
import { NoReviewScreen, StartErrorScreen, StartScreen } from '../session/SessionSetup';
import { playAudio } from '../../utils/audio';

vi.mock('../../utils/audio', () => ({ playAudio: vi.fn() }));

const wrap = (ui, lang = 'ja') => render(<LanguageProvider defaultLanguage={lang}>{ui}</LanguageProvider>);
const speaker = { name: 'Aino' };

beforeEach(() => vi.clearAllMocks());

describe('QuestionPrompt', () => {
  const base = { sentenceId: 's1', prompt: 'Hello', promptJa: 'こんにちは', correctAnswer: 'Terve' };

  it('shows the Japanese prompt in ja and the English prompt in en', () => {
    const { unmount } = wrap(<QuestionPrompt question={{ ...base, type: 'typing' }} speaker={speaker} />);
    expect(screen.getByText('こんにちは')).toBeInTheDocument();
    unmount();
    wrap(<QuestionPrompt question={{ ...base, type: 'typing' }} speaker={speaker} />, 'en');
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('plays normal and slow audio for spoken-choice prompts', () => {
    wrap(<QuestionPrompt question={{ ...base, type: 'spoken-choice' }} speaker={speaker} />);
    const [normal, slow] = screen.getAllByRole('button');
    fireEvent.click(normal);
    fireEvent.click(slow);
    expect(playAudio).toHaveBeenNthCalledWith(1, 'Hello', 's1', 'fi-FI', 1.0, speaker);
    expect(playAudio).toHaveBeenNthCalledWith(2, 'Hello', 's1', 'fi-FI', 0.6, speaker);
  });

  it('plays the answer for listening prompts and hides the text', () => {
    wrap(<QuestionPrompt question={{ ...base, type: 'typing', isListening: true }} speaker={speaker} />);
    expect(screen.queryByText('こんにちは')).not.toBeInTheDocument();
    const [normal, slow] = screen.getAllByRole('button');
    fireEvent.click(normal);
    fireEvent.click(slow);
    expect(playAudio).toHaveBeenNthCalledWith(1, 'Terve', 's1', 'fi-FI', 1.0, speaker);
    expect(playAudio).toHaveBeenNthCalledWith(2, 'Terve', 's1', 'fi-FI', 0.6, speaker);
  });

  it('uses a different instruction per question type', () => {
    const texts = ['typing', 'word-bank-reverse', 'fill-in-the-blank', 'matching', 'speaking', 'spoken-choice'].map((type) => {
      const { container, unmount } = wrap(<QuestionPrompt question={{ ...base, type }} speaker={speaker} />);
      const text = container.querySelector('.instruction').textContent;
      unmount();
      return text;
    });
    expect(new Set(texts).size).toBe(texts.length);
    const listenFill = wrap(<QuestionPrompt question={{ ...base, type: 'choice', isListening: true }} speaker={speaker} />);
    expect(listenFill.container.querySelector('.instruction').textContent).toBeTruthy();
  });

  it('shows an audio button for reverse, fill-in and speaking prompts but not matching', () => {
    ['word-bank-reverse', 'fill-in-the-blank', 'speaking'].forEach((type) => {
      const { unmount } = wrap(<QuestionPrompt question={{ ...base, type }} speaker={speaker} />);
      fireEvent.click(screen.getByRole('button'));
      unmount();
    });
    expect(playAudio).toHaveBeenCalledTimes(3);
    wrap(<QuestionPrompt question={{ ...base, type: 'matching' }} speaker={speaker} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByText('Hello')).not.toBeInTheDocument();
  });
});

describe('ChoiceQuestion', () => {
  const question = { options: ['a', 'b'] };

  it('selects an option and plays it, but ignores clicks once feedback is shown', () => {
    const onSelect = vi.fn();
    const { rerender } = render(<ChoiceQuestion question={question} selected="" feedback={null} speaker={speaker} onSelect={onSelect} />);
    fireEvent.click(screen.getByText('a'));
    expect(onSelect).toHaveBeenCalledWith('a');
    expect(playAudio).toHaveBeenCalledWith('a', 'a', 'fi-FI', 1.0, speaker);

    rerender(<ChoiceQuestion question={question} selected="b" feedback={{ correctText: 'a', isCorrect: false }} speaker={speaker} onSelect={onSelect} />);
    expect(screen.getByText('a')).toHaveClass('correct-choice');
    expect(screen.getByText('b')).toHaveClass('selected', 'wrong-choice');
    expect(screen.getByText('a')).toBeDisabled();
  });
});

describe('WordBankQuestion', () => {
  it('toggles words from the slot and from the pool unless feedback is shown', () => {
    const onToggleWord = vi.fn();
    const question = { wordBank: ['x', 'y'] };
    const { container, rerender } = render(<WordBankQuestion question={question} selectedWords={[1]} feedback={null} onToggleWord={onToggleWord} />);
    expect(container.querySelector('.word-bank-answer')).toHaveClass('has-words');
    fireEvent.click(container.querySelector('.in-slot'));
    expect(onToggleWord).toHaveBeenCalledWith('y', 1);
    fireEvent.click(container.querySelector('.word-bank-pool .word-chip'));
    expect(onToggleWord).toHaveBeenCalledWith('x', 0);

    onToggleWord.mockClear();
    rerender(<WordBankQuestion question={question} selectedWords={[1]} feedback={{}} onToggleWord={onToggleWord} />);
    fireEvent.click(container.querySelector('.in-slot'));
    fireEvent.click(container.querySelector('.word-bank-pool .word-chip'));
    expect(onToggleWord).not.toHaveBeenCalled();
  });
});

describe('MatchingQuestion', () => {
  it('marks matched, selected and wrong tokens', () => {
    const t1 = { id: 1, lang: 'fi', text: 'talo' };
    const t2 = { id: 1, lang: 'ja', text: '家' };
    const t3 = { id: 2, lang: 'fi', text: 'auto' };
    const onTokenClick = vi.fn();
    render(
      <MatchingQuestion
        question={{ tokens: [t1, t2, t3] }}
        selectedTokens={[t2, t3]}
        matchedPairIds={[1]}
        wrongMatch
        isChecking={false}
        onTokenClick={onTokenClick}
      />
    );
    expect(screen.getByText('talo')).toHaveClass('matched');
    expect(screen.getByText('talo')).toBeDisabled();
    expect(screen.getByText('auto')).toHaveClass('selected', 'wrong-choice');
    fireEvent.click(screen.getByText('auto'));
    expect(onTokenClick).toHaveBeenCalledWith(t3);
  });
});

describe('SpeakingQuestion', () => {
  it('shows idle, recording and transcript states', () => {
    const onMicClick = vi.fn();
    const { container, rerender } = wrap(<SpeakingQuestion value="" isRecording={false} feedback={null} onMicClick={onMicClick} />, 'en');
    expect(screen.getByText('Tap microphone to speak')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button'));
    expect(onMicClick).toHaveBeenCalled();

    rerender(<LanguageProvider defaultLanguage="en"><SpeakingQuestion value="" isRecording feedback={null} onMicClick={onMicClick} /></LanguageProvider>);
    expect(screen.getByText('Listening...')).toBeInTheDocument();
    expect(container.querySelector('.btn-mic')).toHaveClass('recording');
    expect(screen.getByRole('button')).toBeDisabled();

    rerender(<LanguageProvider defaultLanguage="ja"><SpeakingQuestion value="terve" isRecording={false} feedback={{}} onMicClick={onMicClick} /></LanguageProvider>);
    expect(screen.getByText('"terve"')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });
});

describe('SessionFeedback', () => {
  it('shows perfect, typo and wrong states with the matching class', () => {
    const q = { type: 'typing', sentenceId: 's1' };
    const classes = [
      { isPerfect: true, correctText: 'x' },
      { hasTypo: true, correctText: 'x' },
      { correctText: 'x' }
    ].map((fb) => {
      const { container, unmount } = wrap(<SessionFeedback feedback={fb} question={q} speaker={speaker} />);
      const cls = container.querySelector('.feedback').className;
      unmount();
      return cls;
    });
    expect(classes).toEqual(['feedback correct', 'feedback typo', 'feedback incorrect']);
  });

  it('plays the correct text, hides audio for reverse word-bank and shows the localized spoken variant', () => {
    const q = { type: 'typing', sentenceId: 's1', spokenText: 'mä oon', spokenNotes: 'EN note', spokenNotesJa: 'JA note' };
    const { unmount } = wrap(<SessionFeedback feedback={{ isPerfect: true, correctText: 'Minä olen' }} question={q} speaker={speaker} />, 'ja');
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    fireEvent.click(buttons[1]);
    expect(playAudio).toHaveBeenNthCalledWith(1, 'Minä olen', 's1', 'fi-FI', 1.0, speaker);
    expect(playAudio).toHaveBeenNthCalledWith(2, 'mä oon', 's1', 'fi-FI', 1.0, speaker);
    expect(screen.getByText('JA note')).toBeInTheDocument();
    unmount();

    wrap(<SessionFeedback feedback={{ isPerfect: true, correctText: 'Minä olen' }} question={{ ...q, type: 'word-bank-reverse', spokenNotesJa: undefined }} speaker={speaker} />, 'ja');
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.getByText('EN note')).toBeInTheDocument();
  });
});

describe('SessionSummary', () => {
  const score = { correct: 4, typo: 1, incorrect: 0 };
  const props = { score, totalQuestions: 5, showResult: true, unlockedNext: false, onBack: vi.fn(), onRetry: vi.fn() };

  it('shows the percentage, breakdown and wires both buttons', () => {
    wrap(<SessionSummary {...props} />, 'en');
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('Session Complete!')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Back to Path' }));
    fireEvent.click(screen.getByRole('button', { name: 'Try Again' }));
    expect(props.onBack).toHaveBeenCalled();
    expect(props.onRetry).toHaveBeenCalled();
  });

  it('shows passed, unlock and failed messages only when showResult is set', () => {
    const { container, rerender } = wrap(<SessionSummary {...props} />);
    expect(container.querySelector('.session-result-message')).toHaveClass('passed');
    const passedText = container.querySelector('.session-result-message').textContent;

    rerender(<LanguageProvider defaultLanguage="ja"><SessionSummary {...props} unlockedNext /></LanguageProvider>);
    expect(container.querySelector('.session-result-message').textContent).not.toBe(passedText);

    rerender(<LanguageProvider defaultLanguage="ja"><SessionSummary {...props} score={{ correct: 0, typo: 0, incorrect: 5 }} /></LanguageProvider>);
    expect(container.querySelector('.session-result-message')).toHaveClass('failed');

    rerender(<LanguageProvider defaultLanguage="ja"><SessionSummary {...props} showResult={false} /></LanguageProvider>);
    expect(container.querySelector('.session-result-message')).toBeNull();
  });
});

describe('Session setup screens', () => {
  it('NoReviewScreen returns home', () => {
    const onHome = vi.fn();
    wrap(<NoReviewScreen onHome={onHome} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onHome).toHaveBeenCalled();
  });

  it('StartErrorScreen shows the error and both actions', () => {
    const onRetry = vi.fn();
    const onHome = vi.fn();
    wrap(<StartErrorScreen error="boom" onRetry={onRetry} onHome={onHome} />);
    expect(screen.getByRole('alert')).toHaveTextContent('boom');
    const [retry, home] = screen.getAllByRole('button');
    fireEvent.click(retry);
    fireEvent.click(home);
    expect(onRetry).toHaveBeenCalled();
    expect(onHome).toHaveBeenCalled();
  });

  it('StartScreen shows the form with a count select and start button', () => {
    const onCountChange = vi.fn();
    const onStart = vi.fn();
    const { rerender } = wrap(
      <StartScreen category={null} level={null} showForm sentenceCount={5} isStarting={false} onCountChange={onCountChange} onStart={onStart} />,
      'en'
    );
    expect(screen.getByText('Start a Quiz Session')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '10' } });
    expect(onCountChange).toHaveBeenCalledWith(10);
    fireEvent.click(screen.getByRole('button', { name: 'Start Session' }));
    expect(onStart).toHaveBeenCalled();

    rerender(
      <LanguageProvider defaultLanguage="en">
        <StartScreen category={null} level={null} showForm sentenceCount={5} isStarting onCountChange={onCountChange} onStart={onStart} />
      </LanguageProvider>
    );
    expect(screen.getByRole('button', { name: 'Starting...' })).toBeDisabled();
  });

  it('StartScreen shows only the loading heading when a category is given', () => {
    const props = { category: 'Cases', level: 2, showForm: false, sentenceCount: 5, isStarting: true, onCountChange: vi.fn(), onStart: vi.fn() };
    const { unmount } = wrap(<StartScreen {...props} />, 'en');
    expect(screen.getByText('Loading Level 2...')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    unmount();
    wrap(<StartScreen {...props} />, 'ja');
    expect(screen.getByText('レベル 2 を読み込み中...')).toBeInTheDocument();
  });
});
