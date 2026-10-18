import { numberToFinnishWord, priceToFinnish, timeToFinnish } from './numberToFinnish';

function clampInt(val, min, max) {
  if (!Number.isFinite(val)) return min;
  return Math.min(max, Math.max(min, val));
}

function resolveMaxNumber(options) {
  if (typeof options === 'number' && Number.isFinite(options) && options > 0) {
    return Math.floor(options);
  }
  if (typeof options === 'string') {
    if (options === '0-9999') return 9999;
    if (options === '0-999') return 999;
    if (options === '0-99') return 99;
    const parsed = Number(options);
    if (Number.isFinite(parsed) && parsed > 0) return Math.floor(parsed);
  }
  if (options && typeof options === 'object') {
    const raw = options.max ?? options.range;
    if (raw !== undefined) {
      return resolveMaxNumber(raw);
    }
  }
  return 99;
}

export function generateNumberQuestion(mode = 'number', options = {}, random = Math.random) {
  if (mode === 'price') {
    const euros = clampInt(Math.floor(random() * 100), 0, 99);
    const useFiveStep = random() < 0.8;
    let cents;
    if (useFiveStep) {
      if (euros === 0) {
        cents = 10 + clampInt(Math.floor(random() * 18), 0, 17) * 5;
      } else {
        cents = clampInt(Math.floor(random() * 20), 0, 19) * 5;
      }
    } else if (euros === 0) {
      cents = 10 + clampInt(Math.floor(random() * 90), 0, 89);
    } else {
      cents = clampInt(Math.floor(random() * 100), 0, 99);
    }

    return {
      mode: 'price',
      euros,
      cents,
      finnishText: priceToFinnish(euros, cents),
      displayAnswer: `${euros},${String(cents).padStart(2, '0')}`
    };
  }

  if (mode === 'time-official' || mode === 'official') {
    const h = clampInt(Math.floor(random() * 24), 0, 23);
    const m = clampInt(Math.floor(random() * 60), 0, 59);
    return {
      mode,
      hours: h,
      minutes: m,
      h,
      m,
      style: 'official',
      finnishText: timeToFinnish(h, m, 'official'),
      displayAnswer: `${h}:${String(m).padStart(2, '0')}`
    };
  }

  if (mode === 'time-everyday' || mode === 'everyday') {
    const h = clampInt(Math.floor(random() * 12) + 1, 1, 12);
    const m = clampInt(Math.floor(random() * 60), 0, 59);
    return {
      mode,
      hours: h,
      minutes: m,
      h,
      m,
      style: 'everyday',
      finnishText: timeToFinnish(h, m, 'everyday'),
      displayAnswer: `${h}:${String(m).padStart(2, '0')}`
    };
  }

  const max = resolveMaxNumber(options);
  const value = clampInt(Math.floor(random() * (max + 1)), 0, max);
  return {
    mode: 'number',
    value,
    finnishText: numberToFinnishWord(value),
    displayAnswer: String(value)
  };
}

export function checkNumberAnswer(question, input) {
  if (!question || input === null || input === undefined) {
    return false;
  }
  const raw = String(input).trim();
  if (!raw) {
    return false;
  }

  const mode = question.mode;

  if (mode === 'number') {
    const cleaned = raw.replace(/\s+/g, '');
    if (!/^\d+$/.test(cleaned)) {
      return false;
    }
    return parseInt(cleaned, 10) === Number(question.value);
  }

  if (mode === 'price') {
    const cleaned = raw.replace(/€/g, '').trim();
    const match = cleaned.match(/^(\d+)(?:[,.](\d{1,2}))?$/);
    if (!match) {
      return false;
    }
    const inputEuros = parseInt(match[1], 10);
    let inputCents = 0;
    if (match[2] !== undefined) {
      inputCents = match[2].length === 1
        ? parseInt(match[2], 10) * 10
        : parseInt(match[2], 10);
    }
    return inputEuros === Number(question.euros) && inputCents === Number(question.cents);
  }

  if (mode === 'time-official' || mode === 'official') {
    const match = raw.match(/^(\d{1,2})[:.](\d{2})$/);
    if (!match) {
      return false;
    }
    const inputH = parseInt(match[1], 10);
    const inputM = parseInt(match[2], 10);
    if (inputH < 0 || inputH > 23 || inputM < 0 || inputM > 59) {
      return false;
    }
    const targetH = Number(question.hours ?? question.h);
    const targetM = Number(question.minutes ?? question.m);
    return inputH === targetH && inputM === targetM;
  }

  if (mode === 'time-everyday' || mode === 'everyday') {
    const match = raw.match(/^(\d{1,2})[:.](\d{2})$/);
    if (!match) {
      return false;
    }
    const inputH = parseInt(match[1], 10);
    const inputM = parseInt(match[2], 10);
    if (inputH < 0 || inputH > 23 || inputM < 0 || inputM > 59) {
      return false;
    }
    const normalize12 = (h) => ((h % 12) + 12) % 12 || 12;
    const targetH = Number(question.hours ?? question.h);
    const targetM = Number(question.minutes ?? question.m);
    return normalize12(inputH) === normalize12(targetH) && inputM === targetM;
  }

  return false;
}
