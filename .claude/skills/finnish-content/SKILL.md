---
name: finnish-content
description: 学習コンテンツ（例文・話し言葉版・読解文・カリキュラム・文法解説）の置き場所、データの形、品質ルール、レビューの仕方。content-editor が使う。
---

# 学習コンテンツの追加・修正

## 置き場所

| コンテンツ | ファイル | 備考 |
| --- | --- | --- |
| ユニットとレッスン | `client/src/data/curriculumData.js` | レッスンの `title`（フィンランド語）が例文の `category` と一致する |
| 例文 | `server/src/config/seedData.js` の `sentences` | DB 未接続時はこのファイルを直接読む |
| 読解文 | `server/src/config/seedData.js` の `passages` | |
| 文法解説・ドリル | `client/src/data/grammarData.js`（ja）・`grammarDataEn.js`（en） | 両方を同じ構成で直す |

MongoDB を使う環境では、利用者が `npm run seed --prefix server`（上書きしない upsert）を実行して反映する。マージしたら報告にこの一言を添える。

## 例文（sentences）

```js
{ _id: "m8_1", text: "...", translation: "...", translationJa: "...", difficulty: "easy|medium|hard",
  category: "<レッスンの title>", grammarNotes: "...", grammarNotesJa: "...",
  spokenText: "...", spokenNotes: "...", spokenNotesJa: "..." }   // spoken* は任意
```

- `_id` の接頭辞はレッスンごとに決まっている: Unit 1 の 3 レッスン（Asiointi ja Matkustaminen / Ruoka ja Juoma / Perhe ja Ystävät）は `m1_*`、Menneet ajat は `m2_*`、以降 `m3`〜`m13` がレッスン順。新しいレッスンは次の番号（`m14_*`〜）。追加前に既存の最大番号を確かめ、重複させない。
- 1 レッスン 18 文（`server/src/models/__tests__/seedData.test.js` が確かめる）。レッスンを足したらこのテストの一覧も直す。
- `difficulty`: A2 は `easy`、B1 は `medium`、B2 / C1 は `hard`。
- `grammarNotes` / `grammarNotesJa` は短く、その文で学べる文法を 1〜2 点（例 `"Kelaan (illative)"` / `"Kelaan（入格・〜へ）"`）。格の日本語名はこのアプリの用語に合わせる: 主格・属格・分格・対格・内格・出格・入格・接格・奪格・向格・様格・変格。
- `spokenText` は A2〜B1 のレッスンとユニット 5 に付ける。B2 / C1 の抽象的なレッスン（Yhteiskunta ja Ympäristö・Lauseenvastikkeet・Abstraktit keskustelut）には付けない。

## 読解文（passages）

`_id`（`p<番号>`）、`title`、`titleJa`、`text`、`translation`、`translationJa`、`category`（英語）、`difficulty`（`A2`・`B1`・`B2/C1` など）、`vocabulary`（8 語。本文に出てくる形の `word` / `translation` / `translationJa`。格や不定詞の注記を括弧で）、`questions`（3 問。内容理解 2 問＋語彙か文法 1 問。`questionText` / `questionTextJa` / `options` / `optionsJa`（各 3 択）/ `correctAnswerIndex`）。正解の位置を偏らせない。`server/src/models/__tests__/passageSeedData.test.js` が形を確かめる（p1・p2 だけ語彙 5 語）。

## 品質ルール（いちばん大事）

**書き言葉（kirjakieli）**
- 文法的に正しく、その場面で実際に使われる自然な文。直訳調・不自然な語順・存在しない複合語を作らない。格（特に分格・属格・場所格）と動詞の活用・支配（rektio）を一つずつ確かめる。
- 制度・固有名詞は現在のものを使う。例: maistraatti ではなく Digi- ja väestötietovirasto（DVV）。TE-toimisto ではなく自治体の työllisyyspalvelut（2025 年から）。esimies より esihenkilö。
- 金額・期限・統計など、確かでない細部は文に入れない。
- 既存の文と重複させない。
- `translationJa` は自然な日本語、`translation` は自然な英語。

**話し言葉（yleispuhekieli。首都圏を中心にした一般的な口語。特定の方言ではない）**
- 代名詞: minä→mä、sinä→sä、hän→se、he→ne、tämä→tää、tuo→toi、nämä→nää。
- 1 人称複数は受動形（me menemme→me mennään、me olemme→me ollaan、emme olisi onnistuneet→me ei oltais onnistuttu）。受動形の文では目的語が主格になる（me haluttais vuokrata mökki）。
- 3 人称複数の主語でも動詞は単数形（ne on, isovanhemmat asuu, nää omenat on）。
- olla: olen→oon、olet→oot、ei ole→ei oo、olisi→ois。条件法 -isi- → -is（haluaisin→haluisin、pitäisi→pitäis）。過去分詞 -nut/-nyt → -nu/-ny。
- että→et、kuin→ku、mutta→mut。所有接尾辞は落として mun / sun を前に置く（kirjani→mun kirja）。
- 話し言葉でほとんど使わない語は言い換える（saapua→tulla など）。主語を言うほうが自然な文では主語を足す（Otatko sä…、Mä tuun…）。
- 書き言葉のままで会話でも自然な文は、そのままにして注記に「Same in speech」/「会話でもこのまま使う」と書く。話し言葉の聞き分け練習（`exerciseType=spoken`）は、書き言葉と違う文だけを使う。
- `spokenNotes` / `spokenNotesJa` は何が変わったかを短く（例 `"minä → mä, olen → oon"`）。

## 進め方

1. 量が多い作成（10 文以上、読解文、話し言葉の付与）は `.claude/skills/delegate-implementation/SKILL.md` の手順で Antigravity / Codex に任せる。指示書には上の「データの形」と「品質ルール」を貼り、作るもの（レッスン・テーマ・レベル・本数）を表で指定する。数文の修正は自分で直す。
2. **できたものは全部、自分で読む**。例文・話し言葉は「書き言葉 → 話し言葉 | 日本語訳」を 1 件 1 行で一覧にして確かめる。出すのは**新しく足した文と変えた文だけ**（`node -e` で seedData.js を読み込み、`_id` で絞って出力する。ファイル全体や既存の文は出さない）。読解文は本文・語彙の注記・設問と正解を確かめる。
3. 直したものは、PR の説明に「何を・なぜ」直したかを書く（例 `m4_16 Me ei ois onnistuttu → Me ei oltais onnistuttu（受動形）`）。
4. テスト: `cd server && npx jest --runInBand`。カリキュラムを変えたら `cd client && npx vitest run && npx oxlint src --deny-warnings && npx vite build` も。
5. 必要ならブラウザで確かめる（ガイドブック、セッション、読解ページ）。preview の起動は `delegate-implementation` の「4. 確認」を参照。
