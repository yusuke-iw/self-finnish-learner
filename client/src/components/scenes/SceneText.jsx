import React from 'react';
import { pickText, pickWord } from '../../utils/sceneText';

export default function SceneText({ text, mode, variant = 'text', className = '' }) {
  const result = variant === 'word' ? pickWord(text, mode) : pickText(text, mode);
  const { main, sub } = result;

  const rootClass = className ? `scene-text ${className}` : 'scene-text';

  return (
    <span className={rootClass}>
      <span className="scene-text-main">{main}</span>
      {sub && <span className="scene-text-sub">{sub}</span>}
    </span>
  );
}
