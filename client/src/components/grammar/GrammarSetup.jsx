import React from 'react';
import { GRAMMAR_CATEGORIES, grammarTopics, getAllPracticeQuestions } from '../../data/grammarData';
import { useLanguage } from '../../context/useLanguage';

export default function GrammarSetup({
  mistakeCount,
  dueMistakeCount,
  selectedCategory,
  selectedTopic,
  selectedType,
  questionCount,
  onSelectCategory,
  onSelectTopic,
  onSelectType,
  onSelectCount,
  onStart,
  onStartWeakness,
  onBack
}) {
  const { t, language } = useLanguage();

  return (
    <div className="practice-setup-card">
      <div className="setup-header">
        <button className="back-hub-link" onClick={onBack}>
          {t('drillStudio.backToHub')}
        </button>
        <h1 className="setup-title">{t('drillStudio.title')}</h1>
        <p className="setup-subtitle">
          {t('drillStudio.subtitle')}
        </p>
      </div>

      {/* Quick Stats & Mistake Bank Banner */}
      <div className="setup-stats-banner">
        <div className="stat-pill">
          <span className="stat-icon">📚</span>
          <span>{t('drillStudio.totalAvailable')} <strong>{getAllPracticeQuestions().length}{language === 'en' ? ' Qs' : '問'}</strong></span>
        </div>
        <div className="stat-pill">
          <span className="stat-icon">⚠️</span>
          <span>{t('drillStudio.weaknessTitle')} <strong>{mistakeCount}{language === 'en' ? ' Qs' : '問'}</strong></span>
        </div>
        {dueMistakeCount > 0 && (
          <button
            type="button"
            className="review-mistakes-btn"
            onClick={onStartWeakness}
          >
            {t('drillStudio.weaknessBtn', { count: dueMistakeCount })}
          </button>
        )}
      </div>

      {/* Setup Form */}
      <div className="setup-options-grid">
        {/* Category Filter */}
        <div className="setup-section">
          <label className="section-label">{t('drillStudio.stepCategory')}</label>
          <div className="filter-chips">
            {GRAMMAR_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`filter-chip ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => onSelectCategory(cat.id)}
              >
                {language === 'en' ? t(`grammarCategories.${cat.id}`) : cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Topic Filter */}
        <div className="setup-section">
          <label className="section-label">{t('drillStudio.stepTopic')}</label>
          <select
            className="topic-select"
            value={selectedTopic}
            onChange={(e) => onSelectTopic(e.target.value)}
          >
            <option value="all">{t('drillStudio.allTopics')}</option>
            {grammarTopics
              .filter((t) => selectedCategory === 'all' || t.category === selectedCategory)
              .map((t) => (
                <option key={t.id} value={t.id}>
                  [{t.level}] {t.title}
                </option>
              ))}
          </select>
        </div>

        {/* Question Format */}
        <div className="setup-section">
          <label className="section-label">{t('drillStudio.stepFormat')}</label>
          <div className="format-chips">
            <button
              type="button"
              className={`filter-chip ${selectedType === 'all' ? 'active' : ''}`}
              onClick={() => onSelectType('all')}
            >
              {t('drillStudio.formatAll')}
            </button>
            <button
              type="button"
              className={`filter-chip ${selectedType === 'choice' ? 'active' : ''}`}
              onClick={() => onSelectType('choice')}
            >
              {t('drillStudio.formatChoice')}
            </button>
            <button
              type="button"
              className={`filter-chip ${selectedType === 'typing' ? 'active' : ''}`}
              onClick={() => onSelectType('typing')}
            >
              {t('drillStudio.formatTyping')}
            </button>
            <button
              type="button"
              className={`filter-chip ${selectedType === 'wordbank' ? 'active' : ''}`}
              onClick={() => onSelectType('wordbank')}
            >
              {t('drillStudio.formatWordbank')}
            </button>
          </div>
        </div>

        {/* Question Count */}
        <div className="setup-section">
          <label className="section-label">{t('drillStudio.stepCount')}</label>
          <div className="count-buttons">
            {[5, 10, 15].map((cnt) => (
              <button
                key={cnt}
                type="button"
                className={`count-btn ${questionCount === cnt ? 'active' : ''}`}
                onClick={() => onSelectCount(cnt)}
              >
                {t('drillStudio.questionsCount', { count: cnt })}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="setup-actions">
        <button
          type="button"
          className="start-session-btn"
          onClick={onStart}
        >
          {t('drillStudio.startBtn')}
        </button>
      </div>
    </div>
  );
}
