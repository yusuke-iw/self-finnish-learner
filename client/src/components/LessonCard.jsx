import React from 'react';
import { useLanguage } from '../context/LanguageContext';

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
            <span className="status-badge" style={{ backgroundColor: '#ffd900', color: '#000' }}>
              {t('home.mastered')}
            </span>
          ) : (
            <span className="status-badge" style={{ backgroundColor: unitColor }}>
              {t('home.currentLevel', { level: currentLevel })}
            </span>
          )}
        </div>
      </div>
      
      <div className="lesson-actions" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            className="level-btn"
            onClick={() => onLevelClick(lesson.title, 1)}
          >
            {t('home.levelChoice')}
          </button>
          <button 
            className="level-btn"
            onClick={() => onLevelClick(lesson.title, 2)}
          >
            {t('home.levelWords')}
          </button>
          <button 
            className="level-btn"
            onClick={() => onLevelClick(lesson.title, 3)}
          >
            {t('home.levelType')}
          </button>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            className="level-btn"
            onClick={() => onLevelClick(lesson.title, 3, 'speaking')}
            style={{ backgroundColor: 'var(--accent)', color: 'white', borderColor: 'var(--accent)' }}
          >
            {t('home.speakBtn')}
          </button>
          <button 
            className="level-btn"
            onClick={() => onLevelClick(lesson.title, 1, 'matching')}
            style={{ backgroundColor: '#ce82ff', color: 'white', borderColor: '#ce82ff' }}
          >
            {t('home.matchBtn')}
          </button>
        </div>
      </div>
    </div>
  );
}
