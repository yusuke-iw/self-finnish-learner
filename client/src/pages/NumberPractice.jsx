import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/useLanguage';
import { playAudio } from '../utils/audio';
import { getRandomSpeaker } from '../utils/speakers';
import { playCorrectSound, playIncorrectSound, playLessonCompleteSound } from '../utils/feedbackSounds';
import { recordAnswer } from '../utils/studyStats';
import { generateNumberQuestion, checkNumberAnswer } from '../utils/numberPractice';

const TOTAL_QUESTIONS = 10;
const NUMBER_RANGES = [99, 999, 9999];

export default function NumberPractice() {
  const { t } = useLanguage();
  const [mode, setMode] = useState('number');
  const [numberRange, setNumberRange] = useState(99);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questionId, setQuestionId] = useState(1);
  const [question, setQuestion] = useState(() => generateNumberQuestion('number', { max: 99 }));
  const [speaker, setSpeaker] = useState(() => getRandomSpeaker());
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const inputRef = useRef(null);
  const autoPlayedIdRef = useRef(null);

  useEffect(() => {
    if (isFinished || !question) {
      return;
    }
    if (autoPlayedIdRef.current === questionId) {
      return;
    }
    autoPlayedIdRef.current = questionId;
    try {
      const p = playAudio(question.finnishText, question.finnishText, 'fi-FI', 1.0, speaker);
      if (p && typeof p.catch === 'function') {
        p.catch(() => {});
      }
    } catch {
      // ignore autoplay errors
    }
  }, [questionId, isFinished, question, speaker]);

  const startNewSet = (nextMode = mode, nextRange = numberRange) => {
    setMode(nextMode);
    setNumberRange(nextRange);
    setQuestionIndex(0);
    setScore(0);
    setIsFinished(false);
    setFeedback(null);
    setInputValue('');
    setSpeaker(getRandomSpeaker());
    setQuestion(generateNumberQuestion(nextMode, { max: nextRange }));
    setQuestionId((id) => id + 1);
  };

  const handleSubmit = () => {
    if (isFinished || feedback || !inputValue.trim()) {
      return;
    }
    const isCorrect = checkNumberAnswer(question, inputValue);
    recordAnswer();
    if (isCorrect) {
      setScore((s) => s + 1);
      playCorrectSound();
    } else {
      playIncorrectSound();
    }
    setFeedback({
      isCorrect,
      displayAnswer: question.displayAnswer,
      finnishText: question.finnishText
    });
  };

  const handleNext = () => {
    if (questionIndex < TOTAL_QUESTIONS - 1) {
      setQuestionIndex((i) => i + 1);
      setFeedback(null);
      setInputValue('');
      setSpeaker(getRandomSpeaker());
      setQuestion(generateNumberQuestion(mode, { max: numberRange }));
      setQuestionId((id) => id + 1);
    } else {
      setIsFinished(true);
      playLessonCompleteSound();
    }
  };

  const enterKeyHandlerRef = useRef(null);
  useEffect(() => {
    enterKeyHandlerRef.current = (e) => {
      if (isFinished) return;
      if (e.key !== 'Enter') return;
      if (e.isComposing || e.keyCode === 229) return;

      if (feedback) {
        e.preventDefault();
        handleNext();
      } else if (inputValue.trim()) {
        e.preventDefault();
        handleSubmit();
      }
    };
  });

  useEffect(() => {
    const onKeyDown = (e) => enterKeyHandlerRef.current?.(e);
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const placeholderText =
    mode === 'price'
      ? t('numbers.placeholderPrice')
      : mode === 'time-official'
        ? t('numbers.placeholderTimeOfficial')
        : mode === 'time-everyday'
          ? t('numbers.placeholderTimeEveryday')
          : t('numbers.placeholderNumber');

  const progressPercent = (questionIndex / TOTAL_QUESTIONS) * 100;

  return (
    <div className="session-page number-practice-page">
      <h2 className="number-practice-title">{t('numbers.title')}</h2>

      <div className="number-mode-tabs" role="tablist">
        <button
          type="button"
          className={`number-mode-tab ${mode === 'number' ? 'active' : ''}`}
          onClick={() => startNewSet('number', numberRange)}
        >
          {t('numbers.modeNumber')}
        </button>
        <button
          type="button"
          className={`number-mode-tab ${mode === 'price' ? 'active' : ''}`}
          onClick={() => startNewSet('price', numberRange)}
        >
          {t('numbers.modePrice')}
        </button>
        <button
          type="button"
          className={`number-mode-tab ${mode === 'time-official' ? 'active' : ''}`}
          onClick={() => startNewSet('time-official', numberRange)}
        >
          {t('numbers.modeTimeOfficial')}
        </button>
        <button
          type="button"
          className={`number-mode-tab ${mode === 'time-everyday' ? 'active' : ''}`}
          onClick={() => startNewSet('time-everyday', numberRange)}
        >
          {t('numbers.modeTimeEveryday')}
        </button>
      </div>

      {mode === 'number' && (
        <div className="number-range-selector">
          <span className="number-range-label">{t('numbers.rangeLabel')}</span>
          {NUMBER_RANGES.map((maxVal) => (
            <button
              key={maxVal}
              type="button"
              className={`number-range-btn ${numberRange === maxVal ? 'active' : ''}`}
              onClick={() => startNewSet('number', maxVal)}
            >
              0〜{maxVal}
            </button>
          ))}
        </div>
      )}

      {isFinished ? (
        <div className="session-summary">
          <span className="summary-icon">🎉</span>
          <h3>{t('numbers.completedTitle')}</h3>
          <div className="score-display">
            {t('numbers.scoreResult', { score, total: TOTAL_QUESTIONS })}
          </div>
          <div className="summary-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={() => startNewSet(mode, numberRange)}
            >
              {t('numbers.retryBtn')}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="progress-container">
            <div className="progress-info">
              <span>{t('session.questionOf', { current: questionIndex + 1, total: TOTAL_QUESTIONS })}</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <div
            className={`question-card ${
              feedback?.isCorrect ? 'correct-flash' : ''
            } ${feedback && !feedback.isCorrect ? 'incorrect-flash' : ''}`}
          >
            <div className="question-card-header">
              <span className="level-badge level-1">
                {mode === 'price'
                  ? '€'
                  : mode === 'time-official'
                    ? '24h'
                    : mode === 'time-everyday'
                      ? '12h'
                      : `0–${numberRange}`}
              </span>
              {speaker && (
                <div
                  data-testid="speaker-badge"
                  className="speaker-badge"
                  title={speaker.description}
                >
                  <span className="speaker-badge-icon">{speaker.icon}</span>
                  <span>{speaker.name}</span>
                </div>
              )}
            </div>

            <div className="question-prompt">
              <span className="instruction">{t('numbers.instruction')}</span>
              <div className="prompt-text-container">
                <div className="listening-audio-controls">
                  <button
                    type="button"
                    className="btn-audio prompt-audio"
                    onClick={() =>
                      playAudio(question.finnishText, question.finnishText, 'fi-FI', 1.0, speaker)
                    }
                    title={t('session.listenNormal')}
                  >
                    🔊
                  </button>
                  <button
                    type="button"
                    className="btn-audio prompt-audio slow"
                    onClick={() =>
                      playAudio(question.finnishText, question.finnishText, 'fi-FI', 0.6, speaker)
                    }
                    title={t('session.listenSlow')}
                  >
                    🐢
                  </button>
                </div>
              </div>
            </div>

            <div className="typing-area">
              <input
                ref={inputRef}
                type="text"
                className="typing-input"
                placeholder={placeholderText}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={Boolean(feedback)}
                autoFocus
              />
            </div>

            {feedback && (
              <div className={`feedback ${feedback.isCorrect ? 'correct' : 'incorrect'}`}>
                <div>
                  <div>{feedback.isCorrect ? t('common.correct') : t('common.incorrect')}</div>
                  <div className="correct-answer-container">
                    <span className="correct-text">
                      {t('numbers.correctAnswerLabel')}{' '}
                      <strong>
                        {mode === 'price' ? `${feedback.displayAnswer} €` : feedback.displayAnswer}
                      </strong>
                    </span>
                    <span className="correct-text">
                      {t('numbers.finnishLabel')} {feedback.finnishText}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="question-actions">
              {!feedback ? (
                <button
                  type="button"
                  className="btn-check"
                  onClick={handleSubmit}
                  disabled={!inputValue.trim()}
                >
                  {t('numbers.submitBtn')}
                </button>
              ) : (
                <button type="button" className="btn-next" onClick={handleNext}>
                  {t('numbers.nextBtn')}
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
