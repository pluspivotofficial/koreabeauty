import type { Metadata } from 'next';
import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard';
import { searchProducts } from '@/lib/search';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: '韓国・アメリカコスメ 人気ランキング',
  description:
    '韓国・アメリカで人気のコスメを総合ランキングで紹介。各商品は送料・関税・消費税込みの総額でショップを比較できます。',
};

export default async function RankingPage() {
  const [popular, trending] = await Promise.all([
    searchProducts({ sort: 'popular' }),
    searchProducts({ sort: 'trending' }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold">人気ランキング</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        レビュー数・SNSでの言及量をもとにした総合の人気順です。金額はいずれも「日本に届くまでの総額」で表示しています。
      </p>

      <ol className="mt-8 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
        {popular.hits.slice(0, 20).map((hit, i) => (
          <li key={hit.product.id} className="flex items-center gap-4 p-4">
            <span className={`tabular w-8 shrink-0 text-center text-lg font-bold ${i < 3 ? 'text-rose-deep' : 'text-muted'}`}>
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <Link href={`/item/${hit.product.id}`} className="text-sm font-semibold hover:text-rose-deep hover:underline">
                {hit.product.name}
              </Link>
              <p className="mt-0.5 truncate text-xs text-muted">{hit.product.description}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="tabular text-base font-bold text-rose-deep">
                ¥{hit.bestLandedCost.totalJpy.toLocaleString('ja-JP')}
              </p>
              <p className="text-[11px] text-muted">{hit.bestShop.name}</p>
            </div>
          </li>
        ))}
      </ol>

      <h2 className="mt-14 text-xl font-bold">いま伸びているアイテム</h2>
      <p className="mt-1 text-sm text-muted">日本ではまだ手に入りにくい、現地で先に伸びている商品です。</p>
      <ul className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {trending.hits.slice(0, 8).map((hit) => (
          <li key={hit.product.id}>
            <ProductCard hit={hit} />
          </li>
        ))}
      </ul>
    </div>
  );
}
