import Link from 'next/link';
import { categoryName } from '@/lib/categories';
import { formatJpy, formatLocal } from '@/lib/currency';
import { stripBrand } from '@/lib/format';
import { COUNTRY_LABEL } from '@/lib/shops';
import type { SearchHit } from '@/lib/types';
import { AllTimeLowBadge, DutyBadge, PriceMoveBadge, SpreadBadge, TrendBadge } from './Badges';
import { ProductThumb } from './ProductThumb';

export function ProductCard({ hit }: { hit: SearchHit }) {
  const { product, bestShop, bestOffer, bestLandedCost, spreadJpy, insight } = hit;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition hover:shadow-[0_8px_24px_rgba(31,26,28,0.07)]">
      <Link href={`/item/${product.id}`} className="block aspect-4/3 overflow-hidden">
        <ProductThumb brand={product.brand} name={product.name} imageUrl={product.imageUrl} />
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-muted">
            {COUNTRY_LABEL[product.brandCountry]}・{categoryName(product.category)}
          </span>
          <TrendBadge score={product.trendScore} />
        </div>

        <h3 className="text-sm leading-snug font-semibold">
          <Link href={`/item/${product.id}`} className="hover:text-rose-deep hover:underline">
            {/* 商品名の先頭にブランド名が入っていることが多いので、重複表示にならないよう取り除く */}
            <span className="mr-1 text-rose-deep">{product.brand}</span>
            {stripBrand(product.name, product.brand)}
          </Link>
        </h3>

        <div className="mt-auto pt-2">
          <p className="text-[11px] text-muted">送料・税込みの最安総額</p>
          <p className="tabular text-xl font-bold text-rose-deep">
            {formatJpy(bestLandedCost.totalJpy)}
            {insight.previousJpy !== undefined && insight.changeJpy < 0 && (
              <span className="tabular ml-2 text-xs font-normal text-muted line-through">
                {formatJpy(insight.previousJpy)}
              </span>
            )}
          </p>
          <p className="mt-0.5 text-[11px] text-muted">
            {bestShop.name}（{formatLocal(bestOffer.price)}）+ 送料
            {bestLandedCost.shippingJpy === 0 ? '無料' : formatJpy(bestLandedCost.shippingJpy)}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <PriceMoveBadge insight={insight} />
            <AllTimeLowBadge insight={insight} />
            <DutyBadge landedCost={bestLandedCost} />
            <SpreadBadge spreadJpy={spreadJpy} />
            {!bestOffer.inStock && (
              <span className="rounded-full border border-line px-2 py-0.5 text-[11px] text-muted">在庫わずか</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
