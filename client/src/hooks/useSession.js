import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { generateSession, checkAnswer, saveProgress } from '../services/api';
import { playAudio } from '../utils/audio';
import { getRandomSpeaker } from '../utils/speakers';
import { playCorrectSound, playIncorrectSound, playLessonCompleteSound } from '../utils/feedbackSounds';
import { useLanguage } from '../context/useLanguage';
import { useProgressStore } from '../store/useProgressStore';
import { findLessonById, findLessonByTitle } from '../data/curriculumData';
import { isSessionPassed } from '../utils/sessionResult';
import { getSessionLength, setSessionLength } from '../utils/sessionPreferences';
import { getDueKeys, recordReviewResult } from '../utils/reviewSchedule';
import { recordAnswer } from '../utils/studyStats';
import { useSpeechRecognition } from './useSpeechRecognition';

// All state and behaviour of a quiz session: starting it, answering, scoring,
// review-schedule / progress saving and finishing. Session.jsx only renders.
export function useSession() {
  const { language } = useLanguage();
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
  const { isRecording, startRecording } = useSpeechRecognition(setInputValue);

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
    if (isReviewMode || exerciseTypeParam === 'dictation' || exerciseTypeParam === 'spoken') {
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

  const goHome = () => {
    navigate('/');
  };

  const currentQuestion = session?.questions[currentIndex];

  const autoPlayedKeyRef = useRef(null);
  useEffect(() => {
    if (!session) {
      autoPlayedKeyRef.current = null;
      return;
    }
    if (exerciseTypeParam !== 'dictation' || isFinished || !currentQuestion) {
      return;
    }
    const questionKey = `${session.sessionId || session._id || 'session'}-${currentIndex}`;
    if (autoPlayedKeyRef.current === questionKey) {
      return;
    }
    autoPlayedKeyRef.current = questionKey;
    try {
      const p = playAudio(
        currentQuestion.correctAnswer,
        currentQuestion.sentenceId,
        'fi-FI',
        1.0,
        currentSpeaker
      );
      if (p && typeof p.catch === 'function') {
        p.catch(() => {});
      }
    } catch {
      // ignore autoplay errors
    }
  }, [exerciseTypeParam, session, currentIndex, isFinished, currentQuestion, currentSpeaker]);

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

  const handleCheck = async () => {
    if (!currentQuestion) return;

    let answer = '';
    if (currentQuestion.type === 'choice' || currentQuestion.type === 'spoken-choice') {
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

  const changeSentenceCount = (count) => {
    setSentenceCount(count);
    setSessionLength(count);
  };

  const restart = () => {
    setSession(null);
    setIsFinished(false);
  };

  return {
    // route-derived
    levelParam,
    isReviewMode,
    resolvedLessonId,
    resolvedCategory,
    // state
    session,
    currentIndex,
    currentQuestion,
    currentSpeaker,
    sentenceCount,
    selectedWords,
    inputValue,
    inputRef,
    selectedMatchingTokens,
    matchedPairIds,
    wrongMatch,
    isRecording,
    feedback,
    isChecking,
    score,
    isFinished,
    unlockedNext,
    isStarting,
    startError,
    noReviewSentences,
    // actions
    startSession,
    setInputValue,
    changeSentenceCount,
    clearStartError: () => setStartError(null),
    restart,
    goHome,
    canCheckAnswer,
    handleMatchingTokenClick,
    handleMicClick: startRecording,
    handleCheck,
    handleNext,
    toggleWord
  };
}
