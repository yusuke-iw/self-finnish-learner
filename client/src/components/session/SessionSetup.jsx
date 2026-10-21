import React from 'react';
import { useLanguage } from '../../context/useLanguage';

// Screens shown while there is no running session: nothing to review, start failed, and the start form / loading state.

export function NoReviewScreen({ onHome }) {
  const { t } = useLanguage();
  return (
    <div className="session-page">
      <div className="session-setup">
        <p>{t('session.noReviewSentences')}</p>
        <div className="setup-options">
          <button className="btn-primary" onClick={onHome}>
            {t('session.returnHome')}
          </button>
        </div>
      </div>
    </div>
  );
}

export function StartErrorScreen({ error, onRetry, onHome }) {
  const { t } = useLanguage();
  return (
    <div className="session-page">
      <div className="session-setup">
        <p role="alert">{t('session.startFailed')} ({error})</p>
        <div className="setup-options">
          <button className="btn-primary" onClick={onRetry}>
            {t('session.retryStart')}
          </button>
          <button className="btn-secondary" onClick={onHome}>
            {t('session.returnHome')}
          </button>
        </div>
      </div>
    </div>
  );
}

export function StartScreen({ category, level, showForm, sentenceCount, isStarting, onCountChange, onStart }) {
  const { language } = useLanguage();
  return (
    <div className="session-page">
      <div className="session-setup">
        <h2>{category ? (language === 'en' ? `Loading Level ${level}...` : `レベル ${level} を読み込み中...`) : (language === 'en' ? 'Start a Quiz Session' : 'セッションを開始')}</h2>
        {showForm && (
          <>
            <p>{language === 'en' ? 'Practice with scaffolded exercises that adapt to your level.' : 'レベルに合わせた段階的な演習で練習しましょう。'}</p>
            <div className="setup-options">
              <label>
                {language === 'en' ? 'Number of Sentences:' : '問題数:'}
                <select
                  value={sentenceCount}
                  onChange={e => onCountChange(Number(e.target.value))}
                >
                  <option value={3}>{language === 'en' ? '3 (Short)' : '3問 (ショート)'}</option>
                  <option value={5}>{language === 'en' ? '5 (Medium)' : '5問 (標準)'}</option>
                  <option value={10}>{language === 'en' ? '10 (Long)' : '10問 (じっくり)'}</option>
                </select>
              </label>
              <button className="btn-primary" onClick={onStart} disabled={isStarting}>
                {isStarting ? (language === 'en' ? 'Starting...' : '開始中...') : (language === 'en' ? 'Start Session' : 'セッション開始')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
