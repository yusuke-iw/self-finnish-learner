import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const units = [
  {
    id: 1,
    title: 'Unit 1: A2 Foundations',
    description: 'Basic daily life and past tenses',
    color: '#58cc02', // Duolingo green
    lessons: [
      { id: 'l1', title: 'Asiointi ja Matkustaminen', description: 'Running errands, travel' },
      { id: 'l2', title: 'Menneet ajat', description: 'Past tenses: Imperfect & Perfect' },
    ]
  },
  {
    id: 2,
    title: 'Unit 2: B1 Intermediate',
    description: 'Worklife and conditional mood',
    color: '#ce82ff', // Duolingo purple
    lessons: [
      { id: 'l3', title: 'Työelämä ja Opiskelu', description: 'Worklife, job interviews' },
      { id: 'l4', title: 'Konditionaali ja Potentiaali', description: 'Conditional mood "-isi-"' },
    ]
  },
  {
    id: 3,
    title: 'Unit 3: B2 Advanced',
    description: 'Society and participle phrases',
    color: '#00cd9c', // Duolingo cyan
    lessons: [
      { id: 'l5', title: 'Yhteiskunta ja Ympäristö', description: 'Society, politics' },
      { id: 'l6', title: 'Lauseenvastikkeet', description: 'Complex participle phrases' },
    ]
  },
  {
    id: 4,
    title: 'Unit 4: C1 Mastery',
    description: 'Abstract and nuanced discussions',
    color: '#ff9600', // Duolingo orange
    lessons: [
      { id: 'l7', title: 'Abstraktit keskustelut', description: 'Nuanced abstract topics, idioms' }
    ]
  }
];

export default function Home() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState({});

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

  return (
    <div className="home-path-container">
      {units.map((unit) => (
        <div key={unit.id} className="unit-section">
          
          <div className="unit-header" style={{ backgroundColor: unit.color }}>
            <div className="unit-header-content">
              <h2 className="unit-header-title">{unit.title}</h2>
              <p className="unit-header-desc">{unit.description}</p>
            </div>
            <button className="unit-guide-btn" style={{ color: unit.color }}>Guidebook</button>
          </div>

          <div className="learning-path">
            {unit.lessons.map((lesson, index) => {
              const offset = index % 2 === 0 ? '-30px' : '30px';
              const isLast = index === unit.lessons.length - 1;
              const currentLevel = progress[lesson.title] || 1;
              const isCompleted = currentLevel > 3;

              // If fully completed, use gold color for the node styling
              const nodeBorderColor = isCompleted ? '#ffd900' : unit.color;
              const nodeIconColor = isCompleted ? '#ffd900' : unit.color;
              const nodeIcon = isCompleted ? '🏆' : '★';

              return (
                <div key={lesson.id} className="path-node-container" style={{ transform: `translateX(${offset})` }}>
                  <div 
                    className={`path-node ${isCompleted ? 'completed-node' : ''}`}
                    style={{ borderColor: nodeBorderColor }}
                    onClick={() => {
                      if (!isCompleted) {
                        navigate(`/sessions?category=${encodeURIComponent(lesson.title)}&level=${currentLevel}`);
                      } else {
                        // User can still practice, let's load a random level 3 session
                        navigate(`/sessions?category=${encodeURIComponent(lesson.title)}&level=3`);
                      }
                    }}
                    title={lesson.description}
                  >
                    <div className="node-icon" style={{ color: nodeIconColor }}>{nodeIcon}</div>
                    
                    {/* Crown badge indicating level */}
                    <div className="node-crown">
                      {isCompleted ? 'MAX' : `L${currentLevel}`}
                    </div>

                    <div className="node-tooltip">
                      <div className="node-title">{lesson.title}</div>
                      <div className="node-desc">{lesson.description}</div>
                      <div className="node-start" style={{ color: nodeBorderColor }}>
                        {isCompleted ? 'Practice →' : `Start Level ${currentLevel} →`}
                      </div>
                    </div>
                  </div>
                  {!isLast && <div className="path-line" style={{ backgroundColor: unit.color, opacity: 0.3 }}></div>}
                </div>
              );
            })}
          </div>

        </div>
      ))}

      <div className="progress-actions">
        <button className="btn-secondary reset-btn" onClick={handleResetProgress}>Reset Progress</button>
      </div>
    </div>
  );
}
