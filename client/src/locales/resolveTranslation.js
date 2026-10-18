import { translations } from './translations';

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
