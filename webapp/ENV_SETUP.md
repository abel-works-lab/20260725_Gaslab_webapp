# 環境変数の設定（`.env.local` を手動作成）

`npm run setup`（`webapp/` で実行）を使うと、下記の大半（npm install・.env.local雛形生成・
Convexプロジェクト作成・データseed投入）を自動化できる。WorkOS/Convexのアカウント作成・
APIキー取得だけは自分で行う必要がある（スクリプト実行中に案内される）。
このドキュメントは手動でやる場合の手順、または `npm run setup` の途中で参照する手順。

`webapp/.env.local` を新規作成し、以下を記入する（このファイルはコミットしない）。

```
# ---- Convex ----
# `npx convex dev` 実行時に自動で書き込まれる
NEXT_PUBLIC_CONVEX_URL=
# Convexダッシュボード → Settings → Deploy Keys で発行して貼る（seedスクリプト実行に必須）
CONVEX_DEPLOY_KEY=

# ---- WorkOS AuthKit ----
# https://dashboard.workos.com で取得
WORKOS_API_KEY=
WORKOS_CLIENT_ID=
# 32文字以上のランダム文字列（Cookie暗号化用）。生成: openssl rand -base64 32
WORKOS_COOKIE_PASSWORD=
# ログイン後リダイレクト先（ローカル。package.jsonのdevスクリプトは-p 3100固定なので、
# ポート番号を変更しない限りここは3100番にする。3000番等にすると認証が失敗するので注意）
WORKOS_REDIRECT_URI=http://localhost:3100/callback
```

## WorkOS 側の設定
1. WorkOS ダッシュボード → Redirects に `WORKOS_REDIRECT_URI` と同じURLを登録
2. AuthKit を有効化（Email+Password か Google 等）
3. API Key / Client ID をコピーして上記に貼る

## Convex 側
- `webapp/` で `npx convex dev --once` を実行 → プロジェクト作成 → `NEXT_PUBLIC_CONVEX_URL` が自動設定される
- Convexダッシュボード → Settings → Deploy Keys で `CONVEX_DEPLOY_KEY` を発行して貼る
- その後 `node scripts/seed.mjs` `node scripts/seed_medical_cost.mjs` `node scripts/seed_muni_stats.mjs` `node scripts/seed_region.mjs` でデータ投入

## トラブルシューティング

- **`unable to verify the first certificate` エラーが出る場合**：環境によってはNode.jsの証明書検証で引っかかることがある。`npx convex dev`や`node scripts/*.mjs`の実行前に、OSの証明書ストアを使うよう指定する。
  - PowerShellの例: `$env:NODE_OPTIONS="--use-system-ca"` を実行してから同じターミナルでコマンドを実行する
