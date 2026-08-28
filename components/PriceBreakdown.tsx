import { formatJpy } from '@/lib/currency';
import type { LandedCost, Shop } from '@/lib/types';

/** 最安ショップの総額の内訳。「なぜこの金額なのか」を1つずつ見せる。 */
export function PriceBreakdown({ landedCost, shop }: { landedCost: LandedCost; shop: Shop }) {
  const rows: [string, number, string?][] = [
    ['商品価格', landedCost.itemJpy],
    ['国際送料', landedCost.shippingJpy],
  ];
  if (!landedCost.dutyFree) {
    rows.push(['関税', landedCost.dutyJpy, '化粧品は無税']);
    rows.push(['消費税（10%）', landedCost.consumptionTaxJpy, '課税価格＝商品価格の60%に対して']);
    rows.push(['通関手数料', landedCost.clearanceFeeJpy, '国際郵便の場合']);
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <h2 className="text-sm font-semibold">
        {shop.name} で買った場合の総額の内訳
      </h2>
      <dl className="mt-4 space-y-2 text-sm">
        {rows.map(([label, value, note]) => (
          <div key={label} className="flex items-baseline justify-between gap-4">
            <dt className="text-muted">
              {label}
              {note && <span className="ml-1 text-[11px] text-muted/80">（{note}）</span>}
            </dt>
            <dd className="tabular shrink-0 font-medium">{value === 0 ? '¥0' : formatJpy(value)}</dd>
          </div>
        ))}
        <div className="flex items-baseline justify-between gap-4 border-t border-line pt-3">
          <dt className="font-semibold">合計（概算）</dt>
          <dd className="tabular shrink-0 text-lg font-bold text-rose-deep">{formatJpy(landedCost.totalJpy)}</dd>
        </div>
      </dl>
      {landedCost.notes.length > 0 && (
        <ul className="mt-4 space-y-1 border-t border-line pt-3 text-xs leading-relaxed text-muted">
          {landedCost.notes.map((note) => (
            <li key={note}>・{note}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
