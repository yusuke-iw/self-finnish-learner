import React, { useState } from 'react';
import { LanguageContext } from './languageContextObject';
import { resolveTranslation } from '../locales/resolveTranslation';

export function LanguageProvider({ children, defaultLanguage }) {
  const [language, setLanguageState] = useState(() => {
    if (defaultLanguage) return defaultLanguage;
    try {
      const stored = localStorage.getItem('finnishLearner_language');
      if (stored === 'ja' || stored === 'en') return stored;
    } catch {
      // ignore
    }
    if (typeof navigator !== 'undefined' && navigator.language) {
      if (navigator.language.toLowerCase().startsWith('ja')) {
        return 'ja';
      }
      return 'en';
    }
    return 'ja';
  });

  const setLanguage = (lang) => {
    if (lang === 'ja' || lang === 'en') {
      setLanguageState(lang);
      try {
        localStorage.setItem('finnishLearner_language', lang);
      } catch (e) {
        console.error('Failed to save language preference:', e);
      }
    }
  };

  const t = (path, params = {}) => resolveTranslation(language, path, params);

  const getTranslation = (item, preferredField = null) => {
    if (!item) return '';
    if (typeof item === 'string') return item;

    if (preferredField && item[preferredField]) {
      return item[preferredField];
    }

    if (language === 'ja') {
      return item.japanese || item.ja || item.titleJa || item.textJa || item.explanationJa || item.english || item.en || item.text || '';
    } else {
      return item.english || item.en || item.titleEn || item.textEn || item.explanationEn || item.japanese || item.ja || item.text || '';
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, getTranslation }}>
      {children}
    </LanguageContext.Provider>
  );
}
