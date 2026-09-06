import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import GrammarHub from '../GrammarHub';
import GrammarDetail from '../GrammarDetail';
import { BrowserRouter, useNavigate, useParams } from 'react-router-dom';
import * as audioUtils from '../../utils/audio';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
    useParams: vi.fn()
  };
});

vi.mock('../../utils/audio', () => ({
  playAudio: vi.fn()
}));

describe('GrammarHub Component', () => {
  let mockNavigate;

  beforeEach(() => {
    mockNavigate = vi.fn();
    useNavigate.mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders title, category tabs and grammar topic cards', () => {
    render(
      <BrowserRouter>
        <GrammarHub />
      </BrowserRouter>
    );

    expect(screen.getByText(/フィンランド語 文法・イディオム体系学習/i)).toBeInTheDocument();
    expect(screen.getByText('母音調和 (Vokaaliharmonia)')).toBeInTheDocument();
    expect(screen.getByText('子音段階変化 (Astevaihtelu / KTP-sääntö)')).toBeInTheDocument();
    expect(screen.getByText('重要イディオム・口語表現（Idiomit & Puhekieli）')).toBeInTheDocument();
  });

  it('filters topics by category tab', () => {
    render(
      <BrowserRouter>
        <GrammarHub />
      </BrowserRouter>
    );

    const idiomTab = screen.getByRole('button', { name: 'イディオム・口語（Idiomit & Puhekieli）' });
    fireEvent.click(idiomTab);

    expect(screen.getByText('重要イディオム・口語表現（Idiomit & Puhekieli）')).toBeInTheDocument();
    expect(screen.queryByText('母音調和 (Vokaaliharmonia)')).not.toBeInTheDocument();
  });

  it('filters topics by search query', () => {
    render(
      <BrowserRouter>
        <GrammarHub />
      </BrowserRouter>
    );

    const searchInput = screen.getByPlaceholderText(/文法項目やキーワードを検索/i);
    fireEvent.change(searchInput, { target: { value: 'Partitiivi' } });

    expect(screen.getByText('分格 (Partitiivi)')).toBeInTheDocument();
    expect(screen.queryByText('動詞の6つのタイプ (Verbityypit 1-6)')).not.toBeInTheDocument();
  });

  it('navigates to topic detail page when card is clicked', () => {
    render(
      <BrowserRouter>
        <GrammarHub />
      </BrowserRouter>
    );

    const cardTitle = screen.getByText('母音調和 (Vokaaliharmonia)');
    fireEvent.click(cardTitle);

    expect(mockNavigate).toHaveBeenCalledWith('/grammar/vokaaliharmonia');
  });

  it('navigates to drill studio from GrammarHub banner', () => {
    render(
      <BrowserRouter>
        <GrammarHub />
      </BrowserRouter>
    );

    const drillBtn = screen.getByRole('button', { name: /🚀 今すぐ特訓を始める/i });
    fireEvent.click(drillBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/grammar/practice');
  });
});

describe('GrammarDetail Component', () => {
  let mockNavigate;

  beforeEach(() => {
    mockNavigate = vi.fn();
    useNavigate.mockReturnValue(mockNavigate);
    useParams.mockReturnValue({ topicId: 'vokaaliharmonia' });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders topic title and rules', () => {
    render(
      <BrowserRouter>
        <GrammarDetail />
      </BrowserRouter>
    );

    expect(screen.getByText('母音調和 (Vokaaliharmonia)')).toBeInTheDocument();
    expect(screen.getByText(/前母音グループ/i)).toBeInTheDocument();
  });

  it('switches tabs to view examples and triggers TTS audio playback', () => {
    render(
      <BrowserRouter>
        <GrammarDetail />
      </BrowserRouter>
    );

    const examplesTab = screen.getByRole('button', { name: /🔊 例文と発音/i });
    fireEvent.click(examplesTab);

    expect(screen.getByText('Suomessa on paljon järviä.')).toBeInTheDocument();

    const audioBtns = screen.getAllByTitle('発音を聞く');
    fireEvent.click(audioBtns[0]);

    expect(audioUtils.playAudio).toHaveBeenCalledWith('Suomessa on paljon järviä.');
  });

  it('navigates to drill studio with topic filter when clicked in quiz tab', () => {
    render(
      <BrowserRouter>
        <GrammarDetail />
      </BrowserRouter>
    );

    const quizTab = screen.getByRole('button', { name: /✏️ 確認テスト/i });
    fireEvent.click(quizTab);

    const drillBtn = screen.getByRole('button', { name: /🎯 演習スタジオで特訓/i });
    fireEvent.click(drillBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/grammar/practice?topic=vokaaliharmonia');
  });

  it('allows answering practice quiz and shows score summary', () => {
    render(
      <BrowserRouter>
        <GrammarDetail />
      </BrowserRouter>
    );

    const quizTab = screen.getByRole('button', { name: /✏️ 確認テスト/i });
    fireEvent.click(quizTab);

    // Select options for questions
    const option1 = screen.getByText('talossa');
    fireEvent.click(option1);

    const option2 = screen.getByText('metsässä');
    fireEvent.click(option2);

    const wordbankOption = screen.getByText('Helsingissä');
    fireEvent.click(wordbankOption);

    // Typing question
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'tytössä' } });

    // Question 5 (kirjakaupassa)
    const option5 = screen.getByText('kirjakaupassa');
    fireEvent.click(option5);

    const submitBtn = screen.getByText('回答を送信する');
    fireEvent.click(submitBtn);

    expect(screen.getAllByText(/正解！/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/結果: 5問中 5問正解！/i)).toBeInTheDocument();
  });

  it('shows not found message for invalid topicId', () => {
    useParams.mockReturnValue({ topicId: 'invalid-topic-id' });

    render(
      <BrowserRouter>
        <GrammarDetail />
      </BrowserRouter>
    );

    expect(screen.getByText('文法項目が見つかりませんでした。')).toBeInTheDocument();
  });
});
