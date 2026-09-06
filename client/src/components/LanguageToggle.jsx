import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="language-toggle-wrapper" role="group" aria-label="Language selection">
      <button
        type="button"
        className={`lang-btn ${language === 'ja' ? 'active' : ''}`}
        onClick={() => setLanguage('ja')}
        aria-pressed={language === 'ja'}
        title="日本語に切り替え"
      >
        <span className="lang-flag">🇯🇵</span>
        <span className="lang-label">日本語</span>
      </button>
      <button
        type="button"
        className={`lang-btn ${language === 'en' ? 'active' : ''}`}
        onClick={() => setLanguage('en')}
        aria-pressed={language === 'en'}
        title="Switch to English"
      >
        <span className="lang-flag">🇬🇧</span>
        <span className="lang-label">English</span>
      </button>
    </div>
  );
}
