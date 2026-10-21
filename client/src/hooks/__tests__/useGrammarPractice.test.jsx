import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LanguageProvider } from '../../context/LanguageContext';
import { useGrammarPractice } from '../useGrammarPractice';
import { fetchProgress, saveProgress } from '../../services/api';
import { grammarTopics, getQuestionsByTopic } from '../../data/grammarData';

vi.mock('../../services/api', () => ({
  fetchProgress: vi.fn(),
  saveProgress: vi.fn()
}));

const MISTAKES_KEY = 'finnish_grammar_mistakes';

const setup = (search = '', lang = 'ja') => {
  const wrapper = ({ children }) => (
    <LanguageProvider defaultLanguage={lang}>
      <MemoryRouter initialEntries={[`/grammar/practice${search}`]}>{children}</MemoryRouter>
    </LanguageProvider>
  );
  return renderHook(() => useGrammarPractice(), { wrapper });
};

const duePast = '2020-01-01T00:00:00.000Z';
const mistake = {
  id: 'm1',
  type: 'choice',
  question: 'q',
  answer: 'a',
  options: ['a', 'b'],
  explanation: 'e',
  topicTitle: 't'
};

const answerCurrent = (result, correct) => {
  const q = result.current.currentQ;
  act(() => result.current.setCurrentAnswer(correct ? q.answer : '__wrong__'));
  act(() => result.current.handleSubmitAnswer());
};

describe('useGrammarPractice', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    fetchProgress.mockResolvedValue({ data: { success: false } });
    saveProgress.mockResolvedValue({});
  });
  afterEach(() => vi.restoreAllMocks());

  it('starts in setup with defaults and the topic from the URL', () => {
    const topic = grammarTopics[1];
    const { result } = setup(`?topic=${topic.id}`);
    expect(result.current.mode).toBe('setup');
    expect(result.current.selectedTopic).toBe(topic.id);
    expect(result.current.selectedCategory).toBe(topic.category);
    expect(result.current.questionCount).toBe(5);
  });

  it('ignores an unknown topic when choosing the category', () => {
    const { result } = setup('?topic=does-not-exist');
    expect(result.current.selectedCategory).toBe('all');
  });

  it('merges the server mistake bank into local storage on mount', async () => {
    localStorage.setItem(MISTAKES_KEY, JSON.stringify([{ id: 'local1' }]));
    fetchProgress.mockResolvedValue({ data: { success: true, data: { mistakes: [{ id: 'server1' }] } } });
    const { result } = setup();
    await waitFor(() => expect(result.current.mistakeBank.map((m) => m.id)).toEqual(['server1', 'local1']));
    expect(JSON.parse(localStorage.getItem(MISTAKES_KEY))).toHaveLength(2);
  });

  it('keeps working when the server request fails or returns no mistakes', async () => {
    fetchProgress.mockRejectedValue(new Error('offline'));
    const { result } = setup();
    await act(async () => { await Promise.resolve(); });
    expect(result.current.mistakeBank).toEqual([]);
  });

  it('keeps working when fetchProgress throws synchronously or returns a non-promise', () => {
    fetchProgress.mockImplementation(() => { throw new Error('sync'); });
    expect(() => setup()).not.toThrow();
    fetchProgress.mockReturnValue(undefined);
    expect(() => setup()).not.toThrow();
  });

  it('builds a session of the requested size filtered by topic and type', () => {
    const topicId = grammarTopics.find((t) => getQuestionsByTopic(t.id).some((q) => q.type === 'choice')).id;
    const { result } = setup();
    act(() => {
      result.current.setSelectedTopic(topicId);
      result.current.setSelectedType('choice');
      result.current.setQuestionCount(10);
    });
    act(() => result.current.handleStartDrill(false));
    expect(result.current.mode).toBe('session');
    expect(result.current.questions.length).toBeGreaterThan(0);
    expect(result.current.questions.length).toBeLessThanOrEqual(10);
    expect(result.current.questions.every((q) => q.type === 'choice')).toBe(true);
  });

  it('builds a session from a category and from all questions', () => {
    const { result } = setup();
    act(() => result.current.setSelectedCategory('verbs'));
    act(() => result.current.handleStartDrill(false));
    expect(result.current.mode).toBe('session');
    act(() => result.current.setMode('setup'));
    act(() => result.current.setSelectedCategory('all'));
    act(() => result.current.handleStartDrill(false));
    expect(result.current.questions).toHaveLength(5);
  });

  it('alerts and stays in setup when no question matches the filters', () => {
    const alertSpy = vi.fn();
    vi.stubGlobal('alert', alertSpy);
    const { result } = setup();
    act(() => result.current.setSelectedType('does-not-exist'));
    act(() => result.current.handleStartDrill(false));
    expect(alertSpy).toHaveBeenCalled();
    expect(result.current.mode).toBe('setup');
    vi.unstubAllGlobals();
  });

  it('does nothing when starting a review drill with no due mistakes', () => {
    const { result } = setup();
    act(() => result.current.handleStartDrill(true));
    expect(result.current.mode).toBe('setup');
  });

  it('starts a review drill from due mistakes via handleStartWeaknessDrill', () => {
    localStorage.setItem(MISTAKES_KEY, JSON.stringify([mistake]));
    const { result } = setup();
    expect(result.current.dueMistakeCount).toBe(1);
    act(() => result.current.handleStartWeaknessDrill());
    expect(result.current.selectedCategory).toBe('mistakes');
    expect(result.current.mode).toBe('session');
    expect(result.current.questions).toEqual([mistake]);
  });

  it('scores a run, tracks the streak, records mistakes and finishes in the summary', () => {
    const { result } = setup();
    act(() => result.current.setQuestionCount(5));
    act(() => result.current.handleStartDrill(false));

    answerCurrent(result, true);
    expect(result.current.isCorrect).toBe(true);
    expect(result.current.score).toBe(1);
    expect(result.current.streak).toBe(1);
    expect(saveProgress).toHaveBeenCalledWith(expect.objectContaining({ studyStats: expect.anything() }));
    act(() => result.current.handleNextQuestion());
    expect(result.current.currentIndex).toBe(1);
    expect(result.current.isSubmitted).toBe(false);
    expect(result.current.currentAnswer).toBe('');

    answerCurrent(result, true);
    expect(result.current.streak).toBe(2);
    act(() => result.current.handleNextQuestion());

    const wrongQuestion = result.current.currentQ;
    answerCurrent(result, false);
    expect(result.current.isCorrect).toBe(false);
    expect(result.current.streak).toBe(0);
    expect(result.current.maxStreak).toBe(2);
    expect(result.current.sessionMistakes).toEqual([{ ...wrongQuestion, userAnswer: '__wrong__' }]);
    expect(result.current.mistakeBank.map((m) => m.id)).toContain(wrongQuestion.id);
    expect(result.current.mistakeBank.find((m) => m.id === wrongQuestion.id)).not.toHaveProperty('userAnswer');
    expect(JSON.parse(localStorage.getItem(MISTAKES_KEY))[0].savedAt).toEqual(expect.any(Number));
    expect(saveProgress).toHaveBeenCalledWith(expect.objectContaining({ mistakes: expect.any(Array) }));
    act(() => result.current.handleNextQuestion());

    answerCurrent(result, true);
    act(() => result.current.handleNextQuestion());
    answerCurrent(result, true);
    act(() => result.current.handleNextQuestion());

    expect(result.current.mode).toBe('summary');
    expect(result.current.score).toBe(4);
    expect(result.current.elapsedTime).toEqual(expect.any(Number));
  });

  it('does not add the same wrong question to the bank twice', () => {
    localStorage.setItem(MISTAKES_KEY, JSON.stringify([mistake]));
    const { result } = setup();
    act(() => result.current.handleStartWeaknessDrill());
    answerCurrent(result, false);
    expect(result.current.mistakeBank).toHaveLength(1);
  });

  it('ignores blank submissions and double submissions', () => {
    const { result } = setup();
    act(() => result.current.handleStartDrill(false));
    act(() => result.current.setCurrentAnswer('   '));
    act(() => result.current.handleSubmitAnswer());
    expect(result.current.isSubmitted).toBe(false);

    answerCurrent(result, true);
    const score = result.current.score;
    act(() => result.current.handleSubmitAnswer());
    expect(result.current.score).toBe(score);
  });

  it('inserts special characters at the end of the answer', () => {
    const { result } = setup();
    act(() => result.current.setCurrentAnswer('k'));
    act(() => result.current.handleInsertChar('ä'));
    expect(result.current.currentAnswer).toBe('kä');
  });

  it('Enter submits first and then moves on; other keys do nothing', () => {
    const { result } = setup();
    act(() => result.current.handleStartDrill(false));
    act(() => result.current.setCurrentAnswer(result.current.currentQ.answer));
    act(() => result.current.handleKeyDown({ key: 'a' }));
    expect(result.current.isSubmitted).toBe(false);
    act(() => result.current.handleKeyDown({ key: 'Enter' }));
    expect(result.current.isSubmitted).toBe(true);
    act(() => result.current.handleKeyDown({ key: 'Enter' }));
    expect(result.current.currentIndex).toBe(1);
  });

  it('auto-starts a review session from ?review=1 and graduates a mistake from box 5', () => {
    localStorage.setItem(MISTAKES_KEY, JSON.stringify([mistake]));
    localStorage.setItem('finnishLearnerReviewSchedule', JSON.stringify({
      'grammar:m1': { box: 5, dueAt: duePast, lastReviewedAt: duePast, lapses: 1 }
    }));
    const { result } = setup('?review=1');
    expect(result.current.mode).toBe('session');
    expect(result.current.selectedCategory).toBe('mistakes');
    answerCurrent(result, true);
    expect(result.current.mistakeBank).toEqual([]);
    expect(JSON.parse(localStorage.getItem(MISTAKES_KEY))).toEqual([]);
    expect(saveProgress).toHaveBeenCalledWith({ mistakes: [] });
  });

  it('stays in setup for ?review=1 when nothing is due', () => {
    const { result } = setup('?review=1');
    expect(result.current.mode).toBe('setup');
  });

  it('logs and continues when localStorage cannot be written', () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = setup();
    act(() => result.current.handleStartDrill(false));
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
    answerCurrent(result, false);
    expect(err).toHaveBeenCalled();
    expect(result.current.sessionMistakes).toHaveLength(1);
    setItem.mockRestore();
  });

  it('restarts a drill with fresh counters', () => {
    const { result } = setup();
    act(() => result.current.handleStartDrill(false));
    answerCurrent(result, true);
    act(() => result.current.handleStartDrill(false));
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.score).toBe(0);
    expect(result.current.streak).toBe(0);
    expect(result.current.sessionMistakes).toEqual([]);
  });
});
