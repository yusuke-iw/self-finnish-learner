const mongoose = require('mongoose');
const Sentence = require('../models/Sentence');
const { sentences } = require('../config/seedData');
const { compareAnswers } = require('../utils/typoTolerance');

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

// Helper to shuffle an array
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

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

// POST /api/sessions/generate
exports.generateSession = async (req, res, next) => {
  try {
    const sentenceCount = (req.body && req.body.sentenceCount) || 3;
    const category = req.body && req.body.category;
    const requestedLevel = req.body && req.body.level ? Number(req.body.level) : null;
    const exerciseType = req.body && req.body.exerciseType;
    const lang = (req.body && req.body.lang) || (req.query && req.query.lang) || 'ja';

    let availableSentences = [];

    // Fallback switch
    if (mongoose.connection.readyState !== 1) {
      availableSentences = sentences;
      if (category) {
        availableSentences = sentences.filter(s => s.category === category);
      }
    } else {
      let query = {};
      if (category) {
        query.category = category;
      }
      availableSentences = await Sentence.find(query).exec();
    }

    if (availableSentences.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No sentences found'
      });
    }

    // Select random sentences up to sentenceCount
    const selectedSentences = shuffle(availableSentences).slice(0, sentenceCount);

    const level1Questions = [];
    const level2Questions = [];
    const level3Questions = [];

    selectedSentences.forEach((sentence) => {
      const promptText = (lang === 'ja' && sentence.translationJa) ? sentence.translationJa : sentence.translation;

      if (exerciseType === 'speaking') {
        level3Questions.push({
          sentenceId: sentence._id.toString(),
          level: 3,
          type: 'speaking',
          prompt: sentence.text,
          promptJa: sentence.translationJa || sentence.translation,
          promptEn: sentence.translation,
          correctAnswer: sentence.text
        });
        return;
      }

      // Level 1: Choice Question or Matching Pairs
      if ((!exerciseType && (!requestedLevel || requestedLevel === 1)) || exerciseType === 'matching') {
        const isMatching = exerciseType === 'matching' ? true : Math.random() > 0.5;

        if (isMatching) {
          // Generate Matching Pairs
          const selectedVocab = getMatchingVocab(category);
          const pairs = selectedVocab.map(v => ({ id: Math.random().toString(36).substring(7), ...v }));
          
          let fiTokens = [];
          let targetTokens = [];
          const targetLang = (lang === 'ja') ? 'ja' : 'en';

          pairs.forEach(p => {
            fiTokens.push({ id: p.id, text: p.fi, lang: 'fi' });
            targetTokens.push({ id: p.id, text: p[targetLang] || p.en || p.ja, lang: targetLang });
          });
          fiTokens = shuffle(fiTokens);
          targetTokens = shuffle(targetTokens);
          
          const isFiLeft = Math.random() > 0.5;
          let tokens = [];
          for (let i = 0; i < 5; i++) {
            if (isFiLeft) {
              tokens.push(fiTokens[i]);
              tokens.push(targetTokens[i]);
            } else {
              tokens.push(targetTokens[i]);
              tokens.push(fiTokens[i]);
            }
          }

          level1Questions.push({
            sentenceId: 'matching-warmup-' + Math.random(),
            level: 1,
            type: 'matching',
            tokens,
            pairs
          });
        } else {
          // Choice Question
          const wrongSentences = availableSentences.filter(s => s._id.toString() !== sentence._id.toString());
          const wrongOptions = shuffle(wrongSentences)
            .slice(0, 3)
            .map(s => s.text);
          const options = shuffle([sentence.text, ...wrongOptions]);

          level1Questions.push({
            sentenceId: sentence._id.toString(),
            level: 1,
            type: 'choice',
            prompt: promptText,
            promptJa: sentence.translationJa || sentence.translation,
            promptEn: sentence.translation,
            correctAnswer: sentence.text,
            options
          });
        }
      }

      // Level 2: Word Bank Question
      if ((!exerciseType && (!requestedLevel || requestedLevel === 2)) || exerciseType === 'word-bank') {
        const wrongSentences = availableSentences.filter(s => s._id.toString() !== sentence._id.toString());
        // For English users, allow reverse word bank. For Japanese users, standard Finnish word bank is most effective
        const isReverse = lang === 'en' ? Math.random() > 0.5 : false;

        if (!isReverse) {
          // Standard: Finnish word bank, native translation prompt
          const cleanWords = sentence.text
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '')
            .split(/\s+/)
            .filter(w => w.length > 0);
          
          const distractors = [];
          if (wrongSentences.length > 0) {
            const randomWrongText = wrongSentences[Math.floor(Math.random() * wrongSentences.length)].text;
            const randomWrongWords = randomWrongText.split(/\s+/).filter(w => w.length > 2);
            if (randomWrongWords.length > 0) {
              distractors.push(randomWrongWords[Math.floor(Math.random() * randomWrongWords.length)]);
            }
          }

          const wordBank = shuffle([...cleanWords, ...distractors]);

          level2Questions.push({
            sentenceId: sentence._id.toString(),
            level: 2,
            type: 'word-bank',
            prompt: promptText,
            promptJa: sentence.translationJa || sentence.translation,
            promptEn: sentence.translation,
            correctAnswer: sentence.text,
            wordBank
          });
        } else {
          // Reverse: English word bank, Finnish prompt
          const cleanWords = sentence.translation
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '')
            .split(/\s+/)
            .filter(w => w.length > 0);
          
          const distractors = [];
          if (wrongSentences.length > 0) {
            const randomWrongText = wrongSentences[Math.floor(Math.random() * wrongSentences.length)].translation;
            const randomWrongWords = randomWrongText.split(/\s+/).filter(w => w.length > 2);
            if (randomWrongWords.length > 0) {
              distractors.push(randomWrongWords[Math.floor(Math.random() * randomWrongWords.length)]);
            }
          }

          const wordBank = shuffle([...cleanWords, ...distractors]);

          level2Questions.push({
            sentenceId: sentence._id.toString(),
            level: 2,
            type: 'word-bank-reverse',
            prompt: sentence.text,
            promptJa: sentence.text,
            promptEn: sentence.text,
            correctAnswer: sentence.translation,
            wordBank
          });
        }
      }

      // Level 3: Typing, Fill in the Blank, or Speaking
      if (!exerciseType && (!requestedLevel || requestedLevel === 3)) {
        const rand = Math.random();
        
        if (rand > 0.66) {
          // 33% chance: Fill in the blank
          const words = sentence.text.split(' ');
          const candidateWords = words.filter(w => w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '').length > 2);
          const targetWordRaw = candidateWords.length > 0 
            ? candidateWords[Math.floor(Math.random() * candidateWords.length)]
            : words[Math.floor(Math.random() * words.length)];
          
          const missingWord = targetWordRaw.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '');
          const matchIndex = sentence.text.indexOf(missingWord);
          const prefix = sentence.text.substring(0, matchIndex);
          const suffix = sentence.text.substring(matchIndex + missingWord.length);

          level3Questions.push({
            sentenceId: sentence._id.toString(),
            level: 3,
            type: 'fill-in-the-blank',
            prompt: promptText,
            promptJa: sentence.translationJa || sentence.translation,
            promptEn: sentence.translation,
            prefix,
            missingWord,
            suffix,
            correctAnswer: sentence.text,
            isListening: Math.random() > 0.5
          });
        } else if (rand > 0.33) {
          // 33% chance: Speaking Practice
          level3Questions.push({
            sentenceId: sentence._id.toString(),
            level: 3,
            type: 'speaking',
            prompt: sentence.text,
            promptJa: sentence.translationJa || sentence.translation,
            promptEn: sentence.translation,
            correctAnswer: sentence.text
          });
        } else {
          // 33% chance: Typing
          level3Questions.push({
            sentenceId: sentence._id.toString(),
            level: 3,
            type: 'typing',
            prompt: promptText,
            promptJa: sentence.translationJa || sentence.translation,
            promptEn: sentence.translation,
            correctAnswer: sentence.text,
            isListening: Math.random() > 0.5
          });
        }
      }
    });

    const questions = [
      ...level1Questions,
      ...level2Questions,
      ...level3Questions
    ];

    res.json({
      success: true,
      data: {
        sessionId: Math.random().toString(36).substring(2, 9),
        questions,
        source: mongoose.connection.readyState !== 1 ? 'memory' : 'database'
      }
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/sessions/check
exports.checkAnswer = async (req, res, next) => {
  try {
    const { sentenceId, userInput, questionType, missingWord, lang } = req.body;

    if (!sentenceId) {
      return res.status(400).json({
        success: false,
        error: 'sentenceId is required'
      });
    }

    let sentence = null;

    if (mongoose.connection.readyState !== 1) {
      sentence = sentences.find(s => s._id.toString() === sentenceId.toString());
    } else {
      sentence = await Sentence.findById(sentenceId).exec();
    }

    if (!sentence) {
      return res.status(404).json({
        success: false,
        error: 'Sentence not found'
      });
    }

    // Determine what to compare against based on question type
    let targetText = sentence.text;
    if (questionType === 'word-bank-reverse') {
      targetText = sentence.translation;
    } else if (questionType === 'fill-in-the-blank' && missingWord) {
      if (sentence.text.includes(missingWord)) {
        targetText = missingWord;
      }
    }

    const result = compareAnswers(userInput, targetText);

    const isJa = lang === 'ja';
    const translationOut = (isJa && sentence.translationJa) ? sentence.translationJa : sentence.translation;
    const notesOut = (isJa && sentence.grammarNotesJa) ? sentence.grammarNotesJa : sentence.grammarNotes;

    res.json({
      success: true,
      data: {
        isCorrect: result.isCorrect,
        isPerfect: result.isPerfect,
        hasTypo: result.hasTypo,
        correctText: targetText
      },
      source: mongoose.connection.readyState !== 1 ? 'memory' : 'database'
    });
  } catch (error) {
    next(error);
  }
};
