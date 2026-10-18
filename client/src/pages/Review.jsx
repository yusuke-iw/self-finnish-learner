import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/useLanguage';
import { getDueCount, getUpcomingCount } from '../utils/reviewSchedule';

export default function Review() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const due = getDueCount();
  const upcoming1d = getUpcomingCount(1);
  const upcoming7d = getUpcomingCount(7);

  return (
    <div className="review-page">
      <div className="review-header">
        <h2 className="review-title">{t('review.title')}</h2>
        <p className="review-subtitle">{t('review.subtitle')}</p>
      </div>

      <div className="review-cards-grid">
        <div className="review-category-card" data-testid="review-sentence-card">
          <div className="review-category-info">
            <h3 className="review-category-title">{t('review.sentencesTitle')}</h3>
            <span className="review-due-badge">
              {t('review.dueCount', { count: due.sentence })}
            </span>
          </div>
          <button
            type="button"
            className="btn-primary review-start-btn"
            disabled={due.sentence === 0}
            onClick={() => navigate('/sessions?review=1')}
          >
            {t('review.startBtn')}
          </button>
        </div>

        <div className="review-category-card" data-testid="review-grammar-card">
          <div className="review-category-info">
            <h3 className="review-category-title">{t('review.grammarTitle')}</h3>
            <span className="review-due-badge">
              {t('review.dueCount', { count: due.grammar })}
            </span>
          </div>
          <button
            type="button"
            className="btn-primary review-start-btn"
            disabled={due.grammar === 0}
            onClick={() => navigate('/grammar/practice?review=1')}
          >
            {t('review.startBtn')}
          </button>
        </div>
        <div className="review-category-card" data-testid="review-word-card">
          <div className="review-category-info">
            <h3 className="review-category-title">{t('review.wordsTitle')}</h3>
            <span className="review-due-badge">{t('review.dueCount', { count: due.word })}</span>
          </div>
          <button
            type="button"
            className="btn-primary review-start-btn"
            disabled={due.word === 0}
            onClick={() => navigate('/words?review=1')}
          >
            {t('review.startBtn')}
          </button>
        </div>
      </div>

      <div className="review-upcoming-card">
        <h3 className="review-upcoming-title">{t('review.upcomingTitle')}</h3>
        <div className="review-upcoming-list">
          <div className="review-upcoming-row">
            <span className="review-upcoming-label">{t('review.upcoming1d')}</span>
            <strong className="review-upcoming-value">
              {t('review.upcomingCount', { count: upcoming1d })}
            </strong>
          </div>
          <div className="review-upcoming-row">
            <span className="review-upcoming-label">{t('review.upcoming7d')}</span>
            <strong className="review-upcoming-value">
              {t('review.upcomingCount', { count: upcoming7d })}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}
