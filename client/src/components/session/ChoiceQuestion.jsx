import React from 'react';
import { playAudio } from '../../utils/audio';

export default function ChoiceQuestion({ question, selected, feedback, speaker, onSelect }) {
  return (
    <div className="choice-options">
      {question.options.map((opt, idx) => {
        let cls = 'choice-btn';
        if (selected === opt) cls += ' selected';
        if (feedback) {
          if (opt === feedback.correctText) cls += ' correct-choice';
          else if (selected === opt && !feedback.isCorrect) cls += ' wrong-choice';
        }
        return (
          <button
            key={idx}
            className={cls}
            onClick={() => {
              if (!feedback) {
                onSelect(opt);
                playAudio(opt, opt, 'fi-FI', 1.0, speaker);
              }
            }}
            disabled={!!feedback}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
