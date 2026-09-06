export const GRAMMAR_CATEGORIES = [
  { id: 'all', label: 'すべて' },
  { id: 'basic_grammar', label: '基礎文法・音韻ルール' },
  { id: 'cases', label: '格（Sijamuodot）' },
  { id: 'verbs', label: '動詞・活用（Verbit）' },
  { id: 'rection', label: '支配（Rektio）' },
  { id: 'idioms', label: 'イディオム・口語（Idiomit & Puhekieli）' }
];

export const grammarTopics = [
  // =========================================================================
  // 1. BASIC GRAMMAR & PHONOLOGY
  // =========================================================================
  {
    id: 'vokaaliharmonia',
    title: '母音調和 (Vokaaliharmonia)',
    category: 'basic_grammar',
    level: 'A1',
    summary: '単語内に共存できる母音の組み合わせルール。接尾辞（格語尾など）の形を決める最重要の基礎知識。',
    overview: `フィンランド語の母音は **前母音** (ä, ö, y)、**後母音** (a, o, u)、および **中立母音** (e, i) の3グループに分かれます。

基本ルール：
1. 1つの単語（複合語を除く）の中に、前母音 (ä, ö, y) と 後母音 (a, o, u) は共存できません。
2. 中立母音 (e, i) はどちらのグループとも共存できます。
3. 語幹に前母音が含まれていれば接尾辞も前母音タイプ（-ssä, -llä）、後母音が含まれていれば後母音タイプ（-ssa, -lla）になります。
4. 中立母音 (e, i) のみの単語の場合は、接尾辞は**前母音タイプ**（-ssä, -llä など）を選びます。`,
    rules: [
      { title: '前母音グループ', description: 'ä, ö, y ➔ 接尾辞には ä, ö, y を使用（例: metsä + ssä ➔ metsässä）' },
      { title: '後母音グループ', description: 'a, o, u ➔ 接尾辞には a, o, u を使用（例: talo + ssa ➔ talossa）' },
      { title: '中立母音グループ', description: 'e, i ➔ 両方OK。中立音のみの単語には前母音語尾（例: helsinki + ssä ➔ Helsingissä）' }
    ],
    table: {
      headers: ['語幹のタイプ', '母音の種類', '接尾辞の例 (-ssa / -ssä)', '単語例'],
      rows: [
        ['後母音語幹', 'a, o, u', '-ssa / -lla / -sta', 'talo ➔ talossa (家で)'],
        ['前母音語幹', 'ä, ö, y', '-ssä / -llä / -stä', 'metsä ➔ metsässä (森で)'],
        ['中立音語幹', 'e, i のみ', '-ssä / -llä / -stä', 'peli ➔ pelissä (ゲームで)']
      ]
    },
    examples: [
      { finnish: 'Suomessa on paljon järviä.', english: 'There are many lakes in Finland.', japanese: 'フィンランドにはたくさんの湖があります。', note: 'Suomi + ssa ➔ Suomessa (後母音uを含むため -ssa)' },
      { finnish: 'Helsingissä on ihana sää.', english: 'The weather is lovely in Helsinki.', japanese: 'ヘルシンキの天気は素晴らしいです。', note: 'Helsinki ➔ Helsingissä (中立音e,iのみのため前母音語尾 -ssä)' },
      { finnish: 'Tytöt leikkivät puistossa.', english: 'Girls are playing in the park.', japanese: '女の子たちが公園で遊んでいます。', note: 'tyttö ➔ tytöt (前母音), puisto ➔ puistossa (後母音)' }
    ],
    pitfalls: [
      { title: '複合語（Yhdyssanat）に注意', explanation: '複合語（例: kirjakauppa = kirja + kauppa）の場合、母音調和は「最後の単語（kauppa）」の母音に従います。' }
    ],
    idioms: [],
    practiceQuiz: [
      {
        type: 'choice',
        question: '「talo（家）」に「〜の中で (-ssa/-ssä)」をつける正しい形は？',
        options: ['talossa', 'talossä', 'talollessa', 'talissä'],
        answer: 'talossa',
        explanation: 'talo には後母音 a, o が含まれるため、後母音語尾の -ssa になります。'
      },
      {
        type: 'choice',
        question: '「metsä（森）」に「〜の中で (-ssa/-ssä)」をつける正しい形は？',
        options: ['metsassa', 'metsässä', 'metsalssa', 'metsissä'],
        answer: 'metsässä',
        explanation: 'metsä には前母音 ä が含まれるため、前母音語尾の -ssä になります。'
      },
      {
        type: 'wordbank',
        question: '「ヘルシンキで」を意味する語を作ってください。',
        words: ['Helsingissä', 'Helsingissa', 'Helsinkissa', 'Helsingiltä'],
        answer: 'Helsingissä',
        explanation: 'Helsinki は中立音 (e, i) のみでかつ k➔g の段階変化が起きるため Helsingissä となります。'
      },
      {
        type: 'typing',
        question: '「tyttö（女の子）」に「〜の中で (-ssa/-ssä)」を付けた形を入力してください。',
        hint: 'tyt_____',
        answer: 'tytössä',
        explanation: 'tyttö は前母音 ö を含むため -ssä となり、子音段階変化 tt➔t が起きて tytössä となります。'
      },
      {
        type: 'choice',
        question: '複合語「kirjakauppa（本屋）」に「〜の中で」を付けるときの正しい形は？',
        options: ['kirjakaupassa', 'kirjakaupässä', 'kirjässäkaupassa'],
        answer: 'kirjakaupassa',
        explanation: '複合語では最後の単語（kauppa）の母音（a, u）に従うため、後母音の -ssa になります。'
      }
    ]
  },
  {
    id: 'astevaihtelu',
    title: '子音段階変化 (Astevaihtelu / KTP-sääntö)',
    category: 'basic_grammar',
    level: 'A2',
    summary: '単語が曲用・活用するときに、語幹の中の子音 (k, t, p) が強い形（強階）から弱い形（弱階）に変化する規則。',
    overview: `フィンランド語の学習で極めて重要な規則が **Astevaihtelu (Consonant Gradation)** です。
名詞の格変化（属格、位置格など）や動詞の活用（1・2人称など）で音節が閉じると、子音 k, t, p が変化します。

主な変化パターン：
- **重子音 ➔ 単子音** (kk➔k, tt➔t, pp➔p)
- **単子音 ➔ 消失・別子音** (k➔消失/g/v, t➔d, p➔v)
- **鼻音同化** (nk➔ng, nt➔nn, mp➔mm)`,
    rules: [
      { title: 'kk ➔ k / tt ➔ t / pp ➔ p', description: 'pukki ➔ pukin, tyttö ➔ tytöt, kuppi ➔ kupissa' },
      { title: 't ➔ d / p ➔ v', description: 'katu ➔ kadulla, tapa ➔ tavan, leipä ➔ leivän' },
      { title: 'nk ➔ ng / nt ➔ nn / mp ➔ mm', description: 'Helsinki ➔ Helsingissä, ranta ➔ rannalla, kampa ➔ kamman' }
    ],
    table: {
      headers: ['強階 (Vahva)', '弱階 (Heikko)', '原形 (基本形)', '変化形 (属格・位置格など)'],
      rows: [
        ['kk', 'k', 'kukka (花)', 'kukan (花の)'],
        ['tt', 't', 'tyttö (女の子)', 'tytöt (女の子たち)'],
        ['pp', 'p', 'kuppi (カップ)', 'kupissa (カップの中で)'],
        ['t', 'd', 'katu (通り)', 'kadulla (通りで)'],
        ['p', 'v', 'leipä (パン)', 'leivän (パンの)'],
        ['nt', 'nn', 'ranta (海岸)', 'rannalla (海岸で)'],
        ['nk', 'ng', 'aurinko (太陽)', 'auringossa (太陽の下で)']
      ]
    },
    examples: [
      { finnish: 'Asun kauniilla kadulla.', english: 'I live on a beautiful street.', japanese: '私は美しい通りに住んでいます。', note: 'katu (強階) ➔ kadulla (弱階: t➔d)' },
      { finnish: 'Syön leipää ja juon kahvia kupista.', english: 'I eat bread and drink coffee from a cup.', japanese: 'パンを食べてカップからコーヒーを飲みます。', note: 'kuppi ➔ kupista (pp➔p)' },
      { finnish: 'Me kävelemme rannalla.', english: 'We are walking on the beach.', japanese: '私たちは海岸を歩いています。', note: 'ranta ➔ rannalla (nt➔nn)' }
    ],
    pitfalls: [
      { title: '逆段階変化（Käänteinen astevaihtelu）', explanation: '動詞タイプ4など（例: tavata ➔ tapaan）では、基本形が弱階で活用形が強階になる逆パターンが存在します。' }
    ],
    idioms: [],
    practiceQuiz: [
      {
        type: 'choice',
        question: '「katu（通り）」に「〜で (-lla)」をつけるときの正しい形は？',
        options: ['katulla', 'kadulla', 'kavulla', 'kasulla'],
        answer: 'kadulla',
        explanation: 't ➔ d の子音段階変化が起きるため kadulla となります。'
      },
      {
        type: 'choice',
        question: '「kuppi（カップ）」に「〜の中で (-ssa)」をつけるときの形は？',
        options: ['kupissa', 'kuppissa', 'kuvissa'],
        answer: 'kupissa',
        explanation: '重子音 pp は単子音 p に弱化するため kupissa となります。'
      },
      {
        type: 'typing',
        question: '「ranta（海岸）」に「〜で (-lla)」を付けた形を入力してください。',
        hint: 'ran_____',
        answer: 'rannalla',
        explanation: 'nt ➔ nn の同化が起きるため rannalla となります。'
      },
      {
        type: 'typing',
        question: '「leipä（パン）」の属格形（〜の: -n）を入力してください。',
        hint: 'lei_____',
        answer: 'leivän',
        explanation: 'p ➔ v の段階変化が起き、leipä + n ➔ leivän となります。'
      },
      {
        type: 'wordbank',
        question: '「kukka（花）」の複数主格（花たち: -t）を作ってください。',
        words: ['kukat', 'kukkia', 'kukkasa', 'kukkien'],
        answer: 'kukat',
        explanation: 'kk ➔ k の弱階化が起きて kukat となります。'
      }
    ]
  },
  {
    id: 'kysymyslauseet',
    title: '疑問文と疑問詞 (Kysymyslauseet & Kysymyssanat)',
    category: 'basic_grammar',
    level: 'A1',
    summary: 'フィンランド語の疑問文の作り方。動詞や名詞に付ける疑問小辞「-ko/-kö」と主要な疑問詞の一覧。',
    overview: `フィンランド語で「はい/いいえ」を尋ねる疑問文（Yes/No疑問文）を作るには、文頭の単語に **疑問小辞 -ko / -kö** を付加します。
また、具体的な情報を尋ねる疑問詞（Kuka, Mikä, Missä, Mihin, Milloin など）を用いた疑問文もあります。`,
    rules: [
      { title: '-ko / -kö 疑問小辞', description: '強調したい単語（通常は動詞）を文頭に置き、母音調和に応じて -ko / -kö を付けます。例: Puhutko suomea? (フィンランド語を話しますか？)' },
      { title: '疑問詞疑問文', description: '疑問詞は常に文頭に置かれます。例: Mikä tämä on? (これは何ですか？)' }
    ],
    table: {
      headers: ['疑問詞', '意味', '例文', '日本語訳'],
      rows: [
        ['kuka', 'だれ', 'Kuka hän on?', '彼/彼女はだれですか？'],
        ['mikä / mitä', '何', 'Mikä sinun nimesi on?', 'あなたの名前は何ですか？'],
        ['missä', 'どこで', 'Missä sinä asut?', 'あなたはどこに住んでいますか？'],
        ['mistä', 'どこから', 'Mistä olet kotoisin?', 'どちらのご出身ですか？'],
        ['mihin / minne', 'どこへ', 'Mihin menet?', 'どこへ行くのですか？'],
        ['milloin / koskaan', 'いつ', 'Milloin kurssi alkaa?', '講座はいつ始まりますか？'],
        ['miksi', 'なぜ', 'Miksi opiskelet suomea?', 'なぜフィンランド語を勉強しているのですか？'],
        ['kuinka / miten', 'どのように/いくら', 'Kuinka vanha olet?', 'おいくつですか？']
      ]
    },
    examples: [
      { finnish: 'Puhutteko te englantia?', english: 'Do you speak English?', japanese: 'あなた（方）は英語を話しますか？', note: 'puhua ➔ puhutte + ko' },
      { finnish: 'Onko sinulla kysymyksiä?', english: 'Do you have questions?', japanese: '質問はありますか？', note: 'on + ko (ありますか)' },
      { finnish: 'Mitä kello on?', english: 'What time is it?', japanese: '何時ですか？', note: '日常会話の超定番フレーズ' }
    ],
    pitfalls: [
      { title: 'mikä vs mitä', explanation: 'mikä は具体的・数えられる単数（Mikä tämä on?）、mitä は抽象的・部分・動作（Mitä teet? / Mitä kuuluu?）に使われます。' }
    ],
    idioms: [],
    practiceQuiz: [
      {
        type: 'choice',
        question: '「あなたはフィンランド語を話しますか？」の正しいフィンランド語は？',
        options: ['Puhutko sinä suomea?', 'Puhutkö sinä suomea?', 'Sinä puhutko suomea?'],
        answer: 'Puhutko sinä suomea?',
        explanation: '動詞 puhut を文頭に出し、後母音 u, a に合わせて -ko を付けます。'
      },
      {
        type: 'choice',
        question: '「どこに住んでいますか？」を尋ねる疑問詞はどれ？',
        options: ['Missä', 'Mihin', 'Mistä', 'Mikä'],
        answer: 'Missä',
        explanation: '場所「〜の中で/どこで」を尋ねる疑問詞は Missä（Inessiivi形）です。'
      },
      {
        type: 'typing',
        question: '「だれ（Who）」を意味するフィンランド語を入力してください。',
        hint: 'ku_____',
        answer: 'kuka',
        explanation: '「だれ」はフィンランド語で kuka です。'
      },
      {
        type: 'typing',
        question: '「なぜ/どうして (Why)」を意味するフィンランド語を入力してください。',
        hint: 'mi_____',
        answer: 'miksi',
        explanation: '「なぜ」は miksi です。'
      },
      {
        type: 'wordbank',
        question: '「調子はどうですか？（お元気ですか？）」を意味する挨拶フレーズを選んでください。',
        words: ['Mitä kuuluu', 'Kuka olet', 'Missä asut', 'Mitä teet'],
        answer: 'Mitä kuuluu',
        explanation: '挨拶の基本表現「Mitä kuuluu?（元気ですか？）」です。'
      }
    ]
  },
  {
    id: 'omistusrakenne',
    title: '所有構造と所有接尾辞 (Omistusrakenne & Possessiivisuffiksit)',
    category: 'basic_grammar',
    level: 'A1',
    summary: 'フィンランド語には「have」動詞がありません。「〜にある」構造（Minulla on...）と所有接尾辞 (-ni, -si...) で所有を表します。',
    overview: `フィンランド語には英語の have に相当する動詞がありません。
その代わりに **所有者（人称の接尾格 Adessiivi: -lla/-llä） + on + 所有物** という構文を使います。

否定文の場合：
**所有者-lla/-llä + ei ole + 所有物（分格 Partitiivi）**`,
    rules: [
      { title: '肯定の所有文', description: 'Minulla on auto. (私には車がある / 私は車を持っている)' },
      { title: '否定の所有文', description: 'Minulla ei ole autoa. (私には車がない。所有物は必ずPartitiiviになります)' },
      { title: '所有接尾辞', description: '1単: -ni, 2単: -si, 3人称: -nsa/-nsä, 1複: -mme, 2複: -tte' }
    ],
    table: {
      headers: ['人称', '所有者 (Adessiivi)', '肯定文例', '否定文例 (Partitiivi)'],
      rows: [
        ['1人称単数 (minä)', 'minulla', 'Minulla on kissa.', 'Minulla ei ole kissaa.'],
        ['2人称単数 (sinä)', 'sinulla', 'Sinulla on aikaa.', 'Sinulla ei ole aikaa.'],
        ['3人称単数 (hän)', 'hänellä', 'Hänellä on koira.', 'Hänellä ei ole koiraa.'],
        ['1人称複数 (me)', 'meillä', 'Meillä on talo.', 'Meillä ei ole taloa.'],
        ['2人称複数 (te)', 'teillä', 'Teillä on avain.', 'Teillä ei ole avainta.'],
        ['3人称複数 (he)', 'heillä', 'Heillä on lapsia.', 'Heillä ei ole lapsia.']
      ]
    },
    examples: [
      { finnish: 'Onko sinulla nälkä?', english: 'Are you hungry? (Do you have hunger?)', japanese: 'お腹が空いていますか？', note: 'nälkä (空腹) を持っているかという表現' },
      { finnish: 'Minulla on kiire töihin.', english: 'I am in a hurry to work.', japanese: '私は仕事へ急いでいます。', note: 'kiire (急ぎ・多忙) を持っている' },
      { finnish: 'Tämä on minun autoni.', english: 'This is my car.', japanese: 'これは私の車です。', note: '所有接尾辞 -ni' }
    ],
    pitfalls: [
      { title: '否定文の所有物は必ず分格 (Partitiivi)', explanation: 'Minulla ei ole kirja ではなく、必ず Minulla ei ole kirjaa と分格語尾にします。' }
    ],
    idioms: [],
    practiceQuiz: [
      {
        type: 'choice',
        question: '「私には車があります（私は車を持っています）」を表す正しい文は？',
        options: ['Minulla on auto.', 'Minä on auto.', 'Minulla on autossa.', 'Minulla on autolle.'],
        answer: 'Minulla on auto.',
        explanation: '所有構文は「所有者-lla/-llä + on + 名詞主格」です。'
      },
      {
        type: 'choice',
        question: '「私には車がありません」を表す正しい文は？',
        options: ['Minulla ei ole autoa.', 'Minulla ei ole auto.', 'Minä en ole auto.'],
        answer: 'Minulla ei ole autoa.',
        explanation: '所有の否定文では、所有物が分格（Partitiivi: autoa）になります。'
      },
      {
        type: 'typing',
        question: '「あなた（sinä）は持っている」の所有者形（Adessiivi）を入力してください。',
        hint: 'sinul_____',
        answer: 'sinulla',
        explanation: 'sinä の接尾格は sinulla です。'
      },
      {
        type: 'typing',
        question: '「彼/彼女（hän）は持っている」の所有者形を入力してください。',
        hint: 'hänel_____',
        answer: 'hänellä',
        explanation: 'hän の接尾格は前母音語尾で hänellä です。'
      },
      {
        type: 'wordbank',
        question: '「私たちには時間がありません」を完成させてください。',
        words: ['Meillä ei ole aikaa', 'Meillä on aika', 'Meillä ei aikaa'],
        answer: 'Meillä ei ole aikaa',
        explanation: 'Meillä ei ole aikaa (aika の分格 aikaa)。'
      }
    ]
  },
  {
    id: 'komparatiivi_superlatiivi',
    title: '比較級と最上級 (Komparatiivi & Superlatiivi)',
    category: 'basic_grammar',
    level: 'A2',
    summary: '「より〜」「もっとも〜」を表す形容詞・副詞の比較表現。接尾辞 -mpi と -in のルール。',
    overview: `フィンランド語の比較級（Komparatiivi）は語幹に **-mpi**、最上級（Superlatiivi）は語幹に **-in** を付けて作ります。
比較の対象には「kuin（〜よりも）」を使うか、対象を分格（Partitiivi）で前置します。`,
    rules: [
      { title: '比較級 (-mpi)', description: 'vanha ➔ vanhempi (より古い/年上の), helppo ➔ helpompi (より簡単な)' },
      { title: '最上級 (-in)', description: 'vanha ➔ vanhin (もっとも古い), helppo ➔ helpoin (もっとも簡単な)' },
      { title: '比較の構文', description: 'Tämä kirja on parempi kuin tuo. (この本はあの本より良い)' }
    ],
    table: {
      headers: ['原級 (Perusmuoto)', '比較級 (Komparatiivi)', '最上級 (Superlatiivi)', '意味'],
      rows: [
        ['halpa (安い)', 'halvempi', 'halvin', '安い ➔ より安い ➔ 最も安い'],
        ['kallis (高い)', 'kalliimpi', 'kallein', '高い ➔ より高い ➔ 最も高い'],
        ['hyvä (良い)', 'parempi', 'paras / parhain', '良い ➔ より良い ➔ 最良の (不規則)'],
        ['pieni (小さい)', 'pienempi', 'pienin', '小さい ➔ より小さい ➔ 最小の'],
        ['suuri (大きい)', 'suurempi', 'suurin', '大きい ➔ より大きい ➔ 最大の']
      ]
    },
    examples: [
      { finnish: 'Suomi on kylmempi kuin Japani.', english: 'Finland is colder than Japan.', japanese: 'フィンランドは日本より寒いです。', note: 'kylmä ➔ kylmempi' },
      { finnish: 'Hän on minua vanhempi.', english: 'He is older than me.', japanese: '彼/彼女は私より年上です。', note: 'minua (分格) + vanhempi = kuin minä vanhempi' },
      { finnish: 'Tämä on kaupungin paras ravintola.', english: 'This is the best restaurant in town.', japanese: 'これは街で一番のレストランです。', note: 'hyvä の最上級 paras' }
    ],
    pitfalls: [
      { title: 'hyvä の不規則変化', explanation: 'hyvä（良い）は比較級が parempi、最上級が paras / parhain と大きく変化します。' }
    ],
    idioms: [],
    practiceQuiz: [
      {
        type: 'choice',
        question: '「hyvä（良い）」の比較級（より良い）はどれ？',
        options: ['parempi', 'hyvämpi', 'hyvin', 'parhain'],
        answer: 'parempi',
        explanation: 'hyvä は不規則で、比較級は parempi となります。'
      },
      {
        type: 'choice',
        question: '「halpa（安い）」の比較級（より安い）はどれ？',
        options: ['halvempi', 'halpampi', 'halpin'],
        answer: 'halvempi',
        explanation: 'p ➔ v の段階変化が起き、-mpi を付けて halvempi となります。'
      },
      {
        type: 'typing',
        question: '「suuri（大きい）」の最上級（もっとも大きい）を入力してください。',
        hint: 'suu_____',
        answer: 'suurin',
        explanation: 'suuri の語幹 suure- に最上級接尾辞 -in が付き suurin となります。'
      },
      {
        type: 'typing',
        question: '「hyvä（良い）」の最上級（もっとも良い・最高の）を入力してください。',
        hint: 'par_____',
        answer: 'paras',
        explanation: 'hyvä の最上級で最も一般的な形は paras です。'
      },
      {
        type: 'wordbank',
        question: '「フィンランドは日本より寒いです」を完成させてください。',
        words: ['Suomi on kylmempi kuin Japani', 'Suomi on kylmä kuin Japani', 'Suomi on kylmin kuin Japani'],
        answer: 'Suomi on kylmempi kuin Japani',
        explanation: 'kylmä ➔ kylmempi kuin Japani です。'
      }
    ]
  },
  {
    id: 'objekti_saannot',
    title: '目的語の完全ルール (Objekti: Total vs Partial)',
    category: 'basic_grammar',
    level: 'B1',
    summary: 'フィンランド語文法の最難関の一つ。目的語が分格（Partitiivi）になるか、属格・対格（Genetiivi/Akusatiivi）になるかの完全判別法。',
    overview: `フィンランド語の目的語には、大きく分けて **部分的・未完の目的語（Partitiiviobjekti）** と **全体的・完了の目的語（Totaaliobjekti）** があります。

目的語決定の3大原則：
1. **否定文** ➔ 必ず Partitiivi！ (En osta autoa.)
2. **動作が進行中・未完了 / 物質名詞** ➔ Partitiivi！ (Luen kirjaa. / Juon kahvia.)
3. **動作が完結・全体** ➔ Totaaliobjekti (-n 属格 または 命令文・受動態などで単数主格同形)！ (Luen kirjan loppuun.)`,
    rules: [
      { title: '1. 否定文の目的語', description: '文に否定詞 (en, et, ei, emme, ette, eivät) があれば問答無用で分格 (Partitiivi)' },
      { title: '2. 進行・未完了の目的語', description: '動作の途中、終わっていない場合は分格 (Luen lehteä = 新聞を読んでいる最中)' },
      { title: '3. 完了・結果の目的語', description: '最後まで成し遂げた、1つ丸ごと手に入れた場合は全格目的語 (Ostin auton = 車を買った)' }
    ],
    table: {
      headers: ['目的語の種類', '格', '例文', 'ニュアンス'],
      rows: [
        ['部分的 (Partitiivi)', 'kirjaa', 'Luen kirjaa.', '本を読んでいる（途中/未完了）'],
        ['全体的 (Genetiivi-objekti)', 'kirjan', 'Luen kirjan huomenna.', '明日その本を（1冊全部）読み終える'],
        ['命令文の全体的目的語', 'kirja (無語尾)', 'Lue tämä kirja!', 'この本を読みなさい！（命令文では-nなし）'],
        ['否定文の目的語', 'kirjaa', 'En lue tätä kirjaa.', '私はこの本を読まない（否定なのでPartitiivi）']
      ]
    },
    examples: [
      { finnish: 'Hän syö omenaa.', english: 'He is eating an apple.', japanese: '彼はリンゴをかじっている（食べている最中）。', note: 'Partitiivi (進行)' },
      { finnish: 'Hän söi omenan.', english: 'He ate the apple.', japanese: '彼はリンゴを（丸ごと1個）食べた。', note: 'Genetiiviobjekti (完了)' },
      { finnish: 'Avaa ovi!', english: 'Open the door!', japanese: 'ドアを開けなさい！', note: '命令文の目的語は主格同形 (ovi)' }
    ],
    pitfalls: [
      { title: '命令文（Imperatiivi）の目的語', explanation: '命令文では「本を読め！」の目的語は kirjan ではなく、-n が落ちて Lue kirja! になります。' }
    ],
    idioms: [],
    practiceQuiz: [
      {
        type: 'choice',
        question: '「私はその本を（最後まで）読み終えます」という完了を表す文は？',
        options: ['Luen kirjan.', 'Luen kirjaa.', 'Luen kirjassa.'],
        answer: 'Luen kirjan.',
        explanation: '動作の完結（本を1冊読み切る）を表す全格目的語は Genetiivi形（-n）の kirjan です。'
      },
      {
        type: 'choice',
        question: '否定文「私はコーヒーを飲みません」の正しいフィンランド語は？',
        options: ['En juo kahvia.', 'En juo kahvin.', 'En juo kahvi.'],
        answer: 'En juo kahvia.',
        explanation: '否定文の目的語は必ず分格（Partitiivi）になります。'
      },
      {
        type: 'choice',
        question: '命令文「ドアを開けなさい！」の正しいフィンランド語は？',
        options: ['Avaa ovi!', 'Avaa oven!', 'Avaa ovea!'],
        answer: 'Avaa ovi!',
        explanation: '命令文の全格目的語は -n が脱落した単数主格同形（ovi）になります。'
      },
      {
        type: 'typing',
        question: '「私は車（auto）を買いました（完了）」の目的語（-n形）を入力してください: Ostin _____',
        hint: 'auto_____',
        answer: 'auton',
        explanation: '単数全格目的語は語幹に -n を付けた auton です。'
      },
      {
        type: 'wordbank',
        question: '「私はリンゴを食べている（最中）」を作ってください。',
        words: ['Syön omenaa', 'Syön omenan', 'Syön omena'],
        answer: 'Syön omenaa',
        explanation: '進行中の動作の目的語は分格 omenaa になります。'
      }
    ]
  },

  // =========================================================================
  // 2. CASES (SIJAMUODOT)
  // =========================================================================
  {
    id: 'paikallissijat',
    title: '位置格（6つの内部・外部位置格）',
    category: 'cases',
    level: 'A1',
    summary: 'フィンランド語の空間表現の要。「どこで」「どこから」「どこへ」を表す内部3格と外部3格のシステム。',
    overview: `フィンランド語の位置格（Paikallissijat）は、**内部位置格**（箱・部屋・国などの内部）と**外部位置格**（平面・屋根・開かれた場所・人）に綺麗に対称化されています。`,
    rules: [
      { title: '内部位置格 (Sisäpaikallissijat)', description: '-ssa/-ssä (中で), -sta/-stä (中から), -Vn/-seen (中へ)' },
      { title: '外部位置格 (Ulkopaikallissijat)', description: '-lla/-llä (上で・乗物手段), -lta/-ltä (上から), -lle (上へ・人へ)' }
    ],
    table: {
      headers: ['格の種類', '格名', '語尾', '意味', '例 (talo: 家 / pöytä: 机)'],
      rows: [
        ['内部: 静止', 'Inessiivi', '-ssa / -ssä', '〜の中で', 'talossa (家の中で)'],
        ['内部: 起点', 'Elatiivi', '-sta / -stä', '〜の中から', 'talosta (家から)'],
        ['内部: 到達', 'Illatiivi', '-Vn / -seen', '〜の中へ', 'taloon (家へ)'],
        ['外部: 静止', 'Adessiivi', '-lla / -llä', '〜の上で・〜で', 'pöydällä (机の上で) / bussilla (バスで)'],
        ['外部: 起点', 'Ablatiivi', '-lta / -ltä', '〜の上から', 'pöydältä (机の上から)'],
        ['外部: 到達', 'Allatiivi', '-lle', '〜の上へ・人へ', 'pöydälle (机へ) / minulle (私へ)']
      ]
    },
    examples: [
      { finnish: 'Meneekö tämä bussi torille?', english: 'Does this bus go to the market square?', japanese: 'このバスは市場広場へ行きますか？', note: 'tori (オープンな場所) ➔ torille (Allatiivi)' },
      { finnish: 'Olen kotoisin Japanista.', english: 'I am from Japan.', japanese: '私は日本出身です。', note: 'Japani ➔ Japanista (Elatiivi: 出身地を表す)' },
      { finnish: 'Voitko antaa avaimen minulle?', english: 'Can you give the key to me?', japanese: '鍵を私に渡してもらえますか？', note: 'minä ➔ minulle (Allatiivi)' }
    ],
    pitfalls: [
      { title: '都市名による -ssa / -lla の違い', explanation: 'Helsinki ➔ Helsingissä (-ssa) ですが、Tampere ➔ Tampereella (-lla), Rovaniemi ➔ Rovaniemellä (-lla) のように習慣上決まっています。' }
    ],
    idioms: [],
    practiceQuiz: [
      {
        type: 'choice',
        question: '「バスで（交通手段）」を表す正しい形はどれ？',
        options: ['bussilla', 'bussissa', 'bussista', 'bussille'],
        answer: 'bussilla',
        explanation: '乗物や手段を表す「〜で」には Adessiivi (-lla/-llä) を使います。'
      },
      {
        type: 'choice',
        question: '「日本から来ました（出身）」の Japanista の格名は？',
        options: ['Elatiivi', 'Inessiivi', 'Illatiivi', 'Ablatiivi'],
        answer: 'Elatiivi',
        explanation: '「〜の中から/〜から」を表す -sta/-stä は Elatiivi（出格）です。'
      },
      {
        type: 'typing',
        question: '「talo（家）」に「〜の中へ (Illatiivi)」を付けた形を入力してください。',
        hint: 'tal_____',
        answer: 'taloon',
        explanation: '単母音で終わる単語のIllatiiviは、母音を伸ばして n を付けます（talo + o + n ➔ taloon）。'
      },
      {
        type: 'typing',
        question: '「minä（私）」に「〜へ (Allatiivi)」を付けた形を入力してください。',
        hint: 'minul_____',
        answer: 'minulle',
        explanation: '「私へ」は minulle となります。'
      },
      {
        type: 'wordbank',
        question: '「机の上に」を表す語を作ってください。',
        words: ['pöydälle', 'pöydällä', 'pöytään', 'pöydältä'],
        answer: 'pöydälle',
        explanation: '「机の上へ」は pöytä ➔ pöydälle (Allatiivi) です。'
      }
    ]
  },
  {
    id: 'partitiivi',
    title: '分格 (Partitiivi)',
    category: 'cases',
    level: 'A1',
    summary: 'フィンランド語で最も重要な格。不定量、未完了の動作、否定文、数詞の後などで必須。',
    overview: `**Partitiivi（分格）** は、全体の「一部」や「終わっていない不確実な数量・動作」を意味します。
英語や日本語には対応する格がないため、初級学習者の最初の山場となります。`,
    rules: [
      { title: '語尾 -a / -ä', description: '単語が1つの母音で終わる場合。例: talo ➔ taloa, kuppi ➔ kuppia' },
      { title: '語尾 -ta / -tä', description: '単語が2つの母音または子音で終わる場合。例: maa ➔ maata, kieli ➔ kieltä' },
      { title: '語尾 -tta / -ttä', description: '単語が -e で終わる場合。例: huone ➔ huonetta, laite ➔ laitetta' }
    ],
    table: {
      headers: ['語末のパターン', '分格語尾', '単語原形', '分格形 (Partitiivi)'],
      rows: [
        ['単母音 (1 vowel)', '-a / -ä', 'kirja (本)', 'kirjaa'],
        ['二重母音 / 長母音', '-ta / -tä', 'maa (国/土地)', 'maata'],
        ['子音終わり', '-ta / -tä', 'olut (ビール)', 'olutta'],
        ['-e 終わり', '-tta / -ttä', 'huone (部屋)', 'huonetta'],
        ['-nen 終わり', '-sta / -stä', 'suomalainen', 'suomalaista']
      ]
    },
    examples: [
      { finnish: 'Minulla on kaksi kissaa.', english: 'I have two cats.', japanese: '私には猫が2匹います。', note: '数詞（2以上）の後の名詞は単数分格' },
      { finnish: 'Juon kylmää maitoa.', english: 'I drink cold milk.', japanese: '私は冷たい牛乳を飲みます。', note: '物質名詞・不可算名詞は分格' },
      { finnish: 'En ymmärrä tätä lausetta.', english: 'I don’t understand this sentence.', japanese: 'この文が理解できません。', note: '否定文の目的語は分格' }
    ],
    pitfalls: [
      { title: '数詞（1以外）の後は単数分格！', explanation: 'yksi kissa (1匹) ですが、kaksi kissaa, kolme kissaa のように2以上の数の後は必ず「単数分格」になります。' }
    ],
    idioms: [],
    practiceQuiz: [
      {
        type: 'choice',
        question: '「kaksi（2）」の後に続く「auto（車）」の正しい形は？',
        options: ['autoa', 'autot', 'auton', 'autoja'],
        answer: 'autoa',
        explanation: '数詞（1以外）の後は名詞の「単数分格」が来るため autoa になります。'
      },
      {
        type: 'choice',
        question: '「huone（部屋）」の分格形（Partitiivi）はどれ？',
        options: ['huonetta', 'huonea', 'huoneta'],
        answer: 'huonetta',
        explanation: '-e で終わる名詞の分格語尾は -tta / -ttä になるため huonetta です。'
      },
      {
        type: 'typing',
        question: '「maa（国）」の分格形を入力してください。',
        hint: 'maa_____',
        answer: 'maata',
        explanation: '長母音で終わる単語の分格語尾は -ta になるため maata となります。'
      },
      {
        type: 'typing',
        question: '「kahvi（コーヒー）」の分格形を入力してください。',
        hint: 'kahvi_____',
        answer: 'kahvia',
        explanation: '単母音で終わる単語の分格語尾は -a になるため kahvia となります。'
      },
      {
        type: 'wordbank',
        question: '「私はフィンランド語を話します」を選んでください。',
        words: ['Puhun suomea', 'Puhun suomen', 'Puhun suomi'],
        answer: 'Puhun suomea',
        explanation: 'puhua（話す）は言語の分格 suomea を目的語にとります。'
      }
    ]
  },
  {
    id: 'genetiivi-akusatiivi',
    title: '属格と対格 (Genetiivi & Akusatiivi)',
    category: 'cases',
    level: 'A2',
    summary: '所有（〜の）を表す属格と、完了した動作の全格目的語を表す対格。義務構文（täytyy）の主語としても頻出。',
    overview: `**Genetiivi（属格）** の語尾は **-n** です。
所有（〜の）を表すだけでなく、文法上極めて重要な2つの役割を持ちます：
1. **全格目的語（Akusatiivi）の単数形**として機能する。
2. **必要構文（Täytyy-rakenne）の「義務の主体」**を表す。`,
    rules: [
      { title: '語尾 -n と子音段階変化', description: '語幹に -n を付けます。強階から弱階への変化（Astevaihtelu）が起きます。例: katu ➔ kadun' },
      { title: '必要構文 (Täytyy / Pitää)', description: '「(人)-n täytyy + 動詞原形」で「〜しなければならない」を表します。例: Minun täytyy mennä.' },
      { title: '人称代名詞の対格語尾 -t', description: '代名詞（minä, sinä など）だけは専用の対格語尾 -t を持ちます。例: minun ➔ minut (私を)' }
    ],
    table: {
      headers: ['基本形', '属格形 (-n)', '代名詞の対格形 (-t)', '意味'],
      rows: [
        ['Pekka', 'Pekan', '-', 'ペッカの'],
        ['Suomi', 'Suomen', '-', 'フィンランドの'],
        ['minä (私)', 'minun (私の)', 'minut (私を)', '私'],
        ['sinä (あなた)', 'sinun (あなたの)', 'sinut (あなたを)', 'あなた'],
        ['hän (彼/彼女)', 'hänen (彼/彼女の)', 'hänet (彼/彼女を)', '彼/彼女']
      ]
    },
    examples: [
      { finnish: 'Tämä on Suomen lippu.', english: 'This is the flag of Finland.', japanese: 'これはフィンランドの国旗です。', note: 'Suomi ➔ Suomen (属格)' },
      { finnish: 'Minun täytyy opiskella tänään.', english: 'I must study today.', japanese: '私は今日勉強しなければなりません。', note: 'Minun (属格) + täytyy + 原形' },
      { finnish: 'Tunnetko sinä hänet?', english: 'Do you know him/her?', japanese: 'あなたは彼/彼女を知っていますか？', note: '人称代名詞の対格 hänet' }
    ],
    pitfalls: [
      { title: '代名詞の対格 -t に注意', explanation: '一般名詞の完了目的語は -n ですが、人称代名詞は「Minä näen hänet（私は彼を見る）」のように -t になります。' }
    ],
    idioms: [],
    practiceQuiz: [
      {
        type: 'choice',
        question: '「私（minä）は行かなければならない」の正しい文は？',
        options: ['Minun täytyy mennä.', 'Minä täytyy mennä.', 'Minulle täytyy mennä.'],
        answer: 'Minun täytyy mennä.',
        explanation: 'täytyy 構文の動作主は必ず属格（Genetiivi: Minun）になります。'
      },
      {
        type: 'choice',
        question: '「sinä（あなた）」を目的語「あなたを（対格）」にする形は？',
        options: ['sinut', 'sinun', 'sinua'],
        answer: 'sinut',
        explanation: '人称代名詞の全格目的語（Akusatiivi）は語尾 -t を持つ sinut です。'
      },
      {
        type: 'typing',
        question: '「tyttö（女の子）」の属格形（〜の: -n）を入力してください。',
        hint: 'tyt_____',
        answer: 'tytön',
        explanation: 'tt ➔ t の段階変化が起き、-n を付けて tytön となります。'
      },
      {
        type: 'typing',
        question: '「Pekka」の属格形（〜の: -n）を入力してください。',
        hint: 'Pek_____',
        answer: 'Pekan',
        explanation: 'kk ➔ k の段階変化が起き、Pekan となります。'
      },
      {
        type: 'wordbank',
        question: '「私の友人の家」を選んでください。',
        words: ['minun ystäväni talo', 'minun ystävän talo', 'minun ystävä talo'],
        answer: 'minun ystäväni talo',
        explanation: 'minun ystäväni talo（私の友人の家）。'
      }
    ]
  },
  {
    id: 'essiivi_translatiivi',
    title: 'エッシィーヴィとトランスラティィーヴィ (Essiivi & Translatiivi)',
    category: 'cases',
    level: 'A2',
    summary: '「〜として・〜の時に」を表す Essiivi (-na/-nä) と、「〜になる・〜へ」状態変化を表す Translatiivi (-ksi)。',
    overview: `**Essiivi（状態格: -na/-nä）** は、一時的な身分・役割（〜として）や、曜日・時間（〜の時に）を表します。子音段階変化は起きず、常に**強階**のままです。
**Translatiivi（変格: -ksi）** は、ある状態への変化（〜になる）や目的・期限・言語を表します。子音段階変化が起き、**弱階**になります。`,
    rules: [
      { title: 'Essiivi (-na / -nä): 役割・時間', description: 'Lääkärinä (医師として), lapsena (子どもの頃), maanantaina (月曜日に)' },
      { title: 'Translatiivi (-ksi): 変化・言語', description: 'Tulla iloiseksi (嬉しくなる), suomeksi (フィンランド語で), kahdeksi viikoksi (2週間のあいだ)' },
      { title: '段階変化の違い', description: 'Essiivi は常に強階 (tyttönä)、Translatiivi は弱階 (tytöksi)' }
    ],
    table: {
      headers: ['格名', '語尾', '意味', '単語例', '例文'],
      rows: [
        ['Essiivi', '-na / -nä', '〜として（役割・状態）', 'opettajana (教師として)', 'Työskentelen opettajana. (教師として働いています)'],
        ['Essiivi (時間)', '-na / -nä', '〜の時（曜日・時期）', 'perjantaina (金曜日に)', 'Nähdään perjantaina! (金曜日に会おう！)'],
        ['Translatiivi', '-ksi', '〜になる（変化）', 'valmiiksi (完成に)', 'Ruoka tuli valmiiksi. (料理ができあがった)'],
        ['Translatiivi (言語)', '-ksi', '〜語で', 'suomeksi (フィンランド語で)', 'Mitä se on suomeksi? (それはフィンランド語で何？)']
      ]
    },
    examples: [
      { finnish: 'Maanantaina menen lääkäriin.', english: 'On Monday I go to the doctor.', japanese: '月曜日に病院へ行きます。', note: 'maanantai + na (Essiivi)' },
      { finnish: 'Haluaisin tulla opettajaksi.', english: 'I would like to become a teacher.', japanese: '私は教師になりたいです。', note: 'tulla + Translatiivi (-ksi)' },
      { finnish: 'Puhu suomeksi, ole hyvä!', english: 'Speak in Finnish, please!', japanese: 'フィンランド語で話してください！', note: 'suomi ➔ suomeksi' }
    ],
    pitfalls: [
      { title: '「〜になる (tulla)」の後ろは必ず Translatiivi', explanation: 'Hän tuli iloinen ではなく、必ず Hän tuli iloiseksi (Translatiivi: -ksi) とします。' }
    ],
    idioms: [],
    practiceQuiz: [
      {
        type: 'choice',
        question: '「金曜日に」を表す正しい形は？',
        options: ['perjantaina', 'perjantailla', 'perjantaissa'],
        answer: 'perjantaina',
        explanation: '曜日の「〜に」は Essiivi (-na/-nä) を使います。'
      },
      {
        type: 'choice',
        question: '「それはフィンランド語で何ですか？」の「フィンランド語で」は？',
        options: ['suomeksi', 'suomena', 'suomella'],
        answer: 'suomeksi',
        explanation: '言語の表現「〜語で」には Translatiivi (-ksi) を使います。'
      },
      {
        type: 'typing',
        question: '「医師（lääkäri）として働く」の「医師として (Essiivi)」を入力してください。',
        hint: 'lääkäri_____',
        answer: 'lääkärinä',
        explanation: 'Essiivi 語尾は前母音に合わせて -nä になります。'
      },
      {
        type: 'typing',
        question: '「valmis（完成した）」の変化形「完成した状態になる (Translatiivi)」を入力してください。',
        hint: 'valmii_____',
        answer: 'valmiiksi',
        explanation: 'valmis の語幹 valmii- に -ksi を付けて valmiiksi となります。'
      },
      {
        type: 'wordbank',
        question: '「子どもの頃」を意味する語を作ってください。',
        words: ['lapsena', 'lapseksi', 'lapsella', 'lapsessa'],
        answer: 'lapsena',
        explanation: 'lapsi ➔ lapsena (Essiivi: 〜の頃に、〜として)。'
      }
    ]
  },
  {
    id: 'abessiivi_komitatiivi_instruktiivi',
    title: '稀少格・限界格 (Abessiivi, Komitatiivi, Instruktiivi)',
    category: 'cases',
    level: 'B1',
    summary: '頻度は高くないものの文章語や慣用表現で頻出する「〜なしで」「〜と共に」「〜によって」の3つの格。',
    overview: `フィンランド語の15格のうち、最後の3つは日常会話では前置詞・後置詞で代用されることも多いですが、格言や文学、定型表現で極めて重要です。
- **Abessiivi (-tta/-ttä)**: 〜なしで（Without）
- **Komitatiivi (-neen + 所有接尾辞)**: 〜を伴って（Together with）
- **Instruktiivi (-n)**: 〜によって・手段（By means of）`,
    rules: [
      { title: 'Abessiivi (-tta / -ttä)', description: 'ilman（〜なしで）と同等。例: syyttä (理由なしに), rahatta (金なしで)' },
      { title: 'Komitatiivi (-ne- + 所有接尾辞)', description: '必ず複数形で作られ、所有接尾辞が付きます。例: vaimoineen (妻を伴って)' },
      { title: 'Instruktiivi (-n)', description: '主に複数形で手段を表す副詞的表現。例: omin silmin (自分の目で), jalan (歩いて・足で)' }
    ],
    table: {
      headers: ['格名', '接尾辞', '意味', '代表的な使用例'],
      rows: [
        ['Abessiivi', '-tta / -ttä', '〜なしで (without)', 'rahatta (お金なしで), syyttä suotta (何の理由もなく)'],
        ['Komitatiivi', '-ne- + 接尾辞', '〜を伴って (with)', 'perheineen (家族連れで), lapsineen (子連れで)'],
        ['Instruktiivi', '-n (複数形 -in)', '〜で・手段 (by)', 'omin silmin (自分の目で), käsin (手で/手作業で)']
      ]
    },
    examples: [
      { finnish: 'Näin sen omin silmin.', english: 'I saw it with my own eyes.', japanese: '自分の目でそれを見ました。', note: 'oma silmä ➔ omin silmin (Instruktiivi)' },
      { finnish: 'Presidentti saapui puolisoineen.', english: 'The president arrived with his spouse.', japanese: '大統領は配偶者同伴で到着しました。', note: 'puoliso + i + ne + en (Komitatiivi)' },
      { finnish: 'Hän lähti takitta pakkaseen.', english: 'He left without a coat into the freezing cold.', japanese: '彼はコートなしで極寒の外へ出た。', note: 'takki ➔ takitta (Abessiivi)' }
    ],
    pitfalls: [
      { title: 'Abessiivi の代用表現 ilman', explanation: '会話では ilman takkia (ilman + Partitiivi) の方が takitta より自然に使われます。' }
    ],
    idioms: [],
    practiceQuiz: [
      {
        type: 'choice',
        question: '「自分の目で (with own eyes)」を表す慣用表現は？',
        options: ['omin silmin', 'omilla silmillä', 'omista silmistä'],
        answer: 'omin silmin',
        explanation: '手段を表す Instruktiivi 複数形の omin silmin が使われます。'
      },
      {
        type: 'choice',
        question: '「お金なしで（Abessiivi）」を表す語はどれ？',
        options: ['rahatta', 'rahaksi', 'rahana'],
        answer: 'rahatta',
        explanation: '「〜なしで」の Abessiivi 語尾は -tta / -ttä なので rahatta です。'
      },
      {
        type: 'typing',
        question: '「歩いて（徒歩で）」を意味する単語（jalkaの手段格）を入力してください。',
        hint: 'ja_____',
        answer: 'jalan',
        explanation: 'jalka ➔ jalan は「徒歩で」を意味する極めて一般的な Instruktiivi 由来の副詞です。'
      },
      {
        type: 'typing',
        question: '「手作業で・手で（käsiの複数手段格）」を入力してください。',
        hint: 'kä_____',
        answer: 'käsin',
        explanation: 'käsi ➔ käsin は「手作業で/手で」を意味します。'
      },
      {
        type: 'wordbank',
        question: '「大統領は家族連れで到着した」を完成させてください。',
        words: ['Presidentti saapui perheineen', 'Presidentti saapui perheellä', 'Presidentti saapui perheeksi'],
        answer: 'Presidentti saapui perheineen',
        explanation: 'Komitatiivi 形 perheineen（家族を伴って）。'
      }
    ]
  },
  {
    id: 'monikon_sijamuodot',
    title: '複数形の格変化 (Monikon sijamuodot)',
    category: 'cases',
    level: 'B1',
    summary: 'フィンランド語学習の最高峰。複数分格 (-ja/-ita)、複数属格 (-jen/-iden)、複数位置格 (-i-) の体系的ルール。',
    overview: `フィンランド語の複数格変化では、語幹と格語尾の間に **複数マーカー「-i-」** が挿入されます。
母音衝突によって語幹の最後の母音が脱落したり変化したりするため、ルールを体系的に覚えることが不可欠です。`,
    rules: [
      { title: '複数マーカー -i-', description: '単数: talo-ssa ➔ 複数: talo-i-ssa (家々の中で)' },
      { title: '語末母音の脱落 (a, ä, e)', description: 'kala ➔ kaloissa (a➔o), leipä ➔ leivissä (ä脱落), kieli ➔ kielissä' },
      { title: '複数分格 (-ja/-jä vs -ita/-itä)', description: '短い単語: kirjoja, taloja / 長い単語・子音語幹: huoneita, kalliita' },
      { title: '複数属格 (-jen vs -iden/-itten)', description: 'talojen, kirjojen / maiden, perheiden' }
    ],
    table: {
      headers: ['単語 (単数主格)', '複数主格 (-t)', '複数分格', '複数位置格 (Inessiivi: -issa)', '複数属格'],
      rows: [
        ['talo (家)', 'talot', 'taloja', 'taloissa', 'talojen'],
        ['kirja (本)', 'kirjat', 'kirjoja', 'kirjoissa', 'kirjojen'],
        ['omena (リンゴ)', 'omenat', 'omenoita / omenoja', 'omenoissa', 'omenoiden / omenien'],
        ['maa (国)', 'maat', 'maita', 'maissa', 'maiden'],
        ['kaupunki (都市)', 'kaupungit', 'kaupunkeja', 'kaupungeissa', 'kaupunkien']
      ]
    },
    examples: [
      { finnish: 'Suomessa on tuhansia järviä.', english: 'In Finland there are thousands of lakes.', japanese: 'フィンランドには何千もの湖があります。', note: 'järvi ➔ järviä (複数分格)' },
      { finnish: 'Asun vanhoissa taloissa.', english: 'I live in old houses.', japanese: '私は古い家々に住んでいます。', note: 'vanhoissa taloissa (複数Inessiivi)' },
      { finnish: 'Näen paljon opiskelijoita.', english: 'I see many students.', japanese: 'たくさんの学生たちが見えます。', note: 'paljon + 複数分格 opiskelijoita' }
    ],
    pitfalls: [
      { title: '単数分格と複数分格の使い分け', explanation: 'vähän maitoa (少量の牛乳: 不可算単数分格) vs paljon kirjoja (たくさんの本: 可算名詞の複数は複数分格)。' }
    ],
    idioms: [],
    practiceQuiz: [
      {
        type: 'choice',
        question: '「talo（家）」の複数位置格「家々の中で」はどれ？',
        options: ['taloissa', 'talossa', 'taloilla', 'taloista'],
        answer: 'taloissa',
        explanation: '語幹 talo に複数マーカー -i- と -ssa が合体して taloissa となります。'
      },
      {
        type: 'choice',
        question: '「kirja（本）」の複数分格（たくさんの本: kirjoja）の語尾はどれ？',
        options: ['kirjoja', 'kirjata', 'kirjoita'],
        answer: 'kirjoja',
        explanation: 'a ➔ o に変化し、-ja を付けて kirjoja となります。'
      },
      {
        type: 'typing',
        question: '「maa（国）」の複数分格を入力してください。',
        hint: 'mai_____',
        answer: 'maita',
        explanation: '長母音語幹 maa に -i- と -ta が付き maita となります。'
      },
      {
        type: 'typing',
        question: '「talo（家）」の複数属格（家々の: -jen）を入力してください。',
        hint: 'talo_____',
        answer: 'talojen',
        explanation: '複数属格は talojen となります。'
      },
      {
        type: 'wordbank',
        question: '「たくさんの湖」を作ってください。',
        words: ['paljon järviä', 'paljon järvet', 'paljon järvien'],
        answer: 'paljon järviä',
        explanation: 'paljon + 複数分格 järviä。'
      }
    ]
  },

  // =========================================================================
  // 3. VERBS & CONJUGATION (VERBIT)
  // =========================================================================
  {
    id: 'verbityypit',
    title: '動詞の6つのタイプ (Verbityypit 1-6)',
    category: 'verbs',
    level: 'A1',
    summary: 'フィンランド語の全動詞は語尾によって6タイプに分類されます。それぞれの現在形語幹の作り方。',
    overview: `フィンランド語の動詞は原形の末尾によって **6つのグループ（Verbityypit）** に分類され、それぞれ活用規則が決まっています。

人称語尾（どのタイプでも共通）：
- minä: **-n**
- sinä: **-t**
- hän: **長母音** (語幹末尾の母音を重ねる)
- me: **-mme**
- te: **-tte**
- he: **-vat / -vät**`,
    rules: [
      { title: 'Type 1 (-a / -ä)', description: '末尾の -a/-ä を取る。Astevaihteluあり。例: puhua ➔ puhun, asua ➔ asun' },
      { title: 'Type 2 (-da / -dä)', description: '末尾の -da/-dä を取る。Astevaihteluなし！例: syödä ➔ syön, juoda ➔ juon' },
      { title: 'Type 3 (-la/-lä, -na/-nä, -ra/-rä, -sta/-stä)', description: '子音語尾を取り -e- を補う。例: tulla ➔ tulen, opiskella ➔ opiskelen' },
      { title: 'Type 4 (-ata / -ätä, -ota / -ötä, -uta / -ytä)', description: '末尾の -t を取り母音を重ねる（逆Astevaihtelu）。例: tavata ➔ tapaan' },
      { title: 'Type 5 (-ita / -itä)', description: '末尾の -ta/-tä を取り -itse- を補う。例: tarvita ➔ tarvitsen' },
      { title: 'Type 6 (-eta / -etä)', description: '末尾の -ta/-tä を取り -ene- を補う。例: vanheta ➔ vanhenen' }
    ],
    table: {
      headers: ['タイプ', '辞書形（原形）の末尾', '語幹の作り方', '例 (原形 ➔ minä形)'],
      rows: [
        ['Type 1', '-a / -ä', '-a/-ä を削除', 'puhua ➔ puhun'],
        ['Type 2', '-da / -dä', '-da/-dä を削除', 'syödä ➔ syön'],
        ['Type 3', '-lla / -nna / -rra / -sta', '子音末尾を落とし -e- 追加', 'tulla ➔ tulen / opiskella ➔ opiskelen'],
        ['Type 4', '-ata / -ota / -uta', '-t を落とし母音同化 (逆Astevaihtelu)', 'haluta ➔ haluan / tavata ➔ tapaan'],
        ['Type 5', '-ita / -itä', '-ta/-tä を落とし -itse- 追加', 'tarvita ➔ tarvitsen / häiritä ➔ häiritsen'],
        ['Type 6', '-eta / -etä', '-ta/-tä を落とし -ene- 追加', 'vanheta ➔ vanhenen / kylmetä ➔ kylmenen']
      ]
    },
    examples: [
      { finnish: 'Minä puhun suomea ja englantia.', english: 'I speak Finnish and English.', japanese: '私はフィンランド語と英語を話します。', note: 'Type 1: puhua ➔ puhun' },
      { finnish: 'Mitä sinä syöt aamiaiseksi?', english: 'What do you eat for breakfast?', japanese: '朝食に何を食べますか？', note: 'Type 2: syödä ➔ syöt' },
      { finnish: 'Me tulemme huomenna kotiin.', english: 'We will come home tomorrow.', japanese: '私たちは明日家に帰ります。', note: 'Type 3: tulla ➔ tulemme' }
    ],
    pitfalls: [
      { title: 'hän (3人称単数) の母音長音化', explanation: 'Type 1・3などでは、hän puhuu (uが重なる), hän tulee (eが重なる) のように最後の母音が伸びます。' }
    ],
    idioms: [],
    practiceQuiz: [
      {
        type: 'choice',
        question: '動詞「puhua（話す: Type 1）」の minä（私）の活用形はどれ？',
        options: ['puhun', 'puhut', 'puhuu', 'puhumme'],
        answer: 'puhun',
        explanation: 'puhua ➔ puhu- + n ➔ puhun です。'
      },
      {
        type: 'choice',
        question: '動詞「syödä（食べる: Type 2）」の hän（彼/彼女）の活用形はどれ？',
        options: ['syö', 'syöpi', 'syöt', 'syövät'],
        answer: 'syö',
        explanation: 'Type 2 の 3人称単数は語幹そのままで syö となります。'
      },
      {
        type: 'typing',
        question: '動詞「tulla（来る: Type 3）」の minä（私）の活用形を入力してください。',
        hint: 'tul_____',
        answer: 'tulen',
        explanation: 'Type 3 は末尾の子音を取って -e- を補うため tulen となります。'
      },
      {
        type: 'typing',
        question: '動詞「tavata（会う: Type 4）」の minä（私）の活用形を入力してください。',
        hint: 'tap_____',
        answer: 'tapaan',
        explanation: 'Type 4 は逆段階変化（v➔p）が起きて tapaan となります。'
      },
      {
        type: 'wordbank',
        question: '「私たちは勉強します」を選んでください。',
        words: ['Me opiskelemme', 'Me opiskelen', 'Me opiskelette'],
        answer: 'Me opiskelemme',
        explanation: 'opiskella (Type 3) ➔ me opiskelemme。'
      }
    ]
  },
  {
    id: 'imperfekti',
    title: '過去形 (Imperfekti)',
    category: 'verbs',
    level: 'A2',
    summary: 'フィンランド語の単純過去形。過去マーカー「-i-」の挿入ルールと母音変化。',
    overview: `フィンランド語の過去形（Imperfekti）は、現在形語幹に **過去マーカー「-i-」** を挿入して作ります。
英語の過去形（-ed）と同様、過去の確定した出来事を表します。語幹末尾の母音によって様々な変化（脱落・二重母音化など）が起きます。`,
    rules: [
      { title: '過去マーカー -i-', description: 'puhun ➔ puhu-i-n ➔ puhuin (話した)' },
      { title: '単母音 a, ä, e の脱落', description: 'ostaa (ostan) ➔ ostin (aが脱落), ottaa ➔ otin' },
      { title: '否定過去形', description: '否定動詞 + 動詞タイプに応じた NUT/NEET形 (En puhunut / Emme puhuneet)' }
    ],
    table: {
      headers: ['動詞原形', '現在形 (minä)', '過去形 (minä)', '否定過去形 (en...)', '意味'],
      rows: [
        ['puhua (Type 1)', 'puhun', 'puhuin', 'en puhunut', '話した'],
        ['ostaa (Type 1)', 'ostan', 'ostin', 'en ostanut', '買った (a脱落)'],
        ['syödä (Type 2)', 'syön', 'söin', 'en syönyt', '食べた (yö➔ö)'],
        ['tulla (Type 3)', 'tulen', 'tulin', 'en tullut', '来た'],
        ['tavata (Type 4)', 'tapaan', 'tapasin', 'en tavannut', '会った']
      ]
    },
    examples: [
      { finnish: 'Eilen minä ostin uuden puhelimen.', english: 'Yesterday I bought a new phone.', japanese: '昨日、私は新しいスマートフォンを買いました。', note: 'ostaa ➔ ostin' },
      { finnish: 'Me emme nähneet häntä.', english: 'We didn’t see him/her.', japanese: '私たちは彼/彼女を見かけませんでした。', note: '否定過去: emme nähneet' },
      { finnish: 'Mitä sinä teit viikonloppuna?', english: 'What did you do on the weekend?', japanese: '週末は何をしましたか？', note: 'tehdä ➔ teit' }
    ],
    pitfalls: [
      { title: '否定過去形は -i- ではなく NUT/NEET！', explanation: 'En puhuin は間違いです！否定過去形は必ず「En puhunut（単数）」/「Emme puhuneet（複数）」になります。' }
    ],
    idioms: [],
    practiceQuiz: [
      {
        type: 'choice',
        question: '「ostaa（買う）」の minä（私）の過去形（買った）はどれ？',
        options: ['ostin', 'ostain', 'ostan', 'ostanut'],
        answer: 'ostin',
        explanation: 'a が脱落して -i- が付き ostin となります。'
      },
      {
        type: 'choice',
        question: '「私は話さなかった（否定過去）」を表す正しい文は？',
        options: ['En puhunut.', 'En puhuin.', 'En puhua.'],
        answer: 'En puhunut.',
        explanation: '否定過去形は否定動詞 + NUT形（puhunut）になります。'
      },
      {
        type: 'typing',
        question: '動詞「puhua（話す）」の過去形「私は話した」を入力してください。',
        hint: 'puhu_____',
        answer: 'puhuin',
        explanation: 'puhu- + i + n ➔ puhuin です。'
      },
      {
        type: 'typing',
        question: '動詞「tulla（来る）」の過去形「彼は来た（hän）」を入力してください。',
        hint: 'tul_____',
        answer: 'tuli',
        explanation: 'tulla の過去形3人称単数は tuli となります。'
      },
      {
        type: 'wordbank',
        question: '「昨日私は本を読んだ」を完成させてください。',
        words: ['Eilen luin kirjan', 'Eilen luen kirjan', 'Eilen luin kirjaa'],
        answer: 'Eilen luin kirjan',
        explanation: 'lukea ➔ luin (k➔脱落 + i)。'
      }
    ]
  },
  {
    id: 'perfekti_pluskvamperfekti',
    title: '現在完了と過去完了 (Perfekti & Pluskvamperfekti)',
    category: 'verbs',
    level: 'A2',
    summary: '「〜したことがある」「〜してしまった」。olla動詞 + 過去分詞（-nut/-neet）の完了体系。',
    overview: `**Perfekti（現在完了形）**: **olla動詞の現在形 + NUT/NEET分詞**
「〜したことがある（経験）」や「（過去の行為が現在に影響している）〜してしまった」を表します。
**Pluskvamperfekti（過去完了形）**: **olla動詞の過去形 (olin/olit/oli...) + NUT/NEET分詞**
過去のある時点よりも前に完了していた動作を表します。`,
    rules: [
      { title: 'Perfekti の構造', description: 'Olen asunut (住んだことがある), Oletko käynyt? (行ったことがありますか？)' },
      { title: 'Pluskvamperfekti の構造', description: 'Hän oli jo lähtenyt, kun saavuin. (私が到着した時、彼はすでに出発していた)' },
      { title: '分詞の一致', description: '主語が単数なら -nut/-nyt、複数（me, te, he）なら -neet/-neet' }
    ],
    table: {
      headers: ['人称', 'Perfekti (現在完了)', 'Pluskvamperfekti (過去完了)', '否定形 (現在完了)'],
      rows: [
        ['minä', 'olen oppinut', 'olin oppinut', 'en ole oppinut'],
        ['sinä', 'olet oppinut', 'olit oppinut', 'et ole oppinut'],
        ['hän', 'on oppinut', 'oli oppinut', 'ei ole oppinut'],
        ['me', 'olemme oppineet', 'olimme oppineet', 'emme ole oppineet'],
        ['he', 'ovat oppineet', 'olivat oppineet', 'eivät ole oppineet']
      ]
    },
    examples: [
      { finnish: 'Oletko koskaan käynyt Suomessa?', english: 'Have you ever visited Finland?', japanese: 'フィンランドを訪れたことがありますか？', note: '経験を尋ねる定番表現' },
      { finnish: 'En ole vielä syönyt lounasta.', english: 'I haven’t eaten lunch yet.', japanese: 'まだ昼食を食べていません。', note: '否定完了: en ole syönyt' },
      { finnish: 'Juna oli jo mennyt.', english: 'The train had already left.', japanese: '電車はすでに行ってしまっていた。', note: '過去完了 oli mennyt' }
    ],
    pitfalls: [
      { title: '主語の単数・複数による分詞語尾の一致', explanation: 'me の場合は olemme asunut ではなく、必ず複数分詞の olemme asuneet になります。' }
    ],
    idioms: [],
    practiceQuiz: [
      {
        type: 'choice',
        question: '「私たちはフィンランドに住んだことがある」を表す正しい文は？',
        options: ['Olemme asuneet Suomessa.', 'Olemme asunut Suomessa.', 'Ovat asuneet Suomessa.'],
        answer: 'Olemme asuneet Suomessa.',
        explanation: '主語が複数（me）なので分詞は複数形 -neet（asuneet）になります。'
      },
      {
        type: 'choice',
        question: '「私はまだそれを読んでいない（否定完了）」を表す文は？',
        options: ['En ole lukenut sitä.', 'En ole luki sitä.', 'En lukenut sitä.'],
        answer: 'En ole lukenut sitä.',
        explanation: '現在完了の否定は否定動詞 + ole + 分詞（En ole lukenut）です。'
      },
      {
        type: 'typing',
        question: '「Oletko käynyt Lapissa?（ラップランドへ行ったことがありますか？）」の助動詞「oletko」を入力してください。',
        hint: 'olet_____',
        answer: 'oletko',
        explanation: 'olla動詞の2人称単数 olet + 疑問小辞 -ko で oletko です。'
      },
      {
        type: 'typing',
        question: '「電車はすでに行ってしまった（過去完了: oli lähtenyt）」の助動詞「oli」を入力してください: Juna _____ lähtenyt.',
        hint: 'o_____',
        answer: 'oli',
        explanation: '過去完了には olla の過去形 oli を使います。'
      },
      {
        type: 'wordbank',
        question: '「私はそれを聞いたことがある」を作ってください。',
        words: ['Olen kuullut sen', 'Kuulin sen', 'Olin kuullut sen'],
        answer: 'Olen kuullut sen',
        explanation: 'Olen kuullut sen (kuulla ➔ kuullut)。'
      }
    ]
  },
  {
    id: 'konditionaali',
    title: '条件法 (Konditionaali: -isi-)',
    category: 'verbs',
    level: 'B1',
    summary: '「もし〜なら…だろう」という仮定法や、「〜していただけますか？」という丁寧表現を作る「-isi-」マーカー。',
    overview: `フィンランド語の条件法（Konditionaali）は、動詞語幹に **-isi-** を挟んで作ります。
英語の would / could / should や 仮定法過去に相当します。

主な用途：
1. **仮定・条件文**: Jos minulla olisi rahaa, ostaisin auton. (もしお金があれば車を買うのに)
2. **丁寧な依頼・願望**: Haluaisin kahvia. (コーヒーをいただきたいのですが / Saisinko...?)`,
    rules: [
      { title: 'マーカー -isi-', description: 'puhu- + isi + n ➔ puhuisin (話すだろうに / 話したいのですが)' },
      { title: '丁寧な依頼', description: 'Voisitko auttaa minua? (手伝っていただけますか？: Voitko より丁寧)' },
      { title: 'Jos... olisi, niin... -isi-', description: '条件節（Jos）も主節も両方に -isi- を使うのがフィンランド語の特徴です！' }
    ],
    table: {
      headers: ['人称', 'puhua (話す)', 'olla (〜である)', 'syödä (食べる)', 'haluta (欲しい)'],
      rows: [
        ['minä', 'puhuisin', 'olisin', 'söisin', 'haluaisin'],
        ['sinä', 'puhuisit', 'olisit', 'söisit', 'haluaisit'],
        ['hän', 'puhuisi', 'olisi', 'söisi', 'haluaisi'],
        ['me', 'puhuisimme', 'olisimme', 'söisimme', 'haluaisimme'],
        ['he', 'puhuisivat', 'olisivat', 'söisivät', 'haluaisivat']
      ]
    },
    examples: [
      { finnish: 'Haluaisin varata pöydän kahdelle.', english: 'I would like to book a table for two.', japanese: '2名でテーブルを予約したいのですが。', note: 'haluta ➔ haluaisin (丁寧な願望)' },
      { finnish: 'Voisitko sulkea ikkunan?', english: 'Could you close the window?', japanese: '窓を閉めていただけますか？', note: 'voida ➔ voisitko' },
      { finnish: 'Jos minulla olisi aikaa, matkustaisin Lappiin.', english: 'If I had time, I would travel to Lapland.', japanese: 'もし時間があれば、ラップランドへ旅行するのに。', note: '両方の節に -isi- が入る' }
    ],
    pitfalls: [
      { title: '英語と違い、条件節（if節）にも -isi- を使う！', explanation: '英語の If I had (過去形)... と異なり、フィンランド語では Jos minulla olisi (条件法)... と両方に -isi- が入ります。' }
    ],
    idioms: [],
    practiceQuiz: [
      {
        type: 'choice',
        question: 'レストランで「コーヒーをいただきたいのですが」と丁寧に頼む表現は？',
        options: ['Haluaisin kahvia.', 'Haluan kahvia.', 'Haluatko kahvia.'],
        answer: 'Haluaisin kahvia.',
        explanation: 'haluta の条件法1人称 haluaisin で丁寧な「〜したいのですが」になります。'
      },
      {
        type: 'choice',
        question: '「Voisitko auttaa?」の丁寧さはどのニュアンス？',
        options: ['手伝っていただけますか？', '手伝え！', '手伝うことができるか？'],
        answer: '手伝っていただけますか？',
        explanation: 'voida（〜できる）の条件法 voisitko は丁寧な依頼（Could you...?）です。'
      },
      {
        type: 'typing',
        question: '動詞「olla」の条件法3人称単数「もし〜なら（〜だろう）」を入力してください: Jos minulla _____',
        hint: 'oli_____',
        answer: 'olisi',
        explanation: 'olla の条件法は olisi です。'
      },
      {
        type: 'typing',
        question: '「haluta」の条件法1人称「私は〜したいのですが」を入力してください。',
        hint: 'haluai_____',
        answer: 'haluaisin',
        explanation: 'haluta ➔ haluaisin です。'
      },
      {
        type: 'wordbank',
        question: '「手伝っていただけますか？」を完成させてください。',
        words: ['Voisitko auttaa minua', 'Voitko auttaa minua', 'Voisit auttaa minua'],
        answer: 'Voisitko auttaa minua',
        explanation: 'Voisitko auttaa minua? (条件法による丁寧表現)。'
      }
    ]
  },
  {
    id: 'imperatiivi',
    title: '命令法 (Imperatiivi)',
    category: 'verbs',
    level: 'A2',
    summary: '指示・命令・依頼・禁止を表す表現。「〜しなさい」「〜しないで（Älä!）」。',
    overview: `フィンランド語の命令法（Imperatiivi）は、親しい相手への指示（sinä命令）と、複数・丁寧な相手への指示（te命令）で形が異なります。
禁止（〜するな）には **否定命令動詞 älä / älkää** を使います。`,
    rules: [
      { title: 'sinä 命令（単数）', description: '動詞の minä活用形から末尾の -n を取るだけ！例: sanon ➔ Sano! (言いなさい！)' },
      { title: 'te 命令（複数・丁寧）', description: '辞書形の語幹 + -kaa/-kää。例: Tulkaa! (来てください！)' },
      { title: '禁止命令（〜しないで）', description: '単数: Älä + 語幹 (Älä mene!), 複数: Älkää + -ko/-kö (Älkää menkö!)' }
    ],
    table: {
      headers: ['動詞原形', '肯定命令 (sinä: 単数)', '肯定命令 (te: 複数/丁寧)', '禁止命令 (単数: Älä...)'],
      rows: [
        ['tulla (来る)', 'Tule!', 'Tulkaa!', 'Älä tule!'],
        ['ottaa (取る)', 'Ota!', 'Ottakaa!', 'Älä ota!'],
        ['odottaa (待つ)', 'Odota!', 'Odottakaa!', 'Älä odota!'],
        ['syödä (食べる)', 'Syö!', 'Syökää!', 'Älä syö!'],
        ['mennä (行く)', 'Mene!', 'Menkää!', 'Älä mene!']
      ]
    },
    examples: [
      { finnish: 'Ole hyvä!', english: 'Here you are / Please!', japanese: 'どうぞ！ / どういたしまして！', note: 'olla ➔ Ole (命令形)' },
      { finnish: 'Kuuntele tarkasti!', english: 'Listen carefully!', japanese: 'よく聴きなさい！', note: 'kuunnella ➔ Kuuntele!' },
      { finnish: 'Älä unohda avaimia!', english: 'Don’t forget the keys!', japanese: '鍵を忘れないで！', note: 'Älä + unohda' }
    ],
    pitfalls: [
      { title: '禁止命令の te形に注意', explanation: 'Älkää menkää ではなく、Älkää menkö! のように -ko/-kö 形になります。' }
    ],
    idioms: [],
    practiceQuiz: [
      {
        type: 'choice',
        question: '動詞「tulla（来る）」の親しい相手への命令「来て！（Come!）」はどれ？',
        options: ['Tule!', 'Tulen!', 'Tulkaa!'],
        answer: 'Tule!',
        explanation: 'minä形の tulen から -n を取って Tule! となります。'
      },
      {
        type: 'choice',
        question: '「行かないで！（Don’t go!）」の単数禁止命令はどれ？',
        options: ['Älä mene!', 'Älä menen!', 'Ei mene!'],
        answer: 'Älä mene!',
        explanation: '単数禁止命令は Älä + 語幹（mene）です。'
      },
      {
        type: 'typing',
        question: '動詞「odottaa（待つ）」の命令形「待って！（Wait!）」を入力してください。',
        hint: 'Odo_____',
        answer: 'Odota',
        explanation: 'odotan から -n を取り、弱階化して Odota! となります。'
      },
      {
        type: 'typing',
        question: '動詞「ottaa（取る）」の命令形「取って！（Take!）」を入力してください。',
        hint: 'O_____',
        answer: 'Ota',
        explanation: 'otan から -n を取って Ota! です。'
      },
      {
        type: 'wordbank',
        question: '「どうぞ！（Please / Here you go）」を作ってください。',
        words: ['Ole hyvä', 'Ole hyvää', 'Olkaa hyvä'],
        answer: 'Ole hyvä',
        explanation: 'Ole hyvä! (どうぞ)。'
      }
    ]
  },
  {
    id: 'passiivi',
    title: '受動態 (Passiivi)',
    category: 'verbs',
    level: 'B1',
    summary: '「〜される」だけでなく、日常会話で「私たち（Me）」の主語や「〜しよう」の勧誘として最も使われる最重要文法。',
    overview: `フィンランド語の **受動態（Passiivi）** は、動作主を特定しない表現（「人が〜する」「〜される」）です。
しかし現代フィンランド語では、それ以上に**「口語における me（私たち）の代用」**および**「勧誘（Mennään! = 行こう！）」**として毎日の会話で最も頻出する文法形です。`,
    rules: [
      { title: '現在受動態の作り方', description: '動詞タイプによって -(t)aan / -(t)ään を付けます。例: puhutaan, syödään, mennään' },
      { title: '会話での「私たち (me)」', description: 'Me puhumme (書き言葉) ➔ Me puhutaan (口語：受動態を使う)' },
      { title: '勧誘表現 (〜しよう！)', description: 'Mennään! (行こう！), Syödään! (食べよう！)' }
    ],
    table: {
      headers: ['動詞原形', '受動態現在形', '文語の me表現', '口語の me表現 (受動態同形)'],
      rows: [
        ['puhua (Type 1)', 'puhutaan', 'Me puhumme', 'Me puhutaan'],
        ['syödä (Type 2)', 'syödään', 'Me syömme', 'Me syödään'],
        ['mennä (Type 3)', 'mennään', 'Me menemme', 'Me mennään'],
        ['tavata (Type 4)', 'tavataan', 'Me tapaamme', 'Me tavataan']
      ]
    },
    examples: [
      { finnish: 'Suomessa puhutaan suomea ja ruotsia.', english: 'In Finland, Finnish and Swedish are spoken.', japanese: 'フィンランドではフィンランド語とスウェーデン語が話されています。', note: '本来の受動態' },
      { finnish: 'Mennäänkö kahville?', english: 'Shall we go for coffee?', japanese: 'コーヒーでも飲みに行かない？', note: '勧誘の定番フレーズ' },
      { finnish: 'Nähdään huomenna!', english: 'See you tomorrow!', japanese: 'また明日会おうね！', note: 'nähdään (受動態 ➔ また会おう)' }
    ],
    pitfalls: [
      { title: '口語での me と受動態', explanation: '日常会話で Me menemme と言うと非常に堅苦しく聞こえます。ほとんどのネイティブは Me mennään と受動態を使います。' }
    ],
    idioms: [],
    practiceQuiz: [
      {
        type: 'choice',
        question: '「またね！/ また会おう！（See you!）」の定番挨拶表現は？',
        options: ['Nähdään!', 'Näemme!', 'Nähdä!'],
        answer: 'Nähdään!',
        explanation: 'nähdä の受動態 Nähdään! で「また会いましょう」の挨拶になります。'
      },
      {
        type: 'choice',
        question: '「行こう！（Let’s go!）」を表す受動態フレーズは？',
        options: ['Mennään!', 'Menemme!', 'Mene!'],
        answer: 'Mennään!',
        explanation: 'mennä の受動態 Mennään! は「行こう！」の勧誘です。'
      },
      {
        type: 'typing',
        question: '動詞「puhua（話す）」の受動態（話される）を入力してください。',
        hint: 'puhu_____',
        answer: 'puhutaan',
        explanation: 'puhua ➔ puhutaan です。'
      },
      {
        type: 'typing',
        question: '動詞「syödä（食べる）」の受動態（食べられる / 食べよう）を入力してください。',
        hint: 'syö_____',
        answer: 'syödään',
        explanation: 'syödä ➔ syödään です。'
      },
      {
        type: 'wordbank',
        question: '「明日会おう！」を作ってください。',
        words: ['Nähdään huomenna', 'Näemme huomenna', 'Nähdä huomenna'],
        answer: 'Nähdään huomenna',
        explanation: 'Nähdään huomenna! (また明日！)。'
      }
    ]
  },
  {
    id: 'infinitiivit',
    title: '不定詞体系 (1st, 2nd, 3rd Infinitiivit: -maan, -massa, -masta)',
    category: 'verbs',
    level: 'B1',
    summary: '「〜しに行く」「〜している最中」「〜するのをやめる」。第1・第2・第3不定詞の使い分け。',
    overview: `フィンランド語の動詞には複数の不定詞（Infinitiivit）があります。
特に**第3不定詞（MA-infinitiivi）**は位置格語尾と結びつき、動作の方向性を表す極めて頻出の文法です：
- **-maan / -mään (Illatiivi)**: 〜しに行く (Menen syömään)
- **-massa / -mässä (Inessiivi)**: 〜している最中だ (Olen syömässä)
- **-masta / -mästä (Elatiivi)**: 〜して帰ってきた・〜するのをやめる (Tulen syömästä)`,
    rules: [
      { title: '第3不定詞: -maan (へ)', description: '移動動詞（mennä, lähteä）の後に付き「〜しに行く」を表す' },
      { title: '第3不定詞: -massa (中で)', description: 'olla動詞の後に付き「〜している最中（進行中）」を表す' },
      { title: '第3不定詞: -masta (から)', description: '「〜から帰る」「〜するのをやめる（lakata）」の後に付く' },
      { title: '第1不定詞の変格 (-kse- + 接尾辞)', description: 'oppiakseni (私が学ぶために: 目的を表す表現)' }
    ],
    table: {
      headers: ['不定詞形', '語尾', '役割', '例文', '日本語訳'],
      rows: [
        ['第3不定詞 Illatiivi', '-maan / -mään', '〜しに行く（移動先）', 'Menen nukkumaan.', '寝に行きます。'],
        ['第3不定詞 Inessiivi', '-massa / -mässä', '〜している最中', 'Olen syömässä.', '今ご飯を食べているところです。'],
        ['第3不定詞 Elatiivi', '-masta / -mästä', '〜して来る / やめる', 'Tulen uimasta.', '泳いできたところです。'],
        ['第3不定詞 Adessiivi', '-malla / -mällä', '〜することによって (手段)', 'Lukemalla oppii.', '読むことによって学べる。']
      ]
    },
    examples: [
      { finnish: 'Menen kauppaan ostamaan ruokaa.', english: 'I am going to the store to buy food.', japanese: '食べ物を買いに店へ行きます。', note: 'ostamaan (第3不定詞: 目的)' },
      { finnish: 'Hän on kirjastossa opiskelemassa.', english: 'He is in the library studying.', japanese: '彼は図書館で勉強している最中です。', note: 'opiskelemassa (第3不定詞: 進行)' },
      { finnish: 'Tulen juuri juoksemasta.', english: 'I just came from running.', japanese: 'ちょうど走ってきたところです。', note: 'juoksemasta (第3不定詞: 起点)' }
    ],
    pitfalls: [
      { title: 'mennä の後ろは動詞原形ではなく -maan！', explanation: '英語の go to eat につられて Menen syödä と言うのは誤りです。必ず Menen syömään と第3不定詞にします。' }
    ],
    idioms: [],
    practiceQuiz: [
      {
        type: 'choice',
        question: '「寝に行く（Go to sleep）」の正しいフィンランド語は？',
        options: ['Menen nukkumaan.', 'Menen nukkua.', 'Menen nukkumassa.'],
        answer: 'Menen nukkumaan.',
        explanation: 'mennä（行く）の後ろは「〜しに行く」を表す第3不定詞 -maan（nukkumaan）です。'
      },
      {
        type: 'choice',
        question: '「今食べている最中です（進行中）」を表す文は？',
        options: ['Olen syömässä.', 'Olen syömään.', 'Olen syömästä.'],
        answer: 'Olen syömässä.',
        explanation: 'olla + -massa（Inessiivi）で「〜の最中だ」を表します。'
      },
      {
        type: 'typing',
        question: '「syödä（食べる）」の第3不定詞「食べに行く (-maan)」を入力してください: Menen _____',
        hint: 'syö_____',
        answer: 'syömään',
        explanation: 'syödä ➔ 前母音語尾 -mään で syömään です。'
      },
      {
        type: 'typing',
        question: '「ostaa（買う）」の第3不定詞「買いに行く (-maan)」を入力してください: Menen _____',
        hint: 'osta_____',
        answer: 'ostamaan',
        explanation: 'ostaa ➔ ostamaan です。'
      },
      {
        type: 'wordbank',
        question: '「泳いで帰ってきたところです」を作ってください。',
        words: ['Tulen uimasta', 'Tulen uimaan', 'Tulen uimassa'],
        answer: 'Tulen uimasta',
        explanation: 'Tulen uimasta (-masta: 起点)。'
      }
    ]
  },
  {
    id: 'partisiipit',
    title: '分詞と分詞構文 (Partisiipit & Lauseenvastikkeet)',
    category: 'verbs',
    level: 'B2',
    summary: '名詞を修飾する形容詞的用法や、接続詞節を短縮する高度な表現（VA分詞、NUT分詞、MA分詞）。',
    overview: `フィンランド語の分詞（Partisiipit）は、動詞から派生して名詞を修飾する役割を持ちます。
1. **現在能動分詞 (VA-partisiippi)**: 〜している… (nukkuva lapsi = 眠っている子ども)
2. **過去能動分詞 (NUT-partisiippi)**: 〜した… (lähtenyt juna = 出発した列車)
3. **動名詞・受動的修飾 (MA-partisiippi)**: 〜されるべき / 〜された… (syötävä omena = 食べられるリンゴ / ostamani kirja = 私の買った本)`,
    rules: [
      { title: 'VA分詞 (-va / -vä)', description: '現在能動進行を表す。例: laulava lintu (歌っている鳥)' },
      { title: 'NUT分詞 (-nut / -nyt)', description: '過去完了を表す。例: pudonnut lehti (落ちた葉)' },
      { title: 'MA分詞 + 所有接尾辞', description: '関係代名詞の代用。例: äidin tekemä ruoka (母が作った料理)' }
    ],
    table: {
      headers: ['分詞の種類', '接尾辞', '意味', '例'],
      rows: [
        ['現在能動 (VA分詞)', '-va / -vä', '〜している', 'itkevä lapsi (泣いている子ども)'],
        ['過去能動 (NUT分詞)', '-nut / -nyt', '〜した', 'väsynyt mies (疲れた男)'],
        ['エージェント分詞 (MA分詞)', '-ma / -mä', '〜によって作られた/された', 'minun ostamani kirja (私が買った本)'],
        ['現在受動分詞', '-tava / -tävä', '〜されるべき / 〜できる', 'juotava vesi (飲用できる水)']
      ]
    },
    examples: [
      { finnish: 'Tämä on äitini tekemää ruokaa.', english: 'This is food made by my mother.', japanese: 'これは母が作った料理です。', note: 'äitini tekemä (MA分詞)' },
      { finnish: 'Onko vesi juotavaa?', english: 'Is the water drinkable?', japanese: 'この水は飲めますか？', note: 'juotava (飲める・飲まれるべき)' },
      { finnish: 'Näin kadulla juoksevan koiran.', english: 'I saw a dog running on the street.', japanese: '私は通りを走っている犬を見ました。', note: 'juokseva koira (VA分詞)' }
    ],
    pitfalls: [
      { title: '分詞も修飾する名詞に合わせて格変化する！', explanation: 'nukkuva lapsi (主格) ➔ nukkuvalle lapselle (Allatiivi) のように分詞自体も格変化します。' }
    ],
    idioms: [],
    practiceQuiz: [
      {
        type: 'choice',
        question: '「飲用できる水（drinkable water）」を表す分詞表現はどれ？',
        options: ['juotava vesi', 'juova vesi', 'juonut vesi'],
        answer: 'juotava vesi',
        explanation: '「〜できる/〜されるべき」を表す現在受動分詞は juotava です。'
      },
      {
        type: 'choice',
        question: '「眠っている子ども（sleeping child）」を表すVA分詞表現はどれ？',
        options: ['nukkuva lapsi', 'nukkunut lapsi', 'nukkuma lapsi'],
        answer: 'nukkuva lapsi',
        explanation: '現在進行で名詞を修飾するVA分詞は nukkuva です。'
      },
      {
        type: 'typing',
        question: '「tehdä（作る）」のMA分詞「母が作った料理（äidin _____ ruoka）」を入力してください。',
        hint: 'teke_____',
        answer: 'tekemä',
        explanation: 'tehdä のエージェント分詞形は tekemä です。'
      },
      {
        type: 'typing',
        question: '「syödä（食べる）」の受動分詞「食べられる（edible）」を入力してください。',
        hint: 'syö_____',
        answer: 'syötävä',
        explanation: 'syödä ➔ syötävä です。'
      },
      {
        type: 'wordbank',
        question: '「私が買った本」を作ってください。',
        words: ['minun ostamani kirja', 'minun ostin kirja', 'minun ostava kirja'],
        answer: 'minun ostamani kirja',
        explanation: 'エージェント分詞構文 minun ostamani kirja です。'
      }
    ]
  },

  // =========================================================================
  // 4. RECTION (REKTIO)
  // =========================================================================
  {
    id: 'rektiot',
    title: '動詞と形容詞の支配 (Rektio)',
    category: 'rection',
    level: 'A2',
    summary: '動詞や形容詞が要求する特定の格（Elatiivi, Illatiivi, Partitiivi, Allatiiviなど）の対応ルール一覧。',
    overview: `フィンランド語の **Rektio（支配）** とは、「ある特定の動詞や形容詞が、後ろに来る名詞の格を指定するルール」のことです。
英語の前置詞（depend ON, listen TO）のように、動詞ごとにどの格語尾を取るかが決まっています。`,
    rules: [
      { title: 'Elatiivi (-sta / -stä) を要求する動詞', description: 'tykätä (好む), pitää (好き), nauttia (楽しむ), haaveilla (夢見る)' },
      { title: 'Illatiivi (-Vn / -seen) を要求する動詞', description: 'rakastua (恋に落ちる), tutustua (知り合う), tottua (慣れる), osallistua (参加する)' },
      { title: 'Partitiivi を要求する動詞', description: 'auttaa (助ける), odottaa (待つ), etsiä (探す), pelätä (恐れる)' },
      { title: 'Allatiivi (-lle) を要求する動詞', description: 'soittaa (電話する), kertoa (伝える), hymyillä (微笑む)' }
    ],
    table: {
      headers: ['要求される格', '代表的な動詞', '例文', '意味'],
      rows: [
        ['Elatiivi (-sta / -stä)', 'tykätä, pitää, nauttia', 'Tykkään kahvista.', 'コーヒーが好きです。'],
        ['Illatiivi (-mihin)', 'rakastua, tutustua, tottua', 'Tutustuin uuteen ystävään.', '新しい友達と知り合いました。'],
        ['Partitiivi', 'auttaa, odottaa, etsiä', 'Voitko auttaa minua?', '私を手伝ってくれますか？'],
        ['Allatiivi (-lle)', 'soittaa, antaa, lainata', 'Soitan äidille illalla.', '夜に母へ電話します。'],
        ['第3不定詞 (-maan)', 'oppia, alkaa, mennä', 'Opin puhumaan suomea.', 'フィンランド語を話せるようになった。']
      ]
    },
    examples: [
      { finnish: 'Minä pidän Suomesta todella paljon.', english: 'I like Finland really much.', japanese: '私はフィンランドが本当に好きです。', note: 'pitää + Elatiivi (-sta)' },
      { finnish: 'Odotan bussia pysäkillä.', english: 'I am waiting for the bus at the stop.', japanese: '停留所でバスを待っています。', note: 'odottaa + Partitiivi (bussia)' },
      { finnish: 'Rakastuin häneen ensi silmäyksellä.', english: 'I fell in love with him/her at first sight.', japanese: '一目で彼/彼女に恋をしました。', note: 'rakastua + Illatiivi (häneen)' }
    ],
    pitfalls: [
      { title: 'auttaa は対格ではなく Partitiivi！', explanation: 'Autan sinut ではなく、必ず Autan sinua (Partitiivi) となります。' }
    ],
    idioms: [],
    practiceQuiz: [
      {
        type: 'choice',
        question: '「Minä tykkään（私は〜が好き）」の後ろに来る「kahvi（コーヒー）」の正しい形は？',
        options: ['kahvista', 'kahvia', 'kahvin', 'kahville'],
        answer: 'kahvista',
        explanation: 'tykätä は Elatiivi (-sta/-stä) を要求するため kahvista となります。'
      },
      {
        type: 'choice',
        question: '「Voitko auttaa（手伝ってくれますか？）」の後ろに来る「minä（私）」の形は？',
        options: ['minua', 'minut', 'minun', 'minulle'],
        answer: 'minua',
        explanation: 'auttaa（助ける）は目的語に Partitiivi を要求するため minua です。'
      },
      {
        type: 'typing',
        question: '「Odotan（私は待っている）」の後ろに来る「bussi（バス: Partitiivi）」を入力してください: Odotan _____',
        hint: 'bussi_____',
        answer: 'bussia',
        explanation: 'odottaa は Partitiivi を要求するため bussia です。'
      },
      {
        type: 'typing',
        question: '「Soitan（電話する）」の後ろに来る「äiti（お母さん: Allatiivi -lle）」を入力してください: Soitan _____',
        hint: 'äidil_____',
        answer: 'äidille',
        explanation: 'soittaa は相手に Allatiivi (-lle) を要求するため äidille です。'
      },
      {
        type: 'wordbank',
        question: '「フィンランドが好きです」を作ってください。',
        words: ['Pidän Suomesta', 'Pidän Suomea', 'Pidän Suomi'],
        answer: 'Pidän Suomesta',
        explanation: 'pitää + Elatiivi (-sta) で Pidän Suomesta。'
      }
    ]
  },

  // =========================================================================
  // 5. IDIOMS & SPOKEN FINNISH (IDIOMIT & PUHEKIELI)
  // =========================================================================
  {
    id: 'idiomit-ja-puhekieli',
    title: '重要イディオム・口語表現（Idiomit & Puhekieli）',
    category: 'idioms',
    level: 'A2',
    summary: 'フィンランド人が日常会話で使う口語短縮ルール（mä, sä, se）、頻出イディオム、相づちや会話表現。',
    overview: `フィンランド語の最大の特徴の一つが、**書記言語（Kirjakieli）** と **話し言葉（Puhekieli）** の大きな乖離です。
会話では代名詞や動詞が大幅に短縮され、イディオム（慣用句）が多用されます。`,
    rules: [
      { title: '代名詞の短縮', description: 'minä ➔ mä, sinä ➔ sä, hän/se ➔ se, me ➔ me, he/ne ➔ ne' },
      { title: '所有表現の口語化', description: 'minun kirjani ➔ mun kirja (私の本), sinun autosi ➔ sun auto' },
      { title: '動詞の短縮と母音脱落', description: 'olen ➔ oon, olet ➔ oot, ei ole ➔ eioo, tulee ➔ tuu, menee ➔ mee' },
      { title: '相づち・つなぎ言葉', description: 'no (ええと), niin (そうだね), joo joo (うんうん), aijaa (へえ！), tota (あのー)' }
    ],
    table: {
      headers: ['書き言葉 (Kirjakieli)', '口語 (Puhekieli)', '日本語訳'],
      rows: [
        ['Minä olen kotona.', 'Mä oon kotona.', '私は家にいます。'],
        ['Mitä sinä teet?', 'Mitä sä teet?', '何してるの？'],
        ['Me menemme kahville.', 'Me mennään kahville.', 'コーヒー飲みに行こう。'],
        ['Minulla ei ole aikaa.', 'Mulla ei oo aikaa.', '時間がありません。'],
        ['Tuletko sinä mukaan?', 'Tuutko sä mukaan?', '一緒に来る？'],
        ['Minä en tiedä.', 'En tiiä. / Enotiä.', '知らないよ。']
      ]
    },
    examples: [
      { finnish: 'Mitä äijä? - Ei kummempia, mitä pienistä!', english: 'What’s up man? - Nothing much!', japanese: '調子どう？ - 別に変わりないよ！', note: '日常会話での親しい挨拶' },
      { finnish: 'Totta kai me lähdetään messiin!', english: 'Of course we are coming along!', japanese: 'もちろんおいらたちも一緒に行くよ！', note: 'messiin = mukaan (一緒に)' },
      { finnish: 'Älä viitti! Ootsä tosissas?', english: 'Come on! Are you serious?', japanese: '冗談でしょ！本気で言ってるの？', note: 'viitsiä ➔ viitti, oletko ➔ ootsä' }
    ],
    pitfalls: [
      { title: '公式文書や試験では書き言葉（Kirjakieli）を使う！', explanation: 'Puhekieli は日常会話で必須ですが、YKIテストの筆記やオフィシャルな手紙では Kirjakieli を使います。' }
    ],
    idioms: [
      { phrase: 'Olla pala kurkussa', meaning: '直訳: 喉に塊がある ➔ 緊張して声が出ない / 感極まる', example: 'Minulla oli pala kurkussa.' },
      { phrase: 'Vääntää rautalangasta', meaning: '直訳: 針金を折り曲げる ➔ 噛み砕いて分かりやすく説明する', example: 'Täytyykö vääntää rautalangasta?' },
      { phrase: 'Olla peukalo keskellä kämmentä', meaning: '直訳: 手のひらの真ん中に親指がある ➔ 不器用である', example: 'Minulla on peukalo keskellä kämmentä.' },
      { phrase: 'Puhua sivu suun', meaning: '直訳: 口の横から話す ➔ うっかり秘密を漏らす', example: 'Hän puhui sivu suun.' }
    ],
    practiceQuiz: [
      {
        type: 'choice',
        question: '「Mä oon kotona」の文語（Kirjakieli）表現はどれ？',
        options: ['Minä olen kotona.', 'Sinä olet kotona.', 'Me olemme kotona.', 'Hän on kotona.'],
        answer: 'Minä olen kotona.',
        explanation: 'Mä ➔ Minä, oon ➔ olen の口語短縮形です。'
      },
      {
        type: 'choice',
        question: 'イディオム「Vääntää rautalangasta」の意味として最も適切なものは？',
        options: ['噛み砕いて分かりやすく説明する', '金属の工作をする', '針金で鍵を開ける'],
        answer: '噛み砕いて分かりやすく説明する',
        explanation: '直訳は「針金を折り曲げる」で、相手に分かりやすく噛み砕いて説明することを意味します。'
      },
      {
        type: 'typing',
        question: '「Minun kirjani（私の本）」を口語で「mun」を使って短縮した形を入力してください。',
        hint: 'mun _____',
        answer: 'mun kirja',
        explanation: '所有代名詞 minun は mun に短縮され、所有接尾辞 -ni は会話では落とされます。'
      },
      {
        type: 'typing',
        question: '「Sinun autosi（あなたの車）」を口語で「sun」を使って短縮した形を入力してください。',
        hint: 'sun _____',
        answer: 'sun auto',
        explanation: 'sinun autosi ➔ sun auto です。'
      },
      {
        type: 'wordbank',
        question: '「何してるの？（口語）」を完成させてください。',
        words: ['Mitä sä teet', 'Mitä sinä teet', 'Mitä sä teit'],
        answer: 'Mitä sä teet',
        explanation: 'Mitä sä teet? (口語の定番)。'
      }
    ]
  }
];

// Helper functions for Practice / Drill Studio
export function getAllPracticeQuestions() {
  const allQuestions = [];
  grammarTopics.forEach((topic) => {
    if (topic.practiceQuiz && Array.isArray(topic.practiceQuiz)) {
      topic.practiceQuiz.forEach((q, idx) => {
        allQuestions.push({
          ...q,
          id: `${topic.id}_q${idx + 1}`,
          topicId: topic.id,
          topicTitle: topic.title,
          category: topic.category,
          level: topic.level
        });
      });
    }
  });
  return allQuestions;
}

export function getQuestionsByCategory(categoryId) {
  const all = getAllPracticeQuestions();
  if (!categoryId || categoryId === 'all') return all;
  return all.filter((q) => q.category === categoryId);
}

export function getQuestionsByTopic(topicId) {
  const all = getAllPracticeQuestions();
  if (!topicId || topicId === 'all') return all;
  return all.filter((q) => q.topicId === topicId);
}
