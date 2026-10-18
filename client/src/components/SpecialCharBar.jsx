import React, { useRef, useLayoutEffect } from 'react';
import { useLanguage } from '../context/useLanguage';

const SPECIAL_CHARS = ['ä', 'ö'];

export default function SpecialCharBar({ inputRef, value = '', onChange, disabled = false }) {
  const { t } = useLanguage();
  const pendingSelectionRef = useRef(null);

  useLayoutEffect(() => {
    if (pendingSelectionRef.current !== null && inputRef?.current) {
      const pos = pendingSelectionRef.current;
      pendingSelectionRef.current = null;
      inputRef.current.focus();
      try {
        inputRef.current.setSelectionRange(pos, pos);
      } catch {
        // ignore if input type does not support setSelectionRange
      }
    }
  });

  const handleInsert = (char, e) => {
    if (disabled) return;
    const inserted = e.shiftKey ? char.toUpperCase() : char;
    const el = inputRef?.current;
    const currentValue = typeof value === 'string' ? value : (el?.value ?? '');
    const start = typeof el?.selectionStart === 'number' ? el.selectionStart : currentValue.length;
    const end = typeof el?.selectionEnd === 'number' ? el.selectionEnd : start;

    const nextValue = currentValue.slice(0, start) + inserted + currentValue.slice(end);
    const nextCursor = start + inserted.length;

    // The layout effect restores focus and the cursor after the parent re-renders the new value.
    pendingSelectionRef.current = nextCursor;

    if (typeof onChange === 'function') {
      onChange(nextValue);
    }
  };

  return (
    <div className="special-char-bar">
      {SPECIAL_CHARS.map((char) => (
        <button
          key={char}
          type="button"
          className="special-char-btn"
          aria-label={t('session.insertChar', { char })}
          disabled={disabled}
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => handleInsert(char, e)}
        >
          {char}
        </button>
      ))}
    </div>
  );
}
