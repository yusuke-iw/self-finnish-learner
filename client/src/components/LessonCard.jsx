import React from 'react';
import { useLanguage } from '../context/useLanguage';

export default function LessonCard({ lesson, unitColor, currentLevel, onLevelClick }) {
  const { language, t } = useLanguage();
  const isCompleted = currentLevel > 3;

  const title = language === 'ja' && lesson.titleJa ? lesson.titleJa : lesson.title;
  const description = language === 'ja' && lesson.descriptionJa ? lesson.descriptionJa : lesson.description;

  return (
    <div className="lesson-card" style={{ borderLeftColor: unitColor }}>
      <div className="lesson-info">
        <h3 className="lesson-title">{title}</h3>
        <p className="lesson-desc">{description}</p>
        <div className="lesson-status">
          {isCompleted ? (
            <span className="status-badge mastered">
              {t('home.mastered')}
            </span>
          ) : (
            <span className="status-badge" style={{ backgroundColor: unitColor }}>
              {t('home.currentLevel', { level: currentLevel })}
            </span>
          )}
        </div>
      </div>
      
      <div className="lesson-actions">
        <div className="lesson-actions-row">
          <button 
            className="level-btn"
            onClick={() => onLevelClick(lesson.id, 1)}
          >
            {t('home.levelChoice')}
          </button>
          <button 
            className="level-btn"
            onClick={() => onLevelClick(lesson.id, 2)}
          >
            {t('home.levelWords')}
          </button>
          <button 
            className="level-btn"
            onClick={() => onLevelClick(lesson.id, 3)}
          >
            {t('home.levelType')}
          </button>
        </div>
        <div className="lesson-actions-row">
          <button 
            className="level-btn level-btn-speak"
            onClick={() => onLevelClick(lesson.id, 3, 'speaking')}
          >
            {t('home.speakBtn')}
          </button>
          <button 
            className="level-btn level-btn-match"
            onClick={() => onLevelClick(lesson.id, 1, 'matching')}
          >
            {t('home.matchBtn')}
          </button>
        </div>
      </div>
    </div>
  );
}
