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
    return <div className="passages-page"><p>Loading passages...</p></div>;
  }

  if (selectedPassage) {
    return (
      <div className="passages-page">
        <div className="passage-detail">
          <button className="passage-back-btn" onClick={() => setSelectedPassage(null)}>
            {language === 'en' ? '← Back to Passages' : '← パッセージ一覧に戻る'}
          </button>
          
          <div className="passage-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2>{selectedPassage.title}</h2>
              {completedPassages[selectedPassage._id] && (
                <span className="status-badge" style={{ backgroundColor: '#ffd900', color: '#000', fontSize: '0.9rem', padding: '4px 8px' }}>
                  {language === 'en' ? '🏆 Mastered' : '🏆 完全習得'}
                </span>
              )}
            </div>
            <span className="category-tag">{selectedPassage.difficulty}</span>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '64px', marginTop: '32px', alignItems: 'flex-start' }}>
            <div className="passage-left-column" style={{ flex: '1 1 500px', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', paddingRight: '16px' }}>
              <div className="passage-reading">
                <div className="reading-header-audio" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '24px' }}>{language === 'en' ? 'Reading' : '本文 (Reading)'}</h3>
                  <button 
                    className="btn-audio" 
                    onClick={() => playAudio(selectedPassage.text, selectedPassage._id)}
                    title={language === 'en' ? 'Listen to passage' : '発音を聞く'}
                  >
                    🔊
                  </button>
                </div>
                <p className="passage-text" style={{ fontSize: '18px', lineHeight: '1.6' }}>{selectedPassage.text}</p>
                
                <div className="passage-translation-toggle" style={{ marginTop: '24px' }}>
                  <button 
                    className="toggle-btn"
                    onClick={() => setShowTranslation(!showTranslation)}
                  >
                    {showTranslation
                      ? (language === 'en' ? 'Hide Translation' : '対訳を隠す')
                      : (language === 'en' ? 'Show Translation' : '対訳を表示')}
                  </button>
                  
                  {showTranslation && (
                    <div className="translation-text" style={{ fontSize: '16px', lineHeight: '1.6', marginTop: '16px', padding: '16px', backgroundColor: 'var(--bg-card)', borderRadius: '8px' }}>
                      {language === 'ja' && selectedPassage.translationJa ? selectedPassage.translationJa : selectedPassage.translation}
                    </div>
                  )}
                </div>
              </div>
              
              {selectedPassage.vocabulary && selectedPassage.vocabulary.length > 0 && (
                <div className="passage-vocabulary" style={{ marginTop: '48px' }}>
                  <h3 style={{ marginBottom: '24px', fontSize: '24px' }}>{language === 'en' ? 'Vocabulary' : '単語・語彙 (Vocabulary)'}</h3>
                  <div className="vocab-grid">
                    {selectedPassage.vocabulary.map((v, i) => (
                      <div key={i} className="vocab-item" style={{ padding: '12px', background: 'var(--bg-card)', borderRadius: '8px', marginBottom: '8px' }}>
                        <span className="vocab-word" style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>{v.word}</span>
                        <span className="vocab-translation" style={{ color: 'var(--text-secondary)' }}>
                          {language === 'ja' && v.translationJa ? v.translationJa : v.translation}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="passage-right-column" style={{ flex: '1 1 400px', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', padding: '24px', backgroundColor: 'var(--bg-card-hover)', borderRadius: '12px' }}>
              {selectedPassage.questions && selectedPassage.questions.length > 0 && (
                <div className="passage-quiz">
                  <h3 style={{ margin: 0, marginBottom: '24px', fontSize: '24px' }}>{language === 'en' ? 'Knowledge Check' : '理解度チェック (Knowledge Check)'}</h3>
                  <div className="quiz-questions">
                    {selectedPassage.questions.map((q, qIndex) => {
                      const answered = answers[qIndex] !== undefined;
                      const selectedOption = answers[qIndex];
                      
                      return (
                        <div key={qIndex} className="quiz-question" style={{ marginBottom: '24px', background: 'var(--bg-card)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                          <p style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '1.1rem' }}>{q.questionText}</p>
                          <div className="quiz-options" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {q.options.map((opt, optIndex) => {
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
                                  style={{ textAlign: 'left', padding: '12px' }}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                          {answered && selectedOption === q.correctAnswerIndex && (
                            <p style={{ color: 'var(--success)', marginTop: '8px', fontWeight: 'bold' }}>{language === 'en' ? 'Correct!' : '正解！'}</p>
                          )}
                          {answered && selectedOption !== q.correctAnswerIndex && (
                            <p style={{ color: 'var(--error)', marginTop: '8px', fontWeight: 'bold' }}>{language === 'en' ? 'Incorrect.' : '不正解'}</p>
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
      <h2>{language === 'en' ? 'Reading Passages' : '読解パッセージ (Reading Passages)'}</h2>
      <p>{language === 'en' ? 'Immerse yourself in Finnish texts and learn words in context.' : '生きたフィンランド語テキストと読解クイズで語彙や文脈を学びましょう。'}</p>
      
      <div className="passage-list">
        {passages.map(p => (
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3>{p.title}</h3>
                {completedPassages[p._id] && <span title="Mastered">✅</span>}
              </div>
              <span className="category-tag">{p.difficulty}</span>
            </div>
            <div className="passage-card-arrow">→</div>
          </div>
        ))}
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px', marginBottom: '32px' }}>
        <button 
          className="btn-secondary reset-btn" 
          onClick={() => {
            const confirmMsg = language === 'en'
              ? "Are you sure you want to reset your passage progress?"
              : "読解パッセージの進捗をリセットしてもよろしいですか？";
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
          {language === 'en' ? 'Reset Progress' : '読解履歴をリセット'}
        </button>
      </div>
    </div>
  );
}
