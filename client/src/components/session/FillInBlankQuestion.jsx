import React from 'react';
import SpecialCharBar from '../SpecialCharBar';

export default function FillInBlankQuestion({ question, inputRef, value, feedback, onChange }) {
  return (
    <div className="fill-in-the-blank-area">
      <span className="prefix">{question.prefix}</span>
      <input
        ref={inputRef}
        type="text"
        className="blank-input"
        style={{
          width: `${Math.max(3, value.length || question.missingWord.length)}ch`
        }}
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={!!feedback}
        autoFocus
      />
      <span className="suffix">{question.suffix}</span>
      {!feedback && (
        <SpecialCharBar
          inputRef={inputRef}
          value={value}
          onChange={onChange}
        />
      )}
    </div>
  );
}
