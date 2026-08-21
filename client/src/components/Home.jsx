import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import GuidebookModal from './GuidebookModal';

const units = [
  {
    id: 1,
    title: 'Unit 1: A2 Foundations',
    description: 'Basic daily life and past tenses',
    color: '#58cc02', // Green
    lessons: [
      { id: 'l1', title: 'Asiointi ja Matkustaminen', description: 'Running errands, travel' },
      { id: 'l2', title: 'Menneet ajat', description: 'Past tenses: Imperfect & Perfect' },
    ]
  },
  {
    id: 2,
    title: 'Unit 2: B1 Intermediate',
    description: 'Worklife and conditional mood',
    color: '#ce82ff', // Purple
    lessons: [
      { id: 'l3', title: 'Työelämä ja Opiskelu', description: 'Worklife, job interviews' },
      { id: 'l4', title: 'Konditionaali ja Potentiaali', description: 'Conditional mood "-isi-"' },
    ]
  },
  {
    id: 3,
    title: 'Unit 3: B2 Advanced',
    description: 'Society and participle phrases',
    color: '#00cd9c', // Cyan
    lessons: [
      { id: 'l5', title: 'Yhteiskunta ja Ympäristö', description: 'Society, politics' },
      { id: 'l6', title: 'Lauseenvastikkeet', description: 'Complex participle phrases' },
    ]
  },
  {
    id: 4,
    title: 'Unit 4: C1 Mastery',
    description: 'Abstract and nuanced discussions',
    color: '#ff9600', // Orange
    lessons: [
      { id: 'l7', title: 'Abstraktit keskustelut', description: 'Nuanced abstract topics, idioms' }
    ]
  }
];

export default function Home() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState({});
  const [activeGuidebook, setActiveGuidebook] = useState(null);

  useEffect(() => {
    const savedProgress = JSON.parse(localStorage.getItem('finnishLearnerProgress') || '{}');
    setProgress(savedProgress);
  }, []);

  const handleResetProgress = () => {
    if (window.confirm("Are you sure you want to reset all your progress?")) {
      localStorage.removeItem('finnishLearnerProgress');
      setProgress({});
    }
  };

  const handleLevelClick = (lessonTitle, level) => {
    navigate(`/sessions?category=${encodeURIComponent(lessonTitle)}&level=${level}`);
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
            {unit.lessons.map((lesson) => {
              const currentLevel = progress[lesson.title] || 1;
              const isCompleted = currentLevel > 3;

              return (
                <div key={lesson.id} className="lesson-card" style={{ borderLeftColor: unit.color }}>
                  <div className="lesson-info">
                    <h3 className="lesson-title">{lesson.title}</h3>
                    <p className="lesson-desc">{lesson.description}</p>
                    <div className="lesson-status">
                      {isCompleted ? (
                        <span className="status-badge" style={{ backgroundColor: '#ffd900', color: '#000' }}>🏆 Mastered</span>
                      ) : (
                        <span className="status-badge" style={{ backgroundColor: unit.color }}>Current: Level {currentLevel}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="lesson-actions">
                    <button 
                      className="level-btn"
                      onClick={() => handleLevelClick(lesson.title, 1)}
                    >
                      L1 (Choice)
                    </button>
                    <button 
                      className="level-btn"
                      onClick={() => handleLevelClick(lesson.title, 2)}
                    >
                      L2 (Words)
                    </button>
                    <button 
                      className="level-btn"
                      onClick={() => handleLevelClick(lesson.title, 3)}
                    >
                      L3 (Type)
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      ))}

      <div className="progress-actions">
        <button className="btn-secondary reset-btn" onClick={handleResetProgress}>Reset Progress</button>
      </div>

      {activeGuidebook && (
        <GuidebookModal unit={activeGuidebook} onClose={() => setActiveGuidebook(null)} />
      )}
    </div>
  );
}
