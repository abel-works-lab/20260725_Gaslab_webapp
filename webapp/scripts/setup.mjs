// 参加者向けの環境構築セットアップスクリプト。`npm run setup` から実行する。
//
// 自動化する範囲: npm install / .env.local雛形生成 / Convexプロジェクトの作成・コード反映
//              / データseed投入
// 自動化しない範囲（参加者本人の操作が必須）:
//   - WorkOSアカウント作成・Application作成・API Key/Client IDの取得
//   - Convexログイン（ブラウザでのOAuth承認）
//   - ConvexダッシュボードでのDeploy Key発行
import { spawnSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import readline from 'readline'
import crypto from 'crypto'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const envPath = path.join(root, '.env.local')

function run(cmd, args) {
  const res = spawnSync(cmd, args, {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })
  if (res.status !== 0) {
    console.error(`\n✗ 失敗しました: ${cmd} ${args.join(' ')}`)
    process.exit(1)
  }
}

function isFilled(name) {
  if (!fs.existsSync(envPath)) return false
  const txt = fs.readFileSync(envPath, 'utf-8')
  return new RegExp(`^${name}=(.+)$`, 'm').test(txt)
}

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => rl.question(question, (ans) => { rl.close(); resolve(ans) }))
}

async function waitUntilAllFilled(names, guideText) {
  if (names.every(isFilled)) {
    console.log(`✓ 設定済みです: ${names.join(', ')}`)
    return
  }
  console.log(guideText)
  while (names.some((n) => !isFilled(n))) {
    await ask('\n貼り付けが完了したらEnterキーを押してください... ')
    const missing = names.filter((n) => !isFilled(n))
    if (missing.length) {
      console.log(`まだ入力されていません: ${missing.join(', ')}。.env.local を保存したか確認してください。`)
    }
  }
  console.log(`✓ 確認しました: ${names.join(', ')}`)
}

console.log('=== 35_e-stat_pre セットアップ ===\n')

// 1. npm install
if (!fs.existsSync(path.join(root, 'node_modules'))) {
  console.log('[1/5] npm install を実行します...')
  run('npm', ['install'])
} else {
  console.log('[1/5] node_modules は既に存在するためスキップします')
}

// 2. .env.local 雛形生成
if (!fs.existsSync(envPath)) {
  console.log('[2/5] .env.local を新規作成します')
  const cookiePassword = crypto.randomBytes(32).toString('base64')
  const template = `# ---- Convex ----
# NEXT_PUBLIC_CONVEX_URL は次のステップで npx convex dev --once が自動で書き込みます
NEXT_PUBLIC_CONVEX_URL=
# Convexダッシュボード → Settings → Deploy Keys で発行して貼り付けてください
CONVEX_DEPLOY_KEY=

# ---- WorkOS AuthKit ----
# https://dashboard.workos.com で取得
WORKOS_API_KEY=
WORKOS_CLIENT_ID=
# Cookie暗号化用（自動生成済み・変更不要）
WORKOS_COOKIE_PASSWORD=${cookiePassword}
# ログイン後リダイレクト先（このプロジェクトはポート3100固定）
WORKOS_REDIRECT_URI=http://localhost:3100/callback
`
  fs.writeFileSync(envPath, template, 'utf-8')
  console.log('✓ .env.local を作成しました（WORKOS_COOKIE_PASSWORD / WORKOS_REDIRECT_URI は設定済み）')
} else {
  console.log('[2/5] .env.local は既に存在するためスキップします')
}

// 3. WorkOSキーの入力待ち
console.log('\n[3/5] WorkOSの設定')
await waitUntilAllFilled(
  ['WORKOS_API_KEY', 'WORKOS_CLIENT_ID'],
  [
    '以下の手順でWorkOSのキーを取得し、.env.local に貼り付けてください:',
    '  1. https://dashboard.workos.com でアカウント作成・ログイン',
    '  2. Applications で新規Applicationを作成',
    '  3. Redirects に http://localhost:3100/callback を登録',
    '  4. AuthKit を有効化（Email+Password 等）',
    '  5. API Key と Client ID をコピーし、.env.local の WORKOS_API_KEY= / WORKOS_CLIENT_ID= に貼る',
  ].join('\n'),
)

// 4. Convexプロジェクト作成・コード反映（ブラウザログインが必要）
console.log('\n[4/5] Convexのセットアップを行います（ブラウザでログイン画面が開きます）')
run('npx', ['convex', 'dev', '--once'])
console.log('✓ Convexプロジェクトの作成・コード反映が完了しました')

await waitUntilAllFilled(
  ['CONVEX_DEPLOY_KEY'],
  'Convexダッシュボード → Settings → Deploy Keys でキーを発行し、.env.local の CONVEX_DEPLOY_KEY= に貼り付けてください',
)

// 5. データseed投入
console.log('\n[5/5] データを投入します')
run('node', ['scripts/seed.mjs'])
run('node', ['scripts/seed_medical_cost.mjs'])
run('node', ['scripts/seed_muni_stats.mjs'])
run('node', ['scripts/seed_region.mjs'])

console.log('\n=== セットアップ完了 ===')
console.log('次のコマンドで起動してください: npm run dev')
console.log('ブラウザで http://localhost:3100 を開いてください')
