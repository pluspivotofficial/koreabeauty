import { formatJpy, formatLocal } from '@/lib/currency';
import { COUNTRY_LABEL } from '@/lib/shops';
import type { PricedOffer } from '@/lib/search';

/**
 * 商品詳細の価格比較表。
 * 「ショップの表示価格」と「日本に届くまでの総額」を並べて、
 * 表示価格が安くても総額では逆転することが分かるようにしている。
 */
export function PriceTable({ offers }: { offers: PricedOffer[] }) {
  const cheapest = offers[0]?.landedCost.totalJpy;

  return (
    <div className="scroll-x rounded-2xl border border-line bg-white">
      <table className="w-full min-w-[640px] text-sm">
        <caption className="sr-only">ショップ別の価格と総額の比較</caption>
        <thead>
          <tr className="border-b border-line text-left text-xs text-muted">
            <th scope="col" className="px-4 py-3 font-medium">ショップ</th>
            <th scope="col" className="px-4 py-3 font-medium">表示価格</th>
            <th scope="col" className="px-4 py-3 font-medium">送料</th>
            <th scope="col" className="px-4 py-3 font-medium">税金・手数料</th>
            <th scope="col" className="px-4 py-3 font-medium">総額</th>
            <th scope="col" className="px-4 py-3 font-medium">お届け目安</th>
            <th scope="col" className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {offers.map(({ offer, shop, landedCost }) => {
            const taxes = landedCost.dutyJpy + landedCost.consumptionTaxJpy + landedCost.clearanceFeeJpy;
            const isCheapest = landedCost.totalJpy === cheapest;
            return (
              <tr key={`${shop.id}-${offer.url}`} className={`border-b border-line/70 last:border-0 ${isCheapest ? 'bg-rose-soft/50' : ''}`}>
                <td className="px-4 py-3">
                  <div className="font-semibold">{shop.name}</div>
                  <div className="text-xs text-muted">{COUNTRY_LABEL[shop.country]}から発送</div>
                </td>
                <td className="tabular px-4 py-3">
                  {formatLocal(offer.price)}
                  <div className="text-xs text-muted">{formatJpy(landedCost.itemJpy)}</div>
                </td>
                <td className="tabular px-4 py-3">
                  {landedCost.shippingJpy === 0 ? <span className="text-mint-deep">無料</span> : formatJpy(landedCost.shippingJpy)}
                </td>
                <td className="tabular px-4 py-3">
                  {taxes === 0 ? <span className="text-mint-deep">かからない</span> : formatJpy(taxes)}
                </td>
                <td className="tabular px-4 py-3 text-base font-bold text-rose-deep">
                  {formatJpy(landedCost.totalJpy)}
                  {isCheapest && <div className="text-[11px] font-semibold text-rose">最安</div>}
                </td>
                <td className="px-4 py-3 text-xs text-muted">
                  約 {shop.etaDays[0]}〜{shop.etaDays[1]} 日
                </td>
                <td className="px-4 py-3">
                  <a
                    href={offer.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow sponsored"
                    className="inline-block rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-deep"
                  >
                    見に行く
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
