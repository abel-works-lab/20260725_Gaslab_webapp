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
| Claude（Anthropic） | データを読んでインサイト・提案文を生成するAI |

## セットアップ

### 1. 依存パッケージのインストール

```bash
cd webapp
npm install
```

### 2. 環境変数の設定

`webapp/ENV_SETUP.md` の手順に従って `.env.local` を作成する。Convex（データベース）とWorkOS（認証）、それぞれ専用のプロジェクト・アプリケーションを作成する必要がある。

### 3. データベースへのデータ投入

```bash
npx convex dev
# 別ターミナルで
node scripts/seed.mjs
node scripts/seed_medical_cost.mjs
node scripts/seed_muni_stats.mjs
node scripts/seed_region.mjs
```

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
