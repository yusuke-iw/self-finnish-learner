import React from 'react';
import { useLanguage } from '../../context/useLanguage';
import SpecialCharBar from '../SpecialCharBar';

export default function TypingQuestion({ inputRef, value, feedback, onChange }) {
  const { t } = useLanguage();

  return (
    <div className="typing-area">
      <input
        ref={inputRef}
        type="text"
        className="typing-input"
        placeholder={t('session.typePrompt')}
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={!!feedback}
        autoFocus
      />
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
