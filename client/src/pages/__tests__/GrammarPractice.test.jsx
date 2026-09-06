import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import GrammarPractice from '../GrammarPractice';
import { BrowserRouter, useNavigate, useSearchParams } from 'react-router-dom';
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
    render(
      <BrowserRouter>
        <GrammarPractice />
      </BrowserRouter>
    );

    expect(screen.getByText(/🎯 文法演習スタジオ（Drill Studio）/i)).toBeInTheDocument();
    expect(screen.getByText('1. 特訓カテゴリを選択')).toBeInTheDocument();
    expect(screen.getByText('3. 出題形式')).toBeInTheDocument();
    expect(screen.getByText('4. 問題数')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /🚀 ドリルを開始する/i })).toBeInTheDocument();
  });

  it('navigates back to grammar hub when back link is clicked', () => {
    render(
      <BrowserRouter>
        <GrammarPractice />
      </BrowserRouter>
    );

    const backBtn = screen.getByText('← 文法体系トップへ戻る');
    fireEvent.click(backBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/grammar');
  });

  it('starts a practice drill and displays question and progress bar', () => {
    render(
      <BrowserRouter>
        <GrammarPractice />
      </BrowserRouter>
    );

    const startBtn = screen.getByRole('button', { name: /🚀 ドリルを開始する/i });
    fireEvent.click(startBtn);

    // Should switch to session mode
    expect(screen.getByText(/✕ 中断/i)).toBeInTheDocument();
    expect(screen.getByText(/\/ 5/i)).toBeInTheDocument(); // Question counter
    expect(screen.getByRole('button', { name: /回答を確認する/i })).toBeInTheDocument();
  });

  it('handles choice question answer selection and feedback', () => {
    render(
      <BrowserRouter>
        <GrammarPractice />
      </BrowserRouter>
    );

    // Filter to choice format
    const choiceFilterBtn = screen.getByRole('button', { name: /4択クイズ/i });
    fireEvent.click(choiceFilterBtn);

    const startBtn = screen.getByRole('button', { name: /🚀 ドリルを開始する/i });
    fireEvent.click(startBtn);

    // Find any choice option button and click it
    const options = screen.getAllByRole('button').filter((btn) => btn.className.includes('drill-choice-btn'));
    expect(options.length).toBeGreaterThan(0);
    fireEvent.click(options[0]);

    // Click submit
    const checkBtn = screen.getByRole('button', { name: /回答を確認する/i });
    fireEvent.click(checkBtn);

    // Feedback should appear
    expect(screen.getByText(/💡/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /次の問題へ|結果を見る/i })).toBeInTheDocument();
  });

  it('supports typing question and character helper buttons (ä, ö)', () => {
    render(
      <BrowserRouter>
        <GrammarPractice />
      </BrowserRouter>
    );

    // Filter to typing format
    const typingFilterBtn = screen.getByRole('button', { name: /記述・タイピング入力/i });
    fireEvent.click(typingFilterBtn);

    const startBtn = screen.getByRole('button', { name: /🚀 ドリルを開始する/i });
    fireEvent.click(startBtn);

    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();

    // Click special character helper
    const äButton = screen.getByRole('button', { name: 'ä' });
    fireEvent.click(äButton);

    expect(input.value).toContain('ä');
  });

  it('saves mistakes into localStorage on incorrect answer', () => {
    render(
      <BrowserRouter>
        <GrammarPractice />
      </BrowserRouter>
    );

    // Typing question test
    const typingFilterBtn = screen.getByRole('button', { name: /記述・タイピング入力/i });
    fireEvent.click(typingFilterBtn);

    const startBtn = screen.getByRole('button', { name: /🚀 ドリルを開始する/i });
    fireEvent.click(startBtn);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'definitely_wrong_answer_xyz' } });

    const checkBtn = screen.getByRole('button', { name: /回答を確認する/i });
    fireEvent.click(checkBtn);

    expect(screen.getByText('❌ 不正解')).toBeInTheDocument();

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

    render(
      <BrowserRouter>
        <GrammarPractice />
      </BrowserRouter>
    );

    const reviewBtn = screen.getByRole('button', { name: /🔥 弱点集中特訓を始める/i });
    expect(reviewBtn).toBeInTheDocument();

    fireEvent.click(reviewBtn);

    expect(screen.getByText('「talo」に「〜の中で」を付ける形は？')).toBeInTheDocument();
  });
});
