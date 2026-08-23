import React, { useState, useEffect } from 'react';
import { fetchSentences } from "../services/api";
import { playAudio } from '../utils/audio';

export default function GuidebookModal({ unit, onClose }) {
  const [sentences, setSentences] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSentences = async () => {
      try {
        const res = await fetchSentences();
        if (res.data.success) {
          // Filter sentences that belong to any lesson in the current unit
          const lessonTitles = unit.lessons.map(l => l.title);
          const unitSentences = res.data.data.filter(s => lessonTitles.includes(s.category));
          setSentences(unitSentences);
        }
      } catch (err) {
        console.error("Failed to load guidebook sentences", err);
      }
      setIsLoading(false);
    };
    
    loadSentences();
  }, [unit]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="guidebook-modal" onClick={e => e.stopPropagation()}>
        <div className="guidebook-header" style={{ backgroundColor: unit.color }}>
          <div className="guidebook-header-content">
            <h2>{unit.title} Guidebook</h2>
            <p>Key Phrases & Grammar Notes</p>
          </div>
          <button className="guidebook-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="guidebook-content">
          {isLoading ? (
            <div className="guidebook-loading">Loading notes...</div>
          ) : (
            <div className="guidebook-sentences">
              {sentences.length === 0 ? (
                <p>No grammar notes available for this unit yet.</p>
              ) : (
                sentences.map(sentence => (
                  <div key={sentence._id} className="grammar-note-card">
                    <div className="grammar-phrase">
                      <div className="phrase-fi-container">
                        <span className="phrase-fi">{sentence.text}</span>
                        <button 
                          className="btn-audio" 
                          onClick={() => playAudio(sentence.text, sentence._id)}
                          title="Listen"
                        >
                          🔊
                        </button>
                      </div>
                      <span className="phrase-en">{sentence.translation}</span>
                    </div>
                    {sentence.grammarNotes && (
                      <div className="grammar-explanation">
                        <strong>Note:</strong> {sentence.grammarNotes}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
