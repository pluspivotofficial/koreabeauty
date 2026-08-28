import { NextResponse } from 'next/server';
import { parseSearchParams, searchProducts } from '@/lib/search';

/**
 * 横断検索のJSON API。
 * 将来アプリやLINEミニアプリから叩けるように、画面と同じロジックを公開している。
 *
 * 例: /api/search?q=鎮静&sort=price-asc&max=4000
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams.entries());
  const query = parseSearchParams(params);
  const result = await searchProducts(query);

  return NextResponse.json(
    {
      query,
      total: result.total,
      failedProviders: result.failedProviders,
      items: result.hits.map((hit) => ({
        id: hit.product.id,
        name: hit.product.name,
        brand: hit.product.brand,
        category: hit.product.category,
        bestShop: hit.bestShop.name,
        bestUrl: hit.bestOffer.url,
        totalJpy: hit.bestLandedCost.totalJpy,
        dutyFree: hit.bestLandedCost.dutyFree,
        spreadJpy: hit.spreadJpy,
      })),
    },
    { headers: { 'Cache-Control': 's-maxage=900, stale-while-revalidate=3600' } },
  );
}
