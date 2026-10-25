import React, { useEffect } from 'react';
import InfoCard from './InfoCard';
import SceneText from './SceneText';
import { useLanguage } from '../../context/useLanguage';

export default function InfoCardModal({ game, mode, onClose }) {
  const { t } = useLanguage();

  useEffect(() => {
    if (!game) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [game, onClose]);

  if (!game || !Array.isArray(game.infoCards) || game.infoCards.length === 0) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="scene-info-modal"
        role="dialog"
        aria-modal="true"
        aria-label={game.title?.fi}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="scene-info-modal-header">
          <h2 className="scene-info-modal-title">
            <span className="scene-game-header-icon">{game.icon}</span>
            <SceneText text={game.title} mode={mode} variant="word" />
          </h2>
          <button
            type="button"
            className="guidebook-close-btn scene-info-modal-close"
            aria-label={t('scenes.closeInfo')}
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="scene-info-modal-body">
          {game.infoCards.map((card) => (
            <InfoCard key={card.id} card={card} mode={mode} />
          ))}
        </div>
      </div>
    </div>
  );
}
