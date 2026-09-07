import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GRAMMAR_CATEGORIES, grammarTopics } from '../data/grammarData';
import { useLanguage } from '../context/LanguageContext';
import '../assets/App.css';

function GrammarHub() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTopics = grammarTopics.filter((topic) => {
    const matchesCategory = selectedCategory === 'all' || topic.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const title = (language === 'en' && topic.titleEn ? topic.titleEn : topic.title).toLowerCase();
    const summary = (language === 'en' && topic.summaryEn ? topic.summaryEn : topic.summary).toLowerCase();
    const origTitle = (topic.title || '').toLowerCase();
    const origSummary = (topic.summary || '').toLowerCase();
    const matchesSearch = title.includes(q) || summary.includes(q) || origTitle.includes(q) || origSummary.includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="grammar-hub-container">
      <header className="grammar-hub-header">
        <h1 className="hub-title">{t('grammarHub.title')}</h1>
        <p className="hub-subtitle">
          {t('grammarHub.subtitle')}
        </p>

        {/* Drill Studio Hero Banner */}
        <div className="drill-studio-banner">
          <div className="banner-content">
            <div className="banner-badge">{t('grammarHub.drillBannerBadge')}</div>
            <h2 className="banner-title">{t('grammarHub.drillBannerTitle')}</h2>
            <p className="banner-desc">
              {t('grammarHub.drillBannerDesc')}
            </p>
          </div>
          <div className="banner-actions">
            <button
              type="button"
              className="start-drill-btn"
              onClick={() => navigate('/grammar/practice')}
            >
              {t('grammarHub.startDrillBtn')}
            </button>
          </div>
        </div>
      </header>

      {/* Search & Category Filter */}
      <div className="grammar-controls">
        <div className="search-bar-wrapper">
          <input
            type="text"
            className="grammar-search-input"
            placeholder={t('grammarHub.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="category-tabs">
          {GRAMMAR_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`category-tab-btn ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {language === 'en' ? t(`grammarCategories.${cat.id}`) : cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Topic Grid */}
      <div className="grammar-topic-grid">
        {filteredTopics.length === 0 ? (
          <div className="no-topics-found">
            <p>{t('grammarHub.notFound')}</p>
          </div>
        ) : (
          filteredTopics.map((topic) => (
            <div
              key={topic.id}
              className="grammar-topic-card"
              onClick={() => navigate(`/grammar/${topic.id}`)}
            >
              <div className="topic-card-header">
                <span className={`level-badge level-${topic.level.toLowerCase()}`}>
                  {topic.level}
                </span>
                <span className="category-tag">
                  {language === 'en'
                    ? t(`grammarCategories.${topic.category}`)
                    : (GRAMMAR_CATEGORIES.find((c) => c.id === topic.category)?.label || topic.category)}
                </span>
              </div>
              <h3 className="topic-card-title">{language === 'en' && topic.titleEn ? topic.titleEn : topic.title}</h3>
              <p className="topic-card-summary">{language === 'en' && topic.summaryEn ? topic.summaryEn : topic.summary}</p>

              <div className="topic-card-footer">
                <span className="quiz-count-badge">
                  {t('grammarHub.exercisesCount', { count: topic.practiceQuiz.length })}
                </span>
                <button className="read-more-btn">
                  {t('grammarHub.learnMore')}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default GrammarHub;
