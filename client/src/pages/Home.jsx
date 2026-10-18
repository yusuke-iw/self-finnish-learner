import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GuidebookModal from '../components/GuidebookModal';
import LessonCard from '../components/LessonCard';
import { units } from '../data/curriculumData';
import { useProgressStore } from '../store/useProgressStore';
import { useLanguage } from '../context/LanguageContext';
import { getUserId, setUserId } from '../utils/userId';
import { getSessionLength, setSessionLength, VALID_SESSION_LENGTHS } from '../utils/sessionPreferences';
import { getSentenceMistakes } from '../utils/sentenceMistakes';

export default function Home() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { progress, resetProgress, loadProgress, syncWithServer } = useProgressStore();
  const [activeGuidebook, setActiveGuidebook] = useState(null);
  const [syncIdInput, setSyncIdInput] = useState(() => getUserId());
  const [syncIdError, setSyncIdError] = useState('');
  const [sessionLength, setSessionLengthState] = useState(() => getSessionLength());

  useEffect(() => {
    loadProgress();
    syncWithServer();
  }, [loadProgress, syncWithServer]);

  const mistakeCount = getSentenceMistakes().length;

  const handleSessionLengthChange = (e) => {
    const nextLength = Number(e.target.value);
    if (setSessionLength(nextLength)) {
      setSessionLengthState(nextLength);
    }
  };

  const handleResetProgress = () => {
    if (window.confirm(t('home.resetConfirm'))) {
      resetProgress();
    }
  };

  const handleSaveSyncId = () => {
    if (setUserId(syncIdInput)) {
      setSyncIdError('');
      setSyncIdInput(getUserId());
      syncWithServer();
    } else {
      setSyncIdError(t('home.syncIdError'));
    }
  };

  const handleLevelClick = (lessonId, level, ext) => {
    let url = `/sessions?lessonId=${encodeURIComponent(lessonId)}&level=${level}`;
    if (ext) url += `&exerciseType=${ext}`;
    navigate(url);
  };

  return (
    <div className="home-path-container">
      <div className="session-length-bar">
        <label htmlFor="home-session-length" className="session-length-label">
          {t('home.questionsPerSession')}
        </label>
        <select
          id="home-session-length"
          className="session-length-select"
          value={sessionLength}
          onChange={handleSessionLengthChange}
        >
          {VALID_SESSION_LENGTHS.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      {units.map((unit) => {
        const unitTitle = language === 'ja' && unit.titleJa ? unit.titleJa : unit.title;
        const unitDesc = language === 'ja' && unit.descriptionJa ? unit.descriptionJa : unit.description;

        return (
          <div key={unit.id} className="unit-section">
            <div className="unit-header" style={{ backgroundColor: unit.color }}>
              <div className="unit-header-content">
                <h2 className="unit-header-title">{unitTitle}</h2>
                <p className="unit-header-desc">{unitDesc}</p>
              </div>
              <button
                className="unit-guide-btn"
                style={{ color: unit.color }}
                onClick={() => setActiveGuidebook(unit)}
              >
                {t('home.guidebook')}
              </button>
            </div>

            <div className="curriculum-list">
              {unit.lessons.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  unitColor={unit.color}
                  currentLevel={progress[lesson.id] || 1}
                  onLevelClick={handleLevelClick}
                />
              ))}
            </div>
          </div>
        );
      })}

      <div className="progress-actions">
        <button
          className="btn-primary practice-match-btn"
          onClick={() => navigate('/sessions?exerciseType=matching')}
        >
          {t('home.practiceMatch')}
        </button>
        <button className="btn-primary" onClick={() => navigate('/sessions?exerciseType=speaking')}>
          {t('home.practiceSpeaking')}
        </button>
        <button
          className="btn-primary review-sentences-btn"
          onClick={() => navigate('/sessions?review=1')}
          disabled={mistakeCount === 0}
        >
          {t('home.reviewMistakes', { count: mistakeCount })}
        </button>
        <button className="btn-secondary reset-btn" onClick={handleResetProgress}>
          {t('home.resetProgress')}
        </button>
      </div>

      <div className="sync-id-section">
        <div className="sync-id-controls">
          <label htmlFor="sync-id-input" className="sync-id-label">
            {t('home.syncIdLabel')}
          </label>
          <input
            id="sync-id-input"
            type="text"
            className="sync-id-input"
            value={syncIdInput}
            onChange={(e) => setSyncIdInput(e.target.value)}
          />
          <button type="button" className="btn-secondary sync-id-save-btn" onClick={handleSaveSyncId}>
            {t('home.syncIdSave')}
          </button>
        </div>
        {syncIdError && (
          <p className="sync-id-error" role="alert">
            {syncIdError}
          </p>
        )}
        <p className="sync-id-desc">{t('home.syncIdDesc')}</p>
      </div>

      {activeGuidebook && (
        <GuidebookModal unit={activeGuidebook} onClose={() => setActiveGuidebook(null)} />
      )}
    </div>
  );
}


