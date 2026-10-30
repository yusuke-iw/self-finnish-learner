# 街（Kaupunki）の 2 本目: ATM で画面を読む（設計）

2026-10-30。`kaupunki-doctor-call.md` の続き。一覧で ⑤「ATM で」（`pankkiautomaatti`、準備中）になっているゲームを作る。新しい型 `procedure`（部品名 `ProcedureSim`）を足す。

## 1. 何を練習するか

機械の画面のフィンランド語を読んで、目的に合うボタンを押す。読むだけで話さない。

- 画面の決まり文句: `Valitse kieli`, `Syötä kortti`, `Näppäile tunnusluku ja paina OK`, `Valitse toiminto`, `Nosto`, `Saldo`, `Valitse summa`, `Muu summa`, `Haluatko kuitin?`, `Ota kortti`, `Ota rahat`, `Väärä tunnusluku`, `Tapahtuma keskeytetty`
- 機械のキーの色と名前: `OK`（緑）, `Korjaa`（黄）, `Peruuta`（赤）
- 金額の読み取り（`152,30 €`）。数字の練習（`NumberPractice`）の続き

## 2. 遊び方

1. はじめに**目的**のカードが出る（例: 「40 euroa käteistä. Kuittia et tarvitse.」）。表示モードに合わせて訳が付く。
2. ATM の画面（濃い色の枠）にフィンランド語の文が出る。画面の文は**表示モードにかかわらずいつも fi** で出し、訳（selko / en / ja）は画面の下に小さく出す（`fi` モードでは訳なし）。🔊 / 🐢 で画面の文を読み上げる。
3. 画面の横にボタン（2〜4 個）。ボタンの文字もいつも fi で、訳は小さく下に。
4. 合うボタンを押すと正解の音、短いフィードバック（なぜそれか）、「次へ」。合わないボタンは赤くなり、理由のフィードバック。正しくなるまで選び直す（ほかのゲームと同じ。点数なし）。
5. 画面によっては、機械の外から**問い**が出る（例: 画面に残高が出て「Paljonko tilillä on rahaa?」）。答えはボタンで選ぶ。
6. 最後の画面のあと `onFinish`（終わりの画面はいつもの `SceneResult`）。

- 遊ぶたびに 3 本の手順から 1 本が選ばれる（`DialogueScene` の `dialogues` と同じ。`playLength: 1`）。
- 暗証番号は**打たせない**。画面に `****` と出ていて、学習者は `OK` / `Korjaa` / `Peruuta` を選ぶだけ。テンキーは作らない。
- `recordAnswer()` は 1 画面につき 1 回（最初に押したとき）。選び直しでは呼ばない。

## 3. データの形

`client/src/data/scenes/pankkiautomaatti.json`。共通の項目（`id`, `sceneId`, `type`, `schemaVersion`, `icon`, `title`, `place`, `instruction`, `playLength`, `relatedLessonId`, `infoCards`, `vocabulary`）は既存のゲームと同じ。

```jsonc
{
  "id": "pankkiautomaatti",
  "sceneId": "kaupunki",
  "type": "procedure",
  "schemaVersion": 1,
  "icon": "🏧",
  "title": { "fi": "Pankkiautomaatilla", "en": "At the ATM", "ja": "ATM で" },
  "place": { "fi": "pankkiautomaatti", "en": "ATM", "ja": "ATM" },
  "instruction": { "fi": "…", "selko": "…", "en": "…", "ja": "…" },
  "playLength": 1,
  "relatedLessonId": "l1",
  "procedures": [
    {
      "id": "nosto",
      "goal": { "fi": "Nosta 40 euroa. Et tarvitse kuittia.", "selko": "…", "en": "…", "ja": "…" },
      "steps": [
        {
          "id": "s1",
          "screen": [{ "fi": "Valitse kieli", "selko": "…", "en": "Choose a language", "ja": "言語を選んでください" }],
          "question": null,                       // 任意。機械の外から出す問い（LocalizedText）
          "buttons": [
            { "id": "fi", "label": { "fi": "Suomi", "en": "Finnish", "ja": "フィンランド語" }, "key": null, "correct": true,
              "feedback": { "fi": "…", "selko": "…", "en": "…", "ja": "…" } },
            { "id": "sv", "label": { "fi": "Svenska", "en": "Swedish", "ja": "スウェーデン語" }, "key": null, "correct": false,
              "feedback": { "fi": "…", "selko": "…", "en": "…", "ja": "…" } }
          ]
        },
        {
          "id": "s2",
          "screen": [
            { "fi": "Näppäile tunnusluku ja paina OK", "selko": "…", "en": "…", "ja": "…" },
            { "fi": "****", "en": "****" }        // 訳が同じ行は fi と en だけでよい
          ],
          "buttons": [
            { "id": "ok", "label": { "fi": "OK", "en": "OK" }, "key": "ok", "correct": true, "feedback": { … } },
            { "id": "korjaa", "label": { "fi": "Korjaa", "en": "Correct", "ja": "訂正" }, "key": "korjaa", "correct": false, "feedback": { … } },
            { "id": "peruuta", "label": { "fi": "Peruuta", "en": "Cancel", "ja": "取消" }, "key": "peruuta", "correct": false, "feedback": { … } }
          ]
        }
      ]
    }
  ],
  "infoCards": [ … ],
  "vocabulary": [ … ]
}
```

- `key`: `ok` / `korjaa` / `peruuta` のときは機械のキーの色（緑・黄・赤）で描く。`null` は画面の横のボタン。
- 1 つの画面で `correct: true` はちょうど 1 つ。すべてのボタンに `feedback`（fi / selko / en、ja があるゲームは ja）。
- 画面の文・目的・問い・フィードバックには `selko` を付ける（`finnish-content` の決まりと同じ）。ボタンの文字は短いので `selko` なし。
- 金額・残高は文字で書く（`40 €`, `152,30 €`）。

## 4. 手順（3 本、各 5〜8 画面）

| 手順の `id` | 目的 | 画面の流れ（下書き） |
| --- | --- | --- |
| `nosto` | 40 € を引き出す。レシートなし | 言語 → 暗証番号（OK）→ `Valitse toiminto`（`Nosto`）→ `Valitse summa`（`40 €`、ほかに `20 €` / `60 €` / `Muu summa`）→ `Haluatko kuitin?`（`Ei`）→ `Ota kortti` → `Ota rahat` |
| `saldo` | 残高を見る | 言語 → 暗証番号 → `Saldo` → 画面に `Tilin saldo: 152,30 €` と問い「Paljonko tilillä on rahaa?」（金額 3 択）→ `Haluatko jatkaa?`（`Ei`）→ `Ota kortti` |
| `vaara-tunnusluku` | 60 € を引き出し、レシートをもらう。途中で暗証番号を間違える | 言語 → 暗証番号 → `Väärä tunnusluku. Yritä uudelleen.`（`Korjaa` / `OK` が正しく、`Peruuta` はやめてしまう）→ 暗証番号 → `Nosto` → `60 €` → `Kuitti`（`Kyllä`）→ `Ota kortti` → `Ota rahat ja kuitti` |

- 間違いのボタンには「よくある読み違い」を入れる（例: `Saldo` と `Nosto` の取り違え、`Peruuta`（取消）を「戻る」と読み違える、`Muu summa` を「最大の金額」と思う）。
- 実在の銀行・ATM の名前や画面の文そのものは使わない（画面の文は一般的な言い方で自作する）。Guider Game の文・絵・名前も使わない。

## 5. 説明カード（3 枚）

1. **画面の決まり文句**: `Syötä` / `Näppäile` / `Valitse` / `Ota` は命令形（「〜してください」にあたる）。機械やアプリの画面はこの形が多い。`grammarNote` に命令形の作り方を一言。
2. **キーの色**: 緑 `OK`、黄 `Korjaa`（1 字消す・やり直す）、赤 `Peruuta`（取り消してカードが出てくる）。
3. **話し言葉の「otto」**: ATM は話し言葉で `otto`（`Käyn otolla.` など）、引き出すは `nostaa rahaa`。暗証番号は `tunnusluku`（`PIN-koodi` とも）。

## 6. 語彙（10〜12 語）

`pankkiautomaatti`, `kortti`, `tunnusluku`, `nostaa`, `nosto`, `saldo`, `summa`, `kuitti`, `peruuttaa`, `korjata`, `käteinen`, `tili`

## 7. コードの変更（implementer）

| パス | 変更 |
| --- | --- |
| `client/src/utils/procedureSim.js`（新規） | `createProcedureRound(game, random)`（手順を 1 本選ぶ）、`getCurrentStep(state)`、`answerStep(state, buttonId)` → `{ state, isCorrect, isNewStep, finished }`、`nextStep(state)`。`sortGame.js` と同じ書き方の純粋な関数 |
| `client/src/components/scenes/ProcedureSim.jsx`（新規） | 目的のカード、画面（`scene-atm-screen`）、ボタン（`key` で色）、問い、フィードバック、🔊 / 🐢、進み具合（`progress-bar`）。`SortGame.jsx` と同じ作り（`playAudio` + `DEFAULT_SPEAKER`、効果音、`recordAnswer`） |
| `client/src/pages/SceneGame.jsx` | `type === 'procedure'` で `ProcedureSim` に振り分ける。三項演算子が長くなるので、`type` から部品を引く小さな対応表にしてよい |
| `client/src/App.css` | `scene-atm-` で始まるクラス（画面の枠、キーの色）。スマホ幅でボタンが画面の下に回る。ダーク／ライトの両方で読める |
| 文言（`translations.js`） | 目的の見出し、「次へ」など。ja / en |
| `client/src/data/scenes/pankkiautomaatti.json`（新規） | 手順 `nosto` 1 本だけの下書き（4 章の流れ）。説明カード 1 枚・語彙 6 語。本番のデータは次の PR |
| `client/src/data/scenes/index.js`、`scenes.json` | `games` と kaupunki の `gameIds` に足す。`upcoming.json` の予告は、同じ `id` のゲームがあれば自動で消える（`getUpcomingGames`）ので消しても残してもよい（消す） |

- 点数を付けない、フィンランド語の文をコードで組み立てない、`.jsx` から関数を export しない（oxlint）、依存パッケージを足さない、ドラッグは作らずタップ。

## 8. テスト

- `client/src/utils/__tests__/procedureSim.test.js`: 手順の選び方（`random` を渡して固定）、正解で進む、不正解で同じ画面のまま、`isNewStep` が 1 画面 1 回だけ、最後の画面で `finished`
- `client/src/components/__tests__/SceneComponents.test.jsx`（または新しいファイル）: **テストの中の小さな固定データ**で、画面の文が fi のまま・訳が表示モードで変わる、`fi` モードで訳が出ない、間違いのボタンが赤くなりフィードバックが出る、`recordAnswer` が 1 画面 1 回、最後で `onFinish`、`ja` のないデータで ja が出ない。`playAudio` と効果音は `vi.mock`
- `client/src/data/__tests__/sceneData.test.js`: `procedure` の形（`procedures` が 1 本以上、各画面に `correct` がちょうど 1 つ、ボタンの `id` が画面の中で一意、`key` が既知の値か `null`、すべての `feedback` に fi / en と selko、`goal` と `screen` に selko）。kaupunki の `gameIds` が `["ajanvaraus", "pankkiautomaatti"]`、`getUpcomingGames('kaupunki')` が空
- `client/src/pages/__tests__/SceneGame.test.jsx`: `pankkiautomaatti` を最後まで押して終わりの画面に行く。`ajanvaraus` の「次のおすすめ」が `pankkiautomaatti` になる
- `Scenes.test.jsx` の「準備中が 1 つ以上」は、準備中の予告がなくなるので直す（準備中がなくても通る形に）

## 9. PR の分け方

| 順 | ブランチ | 担当 | 中身 | レビュー |
| --- | --- | --- | --- | --- |
| 1 | `feat/scenes-procedure` | implementer | 7 章と 8 章（部品・ロジック・CSS・振り分け・下書きのデータ 1 本・テスト） | 指揮者が差分を読み、CI。画面の見た目（スマホ幅・ダーク）は qa-reviewer にブラウザで見てもらう |
| 2 | `content/scenes-atm` | content-editor | 手順 3 本の本番、説明カード 3 枚、語彙 10〜12 語、en / ja | 指揮者が差分を読み、CI |

- どちらも client だけの変更なので `npm run seed --prefix server` は要らない。
- これで「暮らし」の Kaupunki は ④ ⑤ がそろう。役所と用件（`SortGame` の流用）は、そのあとに続けるか決める。
