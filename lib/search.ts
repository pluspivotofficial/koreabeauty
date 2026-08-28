import { getRates, toJpy } from './currency';
import { computeLandedCost } from './landedCost';
import { aggregate } from './providers';
import { allSeedProducts } from './providers/seed';
import { getShopOrFallback } from './shops';
import type {
  CategorySlug,
  LandedCost,
  Offer,
  Product,
  SearchHit,
  SearchQuery,
  SearchResult,
  Shop,
  SortKey,
} from './types';

export const SORT_LABELS: Record<SortKey, string> = {
  popular: '人気順',
  trending: '伸びている順',
  'price-asc': '総額が安い順',
  'price-desc': '総額が高い順',
  newest: '新着順',
};

export interface PricedOffer {
  offer: Offer;
  shop: Shop;
  landedCost: LandedCost;
}

/** 1商品の全オファーを円の総額に直し、安い順に並べる。 */
export function priceOffers(product: Product, rates: Record<string, number>): PricedOffer[] {
  return product.offers
    .map((offer) => {
      const shop = getShopOrFallback(offer.shopId);
      const itemJpy = toJpy(offer.price, rates as never);
      return { offer, shop, landedCost: computeLandedCost({ itemJpy, shop, category: product.category }) };
    })
    .sort((a, b) => a.landedCost.totalJpy - b.landedCost.totalJpy);
}

function matchesText(product: Product, q: string): boolean {
  const haystack = [product.name, product.nameOriginal ?? '', product.brand, ...product.tags, product.description]
    .join(' ')
    .toLowerCase();
  // スペース区切りの語をすべて含むものにヒットさせる（AND検索）
  return q
    .toLowerCase()
    .split(/[\s　]+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term));
}

function sortHits(hits: SearchHit[], sort: SortKey): SearchHit[] {
  const sorted = [...hits];
  switch (sort) {
    case 'price-asc':
      return sorted.sort((a, b) => a.bestLandedCost.totalJpy - b.bestLandedCost.totalJpy);
    case 'price-desc':
      return sorted.sort((a, b) => b.bestLandedCost.totalJpy - a.bestLandedCost.totalJpy);
    case 'trending':
      return sorted.sort((a, b) => b.product.trendScore - a.product.trendScore);
    case 'newest':
      return sorted.sort((a, b) => b.product.addedAt.localeCompare(a.product.addedAt));
    case 'popular':
    default:
      return sorted.sort((a, b) => b.product.popularity - a.product.popularity);
  }
}

/**
 * 横断検索の本体。プロバイダから商品を集め、総額を計算してから絞り込む。
 *
 * 価格の絞り込みは「ショップの表示価格」ではなく「送料・税込みの総額」に対して
 * 効かせている。これが単なるモール内検索との一番の違い。
 */
export async function searchProducts(query: SearchQuery): Promise<SearchResult & { failedProviders: string[] }> {
  const [{ products, failed }, { rates }] = await Promise.all([aggregate(query), getRates()]);

  const hits: SearchHit[] = [];
  for (const product of products) {
    if (query.q && !matchesText(product, query.q)) continue;
    if (query.category && product.category !== query.category) continue;
    if (query.brand && product.brand !== query.brand) continue;
    if (query.country && product.brandCountry !== query.country) continue;

    let priced = priceOffers(product, rates);
    if (query.shopId) priced = priced.filter((p) => p.shop.id === query.shopId);
    if (priced.length === 0) continue;

    const best = priced[0];
    const worst = priced[priced.length - 1];
    const total = best.landedCost.totalJpy;
    if (query.minJpy !== undefined && total < query.minJpy) continue;
    if (query.maxJpy !== undefined && total > query.maxJpy) continue;

    hits.push({
      product,
      bestOffer: best.offer,
      bestShop: best.shop,
      bestLandedCost: best.landedCost,
      spreadJpy: worst.landedCost.totalJpy - total,
    });
  }

  const brandCounts = new Map<string, number>();
  const categoryCounts = new Map<CategorySlug, number>();
  for (const hit of hits) {
    brandCounts.set(hit.product.brand, (brandCounts.get(hit.product.brand) ?? 0) + 1);
    categoryCounts.set(hit.product.category, (categoryCounts.get(hit.product.category) ?? 0) + 1);
  }

  return {
    hits: sortHits(hits, query.sort ?? 'popular'),
    total: hits.length,
    brands: [...brandCounts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
    categories: [...categoryCounts.entries()]
      .map(([slug, count]) => ({ slug, count }))
      .sort((a, b) => b.count - a.count),
    failedProviders: failed,
  };
}

/** 商品詳細ページ用。IDで1件引く（同梱カタログのみを対象とする）。 */
export function getSeedProduct(id: string): Product | undefined {
  return allSeedProducts().find((p) => p.id === id);
}

export function seedProductIds(): string[] {
  return allSeedProducts().map((p) => p.id);
}

/** URLのクエリ文字列を SearchQuery に変換する。不正な値は無視する。 */
export function parseSearchParams(params: Record<string, string | string[] | undefined>): SearchQuery {
  const one = (key: string): string | undefined => {
    const v = params[key];
    return Array.isArray(v) ? v[0] : v;
  };
  const num = (key: string): number | undefined => {
    const v = one(key);
    if (v === undefined || v === '') return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };
  const sort = one('sort');

  return {
    q: one('q') || undefined,
    category: (one('category') as CategorySlug) || undefined,
    brand: one('brand') || undefined,
    country: (one('country') as SearchQuery['country']) || undefined,
    shopId: one('shop') || undefined,
    minJpy: num('min'),
    maxJpy: num('max'),
    sort: sort && sort in SORT_LABELS ? (sort as SortKey) : undefined,
  };
}

/** SearchQuery を URL のクエリ文字列に戻す（絞り込みリンクの生成用）。 */
export function buildSearchHref(query: SearchQuery, overrides: Partial<SearchQuery> = {}): string {
  const merged = { ...query, ...overrides };
  const params = new URLSearchParams();
  const set = (key: string, value: unknown) => {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
  };
  set('q', merged.q);
  set('category', merged.category);
  set('brand', merged.brand);
  set('country', merged.country);
  set('shop', merged.shopId);
  set('min', merged.minJpy);
  set('max', merged.maxJpy);
  set('sort', merged.sort);
  const qs = params.toString();
  return qs ? `/search?${qs}` : '/search';
}
