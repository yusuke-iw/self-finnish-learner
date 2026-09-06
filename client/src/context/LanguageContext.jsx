import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../locales/translations';

const LanguageContext = createContext(null);

export function resolveTranslation(lang, path, params = {}) {
  const langDict = translations[lang] || translations.ja;
  const parts = path.split('.');
  let cur = langDict;

  for (const part of parts) {
    if (cur && typeof cur === 'object' && part in cur) {
      cur = cur[part];
    } else {
      cur = null;
      break;
    }
  }

  if (cur === null || cur === undefined) {
    // Fallback to opposite language
    const fallbackDict = lang === 'ja' ? translations.en : translations.ja;
    let fallback = fallbackDict;
    for (const part of parts) {
      if (fallback && typeof fallback === 'object' && part in fallback) {
        fallback = fallback[part];
      } else {
        fallback = null;
        break;
      }
    }
    if (fallback !== null && fallback !== undefined && typeof fallback === 'string') {
      cur = fallback;
    } else {
      return path;
    }
  }

  if (typeof cur === 'string') {
    let result = cur;
    for (const [key, val] of Object.entries(params)) {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(val));
    }
    return result;
  }

  return cur;
}

export function LanguageProvider({ children, defaultLanguage }) {
  const [language, setLanguageState] = useState(() => {
    if (defaultLanguage) return defaultLanguage;
    try {
      const stored = localStorage.getItem('finnishLearner_language');
      if (stored === 'ja' || stored === 'en') return stored;
    } catch (e) {
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

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Determine default fallback language based on navigator or default to en for tests
    let fallbackLang = 'en';
    if (typeof navigator !== 'undefined' && navigator.language && navigator.language.toLowerCase().startsWith('ja')) {
      fallbackLang = 'ja';
    }
    return {
      language: fallbackLang,
      setLanguage: () => {},
      t: (path, params) => resolveTranslation(fallbackLang, path, params),
      getTranslation: (item) => {
        if (!item) return '';
        if (typeof item === 'string') return item;
        return fallbackLang === 'ja'
          ? (item.japanese || item.ja || item.titleJa || item.english || item.en || '')
          : (item.english || item.en || item.titleEn || item.japanese || item.ja || '');
      }
    };
  }
  return context;
}
