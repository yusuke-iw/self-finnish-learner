import React from 'react';
import SceneText from './SceneText';
import { playAudio } from '../../utils/audio';
import { DEFAULT_SPEAKER } from '../../utils/speakers';
import { useLanguage } from '../../context/useLanguage';

export default function InfoCard({ card, mode }) {
  const { t } = useLanguage();

  if (!card) return null;

  const handlePlaySentence = (sentence, index) => {
    const textToPlay = mode === 'selko' && sentence.selko ? sentence.selko : sentence.fi;
    try {
      const p = playAudio(textToPlay, `${card.id}-${index}`, 'fi-FI', 1.0, DEFAULT_SPEAKER);
      if (p && typeof p.catch === 'function') {
        p.catch(() => {});
      }
    } catch {
      // ignore playback errors
    }
  };

  return (
    <div className="scene-info-card">
      <h3 className="scene-info-title">
        <SceneText text={card.title} mode={mode} />
      </h3>

      <div className="scene-info-body">
        {Array.isArray(card.body) &&
          card.body.map((sentence, idx) => (
            <div key={idx} className="scene-info-sentence-row">
              <SceneText text={sentence} mode={mode} />
              <button
                type="button"
                className="btn-audio scene-info-audio-btn"
                aria-label={t('scenes.listen')}
                onClick={() => handlePlaySentence(sentence, idx)}
              >
                🔊
              </button>
            </div>
          ))}
      </div>

      {card.grammarNote && (
        <div className="scene-info-grammar-note">
          <span className="scene-info-grammar-label">{t('scenes.grammar')}:</span>
          <SceneText text={card.grammarNote} mode={mode} />
        </div>
      )}
    </div>
  );
}
