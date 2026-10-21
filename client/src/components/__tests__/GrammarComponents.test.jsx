import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LanguageProvider } from '../../context/LanguageContext';
import GrammarChoiceQuestion from '../grammar/GrammarChoiceQuestion';
import GrammarWordbankQuestion from '../grammar/GrammarWordbankQuestion';
import GrammarTypingQuestion from '../grammar/GrammarTypingQuestion';
import GrammarFeedback from '../grammar/GrammarFeedback';
import GrammarSessionView from '../grammar/GrammarSessionView';
import GrammarSummary from '../grammar/GrammarSummary';
import GrammarSetup from '../grammar/GrammarSetup';
import { playAudio } from '../../utils/audio';

vi.mock('../../utils/audio', () => ({ playAudio: vi.fn() }));

const wrap = (ui, lang = 'ja') => render(<LanguageProvider defaultLanguage={lang}>{ui}</LanguageProvider>);

const choiceQ = {
  id: 'c1',
  type: 'choice',
  question: 'JA question',
  questionEn: 'EN question',
  answer: 'talossa',
  options: ['talossa', 'talossä'],
  explanation: 'JA explanation',
  explanationEn: 'EN explanation',
  topicTitle: 'JA topic',
  topicTitleEn: 'EN topic',
  level: 'B1'
};
const wordbankQ = { ...choiceQ, id: 'w1', type: 'wordbank', words: ['a', 'b', 'c'], answer: 'b' };
const typingQ = { ...choiceQ, id: 't1', type: 'typing', hint: 'JA hint', hintEn: 'EN hint' };

describe('GrammarChoiceQuestion', () => {
  it('marks selected, correct and wrong options', () => {
    const onSelect = vi.fn();
    const { rerender } = render(<GrammarChoiceQuestion question={choiceQ} answer="talossä" isSubmitted={false} onSelect={onSelect} />);
    expect(screen.getByText('talossä').closest('button')).toHaveClass('is-active');
    fireEvent.click(screen.getByText('talossa'));
    expect(onSelect).toHaveBeenCalledWith('talossa');

    rerender(<GrammarChoiceQuestion question={choiceQ} answer="talossä" isSubmitted onSelect={onSelect} />);
    expect(screen.getByText('talossa').closest('button')).toHaveClass('is-target-correct');
    expect(screen.getByText('talossä').closest('button')).toHaveClass('is-target-wrong');
    expect(screen.getByText('talossa').closest('button')).toBeDisabled();
  });
});

describe('GrammarWordbankQuestion', () => {
  it('shows the hint, selected chip and result classes', () => {
    const onSelect = vi.fn();
    const { rerender } = wrap(<GrammarWordbankQuestion question={wordbankQ} answer="" isSubmitted={false} onSelect={onSelect} />);
    expect(screen.getByText('（下の単語チップを選択してください）')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'a' }));
    expect(onSelect).toHaveBeenCalledWith('a');

    rerender(<LanguageProvider defaultLanguage="ja"><GrammarWordbankQuestion question={wordbankQ} answer="a" isSubmitted={false} onSelect={onSelect} /></LanguageProvider>);
    expect(screen.getByRole('button', { name: 'a' })).toHaveClass('chip-selected');

    rerender(<LanguageProvider defaultLanguage="ja"><GrammarWordbankQuestion question={wordbankQ} answer="a" isSubmitted onSelect={onSelect} /></LanguageProvider>);
    expect(screen.getByRole('button', { name: 'b' })).toHaveClass('chip-correct');
    expect(screen.getByRole('button', { name: 'a' })).toHaveClass('chip-wrong');
  });
});

describe('GrammarTypingQuestion', () => {
  it('uses the localized hint, inserts special characters and hides helpers once submitted', () => {
    const onChange = vi.fn();
    const onInsertChar = vi.fn();
    const { unmount } = wrap(<GrammarTypingQuestion question={typingQ} answer="" isSubmitted={false} onChange={onChange} onInsertChar={onInsertChar} />, 'en');
    expect(screen.getByPlaceholderText('EN hint')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'x' } });
    expect(onChange).toHaveBeenCalledWith('x');
    fireEvent.click(screen.getByRole('button', { name: 'Ö' }));
    expect(onInsertChar).toHaveBeenCalledWith('Ö');
    unmount();

    wrap(<GrammarTypingQuestion question={typingQ} answer="x" isSubmitted onChange={onChange} onInsertChar={onInsertChar} />);
    expect(screen.getByPlaceholderText('JA hint')).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'ä' })).not.toBeInTheDocument();
  });

  it('falls back to the default placeholder when there is no hint', () => {
    wrap(<GrammarTypingQuestion question={{ ...typingQ, hint: undefined, hintEn: undefined }} answer="" isSubmitted={false} onChange={vi.fn()} onInsertChar={vi.fn()} />);
    expect(screen.getByRole('textbox').getAttribute('placeholder')).toBeTruthy();
  });
});

describe('GrammarFeedback', () => {
  it('shows the correct answer pill only for wrong answers and localizes the explanation', () => {
    const { unmount } = wrap(<GrammarFeedback question={choiceQ} isCorrect={false} />, 'en');
    expect(screen.getByText('talossa')).toBeInTheDocument();
    expect(screen.getByText(/EN explanation/)).toBeInTheDocument();
    unmount();

    const { container } = wrap(<GrammarFeedback question={choiceQ} isCorrect />);
    expect(container.querySelector('.feed-correct')).toBeTruthy();
    expect(container.querySelector('.correct-answer-pill')).toBeNull();
    expect(screen.getByText(/JA explanation/)).toBeInTheDocument();
  });
});

describe('GrammarSessionView', () => {
  const baseProps = {
    question: choiceQ,
    index: 0,
    total: 2,
    streak: 0,
    answer: '',
    isSubmitted: false,
    isCorrect: false,
    onAnswerChange: vi.fn(),
    onInsertChar: vi.fn(),
    onSubmit: vi.fn(),
    onNext: vi.fn(),
    onKeyDown: vi.fn(),
    onExit: vi.fn()
  };

  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('renders the question, plays audio and shows the streak badge from 2', () => {
    const { rerender } = wrap(<GrammarSessionView {...baseProps} />, 'en');
    expect(screen.getByText('EN question')).toBeInTheDocument();
    expect(screen.getByText('EN topic')).toBeInTheDocument();
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
    expect(document.querySelector('.streak-badge')).toBeNull();
    fireEvent.click(screen.getByTitle(/listen/i));
    expect(playAudio).toHaveBeenCalledWith('talossa');

    rerender(<LanguageProvider defaultLanguage="en"><GrammarSessionView {...baseProps} streak={3} /></LanguageProvider>);
    expect(document.querySelector('.streak-badge')).toBeTruthy();
  });

  it('defaults the level badge to A1', () => {
    wrap(<GrammarSessionView {...baseProps} question={{ ...choiceQ, level: undefined }} />);
    expect(document.querySelector('.level-a1')).toBeTruthy();
  });

  it('renders each question format', () => {
    const { rerender } = wrap(<GrammarSessionView {...baseProps} question={wordbankQ} />);
    expect(document.querySelector('.drill-wordbank-area')).toBeTruthy();
    rerender(<LanguageProvider defaultLanguage="ja"><GrammarSessionView {...baseProps} question={typingQ} /></LanguageProvider>);
    expect(document.querySelector('.drill-typing-area')).toBeTruthy();
  });

  it('asks for confirmation before exiting', () => {
    wrap(<GrammarSessionView {...baseProps} />);
    const confirm = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true);
    const exitBtn = document.querySelector('.exit-btn');
    fireEvent.click(exitBtn);
    expect(baseProps.onExit).not.toHaveBeenCalled();
    fireEvent.click(exitBtn);
    expect(baseProps.onExit).toHaveBeenCalledTimes(1);
    expect(confirm).toHaveBeenCalledTimes(2);
  });

  it('enables submit only with a non-blank answer and forwards key presses', () => {
    const { rerender } = wrap(<GrammarSessionView {...baseProps} answer="   " />);
    expect(document.querySelector('.drill-check-btn')).toBeDisabled();
    rerender(<LanguageProvider defaultLanguage="ja"><GrammarSessionView {...baseProps} answer="x" /></LanguageProvider>);
    fireEvent.click(document.querySelector('.drill-check-btn'));
    expect(baseProps.onSubmit).toHaveBeenCalled();
    fireEvent.keyDown(document.querySelector('.practice-session-card'), { key: 'Enter' });
    expect(baseProps.onKeyDown).toHaveBeenCalled();
  });

  it('shows feedback and a next or finish button after submitting', () => {
    const { rerender } = wrap(<GrammarSessionView {...baseProps} isSubmitted isCorrect={false} answer="talossä" />, 'en');
    expect(document.querySelector('.drill-feedback-banner')).toBeTruthy();
    fireEvent.click(document.querySelector('.drill-next-btn'));
    expect(baseProps.onNext).toHaveBeenCalledTimes(1);
    const nextLabel = document.querySelector('.drill-next-btn').textContent;

    rerender(<LanguageProvider defaultLanguage="en"><GrammarSessionView {...baseProps} index={1} isSubmitted isCorrect answer="talossa" /></LanguageProvider>);
    expect(document.querySelector('.drill-next-btn').textContent).not.toBe(nextLabel);
  });
});

describe('GrammarSummary', () => {
  const props = {
    score: 5,
    total: 5,
    maxStreak: 5,
    elapsedTime: 42,
    mistakes: [],
    onRetryWeakness: vi.fn(),
    onRetry: vi.fn(),
    onChangeSettings: vi.fn(),
    onBackToHub: vi.fn()
  };

  beforeEach(() => vi.clearAllMocks());

  it('shows the perfect message and no mistakes section', () => {
    wrap(<GrammarSummary {...props} />);
    expect(screen.getByText('🏆')).toBeInTheDocument();
    expect(screen.getByText('完璧です！全問正解を達成しました！')).toBeInTheDocument();
    expect(screen.getByText('5 / 5')).toBeInTheDocument();
    expect(screen.getByText('(100%)')).toBeInTheDocument();
    expect(screen.getByText('42 秒')).toBeInTheDocument();
    expect(document.querySelector('.btn-weakness')).toBeNull();
  });

  it('picks the star and muscle messages by score', () => {
    const { unmount } = wrap(<GrammarSummary {...props} score={4} />, 'en');
    expect(screen.getByText('🌟')).toBeInTheDocument();
    expect(screen.getByText(/Great progress/)).toBeInTheDocument();
    unmount();
    wrap(<GrammarSummary {...props} score={1} />, 'en');
    expect(screen.getByText('💪')).toBeInTheDocument();
    expect(screen.getByText(/Good effort/)).toBeInTheDocument();
    expect(screen.getByText('(20%)')).toBeInTheDocument();
  });

  it('lists missed questions and wires every button', () => {
    const mistakes = [
      { ...choiceQ, userAnswer: 'talossä' },
      { ...choiceQ, id: 'c2', questionEn: undefined, topicTitleEn: undefined, explanationEn: undefined }
    ];
    const { unmount } = wrap(<GrammarSummary {...props} score={3} mistakes={mistakes} />);
    expect(screen.getAllByText('JA question', { exact: false })).toHaveLength(2);
    expect(screen.getByText('talossä')).toBeInTheDocument();
    expect(screen.getByText('未回答')).toBeInTheDocument();

    fireEvent.click(document.querySelector('.btn-weakness'));
    fireEvent.click(document.querySelector('.btn-retry'));
    fireEvent.click(document.querySelector('.btn-settings'));
    fireEvent.click(document.querySelector('.btn-home'));
    expect(props.onRetryWeakness).toHaveBeenCalled();
    expect(props.onRetry).toHaveBeenCalled();
    expect(props.onChangeSettings).toHaveBeenCalled();
    expect(props.onBackToHub).toHaveBeenCalled();
    unmount();

    wrap(<GrammarSummary {...props} score={3} mistakes={mistakes} />, 'en');
    expect(screen.getByText('EN question', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('Unanswered')).toBeInTheDocument();
    // falls back to the Japanese text when no English field exists
    expect(screen.getByText('Question: JA question')).toBeInTheDocument();
  });
});

describe('GrammarSetup', () => {
  const props = {
    mistakeCount: 3,
    dueMistakeCount: 0,
    selectedCategory: 'all',
    selectedTopic: 'all',
    selectedType: 'all',
    questionCount: 5,
    onSelectCategory: vi.fn(),
    onSelectTopic: vi.fn(),
    onSelectType: vi.fn(),
    onSelectCount: vi.fn(),
    onStart: vi.fn(),
    onStartWeakness: vi.fn(),
    onBack: vi.fn()
  };

  beforeEach(() => vi.clearAllMocks());

  it('forwards every control and shows the weakness button only when mistakes are due', () => {
    const { unmount } = wrap(<GrammarSetup {...props} />, 'en');
    expect(document.querySelector('.review-mistakes-btn')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /Start Drill Session/i }));
    expect(props.onStart).toHaveBeenCalled();
    fireEvent.click(document.querySelector('.back-hub-link'));
    expect(props.onBack).toHaveBeenCalled();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'all' } });
    const typeChips = document.querySelectorAll('.format-chips .filter-chip');
    typeChips.forEach((chip) => fireEvent.click(chip));
    expect(props.onSelectType.mock.calls.map((c) => c[0])).toEqual(['all', 'choice', 'typing', 'wordbank']);
    const countBtns = document.querySelectorAll('.count-btn');
    countBtns.forEach((b) => fireEvent.click(b));
    expect(props.onSelectCount.mock.calls.map((c) => c[0])).toEqual([5, 10, 15]);
    fireEvent.click(document.querySelector('.filter-chips .filter-chip'));
    expect(props.onSelectCategory).toHaveBeenCalled();
    unmount();

    wrap(<GrammarSetup {...props} dueMistakeCount={2} />, 'en');
    fireEvent.click(document.querySelector('.review-mistakes-btn'));
    expect(props.onStartWeakness).toHaveBeenCalled();
  });

  it('filters topics by the selected category and reports topic changes', () => {
    wrap(<GrammarSetup {...props} selectedCategory="verbs" />);
    const select = screen.getByRole('combobox');
    const optionCount = select.querySelectorAll('option').length;
    expect(optionCount).toBeGreaterThan(1);
    const firstTopic = select.querySelectorAll('option')[1].value;
    fireEvent.change(select, { target: { value: firstTopic } });
    expect(props.onSelectTopic).toHaveBeenCalledWith(firstTopic);
  });
});
