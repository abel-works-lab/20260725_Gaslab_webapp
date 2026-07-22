# e-Stat医療データ分析＋PPTX自動生成アプリ

政府統計ポータル「[e-Stat](https://www.e-stat.go.jp/)」の医療・人口・介護関連データをもとに、都道府県別の医療費・要因分析を可視化し、AIによるインサイト生成からPPTX（スライド）の自動生成までを行うWebアプリ。

## できること

- 地図上で都道府県・市町村ごとの医療費データを可視化
- 都道府県を選ぶと、関連指標（高齢化率・入院受療率・特定健診実施率など）のプロファイルを表示
- AI（Claude）がデータを読み、示唆・考察を生成
- 生成した分析結果をPowerPoint（PPTX）形式のレポートとして自動出力

## 技術スタック

| 技術 | 役割 |
|---|---|
| [Next.js](https://nextjs.org/)（App Router） | フロントエンド・画面表示 |
| [Convex](https://convex.dev/) | バックエンド・データベース |
| [WorkOS AuthKit](https://workos.com/) | ログイン認証 |
| [pptxgenjs](https://gitbrent.github.io/PptxGenJS/) | PPTXファイルの自動生成 |
| [Leaflet](https://leafletjs.com/) / react-leaflet | 地図表示 |
| [fal.ai](https://fal.ai/) 経由 Claude（Anthropic） | データを読んでインサイト・提案文を生成するAI |

## セットアップ

**事前条件: `npm run dev` は `--use-system-ca` フラグを使用する。** 古いNode.jsだと
`bad option` エラーで起動に失敗することがある（`npm run setup` はこのフラグへの対応を
自動チェックし、非対応なら案内する）。エラーが出た場合は https://nodejs.org/ から
最新のNode.js（LTS）に更新すること。

### かんたんセットアップ（推奨）

```bash
cd webapp
npm run setup
```

`npm install`・`.env.local`雛形の生成・Convexプロジェクトの作成・データ投入までを自動で進める。
途中でWorkOS/fal.ai/Convexのキー取得を案内されるので、その都度アカウント作成・キー取得だけ行えばよい
（詳しくは `webapp/ENV_SETUP.md` 参照）。完了したら手順4の `npm run dev` に進む。

<details>
<summary>手動でセットアップする場合</summary>

### 1. 依存パッケージのインストール

```bash
cd webapp
npm install
```

### 2. 環境変数の設定

`webapp/ENV_SETUP.md` の手順に従って `.env.local` を作成する。Convex（データベース）・WorkOS（認証）・
fal.ai（AIインサイト・レポート・PPTX生成）、それぞれ専用のプロジェクト・アプリケーション・APIキーが必要。

### 3. データベースへのデータ投入

```bash
npx convex dev --once
node scripts/seed.mjs
node scripts/seed_medical_cost.mjs
node scripts/seed_muni_stats.mjs
node scripts/seed_region.mjs
```

</details>

### 4. 開発サーバー起動

```bash
npm run dev
```

## データの出所

`webapp/data/` 内のJSONファイルは、e-Stat APIから取得した公的統計データ（国民医療費、人口推計、医療施設調査、患者調査、特定健診等）を加工したもの。実データを使用しており、ダミーデータへの置き換えは行っていない。

## ディレクトリ構成

```
webapp/
├── app/            # 画面・APIルート
├── convex/         # バックエンド関数・スキーマ定義
├── data/           # e-Statデータ（JSON）
├── public/         # 静的ファイル（ロゴ・地図データ）
├── scripts/        # データ投入用スクリプト
└── ENV_SETUP.md    # 環境変数セットアップ手順
```
