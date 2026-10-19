---
name: delegate-implementation
description: 実装を Antigravity（agy）か Codex に委譲する手順。指示書の書き方、実行コマンド、クォータ切れ時の切り替え、結果の受け取り方。implementer と content-editor が使う。
---

# 実装の委譲（Antigravity → Codex）

Claude Code は方針・指示書・レビュー・テスト実行・commit / PR を受け持ち、コードやデータの編集は外部のエージェントに任せる（Claude のトークンを節約するため）。数行で終わる修正は自分で直してよい。

## 優先順

1. Antigravity `gemini-4-argon-high`
2. Antigravity `gemini-3.8-flash-high`（1 が `status: ERROR` で「Individual quota reached」のとき。モデル ID は `agy models` で確認）
3. Codex（2 も失敗したとき）

外部エージェントは**同時に 1 つまで**動かす（クォータを使い切らないため、また同じ作業ツリーを 2 つが触らないため）。

## 1. 指示書を書く

[handoff-template.md](handoff-template.md) を写して、スクラッチパッドに `handoff-<作業名>.md` を作る。必ず書くこと:

- 現状（関係するファイルと、今どう動いているか）と、やること（ファイル・関数・データの形まで具体的に）
- テスト（何を確かめるテストを先に書くか）
- 範囲外（触らないもの）
- 完了条件のコマンド（下の「4. 確認」と同じもの）
- 「lint 警告を 1 件も増やさない」（CI が `oxlint src --deny-warnings` で落ちるため）

## 2. プロンプトを作る

プロンプトは「ガードレール＋指示書」。**Write ツールでファイルに書く**（コマンドの中の heredoc で作ると、コマンドが拒否されたときにファイルができない）。

- Antigravity: [guardrails-agy.md](guardrails-agy.md) の `{{HANDOFF_PATH}}` と `{{REPO}}` を埋めたものをプロンプトファイルにする（指示書はパスで渡す）。
- Codex: [guardrails-codex.md](guardrails-codex.md) の `{{REPO}}` を埋め、その後ろに指示書の本文をつなげて 1 つのファイルにする（標準入力で渡す）。

## 3. 実行する（バックグラウンド）

`<repo>` は作業ツリーの絶対パス（worktree で作業しているならその worktree）、`<sp>` はスクラッチパッド。

**Antigravity**

```bash
cd <repo> && agy -p "$(cat <sp>/prompt-<作業名>.txt)" --model gemini-4-argon-high --add-dir "<repo>" --add-dir "<sp>" --sandbox --mode accept-edits --output-format stream-json --log-file "<sp>/agy-<作業名>.log" --print-timeout 60m > "<sp>/agy-<作業名>.jsonl" 2> "<sp>/agy-<作業名>.err"
```

- `--dangerously-skip-permissions` は付けない（Claude Code の自動モードの判定で拒否される）。代わりに `--sandbox --mode accept-edits`。
- このモードの agy はシェルコマンドを実行できない（使うと自動で拒否されて何も変えずに終わる）。ガードレールでコマンドを使わないよう指示してあるので、テスト・lint・ビルドは自分で実行する。
- 結果は jsonl の最終行の `result`。`status`（`SUCCESS` / `ERROR`）、`error`、`response`（日本語の報告）を読む:

```bash
tail -n 1 <sp>/agy-<作業名>.jsonl | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const r=JSON.parse(s).result||{};console.log(r.status,r.duration_seconds,r.error||"");console.log(r.response||"")})'
```

- `status: ERROR` で quota の文言なら、同じコマンドを `--model gemini-3.8-flash-high` で実行し直す。それも失敗したら Codex。

**Codex**

```bash
cd <repo> && codex exec --json -s workspace-write -c 'approval_policy="never"' -c 'windows.sandbox="unelevated"' -C "<repo>" -o "<sp>/codex-<作業名>-result.md" - < "<sp>/codex-<作業名>.txt" > "<sp>/codex-<作業名>.jsonl" 2> "<sp>/codex-<作業名>.err"
```

- サンドボックス内で `jest` と `oxlint` は動くが、`vitest` と `vite build` は `spawn EPERM` で動かない。それらは自分で実行する。
- 報告は `-o` で指定した Markdown ファイル。

## 4. 確認（委譲先の報告を鵜呑みにしない）

```bash
git status --short && git diff --stat
cd client && npx oxlint src --deny-warnings && npx vitest run && npx vite build
cd ../server && npx jest --runInBand
```

- 差分は問題のありそうな所（ロジック、データの移行、同期、エラー処理）を開いて読む。全行を読む必要はない。
- lint 警告が増えていたら直す（effect 内の同期的な setState、未使用変数、hook の依存配列が多い）。
- 直すのが数行なら自分で直し、テストを足す。大きければ追加の指示書を書いて再委譲する。
- 画面に関わる変更は、`.claude/launch.json` の `api`（port 5000）と `client`（port 5173）を preview で起動して確かめる。1 つの設定で `npm run dev` を動かすと両方が `PORT=5173` になるので、必ず 2 つに分けて起動する。ウィンドウが描画されずクリックできないときは、JavaScript でイベントを送って確かめる。

## 5. コミット

- 作業した AI を `Co-authored-by` に入れる: `Co-authored-by: Antigravity <antigravity@noreply.invalid>` / `Co-authored-by: Codex <codex@noreply.invalid>`。
- ステージするのは変更したパスだけ（`git add -A` は使わない。別のセッションが同じフォルダで作業していることがある）。
- 改行は LF（`.gitattributes` で固定済み）。
