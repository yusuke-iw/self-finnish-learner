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
import { useLanguage } from '../context/LanguageContext';
import { fetchProgress, saveProgress } from '../services/api';
import '../assets/App.css';

const LOCAL_STORAGE_MISTAKES_KEY = 'finnish_grammar_mistakes';

function GrammarPractice() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
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

  // Load saved mistakes on mount and sync with server
  useEffect(() => {
    let localBank = [];
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_MISTAKES_KEY);
      if (saved) {
        localBank = JSON.parse(saved);
        setMistakeBank(localBank);
      }
    } catch (e) {
      console.error('Failed to load mistakes from localStorage', e);
    }

    if (typeof fetchProgress === 'function') {
      try {
        const p = fetchProgress();
        if (p && typeof p.then === 'function') {
          p.then(res => {
            if (res?.data?.success && Array.isArray(res.data.data?.mistakes)) {
              const serverMistakes = res.data.data.mistakes;
              const map = new Map();
              [...serverMistakes, ...localBank].forEach(m => {
                if (m?.id || m?.question) map.set(m.id || m.question, m);
              });
              const merged = Array.from(map.values());
              localStorage.setItem(LOCAL_STORAGE_MISTAKES_KEY, JSON.stringify(merged));
              setMistakeBank(merged);
            }
          }).catch(() => {});
        }
      } catch (e) {}
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
          if (typeof saveProgress === 'function') {
            const p = saveProgress({ mistakes: updatedBank });
            if (p && typeof p.catch === 'function') p.catch(() => {});
          }
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
          if (typeof saveProgress === 'function') {
            const p = saveProgress({ mistakes: newBank });
            if (p && typeof p.catch === 'function') p.catch(() => {});
          }
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
              {t('drillStudio.backToHub')}
            </button>
            <h1 className="setup-title">{t('drillStudio.title')}</h1>
            <p className="setup-subtitle">
              {t('drillStudio.subtitle')}
            </p>
          </div>

          {/* Quick Stats & Mistake Bank Banner */}
          <div className="setup-stats-banner">
            <div className="stat-pill">
              <span className="stat-icon">📚</span>
              <span>{t('drillStudio.totalAvailable')} <strong>{getAllPracticeQuestions().length}問</strong></span>
            </div>
            <div className="stat-pill">
              <span className="stat-icon">⚠️</span>
              <span>{t('drillStudio.weaknessTitle')} <strong>{mistakeBank.length}問</strong></span>
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
                {t('drillStudio.weaknessBtn', { count: mistakeBank.length })}
              </button>
            )}
          </div>

          {/* Setup Form */}
          <div className="setup-options-grid">
            {/* Category Filter */}
            <div className="setup-section">
              <label className="section-label">{t('drillStudio.stepCategory')}</label>
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
                    {language === 'en' ? t(`grammarCategories.${cat.id}`) : cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Topic Filter */}
            <div className="setup-section">
              <label className="section-label">{t('drillStudio.stepTopic')}</label>
              <select
                className="topic-select"
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
              >
                <option value="all">{t('drillStudio.allTopics')}</option>
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
              <label className="section-label">{t('drillStudio.stepFormat')}</label>
              <div className="format-chips">
                <button
                  type="button"
                  className={`filter-chip ${selectedType === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedType('all')}
                >
                  {t('drillStudio.formatAll')}
                </button>
                <button
                  type="button"
                  className={`filter-chip ${selectedType === 'choice' ? 'active' : ''}`}
                  onClick={() => setSelectedType('choice')}
                >
                  {t('drillStudio.formatChoice')}
                </button>
                <button
                  type="button"
                  className={`filter-chip ${selectedType === 'typing' ? 'active' : ''}`}
                  onClick={() => setSelectedType('typing')}
                >
                  {t('drillStudio.formatTyping')}
                </button>
                <button
                  type="button"
                  className={`filter-chip ${selectedType === 'wordbank' ? 'active' : ''}`}
                  onClick={() => setSelectedType('wordbank')}
                >
                  {t('drillStudio.formatWordbank')}
                </button>
              </div>
            </div>

            {/* Question Count */}
            <div className="setup-section">
              <label className="section-label">{t('drillStudio.stepCount')}</label>
              <div className="count-buttons">
                {[5, 10, 15].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    className={`count-btn ${questionCount === cnt ? 'active' : ''}`}
                    onClick={() => setQuestionCount(cnt)}
                  >
                    {t('drillStudio.questionsCount', { count: cnt })}
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
              {t('drillStudio.startBtn')}
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
                  <span className="slot-label">{t('drillStudio.selectedAnswerLabel')}</span>
                  <span className="slot-value">{currentAnswer || t('drillStudio.selectChipHint')}</span>
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
                  placeholder={currentQ.hint || t('drillStudio.inputPlaceholder')}
                  value={currentAnswer}
                  disabled={isSubmitted}
                  autoFocus
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                />

                {!isSubmitted && (
                  <div className="drill-keyboard-helpers">
                    <span className="helper-label">{language === 'en' ? 'Special Chars:' : '特殊文字:'}</span>
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
                <span className="feed-status-icon">{isCorrect ? t('drillStudio.correctBanner') : t('drillStudio.incorrectBanner')}</span>
                {!isCorrect && (
                  <span className="correct-answer-pill">
                    {t('drillStudio.correctAnswerLabel')} <strong>{currentQ.answer}</strong>
                  </span>
                )}
              </div>
              <div className="feed-explanation">
                <p>💡 <strong>{t('drillStudio.explanationLabel')}</strong> {currentQ.explanation}</p>
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
                {language === 'en' ? 'Submit Answer (Enter)' : '回答を確認する (Enter)'}
              </button>
            ) : (
              <button
                type="button"
                className="drill-next-btn"
                autoFocus
                onClick={handleNextQuestion}
              >
                {currentIndex + 1 < questions.length ? t('drillStudio.nextBtn') : t('drillStudio.finishBtn')}
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
            <h1 className="summary-title">{t('drillStudio.completedTitle')}</h1>
            <p className="summary-msg">
              {score === questions.length
                ? (language === 'en' ? 'Awesome! Perfect score on all exercises!' : '完璧です！全問正解を達成しました！')
                : score >= questions.length * 0.7
                ? (language === 'en' ? 'Great progress! Your grammar skills are improving fast.' : '素晴らしい成果です！着実に文法力が身についています。')
                : (language === 'en' ? 'Good effort! Review the missed questions and try again.' : 'ナイスファイト！間違えた問題を復習して再挑戦しましょう。')}
            </p>
          </div>

          <div className="summary-stats-grid">
            <div className="summary-stat-box">
              <span className="stat-label">{language === 'en' ? 'Score' : '正解数 / 出題数'}</span>
              <span className="stat-number">{score} / {questions.length}</span>
              <span className="stat-sub">({Math.round((score / questions.length) * 100)}%)</span>
            </div>
            <div className="summary-stat-box">
              <span className="stat-label">{t('drillStudio.maxStreakLabel')}</span>
              <span className="stat-number">{maxStreak} {language === 'en' ? 'Qs' : '問'}</span>
              <span className="stat-sub">Streak 🔥</span>
            </div>
            <div className="summary-stat-box">
              <span className="stat-label">{t('drillStudio.timeLabel')}</span>
              <span className="stat-number">{elapsedTime} {language === 'en' ? 's' : '秒'}</span>
              <span className="stat-sub">Time ⏱️</span>
            </div>
          </div>

          {/* Mistakes review */}
          {sessionMistakes.length > 0 && (
            <div className="summary-mistakes-section">
              <h3>⚠️ {language === 'en' ? `Review Missed Questions (${sessionMistakes.length})` : `今回間違えた問題 (${sessionMistakes.length}問)`}</h3>
              <div className="mistakes-list">
                {sessionMistakes.map((m, idx) => (
                  <div key={idx} className="mistake-item-card">
                    <div className="mistake-item-topic">
                      <span className="topic-badge">{m.topicTitle}</span>
                    </div>
                    <p className="mistake-q">{language === 'en' ? 'Question:' : '問:'} {m.question}</p>
                    <p className="mistake-your-ans">{language === 'en' ? 'Your answer:' : 'あなたの回答:'} <span className="your-ans-text">{m.userAnswer || '未回答'}</span></p>
                    <p className="mistake-correct-ans">{language === 'en' ? 'Correct answer:' : '正解:'} <strong>{m.answer}</strong></p>
                    <p className="mistake-exp">💡 {m.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="summary-actions-grid">
            {sessionMistakes.length > 0 && (
              <button
                type="button"
                className="summary-btn btn-weakness"
                onClick={() => {
                  setSelectedCategory('mistakes');
                  handleStartDrill(true);
                }}
              >
                {t('drillStudio.retryWeaknessBtn', { count: sessionMistakes.length })}
              </button>
            )}

            <button
              type="button"
              className="summary-btn btn-retry"
              onClick={() => handleStartDrill(false)}
            >
              {t('drillStudio.retrySameBtn')}
            </button>

            <button
              type="button"
              className="summary-btn btn-settings"
              onClick={() => setMode('setup')}
            >
              {t('drillStudio.changeSettingsBtn')}
            </button>

            <button
              type="button"
              className="summary-btn btn-home"
              onClick={() => navigate('/grammar')}
            >
              {t('drillStudio.backToHubBtn')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GrammarPractice;
