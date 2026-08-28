import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DutyBadge, TrendBadge } from '@/components/Badges';
import { PriceBreakdown } from '@/components/PriceBreakdown';
import { PriceTable } from '@/components/PriceTable';
import { ProductCard } from '@/components/ProductCard';
import { ProductThumb } from '@/components/ProductThumb';
import { categoryName, getCategory } from '@/lib/categories';
import { formatJpy, getRates } from '@/lib/currency';
import { IMPORT_LIMITS } from '@/lib/landedCost';
import { getSeedProduct, priceOffers, searchProducts, seedProductIds } from '@/lib/search';
import { COUNTRY_LABEL } from '@/lib/shops';

export const revalidate = 3600;

export function generateStaticParams() {
  return seedProductIds().map((id) => ({ id }));
}

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const product = getSeedProduct((await params).id);
  if (!product) return {};
  return {
    title: `${product.name}｜最安値と送料・関税込みの総額を比較`,
    description: `${product.name}を取り扱うショップの価格を、国際送料・関税・消費税を含めた総額で比較。${product.description}`,
    openGraph: { title: product.name, description: product.description },
  };
}

export default async function ItemPage({ params }: { params: Params }) {
  const { id } = await params;
  const product = getSeedProduct(id);
  if (!product) notFound();

  const { rates, source } = await getRates();
  const priced = priceOffers(product, rates);
  const best = priced[0];
  const worst = priced[priced.length - 1];
  const spread = worst.landedCost.totalJpy - best.landedCost.totalJpy;
  const category = getCategory(product.category);
  const limit = IMPORT_LIMITS[product.category];

  const related = (await searchProducts({ category: product.category, sort: 'popular' })).hits
    .filter((h) => h.product.id !== product.id)
    .slice(0, 4);

  // 検索結果に価格レンジを出すための構造化データ
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    brand: { '@type': 'Brand', name: product.brand },
    description: product.description,
    category: categoryName(product.category),
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'JPY',
      lowPrice: best.landedCost.totalJpy,
      highPrice: worst.landedCost.totalJpy,
      offerCount: priced.length,
    },
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav aria-label="パンくず" className="text-xs text-muted">
        <Link href="/" className="hover:underline">
          ホーム
        </Link>
        <span className="mx-1">/</span>
        <Link href={`/category/${product.category}`} className="hover:underline">
          {categoryName(product.category)}
        </Link>
      </nav>

      <div className="mt-4 grid gap-8 sm:grid-cols-[280px_1fr]">
        <div className="aspect-square overflow-hidden rounded-2xl border border-line">
          <ProductThumb brand={product.brand} name={product.name} imageUrl={product.imageUrl} />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/search?brand=${encodeURIComponent(product.brand)}`}
              className="text-sm font-semibold text-rose-deep hover:underline"
            >
              {product.brand}
            </Link>
            <span className="text-xs text-muted">{COUNTRY_LABEL[product.brandCountry]}発</span>
            <TrendBadge score={product.trendScore} />
          </div>

          <h1 className="mt-2 text-xl leading-snug font-bold sm:text-2xl">{product.name}</h1>
          {product.nameOriginal && <p className="mt-1 text-xs text-muted">{product.nameOriginal}</p>}

          <p className="mt-4 text-sm leading-relaxed text-muted">{product.description}</p>

          {product.highlights.length > 0 && (
            <ul className="mt-4 space-y-1 text-sm">
              {product.highlights.map((h) => (
                <li key={h} className="flex gap-2">
                  <span aria-hidden className="text-rose">
                    ●
                  </span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 rounded-2xl bg-rose-soft p-5">
            <p className="text-xs font-semibold text-rose-deep">最安の総額（送料・税込み）</p>
            <p className="tabular mt-1 text-3xl font-bold text-rose-deep">{formatJpy(best.landedCost.totalJpy)}</p>
            <p className="mt-1 text-sm text-muted">
              {best.shop.name}／お届け目安 約 {best.shop.etaDays[0]}〜{best.shop.etaDays[1]} 日
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <DutyBadge landedCost={best.landedCost} />
              {spread >= 500 && (
                <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-muted">
                  最も高いショップとの差 {formatJpy(spread)}
                </span>
              )}
            </div>
            <a
              href={best.offer.url}
              target="_blank"
              rel="noopener noreferrer nofollow sponsored"
              className="mt-4 inline-block rounded-full bg-rose px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-deep"
            >
              {best.shop.name} で見る
            </a>
          </div>

          {product.tags.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <li key={tag}>
                  <Link
                    href={`/search?q=${encodeURIComponent(tag)}`}
                    className="inline-block rounded-full border border-line bg-white px-3 py-1 text-xs text-muted hover:border-rose hover:text-rose-deep"
                  >
                    #{tag}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <section className="mt-12">
        <h2 className="text-lg font-bold">ショップ別の価格比較</h2>
        <p className="mt-1 text-sm text-muted">
          表示価格ではなく、国際送料・関税・消費税・通関手数料まで含めた総額の安い順に並べています。
        </p>
        <div className="mt-4">
          <PriceTable offers={priced} />
        </div>
      </section>

      <section className="mt-10 grid gap-6 sm:grid-cols-2">
        <PriceBreakdown landedCost={best.landedCost} shop={best.shop} />
        <div className="rounded-2xl border border-line bg-white p-5 text-sm">
          <h2 className="font-semibold">買う前に確認したいこと</h2>
          <ul className="mt-3 space-y-2 leading-relaxed text-muted">
            {limit && <li>・{limit}</li>}
            <li>・海外ショップの返品・交換の条件は、国内通販より厳しいことがあります。</li>
            <li>
              ・円換算には {source} を使用しています。決済時のカード会社のレートとは差が出ます。
            </li>
            {category && category.dutyRate === 0 && <li>・{categoryName(product.category)}の関税は無税です（消費税は課税価格が1万円を超えるとかかります）。</li>}
          </ul>
          <Link href="/guide/import" className="mt-4 inline-block text-sm font-semibold text-rose-deep hover:underline">
            個人輸入の税金ガイドを読む →
          </Link>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="text-lg font-bold">同じカテゴリの人気アイテム</h2>
          <ul className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {related.map((hit) => (
              <li key={hit.product.id}>
                <ProductCard hit={hit} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
