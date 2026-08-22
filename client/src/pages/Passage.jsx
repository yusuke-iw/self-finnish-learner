import { useState, useEffect } from 'react';
import { fetchPassages, fetchPassageById } from '../services/api';
import { playAudio } from '../utils/audio';

export default function Passage() {
  const [passages, setPassages] = useState([]);
  const [selectedPassage, setSelectedPassage] = useState(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [loading, setLoading] = useState(true);

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
          
          <div className="passage-reading">
            <div className="reading-header-audio">
              <h3>Reading</h3>
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
              <h3>Vocabulary</h3>
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
