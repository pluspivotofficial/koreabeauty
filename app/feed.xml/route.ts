import { formatJpy } from '@/lib/currency';
import { fullTitle } from '@/lib/format';
import { searchProducts } from '@/lib/search';

export const revalidate = 3600;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

/** RSSに載せるテキストは必ずエスケープする（商品名に & や < が入りうるため）。 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * 値下げのRSSフィード。
 * フィードリーダーやSlackのRSS連携に登録すれば、それ自体が値下げ通知になる。
 */
export async function GET() {
  const { hits } = await searchProducts({ onlyDrops: true, sort: 'drop' });

  const items = hits
    .map((hit) => {
      const { product, insight, bestShop, bestLandedCost } = hit;
      const title = `${Math.abs(insight.changePct).toFixed(0)}%値下げ｜${fullTitle(product.name, product.brand)}`;
      const description = [
        `${formatJpy(insight.previousJpy ?? 0)} → ${formatJpy(bestLandedCost.totalJpy)}（送料・税込みの総額）`,
        `最安ショップ: ${bestShop.name}`,
        insight.isAllTimeLow ? `記録している${insight.windowDays}日間で最安です。` : '',
      ]
        .filter(Boolean)
        .join('\n');
      const link = `${siteUrl}/item/${product.id}`;
      return `    <item>
      <title>${escapeXml(title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="false">${escapeXml(`${product.id}-${insight.series.at(-1)?.date}`)}</guid>
      <description>${escapeXml(description)}</description>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>KoreaBeauty 値下げ情報</title>
    <link>${escapeXml(`${siteUrl}/sale`)}</link>
    <description>韓国・アメリカのコスメで、送料・税込みの総額が下がったアイテムをお知らせします。</description>
    <language>ja</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
