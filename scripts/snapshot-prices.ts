/**
 * 毎日の価格スナップショットを取り、値下げを検知して通知する。
 *   npm run snapshot
 *
 * GitHub Actions（.github/workflows/price-snapshot.yml）から1日1回実行され、
 * 更新された data/price-history.json をリポジトリにコミットする想定。
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getRates } from '../lib/currency';
import { notifyAll, type PriceDropNotice } from '../lib/notify';
import { DROP_THRESHOLD_PCT } from '../lib/priceDrop';
import { allSeedProducts } from '../lib/providers/seed';
import { priceOffers } from '../lib/search';
import type { HistoryPoint, ProductHistory } from '../lib/priceHistory';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const HISTORY_PATH = join(ROOT, 'data/price-history.json');

/** 保持する日数。これより古い点は捨てて、ファイルが際限なく育たないようにする。 */
const RETAIN_DAYS = 365;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const todayStr = new Date().toISOString().slice(0, 10);
const cutoff = new Date(Date.now() - RETAIN_DAYS * 86_400_000).toISOString().slice(0, 10);

async function main() {
  const existing: ProductHistory[] = JSON.parse(readFileSync(HISTORY_PATH, 'utf8'));
  const byId = new Map(existing.map((h) => [h.productId, h]));

  const { rates, source } = await getRates();
  console.log(`為替レート: ${source}（1 KRW = ${rates.KRW} 円 / 1 USD = ${rates.USD} 円）`);

  const drops: PriceDropNotice[] = [];
  const updated: ProductHistory[] = [];

  for (const product of allSeedProducts()) {
    const priced = priceOffers(product, rates);
    if (priced.length === 0) continue;
    const best = priced[0];

    const previousPoints = (byId.get(product.id)?.points ?? []).filter((p) => p.date >= cutoff && p.date < todayStr);
    const previous = previousPoints.at(-1);

    const point: HistoryPoint = { date: todayStr, totalJpy: best.landedCost.totalJpy, shopId: best.shop.id };
    updated.push({ productId: product.id, points: [...previousPoints, point] });

    if (!previous) continue;
    const changePct = ((point.totalJpy - previous.totalJpy) / previous.totalJpy) * 100;
    if (changePct > -DROP_THRESHOLD_PCT) continue;

    const lowest = Math.min(...previousPoints.map((p) => p.totalJpy));
    drops.push({
      productId: product.id,
      productName: product.name,
      brand: product.brand,
      shopName: best.shop.name,
      url: `${siteUrl}/item/${product.id}`,
      previousJpy: previous.totalJpy,
      currentJpy: point.totalJpy,
      changePct,
      isAllTimeLow: point.totalJpy <= lowest,
    });
  }

  writeFileSync(HISTORY_PATH, `${JSON.stringify(updated, null, 2)}\n`, 'utf8');
  console.log(`${updated.length} 商品のスナップショットを ${todayStr} で記録しました`);

  if (drops.length === 0) {
    console.log('値下げは検知されませんでした');
  } else {
    console.log(`値下げ ${drops.length} 件を検知しました`);
    for (const d of drops) console.log(`  ${d.brand} ${d.productName}: ${d.changePct.toFixed(1)}%`);
    const failed = await notifyAll(drops);
    if (failed.length > 0) {
      console.error(`通知に失敗した送信先: ${failed.join(', ')}`);
      process.exitCode = 1;
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
