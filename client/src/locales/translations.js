export const translations = {
  ja: {
    // Navigation
    nav: {
      home: 'ホーム',
      grammar: '文法・イディオム',
      drillStudio: '演習スタジオ',
      passages: '読解パッセージ',
      logo: 'Finnish Learner'
    },

    // Common
    common: {
      back: '戻る',
      next: '次へ',
      submit: '送信する',
      correct: '正解！',
      incorrect: '不正解',
      listen: '発音を聞く',
      close: '閉じる',
      loading: '読み込み中...',
      all: 'すべて',
      level: 'レベル',
      difficulty: '難易度',
      score: 'スコア',
      explanation: '解説'
    },

    // Home Page
    home: {
      guidebook: 'ガイドブック',
      practiceMatch: '🧩 単語マッチ特訓',
      practiceSpeaking: '🎙️ 発音・スピーキング特訓',
      resetProgress: '学習履歴をリセット',
      resetConfirm: 'これまでの学習進捗をすべてリセットしてもよろしいですか？',
      mastered: '🏆 完全習得',
      currentLevel: '現在: レベル {level}',
      levelChoice: 'L1 (選択肢)',
      levelWords: 'L2 (単語バンク)',
      levelType: 'L3 (タイピング)',
      speakBtn: '🎙️ 発音',
      matchBtn: '🧩 ペア'
    },

    // Guidebook Modal
    guidebook: {
      title: 'ガイドブック',
      keyPhrases: '重要フレーズ (Key Phrases)',
      grammarTips: '文法ポイント (Grammar Tips)',
      headerSubtitle: '重要フレーズ ＆ 文法ノート',
      loadingNotes: '読み込み中...',
      emptyNotes: 'このユニットの文法ノートはまだありません。',
      noteLabel: '解説ノート:',
      closeBtn: '閉じる'
    },

    // Grammar Hub
    grammarHub: {
      title: '📖 フィンランド語 文法・イディオム体系学習',
      subtitle: '文法ルール、15の格変化、動詞活用から生きた口語表現・イディオムまでを体系的にマスターしましょう。',
      drillBannerBadge: 'NEW ⚡ 反復ドリル',
      drillBannerTitle: '🎯 文法演習スタジオ（Drill Studio）',
      drillBannerDesc: '解説を読むだけでなく、1問1答・タイピング入力・カテゴリ別特訓で文法を身体に染み込ませましょう。間違えた問題の集中復習も可能です。',
      startDrillBtn: '🚀 今すぐ特訓を始める',
      searchPlaceholder: '文法項目やキーワードを検索 (例: 母音調和, 支配, Partitiivi)...',
      exercisesCount: '✏️ 演習問題 {count}問',
      learnMore: '解説を見る ➔',
      notFound: '該当する文法トピックが見つかりませんでした。'
    },

    // Grammar Categories
    grammarCategories: {
      all: 'すべて',
      basic_grammar: '基礎文法・音韻ルール',
      cases: '格（Sijamuodot）',
      verbs: '動詞・活用（Verbit）',
      rection: '支配（Rektio）',
      idioms: 'イディオム・口語（Idiomit & Puhekieli）'
    },

    // Grammar Detail
    grammarDetail: {
      backToHub: '← 文法・イディオム一覧に戻る',
      tabRules: '📖 文法ルールとポイント',
      tabExamples: '🔊 例文と発音',
      tabPitfalls: '⚠️ 落とし穴・注意点',
      tabQuiz: '✏️ 確認テスト ({count}問)',
      overviewTitle: '概要とルール',
      rulesTitle: '基本法則',
      tableTitle: '活用・変化一覧表',
      examplesTitle: '実践例文（Native Finnish Audio）',
      examplesSubtitle: 'スピーカーアイコンを押すとフィンランド語の発音（TTS）が確認できます。',
      pointLabel: '💡 ポイント:',
      pitfallsTitle: '間違えやすいポイント・例外ルール',
      idiomsTitle: '関連する主要イディオム・定型表現',
      idiomMeaning: '👉 意味:',
      idiomExample: '例:',
      drillStudioLink: '🎯 演習スタジオで特訓 ➔',
      quizHeaderTitle: '✏️ 確認テスト:',
      quizHeaderDesc: 'このテーマで学んだ知識をテストしてみましょう。',
      questionNum: '問 {num}.',
      submitAnswers: '回答を送信する',
      retryQuiz: 'もう一度挑戦する',
      resultsTitle: '結果: {total}問中 {correct}問正解！',
      perfectScore: '素晴らしい！完璧に理解できています 🎉',
      goodScore: 'あと少し！解説を確認して復習しましょう 👍',
      drillEncouragement: 'さらに身体に染み込ませたいときは「演習スタジオ」で反復トレーニングしましょう！',
      notFound: '文法項目が見つかりませんでした。'
    },

    // Drill Studio
    drillStudio: {
      title: '🎯 文法演習スタジオ（Drill Studio）',
      subtitle: 'フィンランド語の文法規則・格変化・動詞活用を反復ドリルで身につけましょう。',
      backToHub: '← 文法体系トップへ戻る',
      totalAvailable: '利用可能な総問題数:',
      weaknessTitle: '弱点バンク:',
      weaknessBtn: '🔥 弱点集中特訓を始める ({count}問)',
      stepCategory: '1. 特訓カテゴリを選択',
      stepTopic: '2. 特定の文法トピックに絞り込む（任意）',
      allTopics: 'すべてのトピック（総合演習）',
      stepFormat: '3. 出題形式',
      formatAll: '🎲 すべての形式',
      formatChoice: '🔘 4択クイズ',
      formatTyping: '⌨️ 記述・タイピング入力',
      formatWordbank: '🧩 並び替え・チップ',
      stepCount: '4. 問題数',
      questionsCount: '{count} 問',
      startBtn: '🚀 ドリルを開始する',
      noQuestionsWarning: '選択された条件に一致する問題がありません。条件を変更してください。',
      exitBtn: '✕ 中断',
      exitConfirm: '演習を中断して設定に戻りますか？',
      streakBadge: '🔥 {count} 連続正解!',
      inputPlaceholder: 'フィンランド語で入力...',
      selectedAnswerLabel: '選択した回答:',
      selectChipHint: '（下の単語チップを選択してください）',
      submitBtn: '回答する',
      submitBtnEnter: '回答を確認する (Enter)',
      nextBtnEnter: '次の問題へ (Enter)',
      finishBtnEnter: '結果を見る (Enter)',
      correctBanner: '🎉 正解！',
      incorrectBanner: '❌ おしい！ / 不正解',
      correctAnswerLabel: '正解:',
      explanationLabel: '解説:',
      specialChars: '特殊文字:',
      nextBtn: '次の問題へ ➔',
      finishBtn: '結果を見る ➔',
      completedTitle: 'セッション完了！',
      completedSubtitle: 'お疲れ様でした！演習セッションが完了しました。',
      accuracyLabel: '正解率',
      maxStreakLabel: '最高連続正解',
      timeLabel: '所要時間',
      reviewTitle: '間違えた問題の復習',
      retryWeaknessBtn: '⚡ 間違えた問題だけを再特訓 ({count}問)',
      retrySameBtn: '🔄 同じ設定でもう一度',
      changeSettingsBtn: '⚙️ 設定を変える',
      backToHubBtn: '📖 文法一覧へ戻る'
    },

    // Reading Passage
    passages: {
      title: '読解パッセージ (Reading Passages)',
      subtitle: '生きたフィンランド語のテキストと読解クイズでリーディング力を鍛えましょう。',
      filterDifficulty: '難易度で絞り込む:',
      allDifficulties: 'すべての難易度',
      loading: 'パッセージを読み込み中...',
      backToList: '← パッセージ一覧に戻る',
      showTranslation: '対訳を表示',
      hideTranslation: '対訳を隠す',
      vocabularyTitle: '単語・語彙 (Vocabulary)',
      quizTitle: '理解度チェック (Knowledge Check)',
      readingHeader: '本文 (Reading)',
      listenAudio: '発音を聞く',
      masteredBadge: '🏆 完全習得',
      resetBtn: '学習履歴をリセット',
      resetConfirm: '読解パッセージの進捗をリセットしてもよろしいですか？',
      resultTitle: '結果: {total}問中 {score}問正解！',
      notFound: 'パッセージが見つかりませんでした。'
    },

    // Session Page
    session: {
      backBtn: '← 戻る',
      typePrompt: 'フィンランド語で入力してください...',
      speakPrompt: 'マイクを押して発音してください',
      matchPrompt: 'ペアになる単語を選択してください',
      checkBtn: '確認',
      continueBtn: '次へ ➔',
      lessonComplete: 'レッスン完了！🎉',
      accuracy: '正解率',
      returnHome: 'ホームへ戻る',
      questionOf: '問題 {current} / {total}',
      levelLabel: 'レベル {level}',
      specialChars: '特殊文字:',
      listenNormal: '発音を聞く (通常)',
      listenSlow: '発音を聞く (ゆっくり)',
      instructionListenTyping: '聞こえた通りに入力してください:',
      instructionListenFill: '空欄に入る単語を入力してください:',
      instructionReverse: '日本語で書いてください:',
      instructionFill: '空欄に入る単語を入力してください:',
      instructionMatching: 'ペアになる単語をタップしてください:',
      instructionSpeaking: 'この文を声に出して読んでください:',
      instructionTranslate: 'この文をフィンランド語に訳してください:',
      feedbackTypo: 'おしい！軽微なスペルミスがあります',
      feedbackCorrect: '正解！素晴らしい！',
      feedbackWrong: '不正解',
      correctAnswerIs: '正解:',
      grammarNoteLabel: '💡 解説ノート:'
    }
  },

  en: {
    // Navigation
    nav: {
      home: 'Home',
      grammar: 'Grammar & Idioms',
      drillStudio: 'Drill Studio',
      passages: 'Passages',
      logo: 'Finnish Learner'
    },

    // Common
    common: {
      back: 'Back',
      next: 'Next',
      submit: 'Submit',
      correct: 'Correct!',
      incorrect: 'Incorrect',
      listen: 'Listen',
      close: 'Close',
      loading: 'Loading...',
      all: 'All',
      level: 'Level',
      difficulty: 'Difficulty',
      score: 'Score',
      explanation: 'Explanation'
    },

    // Home Page
    home: {
      guidebook: 'Guidebook',
      practiceMatch: '🧩 Practice Word Match',
      practiceSpeaking: '🎙️ Practice Speaking',
      resetProgress: 'Reset Progress',
      resetConfirm: 'Are you sure you want to reset all your progress?',
      mastered: '🏆 Mastered',
      currentLevel: 'Current: Level {level}',
      levelChoice: 'L1 (Choice)',
      levelWords: 'L2 (Words)',
      levelType: 'L3 (Type)',
      speakBtn: '🎙️ Speak',
      matchBtn: '🧩 Match'
    },

    // Guidebook Modal
    guidebook: {
      title: 'Guidebook',
      keyPhrases: 'Key Phrases',
      grammarTips: 'Grammar Tips',
      headerSubtitle: 'Key Phrases & Grammar Notes',
      loadingNotes: 'Loading notes...',
      emptyNotes: 'No grammar notes available for this unit yet.',
      noteLabel: 'Note:',
      closeBtn: 'Close'
    },

    // Grammar Hub
    grammarHub: {
      title: '📖 Finnish Grammar & Idioms Curriculum',
      subtitle: 'Master Finnish grammar rules, 15 noun cases, verb conjugations, and authentic idioms systematically.',
      drillBannerBadge: 'NEW ⚡ Interactive Drills',
      drillBannerTitle: '🎯 Grammar Drill Studio',
      drillBannerDesc: 'Internalize grammar patterns through quick interactive drills, typing exercises, and targeted category practices.',
      startDrillBtn: '🚀 Start Drilling Now',
      searchPlaceholder: 'Search grammar topics or keywords (e.g. vowel harmony, rection, partitive)...',
      exercisesCount: '✏️ {count} Exercises',
      learnMore: 'Learn More ➔',
      notFound: 'No matching grammar topics found.'
    },

    // Grammar Categories
    grammarCategories: {
      all: 'All',
      basic_grammar: 'Basic Grammar & Phonology',
      cases: 'Cases (Sijamuodot)',
      verbs: 'Verbs & Conjugations',
      rection: 'Rection (Rektio)',
      idioms: 'Idioms & Spoken Finnish'
    },

    // Grammar Detail
    grammarDetail: {
      backToHub: '← Back to Grammar Hub',
      tabRules: '📖 Grammar Rules & Overview',
      tabExamples: '🔊 Practical Examples',
      tabPitfalls: '⚠️ Common Pitfalls & Exceptions',
      tabQuiz: '✏️ Practice Quiz ({count} Qs)',
      overviewTitle: 'Overview & Rules',
      rulesTitle: 'Core Rules',
      tableTitle: 'Conjugation & Declension Table',
      examplesTitle: 'Practical Examples (Native Finnish Audio)',
      examplesSubtitle: 'Click the speaker icon to listen to natural Finnish pronunciation (TTS).',
      pointLabel: '💡 Note:',
      pitfallsTitle: 'Common Pitfalls & Irregularities',
      idiomsTitle: 'Key Related Idioms & Expressions',
      idiomMeaning: '👉 Meaning:',
      idiomExample: 'Example:',
      drillStudioLink: '🎯 Practice in Drill Studio ➔',
      quizHeaderTitle: '✏️ Practice Quiz:',
      quizHeaderDesc: 'Test your understanding of this topic.',
      questionNum: 'Q{num}.',
      submitAnswers: 'Submit Answers',
      retryQuiz: 'Retry Quiz',
      resultsTitle: 'Result: {correct} out of {total} correct!',
      perfectScore: 'Awesome! You have completely mastered this topic 🎉',
      goodScore: 'Good job! Check the explanations to review 👍',
      drillEncouragement: 'Want to make this second nature? Practice in the Drill Studio!',
      notFound: 'Grammar topic not found.'
    },

    // Drill Studio
    drillStudio: {
      title: '🎯 Grammar Drill Studio',
      subtitle: 'Internalize Finnish grammar rules through focused, repetitive interactive exercises',
      backToHub: '← Back to Grammar Hub',
      totalAvailable: 'Total Available Questions:',
      weaknessTitle: 'Weakness Bank:',
      weaknessBtn: '🔥 Start Weakness Drill ({count} Qs)',
      stepCategory: '1. Select Category',
      stepTopic: '2. Focus on a Topic (Optional)',
      allTopics: 'All Topics (Comprehensive Drill)',
      stepFormat: '3. Exercise Format',
      formatAll: '🎲 All Formats',
      formatChoice: '🔘 Multiple Choice',
      formatTyping: '⌨️ Typing / Fill-in',
      formatWordbank: '🧩 Word Bank / Chips',
      stepCount: '4. Number of Questions',
      questionsCount: '{count} Qs',
      startBtn: '🚀 Start Drill Session',
      noQuestionsWarning: 'No questions matched your selected filters. Please adjust your choices.',
      exitBtn: '✕ Exit',
      exitConfirm: 'Exit the drill session and return to settings?',
      streakBadge: '🔥 {count} Streak!',
      inputPlaceholder: 'Type in Finnish...',
      selectedAnswerLabel: 'Selected Answer:',
      selectChipHint: '(Select words from the chips below)',
      submitBtn: 'Submit Answer',
      submitBtnEnter: 'Submit Answer (Enter)',
      nextBtnEnter: 'Next Question (Enter)',
      finishBtnEnter: 'View Results (Enter)',
      correctBanner: '🎉 Correct!',
      incorrectBanner: '❌ Not quite right',
      correctAnswerLabel: 'Correct Answer:',
      explanationLabel: 'Explanation:',
      specialChars: 'Special Characters:',
      nextBtn: 'Next Question ➔',
      finishBtn: 'View Results ➔',
      completedTitle: 'Session Complete!',
      completedSubtitle: 'Well done! You have completed this drill session.',
      accuracyLabel: 'Accuracy',
      maxStreakLabel: 'Max Streak',
      timeLabel: 'Duration',
      reviewTitle: 'Review Missed Questions',
      retryWeaknessBtn: '⚡ Retry Missed Questions ({count})',
      retrySameBtn: '🔄 Retry with Same Settings',
      changeSettingsBtn: '⚙️ Change Settings',
      backToHubBtn: '📖 Back to Grammar Hub'
    },

    // Reading Passage
    passages: {
      title: 'Reading Passages',
      subtitle: 'Improve your reading comprehension with authentic Finnish texts and quizzes.',
      filterDifficulty: 'Filter by Difficulty:',
      allDifficulties: 'All Difficulties',
      loading: 'Loading passages...',
      backToList: '← Back to Passages',
      showTranslation: 'Show Translation',
      hideTranslation: 'Hide Translation',
      vocabularyTitle: 'Vocabulary',
      quizTitle: 'Knowledge Check',
      readingHeader: 'Reading',
      listenAudio: 'Listen to passage',
      masteredBadge: '🏆 Mastered',
      resetBtn: 'Reset Progress',
      resetConfirm: 'Are you sure you want to reset your passage progress?',
      resultTitle: 'Score: {score} out of {total} correct!',
      notFound: 'Passage not found.'
    },

    // Session Page
    session: {
      backBtn: '← Back',
      typePrompt: 'Type in Finnish...',
      speakPrompt: 'Click the mic and speak',
      matchPrompt: 'Select matching pairs',
      checkBtn: 'Check',
      continueBtn: 'Continue ➔',
      lessonComplete: 'Lesson Complete! 🎉',
      accuracy: 'Accuracy',
      returnHome: 'Return to Home',
      questionOf: 'Question {current} of {total}',
      levelLabel: 'Level {level}',
      specialChars: 'Special Characters:',
      listenNormal: 'Listen (Normal Speed)',
      listenSlow: 'Listen (Slow)',
      instructionListenTyping: 'Type what you hear:',
      instructionListenFill: 'Type the missing word:',
      instructionReverse: 'Write this in English:',
      instructionFill: 'Type the missing word:',
      instructionMatching: 'Tap the matching pairs:',
      instructionSpeaking: 'Read this sentence out loud:',
      instructionTranslate: 'Translate this sentence:',
      feedbackTypo: 'Almost! Small typo detected',
      feedbackCorrect: 'Correct! Great job!',
      feedbackWrong: 'Incorrect',
      correctAnswerIs: 'Correct answer:',
      grammarNoteLabel: '💡 Grammar Note:'
    }
  }
};
