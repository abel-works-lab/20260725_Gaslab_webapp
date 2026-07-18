// data/muni_stats_r5_00.json を Convex の muniStats に投入。
// 使い方: webapp/ で `node --use-system-ca scripts/seed_muni_stats.mjs`
// seedMuniStats は internalMutation（外部クライアントから呼べない）のため、管理者キーが必要。
// 環境変数 CONVEX_DEPLOY_KEY か .env.local の CONVEX_DEPLOY_KEY=... に設定しておく
// （Convexダッシュボード → Settings → Deploy Keys で発行。devとprodで別キー）。
import { ConvexHttpClient } from 'convex/browser'
import { internal } from '../convex/_generated/api.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

// 環境変数 → .env.local の順で参照する
function envVar(name) {
  if (process.env[name]) return process.env[name].trim()
  const p = path.join(root, '.env.local')
  if (fs.existsSync(p)) {
    const txt = fs.readFileSync(p, 'utf-8')
    for (const line of txt.split(/\r?\n/)) {
      const m = line.match(new RegExp('^' + name + '=(.+)$'))
      if (m) return m[1].trim()
    }
  }
  throw new Error(`${name} が環境変数にも .env.local にもありません`)
}

const rows = JSON.parse(fs.readFileSync(path.join(root, 'data', 'muni_stats_r5_00.json'), 'utf-8'))
const client = new ConvexHttpClient(envVar('NEXT_PUBLIC_CONVEX_URL'))
// internalMutation を呼ぶための管理者認証（Convex CLI と同じ仕組み）
client.setAdminAuth(envVar('CONVEX_DEPLOY_KEY'))
const res = await client.mutation(internal.medicalCost.seedMuniStats, { rows })
console.log('seeded muniStats:', res)
