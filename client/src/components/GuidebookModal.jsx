import React, { useState, useEffect } from 'react';
import { fetchSentences } from "../services/api";
import { playAudio } from '../utils/audio';
import { useLanguage } from '../context/LanguageContext';

export default function GuidebookModal({ unit, onClose }) {
  const { language, t } = useLanguage();
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

  const unitTitle = language === 'ja' && unit.titleJa ? unit.titleJa : unit.title;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="guidebook-modal" onClick={e => e.stopPropagation()}>
        <div className="guidebook-header" style={{ backgroundColor: unit.color }}>
          <div className="guidebook-header-content">
            <h2>{unitTitle} {t('home.guidebook')}</h2>
            <p>{t('guidebook.headerSubtitle')}</p>
          </div>
          <button className="guidebook-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="guidebook-content">
          {isLoading ? (
            <div className="guidebook-loading">{t('guidebook.loadingNotes')}</div>
          ) : (
            <div className="guidebook-sentences">
              {sentences.length === 0 ? (
                <p>{t('guidebook.emptyNotes')}</p>
              ) : (
                sentences.map(sentence => {
                  const sentenceTrans = (language === 'ja' && sentence.translationJa) ? sentence.translationJa : sentence.translation;
                  const sentenceNotes = (language === 'ja' && sentence.grammarNotesJa) ? sentence.grammarNotesJa : sentence.grammarNotes;

                  return (
                    <div key={sentence._id} className="grammar-note-card">
                      <div className="grammar-phrase">
                        <div className="phrase-fi-container">
                          <span className="phrase-fi">{sentence.text}</span>
                          <button 
                            className="btn-audio" 
                            onClick={() => playAudio(sentence.text, sentence._id)}
                            title={t('common.listen')}
                          >
                            🔊
                          </button>
                        </div>
                        <span className="phrase-en">{sentenceTrans}</span>
                      </div>
                      {sentenceNotes && (
                        <div className="grammar-explanation">
                          <strong>{t('guidebook.noteLabel')}</strong> {sentenceNotes}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
