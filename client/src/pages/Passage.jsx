import React, { useState, useEffect } from 'react';
import { fetchPassages, fetchPassageById, fetchProgress, saveProgress } from '../services/api';
import { playAudio } from '../utils/audio';
import { playCorrectSound, playIncorrectSound } from '../utils/feedbackSounds';
import { useLanguage } from '../context/LanguageContext';

export default function Passage() {
  const { language, t } = useLanguage();
  const [passages, setPassages] = useState([]);
  const [selectedPassage, setSelectedPassage] = useState(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [completedPassages, setCompletedPassages] = useState({});

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('finnishLearnerPassagesProgress') || '{}');
    setCompletedPassages(saved);

    // Sync with server on mount
    if (typeof fetchProgress === 'function') {
      const p = fetchProgress();
      if (p && typeof p.then === 'function') {
        p.then(res => {
          if (res?.data?.success && res.data.data?.passagesProgress) {
            const merged = { ...res.data.data.passagesProgress, ...saved };
            localStorage.setItem('finnishLearnerPassagesProgress', JSON.stringify(merged));
            setCompletedPassages(merged);
          }
        }).catch(() => {});
      }
    }
  }, []);

  useEffect(() => {
    if (selectedPassage) {
      const savedAnswers = JSON.parse(localStorage.getItem(`finnishLearnerAnswers_${selectedPassage._id}`) || '{}');
      setAnswers(savedAnswers);
    }
  }, [selectedPassage]);

  const handleAnswer = (qIndex, optionIndex, correctIndex) => {
    if (answers[qIndex] !== undefined) return;
    
    const newAnswers = { ...answers, [qIndex]: optionIndex };
    setAnswers(newAnswers);
    if (selectedPassage) {
      localStorage.setItem(`finnishLearnerAnswers_${selectedPassage._id}`, JSON.stringify(newAnswers));
    }
    
    if (optionIndex === correctIndex) {
      playCorrectSound();
      
      const totalQuestions = selectedPassage.questions.length;
      let allCorrect = true;
      for (let i = 0; i < totalQuestions; i++) {
        const selected = newAnswers[i];
        if (selected === undefined || selected !== selectedPassage.questions[i].correctAnswerIndex) {
          allCorrect = false;
          break;
        }
      }
      
      if (allCorrect) {
        const updatedProgress = { ...completedPassages, [selectedPassage._id]: true };
        setCompletedPassages(updatedProgress);
        localStorage.setItem('finnishLearnerPassagesProgress', JSON.stringify(updatedProgress));
        if (typeof saveProgress === 'function') {
          try {
            const p = saveProgress({ passagesProgress: updatedProgress });
            if (p && typeof p.catch === 'function') p.catch(() => {});
          } catch (e) {}
        }
      }
    } else {
      playIncorrectSound();
    }
  };

  useEffect(() => {
    fetchPassages().then(res => {
      if (res.data.success) {
        setPassages(res.data.data);
      }
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="passages-page"><p>{t('passages.loading')}</p></div>;
  }

  if (selectedPassage) {
    const passageTitle = (language === 'ja' && selectedPassage.titleJa) ? selectedPassage.titleJa : selectedPassage.title;

    return (
      <div className="passages-page">
        <div className="passage-detail">
          <button className="passage-back-btn" onClick={() => setSelectedPassage(null)}>
            {t('passages.backToList')}
          </button>
          
          <div className="passage-header">
            <div className="passage-header-title-row">
              <h2>{passageTitle}</h2>
              {completedPassages[selectedPassage._id] && (
                <span className="status-badge mastered passage-mastered-badge">
                  {t('passages.masteredBadge')}
                </span>
              )}
            </div>
            <span className="category-tag">{selectedPassage.difficulty}</span>
          </div>
          
          <div className="passage-columns">
            <div className="passage-left-column">
              <div className="passage-reading">
                <div className="reading-header-audio">
                  <h3>{t('passages.readingHeader')}</h3>
                  <button 
                    className="btn-audio" 
                    onClick={() => playAudio(selectedPassage.text, selectedPassage._id)}
                    title={t('passages.listenAudio')}
                  >
                    🔊
                  </button>
                </div>
                <p className="passage-text">{selectedPassage.text}</p>
                
                <div className="passage-translation-toggle">
                  <button 
                    className="toggle-btn"
                    onClick={() => setShowTranslation(!showTranslation)}
                  >
                    {showTranslation
                      ? t('passages.hideTranslation')
                      : t('passages.showTranslation')}
                  </button>
                  
                  {showTranslation && (
                    <div className="translation-text">
                      {language === 'ja' && selectedPassage.translationJa ? selectedPassage.translationJa : selectedPassage.translation}
                    </div>
                  )}
                </div>
              </div>
              
              {selectedPassage.vocabulary && selectedPassage.vocabulary.length > 0 && (
                <div className="passage-vocabulary">
                  <h3>{t('passages.vocabularyTitle')}</h3>
                  <div className="vocab-grid">
                    {selectedPassage.vocabulary.map((v, i) => (
                      <div key={i} className="vocab-item">
                        <span className="vocab-word">{v.word}</span>
                        <span className="vocab-translation">
                          {language === 'ja' && v.translationJa ? v.translationJa : v.translation}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="passage-right-column">
              {selectedPassage.questions && selectedPassage.questions.length > 0 && (
                <div className="passage-quiz">
                  <h3>{t('passages.quizTitle')}</h3>
                  <div className="quiz-questions">
                    {selectedPassage.questions.map((q, qIndex) => {
                      const answered = answers[qIndex] !== undefined;
                      const selectedOption = answers[qIndex];
                      const qText = (language === 'ja' && q.questionTextJa) ? q.questionTextJa : q.questionText;
                      const qOptions = (language === 'ja' && q.optionsJa && q.optionsJa.length === q.options.length) ? q.optionsJa : q.options;
                      
                      return (
                        <div key={qIndex} className="quiz-question">
                          <p className="quiz-question-text">{qText}</p>
                          <div className="quiz-options">
                            {qOptions.map((opt, optIndex) => {
                              let btnClass = 'choice-btn';
                              
                              if (answered) {
                                if (optIndex === q.correctAnswerIndex) {
                                  btnClass += ' correct-choice';
                                } else if (optIndex === selectedOption) {
                                  btnClass += ' wrong-choice';
                                }
                              }
                              
                              return (
                                <button
                                  key={optIndex}
                                  className={btnClass}
                                  disabled={answered}
                                  onClick={() => handleAnswer(qIndex, optIndex, q.correctAnswerIndex)}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                          {answered && selectedOption === q.correctAnswerIndex && (
                            <p className="quiz-answer-feedback correct">{t('common.correct')}</p>
                          )}
                          {answered && selectedOption !== q.correctAnswerIndex && (
                            <p className="quiz-answer-feedback incorrect">{t('common.incorrect')}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="passages-page">
      <h2>{t('passages.title')}</h2>
      <p>{t('passages.subtitle')}</p>
      
      <div className="passage-list">
        {passages.map(p => {
          const itemTitle = (language === 'ja' && p.titleJa) ? p.titleJa : p.title;
          return (
            <div key={p._id} className="passage-card" onClick={() => {
              fetchPassageById(p._id).then(res => {
                if (res.data.success) {
                  setSelectedPassage(res.data.data);
                  setShowTranslation(false);
                  setAnswers({});
                }
              }).catch(err => {
                console.error(err);
              });
            }}>
              <div className="passage-card-info">
                <div className="passage-card-title-row">
                  <h3>{itemTitle}</h3>
                  {completedPassages[p._id] && <span title="Mastered">✅</span>}
                </div>
                <span className="category-tag">{p.difficulty}</span>
              </div>
              <div className="passage-card-arrow">→</div>
            </div>
          );
        })}
      </div>
      
      <div className="passage-reset-actions">
        <button 
          className="btn-secondary reset-btn" 
          onClick={() => {
            const confirmMsg = t('passages.resetConfirm');
            if (window.confirm(confirmMsg)) {
              localStorage.removeItem('finnishLearnerPassagesProgress');
              setCompletedPassages({});
              if (typeof saveProgress === 'function') {
                try {
                  const p = saveProgress({ passagesProgress: {} });
                  if (p && typeof p.catch === 'function') p.catch(() => {});
                } catch (e) {}
              }
            }
          }}
        >
          {t('passages.resetBtn')}
        </button>
      </div>
    </div>
  );
}
