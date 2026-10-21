import React from 'react';

export default function GrammarChoiceQuestion({ question, answer, isSubmitted, onSelect }) {
  return (
    <div className="drill-choice-list">
      {question.options.map((opt, idx) => {
        const isSelected = answer === opt;
        let btnClass = 'drill-choice-btn';
        if (isSubmitted) {
          if (opt === question.answer) btnClass += ' is-target-correct';
          else if (isSelected) btnClass += ' is-target-wrong';
        } else if (isSelected) {
          btnClass += ' is-active';
        }

        return (
          <button
            key={idx}
            type="button"
            className={btnClass}
            disabled={isSubmitted}
            onClick={() => onSelect(opt)}
          >
            <span className="choice-number">{idx + 1}</span>
            <span className="choice-text">{opt}</span>
          </button>
        );
      })}
    </div>
  );
}
