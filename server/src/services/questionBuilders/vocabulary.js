const { shuffle } = require('../../utils/shuffle');

const vocabularyBank = [
  { fi: 'Kissa', en: 'Cat', ja: '猫' },
  { fi: 'Koira', en: 'Dog', ja: '犬' },
  { fi: 'Talo', en: 'House', ja: '家' },
  { fi: 'Auto', en: 'Car', ja: '車' },
  { fi: 'Kirja', en: 'Book', ja: '本' },
  { fi: 'Mies', en: 'Man', ja: '男性' },
  { fi: 'Nainen', en: 'Woman', ja: '女性' },
  { fi: 'Poika', en: 'Boy', ja: '男の子' },
  { fi: 'Tyttö', en: 'Girl', ja: '女の子' },
  { fi: 'Vesi', en: 'Water', ja: '水' },
  { fi: 'Kahvi', en: 'Coffee', ja: 'コーヒー' },
  { fi: 'Leipä', en: 'Bread', ja: 'パン' },
  { fi: 'Maito', en: 'Milk', ja: '牛乳' },
  { fi: 'Omena', en: 'Apple', ja: 'リンゴ' },
  { fi: 'Kyllä', en: 'Yes', ja: 'はい' },
  { fi: 'Ei', en: 'No', ja: 'いいえ' },
  { fi: 'Kiitos', en: 'Thank you', ja: 'ありがとう' },
  { fi: 'Yksi', en: 'One', ja: '1' },
  { fi: 'Kaksi', en: 'Two', ja: '2' },
  { fi: 'Kolme', en: 'Three', ja: '3' }
];

const categoryVocab = {
  "Asiointi ja Matkustaminen": [
    { fi: 'Juna', en: 'Train', ja: '電車' },
    { fi: 'Aika', en: 'Time', ja: '時間' },
    { fi: 'Huone', en: 'Room', ja: '部屋' },
    { fi: 'Yö', en: 'Night', ja: '夜' },
    { fi: 'Asema', en: 'Station', ja: '駅' },
    { fi: 'Kuitti', en: 'Receipt', ja: 'レシート' },
    { fi: 'Euro', en: 'Euro', ja: 'ユーロ' },
    { fi: 'Matka', en: 'Journey', ja: '旅' }
  ],
  "Ruoka ja Juoma": [
    { fi: 'Ruoka', en: 'Food', ja: '食べ物' },
    { fi: 'Juoma', en: 'Drink', ja: '飲み物' },
    { fi: 'Ravintola', en: 'Restaurant', ja: 'レストラン' },
    { fi: 'Aamiainen', en: 'Breakfast', ja: '朝食' },
    { fi: 'Lounas', en: 'Lunch', ja: '昼食' },
    { fi: 'Illallinen', en: 'Dinner', ja: '夕食' },
    { fi: 'Kahvi', en: 'Coffee', ja: 'コーヒー' },
    { fi: 'Vesi', en: 'Water', ja: '水' }
  ],
  "Perhe ja Ystävät": [
    { fi: 'Perhe', en: 'Family', ja: '家族' },
    { fi: 'Ystävä', en: 'Friend', ja: '友人' },
    { fi: 'Äiti', en: 'Mother', ja: '母' },
    { fi: 'Isä', en: 'Father', ja: '父' },
    { fi: 'Veli', en: 'Brother', ja: '兄弟' },
    { fi: 'Sisko', en: 'Sister', ja: '姉妹' },
    { fi: 'Lapsi', en: 'Child', ja: '子ども' },
    { fi: 'Nimi', en: 'Name', ja: '名前' }
  ],
  "Menneet ajat": [
    { fi: 'Vuosi', en: 'Year', ja: '年' },
    { fi: 'Eilen', en: 'Yesterday', ja: '昨日' },
    { fi: 'Kirja', en: 'Book', ja: '本' },
    { fi: 'Saapua', en: 'Arrive', ja: '到着する' },
    { fi: 'Lähteä', en: 'Leave', ja: '出発する' },
    { fi: 'Aika', en: 'Time', ja: '時間' },
    { fi: 'Nähdä', en: 'See', ja: '見る' }
  ],
  "Työelämä ja Opiskelu": [
    { fi: 'Yritys', en: 'Company', ja: '会社' },
    { fi: 'Työntekijä', en: 'Employee', ja: '従業員' },
    { fi: 'Asiakas', en: 'Customer', ja: '顧客' },
    { fi: 'Kokous', en: 'Meeting', ja: '会議' },
    { fi: 'Työpaikka', en: 'Job position', ja: '職場' },
    { fi: 'Vahvuus', en: 'Strength', ja: '長所' },
    { fi: 'Heikkous', en: 'Weakness', ja: '短所' }
  ],
  "Konditionaali ja Potentiaali": [
    { fi: 'Loma', en: 'Vacation', ja: '休暇' },
    { fi: 'Aika', en: 'Time', ja: '時間' },
    { fi: 'Raportti', en: 'Report', ja: 'レポート' },
    { fi: 'Koti', en: 'Home', ja: '家' },
    { fi: 'Kala', en: 'Fish', ja: '魚' },
    { fi: 'Liha', en: 'Meat', ja: '肉' },
    { fi: 'Mieluummin', en: 'Rather', ja: 'むしろ' }
  ],
  "Yhteiskunta ja Ympäristö": [
    { fi: 'Ilmasto', en: 'Climate', ja: '気候' },
    { fi: 'Haaste', en: 'Challenge', ja: '課題' },
    { fi: 'Ympäristö', en: 'Environment', ja: '環境' },
    { fi: 'Hallitus', en: 'Government', ja: '政府' },
    { fi: 'Demokratia', en: 'Democracy', ja: '民主主義' },
    { fi: 'Energia', en: 'Energy', ja: 'エネルギー' },
    { fi: 'Vero', en: 'Tax', ja: '税金' }
  ],
  "Lauseenvastikkeet": [
    { fi: 'Virhe', en: 'Mistake', ja: '間違い' },
    { fi: 'Ulkomaat', en: 'Abroad', ja: '海外' },
    { fi: 'Tehtävä', en: 'Task', ja: '課題' },
    { fi: 'Sade', en: 'Rain', ja: '雨' },
    { fi: 'Matka', en: 'Journey', ja: '旅' },
    { fi: 'Heti', en: 'Immediately', ja: 'すぐに' },
    { fi: 'Koti', en: 'Home', ja: '家' }
  ],
  "Abstraktit keskustelut": [
    { fi: 'Vastuu', en: 'Responsibility', ja: '責任' },
    { fi: 'Yksilö', en: 'Individual', ja: '個人' },
    { fi: 'Kieli', en: 'Language', ja: '言語' },
    { fi: 'Prosessi', en: 'Process', ja: 'プロセス' },
    { fi: 'Taide', en: 'Art', ja: '芸術' },
    { fi: 'Todellisuus', en: 'Reality', ja: '現実' },
    { fi: 'Totuus', en: 'Truth', ja: '真実' }
  ]
};

function getMatchingVocab(category) {
  let pool = [];
  if (category && categoryVocab[category]) {
    pool = shuffle([...categoryVocab[category]]);
  }
  if (pool.length < 5) {
    const extra = shuffle([...vocabularyBank]).slice(0, 5 - pool.length);
    pool = [...pool, ...extra];
  }
  return pool.slice(0, 5);
}

module.exports = { vocabularyBank, categoryVocab, getMatchingVocab };
