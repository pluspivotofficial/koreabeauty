/**
 * data/price-history.json のサンプルデータを生成する。
 *   npm run seed:history
 *
 * これは「まだ実測がない状態でもグラフと値下げ判定が動く」ための初期データで、
 * 実運用では npm run snapshot が毎日1点ずつ追記していく。
 * 本番公開前に、実測に置き換えるかこのファイルを空にすること。
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FALLBACK_RATES } from '../lib/currency';
import { allSeedProducts } from '../lib/providers/seed';
import { priceOffers } from '../lib/search';
import type { HistoryPoint, ProductHistory } from '../lib/priceHistory';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DAYS = 90;

/** 文字列から決定的な 0〜1 の値を作る。実行のたびに同じ履歴になるようにするため。 */
function unit(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

function dateNDaysAgo(n: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

const products = allSeedProducts();

/**
 * 商品ごとの「値動きの役柄」を決める。
 *
 * ハッシュ値をそのまま閾値で切ると分布が偏って、意図した割合にならない。
 * ハッシュ順に並べてから順位で割り当てることで、決定的なまま比率を保証する。
 */
type Role = 'sale' | 'low' | 'raised' | 'flat';
const ROLE_BY_ID = new Map<string, Role>(
  [...products]
    .sort((a, b) => unit(`${a.id}:role`) - unit(`${b.id}:role`))
    .map((product, index, all) => {
      const ratio = index / all.length;
      const role: Role = ratio < 0.3 ? 'sale' : ratio < 0.5 ? 'low' : ratio < 0.62 ? 'raised' : 'flat';
      return [product.id, role];
    }),
);

const histories: ProductHistory[] = products.map((product) => {
  const priced = priceOffers(product, FALLBACK_RATES);
  const base = priced[0].landedCost.totalJpy;
  const shopId = priced[0].shop.id;

  const role = ROLE_BY_ID.get(product.id);
  const onSale = role === 'sale';
  const atLow = role === 'low';
  const raised = role === 'raised';

  const points: HistoryPoint[] = [];
  for (let daysAgo = DAYS - 1; daysAgo >= 0; daysAgo -= 1) {
    // 今日の点は必ず現在の総額に一致させる（グラフの右端が画面の金額と揃うように）
    if (daysAgo === 0) {
      points.push({ date: dateNDaysAgo(0), totalJpy: base, shopId });
      continue;
    }

    // 小売価格は毎日ふらつくというより、週単位で水準が変わる。
    // 直近1週間は現在の水準のままにして、値下げ中の商品だけが「下がったばかり」に見えるようにする。
    const week = Math.floor(daysAgo / 7);
    let level = 1 + (unit(`${product.id}:w${week}`) - 0.5) * 0.24;
    if (daysAgo <= 6) {
      // 値下げ中の商品は直前まで高く、値上がりした商品は直前まで安かったことにする
      if (onSale) level = 1 + 0.07 + unit(`${product.id}:drop`) * 0.15;
      else if (raised) level = 1 - 0.06 - unit(`${product.id}:rise`) * 0.1;
      else level = 1;
    }
    if (atLow) level = Math.max(level, daysAgo <= 6 ? 1 : 1.03);

    // 直近1週間は水準を動かさない。小売価格は値付けが変わるまで動かないうえ、
    // ここで揺らすと「過去最安」の判定が1円差でぶれてしまう。
    const jitter = daysAgo <= 6 ? 1 : 1 + (unit(`${product.id}:d${daysAgo}`) - 0.5) * 0.02;
    points.push({
      date: dateNDaysAgo(daysAgo),
      totalJpy: Math.round((base * level * jitter) / 10) * 10,
      shopId,
    });
  }

  return { productId: product.id, points };
});

mkdirSync(join(ROOT, 'data'), { recursive: true });
writeFileSync(join(ROOT, 'data/price-history.json'), `${JSON.stringify(histories, null, 2)}\n`, 'utf8');
console.log(`data/price-history.json に ${histories.length} 商品 × ${DAYS} 日を書き出しました`);
