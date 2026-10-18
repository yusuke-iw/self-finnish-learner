const ones = ['nolla', 'yksi', 'kaksi', 'kolme', 'neljä', 'viisi', 'kuusi', 'seitsemän', 'kahdeksan', 'yhdeksän'];
const tens = ['', 'kymmenen', 'kaksikymmentä', 'kolmekymmentä', 'neljäkymmentä', 'viisikymmentä', 'kuusikymmentä', 'seitsemänkymmentä', 'kahdeksankymmentä', 'yhdeksänkymmentä'];

export function numberToFinnishWord(num) {
  if (typeof num !== 'number' || !Number.isInteger(num) || num < 0 || num >= 1000000) {
    return String(num);
  }
  if (num < 10) return ones[num];
  if (num === 10) return 'kymmenen';
  if (num < 20) return ones[num - 10] + 'toista';

  if (num < 100) {
    const t = Math.floor(num / 10);
    const o = num % 10;
    return tens[t] + (o > 0 ? ones[o] : '');
  }

  if (num < 1000) {
    const h = Math.floor(num / 100);
    const rest = num % 100;
    const hStr = h === 1 ? 'sata' : ones[h] + 'sataa';
    return hStr + (rest > 0 ? numberToFinnishWord(rest) : '');
  }

  const th = Math.floor(num / 1000);
  const rest = num % 1000;
  const thStr = th === 1 ? 'tuhat' : numberToFinnishWord(th) + 'tuhatta';
  return thStr + (rest > 0 ? numberToFinnishWord(rest) : '');
}

export function priceToFinnish(euros, cents = 0) {
  const e = Number(euros) || 0;
  const c = Number(cents) || 0;

  if (e === 0 && c === 0) {
    return 'nolla euroa';
  }

  const parts = [];
  if (e > 0) {
    parts.push(`${numberToFinnishWord(e)} ${e === 1 ? 'euro' : 'euroa'}`);
  }
  if (c > 0) {
    parts.push(`${numberToFinnishWord(c)} ${c === 1 ? 'sentti' : 'senttiä'}`);
  }
  return parts.join(' ');
}

export function timeToFinnish(h, m = 0, style = 'official') {
  const hours = Number(h) || 0;
  const minutes = Number(m) || 0;

  if (style === 'everyday') {
    const hour12 = ((hours % 12) + 12) % 12 || 12;
    const nextHour12 = (hour12 % 12) + 1;
    const hourWord = numberToFinnishWord(hour12);
    const nextHourWord = numberToFinnishWord(nextHour12);

    if (minutes === 0) {
      return `kello ${hourWord}`;
    }
    if (minutes === 15) {
      return `varttia yli ${hourWord}`;
    }
    if (minutes === 30) {
      return `puoli ${nextHourWord}`;
    }
    if (minutes === 45) {
      return `varttia vaille ${nextHourWord}`;
    }
    if (minutes < 30) {
      return `${numberToFinnishWord(minutes)} yli ${hourWord}`;
    }
    return `${numberToFinnishWord(60 - minutes)} vaille ${nextHourWord}`;
  }

  const hourWord = numberToFinnishWord(hours);
  if (minutes === 0) {
    return `kello ${hourWord}`;
  }
  if (minutes < 10) {
    return `kello ${hourWord} nolla ${numberToFinnishWord(minutes)}`;
  }
  return `kello ${hourWord} ${numberToFinnishWord(minutes)}`;
}

export function replaceNumbersWithFinnishWords(text) {
  if (!text) return text;
  // Replace all isolated digits with their Finnish word equivalents
  return text.replace(/\b\d+\b/g, (match) => {
    const num = parseInt(match, 10);
    if (!isNaN(num) && num < 1000) {
      return numberToFinnishWord(num);
    }
    return match;
  });
}
