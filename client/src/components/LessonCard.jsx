import React from 'react';

export default function LessonCard({ lesson, unitColor, currentLevel, onLevelClick }) {
  const isCompleted = currentLevel > 3;

  return (
    <div className="lesson-card" style={{ borderLeftColor: unitColor }}>
      <div className="lesson-info">
        <h3 className="lesson-title">{lesson.title}</h3>
        <p className="lesson-desc">{lesson.description}</p>
        <div className="lesson-status">
          {isCompleted ? (
            <span className="status-badge" style={{ backgroundColor: '#ffd900', color: '#000' }}>🏆 Mastered</span>
          ) : (
            <span className="status-badge" style={{ backgroundColor: unitColor }}>Current: Level {currentLevel}</span>
          )}
        </div>
      </div>
      
      <div className="lesson-actions" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            className="level-btn"
            onClick={() => onLevelClick(lesson.title, 1)}
          >
            L1 (Choice)
          </button>
          <button 
            className="level-btn"
            onClick={() => onLevelClick(lesson.title, 2)}
          >
            L2 (Words)
          </button>
          <button 
            className="level-btn"
            onClick={() => onLevelClick(lesson.title, 3)}
          >
            L3 (Type)
          </button>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            className="level-btn"
            onClick={() => onLevelClick(lesson.title, 3, 'speaking')}
            style={{ backgroundColor: 'var(--accent)', color: 'white', borderColor: 'var(--accent)' }}
          >
            🎙️ Speak
          </button>
          <button 
            className="level-btn"
            onClick={() => onLevelClick(lesson.title, 1, 'matching')}
            style={{ backgroundColor: '#ce82ff', color: 'white', borderColor: '#ce82ff' }}
          >
            🧩 Match
          </button>
        </div>
      </div>
    </div>
  );
}
