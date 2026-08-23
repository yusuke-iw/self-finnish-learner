const ones = ['nolla', 'yksi', 'kaksi', 'kolme', 'neljä', 'viisi', 'kuusi', 'seitsemän', 'kahdeksan', 'yhdeksän'];
const tens = ['', 'kymmenen', 'kaksikymmentä', 'kolmekymmentä', 'neljäkymmentä', 'viisikymmentä', 'kuusikymmentä', 'seitsemänkymmentä', 'kahdeksankymmentä', 'yhdeksänkymmentä'];

function numberToFinnishWord(num) {
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
    const hStr = (h === 1 ? 'sata' : ones[h] + 'sataa');
    return hStr + (rest > 0 ? numberToFinnishWord(rest) : '');
  }
  
  return num.toString(); // Fallback for numbers >= 1000
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
