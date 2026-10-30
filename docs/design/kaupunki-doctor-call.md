# 街（Kaupunki）の 1 本目: 電話で診療の予約（設計）

2026-10-30。`home-neighbourhood-prototype.md` の続き。街の場面の最初のミニゲームとして、保健センター（terveysasema）に電話して予約を取る会話を足す。今の一覧で「準備中」になっている Kaupunki に、遊べるゲームを 1 本入れる。

## 1. 何を作るか

- 型は既存の `DialogueScene`（`rappukaytava.json` と同じ `type: "dialogue"`）。**部品のコードは変えない**。データを 1 ファイル足し、一覧に登録するだけ。
- 遊ぶたびに 3 本の会話から 1 本が選ばれる（`dialogues` の数で決まる。`rappukaytava` と同じ）。
- おすすめの順では ④（① 天気と服 → ② ごみの分別 → ③ 階段での会話 → **④ 電話で予約**）。

| 項目 | 値 |
| --- | --- |
| ファイル | `client/src/data/scenes/ajanvaraus.json` |
| `id` | `ajanvaraus` |
| `sceneId` | `kaupunki` |
| `icon` | 📞 |
| `title` | fi `Ajanvaraus puhelimessa` / en `Booking an appointment by phone` / ja `電話で診療の予約` |
| `place` | fi `Terveysasema` / en `Health center` / ja `保健センター` |
| `relatedLessonId` | `l9`（Terveys ja lääkärissä） |
| `playLength` | 1 |

## 2. 登場人物

| `id` | 名前 | `speakerId` | 役 |
| --- | --- | --- | --- |
| `hoitaja` | Helmi | `helmi`（はっきり話す声） | 保健センターの看護師（`sairaanhoitaja` / nurse / 看護師） |

- 学習者は電話をかける側。話すのは看護師だけで、学習者は選択肢を選ぶ（今の `DialogueScene` と同じ）。
- 医師との診察の場面は作らない（電話だけで閉じる）。

## 3. 会話（3 本、各 4〜6 ノード）

| 会話の `id` | 中身 | 練習する言い方 |
| --- | --- | --- |
| `varaa-aika` | 予約を取る。名乗る → 用件 → 生年月日を言う → 提示された時間を受ける／別の時間を頼む → 確認して「Kuulemiin」 | `Haluaisin varata ajan lääkärille.`、`Syntymäaikani on …`、`Sopiiko torstaina kello 10.15?` → `Sopii hyvin.` / `Onko teillä aikaa iltapäivällä?` |
| `oireet` | 看護師が症状を聞く（電話での相談）。何の症状か → いつから → 熱は何度か → 看護師の助言を受けて予約するか決める | `Minulla on kuumetta ja yskää.`、`Kurkku on kipeä.`、`Päätä särkee.`、`Kolme päivää.`、`Kuumetta on 38,5 astetta.` |
| `siirra-aika` | 取ってある予約を変える。予約があると言う → 行けない理由 → 別の日を選ぶ → 確認 | `Minulla on aika maanantaina, mutta en pääse.`、`Voinko siirtää sen?`、`Käykö keskiviikko?` |

- 文の形・`quality`（`good` / `ok` / `bad` / `repeat`）・`next`・`spoken` / `spokenNotes` は `rappukaytava.json` と同じ。どのノードにも `good` が 1 つ以上、`repeat`（「Anteeksi, voitteko toistaa?」など）を各会話に 1 つ以上入れる。
- **電話らしい間違い**を `bad` / `ok` に入れる。例: 電話の終わりに `Hei hei!`（`ok`: 通じるが、改まった電話では `Kuulemiin` がふつう）、症状を聞かれて `Kyllä.`（`bad`: 何の症状かを答えていない）、`Minulla on kuume.`（`ok`: 部分格の `kuumetta` が自然）、`Pää on särkee.`（`bad`: `Päätä särkee` か `Pää on kipeä`）。
- 看護師は窓口の改まった話し方なので、話し言葉版（`spoken`）は近所の会話より書き言葉に近い（`teillä` → `teil`、`kello` → `kello` のままなど）。違いが小さいノードは `spokenNotes` に「電話ではほぼこのまま」と書く。
- 時刻・日付・体温・生年月日の数字は文字で書く（`kello 10.15`、`38,5 astetta`）。読み上げで数字の聞き取りの練習にもなる（`NumberPractice` の続き）。
- **医療の中身で迷わせない**: 看護師の助言は一般的なもの（「休んで水分を取る」「熱が下がらなければまた電話する」）だけにする。診断や薬の名前は出さない。

## 4. 説明カード（3 枚）

1. **どこに電話するか**: 急ぐときは `112`（救急）、夜や週末に急ぎで相談するときは `116117`（Päivystysapu）、ふだんは自分の地域の保健センター（terveysasema）。番号と呼び名は content-editor が公的な資料で確かめる。
2. **症状の言い方**: `Minulla on` ＋部分格（`kuumetta`, `yskää`, `nuhaa`）、`X on kipeä`（`kurkku`, `vatsa`）、`X:ää/X:tä särkee`（`päätä`, `selkää`）。`grammarNote` に部分格の一言。
3. **電話での決まり文句**: 名乗り方（`Täällä on …` / `Minun nimeni on …`）、聞き取れないとき（`Voitteko toistaa?`、`Voitteko puhua hitaammin?`）、終わり方（`Kuulemiin`）。`haluaisin` は条件法（レッスン `l4`）で、ていねいな頼み方になることを `grammarNote` に。

## 5. 語彙（10〜12 語）

`terveysasema`, `ajanvaraus`, `aika`（予約の時間）, `lääkäri`, `sairaanhoitaja`, `oire`, `kuume`, `yskä`, `kurkku`, `särkeä`, `peruuttaa`, `siirtää`。形は今の `vocabulary`（`word` / `translation` / `translationJa`）。

## 6. 一覧への登録

| ファイル | 変更 |
| --- | --- |
| `client/src/data/scenes/index.js` | `ajanvaraus.json` を import して `games` に足す（2 行） |
| `client/src/data/scenes/scenes.json` | `kaupunki` の `gameIds` を `["ajanvaraus"]` にし、`comingSoon` を消す |
| `client/src/data/scenes/upcoming.json` | `kaupunki` に次のゲームの予告を 1 件足す: `id` `pankkiautomaatti`, `icon` 🏧, `number` 5, title fi `Pankkiautomaatilla` / en `At the ATM` / ja `ATM で`（ProcedureSim を作るまで「準備中」で見せる） |

- 場面の見出しの「準備中」は消え、Kaupunki には ④ と ⑤（準備中）のカードが並ぶ。
- client だけの変更なので `npm run seed --prefix server` は要らない。

## 7. テスト

- `client/src/data/__tests__/sceneData.test.js` の今のデータのテストが新しいファイルにもそのまま効く（会話の行き先、`speakerId`、`spoken` / `spokenNotes`、`relatedLessonId`、語彙 6 語以上など）。`games` を回すテストは自動で `ajanvaraus` を含む。
- 足すテスト: `kaupunki` の `gameIds` に `ajanvaraus` があり `comingSoon` がないこと、`getRecommendedGames()` で `ajanvaraus` が 4 番目、`upcoming.json` の `pankkiautomaatti` が `getUpcomingGames('kaupunki')` に出ること。
- `Scenes.test.jsx` の「準備中が 1 つ以上」は `pankkiautomaatti` の予告で通るはず。落ちたら直す。

## 8. 進め方

1. content-editor: ブランチ `content/scenes-doctor-call`（`origin/main` から）。6 章の登録と 7 章のテストもこの PR でやる（データの登録とテストだけでコードは変えないため）。フィンランド語・英語・日本語を 1 行ずつ確かめ、自信のない表現は PR の説明に一覧で書く。
2. 指揮者が差分を読み、CI（Client・Server）が通ったらマージする。
3. 自信のない表現は Todoist の「ネイティブに確認してもらう」タスクに足す。
4. その次は ProcedureSim（ATM）の設計。
