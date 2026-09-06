import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  GRAMMAR_CATEGORIES,
  grammarTopics,
  getAllPracticeQuestions,
  getQuestionsByCategory,
  getQuestionsByTopic
} from '../data/grammarData';
import { playAudio } from '../utils/audio';
import '../assets/App.css';

const LOCAL_STORAGE_MISTAKES_KEY = 'finnish_grammar_mistakes';

function GrammarPractice() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTopic = searchParams.get('topic') || 'all';

  // Setup state
  const [mode, setMode] = useState('setup'); // 'setup' | 'session' | 'summary'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState(initialTopic);
  const [selectedType, setSelectedType] = useState('all'); // 'all' | 'choice' | 'wordbank' | 'typing'
  const [questionCount, setQuestionCount] = useState(5);
  const [mistakeBank, setMistakeBank] = useState([]);

  // Session state
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [sessionMistakes, setSessionMistakes] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Load saved mistakes on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_MISTAKES_KEY);
      if (saved) {
        setMistakeBank(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load mistakes from localStorage', e);
    }
  }, []);

  // Sync initial topic param
  useEffect(() => {
    if (initialTopic !== 'all') {
      const found = grammarTopics.find((t) => t.id === initialTopic);
      if (found) {
        setSelectedTopic(initialTopic);
        setSelectedCategory(found.category);
      }
    }
  }, [initialTopic]);

  // Start Practice Drill
  const handleStartDrill = (isReviewMode = false) => {
    let pool = [];

    if (isReviewMode) {
      if (mistakeBank.length === 0) return;
      pool = [...mistakeBank];
    } else {
      if (selectedTopic !== 'all') {
        pool = getQuestionsByTopic(selectedTopic);
      } else if (selectedCategory !== 'all') {
        pool = getQuestionsByCategory(selectedCategory);
      } else {
        pool = getAllPracticeQuestions();
      }

      if (selectedType !== 'all') {
        pool = pool.filter((q) => q.type === selectedType);
      }
    }

    if (pool.length === 0) {
      alert('条件に一致する問題がありません。カテゴリや問題形式を変更してください。');
      return;
    }

    // Shuffle
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const targetCount = isReviewMode ? Math.min(shuffled.length, 10) : Math.min(shuffled.length, questionCount);
    const selectedList = shuffled.slice(0, targetCount);

    setQuestions(selectedList);
    setCurrentIndex(0);
    setCurrentAnswer('');
    setIsSubmitted(false);
    setIsCorrect(false);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setSessionMistakes([]);
    setStartTime(Date.now());
    setElapsedTime(0);
    setMode('session');
  };

  const currentQ = questions[currentIndex];

  // Helper for Finnish accent character insertion
  const handleInsertChar = (char) => {
    setCurrentAnswer((prev) => prev + char);
  };

  // Submit Answer
  const handleSubmitAnswer = () => {
    if (!currentAnswer || !currentAnswer.trim() || isSubmitted) return;

    const trimmedUser = currentAnswer.trim().toLowerCase();
    const trimmedTarget = String(currentQ.answer).trim().toLowerCase();
    const correct = trimmedUser === trimmedTarget;

    setIsCorrect(correct);
    setIsSubmitted(true);

    if (correct) {
      setScore((prev) => prev + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);

      // If in review mode, remove from mistake bank if answered correctly
      if (selectedCategory === 'mistakes' || mistakeBank.some((m) => m.id === currentQ.id)) {
        const updatedBank = mistakeBank.filter((m) => m.id !== currentQ.id);
        setMistakeBank(updatedBank);
        try {
          localStorage.setItem(LOCAL_STORAGE_MISTAKES_KEY, JSON.stringify(updatedBank));
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      setStreak(0);
      setSessionMistakes((prev) => [...prev, currentQ]);

      // Add to mistake bank if not already present
      if (!mistakeBank.some((m) => m.id === currentQ.id)) {
        const newBank = [
          ...mistakeBank,
          {
            ...currentQ,
            savedAt: Date.now()
          }
        ];
        setMistakeBank(newBank);
        try {
          localStorage.setItem(LOCAL_STORAGE_MISTAKES_KEY, JSON.stringify(newBank));
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  // Move to next question or complete session
  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setCurrentAnswer('');
      setIsSubmitted(false);
      setIsCorrect(false);
    } else {
      // Completed
      const elapsed = Math.round((Date.now() - (startTime || Date.now())) / 1000);
      setElapsedTime(elapsed);
      setMode('summary');
    }
  };

  // Keydown handler (Enter to check or next)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (!isSubmitted) {
        handleSubmitAnswer();
      } else {
        handleNextQuestion();
      }
    }
  };

  return (
    <div className="grammar-practice-container">
      {/* ================= MODE: SETUP ================= */}
      {mode === 'setup' && (
        <div className="practice-setup-card">
          <div className="setup-header">
            <button className="back-hub-link" onClick={() => navigate('/grammar')}>
              ← 文法体系トップへ戻る
            </button>
            <h1 className="setup-title">🎯 文法演習スタジオ（Drill Studio）</h1>
            <p className="setup-subtitle">
              フィンランド語の文法規則・格変化・動詞活用を反復ドリルで身につけましょう。
            </p>
          </div>

          {/* Quick Stats & Mistake Bank Banner */}
          <div className="setup-stats-banner">
            <div className="stat-pill">
              <span className="stat-icon">📚</span>
              <span>利用可能な総問題数: <strong>{getAllPracticeQuestions().length}問</strong></span>
            </div>
            <div className="stat-pill">
              <span className="stat-icon">⚠️</span>
              <span>弱点バンク: <strong>{mistakeBank.length}問</strong></span>
            </div>
            {mistakeBank.length > 0 && (
              <button
                type="button"
                className="review-mistakes-btn"
                onClick={() => {
                  setSelectedCategory('mistakes');
                  handleStartDrill(true);
                }}
              >
                🔥 弱点集中特訓を始める ({mistakeBank.length}問)
              </button>
            )}
          </div>

          {/* Setup Form */}
          <div className="setup-options-grid">
            {/* Category Filter */}
            <div className="setup-section">
              <label className="section-label">1. 特訓カテゴリを選択</label>
              <div className="filter-chips">
                {GRAMMAR_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`filter-chip ${selectedCategory === cat.id ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setSelectedTopic('all');
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Topic Filter */}
            <div className="setup-section">
              <label className="section-label">2. 特定の文法トピックに絞り込む（任意）</label>
              <select
                className="topic-select"
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
              >
                <option value="all">すべてのトピック（総合演習）</option>
                {grammarTopics
                  .filter((t) => selectedCategory === 'all' || t.category === selectedCategory)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.level}] {t.title}
                    </option>
                  ))}
              </select>
            </div>

            {/* Question Format */}
            <div className="setup-section">
              <label className="section-label">3. 出題形式</label>
              <div className="format-chips">
                <button
                  type="button"
                  className={`filter-chip ${selectedType === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedType('all')}
                >
                  🎲 すべての形式
                </button>
                <button
                  type="button"
                  className={`filter-chip ${selectedType === 'choice' ? 'active' : ''}`}
                  onClick={() => setSelectedType('choice')}
                >
                  🔘 4択クイズ
                </button>
                <button
                  type="button"
                  className={`filter-chip ${selectedType === 'typing' ? 'active' : ''}`}
                  onClick={() => setSelectedType('typing')}
                >
                  ⌨️ 記述・タイピング入力
                </button>
                <button
                  type="button"
                  className={`filter-chip ${selectedType === 'wordbank' ? 'active' : ''}`}
                  onClick={() => setSelectedType('wordbank')}
                >
                  🧩 並び替え・チップ
                </button>
              </div>
            </div>

            {/* Question Count */}
            <div className="setup-section">
              <label className="section-label">4. 問題数</label>
              <div className="count-buttons">
                {[5, 10, 15].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    className={`count-btn ${questionCount === cnt ? 'active' : ''}`}
                    onClick={() => setQuestionCount(cnt)}
                  >
                    {cnt} 問
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="setup-actions">
            <button
              type="button"
              className="start-session-btn"
              onClick={() => handleStartDrill(false)}
            >
              🚀 ドリルを開始する
            </button>
          </div>
        </div>
      )}

      {/* ================= MODE: SESSION ================= */}
      {mode === 'session' && currentQ && (
        <div className="practice-session-card" onKeyDown={handleKeyDown} tabIndex={0}>
          {/* Top Progress & Stats */}
          <div className="session-top-bar">
            <button
              type="button"
              className="exit-btn"
              onClick={() => {
                if (window.confirm('演習を中断して設定に戻りますか？')) {
                  setMode('setup');
                }
              }}
            >
              ✕ 中断
            </button>

            <div className="session-progress-wrapper">
              <div
                className="session-progress-bar"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>

            <div className="session-indicators">
              <span className="q-counter">
                {currentIndex + 1} / {questions.length}
              </span>
              {streak > 1 && (
                <span className="streak-badge">
                  🔥 {streak} 連続正解!
                </span>
              )}
            </div>
          </div>

          {/* Question Metadata */}
          <div className="drill-question-header">
            <span className={`level-badge level-${(currentQ.level || 'a1').toLowerCase()}`}>
              {currentQ.level || 'A1'}
            </span>
            <span className="drill-topic-name">{currentQ.topicTitle}</span>
            <button
              type="button"
              className="drill-audio-btn"
              title="発音を再生"
              onClick={() => playAudio(currentQ.answer || currentQ.question)}
            >
              🔊
            </button>
          </div>

          {/* Question Body */}
          <div className="drill-question-box">
            <h2 className="drill-question-text">{currentQ.question}</h2>
          </div>

          {/* Question Interactive Area */}
          <div className="drill-interaction-area">
            {/* 1. Choice Format */}
            {currentQ.type === 'choice' && (
              <div className="drill-choice-list">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = currentAnswer === opt;
                  let btnClass = 'drill-choice-btn';
                  if (isSubmitted) {
                    if (opt === currentQ.answer) btnClass += ' is-target-correct';
                    else if (isSelected) btnClass += ' is-target-wrong';
                  } else if (isSelected) {
                    btnClass += ' is-active';
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      className={btnClass}
                      disabled={isSubmitted}
                      onClick={() => setCurrentAnswer(opt)}
                    >
                      <span className="choice-number">{idx + 1}</span>
                      <span className="choice-text">{opt}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* 2. Wordbank / Chips */}
            {currentQ.type === 'wordbank' && (
              <div className="drill-wordbank-area">
                <div className="drill-selected-slot">
                  <span className="slot-label">選択した回答:</span>
                  <span className="slot-value">{currentAnswer || '（下の単語チップを選択してください）'}</span>
                </div>
                <div className="drill-chips-grid">
                  {currentQ.words.map((w, idx) => {
                    const isSelected = currentAnswer === w;
                    let chipClass = 'drill-word-chip';
                    if (isSubmitted) {
                      if (w === currentQ.answer) chipClass += ' chip-correct';
                      else if (isSelected) chipClass += ' chip-wrong';
                    } else if (isSelected) {
                      chipClass += ' chip-selected';
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        className={chipClass}
                        disabled={isSubmitted}
                        onClick={() => setCurrentAnswer(w)}
                      >
                        {w}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. Typing / Fill-in format */}
            {currentQ.type === 'typing' && (
              <div className="drill-typing-area">
                <input
                  type="text"
                  className="drill-typing-input"
                  placeholder={currentQ.hint || 'フィンランド語を入力...'}
                  value={currentAnswer}
                  disabled={isSubmitted}
                  autoFocus
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                />

                {!isSubmitted && (
                  <div className="drill-keyboard-helpers">
                    <span className="helper-label">特殊文字:</span>
                    {['ä', 'ö', 'Ä', 'Ö'].map((ch) => (
                      <button
                        key={ch}
                        type="button"
                        className="drill-char-btn"
                        onClick={() => handleInsertChar(ch)}
                      >
                        {ch}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Feedback & Explanation Banner */}
          {isSubmitted && (
            <div className={`drill-feedback-banner ${isCorrect ? 'feed-correct' : 'feed-wrong'}`}>
              <div className="feed-header">
                <span className="feed-status-icon">{isCorrect ? '✅ 正解！' : '❌ 不正解'}</span>
                {!isCorrect && (
                  <span className="correct-answer-pill">
                    正解: <strong>{currentQ.answer}</strong>
                  </span>
                )}
              </div>
              <div className="feed-explanation">
                <p>💡 <strong>解説:</strong> {currentQ.explanation}</p>
              </div>
            </div>
          )}

          {/* Bottom Action Footer */}
          <div className="drill-footer-actions">
            {!isSubmitted ? (
              <button
                type="button"
                className="drill-check-btn"
                disabled={!currentAnswer || !currentAnswer.trim()}
                onClick={handleSubmitAnswer}
              >
                回答を確認する (Enter)
              </button>
            ) : (
              <button
                type="button"
                className="drill-next-btn"
                autoFocus
                onClick={handleNextQuestion}
              >
                {currentIndex + 1 < questions.length ? '次の問題へ ➔' : '結果を見る 🎉'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ================= MODE: SUMMARY ================= */}
      {mode === 'summary' && (
        <div className="practice-summary-card">
          <div className="summary-header">
            <span className="summary-trophy">
              {score === questions.length ? '🏆' : score >= questions.length * 0.7 ? '🌟' : '💪'}
            </span>
            <h1 className="summary-title">演習セッション完了！</h1>
            <p className="summary-msg">
              {score === questions.length
                ? '完璧です！全問正解を達成しました！'
                : score >= questions.length * 0.7
                ? '素晴らしい成果です！着実に文法力が身についています。'
                : 'ナイスファイト！間違えた問題を復習して再挑戦しましょう。'}
            </p>
          </div>

          <div className="summary-stats-grid">
            <div className="summary-stat-box">
              <span className="stat-label">正解数 / 出題数</span>
              <span className="stat-number">{score} / {questions.length}</span>
              <span className="stat-sub">({Math.round((score / questions.length) * 100)}%)</span>
            </div>
            <div className="summary-stat-box">
              <span className="stat-label">最高連続正解</span>
              <span className="stat-number">{maxStreak} 問</span>
              <span className="stat-sub">Streak 🔥</span>
            </div>
            <div className="summary-stat-box">
              <span className="stat-label">所要時間</span>
              <span className="stat-number">{elapsedTime} 秒</span>
              <span className="stat-sub">Time ⏱️</span>
            </div>
          </div>

          {/* Mistakes review */}
          {sessionMistakes.length > 0 && (
            <div className="summary-mistakes-section">
              <h3>⚠️ 今回間違えた問題 ({sessionMistakes.length}問)</h3>
              <div className="mistakes-list">
                {sessionMistakes.map((m, idx) => (
                  <div key={idx} className="mistake-item-card">
                    <div className="mistake-item-topic">
                      <span className="topic-badge">{m.topicTitle}</span>
                    </div>
                    <p className="mistake-q">問: {m.question}</p>
                    <p className="mistake-ans">正解: <strong>{m.answer}</strong></p>
                    <p className="mistake-exp">💡 {m.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="summary-footer-actions">
            {sessionMistakes.length > 0 && (
              <button
                type="button"
                className="retry-mistakes-btn"
                onClick={() => {
                  setQuestions(sessionMistakes);
                  setCurrentIndex(0);
                  setCurrentAnswer('');
                  setIsSubmitted(false);
                  setIsCorrect(false);
                  setScore(0);
                  setStreak(0);
                  setMaxStreak(0);
                  setSessionMistakes([]);
                  setStartTime(Date.now());
                  setMode('session');
                }}
              >
                🔥 間違えた問題だけを再特訓 ({sessionMistakes.length}問)
              </button>
            )}

            <button
              type="button"
              className="replay-btn"
              onClick={() => handleStartDrill(false)}
            >
              🔄 同じ設定でもう一度解く
            </button>

            <button
              type="button"
              className="return-setup-btn"
              onClick={() => setMode('setup')}
            >
              ⚙️ 特訓設定を変える
            </button>

            <button
              type="button"
              className="return-hub-btn"
              onClick={() => navigate('/grammar')}
            >
              📖 文法一覧に戻る
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GrammarPractice;
