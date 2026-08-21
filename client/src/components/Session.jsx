import { useState, useEffect } from 'react';
import { generateSession, checkAnswer } from '../api';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function Session() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const categoryParam = searchParams.get('category');

  const [session, setSession] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sentenceCount, setSentenceCount] = useState(5);
  
  const [inputValue, setInputValue] = useState('');
  const [selectedWords, setSelectedWords] = useState([]);
  
  const [feedback, setFeedback] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  
  const [score, setScore] = useState({ correct: 0, typo: 0, incorrect: 0 });
  const [isFinished, setIsFinished] = useState(false);

  const [isStarting, setIsStarting] = useState(false);

  // Auto-start if category is provided
  useEffect(() => {
    if (categoryParam && !session && !isStarting && !isFinished) {
      startSession(5, categoryParam);
    }
  }, [categoryParam, session, isStarting, isFinished]);

  const startSession = async (count = sentenceCount, cat = categoryParam) => {
    setIsStarting(true);
    try {
      const res = await generateSession(count, cat);
      if (res.data.success) {
        setSession(res.data.data);
        setCurrentIndex(0);
        setIsFinished(false);
        setScore({ correct: 0, typo: 0, incorrect: 0 });
        resetInput();
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to generate session');
    }
    setIsStarting(false);
  };

  const resetInput = () => {
    setInputValue('');
    setSelectedWords([]);
    setFeedback(null);
  };

  const currentQuestion = session?.questions[currentIndex];

  const handleCheck = async () => {
    if (!currentQuestion) return;
    
    let answer = '';
    if (currentQuestion.type === 'choice') {
      answer = inputValue;
    } else if (currentQuestion.type === 'word-bank') {
      answer = selectedWords.join(' ');
    } else if (currentQuestion.type === 'typing') {
      answer = inputValue;
    }

    if (!answer) return;

    setIsChecking(true);
    try {
      const res = await checkAnswer({
        sentenceId: currentQuestion.sentenceId,
        userInput: answer
      });

      if (res.data.success) {
        const result = res.data.data;
        setFeedback(result);
        if (result.isPerfect) {
          setScore(s => ({ ...s, correct: s.correct + 1 }));
        } else if (result.hasTypo) {
          setScore(s => ({ ...s, typo: s.typo + 1 }));
        } else {
          setScore(s => ({ ...s, incorrect: s.incorrect + 1 }));
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
      resetInput();
    } else {
      setIsFinished(true);
    }
  };

  const toggleWord = (word, index) => {
    if (selectedWords.includes(word)) {
      setSelectedWords(selectedWords.filter((_, i) => i !== selectedWords.indexOf(word)));
    } else {
      setSelectedWords([...selectedWords, word]);
    }
  };

  if (isFinished) {
    return (
      <div className="session-page">
        <div className="session-summary">
          <span className="summary-icon">🎉</span>
          <h2>Session Complete!</h2>
          <div className="score-display">
            {Math.round(((score.correct + score.typo) / session.questions.length) * 100)}%
          </div>
          <div className="score-breakdown">
            <div className="stat">
              <span className="stat-value">{score.correct}</span>
              <span>Perfect</span>
            </div>
            <div className="stat">
              <span className="stat-value">{score.typo}</span>
              <span>Typos</span>
            </div>
            <div className="stat">
              <span className="stat-value">{score.incorrect}</span>
              <span>Incorrect</span>
            </div>
          </div>
          <div className="summary-actions">
            <button className="btn-primary" onClick={() => navigate('/')}>Back to Path</button>
            <button className="btn-secondary" onClick={() => setSession(null)}>Try Again</button>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="session-page">
        <div className="session-setup">
          <h2>{categoryParam ? `Loading ${categoryParam}...` : 'Start a Quiz Session'}</h2>
          {!categoryParam && (
            <>
              <p>Practice with scaffolded exercises that adapt to your level.</p>
              <div className="setup-options">
                <label>
                  Number of Sentences:
                  <select value={sentenceCount} onChange={e => setSentenceCount(Number(e.target.value))}>
                    <option value={3}>3 (Short)</option>
                    <option value={5}>5 (Medium)</option>
                    <option value={10}>10 (Long)</option>
                  </select>
                </label>
                <button className="btn-primary" onClick={() => startSession()} disabled={isStarting}>
                  {isStarting ? 'Starting...' : 'Start Session'}
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
          <span>Question {currentIndex + 1} of {session.questions.length}</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className={`question-card ${feedback?.isCorrect ? 'correct-flash' : ''} ${feedback && !feedback.isCorrect ? 'incorrect-flash' : ''}`}>
        <div className={`level-badge level-${currentQuestion.level}`}>
          Level {currentQuestion.level}
        </div>
        
        <div className="question-prompt">
          <span className="instruction">Translate this sentence:</span>
          {currentQuestion.prompt}
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
                  onClick={() => !feedback && setInputValue(opt)}
                  disabled={!!feedback}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        )}

        {currentQuestion.type === 'word-bank' && (
          <div className="word-bank-area">
            <div className={`word-bank-answer ${selectedWords.length > 0 ? 'has-words' : ''}`}>
              {selectedWords.map((word, idx) => (
                <span key={idx} className="word-chip in-slot" onClick={() => !feedback && toggleWord(word, idx)}>{word}</span>
              ))}
            </div>
            <div className="word-bank-pool">
              {currentQuestion.wordBank.map((word, idx) => (
                <span 
                  key={idx} 
                  className={`word-chip ${selectedWords.includes(word) ? 'in-answer' : ''}`}
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
              type="text" 
              className="typing-input"
              placeholder="Type in Finnish..."
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              disabled={!!feedback}
              autoFocus
            />
          </div>
        )}

        {feedback && (
          <div className={`feedback ${feedback.isPerfect ? 'correct' : feedback.hasTypo ? 'typo' : 'incorrect'}`}>
            <div>
              {feedback.isPerfect ? 'Correct!' : feedback.hasTypo ? 'Correct, but you have a typo.' : 'Incorrect.'}
              {(!feedback.isPerfect) && (
                <span className="correct-text">Correct answer: {feedback.correctText}</span>
              )}
            </div>
          </div>
        )}

        <div className="question-actions">
          {!feedback ? (
            <button 
              className="btn-check" 
              onClick={handleCheck}
              disabled={isChecking || (currentQuestion.type === 'word-bank' && selectedWords.length === 0) || (currentQuestion.type !== 'word-bank' && !inputValue)}
            >
              Check Answer
            </button>
          ) : (
            <button className="btn-next" onClick={handleNext}>
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
