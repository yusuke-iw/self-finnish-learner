import React from 'react';
import { useLanguage } from '../../context/useLanguage';
import { PASS_THRESHOLD, isSessionPassed } from '../../utils/sessionResult';

export default function SessionSummary({ score, totalQuestions, showResult, unlockedNext, onBack, onRetry }) {
  const { language, t } = useLanguage();
  const passed = isSessionPassed(score, totalQuestions);

  return (
    <div className="session-page">
      <div className="session-summary">
        <span className="summary-icon">🎉</span>
        <h2>{language === 'en' ? 'Session Complete!' : 'セッション完了！'}</h2>
        <div className="score-display">
          {Math.round(((score.correct + score.typo) / totalQuestions) * 100)}%
        </div>
        {showResult && (
          <p className={`session-result-message ${passed ? 'passed' : 'failed'}`}>
            {passed
              ? (unlockedNext ? t('session.passedUnlockNext') : t('session.passed'))
              : t('session.failedThreshold', { threshold: Math.round(PASS_THRESHOLD * 100) })}
          </p>
        )}
        <div className="score-breakdown">
          <div className="stat">
            <span className="stat-value">{score.correct}</span>
            <span>{language === 'en' ? 'Perfect' : 'パーフェクト'}</span>
          </div>
          <div className="stat">
            <span className="stat-value">{score.typo}</span>
            <span>{language === 'en' ? 'Typos' : 'タイポ'}</span>
          </div>
          <div className="stat">
            <span className="stat-value">{score.incorrect}</span>
            <span>{language === 'en' ? 'Incorrect' : '不正解'}</span>
          </div>
        </div>
        <div className="summary-actions">
          <button className="btn-primary" onClick={onBack}>
            {language === 'en' ? 'Back to Path' : 'ホームへ戻る'}
          </button>
          <button className="btn-secondary" onClick={onRetry}>
            {language === 'en' ? 'Try Again' : 'もう一度挑戦'}
          </button>
        </div>
      </div>
    </div>
  );
}
