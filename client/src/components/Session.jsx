import React, { useState, useEffect } from 'react';
import { generateSession, checkAnswer } from '../api';
import { playAudio } from '../utils/audio';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function Session() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const categoryParam = searchParams.get('category');
  const levelParam = searchParams.get('level') ? Number(searchParams.get('level')) : null;

  const [session, setSession] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sentenceCount, setSentenceCount] = useState(5);
  
  const [selectedWords, setSelectedWords] = useState([]); // for word bank
  const [inputValue, setInputValue] = useState(''); // for typing, fill-in, and speaking
  
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

  const [isStarting, setIsStarting] = useState(false);

  // Auto-start if category and level are provided
  useEffect(() => {
    if (categoryParam && levelParam && !session && !isStarting && !isFinished) {
      startSession(5, categoryParam, levelParam);
    }
  }, [categoryParam, levelParam, session, isStarting, isFinished]);

  const startSession = async (count = sentenceCount, cat = categoryParam, lvl = levelParam) => {
    setIsStarting(true);
    try {
      const res = await generateSession(count, cat, lvl);
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

  const handleSessionComplete = () => {
    // Only increment progress if passed from module path
    if (categoryParam && levelParam) {
      let progress = JSON.parse(localStorage.getItem('finnishLearnerProgress') || '{}');
      const currentProgressLevel = progress[categoryParam] || 1;
      
      // If they just beat the level they were on, increment it (max 4, where 4 = fully complete)
      if (levelParam === currentProgressLevel && currentProgressLevel < 4) {
        progress[categoryParam] = currentProgressLevel + 1;
        localStorage.setItem('finnishLearnerProgress', JSON.stringify(progress));
      }
    }
    navigate('/');
  };

  const resetInput = () => {
    setFeedback(null);
    setSelectedWords([]);
    setInputValue('');
    setSelectedMatchingTokens([]);
    setMatchedPairIds([]);
    setWrongMatch(false);
    setIsChecking(false);
  };

  const currentQuestion = session?.questions[currentIndex];

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
        
        playAudio('Oikein!', null, 'fi-FI', 1.0); // simple feedback sound
        
        // If all matched
        if (newMatched.length === currentQuestion.pairs.length) {
          setIsChecking(true);
          setFeedback({
            isCorrect: true,
            isPerfect: true,
            correctText: 'All pairs matched!'
          });
        }
      } else {
        // Wrong match
        setSelectedMatchingTokens([prevToken, token]);
        setWrongMatch(true);
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
      const transcript = event.results[0][0].transcript;
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
      answer = selectedWords.join(' ');
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
    playAudio(word, word);
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
            <button className="btn-primary" onClick={handleSessionComplete}>Back to Path</button>
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
          <h2>{categoryParam ? `Loading Level ${levelParam}...` : 'Start a Quiz Session'}</h2>
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
          <span className="instruction">
            {currentQuestion.isListening 
              ? (currentQuestion.type === 'typing' ? 'Type what you hear:' : 'Type the missing word:') 
              : currentQuestion.type === 'word-bank-reverse' 
                ? 'Write this in English:' 
                : currentQuestion.type === 'fill-in-the-blank' 
                  ? 'Type the missing word:' 
                  : currentQuestion.type === 'matching'
                    ? 'Tap the matching pairs:'
                    : currentQuestion.type === 'speaking'
                      ? 'Read this sentence out loud:'
                      : 'Translate this sentence:'}
          </span>
          <div className="prompt-text-container" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px', fontWeight: 'bold' }}>
            {currentQuestion.isListening ? (
              <div className="listening-audio-controls" style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '16px', background: 'var(--bg-card-hover)', borderRadius: 'var(--radius-md)' }}>
                <button 
                  className="btn-audio prompt-audio" 
                  onClick={() => playAudio(currentQuestion.correctAnswer, currentQuestion.sentenceId, 'fi-FI', 1.0)}
                  title="Listen (Normal Speed)"
                  style={{ padding: '12px', fontSize: '24px', background: 'var(--accent)' }}
                >
                  🔊
                </button>
                <button 
                  className="btn-audio prompt-audio slow" 
                  onClick={() => playAudio(currentQuestion.correctAnswer, currentQuestion.sentenceId, 'fi-FI', 0.6)}
                  title="Listen (Slow)"
                  style={{ padding: '8px', fontSize: '20px', border: '1px solid var(--accent)' }}
                >
                  🐢
                </button>
              </div>
            ) : (
              <>
                {(currentQuestion.type === 'word-bank-reverse' || currentQuestion.type === 'fill-in-the-blank' || currentQuestion.type === 'speaking') && (
                  <button 
                    className="btn-audio prompt-audio" 
                    onClick={() => playAudio(currentQuestion.prompt, currentQuestion.sentenceId)}
                    title="Listen"
                    style={{ padding: '6px' }}
                  >
                    🔊
                  </button>
                )}
                {currentQuestion.type !== 'matching' && currentQuestion.prompt}
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
                      playAudio(opt, opt);
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

        {currentQuestion.type === 'fill-in-the-blank' && (
          <div className="fill-in-the-blank-area" style={{ marginTop: '20px', fontSize: '1.2rem', lineHeight: '2' }}>
            <span className="prefix">{currentQuestion.prefix}</span>
            <input 
              type="text" 
              className="blank-input"
              style={{
                width: `${Math.max(3, inputValue.length || currentQuestion.missingWord.length)}ch`,
                minWidth: '60px',
                border: 'none',
                borderBottom: '2px solid var(--border)',
                background: 'transparent',
                color: '#fff',
                fontSize: '1.2rem',
                textAlign: 'center',
                margin: '0 8px',
                outline: 'none'
              }}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              disabled={!!feedback}
              autoFocus
            />
            <span className="suffix">{currentQuestion.suffix}</span>
          </div>
        )}

        {currentQuestion.type === 'matching' && (
          <div className="matching-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '12px', 
            marginTop: '20px' 
          }}>
            {currentQuestion.tokens.map((token, idx) => {
              const isMatched = matchedPairIds.includes(token.id);
              const isSelected = selectedMatchingTokens.includes(token);
              const isWrong = isSelected && wrongMatch;

              return (
                <button
                  key={`${token.id}-${token.lang}-${idx}`}
                  className={`btn-option ${isSelected ? 'selected' : ''} ${isMatched ? 'correct' : ''} ${isWrong ? 'incorrect' : ''}`}
                  onClick={() => handleMatchingTokenClick(token)}
                  disabled={isMatched || isChecking}
                  style={{ 
                    padding: '16px', 
                    fontSize: '18px', 
                    opacity: isMatched ? 0 : 1, 
                    pointerEvents: isMatched ? 'none' : 'auto',
                    transition: 'opacity 0.3s'
                  }}
                >
                  {token.text}
                </button>
              );
            })}
          </div>
        )}

        {currentQuestion.type === 'speaking' && (
          <div className="speaking-area" style={{ textAlign: 'center', marginTop: '20px' }}>
            <button 
              className="btn-mic" 
              onClick={handleMicClick}
              disabled={isRecording || !!feedback}
              style={{
                background: isRecording ? '#ff4b4b' : 'var(--accent)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '80px',
                height: '80px',
                fontSize: '32px',
                cursor: 'pointer',
                boxShadow: isRecording ? '0 0 15px #ff4b4b' : 'none',
                transition: 'all 0.3s'
              }}
            >
              🎤
            </button>
            <div style={{ marginTop: '16px', minHeight: '30px', fontSize: '18px', color: 'var(--text-muted)' }}>
              {isRecording ? "Listening..." : inputValue ? `"${inputValue}"` : "Tap microphone to speak"}
            </div>
          </div>
        )}

        {feedback && (
          <div className={`feedback ${feedback.isPerfect ? 'correct' : feedback.hasTypo ? 'typo' : 'incorrect'}`}>
            <div>
              {feedback.isPerfect ? 'Correct!' : feedback.hasTypo ? 'Correct, but you have a typo.' : 'Incorrect.'}
              <div className="correct-answer-container">
                <span className="correct-text">Correct answer: {feedback.correctText}</span>
                <button 
                  className="btn-audio" 
                  onClick={() => playAudio(feedback.correctText, currentQuestion.sentenceId)}
                  title="Listen"
                >
                  🔊
                </button>
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
                disabled={isChecking || ((currentQuestion.type === 'word-bank' || currentQuestion.type === 'word-bank-reverse') && selectedWords.length === 0) || (currentQuestion.type !== 'word-bank' && currentQuestion.type !== 'word-bank-reverse' && !inputValue)}
              >
                Check Answer
              </button>
            )
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
