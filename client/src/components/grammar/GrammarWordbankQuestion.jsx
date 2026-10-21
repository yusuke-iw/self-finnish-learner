import React from 'react';
import { useLanguage } from '../../context/useLanguage';

export default function GrammarWordbankQuestion({ question, answer, isSubmitted, onSelect }) {
  const { t } = useLanguage();

  return (
    <div className="drill-wordbank-area">
      <div className="drill-selected-slot">
        <span className="slot-label">{t('drillStudio.selectedAnswerLabel')}</span>
        <span className="slot-value">{answer || t('drillStudio.selectChipHint')}</span>
      </div>
      <div className="drill-chips-grid">
        {question.words.map((w, idx) => {
          const isSelected = answer === w;
          let chipClass = 'drill-word-chip';
          if (isSubmitted) {
            if (w === question.answer) chipClass += ' chip-correct';
            else if (isSelected) chipClass += ' chip-wrong';
          } else if (isSelected) {
            chipClass += ' chip-selected';
          }

          return (
            <button
              key={idx}
              type="button"
              className={chipClass}
              disabled={isSubmitted}
              onClick={() => onSelect(w)}
            >
              {w}
            </button>
          );
        })}
      </div>
    </div>
  );
}
