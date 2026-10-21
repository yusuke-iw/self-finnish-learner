import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  grammarTopics,
  getAllPracticeQuestions,
  getQuestionsByCategory,
  getQuestionsByTopic
} from '../data/grammarData';
import { useLanguage } from '../context/useLanguage';
import { fetchProgress } from '../services/api';
import { recordReviewResult } from '../utils/reviewSchedule';
import { recordAnswer } from '../utils/studyStats';
import {
  LOCAL_STORAGE_MISTAKES_KEY,
  loadLocalMistakes,
  getDueMistakes,
  saveProgressSafe,
  mergeMistakes
} from '../utils/grammarMistakes';

// State and behaviour of the grammar drill: setup filters, the running session,
// scoring, the mistake bank and the summary. GrammarPractice.jsx only renders.
export function useGrammarPractice() {
  const { language } = useLanguage();
  const [searchParams] = useSearchParams();
  const initialTopic = searchParams.get('topic') || 'all';
  const isReviewParam = searchParams.get('review') === '1';

  const [mistakeBank, setMistakeBank] = useState(() => loadLocalMistakes());
  const [initialDueQuestions] = useState(() => {
    if (!isReviewParam) return [];
    const duePool = getDueMistakes(loadLocalMistakes());
    if (duePool.length === 0) return [];
    return [...duePool].sort(() => Math.random() - 0.5).slice(0, 10);
  });

  // Setup state
  const [mode, setMode] = useState(() => (initialDueQuestions.length > 0 ? 'session' : 'setup')); // 'setup' | 'session' | 'summary'
  const [isReviewSession, setIsReviewSession] = useState(() => initialDueQuestions.length > 0);
  const [selectedCategory, setSelectedCategory] = useState(() => {
    if (initialDueQuestions.length > 0) return 'mistakes';
    if (initialTopic !== 'all') {
      const found = grammarTopics.find((topic) => topic.id === initialTopic);
      if (found) return found.category;
    }
    return 'all';
  });
  const [selectedTopic, setSelectedTopic] = useState(initialTopic);
  const [selectedType, setSelectedType] = useState('all'); // 'all' | 'choice' | 'wordbank' | 'typing'
  const [questionCount, setQuestionCount] = useState(5);

  // Session state
  const [questions, setQuestions] = useState(() => initialDueQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [sessionMistakes, setSessionMistakes] = useState([]);
  const [startTime, setStartTime] = useState(() => (initialDueQuestions.length > 0 ? Date.now() : null));
  const [elapsedTime, setElapsedTime] = useState(0);

  // Sync saved mistakes with server on mount
  useEffect(() => {
    if (typeof fetchProgress === 'function') {
      try {
        const p = fetchProgress();
        if (p && typeof p.then === 'function') {
          p.then(res => {
            if (res?.data?.success && Array.isArray(res.data.data?.mistakes)) {
              const merged = mergeMistakes(res.data.data.mistakes, loadLocalMistakes());
              localStorage.setItem(LOCAL_STORAGE_MISTAKES_KEY, JSON.stringify(merged));
              setMistakeBank(merged);
            }
          }).catch(() => {});
        }
      } catch {}
    }
  }, []);

  // Start Practice Drill
  const handleStartDrill = (isReviewMode = false) => {
    let pool = [];

    if (isReviewMode) {
      const duePool = getDueMistakes(mistakeBank);
      if (duePool.length === 0) return;
      pool = [...duePool];
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
      alert(language === 'en' ? 'No questions matched your selected filters. Please adjust your choices.' : '条件に一致する問題がありません。カテゴリや問題形式を変更してください。');
      return;
    }

    // Shuffle
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const targetCount = isReviewMode ? Math.min(shuffled.length, 10) : Math.min(shuffled.length, questionCount);
    const selectedList = shuffled.slice(0, targetCount);

    setIsReviewSession(Boolean(isReviewMode));
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

  // Start a drill from the mistake bank (also highlights the "mistakes" category).
  const handleStartWeaknessDrill = () => {
    setSelectedCategory('mistakes');
    handleStartDrill(true);
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

    const updatedStats = recordAnswer();
    saveProgressSafe({ studyStats: updatedStats });

    if (correct) {
      setScore((prev) => prev + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);

      if (isReviewSession && currentQ?.id) {
        const { status, schedule } = recordReviewResult(`grammar:${currentQ.id}`, true);
        saveProgressSafe({ reviewSchedule: schedule });

        if (status === 'graduated') {
          const updatedBank = mistakeBank.filter((m) => m.id !== currentQ.id);
          setMistakeBank(updatedBank);
          try {
            localStorage.setItem(LOCAL_STORAGE_MISTAKES_KEY, JSON.stringify(updatedBank));
            saveProgressSafe({ mistakes: updatedBank });
          } catch (e) {
            console.error(e);
          }
        }
      }
    } else {
      setStreak(0);
      setSessionMistakes((prev) => [...prev, { ...currentQ, userAnswer: currentAnswer.trim() }]);

      if (currentQ?.id) {
        const { schedule } = recordReviewResult(`grammar:${currentQ.id}`, false);
        saveProgressSafe({ reviewSchedule: schedule });
      }

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
          saveProgressSafe({ mistakes: newBank });
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

  const dueMistakeCount = getDueMistakes(mistakeBank).length;

  return {
    mode,
    setMode,
    // setup
    mistakeBank,
    dueMistakeCount,
    selectedCategory,
    setSelectedCategory,
    selectedTopic,
    setSelectedTopic,
    selectedType,
    setSelectedType,
    questionCount,
    setQuestionCount,
    handleStartDrill,
    handleStartWeaknessDrill,
    // session
    questions,
    currentQ,
    currentIndex,
    currentAnswer,
    setCurrentAnswer,
    isSubmitted,
    isCorrect,
    streak,
    handleInsertChar,
    handleSubmitAnswer,
    handleNextQuestion,
    handleKeyDown,
    // summary
    score,
    maxStreak,
    sessionMistakes,
    elapsedTime
  };
}
