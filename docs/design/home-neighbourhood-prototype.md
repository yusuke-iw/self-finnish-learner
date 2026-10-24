# 「暮らしの場面」モード 試作の設計案（住まいと近所）

作成日: 2026-10-24（同日、ユーザーの決定を反映して改訂）
前提: `docs/research/guider-game.md`（特に 3 章「全体のつくり」と 4 章「このアプリへの示唆」）
状態: 設計案。実装はこのあと `implementer`（Antigravity / Codex に委譲）、コンテンツは `content-editor` が担当する。

- Guider Game から借りるのは**遊び方の型と全体のつくり**（家 → 近所 → 街という舞台の並び、遊んだあとの説明カード、表示の言語をいつでも切り替えられること）だけ。文・問題・絵・キャラクター・名前は使わない。この文書のフィンランド語はすべて自作の下書き。
- Guider Game とは主従が逆。場面は**フィンランド語を使うための舞台**で、遊ぶたびに「その場で使う語と文」を聞いて・選んで・読む。
- 点数は付けない。どのミニゲームにもいつでも入れる（Guider Game の教師用版と同じく、順番の制限なし）。並び順は「おすすめの順」として見せるだけ。
- この文書に出てくるファイルのパスと関数名は、2026-10-24 の `main`（`e4eb1f8`）にあるものだけ。新しく作るものは「新規」と書いた。

---

## 1. 目的と範囲

### 1.1 目的

- 暮らしの具体的な場面（家の玄関、ごみ置き場、階段）で、A1〜A2 の語彙と短い文を**使う**練習をする。
- 既存の練習（例文のセッション、文法ドリル、数字）は「文を一つずつ」練習する。このモードは「場面の中で、決まった目的のために」語と文を選ぶ。間違えたら理由を短いフィンランド語（＋訳）で返し、正しくなるまで選び直す。
- 遊んだあとに、場面の語彙を単語帳に入れられ、関連するレッスン（`curriculumData.js` の l10 Asuminen、l11 Sää ja vuodenajat）の例文練習へ進める。

### 1.2 やること（試作の範囲）

一覧には次の順（おすすめの順）で並べる。Guider Game の教師用指導書の舞台の順（Koti → Lähiö → Kaupunki）に沿う。

| おすすめの順 | ミニゲーム | 舞台 | 型（部品） | 中心になる語彙・文法 |
| --- | --- | --- | --- | --- |
| ① | Sää ja vaatteet（天気と服） | Koti | `OutfitGame`（`ConstraintPicker` の一種） | 天気の言い方、服、`laittaa / pukea` ＋全体目的語、入格（`päähän, jalkaan`） |
| ② | Jätekatoksessa（ごみ置き場で） | Lähiö | `SortGame` | 素材・ごみの種類、`kuulua` ＋入格 |
| ③ | Rappukäytävässä（階段で） | Lähiö | `DialogueScene`（一本道） | あいさつ・自己紹介・あいづち、話し言葉版 |

- 共通の部品: 場面の一覧（試作の `SceneMap`）、遊んだことの ✔ 印、説明カード（`InfoCard`）、表示の切り替え（fi / selko / en、ja はデータがあるときだけ）。
- 入口: ナビゲーションに 1 項目（`/scenes`）と、ホームに 1 枚のカード（決定済み）。

### 1.3 やらないこと

- 点数・評価・順番の制限。どのミニゲームも最初から遊べる。
- Kaupunki（街）の場面と、住まい・近所以外のテーマ（健康、お金、役所など）。一覧に「準備中」として見せるだけ。
- 絵・イラスト・キャラクターの画像。試作は絵文字と CSS の色と枠だけ。
- ドラッグ＆ドロップ。試作はすべて**タップで選ぶ**方式（スマホで確実に動き、依存パッケージも要らない）。
- 会話の分岐（選んだ答えで話が変わる）。データの形は分岐できるようにしておき、試作の会話は一本道。
- 音声認識（`useSpeechRecognition`）で言わせる練習、アクション型（速さ・反射）のゲーム。
- 場面の進み具合のサーバー同期（✔ 印は localStorage だけ）。
- 復習スケジュールへの新しい種類（`scene:` キー）。復習は単語帳（既存の `word:`）を通して行う。
- 説明カードをためて読む資料室（試作は終わりの画面と、一覧からの読み返しだけ）。

---

## 2. 遊ぶ人の流れ

### 2.1 全体の流れ

1. ナビの「暮らし」（または ホームの「暮らしの場面」カード）→ `/scenes`。
2. 一覧で、場面（Koti / Lähiö）ごとにミニゲームが ①②③ の番号つきで並ぶ。上に「おすすめの順に遊ぶと、家から近所へ進めます」の一言。遊んだことがあるものには ✔。Kaupunki は「準備中」。
3. どれか選ぶ → `/scenes/<gameId>`。上に「戻る」「タイトル」「進み具合（3 / 8 など、今どこまで進んだか）」「表示の切り替え」。
4. 遊ぶ（4 章）。答えるたびに正誤と理由。間違えたら同じ問題にもう一度答える。
5. 終わり: 「Valmis!」、説明カード（2〜3 枚）、この場面の語彙（＋単語帳）、「このテーマの例文を練習」（関連レッスンのセッションへ）、「もう一度」「次のおすすめ（②へ）」「一覧へ」。
6. 一覧に戻ると、遊んだものに ✔ が付いている。

**終わったら残るもの**

| 残るもの | どこに | 既存の仕組み |
| --- | --- | --- |
| 遊んだことがあるか（✔ 印。点数なし） | localStorage（新規キー `finnishLearnerSceneProgress`） | 新規 `client/src/utils/sceneProgress.js` |
| 今日の学習数（ホームの目標とストリーク） | 既存の学習統計 | `recordAnswer()`（`client/src/utils/studyStats.js`） |
| 選んだ語彙 | 単語帳（＋復習スケジュールの `word:<id>`） | `addWord()`（`client/src/utils/wordBook.js`）。PR 6 で `source.type: 'scene'` を足す |
| 次の練習 | 関連レッスンのセッション | `/sessions?lessonId=<id>&level=<n>`（ホームの `handleLevelClick` と同じ URL） |

### 2.2 画面の図

**一覧 `/scenes`**

```
┌──────────────────────────────────┐
│ 暮らしの場面          [fi|selko|en]   │
│ おすすめの順に遊ぶと、家から近所へ      │
│ 進めます。どれからでも遊べます。        │
├──────────────────────────────────┤
│ 🏠 Koti                               │
│ ┌──────────────────────────────┐ │
│ │ ① 🧥 Sää ja vaatteet        ✔    │ │
│ │       Weather and clothes        │ │
│ └──────────────────────────────┘ │
│ 🏢 Lähiö                              │
│ ┌──────────────────────────────┐ │
│ │ ② ♻️ Jätekatoksessa              │ │
│ │       At the waste shelter       │ │
│ ├──────────────────────────────┤ │
│ │ ③ 🗣️ Rappukäytävässä             │ │
│ │       In the stairwell           │ │
│ └──────────────────────────────┘ │
│ 🏙️ Kaupunki              準備中        │
└──────────────────────────────────┘
```

（2 行目の訳は表示モードに従う。fi / selko のときは出ない。3.5）

**① 天気と服**

```
┌──────────────────────────────────┐
│ ← Sää ja vaatteet     1 / 3 [fi|selko|en] │
│ ❄️ −15 °C                              │
│ Ulkona on viisitoista astetta pakkasta,│
│ ja sataa lunta.            🔊  🐢       │
│ (It's fifteen degrees below zero…)     │
├──────────────────────────────────┤
│ Päässä    [pipo] [lippis] [ei mitään]  │
│ Päällä    [talvitakki] [sadetakki]     │
│           [t-paita]                    │
│ Jalassa   [talvikengät] [kumisaappaat] │
│           [sandaalit]                  │
│ Käsissä   [lapaset] [sateenvarjo]      │
│           [ei mitään]                  │
│                                        │
│ ✖ Jalassa: Lumessa tarvitset lämpimät │
│   kengät.                              │
│            [ Lähden ulos! ]            │
└──────────────────────────────────┘
```

**② ごみの分別**

```
┌──────────────────────────────────┐
│ ← Jätekatoksessa      3 / 8 [fi|selko|en] │
│ Laita jokainen roska oikeaan astiaan.  │
│ (Put each piece of rubbish in…)        │
│                                        │
│          ┌──────────────┐              │
│          │     🥛        │  🔊  🐢       │
│          │  maitotölkki  │              │
│          │ (milk carton) │              │
│          └──────────────┘              │
│  ┌───────────┐ ┌───────────┐          │
│  │ Biojäte    │ │ Kartonki   │          │
│  ├───────────┤ ├───────────┤          │
│  │ Paperi     │ │ Lasi       │          │
│  ├───────────┤ ├───────────┤          │
│  │ Metalli    │ │ Muovi      │          │
│  ├───────────┤ └───────────┘          │
│  │ Sekajäte   │                        │
│  └───────────┘                        │
│ ✔ Tyhjä maitotölkki kuuluu            │
│   kartonginkeräykseen.  🔊   [次へ]    │
└──────────────────────────────────┘
```

**③ 階段で**

```
┌──────────────────────────────────┐
│ ← Rappukäytävässä     2 / 4 [fi|selko|en] │
│              [puhekieli | kirjakieli]  │
│ 👨 Matti (naapuri)                     │
│ ┌──────────────────────────────┐   │
│ │ Tervetuloa! Mä oon Matti, asun │ 🔊 🐢│
│ │ tossa kolmannessa kerroksessa. │   │
│ └──────────────────────────────┘   │
│  (Welcome! I'm Matti, I live on…)      │
│                                        │
│  [ Hauska tutustua! Mä asun tokassa  ] │
│  [ kerroksessa.                      ] │
│  [ Kiitti, samoin!                   ] │
│  [ Moi moi!                          ] │
│                                        │
│ ✖ "Samoin" vastataan toivotukseen…    │
└──────────────────────────────────┘
```

**終わりの画面（3 本共通）**

```
┌──────────────────────────────────┐
│ Valmis!                                │
├──────────────────────────────────┤
│ ℹ️ Jätekatos                            │
│ Kerrostalon pihalla on usein jätekatos.│
│ …                                      │
│ Kielioppi: kuulua + mihin?             │
│            → biojätteeseen             │
├──────────────────────────────────┤
│ この場面の語彙                          │
│ biojäte  biowaste          [＋単語帳]   │
│ lajitella  to sort         [✓ 追加済み] │
├──────────────────────────────────┤
│ [このテーマの例文を練習（Asuminen）]     │
│ [もう一度] [次のおすすめ ③] [一覧へ]     │
└──────────────────────────────────┘
```

（ボタンの文言は UI の言語。ja なら日本語、en なら英語。3.5）

---

## 3. 全体の部品

### 3.1 画面とルーティング

既存の `client/src/App.jsx` は、ホーム以外のページを `lazy()` で読み込み、`<Routes>` に並べ、`NavigationBar` に `<Link>` を並べている。同じやり方で 2 つ足す。

| パス | ページ（新規） | 役目 |
| --- | --- | --- |
| `/scenes` | `client/src/pages/Scenes.jsx` | 場面の一覧（試作の SceneMap） |
| `/scenes/:gameId` | `client/src/pages/SceneGame.jsx` | ミニゲーム 1 本。`type` を見て部品を選び、終わりの画面も出す |

- ナビ: `nav.scenes`（ja「暮らし」、en「Daily life」）を `nav.numbers` の後ろあたりに足す。スマホ幅（`App.css` の `@media (max-width: 768px)`）ではナビのリンクは横スクロールになるので、8 項目でも崩れない（ブラウザで確かめる）。
- ホーム: `client/src/pages/Home.jsx` の `progress-actions` の上に「🏘️ 暮らしの場面」カード（PR 1）。
- `SceneGame.jsx` の分担: データの読み込み、表示モード、ヘッダー、終わりの画面、✔ 印の記録。ゲームの中身は各部品が持ち、終わったら `onFinish()` を呼ぶ。

```
SceneGame
 ├─ SceneHeader（戻る・タイトル・進み具合・SceneTextToggle）
 ├─ type === 'outfit'   → OutfitGame
 ├─ type === 'sort'     → SortGame
 ├─ type === 'dialogue' → DialogueScene
 └─ 終わったら SceneResult（InfoCard・語彙・関連レッスン・次のおすすめ）
```

### 3.2 舞台の一覧（SceneMap）

- 試作: `Scenes.jsx` に、場面ごとの見出し（ホームの `unit-section` / `unit-header` と同じ見た目）と、ミニゲームのカードを並べる。絵の地図は作らない。
- **並び順**: `scenes.json` の `order`（koti 1 → lahio 2 → kaupunki 3）と、各場面の `gameIds` の順。番号 ①②③ はこの順に通しで振る（データに番号は持たせず、`index.js` の `getRecommendedGames()` が数える）。
- カードには、遊んだことがあれば ✔。説明カードを読み返すボタン（PR 6）。
- 終わりの画面の「次のおすすめ」は、この順で次のゲーム（最後なら出さない）。
- 後回し: 絵の地図、家の中を調べて物を集める探索、資料室。

### 3.3 遊んだことの記録（✔ 印）

点数は付けない。残すのは「遊んだことがあるか」だけ（残すかどうかは 9 章。おすすめは残す）。

- 新規 `client/src/utils/sceneProgress.js`（localStorage、既存の `studyStats.js` と同じ書き方。壊れたデータは捨てる、保存の失敗は無視）:

```js
// key: 'finnishLearnerSceneProgress'
{ version: 1, played: { [gameId]: { firstPlayedAt: ISO 文字列, lastPlayedAt: ISO 文字列 } } }

getSceneProgress()        // 正規化して返す
markGamePlayed(gameId)    // 最後まで遊んだら呼ぶ。firstPlayedAt は最初の 1 回だけ
hasPlayed(gameId, progress?)
```

- 「最後まで遊んだ」で印を付ける（途中でやめたら付けない）。
- サーバーには送らない（別の端末では印が付いていない）。

### 3.4 説明カード（InfoCard）

- 新規 `client/src/components/scenes/InfoCard.jsx`。ミニゲームの終わりに 2〜3 枚。1 枚は「暮らしの知識」（例: ごみの分け方は自治体で違う）、1 枚は「文法の一言」（例: `kuulua + mihin?`）。
- 文は `{ fi, selko?, en, ja? }` を持ち、表示モードに従う（3.5）。🔊 で fi（selko モードなら selko）の文を読む。
- 一覧から読み返せるのは PR 6。ためて読む資料室は後回し。

### 3.5 表示の切り替え（fi / selko / en / ja）と UI の言語

このアプリには言語の切り替えが 2 つある。役目を分ける。

| 切り替え | 場所 | 何を変えるか | 値 | 保存先 |
| --- | --- | --- | --- | --- |
| **UI の言語**（既存） | ナビの右の `LanguageToggle` | アプリの文言（ボタン、見出し、「次へ」など。`translations.js` の `t()`） | ja / en | `finnishLearner_language`（既存） |
| **場面の文の見せ方**（新規） | このモードの中の `SceneTextToggle` | 場面のデータの文（指示、ごみの名前、天気、会話、フィードバック、説明カード）のフィンランド語の種類と、下に出す訳 | fi / selko / en / ja | `finnishLearnerSceneTextMode`（新規） |

- 2 つは連動しない。UI が日本語でも、場面の文の初期値は「フィンランド語＋英語」（`en`）。
- 場面のタイトルやカードの 2 行目（訳）も、場面のデータなので後者に従う。UI の言語に従うのは `translations.js` の文言だけ。

**場面の文の見せ方**

| モード | 指示・フィードバック・説明カード | ゲームの語と文（服、ごみの名前、天気、会話） |
| --- | --- | --- |
| `fi` | 書き言葉のフィンランド語（`fi`） | フィンランド語だけ |
| `selko` | やさしいフィンランド語（`selko`、なければ `fi`） | フィンランド語だけ |
| `en`（初期値） | フィンランド語の下に英語（`en`） | フィンランド語の下に英語 |
| `ja` | フィンランド語の下に日本語（`ja`） | フィンランド語の下に日本語 |

- `ja` のボタンは、そのゲームのすべての文に `ja` があるときだけ出す（`hasJapanese(game)`）。一部の文にしか `ja` がないゲームでは出さない（日本語と英語が混ざらないように）。一覧ではすべてのゲームに `ja` があるときだけ出す。保存されたモードが `ja` で、開いたゲームに `ja` がなければ `en` で表示する（保存は `ja` のまま）。
- ゲームの答えにあたる語（服、ごみの名前、会話の選択肢）はどのモードでも**フィンランド語を主**にする（語学のアプリなので）。`selko` は指示・ヒント・フィードバック・説明カードだけに使う。
- プレイの途中でも切り替えられ、進み具合は消えない。
- 新規 `client/src/utils/sceneText.js`: `pickText(text, mode)` → `{ main, sub }`（`sub` は訳。`en` / `ja` モード以外は `null`。`ja` モードで `ja` がなければ `en`）、`hasJapanese(game)`、`getSceneTextMode()` / `setSceneTextMode(mode)`（初期値 `en`）。既存の `getTranslation()`（`LanguageContext.jsx`）は UI の言語で訳を選ぶので、場面の文には使わない。
- 新規 `client/src/components/scenes/SceneTextToggle.jsx`（3〜4 つのボタン、`aria-pressed`。`LanguageToggle.jsx` と同じ作り）と `SceneText.jsx`（`pickText` の結果を `main` と小さい `sub` で表示）。
- **会話の話し言葉／書き言葉**は別の切り替え（`DialogueScene` の中だけ。4.4）。

### 3.6 試作で作るもの・後回しにするもの

| 部品 | 試作（PR） | 後回し |
| --- | --- | --- |
| 一覧（SceneMap） | おすすめの順のカード、✔、準備中（1）、説明カードの読み返し（6） | 絵の地図、探索、資料室 |
| 遊んだことの記録 | ✔ 印（1） | サーバー同期 |
| InfoCard | 終わりの画面に表示（1） | 資料室 |
| fi / selko / en / ja | 指示・フィードバック・説明カード・訳（1） | 項目ごとの selko |
| 話し言葉 | 会話の切り替え（4） | ほかのゲームの話し言葉 |
| 単語帳 | 語彙の一覧（1）、＋単語帳（6） | 間違えた語だけ自動で入れる |

---

## 4. 3 本のミニゲーム

### 4.1 共通

- **操作**: すべてボタンのタップ。ボタンは高さ 44px 以上、スマホ幅では 2 列。キーボードでも押せる（`<button>`）。数字キーで選ぶなどの近道は後回し。
- **正解**: `playCorrectSound()`、ボタンを緑（既存の `correct-choice`）、フィンランド語の文と 🔊、「次へ」。
- **不正解**: `playIncorrectSound()`、押したボタンを赤（`wrong-choice`）にしてから選び直せるように戻す、理由を 1〜2 文（表示モードに従う）。同じ問題にもう一度答える（正しくなるまで）。
- **終わり**: `playLessonCompleteSound()`、`onFinish()`。`SceneGame` が `markGamePlayed()` を呼び、終わりの画面を出す。
- **学習統計**: 1 問につき 1 回（その問題に最初に答えたとき）`recordAnswer()` を呼ぶ（ホームの「今日 n 問」に入る）。選び直しでは呼ばない。終わりに 1 回 `saveProgress({ studyStats: getStudyStats() })`（`WordBook.jsx` と同じく、失敗は `console.warn` だけ）。
- **音声**: `playAudio(text, id, 'fi-FI', speed, speaker)`（`client/src/utils/audio.js`）。🔊 は 1.0、🐢 は 0.6（`NumberPractice.jsx` と同じ）。話し手は `getSpeakerById()`（`client/src/utils/speakers.js`）。会話以外は `DEFAULT_SPEAKER`（Aino）。
  - 自動再生は会話の相手のセリフだけ。ほかは押したときだけ。
  - TTS の失敗で `alert()` が出る不具合は PR 0 で先に直す（付録の 1）。
- **1 回の長さ**: 1〜3 分。`playLength` 件をデータから選ぶ（足りなければ全部）。順番はシャッフル。
- **ロジックの置き場所**: 画面の部品（`.jsx`）は描画と状態だけにし、進め方と正誤の判定は純粋な関数として `client/src/utils/` に置く（`numberPractice.js` と同じ。oxlint の `react/only-export-components` が `.jsx` から関数を export すると警告し、CI は `--deny-warnings` で落ちるため）。

### 4.2 ① 天気と服（OutfitGame）

**遊び方**: 玄関で今日の天気が出る（気温と、天気の文）。4 つの部位（päässä 頭、päällä 上半身、jalassa 足、käsissä 手）から 1 つずつ選び、「Lähden ulos!（出かける）」を押す。合っていない部位があれば、その部位だけにヒントが出る。全部合うまで直す。1 回 3 つの天気。

**操作**: 部位ごとにボタンの列（ラジオボタンのように 1 つだけ選べる、`aria-pressed`）。「着せ替え」は絵ではなく、選んだ服の一覧が上に並ぶだけ。

**フィードバック**
- 合っていない部位に ✖ とヒント（例 `Lumessa tarvitset lämpimät kengät.`）。合っている部位は ✔。
- 全部合ったら、選んだ服の文を順に表示（`Laitan pipon päähän.` `Puen talvitakin päälle.` …）、各文に 🔊。
- 1 つの部位に正解が複数あってもよい（例: 雨の日の頭は lippis でも何もなしでもよい）。

**学ぶ語彙と文法**
- 天気: `On pakkasta`, `sataa lunta / vettä`, `aurinko paistaa`, `… astetta lämmintä / pakkasta`（数詞＋分格。既存の例文 `m11_3`, `m11_4` と同じ形）。
- 服: pipo, lippis, talvitakki, sadetakki, t-paita, talvikengät, kumisaappaat, sandaalit, lapaset, sateenvarjo。
- 文法: `laittaa X päähän / jalkaan / käteen`、`pukea X päälle`（全体目的語: 単数は `-n`、複数は `-t`）、`ottaa X mukaan`（既存の `m11_16`）。

**音声**: 天気の文の 🔊 / 🐢（数字の聞き取りにもなる。`NumberPractice` の続き）、服の文の 🔊。後回し: 天気を音声だけで出す「聞き取りモード」。

**純粋な関数**（新規 `client/src/utils/outfitGame.js`）: `createOutfitRound(game, random)`（`playLength` 個の天気を選ぶ）、`checkOutfit(condition, selection)` → `{ allCorrect, wrongSlotIds }`。

### 4.3 ② ごみの分別（SortGame）

**遊び方**: ごみ置き場（jätekatos）で、手に持ったごみが 1 つずつ出る。7 つの箱（biojäte, kartonki, paperi, lasi, metalli, muovi, sekajäte）から正しいものをタップする。1 回 8 個。

**操作**: ごみは 1 つずつしか出ないので、ドラッグは要らない（「ごみをつかんで箱へ」は「箱をタップ」で代える）。後で複数のごみを並べる形にするなら「ごみをタップで選ぶ → 箱をタップ」（既存の `MatchingQuestion.jsx` と同じ 2 タップ）にする。

**フィードバック**
- 正解: その項目の文（例 `Tyhjä maitotölkki kuuluu kartonginkeräykseen.`）と 🔊。
- 不正解: その項目のヒント（例 `Maitotölkki on kartonkia, ei paperia.`）。押した箱を赤くし、もう一度選ぶ。
- フィンランド語の文はコードで組み立てない（格変化を間違えるため）。文はすべてデータに書く。

**学ぶ語彙と文法**
- 語彙: biojäte, kartonki, paperi, lasi, metalli, muovi, sekajäte, jätekatos, pakkaus, tyhjä, lajitella と、ごみの名前（maitotölkki, lasipurkki, säilyketölkki, banaaninkuori など）。
- 文法: `kuulua` ＋入格（`biojätteeseen`, `lasinkeräykseen`）、`X on kartonkia`（素材の分格）、受動の疑問 `Mihin tämä laitetaan?`（既存の例文 `m10_13` と同じ形）。

**音声**: ごみの名前の 🔊 / 🐢、正解の文の 🔊。

**純粋な関数**（新規 `client/src/utils/sortGame.js`）: `createSortRound(game, random)`（`playLength` 件を選ぶ）、`answerSortItem(state, binId)` → `{ state, isCorrect, isNewItem, finished }`（`isNewItem` はその項目に初めて答えたか。`recordAnswer()` を 1 問 1 回にするため）。

### 4.4 ③ 階段で会った近所の人（DialogueScene、一本道）

**遊び方**: 階段（rappukäytävä）で、上の階の人に会う。相手が話す → 3 つの返事から選ぶ、を 4 回。相手のセリフは自動で 1 回読まれる。

**型**: つながった会話なので `DialogueScene`。試作は**一本道**（良い返事はどれも同じ次のセリフへ）。データには `next` を持たせ、あとで分岐できるようにする。

**返事の種類**（`quality`。点数ではなく、進み方とフィードバックの出し方を決める）

| 値 | 意味 | 進み方 |
| --- | --- | --- |
| `good` | 自然な返事 | 次へ |
| `ok` | 通じるが、もっと自然な言い方がある | 次へ。理由と、より自然な返事を見せる |
| `bad` | 場面に合わない | 理由を見せて、選び直し |
| `repeat` | 「Anteeksi, mitä?」など聞き返し | 相手が同じセリフを 0.6 倍の速さでもう一度言う（聞き返すのはよい作戦なので、理由は「よい方法」として出す） |

**話し言葉版**: 会話の文は書き言葉（`fi`）と話し言葉（`spoken`）を両方持つ（既存の例文の `text` / `spokenText` と同じ考え方）。
- 画面の上に `[puhekieli | kirjakieli]`。初期値は puhekieli（実際に階段で聞くのは話し言葉なので）。相手のセリフも選択肢も、選んだほうで表示し、そのほうを読む。
- 答えたあとのフィードバックに、もう一方の形と変わったところ（`spokenNotes`）を出す（既存の `SessionFeedback.jsx` の `💬 話し言葉:` と同じ見せ方。文言キー `session.spokenLabel` を使い回す）。
- fi / selko / en / ja の切り替えは、セリフと選択肢の下の訳、フィードバック、指示に効く。`selko` の欄があるのはフィードバックと指示だけ。

**学ぶ語彙と文法**
- あいさつ・自己紹介: `Moi / Hei`, `Hauska tutustua`, `Tervetuloa`, `Kiitos, samoin`, `Mukavaa päivänjatkoa`, `Anteeksi, mitä?`
- 「似ているけれど使う場面が違う」返事の区別: `Kiitos, samoin`（願いの言葉へ）／ `Ei kestä`（お礼へ）／ `Ei kiitos`（申し出を断る）。
- 文法: 場所の内格（`kolmannessa kerroksessa`）、過去形（`muutin`）、話し言葉の代名詞と olla（`mä oon`, `sä oot`）。
- 既存の例文 `m10_16`〜`m10_18`（saunavuoro）とつながる話題を入れる。

**音声**: 相手は `characters[].speakerId`（例 `matti`）の声で、そのセリフを自動で 1 回。選択肢は選ぶ前に、横の小さい 🔊 で聞ける。

**純粋な関数**（新規 `client/src/utils/dialogue.js`）: `startDialogue(game, random)`（会話を 1 本選ぶ）、`answerDialogue(state, choiceId)` → `{ state, quality, advanced, finished, isNewNode }`。

---

## 5. データの形

### 5.1 置き場所の決定

**client に JSON として置く**（`client/src/data/scenes/`）。API・モデル・seed は足さない。

| 観点 | client の JSON（採用） | `seedData.js` に足して API で配る |
| --- | --- | --- |
| 既存の作りとの近さ | 文法ドリル（`grammarData.js`）とカリキュラム（`curriculumData.js`）は client にある。ゲームの規則と結びついた構造化データ（箱の ID、合う服の組み合わせ）は文法ドリルの `practiceQuiz` に近い | 例文・読解文は server。ただしどちらも「文 1 件」「本文 1 件」の形で、ゲームの規則は持っていない |
| 作る量 | データ・部品・テストだけ | 加えて Mongoose モデル、`server/src/data/` の data layer、route、controller、`seed.js` の追加、それぞれのテスト |
| MongoDB 利用者 | 何もしなくてよい | コンテンツを変えるたびに `npm run seed --prefix server` が要る |
| オフライン | server がなくても遊べる（音声だけ server が要る） | server が要る |
| 将来 | JSON なので、DB で編集したくなったらそのまま `seedData.js` に読み込める | — |

- JS ではなく JSON にする理由: コンテンツの担当がコードを書かずに直せる、Vite がそのまま読み込める、将来 server（CommonJS）にも `require` で持っていける。JSON は oxlint の対象外なので、形はテスト（7 章）で確かめる。
- ファイル:

```
client/src/data/scenes/
  scenes.json          場面の一覧（koti / lahio / kaupunki）とゲームの並び（おすすめの順）
  vaatteet.json        ① 天気と服
  jatekatos.json       ② ごみの分別
  rappukaytava.json    ③ 階段で
  index.js             上を import して scenes, games, findGameById(id), getGamesByScene(sceneId),
                       getRecommendedGames()（おすすめの順の配列と番号）, getNextRecommended(gameId) を export
```

- ID は URL に使うので ASCII の小文字とハイフンだけ（`ä` は使わない）。

### 5.2 共通の型

```ts
// 表示用の文。fi と en は必須。selko は指示・ヒント・フィードバック・説明カードで必須（ほかは任意）。ja は任意
type LocalizedText = { fi: string; selko?: string; en: string; ja?: string };

// 会話の文。spoken が fi と同じなら spokenNotes は「Same in speech」/「会話でもこのまま使う」
type SpokenText = LocalizedText & {
  spoken: string;
  spokenNotes?: { en: string; ja?: string };
};

// 単語帳に入れる語。読解文の vocabulary（ReadingPassage.js の vocabularySchema）と同じ形
// （translation が英語で必須、translationJa は任意）
type VocabEntry = { word: string; translation: string; translationJa?: string };

type InfoCard = { id: string; title: LocalizedText; body: LocalizedText[]; grammarNote?: LocalizedText };

type Scene = {
  id: 'koti' | 'lahio' | 'kaupunki';
  icon: string;                 // 絵文字
  title: LocalizedText;
  order: number;                // おすすめの順（koti 1, lahio 2, kaupunki 3）
  comingSoon?: boolean;
  gameIds: string[];            // 場面の中のおすすめの順
};

type GameBase = {
  id: string;                   // 'vaatteet' など
  sceneId: Scene['id'];
  type: 'outfit' | 'sort' | 'dialogue';
  schemaVersion: 1;
  icon: string;
  title: LocalizedText;
  place: LocalizedText;         // 例: eteinen
  instruction: LocalizedText;   // selko 必須
  playLength: number;           // 1 回に出す数
  relatedLessonId?: string;     // curriculumData.js の lesson.id（例 'l11'）
  vocabulary: VocabEntry[];     // 6〜10 語
  infoCards: InfoCard[];        // 2〜3 枚
};
```

- 既存の例文は `translation`（en）/ `translationJa` という接尾辞の形だが、場面のデータは `{ fi, selko, en, ja }` の入れ子にする。1 つの関数（`pickText`）で 4 つのモードを扱えるため。語彙（`VocabEntry`）だけは単語帳にそのまま渡せるよう既存の形に合わせる（単語帳の `normalizeWord()` は `translationJa` がなくても空文字で受け付ける）。

### 5.3 ① OutfitGame

```ts
type OutfitGame = GameBase & {
  type: 'outfit';
  slots: {
    id: string;                          // 'paa' | 'ylla' | 'jalat' | 'kadet'
    label: LocalizedText;                // 'Päässä' など
    options: {
      id: string;
      icon: string;
      label: LocalizedText;
      wear?: LocalizedText;              // 着るときの文。'ei mitään' にはない
    }[];
  }[];
  conditions: {
    id: string;
    icon: string;
    temperature: number;                 // 表示用（°C）
    weather: LocalizedText;              // 天気の文。selko 必須
    accept: Record<string, string[]>;    // slotId → 合う optionId（1 つ以上）
    hints: Record<string, LocalizedText>;// slotId → 合わないときの理由（selko 必須）
  }[];
};
```

**サンプル（下書き。content-editor が確かめる）**（`vocabulary` と `infoCards` は ② と同じ形なので省略）

```json
{
  "id": "vaatteet",
  "sceneId": "koti",
  "type": "outfit",
  "schemaVersion": 1,
  "icon": "🧥",
  "title": { "fi": "Sää ja vaatteet", "en": "Weather and clothes", "ja": "天気と服" },
  "place": { "fi": "eteinen", "en": "hallway", "ja": "玄関" },
  "instruction": { "fi": "Katso sää ja pukeudu sen mukaan.", "selko": "Katso sää. Valitse vaatteet.", "en": "Check the weather and dress for it.", "ja": "天気を見て、合う服を選ぼう。" },
  "playLength": 3,
  "relatedLessonId": "l11",
  "slots": [
    { "id": "paa", "label": { "fi": "Päässä", "en": "On your head", "ja": "頭" }, "options": [
      { "id": "pipo", "icon": "🧶", "label": { "fi": "pipo", "en": "beanie", "ja": "ニット帽" }, "wear": { "fi": "Laitan pipon päähän.", "en": "I put on my beanie.", "ja": "ニット帽をかぶる。" } },
      { "id": "lippis", "icon": "🧢", "label": { "fi": "lippis", "en": "cap", "ja": "キャップ" }, "wear": { "fi": "Laitan lippiksen päähän.", "en": "I put on my cap.", "ja": "キャップをかぶる。" } },
      { "id": "ei-paa", "icon": "➖", "label": { "fi": "ei mitään", "en": "nothing", "ja": "なし" } }
    ] },
    { "id": "ylla", "label": { "fi": "Päällä", "en": "On your body", "ja": "上半身" }, "options": [
      { "id": "talvitakki", "icon": "🧥", "label": { "fi": "talvitakki", "en": "winter coat", "ja": "冬のコート" }, "wear": { "fi": "Puen talvitakin päälle.", "en": "I put on my winter coat.", "ja": "冬のコートを着る。" } },
      { "id": "sadetakki", "icon": "🧥", "label": { "fi": "sadetakki", "en": "raincoat", "ja": "レインコート" }, "wear": { "fi": "Puen sadetakin päälle.", "en": "I put on my raincoat.", "ja": "レインコートを着る。" } },
      { "id": "t-paita", "icon": "👕", "label": { "fi": "t-paita", "en": "T-shirt", "ja": "Tシャツ" }, "wear": { "fi": "Puen t-paidan päälle.", "en": "I put on a T-shirt.", "ja": "Tシャツを着る。" } }
    ] },
    { "id": "jalat", "label": { "fi": "Jalassa", "en": "On your feet", "ja": "足" }, "options": [
      { "id": "talvikengat", "icon": "🥾", "label": { "fi": "talvikengät", "en": "winter shoes", "ja": "冬靴" }, "wear": { "fi": "Laitan talvikengät jalkaan.", "en": "I put on my winter shoes.", "ja": "冬靴を履く。" } },
      { "id": "kumisaappaat", "icon": "👢", "label": { "fi": "kumisaappaat", "en": "rubber boots", "ja": "長靴" }, "wear": { "fi": "Laitan kumisaappaat jalkaan.", "en": "I put on my rubber boots.", "ja": "長靴を履く。" } },
      { "id": "sandaalit", "icon": "🩴", "label": { "fi": "sandaalit", "en": "sandals", "ja": "サンダル" }, "wear": { "fi": "Laitan sandaalit jalkaan.", "en": "I put on my sandals.", "ja": "サンダルを履く。" } }
    ] },
    { "id": "kadet", "label": { "fi": "Käsissä", "en": "In your hands", "ja": "手" }, "options": [
      { "id": "lapaset", "icon": "🧤", "label": { "fi": "lapaset", "en": "mittens", "ja": "ミトン" }, "wear": { "fi": "Laitan lapaset käteen.", "en": "I put on my mittens.", "ja": "ミトンをはめる。" } },
      { "id": "sateenvarjo", "icon": "☂️", "label": { "fi": "sateenvarjo", "en": "umbrella", "ja": "傘" }, "wear": { "fi": "Otan sateenvarjon mukaan.", "en": "I take an umbrella with me.", "ja": "傘を持っていく。" } },
      { "id": "ei-kadet", "icon": "➖", "label": { "fi": "ei mitään", "en": "nothing", "ja": "なし" } }
    ] }
  ],
  "conditions": [
    {
      "id": "pakkanen", "icon": "❄️", "temperature": -15,
      "weather": { "fi": "Ulkona on viisitoista astetta pakkasta, ja sataa lunta.", "selko": "Ulkona on kylmä. Sataa lunta.", "en": "It's fifteen degrees below zero outside, and it's snowing.", "ja": "外は氷点下15度で、雪が降っている。" },
      "accept": { "paa": ["pipo"], "ylla": ["talvitakki"], "jalat": ["talvikengat"], "kadet": ["lapaset"] },
      "hints": {
        "paa": { "fi": "Pakkasella pää ja korvat pitää suojata.", "selko": "Kun on kylmä, laita jotain päähän.", "en": "In freezing weather, keep your head and ears covered.", "ja": "氷点下では頭と耳を守ろう。" },
        "ylla": { "fi": "Pakkasella tarvitset lämpimän takin.", "selko": "Kun on kylmä, tarvitset lämpimän takin.", "en": "In freezing weather, you need a warm coat.", "ja": "氷点下では暖かいコートが必要。" },
        "jalat": { "fi": "Lumessa tarvitset lämpimät kengät.", "selko": "Kun on lunta, tarvitset lämpimät kengät.", "en": "In the snow, you need warm shoes.", "ja": "雪の中では暖かい靴が必要。" },
        "kadet": { "fi": "Pakkasella sormet jäätyvät ilman lapasia.", "selko": "Kun on kylmä, laita lapaset käteen.", "en": "In freezing weather, your fingers get cold without mittens.", "ja": "氷点下ではミトンがないと指が凍える。" }
      }
    },
    {
      "id": "sade", "icon": "🌧️", "temperature": 10,
      "weather": { "fi": "On kymmenen astetta lämmintä, ja sataa vettä.", "selko": "Ulkona sataa vettä.", "en": "It's ten degrees above zero, and it's raining.", "ja": "気温は10度で、雨が降っている。" },
      "accept": { "paa": ["lippis", "ei-paa"], "ylla": ["sadetakki"], "jalat": ["kumisaappaat"], "kadet": ["sateenvarjo", "ei-kadet"] },
      "hints": {
        "paa": { "fi": "Pipo kastuu sateessa, ja kymmenen astetta on liian lämmin pipolle.", "selko": "Nyt ei ole kylmä. Pipoa ei tarvita.", "en": "A beanie gets wet in the rain, and ten degrees is too warm for one.", "ja": "ニット帽は雨でぬれるし、10度では暑い。" },
        "ylla": { "fi": "Sateella tarvitset takin, joka ei kastu.", "selko": "Kun sataa, tarvitset sadetakin.", "en": "When it rains, you need a coat that doesn't get wet.", "ja": "雨の日はぬれない上着が必要。" },
        "jalat": { "fi": "Lätäköissä jalat kastuvat, jos kengät eivät pidä vettä.", "selko": "Kun sataa, laita kumisaappaat jalkaan.", "en": "Your feet get wet in puddles if your shoes aren't waterproof.", "ja": "水たまりでは、水を通さない靴でないと足がぬれる。" },
        "kadet": { "fi": "Lapaset kastuvat, eikä nyt ole pakkasta.", "selko": "Nyt ei ole kylmä. Lapasia ei tarvita.", "en": "Mittens get wet, and it isn't freezing now.", "ja": "ミトンはぬれるし、今は氷点下ではない。" }
      }
    },
    {
      "id": "helle", "icon": "☀️", "temperature": 25,
      "weather": { "fi": "Aurinko paistaa, ja on kaksikymmentäviisi astetta lämmintä.", "selko": "Aurinko paistaa. On lämmin.", "en": "The sun is shining, and it's twenty-five degrees.", "ja": "晴れていて、気温は25度。" },
      "accept": { "paa": ["lippis", "ei-paa"], "ylla": ["t-paita"], "jalat": ["sandaalit"], "kadet": ["ei-kadet"] },
      "hints": {
        "paa": { "fi": "Pipossa tulee kuuma, kun on näin lämmin.", "selko": "On lämmin. Pipoa ei tarvita.", "en": "A beanie is too hot when it's this warm.", "ja": "こんなに暖かいとニット帽では暑い。" },
        "ylla": { "fi": "Lämpimällä säällä takissa tulee kuuma.", "selko": "On lämmin. Takkia ei tarvita.", "en": "A coat is too hot in warm weather.", "ja": "暖かい日にコートを着ると暑い。" },
        "jalat": { "fi": "Talvikengissä ja kumisaappaissa jalat hikoilevat helteellä.", "selko": "On lämmin. Laita kevyet kengät.", "en": "Your feet sweat in winter shoes or rubber boots on a hot day.", "ja": "暑い日に冬靴や長靴では足が汗をかく。" },
        "kadet": { "fi": "Aurinko paistaa, joten sateenvarjoa tai lapasia ei tarvita.", "selko": "Ei sada, eikä ole kylmä.", "en": "The sun is shining, so you don't need an umbrella or mittens.", "ja": "晴れているので、傘もミトンもいらない。" }
      }
    }
  ]
}
```

- 本番の天気は 5〜6 個（例: 春の雪どけでぬかるむ、秋の風、真冬の極寒）。どの天気でも、部位ごとに合わない選択肢が 1 つ以上あること。
- `wear` の文の目的語は全体目的語（単数 `-n`、複数 `-t`）。`ei mitään` には `wear` を付けない。

### 5.4 ② SortGame

```ts
type SortGame = GameBase & {
  type: 'sort';
  bins: { id: string; label: LocalizedText; color: string }[];
  items: {
    id: string;
    icon: string;
    label: LocalizedText;       // ごみの名前（主格・単数）
    binId: string;              // bins[].id
    sentence: LocalizedText;    // 正解のときの文
    hint: LocalizedText;        // 間違えたときの理由（selko 必須）
  }[];
};
```

**サンプル（下書き。content-editor が確かめる）**

```json
{
  "id": "jatekatos",
  "sceneId": "lahio",
  "type": "sort",
  "schemaVersion": 1,
  "icon": "♻️",
  "title": { "fi": "Jätekatoksessa", "en": "At the waste shelter", "ja": "ごみ置き場で" },
  "place": { "fi": "jätekatos", "en": "waste shelter", "ja": "ごみ置き場" },
  "instruction": {
    "fi": "Vie roskat jätekatokseen ja lajittele ne oikeisiin astioihin.",
    "selko": "Laita jokainen roska oikeaan astiaan.",
    "en": "Take the rubbish to the waste shelter and sort it into the right bins.",
    "ja": "ごみ置き場で、ごみを正しい箱に分けよう。"
  },
  "playLength": 5,
  "relatedLessonId": "l10",
  "bins": [
    { "id": "biojate", "label": { "fi": "Biojäte", "en": "Biowaste", "ja": "生ごみ" }, "color": "#7a5c3e" },
    { "id": "kartonki", "label": { "fi": "Kartonki", "en": "Cardboard", "ja": "紙容器" }, "color": "#c9a66b" },
    { "id": "paperi", "label": { "fi": "Paperi", "en": "Paper", "ja": "紙（新聞・チラシ）" }, "color": "#4a7bd0" },
    { "id": "lasi", "label": { "fi": "Lasi", "en": "Glass", "ja": "ガラス" }, "color": "#3fa37a" },
    { "id": "metalli", "label": { "fi": "Metalli", "en": "Metal", "ja": "金属" }, "color": "#8a8f98" },
    { "id": "muovi", "label": { "fi": "Muovi", "en": "Plastic packaging", "ja": "プラスチック容器" }, "color": "#e0a800" },
    { "id": "sekajate", "label": { "fi": "Sekajäte", "en": "Mixed waste", "ja": "混合ごみ" }, "color": "#444444" }
  ],
  "items": [
    {
      "id": "banaaninkuori", "icon": "🍌", "binId": "biojate",
      "label": { "fi": "banaaninkuori", "en": "banana peel", "ja": "バナナの皮" },
      "sentence": { "fi": "Banaaninkuori kuuluu biojätteeseen.", "selko": "Banaanin kuori on biojätettä.", "en": "A banana peel goes in the biowaste.", "ja": "バナナの皮は生ごみに入れます。" },
      "hint": { "fi": "Ruoantähteet ja hedelmien kuoret ovat biojätettä.", "selko": "Ruoka ja kuoret ovat biojätettä.", "en": "Food scraps and fruit peels are biowaste.", "ja": "食べ残しや果物の皮は生ごみです。" }
    },
    {
      "id": "maitotolkki", "icon": "🥛", "binId": "kartonki",
      "label": { "fi": "maitotölkki", "en": "milk carton", "ja": "牛乳パック" },
      "sentence": { "fi": "Tyhjä maitotölkki kuuluu kartonginkeräykseen.", "selko": "Tyhjä maitotölkki on kartonkia.", "en": "An empty milk carton goes in the cardboard recycling.", "ja": "空の牛乳パックは紙容器の回収に出します。" },
      "hint": { "fi": "Maitotölkki on kartonkia, ei paperia.", "selko": "Maitotölkki on kartonkia.", "en": "A milk carton is cardboard, not paper.", "ja": "牛乳パックは紙（新聞など）ではなく紙容器です。" }
    },
    {
      "id": "lasipurkki", "icon": "🫙", "binId": "lasi",
      "label": { "fi": "lasipurkki", "en": "glass jar", "ja": "ガラス瓶" },
      "sentence": { "fi": "Tyhjä lasipurkki kuuluu lasinkeräykseen.", "selko": "Tyhjä lasipurkki on lasia.", "en": "An empty glass jar goes in the glass recycling.", "ja": "空のガラス瓶はガラスの回収に出します。" },
      "hint": { "fi": "Lasipakkauksille on oma astia.", "selko": "Lasille on oma astia.", "en": "Glass packaging has its own bin.", "ja": "ガラスの容器には専用の箱があります。" }
    },
    {
      "id": "sailyketolkki", "icon": "🥫", "binId": "metalli",
      "label": { "fi": "säilyketölkki", "en": "tin can", "ja": "缶詰の缶" },
      "sentence": { "fi": "Säilyketölkki kuuluu metallinkeräykseen.", "selko": "Säilyketölkki on metallia.", "en": "A tin can goes in the metal recycling.", "ja": "缶詰の缶は金属の回収に出します。" },
      "hint": { "fi": "Tölkki on tehty metallista.", "selko": "Tölkki on metallia.", "en": "The can is made of metal.", "ja": "缶は金属でできています。" }
    },
    {
      "id": "hammasharja", "icon": "🪥", "binId": "sekajate",
      "label": { "fi": "vanha hammasharja", "en": "old toothbrush", "ja": "古い歯ブラシ" },
      "sentence": { "fi": "Vanha hammasharja kuuluu sekajätteeseen.", "selko": "Vanha hammasharja on sekajätettä.", "en": "An old toothbrush goes in the mixed waste.", "ja": "古い歯ブラシは混合ごみに入れます。" },
      "hint": { "fi": "Muovinkeräykseen laitetaan vain muovipakkauksia. Hammasharja ei ole pakkaus.", "selko": "Muoviastiaan saa laittaa vain pakkauksia. Hammasharja ei ole pakkaus.", "en": "Only plastic packaging goes in the plastic recycling. A toothbrush is not packaging.", "ja": "プラスチックの回収に出せるのは容器や包装だけ。歯ブラシは容器ではありません。" }
    }
  ],
  "vocabulary": [
    { "word": "biojäte", "translation": "biowaste", "translationJa": "生ごみ" },
    { "word": "kartonki", "translation": "cardboard (packaging)", "translationJa": "紙容器・板紙" },
    { "word": "sekajäte", "translation": "mixed waste", "translationJa": "混合ごみ" },
    { "word": "jätekatos", "translation": "waste shelter", "translationJa": "ごみ置き場（屋根つき）" },
    { "word": "lajitella", "translation": "to sort", "translationJa": "分別する" },
    { "word": "pakkaus", "translation": "package, packaging", "translationJa": "容器・包装" }
  ],
  "infoCards": [
    {
      "id": "jatekatos-1",
      "title": { "fi": "Jätekatos", "en": "The waste shelter", "ja": "ごみ置き場" },
      "body": [
        { "fi": "Kerrostalon pihalla on usein jätekatos. Siellä on eri astiat eri jätteille.", "selko": "Talon pihalla on jätekatos. Siellä on monta astiaa.", "en": "An apartment building often has a waste shelter in the yard, with separate bins for different kinds of waste.", "ja": "集合住宅の庭にはたいていごみ置き場があり、ごみの種類ごとに箱が分かれています。" },
        { "fi": "Lajitteluohjeet voivat vaihdella kunnittain. Katso ohjeet jätekatoksen seinästä.", "selko": "Ohjeet ovat jätekatoksen seinässä.", "en": "Sorting rules can vary by municipality. Check the instructions on the wall of the waste shelter.", "ja": "分け方は自治体によって少し違います。ごみ置き場の壁の案内を見ましょう。" }
      ],
      "grammarNote": { "fi": "kuulua + mihin? → biojätteeseen, lasinkeräykseen", "selko": "kuulua + mihin?", "en": "kuulua + illative: \"belongs in\"", "ja": "「kuulua＋入格」で「〜に入れるものだ」。" }
    }
  ]
}
```

- 下書きは 5 件なので `playLength` を 5 にしている。本番（PR 5）は `items` を 12〜16 個にし、`playLength` を 8 にする（遊ぶたびに変わるように）。本番では各箱に 1 個以上（下書きには paperi の項目がない）。
- 分け方は首都圏など多くの自治体に共通するものだけにし、地域で違うもの（電池、小さな金属など）は入れないか、説明カードで「自治体で違う」と書く。

### 5.5 ③ DialogueScene

```ts
type DialogueGame = GameBase & {
  type: 'dialogue';
  characters: { id: string; name: string; icon: string; speakerId: string; role: LocalizedText }[];
  dialogues: {                       // 遊ぶたびに 1 つ選ぶ（本番は 2〜3 本）
    id: string;
    startNodeId: string;
    nodes: {
      id: string;
      speaker: string;               // characters[].id
      line: SpokenText;
      choices: {
        id: string;
        text: SpokenText;
        quality: 'good' | 'ok' | 'bad' | 'repeat';
        next?: string | null;        // good / ok のとき必須。null は会話の終わり。試作では good / ok はどれも同じ next
        feedback: LocalizedText;     // selko 必須
      }[];
    }[];
  }[];
};
```

- `speakerId` は `client/src/utils/speakers.js` の `SPEAKERS[].id`（aino, matti, eevi, juho, helmi）。キャラクターの名前もこのアプリの話し手の名前を使う（Guider Game の人物は使わない）。
- `playLength` は会話では使わない（会話 1 本を最後まで）。

**サンプル（下書き。content-editor が確かめる）**（`vocabulary` と `infoCards` は省略。1 本の会話の 4 つのセリフ）

```json
{
  "id": "rappukaytava",
  "sceneId": "lahio",
  "type": "dialogue",
  "schemaVersion": 1,
  "icon": "🗣️",
  "title": { "fi": "Rappukäytävässä", "en": "In the stairwell", "ja": "階段で" },
  "place": { "fi": "rappukäytävä", "en": "stairwell", "ja": "階段（共用部）" },
  "instruction": { "fi": "Tapaat naapurin rappukäytävässä. Valitse sopiva vastaus.", "selko": "Naapuri puhuu sinulle. Valitse hyvä vastaus.", "en": "You meet a neighbour in the stairwell. Choose a suitable reply.", "ja": "階段で近所の人に会った。合う返事を選ぼう。" },
  "playLength": 1,
  "relatedLessonId": "l10",
  "characters": [
    { "id": "naapuri", "name": "Matti", "icon": "👨", "speakerId": "matti", "role": { "fi": "naapuri", "en": "neighbour", "ja": "近所の人" } }
  ],
  "dialogues": [
    {
      "id": "uusi-naapuri",
      "startNodeId": "n1",
      "nodes": [
        {
          "id": "n1", "speaker": "naapuri",
          "line": { "fi": "Hei! Olet varmaan uusi naapuri?", "spoken": "Moi! Sä oot varmaan se uus naapuri?", "en": "Hi! You must be the new neighbour?", "ja": "こんにちは！新しく越してきた方ですよね？",
                    "spokenNotes": { "en": "hei → moi, sinä olet → sä oot, uusi → uus", "ja": "hei → moi, sinä olet → sä oot, uusi → uus" } },
          "choices": [
            { "id": "a", "quality": "good", "next": "n2",
              "text": { "fi": "Kyllä, muutin tänne viime viikolla.", "spoken": "Joo, mä muutin tänne viime viikolla.", "en": "Yes, I moved here last week.", "ja": "はい、先週ここに引っ越してきました。" },
              "feedback": { "fi": "Hyvä! Vastasit kysymykseen.", "selko": "Hyvä vastaus!", "en": "Good! You answered the question.", "ja": "質問にちゃんと答えています。" } },
            { "id": "b", "quality": "bad",
              "text": { "fi": "Ei kiitos.", "spoken": "Ei kiitos.", "en": "No, thank you.", "ja": "いいえ、結構です。" },
              "feedback": { "fi": "\"Ei kiitos\" sanotaan, kun ei halua jotakin, mitä tarjotaan.", "selko": "\"Ei kiitos\" tarkoittaa: en halua.", "en": "You say \"Ei kiitos\" when you turn down something you are offered.", "ja": "「Ei kiitos」は勧められたものを断るときの言葉です。" } },
            { "id": "c", "quality": "repeat",
              "text": { "fi": "Anteeksi, mitä?", "spoken": "Sori, mitä?", "en": "Sorry, what?", "ja": "すみません、何ですか？" },
              "feedback": { "fi": "Hyvä keino, jos et kuullut. Naapuri sanoo sen uudestaan hitaasti.", "selko": "Naapuri sanoo sen uudestaan.", "en": "A good way to ask if you didn't hear. The neighbour says it again slowly.", "ja": "聞き取れなかったときに使えます。もう一度ゆっくり言ってくれます。" } }
          ]
        },
        {
          "id": "n2", "speaker": "naapuri",
          "line": { "fi": "Tervetuloa! Olen Matti, asun tuolla kolmannessa kerroksessa.", "spoken": "Tervetuloa! Mä oon Matti, asun tossa kolmannessa kerroksessa.", "en": "Welcome! I'm Matti, I live up there on the third floor.", "ja": "ようこそ！マッティです。3階に住んでいます。",
                    "spokenNotes": { "en": "olen → mä oon, tuolla → tossa", "ja": "olen → mä oon, tuolla → tossa" } },
          "choices": [
            { "id": "a", "quality": "good", "next": "n3",
              "text": { "fi": "Hauska tutustua! Minä asun toisessa kerroksessa.", "spoken": "Hauska tutustua! Mä asun tokassa kerroksessa.", "en": "Nice to meet you! I live on the second floor.", "ja": "はじめまして！私は2階に住んでいます。" },
              "feedback": { "fi": "Hyvä! Kerroit, missä asut.", "selko": "Hyvä vastaus!", "en": "Good! You told them where you live.", "ja": "どこに住んでいるかも伝えられました。" } },
            { "id": "b", "quality": "bad",
              "text": { "fi": "Kiitos, samoin!", "spoken": "Kiitti, samoin!", "en": "Thanks, you too!", "ja": "ありがとう、あなたも！" },
              "feedback": { "fi": "\"Samoin\" vastataan toivotukseen, esimerkiksi \"Hyvää viikonloppua!\"", "selko": "\"Samoin\" sopii, kun joku toivoo sinulle hyvää.", "en": "\"Samoin\" is a reply to a wish, such as \"Have a nice weekend!\"", "ja": "「Samoin」は「よい週末を」などの願いの言葉に返すときに使います。" } },
            { "id": "c", "quality": "bad",
              "text": { "fi": "Näkemiin!", "spoken": "Moi moi!", "en": "Goodbye!", "ja": "さようなら！" },
              "feedback": { "fi": "Näin sanotaan, kun lähdetään. Keskustelu jatkuu vielä.", "selko": "Nyt et vielä lähde.", "en": "You say this when you leave. The conversation isn't over yet.", "ja": "別れるときの言葉です。会話はまだ続いています。" } }
          ]
        },
        {
          "id": "n3", "speaker": "naapuri",
          "line": { "fi": "Saunavuorot varataan muuten ilmoitustaulun listasta.", "spoken": "Muuten, saunavuorot varataan tosta ilmotustaulun listasta.", "en": "By the way, sauna slots are booked on the list on the noticeboard.", "ja": "そういえば、サウナの利用枠は掲示板のリストで予約しますよ。",
                    "spokenNotes": { "en": "ilmoitustaulu → ilmotustaulu; adds tosta (\"that one there\")", "ja": "ilmoitustaulu → ilmotustaulu、tosta（そこの）を足す" } },
          "choices": [
            { "id": "a", "quality": "good", "next": "n4",
              "text": { "fi": "Kiitos, hyvä tietää!", "spoken": "Kiitti, hyvä tietää!", "en": "Thanks, good to know!", "ja": "ありがとう、知れてよかった！" },
              "feedback": { "fi": "Hyvä! Kiitit tiedosta.", "selko": "Hyvä vastaus!", "en": "Good! You thanked them for the information.", "ja": "教えてもらったことにお礼を言えました。" } },
            { "id": "b", "quality": "bad",
              "text": { "fi": "Mihin aikaan juna lähtee?", "spoken": "Mihin aikaan juna lähtee?", "en": "What time does the train leave?", "ja": "電車は何時に出ますか？" },
              "feedback": { "fi": "Kysymys ei liity saunavuoroihin.", "selko": "Naapuri puhuu saunasta, ei junasta.", "en": "The question has nothing to do with sauna slots.", "ja": "サウナの話と関係がありません。" } },
            { "id": "c", "quality": "repeat",
              "text": { "fi": "Anteeksi, mitä?", "spoken": "Sori, mitä?", "en": "Sorry, what?", "ja": "すみません、何ですか？" },
              "feedback": { "fi": "Naapuri sanoo sen uudestaan hitaasti.", "selko": "Naapuri sanoo sen uudestaan.", "en": "The neighbour says it again slowly.", "ja": "もう一度ゆっくり言ってくれます。" } }
          ]
        },
        {
          "id": "n4", "speaker": "naapuri",
          "line": { "fi": "No, mukavaa päivänjatkoa!", "spoken": "No, mukavaa päivänjatkoo!", "en": "Well, have a nice rest of the day!", "ja": "じゃあ、よい一日を！",
                    "spokenNotes": { "en": "päivänjatkoa → päivänjatkoo", "ja": "päivänjatkoa → päivänjatkoo" } },
          "choices": [
            { "id": "a", "quality": "good", "next": null,
              "text": { "fi": "Kiitos, samoin!", "spoken": "Kiitti, samoin!", "en": "Thanks, you too!", "ja": "ありがとう、あなたも！" },
              "feedback": { "fi": "Hyvä! Toivotukseen vastataan \"Kiitos, samoin!\"", "selko": "Hyvä vastaus!", "en": "Good! You reply to a wish with \"Kiitos, samoin!\"", "ja": "願いの言葉には「Kiitos, samoin!」と返します。" } },
            { "id": "b", "quality": "ok", "next": null,
              "text": { "fi": "Hauska tutustua!", "spoken": "Hauska tutustua!", "en": "Nice to meet you!", "ja": "はじめまして！" },
              "feedback": { "fi": "Käy, mutta tähän vastataan yleensä \"Kiitos, samoin!\"", "selko": "Parempi vastaus on \"Kiitos, samoin!\"", "en": "That works, but the usual reply is \"Kiitos, samoin!\"", "ja": "通じますが、ふつうは「Kiitos, samoin!」と返します。" } },
            { "id": "c", "quality": "bad",
              "text": { "fi": "Ei kestä.", "spoken": "Ei kestä.", "en": "You're welcome.", "ja": "どういたしまして。" },
              "feedback": { "fi": "\"Ei kestä\" vastataan kiitokseen.", "selko": "\"Ei kestä\" sopii, kun joku sanoo kiitos.", "en": "\"Ei kestä\" is a reply to a thank-you.", "ja": "「Ei kestä」はお礼を言われたときに返す言葉です。" } }
          ]
        }
      ]
    }
  ]
}
```

- 下書きで迷った点（content-editor に見てほしいところ）: `tokassa kerroksessa`（toinen → toka）、`ilmotustaulu`、`päivänjatkoo` の話し言葉、`Moi moi!` を「Näkemiin!」の話し言葉として出してよいか、`Sori, mitä?` の自然さ、英訳の自然さ。
- 本番は会話 2〜3 本（例: 朝のあいさつだけで終わる短い会話、荷物が多いときに扉を開けてもらう会話 `Voisitko pitää ovea?`）。

### 5.6 scenes.json のサンプル

```json
[
  { "id": "koti", "icon": "🏠", "order": 1, "title": { "fi": "Koti", "en": "Home", "ja": "家" }, "gameIds": ["vaatteet"] },
  { "id": "lahio", "icon": "🏢", "order": 2, "title": { "fi": "Lähiö", "en": "Neighbourhood", "ja": "団地・近所" }, "gameIds": ["jatekatos", "rappukaytava"] },
  { "id": "kaupunki", "icon": "🏙️", "order": 3, "title": { "fi": "Kaupunki", "en": "Town", "ja": "街" }, "comingSoon": true, "gameIds": [] }
]
```

- PR 1 の時点では `vaatteet` しかないので、`lahio` の `gameIds` は実装済みのゲームだけを入れる（データのテストが「`gameIds` のゲームが存在する」ことを確かめるため）。PR 3・4 で足していく。

### 5.7 コンテンツの決まり（content-editor へ）

- `.claude/skills/finnish-content/SKILL.md` に「場面のデータ」の節を足す（PR 2）。中身は 5 章の形と、次の決まり。
- **言語の欄**: `fi` と `en` は必須。`selko` は指示・ヒント・フィードバック・説明カードで必須。`ja` は任意だが、入れるならそのゲームの**すべての文**に入れる（一部だけだと `ja` の表示が出ない。3.5）。語彙は `translation`（英語）が必須、`translationJa` は任意。会話の `spokenNotes` は `en` が必須、`ja` は任意。
- `en` は自然な英語（イギリス英語・アメリカ英語はどちらでもよいが、1 つのゲームの中でそろえる）。直訳でなく、その場面で英語ならこう言う、という訳。
- 書き言葉・話し言葉の品質ルールは、既存の SKILL.md の「品質ルール」をそのまま使う。会話の `spoken` / `spokenNotes` も例文の `spokenText` / `spokenNotes` と同じ書き方（同じなら `"Same in speech"` / `"会話でもこのまま使う"`）。
- **selkosuomi**（やさしいフィンランド語）: 1 文に 1 つのこと、短い文、よく使う語、現在形と能動形を主に（受動形・分詞構文・長い複合語は避ける）、主語を省かない、比喩を使わない。
- フィンランド語の文は全文をデータに書く（コードで語尾を付けない）。
- 制度や自治体で違う細部（回収の曜日、料金）は入れない。
- 語彙は本文に出てくる形ではなく**辞書形**で（単語帳に入るため。読解文の `vocabulary` とはここが違う）。

---

## 6. 既存の機能とのつなぎ

### 6.1 使い回すもの

| 既存 | 使い方 |
| --- | --- |
| `playAudio()`（`client/src/utils/audio.js`） | 語・文・セリフの読み上げ。🔊 1.0 / 🐢 0.6（PR 0 で相対パスと `alert` を直す） |
| `getSpeakerById()`, `DEFAULT_SPEAKER`（`client/src/utils/speakers.js`） | 会話の相手の声、それ以外は Aino |
| `playCorrectSound()`, `playIncorrectSound()`, `playLessonCompleteSound()`（`client/src/utils/feedbackSounds.js`） | 正誤と終わりの音 |
| `recordAnswer()`, `getStudyStats()`（`client/src/utils/studyStats.js`）と `saveProgress()`（`client/src/services/api.js`） | 今日の学習数、ストリーク |
| `addWord()`, `getWords()`（`client/src/utils/wordBook.js`） | 語彙を単語帳へ。入れると `ensureReviewEntry('word:<id>')` が自動で走り、既存の単語の復習（`/words?review=1`、`Review.jsx` の単語カード）に乗る |
| `findLessonById()`（`client/src/data/curriculumData.js`）、`useProgressStore` の `progress` | 「このテーマの例文を練習」→ `/sessions?lessonId=<id>&level=<progress[id] || 1>` |
| `useLanguage()` の `t` / `language` | UI の文言（ボタン・見出し）。場面の文には使わない（3.5） |
| CSS（`App.css`）の `choice-btn`, `correct-choice`, `wrong-choice`, `feedback`, `question-card`, `progress-bar`, `unit-header`, `btn-primary` など | 見た目をそろえる。場面だけのクラスは `scene-` で始める |

- **話し言葉**: 場面のデータの `spoken` を使う。既存の例文の `spokenText` とは別のデータだが、表示のしかた（`💬 話し言葉:` とメモ）は `SessionFeedback.jsx` に合わせ、文言キー `session.spokenLabel` を使い回す。
- **復習**: `reviewSchedule.js` の `isValidKey()` は `sentence:` / `grammar:` / `word:` しか受け付けない。場面そのものの復習は作らず、単語帳を通す。間違えた項目を自動で単語帳に入れるのは後回し（勝手に増えると単語帳が散らかるため、試作はボタンで入れる）。

### 6.2 新しく作るファイル

| パス | 中身 | PR |
| --- | --- | --- |
| `client/src/data/scenes/scenes.json` | 場面の一覧（おすすめの順） | 1（3・4 で `gameIds` を足す） |
| `client/src/data/scenes/vaatteet.json` | ① のデータ | 1（下書き）→ 2（本番） |
| `client/src/data/scenes/jatekatos.json` | ② のデータ | 3 → 5 |
| `client/src/data/scenes/rappukaytava.json` | ③ のデータ | 4 → 5 |
| `client/src/data/scenes/index.js` | `scenes`, `games`, `findGameById`, `getGamesByScene`, `getRecommendedGames`, `getNextRecommended` | 1 |
| `client/src/utils/sceneText.js` | `pickText`, `hasJapanese`, `getSceneTextMode`, `setSceneTextMode` | 1 |
| `client/src/utils/sceneProgress.js` | `getSceneProgress`, `markGamePlayed`, `hasPlayed` | 1 |
| `client/src/utils/outfitGame.js` | `createOutfitRound`, `checkOutfit` | 1 |
| `client/src/utils/sortGame.js` | `createSortRound`, `answerSortItem` | 3 |
| `client/src/utils/dialogue.js` | `startDialogue`, `answerDialogue` | 4 |
| `client/src/components/scenes/SceneText.jsx` | 文と訳の表示 | 1 |
| `client/src/components/scenes/SceneTextToggle.jsx` | fi / selko / en / ja | 1 |
| `client/src/components/scenes/InfoCard.jsx` | 説明カード | 1 |
| `client/src/components/scenes/SceneResult.jsx` | 終わりの画面 | 1 |
| `client/src/components/scenes/OutfitGame.jsx` | ① | 1 |
| `client/src/components/scenes/SortGame.jsx` | ② | 3 |
| `client/src/components/scenes/DialogueScene.jsx` | ③ | 4 |
| `client/src/pages/Scenes.jsx` | 一覧 | 1（6 で説明カードの読み返し） |
| `client/src/pages/SceneGame.jsx` | 1 本のゲーム | 1 |
| テスト（7 章） | `client/src/data/__tests__/sceneData.test.js` ほか | 各 PR |

### 6.3 いじる既存のファイル

| パス | 変更 | PR |
| --- | --- | --- |
| `client/src/utils/audio.js` と `client/src/utils/__tests__/audio.test.js` | TTS の URL を `/api/tts`（相対）に、失敗時の `alert()` をやめて `console.warn` に | 0 |
| `client/src/App.jsx` | `lazy()` で 2 ページ、`<Route>` 2 つ、ナビの `<Link to="/scenes">` | 1 |
| `client/src/pages/Home.jsx` と `client/src/pages/__tests__/Home.test.jsx` | 「暮らしの場面」カード | 1 |
| `client/src/locales/translations.js` | `nav.scenes` と `scenes.*`（ja / en 両方） | 1・3・4・6 |
| `client/src/assets/App.css` | `scene-` のクラス（スマホ幅で 2 列） | 1・3・4・6 |
| `client/src/__tests__/App.test.jsx` | ナビのリンクと `/scenes` の表示 | 1 |
| `client/src/utils/wordBook.js` | `normalizeWord()` が `source.type === 'scene'`（`sceneGameId`, `title`）を残すように | 6 |
| `client/src/pages/WordBook.jsx` | `Source` が `scene` のときも `title` を出す | 6 |
| `client/src/utils/__tests__/wordBook.test.js` | `scene` の出典が残ること | 6 |
| `.claude/skills/finnish-content/SKILL.md` | 「場面のデータ」の節 | 2 |

- server は変えない。

---

## 7. テストの方針

CI と同じチェック: `cd client && npx oxlint src --deny-warnings && npx vitest run && npx vite build`、`cd server && npx jest --runInBand`。client の CI は `vitest run --coverage` で、しきい値は statements 90 / branches 80 / functions 80 / lines 90（`client/vite.config.js`）。新しい部品にもテストが要る。

### 7.1 単体テスト（vitest）

| テスト（新規） | 確かめること |
| --- | --- |
| `client/src/data/__tests__/sceneData.test.js` | **実データの形**: ID が一意で ASCII、`type` が既知、`sceneId` と `scenes.json` の `gameIds` が対応し `gameIds` のゲームがすべて存在、すべての `LocalizedText` に空でない `fi` / `en`、指示・ヒント・フィードバック・説明カードに `selko`、`ja` があるゲームはすべての文に `ja`、`relatedLessonId` が `findLessonById()` で見つかる、`vocabulary` が 6 語以上で `word` / `translation` がある。outfit: `accept` / `hints` のキーがすべての `slots[].id`、`accept` の ID が存在、部位ごとに合わない選択肢が 1 つ以上。sort: `binId` が存在、`items` が `playLength` 以上（PR 5 からは各箱に 1 項目以上も）。dialogue: `startNodeId` が存在、`good` / `ok` の `next` が存在するか `null`、どのノードにも `good` が 1 つ以上、すべてのノードに `startNodeId` から行ける、終わり（`next: null`）に行ける、`speakerId` が `SPEAKERS` にある、`spoken` と `spokenNotes.en` が空でない |
| `client/src/data/__tests__/sceneIndex.test.js` | `getRecommendedGames()` の順（koti → lahio、場面の中は `gameIds` の順）と番号、`getNextRecommended()`（最後は `null`）、`findGameById()` の存在しない ID |
| `client/src/utils/__tests__/sceneText.test.js` | `pickText` の 4 モード、`selko` がないとき `fi`、`ja` がないとき `en`、`hasJapanese`、初期値 `en`、保存の失敗と不正な値 |
| `client/src/utils/__tests__/sceneProgress.test.js` | `markGamePlayed` で印が付く、`firstPlayedAt` が変わらない、壊れた localStorage を無視 |
| `client/src/utils/__tests__/outfitGame.test.js` | 合わない部位の一覧、正解が複数ある部位、天気の数（`random` を渡して固定） |
| `client/src/utils/__tests__/sortGame.test.js` | 件数、正解・不正解、`isNewItem`（1 問 1 回）、終わり |
| `client/src/utils/__tests__/dialogue.test.js` | `good` / `ok` で進む、`bad` で止まる、`repeat` で同じノードのまま、終わり |
| `client/src/components/__tests__/SceneComponents.test.jsx` | **小さな固定データ（テストの中に書く）**で各部品をタップで操作。`playAudio` と効果音は `vi.mock`（`NumberPractice.test.jsx` と同じ）。正誤の表示、選び直し、`onFinish` が呼ばれる、表示モードの切り替えで文と訳が変わる、`ja` のないデータでは `ja` のボタンが出ない、会話の話し言葉／書き言葉、`recordAnswer` が 1 問 1 回 |
| `client/src/pages/__tests__/Scenes.test.jsx` | 場面とゲームのカードがおすすめの順と番号で出る、localStorage の ✔ が出る、準備中 |
| `client/src/pages/__tests__/SceneGame.test.jsx` | 存在しない `gameId` は「見つかりません」と一覧へのリンク、最後まで遊ぶと ✔ が保存され終わりの画面、関連レッスンと次のおすすめのボタンの URL |

- 部品のテストは実データに頼らない（content-editor がデータを直しても部品のテストが壊れないように）。実データは `sceneData.test.js` が形だけを確かめる。
- フィンランド語・英語として正しいかはテストできない。content-editor が 1 文ずつ読む（`finnish-content` の手順）。

### 7.2 サーバーのテスト（jest）

- server を変えないので追加なし（CI の server のチェックは今のまま通ること）。

### 7.3 ブラウザで確かめること（qa-reviewer）

`.claude/launch.json` の `api` と `client` を起動し、`resize_window` の mobile（375×812）と desktop で。スクリーンショットは使わず、`get_page_text` と JavaScript で確かめる。

- ナビとホームのカード → 一覧（①②③ の順）→ 3 本をそれぞれ最後まで（正解だけ・わざと間違える両方）。どれからでも入れる。
- 途中で fi / selko / en（ja があれば ja）を切り替えても、進み具合が消えない。UI の言語（ナビの ja / en）を変えても、場面の文の表示モードは変わらない。
- 会話の puhekieli / kirjakieli の切り替え、`repeat` でゆっくりもう一度。
- 音声: `GOOGLE_TTS_API_KEY` があるときは読まれる。ないときに `alert` が出ない（PR 0 のあと）。
- 再読み込みしても ✔ が残る。ホームの「今日 n 問」が増える。＋単語帳で単語帳に入り、出典に場面の名前が出る（PR 6）。
- スマホ幅で横スクロールが出ない、ボタンが押しやすい（高さ 44px 以上）、ナビの 8 項目が横スクロールで届く。
- 目視できないもの（音声の聞こえ方、MongoDB 接続時の挙動）は「未確認」と報告する。

---

## 8. PR の分け方と順番

コードやデータを変える担当は同時に 1 つまでなので、上から順に 1 本ずつ。前の PR がマージされてから、次の PR は `origin/main` から切る（前の PR を待たずに進めるときだけ、前の PR のブランチをベースに指定する）。

| 順 | PR（ブランチ名の例） | 担当 | 中身 | レビュー |
| --- | --- | --- | --- | --- |
| 0 | `fix/tts-audio-request` | implementer（数行なので指揮者が直してもよい） | `audio.js` の TTS の URL を `/api/tts` に、失敗時の `alert()` を `console.warn` に。`audio.test.js` を合わせる | CI |
| 1 | `feat/scenes-foundation-outfit` | implementer | データの形（`scenes.json`、`index.js`、`vaatteet.json` は 5.3 の下書きのまま）、`sceneText` / `sceneProgress` / `outfitGame`、`SceneText` / `SceneTextToggle` / `InfoCard` / `SceneResult` / `OutfitGame`、`Scenes.jsx`（おすすめの順のカード、✔、準備中）/ `SceneGame.jsx`、ルートとナビ、ホームのカード、文言、CSS、テスト | 新しいモードの土台なので qa-reviewer にレビューとブラウザ確認をさせてからマージ |
| 2 | `content/scenes-outfit` | content-editor | `vaatteet.json` の本番（天気 5〜6 個、selko、説明カード 2〜3 枚、語彙、en と ja）、`finnish-content` SKILL.md に「場面のデータ」の節（5.7） | 指揮者が差分を読む |
| 3 | `feat/scenes-sort` | implementer | `sortGame.js`、`SortGame.jsx`、`jatekatos.json`（5.4 の下書き 5 件）、`scenes.json` の `lahio` に追加、`SceneGame` の振り分け、テスト | CI |
| 4 | `feat/scenes-dialogue` | implementer | `dialogue.js`、`DialogueScene.jsx`（話し言葉の切り替え、`repeat`、相手のセリフの自動再生）、`rappukaytava.json`（5.5 の下書き）、`scenes.json` に追加、テスト | CI（自動再生と音声は qa-reviewer のブラウザ確認があるとよい） |
| 5 | `content/scenes-sort-dialogue` | content-editor | `jatekatos.json`（12〜16 項目、`playLength` 8）と `rappukaytava.json`（会話 2〜3 本）の本番、話し言葉と英訳の確認 | 指揮者が差分を読む |
| 6 | `feat/scenes-wordbook` | implementer | ＋単語帳（`wordBook.js` の `scene` 出典、`WordBook.jsx`）、一覧から説明カードを読み返すボタン | CI |

- 5 と 6 は入れ替えてよい（互いに触るファイルがない）。
- **PR 0 を最初にする理由**: このモードは音声を多く使い、会話では自動再生もする。今の `audio.js` は TTS の API キー（`GOOGLE_TTS_API_KEY`）がない環境で `alert()` を出し、スマホから LAN 越しに開くと音声が届かない（付録の 1）。先に直しておくと、PR 1 以降のブラウザ確認がしやすい。
- **PR 1 を「天気と服」にする理由**（作りやすさより並び順を優先）:
  1. おすすめの順の ① から作れば、どの PR の時点でも一覧が ①、①②、①②③ と抜けなく並ぶ。② から作ると、しばらく「② だけ」の一覧になり、おすすめの順の見せ方を確かめられない。
  2. `OutfitGame` は「複数を選んでまとめて確かめる」「部位ごとにヒントを出す」「正解が複数ある」を含むので、土台（表示モード、フィードバック、終わりの画面）を難しいほうの使い方で先に固められる。`SortGame` はその土台をそのまま使える。
  3. 作りやすさの差は小さい。どちらもタップだけで、ドラッグはない。`SortGame` のほうが少し単純なだけ。
- どの PR もクライアントだけの変更なので、`npm run seed --prefix server` は不要。

**implementer への指示書に書くこと**（各 PR 共通）: この文書の 3〜7 章の該当部分、「点数を付けない」、「フィンランド語の文はコードで組み立てない」、「部品は小さな固定データでテストする」、「`.jsx` から関数を export しない（oxlint）」、「依存パッケージを足さない」、「ドラッグは作らずタップ」。

---

## 9. 決まったこと・まだ決めること

### 9.1 決定済み（2026-10-24、ユーザー）

1. **入口**: ナビの「暮らし」とホームのカードの両方（PR 1）。
2. **点数**: 付けない。どのミニゲームにもいつでも入れる。一覧は Guider Game の教師用指導書の舞台の順（Koti → Lähiö → Kaupunki）に沿った「おすすめの順」（① 天気と服 → ② ごみの分別 → ③ 階段での会話）で並べる。正しくなるまで選び直すこと、理由のフィードバック、`recordAnswer()` は残す。
3. **順番の制限**: なし（データにもその項目を持たせない）。
4. **会話**: 一本道。データには `next` を持たせ、あとで分岐できる形にする。
5. **言語の欄**: `en` は必須、`ja` は任意（なければ出さない）。文の形は `{ fi, selko?, en, ja? }`。
6. **表示の初期値**: フィンランド語＋英語（`en`）。切り替えは fi / selko / en（ja はデータがあるときだけ）。UI の言語（ナビの ja / en）とは連動しない（3.5）。

7. **✔ 印**: 残す。「遊んだことがある」の目印で点数ではない。localStorage だけで、server は変えない（3.3）。

### 9.2 まだ決めること

なし（2026-10-24 に設計を確定）。

**確かめが要ること（今回の設計では使わない）**
- ドラッグ＆ドロップ: HTML5 の Drag and Drop はスマホのタッチで動かない。作るなら Pointer Events で自作するか依存パッケージ（例: dnd-kit）が要る。試作はタップで代える。
- 絵・イラスト: 自作の SVG を描くか、ライセンスの確かな素材を使うか。試作は絵文字だけ（絵文字の見た目は OS によって違う）。
- selkosuomi の質: Selkokeskus の基準に沿っているかは、ネイティブか selkokieli に詳しい人に見てもらうのが望ましい。

---

## 付録: 既存のコードで気になった点（この設計に関係するもの）

1. `client/src/utils/audio.js` が `http://localhost:5000/api/tts` を直接呼んでいる（ほかの API は axios の相対パス `/api/...` と Vite の proxy を使う）。スマホから LAN 越しに開くと音声が出ない。また TTS が失敗すると `alert()` を出すので、自動再生のある画面では何度も出る。→ PR 0 で直す。
2. `normalizeWord()`（`client/src/utils/wordBook.js`）は出典を `passage` と `manual` しか残さない。場面から入れた語の出典を残すには変更が要る（PR 6）。
3. `reviewSchedule.js` の `isValidKey()` / `getDueKeys()` は `sentence` / `grammar` / `word` の 3 種類に決め打ち。場面そのものを復習に乗せるなら、ここと `getDueCount()`・`Review.jsx` を広げる必要がある（今回はしない）。
4. `progressController.saveProgress` は受け取る項目を一覧で決めているので、新しい進捗の項目をサーバーに送るなら、サーバー側の 3 か所（controller・model・`progressData`）とクライアントの `useProgressStore` を同時に直す必要がある（今回は送らない）。
5. `useSession` は URL から例文の ID を指定して始められない（`sentenceIds` は復習モードの中だけ）。場面から「関連する例文だけ」を練習させるなら `useSession` の変更が要る。今回はレッスン単位（`lessonId`）でつなぐ。
6. `playAudio()` の 2 つ目の引数（`seedString`）は使われていない。呼び出しの書き方が画面ごとにばらつく（`playAudio(word)` だけの画面もある）。
