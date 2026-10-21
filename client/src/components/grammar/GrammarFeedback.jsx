import React from 'react';
import { useLanguage } from '../../context/useLanguage';

export default function GrammarFeedback({ question, isCorrect }) {
  const { t, language } = useLanguage();

  return (
    <div className={`drill-feedback-banner ${isCorrect ? 'feed-correct' : 'feed-wrong'}`}>
      <div className="feed-header">
        <span className="feed-status-icon">{isCorrect ? t('drillStudio.correctBanner') : t('drillStudio.incorrectBanner')}</span>
        {!isCorrect && (
          <span className="correct-answer-pill">
            {t('drillStudio.correctAnswerLabel')} <strong>{question.answer}</strong>
          </span>
        )}
      </div>
      <div className="feed-explanation">
        <p>💡 <strong>{t('drillStudio.explanationLabel')}</strong> {(language === 'en' && question.explanationEn) ? question.explanationEn : question.explanation}</p>
      </div>
    </div>
  );
}
