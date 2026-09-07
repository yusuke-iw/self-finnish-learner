import React, { useState, useEffect } from 'react';
import { generateSession, checkAnswer } from '../services/api';
import { playAudio } from '../utils/audio';
import { getRandomSpeaker } from '../utils/speakers';
import { playCorrectSound, playIncorrectSound, playLessonCompleteSound } from '../utils/feedbackSounds';
import { replaceNumbersWithFinnishWords } from '../utils/numberToFinnish';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useProgressStore } from '../store/useProgressStore';

export default function Session() {
  const { language, t } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const categoryParam = searchParams.get('category');
  const levelParam = searchParams.get('level') ? Number(searchParams.get('level')) : null;
  const exerciseTypeParam = searchParams.get('exerciseType');

  const [session, setSession] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sentenceCount, setSentenceCount] = useState(5);
  const [currentSpeaker, setCurrentSpeaker] = useState(() => getRandomSpeaker());
  
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
    if ((categoryParam && levelParam || exerciseTypeParam) && !session && !isStarting && !isFinished) {
      startSession(5, categoryParam, levelParam, exerciseTypeParam);
    }
  }, [categoryParam, levelParam, exerciseTypeParam, session, isStarting, isFinished]);

  const startSession = async (count = sentenceCount, cat = categoryParam, lvl = levelParam, ext = exerciseTypeParam) => {
    setIsStarting(true);
    try {
      const res = await generateSession(count, cat, lvl, ext, language);
      if (res.data.success) {
        setSession(res.data.data);
        setCurrentIndex(0);
        setCurrentSpeaker(getRandomSpeaker());
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
        useProgressStore.getState().updateLevelProgress(categoryParam, currentProgressLevel + 1);
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

  useEffect(() => {
    setCurrentSpeaker(getRandomSpeaker());
  }, [currentIndex, session?._id]);

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
      playLessonCompleteSound();
    }
  };

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
    return (
      <div className="session-page">
        <div className="session-summary">
          <span className="summary-icon">🎉</span>
          <h2>{language === 'en' ? 'Session Complete!' : 'セッション完了！'}</h2>
          <div className="score-display">
            {Math.round(((score.correct + score.typo) / session.questions.length) * 100)}%
          </div>
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

  if (!session) {
    return (
      <div className="session-page">
        <div className="session-setup">
          <h2>{categoryParam ? (language === 'en' ? `Loading Level ${levelParam}...` : `レベル ${levelParam} を読み込み中...`) : (language === 'en' ? 'Start a Quiz Session' : 'セッションを開始')}</h2>
          {!categoryParam && (
            <>
              <p>{language === 'en' ? 'Practice with scaffolded exercises that adapt to your level.' : 'レベルに合わせた段階的な演習で練習しましょう。'}</p>
              <div className="setup-options">
                <label>
                  {language === 'en' ? 'Number of Sentences:' : '問題数:'}
                  <select value={sentenceCount} onChange={e => setSentenceCount(Number(e.target.value))}>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div className={`level-badge level-${currentQuestion.level}`} style={{ margin: 0 }}>
            {t('session.levelLabel', { level: currentQuestion.level })}
          </div>
          {currentSpeaker && (
            <div 
              data-testid="speaker-badge" 
              className="speaker-badge"
              title={currentSpeaker.description}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                fontWeight: '500',
                backgroundColor: 'var(--bg-card-hover, rgba(255,255,255,0.08))',
                color: 'var(--text-secondary, #94a3b8)',
                border: '1px solid var(--border-color, rgba(255,255,255,0.1))'
              }}
            >
              <span style={{ fontSize: '1rem' }}>{currentSpeaker.icon}</span>
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
          <div className="prompt-text-container" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px', fontWeight: 'bold' }}>
            {currentQuestion.isListening ? (
              <div className="listening-audio-controls" style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '16px', background: 'var(--bg-card-hover)', borderRadius: 'var(--radius-md)' }}>
                <button 
                  className="btn-audio prompt-audio" 
                  onClick={() => playAudio(currentQuestion.correctAnswer, currentQuestion.sentenceId, 'fi-FI', 1.0, currentSpeaker)}
                  title={t('session.listenNormal')}
                  style={{ padding: '12px', fontSize: '24px', background: 'var(--accent)' }}
                >
                  🔊
                </button>
                <button 
                  className="btn-audio prompt-audio slow" 
                  onClick={() => playAudio(currentQuestion.correctAnswer, currentQuestion.sentenceId, 'fi-FI', 0.6, currentSpeaker)}
                  title={t('session.listenSlow')}
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
                    onClick={() => playAudio(currentQuestion.prompt, currentQuestion.sentenceId, 'fi-FI', 1.0, currentSpeaker)}
                    title={t('common.listen')}
                    style={{ padding: '6px' }}
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
              type="text" 
              className="typing-input"
              placeholder={t('session.typePrompt')}
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
                  className={`choice-btn ${isSelected ? 'selected' : ''} ${isMatched ? 'correct-choice' : ''} ${isWrong ? 'wrong-choice' : ''}`}
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
                      className="btn-audio" 
                      onClick={() => playAudio(feedback.correctText, currentQuestion.sentenceId, 'fi-FI', 1.0, currentSpeaker)}
                      title={t('common.listen')}
                      style={{ marginLeft: '12px', padding: '4px 8px', fontSize: '14px' }}
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
                disabled={isChecking || ((currentQuestion.type === 'word-bank' || currentQuestion.type === 'word-bank-reverse') && selectedWords.length === 0) || (currentQuestion.type !== 'word-bank' && currentQuestion.type !== 'word-bank-reverse' && !inputValue)}
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

