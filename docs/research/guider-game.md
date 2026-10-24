# Guider Game 調査メモ（Phase 0）

調査日: 2026-10-24
目的: 「暮らしの場面でフィンランド語を使う」モードの参考にするため、Guider Game（Gamu ry, 2019）の 21 本のミニゲームの中身と全体のしくみを、公開資料から特定する。

- 実行ファイル・ゲーム素材はダウンロードしていない。読んだのは公開ページと PDF 文書だけ。
- 内容は自分の言葉で要約した。原文の引用は短いものだけにしている。
- **いちばん重要な一次資料**は教師用指導書 *Guider Game – Opettajan opas*（Gamu ry, 2019, 60 ページ）。gamu.fi から配布されていた PDF が Wayback Machine に完全な形で残っている（2022-01-19 の保存版。2021-01-16 の保存版は 1 MB で途切れている）。21 本すべてについて「どこにあるか／何をするか／学習目標／フィンランド語学習との関係／追加課題」が書かれている。
  - https://web.archive.org/web/20220119180304/http://gamu.fi/game/GGopettajanopas.pdf

---

## 1. 概要

| 項目 | 内容 | 出典 |
| --- | --- | --- |
| 目的 | 移民の若者の kotoutuminen（社会への適応）を支えるモバイルゲーム。フィンランド社会・tapakulttuuri（習慣）・自然・歴史・学び・働くことを、軽いノリのミニゲームで紹介する | 指導書 p.4 |
| 対象 | 来て間もない 16〜29 歳。母語でも遊べるのでフィンランド語力は前提にしない。フィンランド語の授業で使うなら A2 程度（統合訓練の終盤、VALMA、LUVA など）が目安。フィンランドの若者・社会科（yhteiskuntaoppi）・進路指導（opo）でも使える | 指導書 p.4–5, Guider Game Finland の告知 |
| 構成 | 7 テーマ（asuminen 住まい／terveys 健康／työ 仕事／kulttuuri 文化／oppiminen 学び／raha お金／yhteiskunta 社会）× 3 本 = 21 本。舞台は Koti（家）→ Lähiö（団地・近所）→ Kaupunki（街）の 3 つ | 指導書 目次, p.6–7 |
| 語り | 名前のない主人公（男女を選ぶ）。漫画（sarjakuva）風の絵と吹き出し。家の中を調べて物を集める探索パートがあり、各ミニゲームは独立した場面 | fi.wikipedia, 指導書 p.6, Kaunela 談 |
| 言語 | suomi, selkosuomi, englanti, arabia, kurdi, somali, dari。プレイ中いつでも言語を切り替えられる（母語で読んでからフィンランド語で確かめる、という使い方を指導書が勧めている） | 指導書 p.4, 「Guider Gamen kieliversiot」 |
| 制作 | Gamu ry（トゥルクの非営利団体）が企画・内容・絵。プロジェクトマネージャー兼デザイン・脚本 Maria Haapasalo、漫画家 Tuuli Hypén（イラスト・ゲーム化）、グラフィックデザイナー Ulriikka Lipasti。プログラムと利用者テストは Turku AMK の学習型プロジェクト環境 theFIRMA（Unity、主なプログラマーは時期により Matias Mäntyniemi → Sallamari Rantanen ほか）。指導書の教育内容は S2 教師 Laura Kuokkanen。アラビア語・ダリー語・クルド語版は Diak の通訳学生 | 指導書 奥付, gamu.fi 各記事, Diak |
| 資金 | STEA（社会保健省の下の助成機関）。2017〜2019 年の 3 年プロジェクト | 指導書 p.4, gamu.fi/guider-game |
| 公開 | 2019-09-06 にトゥルク中央図書館で公開イベント。Android / iOS / Windows、無料、登録不要、インストール後はオフライン、個人データを集めない、広告なし | 公開イベント告知, 指導書 p.4, プライバシーポリシー |
| 版 | ①本編（星を集めて決まった順で進む）②教師用版 Teacher Version（どのミニゲームにも好きな順で入れる）③Guider Game Finland（2019-12、フィンランドの中高生向けに絞った版。fi / en） | 指導書 p.4, 「Uusi pelkistetty Suomi-versio」 |
| 配布状況 | gamu.fi はドメインが存在しない（2026-10-24 に DNS で確認）。Google Play（パッケージ名 `com.Gamu.GuiderGame`、500+ ダウンロード、最終更新 2019-10-28）は 2024-07 の保存版までは表示、2025-01 の保存版は 404。App Store（販売元 Gamu ry、v1.3 / 2019-10-30、2.4 GB、「© Gamu ry」）は 2024-07 の保存版まで表示、現在は 404。配布は終わっている | DNS, Wayback（Google Play, App Store）|

---

## 2. 21 本のミニゲーム一覧

- 「確度」はゲームの中身（何をするか）についての確度。**21 本とも指導書に明記されているので「確認済み」**。ただし細部（採点の仕方など）が書かれていない場合は「備考」に書いた。
- 「遊び方の型」は、資料の記述をもとにこちらで分類したもの。
- 名前の表記は資料によって揺れる。目次と本文で違う場合は両方書いた。
- 出典の略号は表の下にまとめた。

### Asuminen（住まい）

| ミニゲーム（原語） | 場所 | プレイヤーがすること | 遊び方の型 | 学べること（内容／フィンランド語） | 確度 | 出典 |
| --- | --- | --- | --- | --- | --- | --- |
| Mikropeli（電子レンジ） | Koti → 台所 → 電子レンジ | 食べ物の中から電子レンジで温められるものを見つけ、指でドラッグして入れ、温める時間を選ぶ | 分類ドラッグ＋数値選択 | 電子レンジの安全な使い方（金属や向かない容器）。命令形・禁止の短い指示（例: 金属を入れるな、3 分温めて）とボタン操作の指示文 | 確認済み | [OPAS] p.8 |
| Kierrätyspeli（リサイクル） | Lähiö → 家の隣のごみ置き場 | 犬を連れた老人に話しかけ、手持ちのごみを運び、正しいごみ箱に分別する。繰り返しで覚える作り。テスト後に物を大きく・数を減らし、進み具合のメーターを付けた | 分類ドラッグ（＋会話） | リサイクルの目的と主な素材。素材語彙（tölkki, laatikko, purkki, pussi, pullo, rasia）、受動態（「リサイクルガラスから新しい瓶が作られる」型の文） | 確認済み | [OPAS] p.9–10, [TIURA] §4.1 |
| Asumisen säännöt（住まいのルール） | Kaupunki → Asuminen → 屋上に鍵のある集合住宅 | 8 部屋ある集合住宅で、部屋ごとのテーマの課題を解く。庭でも物をクリックするとヒントが出る。テーマは防火、夜間の静けさ（yörauha）、近所づきあい、共同洗濯室（pesutupa）など | 探索＋選択肢（部屋ごとの課題） | 集合住宅での暮らしのルール。ei saa + 動詞／pitää + 動詞／voi + 動詞。語彙: kotivakuutus, isännöitsijä, talonmies, vuokralainen, palovaroitin, vesivahinko, tuulettaa など | 確認済み（各部屋の課題の形式の細部は記載なし） | [OPAS] p.11–15 |

### Terveys（健康）

| ミニゲーム（原語） | 場所 | プレイヤーがすること | 遊び方の型 | 学べること | 確度 | 出典 |
| --- | --- | --- | --- | --- | --- | --- |
| Stressipeli（ストレス） | Kaupunki → Terveys → 雨雲に座るうさぎ | ストレスのかかる場面（例: お金の心配がある）が 1 つずつ出て、3 枚の解決カードから一番よいものを選ぶ。選ぶたびに評価が返り、ストレスが減るほど背景が晴れていく | 選択肢（カード）＋即時フィードバック | ストレスへの対処法。気持ちを言葉にする表現、気分に関わる動詞。心理士（Lounais-Suomen mielenterveysseura の Serene 活動）が内容に協力 | 確認済み | [OPAS] p.16, [BLOG-TERVEYS], [TIURA] §3 |
| Terveyspyörä／Terveyspeli／Terveysvisailu（健康クイズ） | Kaupunki → Terveys → 保健センター（terveyskeskus） | 薬のキャラクターが司会のルーレットを回し、4 分類（保健サービス、救急と当番医、健康知識、性の健康）のクイズに答える。選択肢は 2 つ以上。間違えるとウイルスが襲ってきて、指で消してからでないと次に進めない | クイズ（ルーレット）＋アクション（タップ） | 自分の健康の守り方と、フィンランドの医療サービスの使い方。医療語彙、ゼロ人称（Millä kielillä terveyskeskuksessa voi kommunikoida? 型） | 確認済み | [OPAS] p.19–22, [BLOG-TERVEYS] |
| Ruokapeli（食事） | Kaupunki → Terveys → ショッピングカートの見えるスーパー | 出てくるいろいろな食べ物を選んで、食品ピラミッド（ruokakolmio）をバランスよく埋める。設計段階の記事では 3 日分の食事を集める形。お菓子を避け野菜を増やすのが目標。食べ方は 1 つではないので選択肢を多く用意した | 選択（分類）＋メーター | 健康的な食事は「多様さ」が基本。食べ物の名前、terveellinen, vilja, proteiini, kuitu, rasva, herkku | 確認済み | [OPAS] p.23, [BLOG-TERVEYS] |

### Työ（仕事）

| ミニゲーム（原語） | 場所 | プレイヤーがすること | 遊び方の型 | 学べること | 確度 | 出典 |
| --- | --- | --- | --- | --- | --- | --- |
| Ammatinvalintapeli（職業選び。テスト時の呼び名は「työvoimatoimisto-minipeli」） | Kaupunki → Työ → TE-toimisto の建物 | 忙しい TE-toimisto（職業安定所）で、なぜか自分が職員を手伝うことに。来所した客に 6 つの質問をし、答えから 6 つの職業のうち一番合うものを選ぶ。テストでは「なぜ他人を面接するのか」がわかりにくいという声が続いた | 会話選択（質問を選ぶ）→ マッチング | 面接・仕事探しでよく出る質問と話題、自分の強み。質問の作り方、自己紹介、好みを表す言い方、教育・職業の語彙 | 確認済み | [OPAS] p.24–25, [TIURA] §3–4 |
| Työnhakupeli（仕事探し、3 部構成） | Kaupunki → Työ → カフェ | 主人公のガンビア出身の友だち Aminata または Demba の仕事探しを手伝う。①CV（ansioluettelo）の枠に、毎回 3 つの候補から合う文・画像を選んで入れる ②ネットで仕事を探す。会話の合間に友だちが出すクイズに答える ③面接の日の朝から面接までを追い、行動の選択肢を選ぶ。うまく導けば仕事か実習先が得られる | 選択肢（穴埋め）→ 会話＋クイズ → 分岐する物語 | CV の書き方、応募の仕方、ネットでの情報の探し方、面接で気をつけること。公的な書類の言葉づかい、場面による言い方の違い、言葉以外の振る舞い | 確認済み | [OPAS] p.26–31, [BLOG-TYÖ] |
| Yrittäjyyspeli／Yrityspeli（起業） | Kaupunki → Työ → 建物の上を走る人 | 走り続けるキャラクターを操作して障害物を跳び越え、物を集める。3 ステージ（liikeidea 事業アイデア → rahoitus 資金 → paperiasiat 書類）で、それぞれロゴ・お金の袋・必要書類を集める。途中で起業に必要なこと（事業計画、保険、事業形態など）の説明が出る。ステージごとに難しくなる | アクション（ランナー）＋説明 | 起業の流れを単純化して紹介。抽象語彙（perustaa yritys, liiketoimintasuunnitelma, toiminimi, osakeyhtiö, rahoitus, yrittäjäeläkevakuutus, kirjanpito） | 確認済み | [OPAS] p.32–33, [BLOG-TYÖ] |

### Kulttuuri（文化）

| ミニゲーム（原語） | 場所 | プレイヤーがすること | 遊び方の型 | 学べること | 確度 | 出典 |
| --- | --- | --- | --- | --- | --- | --- |
| Perhemuistipeli（家族の神経衰弱） | Lähiö → バス停の裏の、庭に人がいる集合住宅 | 集合住宅の窓に並ぶカードをめくって、9 つの家族の絵のペアを探す。ペアがそろうとその家族が紹介される（ステップファミリー、ルームメイト、同性カップル、猫と暮らす年金生活の音楽家など）。「違い」を特別扱いしない描き方を意識した | 神経衰弱（記憶）＋紹介文 | フィンランドの多様な家族・住まいの形。家族語彙、婚姻状況、職業、自己紹介の型 | 確認済み | [OPAS] p.34–35, [BLOG-SUUNNITTELU] |
| Tapakulttuuripeli（習慣） | Kaupunki → Kulttuuri → サウナの建物 | 最初に動き回るキャラクターを、画面をタップして同じ色の角へ押し込む。1 色そろうと、その分野の「絵のなぞなぞ」が開き、絵の場面で何が起きているのかを選択肢から推理する。分野は 4 つ（学校・職場／余暇／交通／家）。例: 近所の人があいさつしない理由、バスで隣に座らない理由。Finnish Nightmares 風のユーモアで、ステレオタイプを笑えるように描いた | アクション（仕分け）→ 絵を見て選ぶクイズ | フィンランド人の言葉以外のコミュニケーション、文化差に気づき解釈すること（スモールトークが苦手、平等など） | 確認済み | [OPAS] p.36, [BLOG-TAPA], [VIIHDE] |
| Vaatepeli（服選び） | Koti → ドアの横の衣装戸棚 | 季節と天気が示され、6 分類（シャツ、ズボン、上着、靴下、靴、帽子類）から 1 つずつ選んで主人公に着せる。多すぎ・少なすぎなら、合う服装になるまで続く | 選択（着せ替え）＋判定 | 天気に合った服装、四季。服の語彙約 30 語（villapaita, talvitakki, villasukat, pitkät kalsarit, talvisaappaat, kumisaappaat, pipo, lapaset など）。文字が少なく絵が中心 | 確認済み | [OPAS] p.37–38 |

### Oppiminen（学び）

| ミニゲーム（原語） | 場所 | プレイヤーがすること | 遊び方の型 | 学べること | 確度 | 出典 |
| --- | --- | --- | --- | --- | --- | --- |
| Infopaikka（インフォメーション） | Kaupunki → Oppiminen → インフォキオスク | 遊び終えたミニゲームの「infokirja（情報の冊子）」がたまっていく資料室。8 本分（起業、職業選び、食事、役所、仕事探しの CV、電子レンジ、リサイクル、採集）がある | 資料の閲覧（ゲームではない） | 全テーマの復習 | 確認済み（ただし**遊ぶミニゲームではなく情報の拠点**。指導書の目次ではオッピミネンの 3 本の 1 つに数えられている） | [OPAS] 目次, p.39 |
| Keräilypeli（森の採集） | Kaupunki → Oppiminen → 街の中の森の島 | 食べられるベリー 3 種・きのこ 3 種と、毒のあるもの各 2 種の紹介のあと、落ちてくるベリーやきのこをかごを動かして受け止める。最初はベリーだけ、次にきのこだけ、最後は両方で、だんだん難しくなる。毒のものが入ると減点。うまくいくとレシピがもらえる | アクション（受け止め）＋紹介＋報酬 | フィンランド人と森の関係、よく採るベリーときのこ、毒の見分け。ベリー・きのこの名前、保存食の語彙（hillo, sose, pakastaa, kuivata, syötävä, myrkyllinen）、レシピに出る sinä の命令形 | 確認済み | [OPAS] p.40–41 |
| Opintopolkupeli（学びの道） | Kaupunki → Oppiminen → 空の星座 | 星空の星が学校（peruskoulu, ammattikoulu, lukio, AMK, yliopisto）を表す。職業を 1 つ選び、その職業に必要な進学の道を星から星へ指でなぞる。5 本正しく描けばクリア。VALMA 教育にも触れる | 並べ替え（経路をなぞる） | フィンランドの教育制度と、職業に就くまでの段階。学校と職業の語彙 | 確認済み | [OPAS] p.42–43 |

### Raha（お金）

| ミニゲーム（原語） | 場所 | プレイヤーがすること | 遊び方の型 | 学べること | 確度 | 出典 |
| --- | --- | --- | --- | --- | --- | --- |
| Laskujenmaksupeli（請求書の支払い） | Kaupunki → Raha → 屋上に封筒のある集合住宅 | 画面を流れる請求書を、期日（左端）に着く前にタップして払う。お金が足りなければ右下の紙幣をタップして補充。間に合わないと黄色、次に赤で戻ってきて、最後は maksuhäiriömerkintä（信用情報への支払い遅延の記録）が付く | アクション（タップ、速さ） | 期日までに払うこと、払わないとどうなるか。vuokra, vesilasku, sähkölasku, verkkopankki, eräpäivä | 確認済み | [OPAS] p.44 |
| Otto-automaatin käyttö（ATM の使い方） | Lähiö → 銀行の隣の Otto-automaatti | 家で見つけたキャッシュカード（台所の戸棚）と暗証番号（黄色い手紙）を持って、ATM の画面の指示どおりに操作する。母語で遊んでいるときは「?」の下に画面の訳が出る | 手順の操作（シミュレーション）＋探索で集めた物を使う | ATM の使い方。機械の言葉（syötä kortti / tunnusluku, näppäile, tapahtuma hylätty / keskeytetty） | 確認済み（画面ごとの操作の細部は記載なし） | [OPAS] p.6, p.45, [VIIHDE] |
| Budjetointipeli／Budjettipeli（家計） | Kaupunki → Raha → ショッピングセンター | 3 か月間の収入と支出をやりくりし、貯金を目指す。毎月の必須の支払いを翌月に残さないようにしながら、4 分類（住まい、健康、余暇、移動）から有料の項目を選ぶ。歯医者などの急な出費もある。悪い選択は幸福度メーター（ハート）を下げ、マイナスになると負け | 資源管理（選択肢＋メーター） | 計画的なお金の使い方、急な出費への備え、通貨や物価の違う国での貯金。rahatilanne, pysyä budjetissa, tulot, pakolliset menot、余暇・出費の語彙、キャラクターの一言（買ってよかった、など） | 確認済み | [OPAS] p.46–47 |

### Yhteiskunta（社会）

| ミニゲーム（原語） | 場所 | プレイヤーがすること | 遊び方の型 | 学べること | 確度 | 出典 |
| --- | --- | --- | --- | --- | --- | --- |
| Lakipeli（法律） | Kaupunki → Yhteiskunta → 法の条文の看板がある市庁舎 | 市庁舎の美術展で絵をクリックすると、その分野の法律クイズに答える。分野は家族、警察、在留、仕事、健康、社会、学び、自然、交通（自然享受権 jokamiehenoikeudet も）。最初の 5 枚を終えて「メガスター」が満ちると、小さな絵のジョーカー問題が開く。答えると補足説明が出る。文字が多く、テストでは難しいという声も | クイズ（選択肢）＋補足説明＋ボーナス解放 | フィンランドの法律、権利と義務。oikeus, velvollisuus, sallittu, kielletty, pakollinen, lupa、voida / saada、pitää / täytyy / olla pakko | 確認済み | [OPAS] p.48–51, [TIURA] §3 |
| Suomi-visa（フィンランドクイズ、指導書内では Suomi-palapeli とも） | Kaupunki → Yhteiskunta → フィンランド地図の看板 | ピースに分かれたフィンランド地図を、ピースごとの分野の問題に正解して埋めていく。分野は 9 つ（文化、歴史、自然、習慣、社会、トゥルク、地理、スポーツ、発明）で各 10 問、選択肢あり。「知っていると楽しい」系の問題も混ざる | クイズ（選択肢）＋地図パズルの完成 | フィンランド文化の特徴。perinneruoka, kansalliseläin, avantouinti, äitiyspakkaus, heijastin, revontulet など | 確認済み | [OPAS] p.52–54, [NASRULLAH] |
| Virastopeli（役所） | Kaupunki → Yhteiskunta → 役所の建物 | 最初に各役所の仕事の説明を受ける。そのあと、1 つずつ出る役所に、それが扱う用件（例: 身分証 → 警察）をはめ込む。用件はパズルのピースの形をしていて、形からも正解がわかる。絵をクリックすると用件の名前が出る。わからなければ説明書を見られる | マッチング（パズル型の分類ドラッグ） | 役所の種類と仕事。verokortti, lapsilisä, perheenyhdistäminen, työmarkkinatuki, muuttoilmoitus, henkilökortti, toimeentulotuki, asumistuki, oleskelulupa など | 確認済み | [OPAS] p.55, [BLOG-SUUNNITTELU] |

### 本数の数え方について

- 指導書の地図の説明（p.6–7）では、遊べるミニゲームは Koti 2 本＋Lähiö 3 本＋Kaupunki 15 本 = **20 本**。
- 目次では各テーマ 3 本ずつ = 21 項目で、Oppiminen の 3 本目が **Infopaikka（情報の拠点）**。fi.wikipedia の「21 本」は目次の数え方に合う。
- 指導書の地図の説明に出てくる名前（「otto­automaattipeli」「budjettipeli」「yrittäjyyspeli」「terveyspyörä」「opintopolku-peli」）は、本文の見出しと少し違う。同じゲームを指していることは場所と説明から確認できる。

### 出典の略号

| 略号 | 資料 | URL |
| --- | --- | --- |
| [OPAS] | Guider Game – Opettajan opas（Gamu ry, 2019） | https://web.archive.org/web/20220119180304/http://gamu.fi/game/GGopettajanopas.pdf |
| [BLOG-TERVEYS] | Ruokapeli, stressipeli ja terveysvisailu（gamu.fi, 2018-08-13） | https://web.archive.org/web/20190716020557/http://gamu.fi/ruokapeli-stressipeli-ja-terveysvisailu |
| [BLOG-TYÖ] | Pelejä työnhausta（2018-12-12） | https://web.archive.org/web/20190716015349/https://gamu.fi/peleja-tyonhausta |
| [BLOG-TAPA] | Tapakulttuurista yleistämisen uhalla（2019-02-14） | https://web.archive.org/web/20190716015839/http://gamu.fi/tapakulttuurista-yleistamisen-uhalla |
| [BLOG-SUUNNITTELU] | Suunnittelupalaveri Gamun toimistolla（2018-03-19） | https://web.archive.org/web/20190716025047/http://gamu.fi/suunnittelupalaveri-gamun-toimistolla |
| [TIURA] | Katariina Tiura: *Mobiilipelin käytettävyystestausprosessin kehittäminen – case: Guider Game*（Turku AMK, 2018） | https://www.theseus.fi/handle/10024/153224 ／ PDF 保存版 https://web.archive.org/web/20241009050254/https://www.theseus.fi/bitstream/handle/10024/153224/Tiura_Katariina.pdf?sequence=1&isAllowed=y |
| [VIIHDE] | Viihdevintiöt: Guider Game opettaa maahanmuuttajanuorille arjen taitoja…（2020-01-16） | http://viihdevintiot.com/2020/01/16/guider-game-opettaa-maahanmuuttajanuorille-arjen-taitoja-ja-suomalaisia-tapoja/ |
| [NASRULLAH] | Nasrullah Rahimin haastattelu（gamu.fi, 2019-09-19） | https://web.archive.org/web/20191023125004/http://gamu.fi/nasrullah-rahimin-haastattelu |

---

## 3. 全体のつくり

### 3.1 舞台と進み方

1. **Koti（家）**: 居間と台所の 2 部屋。部屋を調べて物をタップすると、右下の持ち物リストに入る（後で ATM のカードと暗証番号の手紙を使う）。歓迎の手紙が最初の導入。ミニゲームは Vaatepeli と Mikropeli。必要な物を忘れたら家に戻れる。テスト後に、進む方向を示す動く緑の矢印と最初の説明が足された。持ち物のアイコンはリュック → 三角矢印に変えたが、見つけにくいという声が残った。
2. **Lähiö（団地・近所）**: 玄関からバス停まで。ミニゲームは Kierrätyspeli、Otto-automaatti、Perhemuistipeli。キオスクで用事を済ませると、先に進むための星がもらえる。
3. **Kaupunki（街）**: バスで移動。左端にテーマのメニューが出て、遊べるミニゲームがあるテーマに星の印が付く。テーマを押すと、街の地図にそのテーマのミニゲームのアイコンが浮かび上がる。家と近所のミニゲームもアイコンで見える。

- **解放**: ミニゲームは、必要な数の星（＝点数）があるときだけ開く。持っている星の数で遊べる順番が決まり、足りなければ星の付いた別のテーマに移れる（指導書 p.6–7）。2018 年のテスト時点では 11 本が開いていて、進むのに必須なのは 3 本、残りは好きな順だった（[TIURA] §3）。
- **テーマの順番**: 指導書に固定の順番は書かれていない。紹介文はどれも、最初の自分の家から始まり、仕事探しやお金のような複雑な課題へ進む、と説明している。指導書の街のミニゲームの列挙順（採集 → 住まいのルール → フィンランドクイズ → 請求書 → 役所 → 学びの道 → 起業 → ストレス → 習慣 → 食事 → 法律 → 職業選び → 健康クイズ → 家計 → 仕事探し）が解放の順かどうかは**不明**。
- **やり直し**: クリア済みのミニゲームには緑のチェックが付き、何度でも遊び直せる。指導書は語彙を定着させるために繰り返しを勧めている。
- **教師用版**: 星による制限なしで、どのミニゲームにも好きな順で入れる。

### 3.2 フィードバックと採点

- 共通: ミニゲームの成果は星。テスト後の提案で、取った星をミニゲームのアイコンの上に表示するようになった（[TIURA] §4.1）。
- ゲームごとのフィードバック（資料に書かれているもの）:
  - 選んだ直後に評価が返る（Stressipeli）。状況が良くなると背景も変わる。
  - 間違えると罰の小ゲーム（健康クイズのウイルス退治）。
  - 正しくなるまで続ける（Vaatepeli: 服が多すぎ・少なすぎなら続行）。
  - メーター（Ruokapeli のピラミッド、Budjetointipeli の幸福度ハート、Kierrätyspeli の進み具合）。
  - 段階的に悪くなる警告（Laskujenmaksupeli: 黄 → 赤 → 支払い遅延の記録）。
  - 報酬（Keräilypeli のレシピ、Lakipeli のボーナス問題、Suomi-visa の地図完成）。
  - 答えのあとに補足説明（Lakipeli）。
  - infokirja: 多くのミニゲームのあとに説明の冊子が開き、Infopaikka にたまる。
- 星の数え方（何点で星いくつか）は**不明**。

### 3.3 主人公と漫画の語り

- 主人公は名前がなく、男女を選ぶ。テストでは主人公に自分の名前を付けたいという希望もあった（[TIURA]）。
- 漫画家 Tuuli Hypén による表情豊かな登場人物。各ミニゲームには固有の人物がいる（犬連れの老人、ガンビア出身の友だち Aminata / Demba、TE-toimisto の客、Hasan という名の人物など）。
- 吹き出しをタップして会話を進める。テストでは「どの吹き出しをタップすれば進むのか」がわかりにくく、統一された（[TIURA]）。
- 習慣の説明は、絵の場面を見て理由を考える形（Tapakulttuuripeli）。ユーモアで、ステレオタイプが強まりすぎないようにした（[BLOG-TAPA]）。
- 字の読めない人にも伝わるよう絵を重視しているが、全部を楽しむにはどれかの言語で読める必要がある（[BLOG-SUUNNITTELU]）。

### 3.4 selkosuomi と多言語の扱い

- 7 言語を**プレイ中いつでも**切り替えられる（ミニゲームの途中でも）。ミニゲームによって言葉の難しさが違うため（[kieliversiot]）。
- 指導書の勧め: 母語で文を読んでから、フィンランド語でどう言うかを見る。フィンランド語の授業なら selkosuomi 版が一番よい（内容がところどころ難しいため）。
- ATM のゲームでは、フィンランド語の画面をそのまま見せ、母語で遊んでいるときだけ「?」の下に訳を出す（本物のフィンランド語の画面に慣れさせる設計）。
- 技術: 文は Google Sheets に集め、翻訳者は自分の言語の列だけを埋める。Unity の PolyglotUnity プラグインで取り込み、TextMesh Pro でフォントを作る。アラビア文字をつなげるために Arabic Support for Unity を使い、クルド語・ダリー語の独自の文字は Unicode を調べてプラグインを直した（Kaunela の論文、Rantanen のインタビュー）。翻訳者は文脈のない文の一覧を渡されたので、ゲームを遊んで場面を確かめる必要があった。
- 翻訳: アラビア語・ダリー語・クルド語は Diak の地域通訳の学生。翻訳者として Samana Shoaib の名前が公開イベントの告知にある。

### 3.5 教師用の版と指導書

- 教師用版 = 星の制限なしで全ミニゲームを選べる版（Android / Windows / iOS）。
- 指導書（60 ページ）の構成: ミニゲームごとに「どこにあるか／テーマ／何が起きるか／学習目標／フィンランド語・コミュニケーションの学習にどう役立つか／追加課題（グループでの会話、ロールプレイ、マインドマップ、ワークシート）」。巻末に解答。
- 追加課題の例: ごみ出しで近所の人と揉めるロールプレイ、ストレスチェック、病気の場面で行き先（terveysasema, päivystys, 112 など）を選ぶ練習、住まい探しの読解（人物紹介と物件広告を組み合わせる）、法律の穴埋め、ミリオネア風クイズ、役所の語彙のリレー競走。
- 指導書自体が、そのままアプリの教材の手本になる（4 章）。

---

## 4. このアプリへの示唆

### 4.1 前提

- Guider Game は**社会への適応のゲーム**で、フィンランド語は「おまけで学べる」位置づけ。このアプリでは逆に、**場面はフィンランド語を使うための舞台**にする。
- 真似するのは**遊び方の型と全体のつくり**（家 → 近所 → 街、星で解放、ミニゲームのあとの説明、言語をいつでも切り替え）。ゲームの文章・絵・問題そのものは使わない（5 章）。
- いまのアプリのデータは `server/src/config/seedData.js` の `sentences`（`text` / `translation` / `translationJa` / `spokenText` / `category` / `difficulty` など）と `passages`（本文、語彙、選択問題）。シナリオのデータも同じように「フィンランド語・日本語訳・英訳・話し言葉版」を持たせると、既存の部品（音声、単語帳、復習）とつなげやすい。

### 4.2 遊び方の型ごとの部品案

どれも「データ（JSON）を差し替えれば中身が変わる部品」にする。共通の項目: `id`, `scene`（koti / lähiö / kaupunki）, `theme`, `titleFi`, `titleJa`, `instructionFi`, `instructionSelko`（やさしいフィンランド語）, `instructionJa`, `items[]`, `feedback`, `infoCard`（終わったあとの説明カード）, `stars`。

| 型（参考にしたゲーム） | 部品名案 | データの形（例） | 合うフィンランド語の内容（例） |
| --- | --- | --- | --- |
| 分類ドラッグ（Kierrätyspeli, Mikropeli, Virastopeli） | `SortGame` | `bins: [{id, labelFi, labelJa}]`, `items: [{fi, ja, binId, explanationFi}]` | ごみの分別（biojäte, kartonki, lasi, metalli, muovi, sekajäte）と「Tämä kuuluu biojätteeseen.」型の文。役所と用件（Kela / poliisi / verotoimisto / maistraatti → DVV）。格の練習にもなる（kuulua + 入格） |
| 着せ替え・条件に合うものを選ぶ（Vaatepeli, Ruokapeli） | `OutfitGame`（汎用名 `ConstraintPicker`） | `condition: {fi, ja}`（例: 「−15 °C, sataa lunta」）, `slots: [{category, options: [{fi, ja, score}]}]`, `rule` | 天気の言い方（On pakkasta. Sataa räntää.）と服の語彙、「Laitan pipon päähän.」「Puen talvitakin.」型の動詞。食べ物と量（kaksi viipaletta leipää） |
| 状況カードの選択肢（Stressipeli, Tapakulttuuripeli） | `ChoiceCard` | `situations: [{promptFi, promptJa, image?, options: [{fi, ja, correct, feedbackFi, feedbackJa}]}]` | その場で言う一言を選ぶ。例: お店で「Saanko kuitin?」、近所の人に「Moi!」、バスで「Pääsenkö ohi?」。正解でないものにも理由を付けたフィードバック |
| 会話選択・分岐（Työnhakupeli, Ammatinvalintapeli） | `DialogueScene` | `nodes: [{speaker, lineFi, lineJa, spokenFi, choices: [{fi, ja, next, effect}]}]` | 病院の予約の電話（Haluaisin varata ajan.）、TE-toimisto・Kela の窓口、面接（Kerro vähän itsestäsi.）。書き言葉と話し言葉の両方を `lineFi` / `spokenFi` に持たせる（いまの `spokenText` と同じ考え方） |
| 手順のシミュレーション（Otto-automaatti） | `ProcedureSim` | `steps: [{screenFi, screenJa, expectedAction, hintSelko}]` | 機械・画面のフィンランド語（Syötä kortti. Näppäile tunnusluku. Valitse summa. Tapahtuma keskeytetty.）。セルフレジ、切符の券売機、HSL アプリ、図書館の貸出機 |
| 経路をなぞる・並べ替え（Opintopolkupeli） | `OrderGame` | `goalFi`, `steps: [{fi, ja}]`（正しい順）, `distractors[]` | 手続きの順番（引っ越しの届け → 住所登録 → Kela）、レシピの手順（命令形: Kuori, pilko, keitä）、一日の予定（ensin, sitten, lopuksi） |
| ルーレット・地図を埋めるクイズ（Terveyspyörä, Suomi-visa, Lakipeli） | `QuizBoard` | `categories: [{id, labelFi, questions: [{qFi, qJa, options, answer, explainFi}]}]`, `unlock`（何問で次が開くか） | 分類ごとの語彙クイズ（健康、交通、自然享受権）。答えのあとの補足説明でゼロ人称や義務・許可の言い方（saa, pitää, täytyy）を見せる |
| 神経衰弱（Perhemuistipeli） | `MemoryPairs` | `pairs: [{a: {fi}, b: {ja | image}, introFi}]` | 家族・親族の語彙（isovanhemmat, puoliso, sisarukset）、そろったら短い自己紹介文（Olen Sini. Asun Turussa…） |
| 資源管理（Budjetointipeli） | `BudgetSim` | `months`, `income`, `fixedCosts[]`, `choices: [{fi, ja, cost, wellbeing}]`, `events[]` | お金の語彙（vuokra, sähkölasku, eräpäivä, säästää, maksaa）、数字・値段の読み方（いまの NumberPractice とつながる）、「Onko tämä tarjouksessa?」 |
| アクション（Laskujenmaksu, Keräily, Yrittäjyys） | 後回し | — | 作るのに手間がかかるわりに、言葉の練習は少ない（指導書も、文字が少ない／速さ中心と書いている）。最初は作らない |

- **全体の部品**: 舞台の地図（`SceneMap`: Koti → Lähiö → Kaupunki、テーマのアイコン、星で解放、クリア済みにチェック）、終わったあとの説明カード（`InfoCard`、たまって資料室になる＝Infopaikka にあたる）、言語の切り替え（fi / selkosuomi / ja を途中でも切り替え。いまの「日本語訳を表示」を発展させる）。
- **フィードバックの方針**: 正解か不正解かだけでなく、なぜそうなのかを 1〜2 文のフィンランド語（＋日本語）で返す。間違えたら正しくなるまで続ける型（Vaatepeli 方式）は学習者に優しく、作りも簡単。

### 4.3 最初に作るテーマの候補

1. **Koti ＋ Lähiö の「住まいと近所」（おすすめ）**
   - 理由: Guider Game 自身もここから始めている（具体的で、語彙が目に見える物）。必要な部品は `SortGame`（ごみの分別）、`OutfitGame`（天気と服）、`ChoiceCard`（近所づきあい、あいさつ）の 3 つで、どれもデータの差し替えだけで中身を増やせる。語彙は A1〜A2 で、いまの例文データ（日常生活のカテゴリー）とつなげやすい。
   - 最初の 3 本の例: ①ごみの分別（素材の語彙＋kuulua の入格）②今日の天気と服（天気の表現＋服の語彙＋laittaa / pukea）③階段で会った近所の人（あいさつ・短い会話、話し言葉版つき）。
2. **Raha の「お店・ATM・請求書」**
   - 理由: `ProcedureSim`（ATM、セルフレジ）は「画面のフィンランド語をそのまま読む」練習になり、実生活ですぐ役に立つ。数字の練習（NumberPractice）を再利用できる。
3. **Terveys の「病院にかかる」**
   - 理由: `DialogueScene` を作る価値がいちばん高い場面（予約の電話、症状を言う: Minulla on kuumetta. Päätä särkee.）。ただし会話の分岐を作る手間が大きいので 2 番目以降がよい。

---

## 5. 権利と問い合わせ先

### 5.1 ライセンス表記

- 指導書の奥付は「© Gamu ry」。文章・絵・レイアウトは Guider Game プロジェクトチーム（Maria Haapasalo, Tuuli Hypén, Ulriikka Lipasti）、教育内容は Laura Kuokkanen と書かれている。**Creative Commons などの自由な利用を認める表記は、調べた範囲（指導書、gamu.fi の保存版、Google Play と App Store の保存版、プライバシーポリシー）では見つからなかった**。App Store の著作権欄も「© Gamu ry」だけ。
- gamu.fi の保存版のフッターは「© 2019 gamu.」「© 2020 Gamu RY」。
- ゲームは無料配布だったが、無料であることは自由に複製・改変してよいことを意味しない。**通常の著作権（全権利留保）として扱うのが安全**。
- **STEA の資金による成果物の扱い**: 今回の調査では、STEA の助成条件の中に、成果物の著作権や公開ライセンスを定めた文書を確認できなかった（STEA の助成ガイドの PDF の URL が 404 だった）。一般に STEA の助成は「申請どおりの目的に使う」ことを求める国の助成で、成果物の権利は助成を受けた団体に残るものと考えられるが、**これは推測**。確かめるなら STEA に問い合わせるか、その年の助成ガイド（avustusopas）と助成決定の条件を読む必要がある。
- 実務上の方針: Guider Game の**文章・問題・絵・キャラクターは使わない**。参考にするのは**遊び方の型と全体のつくり**（アイデアやゲームのしくみは一般に著作権の対象外）にとどめ、中身はこのアプリで一から書く。「Guider Game を参考にした」とクレジットに書くのは問題ない。

### 5.2 連絡できそうな相手（公開されている範囲）

| 相手 | 役割（当時） | 公開されていた連絡先・所属 | 出典 |
| --- | --- | --- | --- |
| Gamu ry | 開発・発売元。トゥルクの非営利団体（Y-tunnus 2779675-8 と記載）。現在の活動状況は**不明**（gamu.fi は消滅。企業向けのオープンデータ API では見つからなかったが、団体登記簿は調べていない） | 2019 年の住所 Puutarhakatu 7b a1, 20100 Turku | [yhteystiedot] |
| Vesa Malinen | Gamu ry 事務局長（toiminnanjohtaja） | 2019 年の連絡先ページに gamu.fi のメールアドレスあり（ドメイン消滅のため届かない可能性が高い） | [yhteystiedot] |
| Maria Haapasalo | プロジェクトマネージャー、デザイン・脚本・グラフィック | 同上 | [yhteystiedot], fi.wikipedia |
| Tuuli Hypén | 漫画家・イラスト | 2019 年の連絡先ページに個人のメールアドレスあり | [yhteystiedot] |
| Ulriikka Lipasti | グラフィックデザイナー | 同上 | [yhteystiedot] |
| アプリのサポート窓口 | Google Play に載っていた開発者の連絡先 | guidergamefinland@gmail.com（住所はレンパーラ。誰の住所かは不明） | [PLAY] |
| Turku AMK theFIRMA | プログラム担当（Sallamari Rantanen ほか） | Turku AMK の代表窓口経由 | gamu.fi 各記事 |
| Suomen pelimuseo（タンペレ） | ゲームを収蔵し、2021 年に紹介の短いドキュメンタリーを公開 | 博物館の代表窓口 | YouTube |

- 問い合わせはしていない（指示どおり）。連絡するなら、まず Google Play のサポートアドレスか、Suomen pelimuseo 経由で Maria Haapasalo さんにつないでもらうのが現実的。

---

## 6. 調べた資料の一覧と、見つからなかったもの

### 6.1 役に立った資料

| 資料 | 内容 | URL |
| --- | --- | --- |
| 教師用指導書 Opettajan opas（PDF, 60 ページ） | 21 本すべての説明、地図と進み方、言語、教師用版 | https://web.archive.org/web/20220119180304/http://gamu.fi/game/GGopettajanopas.pdf |
| gamu.fi の Wayback 保存版（CDX で約 290 件の URL を列挙） | プロジェクトのブログ記事 15 本前後、ダウンロードページ、連絡先 | CDX: http://web.archive.org/cdx/search/cdx?url=gamu.fi/*&output=json&fl=timestamp,original,mimetype&collapse=urlkey |
| └ Guider Game のページ（2019, 2021） | 目的、テーマ、資金、デモのトレーラーへのリンク | https://web.archive.org/web/20190716030143/http://gamu.fi/guider-game ／ https://web.archive.org/web/20210116091810/https://gamu.fi/guider-game/ |
| └ Ruokapeli, stressipeli ja terveysvisailu | 健康の 3 本の設計 | https://web.archive.org/web/20190716020557/http://gamu.fi/ruokapeli-stressipeli-ja-terveysvisailu |
| └ Pelejä työnhausta | 仕事探し（3 部）と起業の設計 | https://web.archive.org/web/20190716015349/https://gamu.fi/peleja-tyonhausta |
| └ Tapakulttuurista yleistämisen uhalla | 習慣ゲームの考え方 | https://web.archive.org/web/20190716015839/http://gamu.fi/tapakulttuurista-yleistamisen-uhalla |
| └ Suunnittelupalaveri Gamun toimistolla | 家族の神経衰弱の設計、作り方の流れ | https://web.archive.org/web/20190716025047/http://gamu.fi/suunnittelupalaveri-gamun-toimistolla |
| └ Käyttäjätestaukset / Kehittäjätiimi esittäytyy / Innovaatiopäivä | テスト、開発体制（Unity、シーンごと）、アイデアの日 | https://web.archive.org/web/20190716022521/http://gamu.fi/kayttajatestaukset ／ https://web.archive.org/web/20190716022548/http://gamu.fi/kehittajatiimi-esittaytyy ／ https://web.archive.org/web/20190716030636/http://gamu.fi/amkn-innovaatiopaiva |
| └ Guider Gamen kieliversiot / Darin ja kurdin kielet / Käännösjärjestelmä | 多言語のしくみ | https://web.archive.org/web/20190825105744/https://gamu.fi/guider-gamen-kieliversiot ／ https://web.archive.org/web/20201001175510/http://gamu.fi/darin-ja-kurdin-kielet-nyt-mukana-pelissa ／ https://web.archive.org/web/20190825110659/https://gamu.fi/kaannosjarjestelma-guidergameen-haastattelussa-jarkko-kaunela |
| └ Uusi pelkistetty Suomi-versio | Guider Game Finland | https://web.archive.org/web/20201001185922/http://gamu.fi/uusi-pelkistetty-suomi-versio-guider-game-finland |
| └ Integration 2018 / Julkistustilaisuuden ohjelma / Nasrullah Rahimin haastattelu | 受賞候補、公開イベント、プレイヤーの感想 | https://web.archive.org/web/20190716021756/http://gamu.fi/integration-2018 ／ https://web.archive.org/web/20190920071935/https://gamu.fi/julkistustilaisuuden-ohjelma ／ https://web.archive.org/web/20191023125004/http://gamu.fi/nasrullah-rahimin-haastattelu |
| └ Lataa Guider Game / Privacy policy / Yhteystiedot | 配布形態（Windows は zip、Android、教師用版、指導書）、プライバシー、連絡先 | https://web.archive.org/web/20190920074156/http://gamu.fi/lataa-guider-game ／ https://web.archive.org/web/20190920073651/https://gamu.fi/guider-game-privacy-policy ／ https://web.archive.org/web/20190716015338/http://gamu.fi/yhteystiedot |
| └ Guider Game -tietosuojaseloste（PDF, 2022） | データを集めない、広告なし、プッシュ通知なし | https://web.archive.org/web/20240706235538/https://gamu.fi/wp-content/uploads/2022/08/Guider-Game-tietosuojaseloste.pdf |
| Google Play の保存版 [PLAY] | パッケージ名、説明、更新日、サポート連絡先 | https://web.archive.org/web/20240721175244/https://play.google.com/store/apps/details?id=com.Gamu.GuiderGame |
| App Store の保存版（米国ストア） | 説明（Google Play と同じ文）、v1.3 の更新内容、販売元、著作権表記、「Guider Game Finland」も同じ販売元 | https://web.archive.org/web/20240713085806/https://apps.apple.com/us/app/guider-game/id1478608488 |
| Tiura の卒業論文（Turku AMK, 2018） | 2018 年のテスト 2 回（52 人）、画面、改善点 | https://www.theseus.fi/handle/10024/153224 ／ https://web.archive.org/web/20241009050254/https://www.theseus.fi/bitstream/handle/10024/153224/Tiura_Katariina.pdf?sequence=1&isAllowed=y |
| Kaunela の卒業論文（Turku AMK, 2019） | ローカライズのしくみ（PolyglotUnity, Google Sheets, アラビア文字） | https://www.theseus.fi/handle/10024/169290 ／ https://web.archive.org/web/20241008182459/https://www.theseus.fi/bitstream/handle/10024/169290/Kaunela_Jarkko.pdf?sequence=2&isAllowed=y |
| fi.wikipedia | 概要、受賞候補、参考文献の一覧 | https://fi.wikipedia.org/wiki/Guider_Game |
| Viihdevintiöt（2020-01-16） | 遊んだ人の紹介記事（ATM、家計、家族の形など） | http://viihdevintiot.com/2020/01/16/guider-game-opettaa-maahanmuuttajanuorille-arjen-taitoja-ja-suomalaisia-tapoja/ |
| Diak のニュース（2019-11-07, 保存版） | Diak の学生による翻訳 | https://web.archive.org/web/2021/https://www.diak.fi/2019/11/07/mobiilipeli-maahanmuuttajanuorille-tukee-kotouttamista/ |
| Dialogikasvatus（保存版） | 学校向けの教材紹介（中学・高校、社会科・国語） | https://web.archive.org/web/20210304040550/https://dialogikasvatus.fi/material/guider-game/ |
| AUNE プログラムの最終報告（2020, 保存版） | Y-Säätiö などの住まい支援プロジェクトのまとめの中で、良い例として言及（fi.wikipedia の「Y-Säätiö の評価」の出典） | https://web.archive.org/web/20210215004340/https://asuntoensin.fi/assets/files/2020/01/AUNE-ohjelman-loppuraportti-Karppinen-Kehitt%C3%A4misosuuskunta-Avainv%C3%A4ki.pdf |
| YouTube: デモのトレーラー（2018-02-16, 85 秒, チャンネル Roope Lipasti, 説明「Guider gamen demo」） | 初期デモの映像（字幕なし。映像は見ていない） | https://www.youtube.com/watch?v=VyiBBo65xmk |
| YouTube: Suomen pelimuseo の短いドキュメンタリー（2021-02-09, 約 7 分） | 作り手の経験と反響（字幕トラックなし。映像は見ていない） | https://www.youtube.com/watch?v=PHsSlkBpjz0 |

### 6.2 見つからなかったもの・読めなかったもの

- **App Store の保存版**: 米国ストアのページ（2024-07-13）だけ読めた。フィンランドのストアのページと教師用版（id1479373727）は、CDX の検索中に Wayback が一時的に落ちて確認できなかった。
- **Theseus の検索**: Cloudflare のボット確認が出るため、サイト内検索も論文ページも直接は読めなかった（突破はしていない）。上の 2 本は gamu.fi の記事からリンクをたどり、Wayback の PDF で読んだ。ほかに Guider Game を扱った論文（Turku AMK のプログラマーやデザイナー、Diak の通訳学生など）があるかは**未確認**。gamu.fi の保存版には「guider-gameHammar-Suutari」「guider-gameHanna」という壊れた URL があり、Guider Game を出典に挙げた他の論文がある可能性がある。
- **YouTube の字幕**: 2 本とも字幕トラックがない。音声の書き起こしは取っていない（有料の vidIQ の書き起こしツールは使っていない）。
- **Facebook / X（@GuiderGame）の投稿**: ログインが必要なため読んでいない。
- **Turun Sanomat / Aamuset の記事**: 有料、またはリンク切れのため読んでいない。
- **Finnish Game Awards 2019**（Turku の Best Useful Game 候補）、**Suomen Pakolaisapu**（Vuoden kotoutumisteko 2018 の上位 3 候補）: gamu.fi の Integration 2018 の記事と fi.wikipedia で事実だけ確認。主催者側のページは読んでいない。
- **Suomen pelimuseo の「100 suomalaista peliä」の項目**: 古い URL は別のページになっていて、項目を見つけられなかった。
- **STEA の助成条件の文書**: PDF の URL が 404。
- **Gamu ry の現在の登記状況**: 企業向けのオープンデータ API には出てこなかった。団体登記簿（yhdistysrekisteri）は調べていない。
- **ゲーム内の文章そのもの**（問題文、選択肢、infokirja の中身）と**星の数え方**: 公開資料には書かれていない。

### 6.3 次に調べるとよいところ

1. App Store のフィンランドのストアと教師用版の保存版（`apps.apple.com/fi/app/guider-game/id1478608488`、`id1479373727`）。フィンランド語の説明文がある可能性がある。
2. Theseus をブラウザで人が開き、「Guider Game」で検索（Diak の通訳学生の論文、Turku AMK のデザインの論文、Hammar-Suutari などの論文）。
3. Suomen pelimuseo のドキュメンタリーを実際に見る（約 7 分）。画面の構成や操作が見られる。
4. 権利: STEA の助成ガイド（2017〜2019 年版）の成果物に関する部分、PRH の団体登記簿で Gamu ry の状況を確認。
5. 必要なら、Google Play のサポートアドレス、または Suomen pelimuseo 経由で Maria Haapasalo さんに、参考にしてよい範囲を問い合わせる（外部への書き込みなので、ユーザーの了承が必要）。
