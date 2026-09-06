export const GRAMMAR_CATEGORIES = [
  { id: 'all', label: 'すべて' },
  { id: 'basic_grammar', label: '基礎文法・音韻ルール' },
  { id: 'cases', label: '格（Sijamuodot）' },
  { id: 'verbs', label: '動詞・活用（Verbit）' },
  { id: 'rection', label: '支配（Rektio）' },
  { id: 'idioms', label: 'イディオム・口語（Idiomit & Puhekieli）' }
];

export const grammarTopics = [
  {
    id: 'vokaaliharmonia',
    title: '母音調和 (Vokaaliharmonia)',
    category: 'basic_grammar',
    level: 'A1',
    summary: 'フィンランド語の単語内に共存できる母音の組み合わせルール。接尾辞（格語尾など）の形を決める最重要の基礎知識。',
    overview: `フィンランド語の母音は **前母音** (ä, ö, y)、**後母音** (a, o, u)、および **中立母音** (e, i) の3グループに分かれます。

基本ルール：
1. 1つの複合語でない単語の中に、前母音 (ä, ö, y) と 後母音 (a, o, u) は共存できません。
2. 中立母音 (e, i) はどちらのグループの母音とも共存できます。
3. 単語の stem（語幹）に前母音が含まれていれば接尾辞も前母音タイプ（例: -ssa, -llä）、後母音が含まれていれば接尾辞も後母音タイプ（例: -ssa, -lla）になります。
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
      { finnish: 'Suomessa on paljon järviä.', english: 'There are many lakes in Finland.', japanese: 'フィンランドにはたくさんの湖があります。', note: 'Suomi + ssa ➔ Suomessa (中立+後母音uが含まれるため -ssa)' },
      { finnish: 'Helsingissä on ihana sää.', english: 'The weather is lovely in Helsinki.', japanese: 'ヘルシンキの天気は素晴らしいです。', note: 'Helsinki ➔ Helsingissä (中立音e,iのみのため前母音語尾 -ssä)' },
      { finnish: 'Tytöt leikkivät puistossa.', english: 'Girls are playing in the park.', japanese: '女の子たちが公園で遊んでいます。', note: 'tyttö ➔ tytöt (ä,ö,yグループ), puisto ➔ puistossa (a,o,uグループ)' }
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
        explanation: 'Helsinki は中立音 (e, i) のみでかつ k➔g の Astevaihtelu が起きるため Helsingissä となります。'
      },
      {
        type: 'typing',
        question: '「tyttö（女の子）」に「〜の中で (-ssa/-ssä)」を付けた形を入力してください。',
        hint: 'tyt_____',
        answer: 'tytössä',
        explanation: 'tyttö は前母音 ö を含むため -ssä となり、子音段階変化 tt➔t が起きて tytössä となります。'
      }
    ]
  },
  {
    id: 'astevaihtelu',
    title: '子音段階変化 (Astevaihtelu / KTP-sääntö)',
    category: 'basic_grammar',
    level: 'A2',
    summary: '単語が曲用・活用するときに、語幹の中の子音 (k, t, p) が強い形（Vahva aste）から弱い形（Heikko aste）に変化する規則。',
    overview: `フィンランド語の学習で避けて通れないのが **Astevaihtelu (Consonant Gradation)** です。
名詞の格変化（属格、位置格など）や動詞の活用（一人称・二人称形など）で閉じた音節（Closed syllable）になると、子音 k, t, p が変化します。

主な変化パターン：
- **二重子音 ➔ 単子音** (kk➔k, tt➔t, pp➔p)
- **単子音 ➔ 消失・別子音** (k➔ø/g/v, t➔d, p➔v)
- **nk/nt/mp ➔ ng/nn/mm** (鼻音と同化)`,
    rules: [
      { title: 'kk ➔ k', description: 'pukki (山羊) ➔ pukin / kukka (花) ➔ kukat' },
      { title: 'tt ➔ t', description: 'tyttö (女の子) ➔ tytöt / katto (屋根) ➔ katolla' },
      { title: 'pp ➔ p', description: 'kuppi (カップ) ➔ kupissa' },
      { title: 't ➔ d', description: 'katu (通り) ➔ kadulla / pöytä (机) ➔ pöydällä' },
      { title: 'p ➔ v', description: 'tapa (習慣) ➔ tavan / leipä (パン) ➔ leivän' },
      { title: 'nk ➔ ng / nt ➔ nn', description: 'Helsinki ➔ Helsingissä / ranta (海岸) ➔ rannalla' }
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
      { title: '逆段階変化（Käänteinen astevaihtelu）', explanation: '一部の動詞（Verbityyppi 4など: 例: tavata ➔ tapaan）では、基本形が弱階で活用形が強階になる逆パターンが存在します。' }
    ],
    idioms: [],
    practiceQuiz: [
      {
        type: 'choice',
        question: '「katu（通り）」に「〜で (-lla)」をつけるときの正しい形は？',
        options: ['katulla', 'kadulla', 'katulla', 'kavulla'],
        answer: 'kadulla',
        explanation: 't ➔ d の子音段階変化が起きるため kadulla となります。'
      },
      {
        type: 'choice',
        question: '「ranta（海岸）」の属格（〜の / -n）の正しい形は？',
        options: ['rantan', 'randan', 'rannan', 'rangan'],
        answer: 'rannan',
        explanation: 'nt ➔ nn の同化変化が起きるため rannan となります。'
      }
    ]
  },
  {
    id: 'verbityypit',
    title: '動詞の6つのタイプ (Verbityypit 1-6)',
    category: 'verbs',
    level: 'A2',
    summary: 'フィンランド語の動詞辞書形（原形）の語尾パターンに応じた6つの活用分類。人称変化の基本ルール。',
    overview: `フィンランド語のすべての動詞は、辞書形の語尾によって **タイプ 1 から タイプ 6** に分類されます。
活用語幹（Stem）を作るルールを覚えれば、人称語尾（-n, -t, -e/長母音, -mme, -tte, -vat/vät）を付与するだけで現在形が作れます。

人称語尾一覧：
- **minä**: -n (例: puhun)
- **sinä**: -t (例: puhut)
- **hän**: 母音の長音化 (例: puhuu)
- **me**: -mme (例: puhumme)
- **te**: -tte (例: puhutte)
- **he**: -vat / -vät (例: puhuvat)`,
    rules: [
      { title: 'Type 1 (-a / -ä)', description: '末尾の -a/-ä を取って語幹を作る。Astevaihteluあり。例: puhua ➔ puhu-, asua ➔ asu-' },
      { title: 'Type 2 (-da / -dä)', description: '末尾の -da/-dä を取る。Astevaihteluなし！例: syödä ➔ syö-, juoda ➔ juo-' },
      { title: 'Type 3 (-la/-lä, -na/-nä, -ra/-rä, -sta/-stä)', description: '末尾の2文字を取り、-e- を補う。例: tulla ➔ tul- ➔ tule-, opiskella ➔ opiskele-' },
      { title: 'Type 4 (-ata / -ätä, -ota / -ötä, -uta / -ytä)', description: '末尾の -t を取り、-a/-ä を補う（逆Astevaihtelu）。例: tavata ➔ tapaa-' },
      { title: 'Type 5 (-ita / -itä)', description: '末尾の -ta/-tä を取り、-itse- を補う。例: tarvita ➔ tarvitse-' },
      { title: 'Type 6 (-eta / -etä)', description: '末尾の -ta/-tä を取り、-ene- を補う。例: vanheta ➔ vanhene-' }
    ],
    table: {
      headers: ['動詞タイプ', '辞書形の語尾例', '一人称単数形 (minä)', '三人称単数形 (hän)'],
      rows: [
        ['Type 1', 'puhua (話す)', 'minä puhun', 'hän puhuu'],
        ['Type 2', 'syödä (食べる)', 'minä syön', 'hän syö'],
        ['Type 3', 'tulla (来る)', 'minä tulen', 'hän tulee'],
        ['Type 4', 'tavata (会う)', 'minä tapaan', 'hän tapaa'],
        ['Type 5', 'tarvita (必要とする)', 'minä tarvitsen', 'hän tarvitsee'],
        ['Type 6', 'vanheta (年をとる)', 'minä vanhenen', 'hän vanhenee']
      ]
    },
    examples: [
      { finnish: 'Puhutko sinä suomea?', english: 'Do you speak Finnish?', japanese: 'あなたはフィンランド語を話しますか？', note: 'puhua (Type 1) ➔ sinä puhut + ko (疑問子)' },
      { finnish: 'Me tulemme kotiin klo 18.', english: 'We come home at 18:00.', japanese: '私たちは18時に家に帰ります。', note: 'tulla (Type 3) ➔ me tulemme' },
      { finnish: 'Tapaan ystäväni tänään.', english: 'I am meeting my friend today.', japanese: '今日友達に会います。', note: 'tavata (Type 4) ➔ minä tapaan (t➔p の逆Astevaihtelu)' }
    ],
    pitfalls: [
      { title: 'hän (三人称単数) の語尾長音化', explanation: 'Type 1やType 3などでは、hän puhuu (uが重なる), hän tulee (eが重なる) のように最後の母音が伸びます。' }
    ],
    idioms: [],
    practiceQuiz: [
      {
        type: 'choice',
        question: '動詞「tulla（来る）」の「minä（私）」の正しい活用形は？',
        options: ['tullan', 'tulen', 'tulesta', 'tulenat'],
        answer: 'tulen',
        explanation: 'Type 3動詞 tulla は末尾の -la を取って -e- を補い、人称語尾 -n をつけて tulen となります。'
      },
      {
        type: 'choice',
        question: '動詞「syödä（食べる）」の「hän（彼/彼女）」の活用形は？',
        options: ['syö', 'syödää', 'syön', 'syöpi'],
        answer: 'syö',
        explanation: 'Type 2動詞 syödä は -da を取った語幹 syö- がそのまま hän の形になります。'
      }
    ]
  },
  {
    id: 'paikallissijat',
    title: '位置格（6つの内部・外部位置格）',
    category: 'cases',
    level: 'A2',
    summary: '「どこに・どこで・どこから」を表すフィンランド語の最も重要な6つの格変化（Inessiivi, Elatiivi, Illatiivi, Adessiivi, Ablatiivi, Allatiivi）。',
    overview: `フィンランド語の位置格は **内部位置格（建物や箱などの「中」）** 3つと、**外部位置格（表面・オープンな場所・人物）** 3つの計6つに綺麗に整理されています。

質問詞との対応関係：
- **Missä? / Millä?** (どこで？ / どこに乗って・何で？) ➔ 停留・静止
- **Mistä? / Miltä?** (どこから？ / 何から？) ➔ 離脱・出発
- **Mihin? / Mille?** (どこへ？ / どこに向けて？) ➔ 到着・進入`,
    rules: [
      { title: 'Inessiivi (-ssa / -ssä)', description: '〜の中で (In/Inside)。例: talossa (家の中で)' },
      { title: 'Elatiivi (-sta / -stä)', description: '〜の中から (Out of/From)。例: talosta (家の中から)' },
      { title: 'Illatiivi (-hVn / -seen / 長母音+n)', description: '〜の中へ (Into)。例: taloon (家へ)' },
      { title: 'Adessiivi (-lla / -llä)', description: '〜の上で・〜で(手段) (On/At/By)。例: pöydällä (机の上で), bussilla (バスで)' },
      { title: 'Ablatiivi (-lta / -ltä)', description: '〜の上から・〜から (From on/Off)。例: pöydältä (机の上から)' },
      { title: 'Allatiivi (-lle)', description: '〜の上へ・〜へ(人へ) (To/Onto)。例: pöydälle (机の上へ), minulle (私へ)' }
    ],
    table: {
      headers: ['格の種類', '質問詞', '語尾', '意味', '単語例 (talo / tori)'],
      rows: [
        ['Inessiivi', 'Missä?', '-ssa / -ssä', '〜の中で', 'talossa (家で)'],
        ['Elatiivi', 'Mistä?', '-sta / -stä', '〜の中から', 'talosta (家から)'],
        ['Illatiivi', 'Mihin?', '-Vn / -seen', '〜の中へ', 'taloon (家の中へ)'],
        ['Adessiivi', 'Millä?', '-lla / -llä', '〜の上で/手段', 'torilla (広場で/市場で)'],
        ['Ablatiivi', 'Miltä?', '-lta / -ltä', '〜の上から', 'torilta (広場から)'],
        ['Allatiivi', 'Mille?', '-lle', '〜の上へ/人へ', 'torille (広場へ)']
      ]
    },
    examples: [
      { finnish: 'Meneekö tämä bussi torille?', english: 'Does this bus go to the market square?', japanese: 'このバスは市場広場へ行きますか？', note: 'tori (オープンな場所) ➔ torille (Allatiivi)' },
      { finnish: 'Olen kotoisin Japanista.', english: 'I am from Japan.', japanese: '私は日本出身です。', note: 'Japani ➔ Japanista (Elatiivi: 出身地を表す)' },
      { finnish: 'Voitko antaa avaimen minulle?', english: 'Can you give the key to me?', japanese: '鍵を私に渡してもらえますか？', note: 'minä ➔ minulle (Allatiivi)' }
    ],
    pitfalls: [
      { title: '都市名・場所による -ssa / -lla の使い分け', explanation: 'Helsinki ➔ Helsingissä (-ssa) ですが、Tampere ➔ Tampereella (-lla), Rovaniemi ➔ Rovaniemellä (-lla) のように伝統的な格語尾が決まっています。' }
    ],
    idioms: [],
    practiceQuiz: [
      {
        type: 'choice',
        question: '「バスで（手段）」を表す正しいフィンランド語は？',
        options: ['bussissa', 'bussilla', 'bussista', 'bussille'],
        answer: 'bussilla',
        explanation: '移動手段や乗物の「〜で」には Adessiivi (-lla/-llä) を使用するため bussilla となります。'
      },
      {
        type: 'choice',
        question: '「日本から来ました（出身）」を表す「Japanista」の格は？',
        options: ['Inessiivi', 'Elatiivi', 'Illatiivi', 'Adessiivi'],
        answer: 'Elatiivi',
        explanation: '「〜の中から/〜から来た」を表す -sta/-stä は Elatiivi（出格）です。'
      },
      {
        type: 'typing',
        question: '「talo（家）」に「〜の中へ (Illatiivi)」を付けた形を入力してください。',
        hint: 'tal_____',
        answer: 'taloon',
        explanation: '母音で終わる単語のIllatiiviは、母音を重ねて n を付けます（talo + o + n ➔ taloon）。'
      }
    ]
  },
  {
    id: 'partitiivi',
    title: '分格 (Partitiivi)',
    category: 'cases',
    level: 'A2',
    summary: 'フィンランド語で最も頻出する格。不定量、継続・進行中の動作、否定文、数詞の後の名詞などに広く使われます。',
    overview: `**Partitiivi（分格）** は、英語や日本語には直接対応する概念がないフィンランド語特有の重要格です。
全体の「一部」や「終わっていない不確実な数量・動作」を意味します。

主な使いどころ：
1. **数詞（2以上）の後**: kaksi kahvia (2つのコーヒー)
2. **不定量・数えられないもの (Uncountable)**: juon vettä (水を飲む - 全部ではなく一部)
3. **否定文の目的語**: En lue kirjaa (本を読んでいない)
4. **感情・状態を表す動詞の目的語 (Partitive Verbs)**: rakastan sinua (あなたを愛している), autan sinua (あなたを助ける)
5. **進行中の動作 (Incomplete action)**: Luen kirjaa (本を読んでいる最中だ)`,
    rules: [
      { title: '語尾: -a / -ä', description: '単語が1つの母音で終わる場合。例: talo ➔ taloa, kuppi ➔ kuppia' },
      { title: '語尾: -ta / -tä', description: '単語が子音または二重母音で終わる場合。例: suomi ➔ suomea, maa ➔ maata' },
      { title: '語尾: -tta / -ttä', description: '単語が -e で終わる場合。例: huone ➔ huonetta, helppo ➔ helppoa' }
    ],
    table: {
      headers: ['用法', '単語の例', 'Partitiivi形', '例文・訳'],
      rows: [
        ['数詞の直後 (2~)', 'kaksi + kuppi', 'kaksi kuppia', '2つのカップ'],
        ['不可算名詞・飲料', 'vesi (水)', 'vettä', 'Juon vettä. (水を飲む)'],
        ['否定文の目的語', 'oma talo', 'omaa taloa', 'Minulla ei ole omaa taloa. (自分の家はない)'],
        ['感情・分格動詞', 'sinä (あなた)', 'sinua', 'Rakastan sinua. (あなたを愛しています)']
      ]
    },
    examples: [
      { finnish: 'Juo vähemmän kahvia ja enemmän vettä.', english: 'Drink less coffee and more water.', japanese: 'コーヒーを控えて、水をもっと飲みなさい。', note: 'kahvi ➔ kahvia, vesi ➔ vettä (不可算)' },
      { finnish: 'Opiskelen suomea joka päivä.', english: 'I study Finnish every day.', japanese: '私は毎日フィンランド語を勉強しています。', note: 'opiskella の目的語は言語名 Partitiivi (suomea)' },
      { finnish: 'Etsin uutta asuntoa.', english: 'I am looking for a new apartment.', japanese: '新しいアパートを探しています。', note: 'etsiä (探す) は常に Partitiivi を取る動詞' }
    ],
    pitfalls: [
      { title: '全格目的語 (Genetiivi/Akusatiivi) との対比', explanation: '「本を1冊読み切る（完結）」場合は Luen kirjan (Genetiivi形目的語)、「読んでいる最中 / 読み終わっていない」場合は Luen kirjaa (Partitiivi) となります。' }
    ],
    idioms: [],
    practiceQuiz: [
      {
        type: 'choice',
        question: '「私はフィンランド語を愛しています (Rakastan ____)」の空欄に入る正しい形は？',
        options: ['suomi', 'suomea', 'suomen', 'suomessa'],
        answer: 'suomea',
        explanation: '動詞 rakastaa（愛する）は目的語に必ず Partitiivi を取るため suomea となります。'
      },
      {
        type: 'choice',
        question: '「kaksi（2）」の後に置く「kahvi（コーヒー）」の正しい形は？',
        options: ['kahvi', 'kahvin', 'kahvia', 'kahvissa'],
        answer: 'kahvia',
        explanation: '2以上の数詞の後ろの名詞は Partitiivi 単数形になるため kahvia となります。'
      }
    ]
  },
  {
    id: 'genetiivi-akusatiivi',
    title: '属格・対格（Genetiivi & Akusatiivi）',
    category: 'cases',
    level: 'B1',
    summary: '所有を表す「〜の（Genetiivi -n）」と、完了・全体目的語を表す「〜を（Akusatiivi）」。',
    overview: `**Genetiivi（属格）** は、語尾 \`-n\` をつけることで所有（〜の）を表す格です。
また、命令文でない肯定文で「動作が完了する / 全体を対象とする目的語（Total Object）」を表す際にも、属格と同じ形（\`-n\`）の **Akusatiivi（対格）** が用いられます。

用法まとめ：
1. **所有・所属**: Pekan auto (ペッカの車), Suomen pääkaupunki (フィンランドの首都)
2. **完了目的語 (Total Object)**: Ostan uuden auton. (新しい車を買う＝1台買い切る)
3. ** need 表現 (Täytyy / Pitää + Genetiivi)**: Minun täytyy mennä. (私は行かなければならない)`,
    rules: [
      { title: '語尾: -n', description: '語幹に -n を追加。Astevaihtelu (強階➔弱階) が起きます。' },
      { title: '必要の構文 (Täytyy-lausahdus)', description: '「(人)-n täytyy / pitää + 動詞原形」の形で「〜しなければならない」を意味します。' }
    ],
    table: {
      headers: ['役割', '文構造', '例', '訳'],
      rows: [
        ['所有', '名詞-n + 名詞', 'Pekan koira', 'ペッカの犬'],
        ['全体目的語', '主語 + 動詞 + 名詞-n', 'Luen kirjan.', '本を（最後まで）読む。'],
        ['義務・必要', '人-n + täytyy + 動詞原形', 'Minun täytyy opiskella.', '私は勉強しなければならない。']
      ]
    },
    examples: [
      { finnish: 'Tämä on minun ystäväni kirja.', english: 'This is my friend’s book.', japanese: 'これは私の友達の本です。', note: 'minun (私の), ystävän (友達の)' },
      { finnish: 'Minun pitää ostaa uusi tietokone.', english: 'I have to buy a new computer.', japanese: '私は新しいパソコンを買わなければなりません。', note: 'minun + pitää + ostaa' }
    ],
    pitfalls: [
      { title: '代名詞の対格形（Akusatiivi of Pronouns）', explanation: 'minä, sinä, hän などの人称代名詞の対格形は -n ではなく -t になります（例: Minä näen sinut. = 私はあなたに会う/見かける）。' }
    ],
    idioms: [],
    practiceQuiz: [
      {
        type: 'choice',
        question: '「私は行かなければならない (____ täytyy mennä)」の空欄に入る正しい主体形は？',
        options: ['Minä', 'Minun', 'Minua', 'Minussa'],
        answer: 'Minun',
        explanation: 'täytyy 構文（義務・必要）では主語が Genetiivi形 (minun) になります。'
      }
    ]
  },
  {
    id: 'rektiot',
    title: '動詞の支配（Rektio / Verb Rektio）',
    category: 'rection',
    level: 'B1',
    summary: '特定の動詞や形容詞が、後続する名詞に特定の「格（-sta, -en, -llle など）」や「動詞の形」を要求するルールのまとめ。',
    overview: `フィンランド語の習熟度を大きく左右するのが **Rektio（支配）** です。
日本語の助詞「〜を」「〜に」「〜が」と直訳が一致しないことが多いため、動詞と格の組み合わせ（コロケーション）として覚える必要があります。

よく使われる主要な Rektio パターン：
- **tykätä + -sta / -stä** (〜が好き) ➔ 例: Tykkään musiikista.
- **pitää + -sta / -stä** (〜が好き) ➔ 例: Pidän sinusta.
- **nauttia + -sta / -stä** (〜を楽しむ) ➔ 例: Nautin lomasta.
- **auttaa + Partitiivi** (〜を助ける) ➔ 例: Autan sinua.
- **tutustua + Illatiivi (-hVn/seen)** (〜と知り合う/〜に精通する) ➔ 例: Tutustuin uuteen kollegaani.
- **kiittää + Partitiivi + Elatiivi (-sta)** (〜に〜の件で感謝する) ➔ 例: Kiitos avusta!`,
    rules: [
      { title: 'Elatiivi (-sta/-stä) を取る動詞', description: 'tykätä, pitää, nauttia, haaveilla, huolehtia など' },
      { title: 'Illatiivi (-hVn/-seen/mihin) を取る動詞', description: 'tutustua, rakastua, tottua, keskittyä, osallistua など' },
      { title: 'Partitiivi を取る動詞', description: 'auttaa, etsiä, odottaa, pelätä, onnitella など' }
    ],
    table: {
      headers: ['動詞', '要求する格', '意味', '例文'],
      rows: [
        ['tykätä', 'Elatiivi (-sta/-stä)', '〜が好きだ', 'Tykkään kahvista. (コーヒーが好き)'],
        ['tutustua', 'Illatiivi (Mihin)', '〜と知り合う', 'Haluatko tutustua minuun? (私と知り合いたい？)'],
        ['auttaa', 'Partitiivi', '〜を助ける', 'Voitko auttaa minua? (私を助けてくれますか？)'],
        ['pelätä', 'Partitiivi', '〜を恐れる/怖がる', 'Pelkään koiria. (犬が怖い)']
      ]
    },
    examples: [
      { finnish: 'Pidän matkustamisesta ja uusiin kulttuureihin tutustumisesta.', english: 'I like traveling and getting to know new cultures.', japanese: '私は旅行することと新しい文化に触れることが好きです。', note: 'pitää + sta, tutustua + illatiivi' },
      { finnish: 'Kiitos paljon avustasi!', english: 'Thank you very much for your help!', japanese: '助けてくれてどうもありがとう！', note: 'kiittää + sta (avusta = help)' }
    ],
    pitfalls: [
      { title: 'tykätä vs pitää', explanation: '両方とも「〜が好き」で Elatiivi (-sta/-stä) を取りますが、pitää は「~n täytyy（〜しなければならない）」の構文でも使われるため文脈に注意が必要です。' }
    ],
    idioms: [
      { phrase: 'Olla kotoisin + -sta/-stä', meaning: '〜の出身である', example: 'Olen kotoisin Tokiosta.' },
      { phrase: 'Pitää huolta + -sta/-stä', meaning: '〜の世話をする・〜を大切にする', example: 'Pidä huolta itsestäsi! (身体に気をつけてね！)' }
    ],
    practiceQuiz: [
      {
        type: 'choice',
        question: '「Tykkään（〜が好きです）」に続く「kahvi（コーヒー）」の正しい形は？',
        options: ['kahvi', 'kahvin', 'kahvista', 'kahville'],
        answer: 'kahvista',
        explanation: '動詞 tykätä は必ず Elatiivi (-sta/-stä) を要求するため kahvista となります。'
      },
      {
        type: 'choice',
        question: '「Voitko auttaa（私を助けてくれますか？）」の空欄に入る「私」の形は？',
        options: ['minä', 'minun', 'minua', 'minussa'],
        answer: 'minua',
        explanation: '動詞 auttaa（助ける）は目的語に Partitiivi を要求するため minua となります。'
      }
    ]
  },
  {
    id: 'idiomit-ja-puhekieli',
    title: '重要イディオム・口語表現（Idiomit & Puhekieli）',
    category: 'idioms',
    level: 'B2',
    summary: 'フィンランド人が日常会話（Puhekieli）で頻繁に使う生きたイディオム、比喩表現、略語ルール。',
    overview: `フィンランド語の文語（Kirjakieli）と口語（Puhekieli）には大きな乖離があります。
また、フィンランド独特のイディオムや成句（Sananlaskut / Idiomit）を知ることで、ドラマやラジオ、現地の自然な会話が一気に理解できるようになります。

口語（Puhekieli）の主な省略・変化ルール：
- **人称代名詞の短縮**: minä ➔ **mä**, sinä ➔ **sä**, hän ➔ **se**, me ➔ **me**, te ➔ **te**, he ➔ **ne**
- **動詞一人称複数の受動態化**: me menemme ➔ **me mennään**, me syömme ➔ **me syödään**
- **語尾の母音脱落**: minun ➔ **mun**, sinun ➔ **sun**, mitä ➔ **mitä / mit**
- **olla動詞の短縮**: minä olen ➔ **mä oon**, sinä olet ➔ **sä oot**, se on ➔ **se on**`,
    rules: [
      { title: '代名詞短縮', description: 'mä (I), sä (you), se (he/she/it), ne (they)' },
      { title: '「私たち」の口語化', description: 'me + 受動態 (例: me lähdetään = 行こう / 私たちは出発する)' },
      { title: '所有接尾辞の省略', description: 'kirjani ➔ mun kirja (私の本)' }
    ],
    table: {
      headers: ['文語 (Kirjakieli)', '口語 (Puhekieli)', '意味'],
      rows: [
        ['Minä olen kotona.', 'Mä oon kotona.', '私は家にいます。'],
        ['Mitä sinä teet?', 'Mitä sä teet?', '何してるの？'],
        ['Me menemme kahvittelemaan.', 'Me mennään kahville.', 'コーヒー飲みに行こう。'],
        ['Hän ei tiedä.', 'Se ei tiiä.', '彼/彼女は知らない。'],
        ['Minulla on kiire.', 'Mulla on kiire.', '急いでいます/忙しい。']
      ]
    },
    examples: [
      { finnish: 'Mitä äijä? - Ei kummempia, mitä pienistä!', english: 'What’s up man? - Nothing much!', japanese: '調子どう？ - 別に変わりないよ！', note: '日常会話での親しい挨拶' },
      { finnish: 'Mennäänkö jo? Joo, meikä on valmis!', english: 'Shall we go already? Yeah, I am ready!', japanese: 'もう行く？ うん、おいらは準備万端！', note: 'meikä / meikäläinen = 口語の「自分・私」' }
    ],
    pitfalls: [
      { title: '書き言葉での使用制限', explanation: 'Puhekieli（口語）やイディオムは、公式な手紙・試験・レポート（Kirjakieli）では使わないよう区別しましょう。' }
    ],
    idioms: [
      { phrase: 'Olla pala kurkussa', meaning: '直訳: 喉に塊がある ➔ 緊張して声が出ない / 感極まって涙ぐむ', example: 'Minulla oli pala kurkussa, kun esiinnyin. (本番中、緊張で喉がつまった)' },
      { phrase: 'Puhua sivu suun', meaning: '直訳: 口の横から話す ➔ うっかり秘密を漏らす・口を滑らせる', example: 'Hän puhui sivu suun syntymäpäiväyllätyksestä. (サプライズのことを口滑らせちゃった)' },
      { phrase: 'Vääntää rautalangasta', meaning: '直訳: 針金から折り曲げる ➔ （バカでもわかるように）噛み砕いて説明する', example: 'Täytyykö minun vääntää tämä sinulle rautalangasta? (噛み砕いて説明しなきゃダメ？)' },
      { phrase: 'Olla peukalo keskellä kämmentä', meaning: '直訳: 手のひらの真ん中に親指がある ➔ 不器用である・手先が不器用だ', example: 'En osaa korjata tätä, minulla on peukalo keskellä kämmentä. (不器用だから直せないよ)' }
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
        question: '「Vääntää rautalangasta」の意味として最も適切なものは？',
        options: ['金属の工作をする', '噛み砕いて分かりやすく説明する', '針金で鍵を開ける', '激しく議論する'],
        answer: '噛み砕いて分かりやすく説明する',
        explanation: '直訳は「針金を折り曲げる」で、相手が理解できるように噛み砕いて丁寧に説明することを意味します。'
      },
      {
        type: 'typing',
        question: '「Minun kirja（私の本）」を口語（Puhekieli）で「mun」を使って書くと？',
        hint: 'mun _____',
        answer: 'mun kirja',
        explanation: '所有代名詞 minun は口語で mun に短縮され、所有接尾辞 -ni は省略されることが一般的です。'
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

