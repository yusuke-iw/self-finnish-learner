import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import GuidebookModal from '../components/GuidebookModal';
import LessonCard from '../components/LessonCard';
import { units } from '../data/curriculumData';
import { useProgressStore } from '../store/useProgressStore';
import { useLanguage } from '../context/useLanguage';
import { getUserId, setUserId } from '../utils/userId';
import { getSessionLength, setSessionLength, VALID_SESSION_LENGTHS } from '../utils/sessionPreferences';
import { saveProgress } from '../services/api';
import { getDueCount } from '../utils/reviewSchedule';
import {
  getStreak,
  getTodayCount,
  getDailyGoal,
  setDailyGoal,
  VALID_DAILY_GOALS
} from '../utils/studyStats';

export default function Home() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { progress, resetProgress, loadProgress, syncWithServer } = useProgressStore();
  const [activeGuidebook, setActiveGuidebook] = useState(null);
  const [syncIdInput, setSyncIdInput] = useState(() => getUserId());
  const [syncIdError, setSyncIdError] = useState('');
  const [sessionLength, setSessionLengthState] = useState(() => getSessionLength());
  const [, setStatsVersion] = useState(0);

  useEffect(() => {
    loadProgress();
    syncWithServer();
  }, [loadProgress, syncWithServer]);

  const streak = getStreak();
  const todayCount = getTodayCount();
  const dailyGoal = getDailyGoal();
  const dueCount = getDueCount().total;
  const goalProgressPercent = Math.min(100, Math.round((todayCount / dailyGoal) * 100));

  const handleDailyGoalChange = (e) => {
    const nextGoal = Number(e.target.value);
    if (VALID_DAILY_GOALS.includes(nextGoal)) {
      const updatedStats = setDailyGoal(nextGoal);
      setStatsVersion((v) => v + 1);
      try {
        const p = saveProgress({ studyStats: updatedStats });
        if (p && typeof p.catch === 'function') {
          p.catch((err) => {
            console.warn('[INFO] Failed to save study stats to server:', err?.message);
          });
        }
      } catch (err) {
        console.warn('[INFO] Failed to save study stats to server:', err?.message);
      }
    }
  };

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
      <div className="study-card" data-testid="study-card">
        <div className="study-card-top">
          <span className="study-streak-badge">
            🔥 {t('home.streakCount', { count: streak })}
          </span>
          <div className="study-goal-controls">
            <label htmlFor="home-daily-goal" className="study-goal-label">
              {t('home.dailyGoalLabel')}
            </label>
            <select
              id="home-daily-goal"
              className="study-goal-select"
              value={dailyGoal}
              onChange={handleDailyGoalChange}
            >
              {VALID_DAILY_GOALS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="study-goal-progress-section">
          <div className="study-goal-info">
            <span>{t('home.todayProgress', { count: todayCount, goal: dailyGoal })}</span>
            {todayCount >= dailyGoal && (
              <span className="study-goal-reached">{t('home.dailyGoalReached')}</span>
            )}
          </div>
          <div className="study-goal-bar">
            <div
              className="study-goal-fill"
              style={{ width: `${goalProgressPercent}%` }}
            />
          </div>
        </div>

        <div className="study-review-row">
          <span className="study-review-status">
            {dueCount > 0
              ? t('home.todayReviewCount', { count: dueCount })
              : t('home.noReviewToday')}
          </span>
          <button
            type="button"
            className="btn-primary study-review-btn"
            onClick={() => navigate('/review')}
            disabled={dueCount === 0}
          >
            {t('home.startReviewBtn')}
          </button>
        </div>
      </div>

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

      <div className="home-scenes-card">
        <div className="home-scenes-content">
          <h3 className="home-scenes-title">{t('home.scenesTitle')}</h3>
          <p className="home-scenes-desc">{t('home.scenesDesc')}</p>
        </div>
        <Link to="/scenes" className="btn-primary home-scenes-btn">
          {t('scenes.title')}
        </Link>
      </div>

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
        <button className="btn-primary" onClick={() => navigate('/sessions?exerciseType=dictation')}>
          {t('home.practiceDictation')}
        </button>
        <button className="btn-primary" onClick={() => navigate('/sessions?exerciseType=spoken')}>
          {t('home.practiceSpoken')}
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


