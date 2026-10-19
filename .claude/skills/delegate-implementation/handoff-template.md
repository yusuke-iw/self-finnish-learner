# 指示書 <作業名>: <一行で何をするか>

リポジトリ: <repo の絶対パス>（client = React 19 + Vite + vitest + oxlint、server = Express + Jest + Mongoose。DB 未接続時は `server/src/config/seedData.js` で動く）
作業ブランチは Claude Code が用意済み。git 操作はしないこと。改行は LF。
`.agents/rules/*.md` に従い、テストを先に書いてから実装する。既存の書き方に合わせる:
- 画面の文言は ja / en の両方を `client/src/locales/translations.js` に置き、`t()` で使う（`useLanguage` は `client/src/context/useLanguage.js`）
- localStorage の読み書きは try/catch で囲む
- スタイルは `client/src/assets/App.css` のクラス。インライン style は実行時に決まる値だけ
- サーバーとの同期は `client/src/store/useProgressStore.js` の `syncWithServer` と `saveProgress`
CI で `npx oxlint src --deny-warnings` を実行しているので、lint 警告を 1 件も増やさない。

## 現状

<関係するファイルと、今どう動いているか。問題があるならその再現条件>

## やること

<番号付きで。ファイル・関数・データの形・文言（ja / en）まで具体的に>

## テスト

<先に書くテストと、それぞれ何を確かめるか>

## 範囲外

<触らないもの。依存パッケージの追加はしない>

## 完了条件（Claude Code が実行する）

- `cd client && npx oxlint src --deny-warnings && npx vitest run && npx vite build`
- `cd server && npx jest --runInBand`
- 最後に、変更ファイル・未解決点を日本語で報告する。
