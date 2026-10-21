import React from 'react';
import { useLanguage } from '../../context/useLanguage';

export default function GrammarSummary({
  score,
  total,
  maxStreak,
  elapsedTime,
  mistakes,
  onRetryWeakness,
  onRetry,
  onChangeSettings,
  onBackToHub
}) {
  const { t, language } = useLanguage();

  return (
    <div className="practice-summary-card">
      <div className="summary-header">
        <span className="summary-trophy">
          {score === total ? '🏆' : score >= total * 0.7 ? '🌟' : '💪'}
        </span>
        <h1 className="summary-title">{t('drillStudio.completedTitle')}</h1>
        <p className="summary-msg">
          {score === total
            ? (language === 'en' ? 'Awesome! Perfect score on all exercises!' : '完璧です！全問正解を達成しました！')
            : score >= total * 0.7
            ? (language === 'en' ? 'Great progress! Your grammar skills are improving fast.' : '素晴らしい成果です！着実に文法力が身についています。')
            : (language === 'en' ? 'Good effort! Review the missed questions and try again.' : 'ナイスファイト！間違えた問題を復習して再挑戦しましょう。')}
        </p>
      </div>

      <div className="summary-stats-grid">
        <div className="summary-stat-box">
          <span className="stat-label">{language === 'en' ? 'Score' : '正解数 / 出題数'}</span>
          <span className="stat-number">{score} / {total}</span>
          <span className="stat-sub">({Math.round((score / total) * 100)}%)</span>
        </div>
        <div className="summary-stat-box">
          <span className="stat-label">{t('drillStudio.maxStreakLabel')}</span>
          <span className="stat-number">{maxStreak} {language === 'en' ? 'Qs' : '問'}</span>
          <span className="stat-sub">Streak 🔥</span>
        </div>
        <div className="summary-stat-box">
          <span className="stat-label">{t('drillStudio.timeLabel')}</span>
          <span className="stat-number">{elapsedTime} {language === 'en' ? 's' : '秒'}</span>
          <span className="stat-sub">Time ⏱️</span>
        </div>
      </div>

      {/* Mistakes review */}
      {mistakes.length > 0 && (
        <div className="summary-mistakes-section">
          <h3>⚠️ {language === 'en' ? `Review Missed Questions (${mistakes.length})` : `今回間違えた問題 (${mistakes.length}問)`}</h3>
          <div className="mistakes-list">
            {mistakes.map((m, idx) => (
              <div key={idx} className="mistake-item-card">
                <div className="mistake-item-topic">
                  <span className="topic-badge">{language === 'en' && m.topicTitleEn ? m.topicTitleEn : m.topicTitle}</span>
                </div>
                <p className="mistake-q">{language === 'en' ? 'Question:' : '問:'} {(language === 'en' && m.questionEn) ? m.questionEn : m.question}</p>
                <p className="mistake-your-ans">{language === 'en' ? 'Your answer:' : 'あなたの回答:'} <span className="your-ans-text">{m.userAnswer || (language === 'en' ? 'Unanswered' : '未回答')}</span></p>
                <p className="mistake-correct-ans">{language === 'en' ? 'Correct answer:' : '正解:'} <strong>{m.answer}</strong></p>
                <p className="mistake-exp">💡 {(language === 'en' && m.explanationEn) ? m.explanationEn : m.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="summary-actions-grid">
        {mistakes.length > 0 && (
          <button
            type="button"
            className="summary-btn btn-weakness"
            onClick={onRetryWeakness}
          >
            {t('drillStudio.retryWeaknessBtn', { count: mistakes.length })}
          </button>
        )}

        <button
          type="button"
          className="summary-btn btn-retry"
          onClick={onRetry}
        >
          {t('drillStudio.retrySameBtn')}
        </button>

        <button
          type="button"
          className="summary-btn btn-settings"
          onClick={onChangeSettings}
        >
          {t('drillStudio.changeSettingsBtn')}
        </button>

        <button
          type="button"
          className="summary-btn btn-home"
          onClick={onBackToHub}
        >
          {t('drillStudio.backToHubBtn')}
        </button>
      </div>
    </div>
  );
}
