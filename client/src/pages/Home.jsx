import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GuidebookModal from '../components/GuidebookModal';
import LessonCard from '../components/LessonCard';
import { units } from '../data/curriculumData';
import { useProgressStore } from '../store/useProgressStore';

export default function Home() {
  const navigate = useNavigate();
  const { progress, resetProgress, loadProgress } = useProgressStore();
  const [activeGuidebook, setActiveGuidebook] = useState(null);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const handleResetProgress = () => {
    if (window.confirm("Are you sure you want to reset all your progress?")) {
      resetProgress();
    }
  };

  const handleLevelClick = (lessonTitle, level, ext) => {
    let url = `/sessions?category=${encodeURIComponent(lessonTitle)}&level=${level}`;
    if (ext) url += `&exerciseType=${ext}`;
    navigate(url);
  };

  return (
    <div className="home-path-container">
      {units.map((unit) => (
        <div key={unit.id} className="unit-section">
          
          <div className="unit-header" style={{ backgroundColor: unit.color }}>
            <div className="unit-header-content">
              <h2 className="unit-header-title">{unit.title}</h2>
              <p className="unit-header-desc">{unit.description}</p>
            </div>
            <button className="unit-guide-btn" style={{ color: unit.color }} onClick={() => setActiveGuidebook(unit)}>
              Guidebook
            </button>
          </div>

          <div className="curriculum-list">
            {unit.lessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                unitColor={unit.color}
                currentLevel={progress[lesson.title] || 1}
                onLevelClick={handleLevelClick}
              />
            ))}
          </div>

        </div>
      ))}

      <div className="progress-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
        <button className="btn-primary" onClick={() => navigate('/sessions?exerciseType=matching')} style={{ backgroundColor: '#ce82ff', color: 'white' }}>
          🧩 Practice Word Match
        </button>
        <button className="btn-primary" onClick={() => navigate('/sessions?exerciseType=speaking')}>
          🎙️ Practice Speaking
        </button>
        <button className="btn-secondary reset-btn" onClick={handleResetProgress}>Reset Progress</button>
      </div>

      {activeGuidebook && (
        <GuidebookModal unit={activeGuidebook} onClose={() => setActiveGuidebook(null)} />
      )}
    </div>
  );
}

