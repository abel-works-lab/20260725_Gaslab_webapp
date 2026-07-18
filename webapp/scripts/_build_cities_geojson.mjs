// niiyz/JapanCityGeoJson(国土数値情報N03 2020・MIT)から島根(32)・奈良(29)の
// 市区町村geojsonを取得し、{properties:{city}}のMultiPolygonに整形・簡略化して public/ に保存。
// 実行: webapp/ で `NODE_OPTIONS=--use-system-ca node scripts/_build_cities_geojson.mjs`
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pub = path.join(__dirname, '..', 'public')
const BASE = 'https://raw.githubusercontent.com/niiyz/JapanCityGeoJson/master/geojson'
const API = 'https://api.github.com/repos/niiyz/JapanCityGeoJson/contents/geojson'

// 4桁(約10m)に丸め＋半径距離間引き(eps度未満は捨てる)で大幅軽量化。
// 小島がepsで消えないよう、間引きで4点未満に潰れたら重複除去のみのリングにフォールバック。
const EPS = 0.004 // 約400m
function simplifyRing(ring) {
  const r4 = ring.map(([lng, lat]) => [Math.round(lng * 1e4) / 1e4, Math.round(lat * 1e4) / 1e4])
  if (r4.length < 4) return null
  const out = [r4[0]]
  for (let i = 1; i < r4.length - 1; i++) {
    const [x, y] = r4[i]
    const [px, py] = out[out.length - 1]
    if (Math.hypot(x - px, y - py) >= EPS) out.push([x, y])
  }
  out.push(r4[r4.length - 1])
  if (out[0][0] !== out[out.length - 1][0] || out[0][1] !== out[out.length - 1][1]) out.push(out[0])
  if (out.length < 4) {
    const ded = []
    let prev = null
    for (const p of r4) { if (!prev || prev[0] !== p[0] || prev[1] !== p[1]) ded.push(p); prev = p }
    return ded.length >= 4 ? ded : null
  }
  return out
}

async function buildPref(code, outName) {
  // GitHub APIはrate limit時に {message:...} を返すため、ok/配列チェックで分かるエラーにする
  const listRes = await fetch(`${API}/${code}`)
  if (!listRes.ok) throw new Error(`GitHub API取得失敗 (HTTP ${listRes.status}): ${API}/${code} — rate limitの可能性あり`)
  const list = await listRes.json()
  if (!Array.isArray(list)) throw new Error(`GitHub API応答が一覧でない: ${JSON.stringify(list).slice(0, 200)}`)
  const files = list.map((x) => x.name).filter((n) => n.endsWith('.json'))
  const features = []
  let verts = 0
  for (const fn of files) {
    const res = await fetch(`${BASE}/${code}/${fn}`)
    if (!res.ok) throw new Error(`geojson取得失敗 (HTTP ${res.status}): ${code}/${fn}`)
    const fc = await res.json()
    const feats = fc.features ?? []
    const city = feats[0]?.properties?.N03_004 || fn.replace('.json', '')
    // 全polygonを簡略化し、外周bbox面積を測る（微小な岩礁は捨て、最大島は必ず残す）
    const cand = []
    for (const ft of feats) {
      const g = ft.geometry
      if (!g) continue
      const list2 = g.type === 'MultiPolygon' ? g.coordinates : g.type === 'Polygon' ? [g.coordinates] : []
      for (const poly of list2) {
        // コロプレスは塗りつぶし＝穴(内側リング)は不要。外周リングのみ採用して大幅軽量化
        const outer = simplifyRing(poly[0])
        if (!outer || outer.length < 4) continue
        let mnx = Infinity, mny = Infinity, mxx = -Infinity, mxy = -Infinity
        for (const [x, y] of outer) { if (x < mnx) mnx = x; if (x > mxx) mxx = x; if (y < mny) mny = y; if (y > mxy) mxy = y }
        cand.push({ rings: [outer], area: (mxx - mnx) * (mxy - mny) })
      }
    }
    const AMIN = 1e-3 // 約3km角未満の小島は除外（各市の最大島は別途保持）
    const maxArea = cand.reduce((a, c) => Math.max(a, c.area), 0)
    const polys = cand.filter((c) => c.area >= AMIN || c.area === maxArea).map((c) => c.rings)
    polys.forEach((rings) => { verts += rings.reduce((a, r) => a + r.length, 0) })
    features.push({ type: 'Feature', properties: { city }, geometry: { type: 'MultiPolygon', coordinates: polys } })
  }
  const out = { type: 'FeatureCollection', features }
  const p = path.join(pub, outName)
  fs.writeFileSync(p, JSON.stringify(out))
  const kb = (fs.statSync(p).size / 1024).toFixed(0)
  console.log(`${outName}: ${features.length}市町村 / 頂点${verts} / ${kb}KB`)
  console.log('  cities:', features.map((f) => f.properties.city).join(' '))
}

await buildPref('32', 'shimane_cities.geojson')
await buildPref('29', 'nara_cities.geojson')
