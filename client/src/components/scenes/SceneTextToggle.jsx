import React from 'react';
import { useLanguage } from '../../context/useLanguage';

export default function SceneTextToggle({ mode, onChange, showJapanese }) {
  const { t } = useLanguage();

  const modes = ['fi', 'selko', 'en'];
  if (showJapanese) {
    modes.push('ja');
  }

  return (
    <div className="scene-text-toggle-wrapper" role="group" aria-label={t('scenes.modeLabel')}>
      {modes.map((m) => (
        <button
          key={m}
          type="button"
          className={`scene-mode-btn ${mode === m ? 'active' : ''}`}
          onClick={() => onChange(m)}
          aria-pressed={mode === m}
        >
          {t(`scenes.mode.${m}`)}
        </button>
      ))}
    </div>
  );
}
