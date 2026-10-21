import React from 'react';
import { useLanguage } from '../../context/useLanguage';

export default function GrammarTypingQuestion({ question, answer, isSubmitted, onChange, onInsertChar }) {
  const { t, language } = useLanguage();

  return (
    <div className="drill-typing-area">
      <input
        type="text"
        className="drill-typing-input"
        placeholder={(language === 'en' && question.hintEn) ? question.hintEn : (question.hint || t('drillStudio.inputPlaceholder'))}
        value={answer}
        disabled={isSubmitted}
        autoFocus
        onChange={(e) => onChange(e.target.value)}
      />

      {!isSubmitted && (
        <div className="drill-keyboard-helpers">
          <span className="helper-label">{t('drillStudio.specialChars')}</span>
          {['ä', 'ö', 'Ä', 'Ö'].map((ch) => (
            <button
              key={ch}
              type="button"
              className="drill-char-btn"
              onClick={() => onInsertChar(ch)}
            >
              {ch}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
