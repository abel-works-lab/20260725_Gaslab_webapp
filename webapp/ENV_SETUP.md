# 環境変数の設定（`.env.local` を手動作成）

`webapp/.env.local` を新規作成し、以下を記入する（このファイルはコミットしない）。

```
# ---- Convex ----
# `npx convex dev` 実行時に自動で書き込まれる
NEXT_PUBLIC_CONVEX_URL=

# ---- WorkOS AuthKit ----
# https://dashboard.workos.com で取得
WORKOS_API_KEY=
WORKOS_CLIENT_ID=
# 32文字以上のランダム文字列（Cookie暗号化用）。生成: openssl rand -base64 32
WORKOS_COOKIE_PASSWORD=
# ログイン後リダイレクト先（ローカル。ポート番号はpackage.jsonのdevスクリプトに合わせる）
WORKOS_REDIRECT_URI=http://localhost:3000/callback
```

## WorkOS 側の設定
1. WorkOS ダッシュボード → Redirects に `WORKOS_REDIRECT_URI` と同じURLを登録
2. AuthKit を有効化（Email+Password か Google 等）
3. API Key / Client ID をコピーして上記に貼る

## Convex 側
- `webapp/` で `npx convex dev` を実行 → プロジェクト作成 → `NEXT_PUBLIC_CONVEX_URL` が自動設定される
- その後 `node scripts/seed.mjs` でデータ投入
