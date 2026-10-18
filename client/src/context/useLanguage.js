import { useContext } from 'react';
import { LanguageContext } from './languageContextObject';
import { resolveTranslation } from '../locales/resolveTranslation';

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
