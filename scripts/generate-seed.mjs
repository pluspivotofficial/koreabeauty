// data/products.json を生成するスクリプト。
//   node scripts/generate-seed.mjs
//
// 生成物はリポジトリにコミットされているため、通常の開発では実行不要。
// 商品を追加するときは scripts/seed-source.mjs を編集して再生成する。
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PRODUCTS } from './seed-source.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// 現地定価（韓国はKRW／米国はUSD）からショップごとの販売価格を導く係数。
// 実勢に近い並びを再現するための目安値。
const PRICING = {
  'oliveyoung-global': { currency: 'KRW', factor: 0.85 },
  'coupang-global': { currency: 'KRW', factor: 0.92 },
  'naver-smartstore': { currency: 'KRW', factor: 0.88 },
  yesstyle: { currency: 'USD', factor: 1.14 },
  stylevana: { currency: 'USD', factor: 1.02 },
  iherb: { currency: 'USD', factor: 0.9 },
  'sephora-us': { currency: 'USD', factor: 1.0 },
  qoo10: { currency: 'JPY', factor: 1.34 },
  rakuten: { currency: 'JPY', factor: 1.78 },
  'amazon-jp': { currency: 'JPY', factor: 1.62 },
};

// 定価の換算に使う基準レート（生成時点の目安）。表示時のレートとは独立。
const BASE = { KRW_JPY: 0.115, USD_JPY: 155, KRW_USD: 0.00074 };

function convert(base, target) {
  if (base.currency === target) return base.amount;
  if (base.currency === 'KRW' && target === 'USD') return base.amount * BASE.KRW_USD;
  if (base.currency === 'KRW' && target === 'JPY') return base.amount * BASE.KRW_JPY;
  if (base.currency === 'USD' && target === 'JPY') return base.amount * BASE.USD_JPY;
  if (base.currency === 'USD' && target === 'KRW') return base.amount / BASE.KRW_USD;
  throw new Error(`unsupported conversion ${base.currency}->${target}`);
}

function round(amount, currency) {
  if (currency === 'KRW') return Math.round(amount / 100) * 100;
  if (currency === 'JPY') return Math.round(amount / 10) * 10;
  return Math.round(amount * 100) / 100;
}

/** 商品IDとショップIDから、決定的（毎回同じ）な微小な揺らぎを作る。 */
function jitter(seed, spread) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const unit = ((h >>> 0) % 1000) / 1000; // 0..1
  return 1 + (unit - 0.5) * 2 * spread;
}

const products = PRODUCTS.map((p) => {
  const offers = p.shops.map((shopId) => {
    const rule = PRICING[shopId];
    if (!rule) throw new Error(`${p.id}: 未定義のショップ ${shopId}`);
    const converted = convert(p.base, rule.currency);
    const amount = round(converted * rule.factor * jitter(`${p.id}:${shopId}`, 0.06), rule.currency);
    const listAmount = round(amount * 1.18, rule.currency);
    const onSale = jitter(`${p.id}:${shopId}:sale`, 0.5) > 1.05;
    return {
      shopId,
      url: `https://example.com/${shopId}/${p.id}`,
      price: { amount, currency: rule.currency },
      ...(onSale ? { listPrice: { amount: listAmount, currency: rule.currency } } : {}),
      inStock: jitter(`${p.id}:${shopId}:stock`, 0.5) > 0.62,
      providerId: 'seed',
    };
  });

  return {
    id: p.id,
    name: p.name,
    nameOriginal: p.nameOriginal,
    brand: p.brand,
    brandCountry: p.brandCountry,
    category: p.category,
    tags: p.tags,
    description: p.description,
    highlights: p.highlights,
    popularity: p.popularity,
    trendScore: p.trendScore,
    addedAt: p.addedAt,
    offers,
  };
});

const dupes = products.map((p) => p.id).filter((id, i, a) => a.indexOf(id) !== i);
if (dupes.length) throw new Error(`商品IDが重複しています: ${dupes.join(', ')}`);

mkdirSync(join(ROOT, 'data'), { recursive: true });
writeFileSync(join(ROOT, 'data/products.json'), `${JSON.stringify(products, null, 2)}\n`, 'utf8');
console.log(`data/products.json に ${products.length} 件を書き出しました`);
