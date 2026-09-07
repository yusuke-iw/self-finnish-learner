const sentences = [
  // Module 1 (A2)
  { _id: "m1_1", text: "Mihin aikaan juna lähtee Tampereelle?", translation: "What time does the train leave for Tampere?", translationJa: "タンペレ行きの電車は何時に出発しますか？", difficulty: "easy", category: "Asiointi ja Matkustaminen", grammarNotes: "Aikaan (at time), lähtee (leaves)", grammarNotesJa: "Aikaan (時間に), lähtee (出発する)" },
  { _id: "m1_2", text: "Haluaisin varata huoneen kahdeksi yöksi.", translation: "I would like to book a room for two nights.", translationJa: "2泊で部屋を予約したいのですが。", difficulty: "easy", category: "Asiointi ja Matkustaminen", grammarNotes: "Haluaisin (conditional), kahdeksi yöksi (translative for duration)", grammarNotesJa: "Haluaisin (条件法・〜したい), kahdeksi yöksi (期間の変格)" },
  { _id: "m1_3", text: "Voitko neuvoa minulle tien rautatieasemalle?", translation: "Can you show me the way to the railway station?", translationJa: "鉄道駅への道を教えていただけますか？", difficulty: "easy", category: "Asiointi ja Matkustaminen", grammarNotes: "Neuvoa tien (show the way), asemalle (allative)", grammarNotesJa: "Neuvoa tien (道を教える), asemalle (向格・〜へ)" },
  { _id: "m1_4", text: "Otatko kuitin?", translation: "Do you want the receipt?", translationJa: "レシートは受け取りますか？", difficulty: "easy", category: "Asiointi ja Matkustaminen", grammarNotes: "Kuitin (accusative)", grammarNotesJa: "Kuitin (対格・レシートを)" },
  { _id: "m1_5", text: "Maksaako tämä enemmän kuin kymmenen euroa?", translation: "Does this cost more than ten euros?", translationJa: "これは10ユーロより高いですか？", difficulty: "easy", category: "Asiointi ja Matkustaminen", grammarNotes: "Maksaako (does it cost), enemmän kuin (more than)", grammarNotesJa: "Maksaako (〜ですか), enemmän kuin (〜よりも多く)" },
  { _id: "m1_6", text: "Missä on lähin apteekki?", translation: "Where is the nearest pharmacy?", translationJa: "一番近い薬局はどこですか？", difficulty: "easy", category: "Asiointi ja Matkustaminen", grammarNotes: "Missä on (where is), lähin (nearest)", grammarNotesJa: "Missä on (どこにある), lähin (最も近い)" },
  { _id: "m1_7", text: "Yksi lippu Helsinkiin, kiitos.", translation: "One ticket to Helsinki, please.", translationJa: "ヘルシンキまでの切符を1枚お願いします。", difficulty: "easy", category: "Asiointi ja Matkustaminen", grammarNotes: "Lippu (ticket), Helsinkiin (illative)", grammarNotesJa: "Lippu (切符), Helsinkiin (入格・ヘルシンキへ)" },
  { _id: "m1_8", text: "Voinko maksaa kortilla?", translation: "Can I pay by card?", translationJa: "カードで支払えますか？", difficulty: "easy", category: "Asiointi ja Matkustaminen", grammarNotes: "Voinko (can I), kortilla (adessive for instrument)", grammarNotesJa: "Voinko (〜できますか), kortilla (接格・手段)" },
  { _id: "m1_9", text: "Bussi numero viisi menee keskustaan.", translation: "Bus number five goes to the city center.", translationJa: "5番バスは中心街へ行きます。", difficulty: "easy", category: "Asiointi ja Matkustaminen", grammarNotes: "Menee (goes), keskustaan (illative)", grammarNotesJa: "Menee (行く), keskustaan (入格・中心部へ)" },
  { _id: "m1_10", text: "Tarvitsen apua matkatavaroiden kanssa.", translation: "I need help with the luggage.", translationJa: "荷物のことで手助けが必要です。", difficulty: "easy", category: "Asiointi ja Matkustaminen", grammarNotes: "Tarvitsen (I need), kanssa (with + genitive)", grammarNotesJa: "Tarvitsen (必要とする), kanssa (〜と一緒に/関して)" },
  
  { _id: "m1_11", text: "Saisinko ruokalistan, kiitos?", translation: "Could I get the menu, please?", translationJa: "メニューをいただけますか？", difficulty: "easy", category: "Ruoka ja Juoma", grammarNotes: "Saisinko (could I get), ruokalistan (accusative)", grammarNotesJa: "Saisinko (いただけますか), ruokalistan (対格)" },
  { _id: "m1_12", text: "Minulla on nälkä ja jano.", translation: "I am hungry and thirsty.", translationJa: "お腹が空いて喉が渇いています。", difficulty: "easy", category: "Ruoka ja Juoma", grammarNotes: "Minulla on (I have)", grammarNotesJa: "Minulla on (私には〜がある)" },
  { _id: "m1_13", text: "Mitä suosittelette lounaaksi?", translation: "What do you recommend for lunch?", translationJa: "ランチのおすすめは何ですか？", difficulty: "easy", category: "Ruoka ja Juoma", grammarNotes: "Suosittelette (you recommend), lounaaksi (translative)", grammarNotesJa: "Suosittelette (あなたがお勧めする), lounaaksi (変格・昼食として)" },
  { _id: "m1_14", text: "Otan kupin kahvia ja korvapuustin.", translation: "I'll take a cup of coffee and a cinnamon bun.", translationJa: "コーヒーを1杯とシナモンロールにします。", difficulty: "easy", category: "Ruoka ja Juoma", grammarNotes: "Otan (I take), kupin (accusative)", grammarNotesJa: "Otan (取ります), kupin (対格)" },
  { _id: "m1_15", text: "Lasku, kiitos.", translation: "The bill, please.", translationJa: "お会計をお願いします。", difficulty: "easy", category: "Ruoka ja Juoma", grammarNotes: "Lasku (the bill)", grammarNotesJa: "Lasku (請求書・会計)" },

  { _id: "m1_16", text: "Tämä on minun ystäväni Mikko.", translation: "This is my friend Mikko.", translationJa: "こちらは私の友人のミッコです。", difficulty: "easy", category: "Perhe ja Ystävät", grammarNotes: "Minun (my), ystäväni (friend + possessive suffix)", grammarNotesJa: "Minun (私の), ystäväni (友人＋所有接尾辞)" },
  { _id: "m1_17", text: "Kuinka monta sisarusta sinulla on?", translation: "How many siblings do you have?", translationJa: "兄弟姉妹は何人いますか？", difficulty: "easy", category: "Perhe ja Ystävät", grammarNotes: "Kuinka monta (how many), sisarusta (partitive)", grammarNotesJa: "Kuinka monta (いくつ), sisarusta (分格)" },
  { _id: "m1_18", text: "Minun perheeseeni kuuluu neljä ihmistä.", translation: "My family consists of four people.", translationJa: "私の家族は4人家族です。", difficulty: "easy", category: "Perhe ja Ystävät", grammarNotes: "Perheeseeni (illative + possessive), kuuluu (belongs to)", grammarNotesJa: "Perheeseeni (入格＋所有接尾辞), kuuluu (属する)" },
  { _id: "m1_19", text: "Mikä sinun nimesi on?", translation: "What is your name?", translationJa: "あなたのお名前は何ですか？", difficulty: "easy", category: "Perhe ja Ystävät", grammarNotes: "Mikä (what), nimesi (name + possessive)", grammarNotesJa: "Mikä (何), nimesi (名前＋所有接尾辞)" },
  { _id: "m1_20", text: "Olemme tunteneet toisemme monta vuotta.", translation: "We have known each other for many years.", translationJa: "私たちは長年知り合いです。", difficulty: "easy", category: "Perhe ja Ystävät", grammarNotes: "Olemme tunteneet (perfect tense), toisemme (each other)", grammarNotesJa: "Olemme tunteneet (現在完了), toisemme (お互い)" },

  // Module 2 (A2/B1)
  { _id: "m2_1", text: "Minä asuin Helsingissä viisi vuotta sitten.", translation: "I lived in Helsinki five years ago.", translationJa: "私は5年前にヘルシンキに住んでいました。", difficulty: "medium", category: "Menneet ajat", grammarNotes: "Asuin (imperfect)", grammarNotesJa: "Asuin (過去形)" },
  { _id: "m2_2", text: "Oletko koskaan käynyt Lapissa?", translation: "Have you ever been to Lapland?", translationJa: "ラップランドに行ったことがありますか？", difficulty: "medium", category: "Menneet ajat", grammarNotes: "Oletko käynyt (perfect)", grammarNotesJa: "Oletko käynyt (現在完了・訪れたことがある)" },
  { _id: "m2_3", text: "Me emme nähneet häntä eilen.", translation: "We didn't see him yesterday.", translationJa: "私たちは昨日彼を見かけませんでした。", difficulty: "medium", category: "Menneet ajat", grammarNotes: "Emme nähneet (negative imperfect)", grammarNotesJa: "Emme nähneet (過去否定形)" },
  { _id: "m2_4", text: "Hän oli jo lähtenyt, kun minä saavuin.", translation: "He had already left when I arrived.", translationJa: "私が到着したとき、彼はすでに出発していました。", difficulty: "medium", category: "Menneet ajat", grammarNotes: "Oli lähtenyt (pluperfect)", grammarNotesJa: "Oli lähtenyt (過去完了)" },
  { _id: "m2_5", text: "En ole lukenut tätä kirjaa vielä.", translation: "I haven't read this book yet.", translationJa: "私はまだこの本を読んでいません。", difficulty: "medium", category: "Menneet ajat", grammarNotes: "En ole lukenut (negative perfect)", grammarNotesJa: "En ole lukenut (否定現在完了)" },

  // Module 3 (B1)
  { _id: "m3_1", text: "Olen työskennellyt tässä yrityksessä kolme vuotta.", translation: "I have worked in this company for three years.", translationJa: "私はこの会社で3年間働いています。", difficulty: "medium", category: "Työelämä ja Opiskelu", grammarNotes: "Työskennellyt yrityksessä (inessive for workplace)", grammarNotesJa: "Työskennellyt yrityksessä (内格・職場で)" },
  { _id: "m3_2", text: "Mitkä ovat sinun vahvuutesi ja heikkoutesi työntekijänä?", translation: "What are your strengths and weaknesses as an employee?", translationJa: "従業員としてのあなたの長所と短所は何ですか？", difficulty: "medium", category: "Työelämä ja Opiskelu", grammarNotes: "Työntekijänä (essive)", grammarNotesJa: "Työntekijänä (様格・〜として)" },
  { _id: "m3_3", text: "Opiskelen suomea, jotta voin ymmärtää asiakkaita paremmin.", translation: "I study Finnish so that I can understand customers better.", translationJa: "顧客をよりよく理解できるようにフィンランド語を勉強しています。", difficulty: "medium", category: "Työelämä ja Opiskelu", grammarNotes: "Jotta (so that), paremmin (comparative)", grammarNotesJa: "Jotta (〜のために), paremmin (比較級)" },
  { _id: "m3_4", text: "Kokous on peruttu sairaustapauksen vuoksi.", translation: "The meeting is cancelled due to illness.", translationJa: "病気のため会議は中止になりました。", difficulty: "medium", category: "Työelämä ja Opiskelu", grammarNotes: "Peruttu (passive participle), vuoksi (due to + genitive)", grammarNotesJa: "Peruttu (受動分詞), vuoksi (属格＋〜のため)" },
  { _id: "m3_5", text: "Haluaisin hakea tätä avointa työpaikkaa.", translation: "I would like to apply for this open job position.", translationJa: "この求人に応募したいのですが。", difficulty: "medium", category: "Työelämä ja Opiskelu", grammarNotes: "Hakea työpaikkaa (partitive object)", grammarNotesJa: "Hakea työpaikkaa (分格目的語)" },

  // Module 4 (B1/B2)
  { _id: "m4_1", text: "Jos minulla olisi aikaa, lähtisin lomalle.", translation: "If I had time, I would go on vacation.", translationJa: "時間があれば休暇に出かけるのですが。", difficulty: "hard", category: "Konditionaali ja Potentiaali", grammarNotes: "Olisi, lähtisin (conditional)", grammarNotesJa: "Olisi, lähtisin (条件法)" },
  { _id: "m4_2", text: "Voisitko auttaa minua tämän raportin kanssa?", translation: "Could you help me with this report?", translationJa: "このレポートを手伝っていただけますか？", difficulty: "hard", category: "Konditionaali ja Potentiaali", grammarNotes: "Voisitko (conditional question)", grammarNotesJa: "Voisitko (条件法疑問文)" },
  { _id: "m4_3", text: "Hän lienee jo kotona.", translation: "He is probably already at home.", translationJa: "彼はおそらくもう家にいるでしょう。", difficulty: "hard", category: "Konditionaali ja Potentiaali", grammarNotes: "Lienee (potential of olla)", grammarNotesJa: "Lienee (ollaの可能性法)" },
  { _id: "m4_4", text: "Söisittekö mieluummin kalaa vai lihaa?", translation: "Would you rather eat fish or meat?", translationJa: "魚とお肉のどちらを召し上がりたいですか？", difficulty: "hard", category: "Konditionaali ja Potentiaali", grammarNotes: "Söisittekö (conditional plural 2nd)", grammarNotesJa: "Söisittekö (条件法2人称複数)" },
  { _id: "m4_5", text: "En usko, että hän tulisi, vaikka pyytäisin.", translation: "I don't think he would come, even if I asked.", translationJa: "頼んだとしても、彼が来てくれるとは思いません。", difficulty: "hard", category: "Konditionaali ja Potentiaali", grammarNotes: "Vaikka pyytäisin (even if I asked)", grammarNotesJa: "Vaikka pyytäisin (たとえ頼んだとしても)" },

  // Module 5 (B2)
  { _id: "m5_1", text: "Ilmastonmuutos on yksi aikamme suurimmista haasteista.", translation: "Climate change is one of the biggest challenges of our time.", translationJa: "気候変動は現代の最大の課題の一つです。", difficulty: "hard", category: "Yhteiskunta ja Ympäristö", grammarNotes: "Aikamme (genitive + suffix), haasteista (elative)", grammarNotesJa: "Aikamme (属格＋接尾辞), haasteista (出格・〜の中で)" },
  { _id: "m5_2", text: "Kierrättäminen on tärkeää ympäristön suojelemiseksi.", translation: "Recycling is important for protecting the environment.", translationJa: "リサイクルは環境を保護するために重要です。", difficulty: "hard", category: "Yhteiskunta ja Ympäristö", grammarNotes: "Suojelemiseksi (translative verbal noun)", grammarNotesJa: "Suojelemiseksi (動名詞の変格)" },
  { _id: "m5_3", text: "Hallitus suunnittelee uusia verohelpotuksia.", translation: "The government is planning new tax reliefs.", translationJa: "政府は新たな減税策を計画しています。", difficulty: "hard", category: "Yhteiskunta ja Ympäristö", grammarNotes: "Uusia verohelpotuksia (partitive plural)", grammarNotesJa: "Uusia verohelpotuksia (分格複数)" },
  { _id: "m5_4", text: "Demokratia edellyttää kansalaisten aktiivista osallistumista.", translation: "Democracy requires the active participation of citizens.", translationJa: "民主主義は市民の積極的な参加を必要とします。", difficulty: "hard", category: "Yhteiskunta ja Ympäristö", grammarNotes: "Edellyttää + partitive", grammarNotesJa: "Edellyttää ＋ 分格" },
  { _id: "m5_5", text: "Uusiutuva energia korvaa vähitellen fossiiliset polttoaineet.", translation: "Renewable energy is gradually replacing fossil fuels.", translationJa: "再生可能エネルギーは徐々に化石燃料に取って代わりつつあります。", difficulty: "hard", category: "Yhteiskunta ja Ympäristö", grammarNotes: "Korvaa (replaces)", grammarNotesJa: "Korvaa (取って代わる)" },

  // Module 6 (B2/C1)
  { _id: "m6_1", text: "Huomatessaan virheen, hän korjasi sen heti.", translation: "Upon noticing the mistake, he corrected it immediately.", translationJa: "間違いに気づくとすぐに、彼はそれを訂正しました。", difficulty: "hard", category: "Lauseenvastikkeet", grammarNotes: "Huomatessaan (temporaalinen lauseenvastike)", grammarNotesJa: "Huomatessaan (時間的短縮構文)" },
  { _id: "m6_2", text: "Olen kuullut hänen muuttaneen ulkomaille.", translation: "I have heard that he has moved abroad.", translationJa: "彼が海外に移住したと聞きました。", difficulty: "hard", category: "Lauseenvastikkeet", grammarNotes: "Muuttaneen (referatiivinen lauseenvastike)", grammarNotesJa: "Muuttaneen (引用短縮構文)" },
  { _id: "m6_3", text: "Tehtävä on liian vaikea minun ratkaistakseni.", translation: "The task is too difficult for me to solve.", translationJa: "その課題は私が解決するには難しすぎます。", difficulty: "hard", category: "Lauseenvastikkeet", grammarNotes: "Ratkaistakseni (finaalinen lauseenvastike)", grammarNotesJa: "Ratkaistakseni (目的的短縮構文)" },
  { _id: "m6_4", text: "Sateesta huolimatta jatkoimme matkaa.", translation: "Despite the rain, we continued the journey.", translationJa: "雨にもかかわらず、私たちは旅を続けました。", difficulty: "hard", category: "Lauseenvastikkeet", grammarNotes: "Sateesta huolimatta (despite + elative)", grammarNotesJa: "Sateesta huolimatta (出格＋〜にもかかわらず)" },
  { _id: "m6_5", text: "Hänen tultuaan kotiin aloimme syödä.", translation: "After he came home, we started eating.", translationJa: "彼が帰宅した後、私たちは食事を始めました。", difficulty: "hard", category: "Lauseenvastikkeet", grammarNotes: "Tultuaan (temporaalinen lauseenvastike, passive)", grammarNotesJa: "Tultuaan (時間的短縮構文・受動)" },

  // Module 7 (C1)
  { _id: "m7_1", text: "Yksilön vastuu korostuu nyky-yhteiskunnan eettisissä keskusteluissa.", translation: "The responsibility of the individual is emphasized in the ethical discussions of modern society.", translationJa: "現代社会の倫理的議論において、個人の責任が強調されています。", difficulty: "hard", category: "Abstraktit keskustelut", grammarNotes: "Korostuu (passive/reflexive)", grammarNotesJa: "Korostuu (受動/再帰的動詞)" },
  { _id: "m7_2", text: "Kielen omaksuminen on monisäikeinen, elinikäinen prosessi.", translation: "Language acquisition is a multifaceted, lifelong process.", translationJa: "言語の習得は多面的で生涯にわたるプロセスです。", difficulty: "hard", category: "Abstraktit keskustelut", grammarNotes: "Omaksuminen (noun derived from verb)", grammarNotesJa: "Omaksuminen (動詞から派生した名詞)" },
  { _id: "m7_3", text: "Kulttuurinen omiminen on herättänyt laajaa julkista debattia.", translation: "Cultural appropriation has sparked broad public debate.", translationJa: "文化の盗用は広範な公の議論を巻き起こしています。", difficulty: "hard", category: "Abstraktit keskustelut", grammarNotes: "Herättänyt debattia (perfect tense with abstract noun)", grammarNotesJa: "Herättänyt debattia (完了形と抽象名詞)" },
  { _id: "m7_4", text: "Taide ei ainoastaan heijasta todellisuutta, vaan myös muokkaa sitä.", translation: "Art doesn't only reflect reality, but also shapes it.", translationJa: "芸術は現実を反映するだけでなく、それを形成するものでもあります。", difficulty: "hard", category: "Abstraktit keskustelut", grammarNotes: "Ei ainoastaan... vaan myös (not only... but also)", grammarNotesJa: "Ei ainoastaan... vaan myös (〜だけでなく…もまた)" },
  { _id: "m7_5", text: "On kyseenalaista, voidaanko absoluuttista totuutta koskaan saavuttaa.", translation: "It is questionable whether absolute truth can ever be achieved.", translationJa: "絶対的な真実に到達できるかどうかは疑問の余地があります。", difficulty: "hard", category: "Abstraktit keskustelut", grammarNotes: "Voidaanko saavuttaa (passive potential question)", grammarNotesJa: "Voidaanko saavuttaa (受動可能性疑問文)" }
];

const passages = [
  {
    _id: "p1",
    title: "Pekka ja Sauna",
    titleJa: "ペッカとサウナ",
    text: "Pekka tykkää saunasta. Lauantaina hän lämmittää puusaunan. Saunassa on erittäin kuuma, noin kahdeksankymmentä astetta. Pekka heittää löylyä kiukaalle. Sitten hän juo kylmää vettä ja katsoo järvelle.",
    translation: "Pekka likes sauna. On Saturday, he heats up the wooden sauna. In the sauna, it is very hot, about 80 degrees. Pekka throws water on the stove. Then he drinks cold water and looks at the lake.",
    translationJa: "ペッカはサウナが大好きです。土曜日、彼は薪サウナを温めます。サウナの中は非常に熱く、約80度あります。ペッカはサウナストーブに水をかけて蒸気（ロウリュ）を立たせます。それから冷たい水を飲み、湖を眺めます。",
    category: "Culture & Daily Life",
    difficulty: "A1/A2",
    vocabulary: [
      { word: "tykkää", translation: "likes", translationJa: "好き" },
      { word: "lämmittää", translation: "heats up", translationJa: "温める" },
      { word: "löylyä", translation: "steam thrown on sauna rocks", translationJa: "サウナの蒸気（ロウリュ）" },
      { word: "kiukaalle", translation: "onto the sauna stove", translationJa: "サウナストーブの上に" },
      { word: "järvelle", translation: "towards the lake", translationJa: "湖の方へ" }
    ],
    questions: [
      {
        questionText: "What does Pekka do on Saturday?",
        questionTextJa: "ペッカは土曜日に何をしますか？",
        options: ["He heats up the wooden sauna", "He goes swimming", "He sleeps"],
        optionsJa: ["薪サウナを温める", "泳ぎに行く", "眠る"],
        correctAnswerIndex: 0
      },
      {
        questionText: "What does the word 'löylyä' refer to?",
        questionTextJa: "「löylyä（ロウリュ）」という言葉は何を指しますか？",
        options: ["A cold drink", "Steam from water thrown on hot rocks", "A sauna towel"],
        optionsJa: ["冷たい飲み物", "熱い石に水をかけて出る蒸気", "サウナ用タオル"],
        correctAnswerIndex: 1
      },
      {
        questionText: "In the sentence 'Pekka tykkää saunasta', the word 'saunasta' is in which case?",
        questionTextJa: "文「Pekka tykkää saunasta」で、単語「saunasta」は何格ですか？",
        options: ["Illative (into)", "Inessive (in)", "Elative (from/about)"],
        optionsJa: ["入格 (-han/-hen/-hin: 〜の中へ)", "内格 (-ssa/-ssä: 〜の中で)", "出格 (-sta/-stä: 〜の中から/について)"],
        correctAnswerIndex: 2
      }
    ]
  },
  {
    _id: "p2",
    title: "Tori ja Kahvila",
    titleJa: "広場とカフェ",
    text: "Helsingin kauppatorilla on paljon ihmisiä kesällä. Maija menee torikahvilaan. Hän tilaa korvapuustin ja kahvin. Torilla myydään myös tuoreita mansikoita ja herneitä. Maija nauttii auringosta meren rannalla.",
    translation: "There are many people at Helsinki Market Square in summer. Maija goes to the market cafe. She orders a cinnamon bun and a coffee. Fresh strawberries and peas are also sold at the market. Maija enjoys the sun by the seaside.",
    translationJa: "夏、ヘルシンキのマーケット広場（カウッパトリ）にはたくさんの人がいます。マイヤは市場のカフェへ向かいます。彼女はシナモンロールとコーヒーを注文します。市場では新鮮なイチゴやエンドウ豆も売られています。マイヤは海辺で日光浴を楽しみます。",
    category: "Helsinki Travel",
    difficulty: "A2",
    vocabulary: [
      { word: "kauppatorilla", translation: "at the market square", translationJa: "マーケット広場で" },
      { word: "korvapuustin", translation: "cinnamon bun (accusative)", translationJa: "シナモンロール（対格）" },
      { word: "tuoreita", translation: "fresh (partitive plural)", translationJa: "新鮮な（分格複数）" },
      { word: "mansikoita", translation: "strawberries (partitive plural)", translationJa: "イチゴ（分格複数）" },
      { word: "nauttii", translation: "enjoys", translationJa: "楽しむ" }
    ],
    questions: [
      {
        questionText: "What does Maija order in the cafe?",
        questionTextJa: "マイヤはカフェで何を注文しますか？",
        options: ["Ice cream and water", "A cinnamon bun and a coffee", "Strawberries and peas"],
        optionsJa: ["アイスクリームと水", "シナモンロールとコーヒー", "イチゴとエンドウ豆"],
        correctAnswerIndex: 1
      },
      {
        questionText: "Which word means 'fresh' in Finnish?",
        questionTextJa: "フィンランド語で「新鮮な」を意味する単語はどれですか？",
        options: ["Kesä", "Tuoreita", "Vanha"],
        optionsJa: ["Kesä (夏)", "Tuoreita (新鮮な)", "Vanha (古い)"],
        correctAnswerIndex: 1
      },
      {
        questionText: "In the sentence 'Maija menee torikahvilaan', what case is 'torikahvilaan'?",
        questionTextJa: "文「Maija menee torikahvilaan」で、「torikahvilaan」は何格ですか？",
        options: ["Illative (into)", "Adessive (on/at)", "Allative (onto)"],
        optionsJa: ["入格 (-an: 〜の中へ)", "接格 (-lla: 〜の上で)", "向格 (-lle: 〜の上へ)"],
        correctAnswerIndex: 0
      }
    ]
  },
  {
    _id: "p3",
    title: "Matka Lappiin",
    titleJa: "ラップランドへの旅",
    text: "Talvella monet suomalaiset matkustavat Lappiin hiihtämään ja nauttimaan lumesta. Juna Helsingistä Rovaniemelle kestää noin kahdeksan tuntia. Yöjunassa voi nukkua mukavasti hytissä. Aamulla, kun juna saapuu perille, ulkona on usein pakkasta ja paljon lunta. Ihmiset pukeutuvat lämpimästi ja lähtevät heti ulos. Jotkut vuokraavat moottorikelkan, toiset taas hiihtävät pitkiä matkoja metsässä. Illalla kaikki menevät tietysti saunaan rentoutumaan kylmän päivän jälkeen.",
    translation: "In winter, many Finns travel to Lapland to ski and enjoy the snow. The train from Helsinki to Rovaniemi takes about eight hours. On the night train, you can sleep comfortably in a cabin. In the morning, when the train arrives, it is often freezing outside and there is a lot of snow. People dress warmly and go outside immediately. Some rent a snowmobile, while others ski long distances in the forest. In the evening, everyone naturally goes to the sauna to relax after a cold day.",
    translationJa: "冬、多くのフィンランド人はスキーをして雪を楽しむためにラップランドへ旅行します。ヘルシンキからロヴァニエミまでの列車は約8時間かかります。夜行列車では個室寝台で快適に眠ることができます。朝、列車が目的地に到着すると、外はしばしば氷点下でたくさんの雪があります。人々は暖かい服を着てすぐに外へ出かけます。スノーモービルをレンタルする人もいれば、森の中で長距離をスキーする人もいます。夜には冷えた一日の後で、もちろんみんなサウナに入ってくつろぎます。",
    category: "Winter Travel",
    difficulty: "B1",
    vocabulary: [
      { word: "matkustavat", translation: "they travel", translationJa: "彼らは旅行する" },
      { word: "hiihtämään", translation: "to ski (illative of 3rd infinitive)", translationJa: "スキーしに（第3不定詞入格）" },
      { word: "kestää", translation: "takes (time)", translationJa: "（時間が）かかる" },
      { word: "hytissä", translation: "in a cabin (inessive)", translationJa: "個室・客室で（内格）" },
      { word: "pakkasta", translation: "freezing weather (partitive)", translationJa: "氷点下の寒さ（分格）" },
      { word: "pukeutuvat", translation: "they dress", translationJa: "服を着る" },
      { word: "moottorikelkan", translation: "snowmobile (accusative)", translationJa: "スノーモービル（対格）" },
      { word: "rentoutumaan", translation: "to relax (illative of 3rd infinitive)", translationJa: "くつろぎに（第3不定詞入格）" }
    ],
    questions: [
      {
        questionText: "What do people do in the evening?",
        questionTextJa: "人々は夕方に何をしますか？",
        options: ["Ski in the forest", "Go to the sauna to relax", "Sleep in a cabin"],
        optionsJa: ["森でスキーをする", "サウナに行ってくつろぐ", "個室で眠る"],
        correctAnswerIndex: 1
      },
      {
        questionText: "What does 'pakkasta' mean?",
        questionTextJa: "「pakkasta」はどういう意味ですか？",
        options: ["Freezing weather", "A snowmobile", "A long distance"],
        optionsJa: ["氷点下の寒さ", "スノーモービル", "長い距離"],
        correctAnswerIndex: 0
      },
      {
        questionText: "Which of the following is the 3rd person plural (they) form of the verb?",
        questionTextJa: "動詞の3人称複数形（彼らは〜する）は次のうちどれですか？",
        options: ["Matkustaa", "Matkustamme", "Matkustavat"],
        optionsJa: ["Matkustaa (彼は旅行する/原形)", "Matkustamme (私たちは旅行する)", "Matkustavat (彼らは旅行する)"],
        correctAnswerIndex: 2
      }
    ]
  },
  {
    _id: "p4",
    title: "Suomalainen koulujärjestelmä",
    titleJa: "フィンランドの教育制度",
    text: "Suomen koulujärjestelmä on maailmankuulu. Lapset aloittavat koulun yleensä seitsemänvuotiaina. Peruskoulu kestää yhdeksän vuotta, ja se on kaikille ilmainen. Koulussa tarjotaan myös ilmainen ja terveellinen lämmin lounas joka päivä. Opettajat ovat korkeasti koulutettuja, sillä heillä kaikilla on yliopistotutkinto. Suomalaisessa koulussa ei ole paljon kokeita tai kotitehtäviä verrattuna moniin muihin maihin. Sen sijaan korostetaan leikkiä, luovuutta ja yhdessä oppimista. Tavoitteena on antaa jokaiselle lapselle yhtäläiset mahdollisuudet oppia ja menestyä elämässä taustasta riippumatta.",
    translation: "The Finnish school system is world-famous. Children usually start school at the age of seven. Comprehensive school lasts nine years, and it is free for everyone. The school also provides a free and healthy warm lunch every day. Teachers are highly educated, as they all have a university degree. In a Finnish school, there are not many exams or homework compared to many other countries. Instead, play, creativity, and learning together are emphasized. The goal is to give every child equal opportunities to learn and succeed in life, regardless of their background.",
    translationJa: "フィンランドの教育制度は世界的に有名です。子どもたちは通常7歳で小学校に入学します。総合基礎学校（義務教育）は9年間続き、誰でも無料です。学校では毎日、健康的で温かい昼食も無料で提供されます。教員は皆修士号を持っているため、高度な教育を受けています。フィンランドの学校には他の多くの国と比べてテストや宿題があまりありません。その代わりに遊びや創造性、共に学ぶことが強調されます。背景に関わらず、すべての子どもに人生で学び成功するための平等な機会を与えることが目標とされています。",
    category: "Society & Education",
    difficulty: "B2/C1",
    vocabulary: [
      { word: "maailmankuulu", translation: "world-famous", translationJa: "世界的に有名な" },
      { word: "peruskoulu", translation: "comprehensive school", translationJa: "基礎学校（小中一貫義務教育学校）" },
      { word: "ilmainen", translation: "free of charge", translationJa: "無料の" },
      { word: "yliopistotutkinto", translation: "university degree", translationJa: "大学の学位（修士号）" },
      { word: "kokeita", translation: "exams (partitive plural)", translationJa: "試験・テスト（分格複数）" },
      { word: "korostetaan", translation: "is emphasized (passive)", translationJa: "強調される（受動態）" },
      { word: "yhtäläiset mahdollisuudet", translation: "equal opportunities", translationJa: "平等な機会" },
      { word: "riippumatta", translation: "regardless of (+ elative)", translationJa: "〜に関わらず（出格支配）" }
    ],
    questions: [
      {
        questionText: "How long is comprehensive school?",
        questionTextJa: "基礎学校（peruskoulu）は何年間続きますか？",
        options: ["Seven years", "Nine years", "Twelve years"],
        optionsJa: ["7年間", "9年間", "12年間"],
        correctAnswerIndex: 1
      },
      {
        questionText: "What is the meaning of 'ilmainen'?",
        questionTextJa: "「ilmainen」の意味は何ですか？",
        options: ["Expensive", "Healthy", "Free of charge"],
        optionsJa: ["高価な", "健康的な", "無料の"],
        correctAnswerIndex: 2
      },
      {
        questionText: "In the word 'seitsemänvuotiaina' (at the age of seven), what case ending is used?",
        questionTextJa: "単語「seitsemänvuotiaina（7歳で）」で使われている格語尾は何ですか？",
        options: ["Essive (-na)", "Translative (-ksi)", "Partitive (-a/-ä)"],
        optionsJa: ["様格 (-na/-nä: 〜として/〜のときに)", "変格 (-ksi: 〜に)", "分格 (-a/-ä)"],
        correctAnswerIndex: 0
      }
    ]
  }
];

module.exports = {
  sentences,
  passages
};
