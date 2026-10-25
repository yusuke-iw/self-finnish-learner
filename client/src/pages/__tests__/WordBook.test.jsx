import React from 'react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import WordBook from '../WordBook';
import { LanguageProvider } from '../../context/LanguageContext';
import { addWord, getWords } from '../../utils/wordBook';
import * as review from '../../utils/reviewSchedule';
import * as stats from '../../utils/studyStats';
import { playAudio } from '../../utils/audio';
import { saveProgress } from '../../services/api';

vi.mock('../../services/api', () => ({ saveProgress: vi.fn() }));
vi.mock('../../utils/audio', () => ({ playAudio: vi.fn() }));

function renderBook(route = '/words', language = 'en') {
  return render(<LanguageProvider defaultLanguage={language}><MemoryRouter initialEntries={[route]}><WordBook /></MemoryRouter></LanguageProvider>);
}

describe('WordBook', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    saveProgress.mockResolvedValue({});
    playAudio.mockResolvedValue();
  });
  afterEach(() => vi.restoreAllMocks());

  it('explains an empty book and manually adds a word with optional fields', () => {
    renderBook('/words', 'ja');
    expect(screen.getByText(/読解の語彙リスト/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('フィンランド語'), { target: { value: 'kissa' } });
    fireEvent.change(screen.getByLabelText('意味（日本語）'), { target: { value: '猫' } });
    fireEvent.change(screen.getByLabelText('意味（英語、任意）'), { target: { value: 'cat' } });
    fireEvent.change(screen.getByLabelText('メモ（任意）'), { target: { value: 'ペット' } });
    fireEvent.click(screen.getByRole('button', { name: '追加する' }));
    expect(screen.getByText('猫')).toBeInTheDocument();
    expect(screen.getByText('1語')).toBeInTheDocument();
    expect(getWords()[0]).toMatchObject({ word: 'kissa', translationJa: '猫', translation: 'cat', note: 'ペット', source: { type: 'manual' } });
  });

  it('lists localized meanings and sources, searches all meanings, plays and deletes a word', () => {
    addWord({ word: 'kissa', translation: 'cat', translationJa: '猫', source: { type: 'passage', passageId: 'p1', title: 'Animals' } });
    addWord({ word: 'pipo', translation: 'beanie', translationJa: 'ニット帽', source: { type: 'scene', gameId: 'vaatteet', title: 'Sää ja vaatteet' } });
    addWord({ word: 'koira', translation: 'dog', translationJa: '犬' });
    renderBook();
    expect(screen.getByText('cat')).toBeInTheDocument();
    expect(screen.getByText('Animals')).toBeInTheDocument();
    expect(screen.getByText('beanie')).toBeInTheDocument();
    expect(screen.getByText('Sää ja vaatteet')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: '猫' } });
    expect(screen.queryByText('koira')).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'KIS' } });
    const item = screen.getByText('kissa').closest('li');
    fireEvent.click(within(item).getByRole('button', { name: /Listen/ }));
    expect(playAudio).toHaveBeenCalledWith('kissa');
    fireEvent.click(within(item).getByRole('button', { name: /Delete/ }));
    expect(getWords().map(w => w.id)).toEqual(['pipo', 'koira']);
    expect(review.getReviewSchedule()['word:kissa']).toBeUndefined();
  });

  it('practices all words with keyboard controls and statistics without changing the schedule', () => {
    addWord({ word: 'kissa', translation: 'cat', note: 'pet' });
    const schedule = review.getReviewSchedule();
    const record = vi.spyOn(review, 'recordReviewResult');
    const answer = vi.spyOn(stats, 'recordAnswer');
    renderBook();
    fireEvent.click(screen.getByRole('button', { name: 'Practice all' }));
    expect(playAudio).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('cat')).not.toBeInTheDocument();
    fireEvent.keyDown(window, { key: ' ', isComposing: true });
    expect(screen.queryByText('cat')).not.toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(answer).not.toHaveBeenCalled();
    fireEvent.keyDown(window, { key: ' ' });
    expect(screen.getByText('cat')).toBeInTheDocument();
    expect(screen.getByText('pet')).toBeInTheDocument();
    expect(playAudio).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(window, { key: '1', isComposing: true });
    expect(answer).not.toHaveBeenCalled();
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(screen.getByText('Remembered 1 / 1')).toBeInTheDocument();
    expect(answer).toHaveBeenCalledTimes(1);
    expect(record).not.toHaveBeenCalled();
    expect(review.getReviewSchedule()).toEqual(schedule);
    fireEvent.click(screen.getByRole('button', { name: 'Back to words' }));
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });

  it('auto-starts only due words, handles rejected audio and records a missed review', () => {
    addWord({ word: 'kissa', translation: 'cat' });
    addWord({ word: 'koira', translation: 'dog' });
    review.recordReviewResult('word:koira', true);
    const record = vi.spyOn(review, 'recordReviewResult');
    playAudio.mockRejectedValue(new Error('autoplay denied'));
    renderBook('/words?review=1');
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
    expect(screen.getByText('kissa')).toBeInTheDocument();
    expect(screen.queryByText('koira')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Show answer' }));
    fireEvent.keyDown(window, { key: '2' });
    expect(record).toHaveBeenCalledWith('word:kissa', false);
    expect(screen.getByText('Remembered 0 / 1')).toBeInTheDocument();
    expect(stats.getTodayCount()).toBe(1);
    expect(saveProgress).toHaveBeenLastCalledWith(expect.objectContaining({ reviewSchedule: review.getReviewSchedule(), studyStats: stats.getStudyStats() }));
  });

  it.each(['ArrowRight', '1', 'ArrowLeft', '2'])('accepts review answer key %s after flipping', (key) => {
    addWord({ word: 'kissa', translation: 'cat' });
    const record = vi.spyOn(review, 'recordReviewResult');
    renderBook();
    fireEvent.click(screen.getByRole('button', { name: 'Review today’s words (1)' }));
    fireEvent.keyDown(window, { key: ' ' });
    fireEvent.keyDown(window, { key });
    expect(record).toHaveBeenCalledWith('word:kissa', key === '1' || key === 'ArrowRight');
  });

  it('disables review when no words are due', () => {
    renderBook('/words?review=1');
    expect(screen.getByRole('button', { name: 'Review today’s words (0)' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Practice all' })).toBeDisabled();
  });

  it('shuffles all words, resets the front for each card and auto-plays each card once in StrictMode', () => {
    addWord({ word: 'kissa', translation: 'cat' });
    addWord({ word: 'koira', translation: 'dog' });
    vi.spyOn(Math, 'random').mockReturnValue(0);
    render(<React.StrictMode><MemoryRouter><WordBook /></MemoryRouter></React.StrictMode>);
    fireEvent.click(screen.getByRole('button', { name: 'Practice all' }));
    expect(screen.getByText('koira')).toBeInTheDocument();
    expect(playAudio).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(window, { key: ' ', keyCode: 229 });
    expect(screen.queryByText('dog')).not.toBeInTheDocument();
    fireEvent.keyDown(window, { key: ' ', repeat: true });
    expect(screen.queryByText('dog')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Show answer' }));
    fireEvent.click(screen.getByRole('button', { name: 'Remembered' }));
    expect(screen.getByText('kissa')).toBeInTheDocument();
    expect(screen.queryByText('cat')).not.toBeInTheDocument();
    expect(playAudio).toHaveBeenCalledTimes(2);
    fireEvent.click(screen.getByRole('button', { name: 'Show answer' }));
    fireEvent.click(screen.getByRole('button', { name: 'Not yet' }));
    expect(screen.getByText('Remembered 1 / 2')).toBeInTheDocument();
    expect(stats.getTodayCount()).toBe(2);
  });
});
