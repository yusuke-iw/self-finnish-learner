import { Link, useNavigate } from 'react-router-dom';

const modules = [
  { id: 1, title: 'Asiointi ja Matkustaminen', level: 'A2', description: 'Running errands, travel, daily life' },
  { id: 2, title: 'Menneet ajat', level: 'A2/B1', description: 'Past tenses: Imperfect & Perfect' },
  { id: 3, title: 'Työelämä ja Opiskelu', level: 'B1', description: 'Worklife, job interviews, studying' },
  { id: 4, title: 'Konditionaali ja Potentiaali', level: 'B1/B2', description: 'Conditional mood "-isi-" and probability' },
  { id: 5, title: 'Yhteiskunta ja Ympäristö', level: 'B2', description: 'Society, politics, environmental issues' },
  { id: 6, title: 'Lauseenvastikkeet', level: 'B2/C1', description: 'Complex participle phrases, replacing "että" clauses' },
  { id: 7, title: 'Abstraktit keskustelut', level: 'C1', description: 'Nuanced abstract topics, idioms, literature' }
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-path-container">
      <div className="path-header">
        <h1>Finnish Learning Path</h1>
        <p>Progress from basic conversations to advanced C1 topics.</p>
      </div>

      <div className="learning-path">
        {modules.map((mod, index) => {
          // Calculate alternating zigzag pattern
          const offset = index % 2 === 0 ? '-30px' : '30px';
          const isLast = index === modules.length - 1;

          return (
            <div key={mod.id} className="path-node-container" style={{ transform: `translateX(${offset})` }}>
              <div 
                className="path-node"
                onClick={() => navigate(`/sessions?category=${encodeURIComponent(mod.title)}`)}
                title={mod.description}
              >
                <div className="node-icon">{mod.id}</div>
                <div className="node-tooltip">
                  <div className="node-level">{mod.level}</div>
                  <div className="node-title">{mod.title}</div>
                  <div className="node-desc">{mod.description}</div>
                  <div className="node-start">Start Lesson →</div>
                </div>
              </div>
              {!isLast && <div className="path-line"></div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
