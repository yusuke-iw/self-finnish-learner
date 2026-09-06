import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import GrammarPractice from '../GrammarPractice';
import { BrowserRouter, useNavigate, useSearchParams } from 'react-router-dom';
import { LanguageProvider } from '../../context/LanguageContext';
import * as audioUtils from '../../utils/audio';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
    useSearchParams: vi.fn()
  };
});

vi.mock('../../utils/audio', () => ({
  playAudio: vi.fn()
}));

const renderWithLang = (ui, lang = 'ja') => {
  return render(
    <LanguageProvider defaultLanguage={lang}>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </LanguageProvider>
  );
};

describe('GrammarPractice Component', () => {
  let mockNavigate;
  let mockSearchParams;

  beforeEach(() => {
    mockNavigate = vi.fn();
    mockSearchParams = new URLSearchParams('');
    useNavigate.mockReturnValue(mockNavigate);
    useSearchParams.mockReturnValue([mockSearchParams]);
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders setup view with title, categories, format chips and start button', () => {
    renderWithLang(<GrammarPractice />);

    expect(screen.getByText(/🎯 文法演習スタジオ（Drill Studio）/i)).toBeInTheDocument();
    expect(screen.getByText('1. 特訓カテゴリを選択')).toBeInTheDocument();
    expect(screen.getByText('3. 出題形式')).toBeInTheDocument();
    expect(screen.getByText('4. 問題数')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /🚀 ドリルを開始する/i })).toBeInTheDocument();
  });

  it('navigates back to grammar hub when back link is clicked', () => {
    renderWithLang(<GrammarPractice />);

    const backBtn = screen.getByText('← 文法体系トップへ戻る');
    fireEvent.click(backBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/grammar');
  });

  it('filters topics dynamically when category chip is selected', () => {
    renderWithLang(<GrammarPractice />);

    const verbsChip = screen.getByRole('button', { name: '動詞・活用（Verbit）' });
    fireEvent.click(verbsChip);

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });

  it('starts a drill session and displays question with options and audio button', () => {
    renderWithLang(<GrammarPractice />);

    const startBtn = screen.getByRole('button', { name: /🚀 ドリルを開始する/i });
    fireEvent.click(startBtn);

    expect(screen.getByText('1 / 5')).toBeInTheDocument();
    expect(screen.getByTitle('発音を再生')).toBeInTheDocument();

    const audioBtn = screen.getByTitle('発音を再生');
    fireEvent.click(audioBtn);
    expect(audioUtils.playAudio).toHaveBeenCalled();
  });

  it('supports typing answers and character helper buttons in typing questions', () => {
    renderWithLang(<GrammarPractice />);

    // Select typing format only
    const typingFilterBtn = screen.getByRole('button', { name: /記述・タイピング入力/i });
    fireEvent.click(typingFilterBtn);

    const startBtn = screen.getByRole('button', { name: /🚀 ドリルを開始する/i });
    fireEvent.click(startBtn);

    const helperBtn = screen.getByRole('button', { name: 'ä' });
    fireEvent.click(helperBtn);

    const input = screen.getByRole('textbox');
    expect(input.value).toBe('ä');
  });

  it('records incorrect answers to mistake bank in localStorage', () => {
    renderWithLang(<GrammarPractice />);

    // Typing question test
    const typingFilterBtn = screen.getByRole('button', { name: /記述・タイピング入力/i });
    fireEvent.click(typingFilterBtn);

    const startBtn = screen.getByRole('button', { name: /🚀 ドリルを開始する/i });
    fireEvent.click(startBtn);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'definitely_wrong_answer_xyz' } });

    const checkBtn = screen.getByRole('button', { name: /回答を確認する/i });
    fireEvent.click(checkBtn);

    expect(screen.getByText('❌ おしい！ / 不正解')).toBeInTheDocument();

    const storedMistakes = JSON.parse(localStorage.getItem('finnish_grammar_mistakes') || '[]');
    expect(storedMistakes.length).toBeGreaterThan(0);
  });

  it('allows starting a review session if mistakes exist in localStorage', () => {
    const mockMistake = [{
      id: 'vokaaliharmonia_q1',
      question: '「talo」に「〜の中で」を付ける形は？',
      answer: 'talossa',
      type: 'choice',
      options: ['talossa', 'talossä'],
      explanation: 'taloは後母音語幹です。',
      topicTitle: '母音調和'
    }];
    localStorage.setItem('finnish_grammar_mistakes', JSON.stringify(mockMistake));

    renderWithLang(<GrammarPractice />);

    const reviewBtn = screen.getByRole('button', { name: /🔥 弱点集中特訓を始める/i });
    expect(reviewBtn).toBeInTheDocument();

    fireEvent.click(reviewBtn);

    expect(screen.getByText('「talo」に「〜の中で」を付ける形は？')).toBeInTheDocument();
  });

  it('renders English UI when language is en', () => {
    renderWithLang(<GrammarPractice />, 'en');

    expect(screen.getByText('🎯 Grammar Drill Studio')).toBeInTheDocument();
    expect(screen.getByText('1. Select Category')).toBeInTheDocument();
    expect(screen.getByText('3. Exercise Format')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start Drill Session/i })).toBeInTheDocument();
  });
});
