import React from 'react';
import { useLanguage } from '../../context/useLanguage';

export default function SpeakingQuestion({ value, isRecording, feedback, onMicClick }) {
  const { language } = useLanguage();

  return (
    <div className="speaking-area">
      <button
        className={`btn-mic ${isRecording ? 'recording' : ''}`}
        onClick={onMicClick}
        disabled={isRecording || !!feedback}
      >
        🎤
      </button>
      <div className="speaking-status">
        {isRecording ? (language === 'en' ? 'Listening...' : '聞き取り中...') : value ? `"${value}"` : (language === 'en' ? 'Tap microphone to speak' : 'マイクをタップして発音')}
      </div>
    </div>
  );
}
