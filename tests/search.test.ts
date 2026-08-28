import { describe, expect, it } from 'vitest';
import { FALLBACK_RATES } from '@/lib/currency';
import { buildSearchHref, parseSearchParams, priceOffers, searchProducts } from '@/lib/search';
import { allSeedProducts } from '@/lib/providers/seed';

describe('parseSearchParams', () => {
  it('クエリ文字列を検索条件に変換する', () => {
    const q = parseSearchParams({ q: '鎮静', category: 'skincare', max: '4000', sort: 'price-asc' });
    expect(q).toMatchObject({ q: '鎮静', category: 'skincare', maxJpy: 4000, sort: 'price-asc' });
  });

  it('不正な並び順は無視してデフォルトに任せる', () => {
    expect(parseSearchParams({ sort: 'nonsense' }).sort).toBeUndefined();
  });

  it('数値でない価格は無視する', () => {
    expect(parseSearchParams({ min: 'abc' }).minJpy).toBeUndefined();
  });
});

describe('buildSearchHref', () => {
  it('空の条件では素の検索ページを指す', () => {
    expect(buildSearchHref({})).toBe('/search');
  });

  it('既存の条件を保ったまま一部だけ差し替える', () => {
    const href = buildSearchHref({ q: '毛穴', category: 'skincare' }, { sort: 'price-asc' });
    expect(href).toContain('q=');
    expect(href).toContain('category=skincare');
    expect(href).toContain('sort=price-asc');
  });
});

describe('priceOffers', () => {
  it('総額の安い順に並べ替える', () => {
    const product = allSeedProducts()[0];
    const priced = priceOffers(product, FALLBACK_RATES);
    expect(priced.length).toBe(product.offers.length);
    const totals = priced.map((p) => p.landedCost.totalJpy);
    expect([...totals].sort((a, b) => a - b)).toEqual(totals);
  });
});

describe('searchProducts', () => {
  it('カテゴリで絞り込める', async () => {
    const result = await searchProducts({ category: 'makeup' });
    expect(result.total).toBeGreaterThan(0);
    expect(result.hits.every((h) => h.product.category === 'makeup')).toBe(true);
  });

  it('総額の上限は表示価格ではなく総額に効く', async () => {
    const max = 3000;
    const result = await searchProducts({ maxJpy: max });
    expect(result.hits.every((h) => h.bestLandedCost.totalJpy <= max)).toBe(true);
  });

  it('総額が安い順で並べ替えられる', async () => {
    const result = await searchProducts({ sort: 'price-asc' });
    const totals = result.hits.map((h) => h.bestLandedCost.totalJpy);
    expect([...totals].sort((a, b) => a - b)).toEqual(totals);
  });

  it('該当しない語では0件になり、例外にはならない', async () => {
    const result = await searchProducts({ q: 'このような商品は存在しません' });
    expect(result.total).toBe(0);
  });

  it('ブランドのファセットを件数付きで返す', async () => {
    const result = await searchProducts({});
    expect(result.brands.length).toBeGreaterThan(5);
    expect(result.brands[0].count).toBeGreaterThanOrEqual(result.brands[1].count);
  });
});
