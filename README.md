# KoreaBeauty

韓国・アメリカで話題のコスメを複数ショップ横断で検索し、**国際送料・関税・消費税まで含めた「日本に届くまでの総額」**で比較できるサイトです。

「表示価格は海外のほうが安かったのに、送料と税金を足したら日本で買うより高かった」という失敗を無くすことを目的にしています。

## できること

- **横断検索** — OLIVE YOUNG Global / Coupang / NAVER / YesStyle / STYLEVANA / iHerb / Sephora US / Qoo10 / 楽天市場 / Amazon.co.jp の価格をひとつの検索窓から
- **総額での並べ替え** — ショップの表示価格ではなく、送料・関税・消費税・通関手数料を足した金額で安い順に
- **免税ラインの可視化** — 課税価格（商品価格の60%）が1万円以下なら免税。どのショップなら税金がかからないかをバッジで表示
- **価格推移と値下げ検知** — 1日1回、各商品の最安総額を記録。商品ページに推移グラフ、
  下がったものは[値下げ中のアイテム]とRSSに集約
- **カテゴリ／ブランド／価格帯での絞り込み**、人気順・伸びている順・値下げ幅順などのソート
- **個人輸入の注意点** — カテゴリごとの数量制限や電圧の注意を商品ページに表示
- **JSON API** — `/api/search?q=鎮静&sort=price-asc&max=4000`

## セットアップ

```bash
npm install
cp .env.example .env.local   # 必要に応じて編集（無くても動きます）
npm run dev                  # http://localhost:3000
```

環境変数を何も設定しなくても、リポジトリに同梱した商品カタログ（`data/products.json`）だけで
サイトはひととおり動きます。

## npm スクリプト

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバー |
| `npm run build` / `npm start` | 本番ビルドと起動 |
| `npm run typecheck` | 型チェック |
| `npm run lint` | ESLint |
| `npm test` | Vitest（税額計算・検索・値下げ判定のテスト） |
| `npm run snapshot` | その日の最安総額を記録し、値下げがあれば通知する |
| `npm run seed:catalog` | `data/products.json` を再生成 |
| `npm run seed:history` | `data/price-history.json` のサンプルを再生成 |

## デプロイ（Vercel）

1. このリポジトリを Vercel にインポートする（フレームワークは Next.js が自動検出されます）
2. Environment Variables に `NEXT_PUBLIC_SITE_URL` を本番ドメインで設定する
   （sitemap.xml と OGP の絶対URLに使われます）
3. 外部データソースを使う場合は `.env.example` の変数を追加する

## 構成

```
app/                 画面（App Router）
  page.tsx           トップ
  search/            横断検索の結果
  category/[slug]/   カテゴリ一覧
  item/[id]/         商品詳細・価格比較・価格推移グラフ
  ranking/           ランキング
  sale/              値下げ中のアイテム
  guide/import/      個人輸入の税金ガイド
  api/search/        検索のJSON API
  feed.xml/          値下げのRSSフィード
components/          UIコンポーネント
lib/
  types.ts           ドメインモデル
  landedCost.ts      関税・消費税・送料を含む総額の計算
  currency.ts        為替レートの取得と円換算
  search.ts          絞り込み・並べ替え・ファセット
  shops.ts           ショップ定義（送料・配送日数・課税の扱い）
  categories.ts      カテゴリ定義
  providers/         データソースのアダプタ
  priceHistory/      価格履歴の保管先アダプタ
  priceDrop.ts       値下げ・過去最安の判定
  notify/            値下げ通知先のアダプタ
data/products.json      同梱の商品カタログ（生成物）
data/price-history.json 価格履歴（毎日追記される）
scripts/             カタログ・履歴の生成とスナップショット
tests/               Vitest
```

## 商品を追加・編集する

`scripts/seed-source.mjs` を編集して再生成します。

```bash
node scripts/generate-seed.mjs
```

`base` に現地の定価（韓国ブランドは KRW、米国ブランドは USD）、`shops` に取り扱いショップIDを
書けば、ショップごとの販売価格は生成側で導出されます。

> **注意**：同梱カタログの商品URLは `https://example.com/...` のプレースホルダです。
> 公開前に各ショップの実際の商品URL（またはアフィリエイトリンク）に差し替えてください。

## データソースを増やす

`lib/providers/types.ts` の `Provider` インターフェースを実装したファイルを `lib/providers/` に追加し、
`lib/providers/index.ts` の `PROVIDERS` に登録します。

```ts
export const myProvider: Provider = {
  id: 'my-shop',
  name: 'My Shop',
  isEnabled: () => Boolean(process.env.MY_SHOP_API_KEY),
  async search(query) { /* Product[] を返す */ },
};
```

- 必要な環境変数が無いプロバイダは `isEnabled()` が `false` を返し、自動的に検索から外れます
- 1つのプロバイダが失敗しても、残りの結果でページを返します（失敗したプロバイダ名は画面に表示されます）
- 同じ商品と判定できたものはオファーがまとめられ、1つの商品の価格比較表に並びます

同梱の `lib/providers/rakuten.ts` が実装例です。`RAKUTEN_APP_ID` を設定すると
楽天市場商品検索APIが検索に加わります（アプリIDは https://webservice.rakuten.co.jp/ で無料取得）。

### スクレイピングについて

韓国・米国のECサイトの多くは公開APIを提供していません。スクレイピングでの取得は各サイトの利用規約に
反する可能性があり、構造変更で頻繁に壊れます。**公式のアフィリエイトAPI・提携フィードを優先**し、
やむを得ない場合も対象サイトの規約と `robots.txt` を確認したうえで実装してください。
商品画像も同様に、権利の確認が取れないものは同梱のプレースホルダ表示のままにしてあります。

## 価格履歴と値下げ通知

### しくみ

1. `npm run snapshot` が全商品の「その時点で最も安いショップの総額」を1日1点だけ記録する
2. 前回の記録から **5%以上**（`DROP_THRESHOLD_PCT`）下がっていれば値下げとして検知する
3. 検知した値下げは `/sale` と `/feed.xml` に載り、設定されている通知先に送られる

記録は `data/price-history.json` に入ります。GitHub Actions
（`.github/workflows/price-snapshot.yml`）が毎日 UTC 21:00（日本時間 翌6:00）に実行し、
差分があればリポジトリにコミットします。

> **注意**：同梱の `data/price-history.json` は、初日からグラフと値下げ判定が動くように
> 生成したサンプルです（`npm run seed:history`）。実測に切り替えるときは、このファイルを
> `[]` にしてから毎日のスナップショットを積み上げてください。

### 通知先を設定する

`PRICE_ALERT_WEBHOOK_URL` に Slack か Discord の Incoming Webhook URL を入れるだけで、
値下げがあった日にまとめて投稿されます。GitHub Actions から使う場合はリポジトリの
Secrets に同名で登録してください。未設定なら記録だけが行われ、通知は送られません。

RSS（`/feed.xml`）は設定不要で、フィードリーダーや Slack の RSS 連携に登録すれば
それ自体が通知チャンネルになります。

### 通知先を増やす

`lib/notify/types.ts` の `Notifier` を実装して `lib/notify/index.ts` の `NOTIFIERS` に
登録します。データソースのプロバイダと同じく、環境変数が無いものは自動的に外れ、
1つが失敗しても他の通知先には送られます。

```ts
export const mailNotifier: Notifier = {
  id: 'mail',
  name: 'メール',
  isEnabled: () => Boolean(process.env.RESEND_API_KEY),
  async send(notices) { /* 送信する */ },
};
```

### 履歴の保管先を変える

同梱のJSONは商品数が数百件までを想定しています。それ以上に増やす、あるいは
ユーザーごとの「お気に入りが値下げしたらメール」を作る場合は、
`lib/priceHistory/types.ts` の `HistoryStore` を実装したDB版を用意し、
`getHistoryStore()` の分岐を1行足してください。画面側の変更は不要です。
（ユーザーごとの通知には、あわせてアカウントと購読テーブルが必要になります。
Vercel のファイルシステムは書き込めないため、その段階でDBは必須です。）

## 総額の計算方法

`lib/landedCost.ts` に集約しています。個人輸入を前提とした概算です。

- 課税価格 = 海外小売価格 × 60%
- 課税価格の合計が 10,000円以下 → 関税・消費税とも免除
- 化粧品類の関税は無税。消費税は 10%（100円未満切り捨て）
- 通関手数料 200円（国際郵便の場合）
- 国内発送・関税元払いのショップは追加課税なし

税率や制度は変わります。実際の課税は税関の判断によるため、画面には常に「概算」であることを明示しています。

## ライセンスと免責

表示している総額は概算であり、税務・法務のアドバイスではありません。当サイトは販売を行わず、
購入はリンク先の各ショップで行われます。
