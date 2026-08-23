import { useState, useEffect } from 'react';
import { fetchPassages, fetchPassageById } from '../services/api';
import { playAudio } from '../utils/audio';
import { playCorrectSound, playIncorrectSound } from '../utils/feedbackSounds';

export default function Passage() {
  const [passages, setPassages] = useState([]);
  const [selectedPassage, setSelectedPassage] = useState(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});

  const handleAnswer = (qIndex, optionIndex, correctIndex) => {
    if (answers[qIndex] !== undefined) return;
    
    setAnswers(prev => ({ ...prev, [qIndex]: optionIndex }));
    
    if (optionIndex === correctIndex) {
      playCorrectSound();
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
            ← Back to Passages
          </button>
          
          <div className="passage-header">
            <h2>{selectedPassage.title}</h2>
            <span className="category-tag">{selectedPassage.difficulty}</span>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '48px', marginTop: '24px', alignItems: 'flex-start' }}>
            <div className="passage-left-column" style={{ flex: '3 1 300px', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', paddingRight: '24px' }}>
              <div className="passage-reading">
                <div className="reading-header-audio" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0 }}>Reading</h3>
                  <button 
                    className="btn-audio" 
                    onClick={() => playAudio(selectedPassage.text, selectedPassage._id)}
                    title="Listen to passage"
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
                    {showTranslation ? 'Hide Translation' : 'Show Translation'}
                  </button>
                  
                  {showTranslation && (
                    <div className="translation-text">
                      {selectedPassage.translation}
                    </div>
                  )}
                </div>
              </div>
              
              {selectedPassage.vocabulary && selectedPassage.vocabulary.length > 0 && (
                <div className="passage-vocabulary">
                  <h3 style={{ marginTop: '32px', marginBottom: '16px' }}>Vocabulary</h3>
                  <div className="vocab-grid">
                    {selectedPassage.vocabulary.map((v, i) => (
                      <div key={i} className="vocab-item">
                        <span className="vocab-word">{v.word}</span>
                        <span className="vocab-translation">{v.translation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="passage-right-column" style={{ flex: '2 1 200px', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', paddingRight: '24px' }}>
              {selectedPassage.questions && selectedPassage.questions.length > 0 && (
                <div className="passage-quiz">
                  <h3 style={{ margin: 0, marginBottom: '16px' }}>Knowledge Check</h3>
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
                            <p style={{ color: 'var(--success)', marginTop: '8px', fontWeight: 'bold' }}>Correct!</p>
                          )}
                          {answered && selectedOption !== q.correctAnswerIndex && (
                            <p style={{ color: 'var(--error)', marginTop: '8px', fontWeight: 'bold' }}>Incorrect.</p>
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
      <h2>Reading Passages</h2>
      <p>Immerse yourself in Finnish texts and learn words in context.</p>
      
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
              <h3>{p.title}</h3>
              <span className="category-tag">{p.difficulty}</span>
            </div>
            <div className="passage-card-arrow">→</div>
          </div>
        ))}
      </div>
    </div>
  );
}
