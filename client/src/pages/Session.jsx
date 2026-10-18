import React, { useState, useEffect, useRef } from 'react';
import { generateSession, checkAnswer, saveProgress } from '../services/api';
import { playAudio } from '../utils/audio';
import { getRandomSpeaker } from '../utils/speakers';
import { playCorrectSound, playIncorrectSound, playLessonCompleteSound } from '../utils/feedbackSounds';
import { replaceNumbersWithFinnishWords } from '../utils/numberToFinnish';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/useLanguage';
import { useProgressStore } from '../store/useProgressStore';
import { findLessonById, findLessonByTitle } from '../data/curriculumData';
import { PASS_THRESHOLD, isSessionPassed } from '../utils/sessionResult';
import { getSessionLength, setSessionLength } from '../utils/sessionPreferences';
import { getDueKeys, recordReviewResult } from '../utils/reviewSchedule';
import { recordAnswer } from '../utils/studyStats';
import SpecialCharBar from '../components/SpecialCharBar';

export default function Session() {
  const { language, t } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const lessonIdParam = searchParams.get('lessonId');
  const categoryParam = searchParams.get('category');
  const levelParam = searchParams.get('level') ? Number(searchParams.get('level')) : null;
  const exerciseTypeParam = searchParams.get('exerciseType');
  const isReviewMode = searchParams.get('review') === '1';

  const matchedLesson = lessonIdParam
    ? findLessonById(lessonIdParam)
    : categoryParam
      ? findLessonByTitle(categoryParam)
      : null;
  const resolvedLessonId = matchedLesson ? matchedLesson.id : lessonIdParam;
  const resolvedCategory = matchedLesson ? matchedLesson.title : categoryParam;

  const [session, setSession] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sentenceCount, setSentenceCount] = useState(() => getSessionLength());
  const [currentSpeaker, setCurrentSpeaker] = useState(() => getRandomSpeaker());

  const [selectedWords, setSelectedWords] = useState([]); // for word bank
  const [inputValue, setInputValue] = useState(''); // for typing, fill-in, and speaking
  const inputRef = useRef(null);

  // Matching Pairs state
  const [selectedMatchingTokens, setSelectedMatchingTokens] = useState([]);
  const [matchedPairIds, setMatchedPairIds] = useState([]);
  const [wrongMatch, setWrongMatch] = useState(false);

  // Speaking state
  const [isRecording, setIsRecording] = useState(false);

  const [feedback, setFeedback] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  const [score, setScore] = useState({ correct: 0, typo: 0, incorrect: 0 });
  const [isFinished, setIsFinished] = useState(false);
  const [unlockedNext, setUnlockedNext] = useState(false);

  const [isStarting, setIsStarting] = useState(false);
  // Set when generating a session fails; stops the auto-start from retrying in a loop.
  const [startError, setStartError] = useState(null);

  const noReviewSentences = isReviewMode && !session && getDueKeys('sentence').length === 0;

  const resetInput = () => {
    setFeedback(null);
    setSelectedWords([]);
    setInputValue('');
    setSelectedMatchingTokens([]);
    setMatchedPairIds([]);
    setWrongMatch(false);
    setIsChecking(false);
  };

  const startSession = async (
    count = sentenceCount,
    cat = resolvedCategory,
    lvl = levelParam,
    ext = exerciseTypeParam,
    sentenceIds = undefined
  ) => {
    setIsStarting(true);
    setStartError(null);
    try {
      const res = sentenceIds !== undefined
        ? await generateSession(count, cat, lvl, ext, language, sentenceIds)
        : await generateSession(count, cat, lvl, ext, language);
      if (res.data.success) {
        setSession(res.data.data);
        setCurrentIndex(0);
        setCurrentSpeaker(getRandomSpeaker());
        setIsFinished(false);
        setUnlockedNext(false);
        setScore({ correct: 0, typo: 0, incorrect: 0 });
        reviewedSentenceIdsRef.current = new Set();
        resetInput();
      }
    } catch (err) {
      console.error(err);
      setStartError(err.response?.data?.error || 'Failed to generate session');
    }
    setIsStarting(false);
  };

  // Sentences whose review result was already recorded in this session
  const reviewedSentenceIdsRef = useRef(new Set());

  const startSessionRef = useRef(null);
  useEffect(() => {
    startSessionRef.current = startSession;
  });

  // Auto-start if review mode or category/level/exerciseType are provided
  useEffect(() => {
    if (startError) return;
    if (isReviewMode && !session && !isStarting && !isFinished && !noReviewSentences) {
      const count = getSessionLength();
      const dueIds = getDueKeys('sentence').slice(0, count);
      startSessionRef.current?.(count, resolvedCategory, levelParam, exerciseTypeParam, dueIds);
    } else if ((resolvedCategory && levelParam || exerciseTypeParam) && !session && !isStarting && !isFinished) {
      startSessionRef.current?.(getSessionLength(), resolvedCategory, levelParam, exerciseTypeParam);
    }
  }, [isReviewMode, noReviewSentences, resolvedCategory, levelParam, exerciseTypeParam, session, isStarting, isFinished, startError]);

  // Runs when the last question is done, so "Try Again" after a pass keeps the unlock.
  // Returns true when this session unlocked the next level.
  const applyLevelProgress = (finalScore) => {
    if (isReviewMode) {
      return false;
    }
    // Only increment progress if passed from module path
    if (!resolvedLessonId || !levelParam || !isSessionPassed(finalScore, session?.questions?.length || 0)) {
      return false;
    }
    const currentProgressLevel = useProgressStore.getState().progress[resolvedLessonId] || 1;

    // If they just beat the level they were on, increment it (max 4, where 4 = fully complete)
    if (levelParam === currentProgressLevel && currentProgressLevel < 4) {
      useProgressStore.getState().updateLevelProgress(resolvedLessonId, currentProgressLevel + 1);
      return true;
    }
    return false;
  };

  const handleSessionComplete = () => {
    navigate('/');
  };

  const currentQuestion = session?.questions[currentIndex];

  const canCheckAnswer = () => {
    if (!currentQuestion || feedback || isChecking || currentQuestion.type === 'matching') {
      return false;
    }
    if (currentQuestion.type === 'word-bank' || currentQuestion.type === 'word-bank-reverse') {
      return selectedWords.length > 0;
    }
    return Boolean(inputValue);
  };

  const syncReviewSchedule = async (reviewSchedule) => {
    try {
      await saveProgress({ reviewSchedule });
    } catch (err) {
      console.warn('[INFO] Failed to save review schedule to server:', err.message);
    }
  };

  const syncStudyStats = async (studyStats) => {
    try {
      await saveProgress({ studyStats });
    } catch (err) {
      console.warn('[INFO] Failed to save study stats to server:', err.message);
    }
  };

  const handleMatchingTokenClick = (token) => {
    if (matchedPairIds.includes(token.id) || wrongMatch || isChecking) return;

    if (selectedMatchingTokens.length === 0) {
      setSelectedMatchingTokens([token]);
    } else if (selectedMatchingTokens.length === 1) {
      const prevToken = selectedMatchingTokens[0];

      if (prevToken === token) {
        // Deselect
        setSelectedMatchingTokens([]);
        return;
      }

      if (prevToken.id === token.id) {
        // Match!
        const newMatched = [...matchedPairIds, token.id];
        setMatchedPairIds(newMatched);
        setSelectedMatchingTokens([]);

        const fiText = prevToken.lang === 'fi' ? prevToken.text : token.text;
        playAudio(fiText, null, 'fi-FI', 1.0, currentSpeaker);

        // If all matched
        if (newMatched.length === currentQuestion.pairs.length) {
          setIsChecking(true);
          playCorrectSound();
          setFeedback({
            isCorrect: true,
            isPerfect: true,
            correctText: 'All pairs matched!'
          });
          setScore(s => ({ ...s, correct: s.correct + 1 }));
          const updatedStats = recordAnswer();
          syncStudyStats(updatedStats);
        }
      } else {
        // Wrong match
        setSelectedMatchingTokens([prevToken, token]);
        setWrongMatch(true);
        playIncorrectSound();
        setTimeout(() => {
          setSelectedMatchingTokens([]);
          setWrongMatch(false);
        }, 800);
      }
    }
  };

  const handleMicClick = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'fi-FI';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsRecording(true);

    recognition.onresult = (event) => {
      let transcript = event.results[0][0].transcript;
      transcript = replaceNumbersWithFinnishWords(transcript);
      setInputValue(transcript);
      setIsRecording(false);
    };

    recognition.onerror = (event) => {
      console.error(event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const handleCheck = async () => {
    if (!currentQuestion) return;

    let answer = '';
    if (currentQuestion.type === 'choice') {
      answer = inputValue;
    } else if (currentQuestion.type === 'word-bank' || currentQuestion.type === 'word-bank-reverse') {
      answer = selectedWords.map(idx => currentQuestion.wordBank[idx]).join(' ');
    } else if (currentQuestion.type === 'typing' || currentQuestion.type === 'fill-in-the-blank' || currentQuestion.type === 'speaking') {
      answer = inputValue;
    }

    if (!answer) return;

    setIsChecking(true);
    try {
      const payload = {
        sentenceId: currentQuestion.sentenceId,
        userInput: answer,
        questionType: currentQuestion.type
      };

      if (currentQuestion.type === 'fill-in-the-blank') {
        payload.missingWord = currentQuestion.missingWord;
      }

      const res = await checkAnswer(payload);

      if (res.data.success) {
        const result = res.data.data;
        setFeedback(result);
        const updatedStats = recordAnswer();
        syncStudyStats(updatedStats);
        const sid = currentQuestion.sentenceId ? String(currentQuestion.sentenceId) : '';
        const isMatchingWarmup = currentQuestion.type === 'matching' || sid.startsWith('matching-warmup-');

        const isCorrect = Boolean(result.isPerfect || result.hasTypo);
        if (result.isPerfect) {
          setScore(s => ({ ...s, correct: s.correct + 1 }));
          playCorrectSound();
        } else if (result.hasTypo) {
          setScore(s => ({ ...s, typo: s.typo + 1 }));
          playCorrectSound();
        } else {
          setScore(s => ({ ...s, incorrect: s.incorrect + 1 }));
          playIncorrectSound();
        }

        if (sid && !isMatchingWarmup) {
          // A session can ask up to three questions per sentence. Only the first answer
          // in a review session moves the sentence up a box; a wrong answer always resets it.
          const alreadyReviewed = reviewedSentenceIdsRef.current.has(sid);
          if (!isCorrect || (isReviewMode && !alreadyReviewed)) {
            reviewedSentenceIdsRef.current.add(sid);
            const { status, schedule } = recordReviewResult(`sentence:${sid}`, isCorrect);
            if (status !== 'unchanged') {
              syncReviewSchedule(schedule);
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
    setIsChecking(false);
  };

  const handleNext = () => {
    if (currentIndex < session.questions.length - 1) {
      setCurrentIndex(c => c + 1);
      setCurrentSpeaker(getRandomSpeaker());
      resetInput();
    } else {
      setUnlockedNext(applyLevelProgress(score));
      setIsFinished(true);
      playLessonCompleteSound();
    }
  };

  // Enter checks the answer, or moves on once feedback is shown.
  // The listener is attached once and calls the latest handler through a ref.
  const enterKeyHandlerRef = useRef(null);
  useEffect(() => {
    enterKeyHandlerRef.current = (e) => {
      if (!session || isFinished || !currentQuestion) return;
      if (e.key !== 'Enter') return;
      if (e.isComposing || e.keyCode === 229) return;

      if (feedback) {
        e.preventDefault();
        handleNext();
      } else if (canCheckAnswer()) {
        e.preventDefault();
        handleCheck();
      }
    };
  });

  useEffect(() => {
    const handleKeyDown = (e) => enterKeyHandlerRef.current?.(e);
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleWord = (word, index) => {
    if (selectedWords.includes(index)) {
      setSelectedWords(selectedWords.filter(i => i !== index));
    } else {
      setSelectedWords([...selectedWords, index]);
    }

    if (currentQuestion && currentQuestion.type !== 'word-bank-reverse') {
      playAudio(word, word, 'fi-FI', 1.0, currentSpeaker);
    }
  };

  if (isFinished) {
    const totalQuestions = session.questions.length;
    const passed = isSessionPassed(score, totalQuestions);

    return (
      <div className="session-page">
        <div className="session-summary">
          <span className="summary-icon">🎉</span>
          <h2>{language === 'en' ? 'Session Complete!' : 'セッション完了！'}</h2>
          <div className="score-display">
            {Math.round(((score.correct + score.typo) / totalQuestions) * 100)}%
          </div>
          {!isReviewMode && resolvedLessonId && levelParam && (
            <p className={`session-result-message ${passed ? 'passed' : 'failed'}`}>
              {passed
                ? (unlockedNext ? t('session.passedUnlockNext') : t('session.passed'))
                : t('session.failedThreshold', { threshold: Math.round(PASS_THRESHOLD * 100) })}
            </p>
          )}
          <div className="score-breakdown">
            <div className="stat">
              <span className="stat-value">{score.correct}</span>
              <span>{language === 'en' ? 'Perfect' : 'パーフェクト'}</span>
            </div>
            <div className="stat">
              <span className="stat-value">{score.typo}</span>
              <span>{language === 'en' ? 'Typos' : 'タイポ'}</span>
            </div>
            <div className="stat">
              <span className="stat-value">{score.incorrect}</span>
              <span>{language === 'en' ? 'Incorrect' : '不正解'}</span>
            </div>
          </div>
          <div className="summary-actions">
            <button className="btn-primary" onClick={handleSessionComplete}>
              {language === 'en' ? 'Back to Path' : 'ホームへ戻る'}
            </button>
            <button className="btn-secondary" onClick={() => { setSession(null); setIsFinished(false); }}>
              {language === 'en' ? 'Try Again' : 'もう一度挑戦'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isReviewMode && noReviewSentences) {
    return (
      <div className="session-page">
        <div className="session-setup">
          <p>{t('session.noReviewSentences')}</p>
          <div className="setup-options">
            <button className="btn-primary" onClick={handleSessionComplete}>
              {t('session.returnHome')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!session && startError) {
    return (
      <div className="session-page">
        <div className="session-setup">
          <p role="alert">{t('session.startFailed')} ({startError})</p>
          <div className="setup-options">
            <button className="btn-primary" onClick={() => setStartError(null)}>
              {t('session.retryStart')}
            </button>
            <button className="btn-secondary" onClick={handleSessionComplete}>
              {t('session.returnHome')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="session-page">
        <div className="session-setup">
          <h2>{resolvedCategory ? (language === 'en' ? `Loading Level ${levelParam}...` : `レベル ${levelParam} を読み込み中...`) : (language === 'en' ? 'Start a Quiz Session' : 'セッションを開始')}</h2>
          {!resolvedCategory && !isReviewMode && (
            <>
              <p>{language === 'en' ? 'Practice with scaffolded exercises that adapt to your level.' : 'レベルに合わせた段階的な演習で練習しましょう。'}</p>
              <div className="setup-options">
                <label>
                  {language === 'en' ? 'Number of Sentences:' : '問題数:'}
                  <select
                    value={sentenceCount}
                    onChange={e => {
                      const count = Number(e.target.value);
                      setSentenceCount(count);
                      setSessionLength(count);
                    }}
                  >
                    <option value={3}>{language === 'en' ? '3 (Short)' : '3問 (ショート)'}</option>
                    <option value={5}>{language === 'en' ? '5 (Medium)' : '5問 (標準)'}</option>
                    <option value={10}>{language === 'en' ? '10 (Long)' : '10問 (じっくり)'}</option>
                  </select>
                </label>
                <button className="btn-primary" onClick={() => startSession()} disabled={isStarting}>
                  {isStarting ? (language === 'en' ? 'Starting...' : '開始中...') : (language === 'en' ? 'Start Session' : 'セッション開始')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  const progress = ((currentIndex) / session.questions.length) * 100;

  return (
    <div className="session-page">
      <div className="progress-container">
        <div className="progress-info">
          <span>{t('session.questionOf', { current: currentIndex + 1, total: session.questions.length })}</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className={`question-card ${feedback?.isCorrect ? 'correct-flash' : ''} ${feedback && !feedback.isCorrect ? 'incorrect-flash' : ''}`}>
        <div className="question-card-header">
          <div className={`level-badge level-${currentQuestion.level}`}>
            {t('session.levelLabel', { level: currentQuestion.level })}
          </div>
          {currentSpeaker && (
            <div
              data-testid="speaker-badge"
              className="speaker-badge"
              title={currentSpeaker.description}
            >
              <span className="speaker-badge-icon">{currentSpeaker.icon}</span>
              <span>{currentSpeaker.name}</span>
            </div>
          )}
        </div>

        <div className="question-prompt">
          <span className="instruction">
            {currentQuestion.isListening
              ? (currentQuestion.type === 'typing' ? t('session.instructionListenTyping') : t('session.instructionListenFill'))
              : currentQuestion.type === 'word-bank-reverse'
                ? t('session.instructionReverse')
                : currentQuestion.type === 'fill-in-the-blank'
                  ? t('session.instructionFill')
                  : currentQuestion.type === 'matching'
                    ? t('session.instructionMatching')
                    : currentQuestion.type === 'speaking'
                      ? t('session.instructionSpeaking')
                      : t('session.instructionTranslate')}
          </span>
          <div className="prompt-text-container">
            {currentQuestion.isListening ? (
              <div className="listening-audio-controls">
                <button
                  className="btn-audio prompt-audio"
                  onClick={() => playAudio(currentQuestion.correctAnswer, currentQuestion.sentenceId, 'fi-FI', 1.0, currentSpeaker)}
                  title={t('session.listenNormal')}
                >
                  🔊
                </button>
                <button
                  className="btn-audio prompt-audio slow"
                  onClick={() => playAudio(currentQuestion.correctAnswer, currentQuestion.sentenceId, 'fi-FI', 0.6, currentSpeaker)}
                  title={t('session.listenSlow')}
                >
                  🐢
                </button>
              </div>
            ) : (
              <>
                {(currentQuestion.type === 'word-bank-reverse' || currentQuestion.type === 'fill-in-the-blank' || currentQuestion.type === 'speaking') && (
                  <button
                    className="btn-audio prompt-audio"
                    onClick={() => playAudio(currentQuestion.prompt, currentQuestion.sentenceId, 'fi-FI', 1.0, currentSpeaker)}
                    title={t('common.listen')}
                  >
                    🔊
                  </button>
                )}
                {currentQuestion.type !== 'matching' && (
                  (language === 'ja' && currentQuestion.promptJa) ? currentQuestion.promptJa : currentQuestion.prompt
                )}
              </>
            )}
          </div>
        </div>

        {currentQuestion.type === 'choice' && (
          <div className="choice-options">
            {currentQuestion.options.map((opt, idx) => {
              let cls = 'choice-btn';
              if (inputValue === opt) cls += ' selected';
              if (feedback) {
                if (opt === feedback.correctText) cls += ' correct-choice';
                else if (inputValue === opt && !feedback.isCorrect) cls += ' wrong-choice';
              }
              return (
                <button
                  key={idx}
                  className={cls}
                  onClick={() => {
                    if (!feedback) {
                      setInputValue(opt);
                      playAudio(opt, opt, 'fi-FI', 1.0, currentSpeaker);
                    }
                  }}
                  disabled={!!feedback}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        )}

        {(currentQuestion.type === 'word-bank' || currentQuestion.type === 'word-bank-reverse') && (
          <div className="word-bank-area">
            <div className={`word-bank-answer ${selectedWords.length > 0 ? 'has-words' : ''}`}>
              {selectedWords.map((wordIdx, idx) => {
                const word = currentQuestion.wordBank[wordIdx];
                return (
                  <span key={idx} className="word-chip in-slot" onClick={() => !feedback && toggleWord(word, wordIdx)}>{word}</span>
                );
              })}
            </div>
            <div className="word-bank-pool">
              {currentQuestion.wordBank.map((word, idx) => (
                <span
                  key={idx}
                  className={`word-chip ${selectedWords.includes(idx) ? 'in-answer' : ''}`}
                  onClick={() => !feedback && toggleWord(word, idx)}
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}

        {currentQuestion.type === 'typing' && (
          <div className="typing-area">
            <input
              ref={inputRef}
              type="text"
              className="typing-input"
              placeholder={t('session.typePrompt')}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              disabled={!!feedback}
              autoFocus
            />
            {!feedback && (
              <SpecialCharBar
                inputRef={inputRef}
                value={inputValue}
                onChange={setInputValue}
              />
            )}
          </div>
        )}

        {currentQuestion.type === 'fill-in-the-blank' && (
          <div className="fill-in-the-blank-area">
            <span className="prefix">{currentQuestion.prefix}</span>
            <input
              ref={inputRef}
              type="text"
              className="blank-input"
              style={{
                width: `${Math.max(3, inputValue.length || currentQuestion.missingWord.length)}ch`
              }}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              disabled={!!feedback}
              autoFocus
            />
            <span className="suffix">{currentQuestion.suffix}</span>
            {!feedback && (
              <SpecialCharBar
                inputRef={inputRef}
                value={inputValue}
                onChange={setInputValue}
              />
            )}
          </div>
        )}

        {currentQuestion.type === 'matching' && (
          <div className="matching-grid">
            {currentQuestion.tokens.map((token, idx) => {
              const isMatched = matchedPairIds.includes(token.id);
              const isSelected = selectedMatchingTokens.includes(token);
              const isWrong = isSelected && wrongMatch;

              return (
                <button
                  key={`${token.id}-${token.lang}-${idx}`}
                  className={`choice-btn matching-token-btn ${isSelected ? 'selected' : ''} ${isMatched ? 'correct-choice matched' : ''} ${isWrong ? 'wrong-choice' : ''}`}
                  onClick={() => handleMatchingTokenClick(token)}
                  disabled={isMatched || isChecking}
                >
                  {token.text}
                </button>
              );
            })}
          </div>
        )}

        {currentQuestion.type === 'speaking' && (
          <div className="speaking-area">
            <button
              className={`btn-mic ${isRecording ? 'recording' : ''}`}
              onClick={handleMicClick}
              disabled={isRecording || !!feedback}
            >
              🎤
            </button>
            <div className="speaking-status">
              {isRecording ? (language === 'en' ? 'Listening...' : '聞き取り中...') : inputValue ? `"${inputValue}"` : (language === 'en' ? 'Tap microphone to speak' : 'マイクをタップして発音')}
            </div>
          </div>
        )}

        {feedback && (
          <div className={`feedback ${feedback.isPerfect ? 'correct' : feedback.hasTypo ? 'typo' : 'incorrect'}`}>
            <div>
              {feedback.isPerfect
                ? t('session.feedbackCorrect')
                : feedback.hasTypo
                ? t('session.feedbackTypo')
                : t('session.feedbackWrong')}
              <div className="correct-answer-container">
                <div>
                  <span className="correct-text">{t('session.correctAnswerIs')} {feedback.correctText}</span>
                  {currentQuestion.type !== 'word-bank-reverse' && (
                    <button
                      className="btn-audio feedback-audio-btn"
                      onClick={() => playAudio(feedback.correctText, currentQuestion.sentenceId, 'fi-FI', 1.0, currentSpeaker)}
                      title={t('common.listen')}
                    >
                      🔊
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="question-actions">
          {!feedback ? (
            currentQuestion.type !== 'matching' && (
              <button
                className="btn-check"
                onClick={handleCheck}
                disabled={!canCheckAnswer()}
              >
                {language === 'en' ? 'Check Answer' : '回答を確認する'}
              </button>
            )
          ) : (
            <button className="btn-next" onClick={handleNext}>
              {language === 'en' ? 'Continue' : '次へ ➔'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
