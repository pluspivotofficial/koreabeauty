import type { Metadata } from 'next';
import Link from 'next/link';
import { ActiveFilters, FilterPanel, SortLinks } from '@/components/Filters';
import { ProductCard } from '@/components/ProductCard';
import { categoryName } from '@/lib/categories';
import { parseSearchParams, searchProducts } from '@/lib/search';

export const revalidate = 3600;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const query = parseSearchParams(await searchParams);
  const parts = [query.q, query.brand, query.category && categoryName(query.category)].filter(Boolean);
  const title = parts.length ? `${parts.join('・')}の検索結果` : '商品を検索';
  return {
    title,
    description: `${parts.join('・') || '韓国・アメリカのコスメ'}を複数ショップ横断で検索。送料と関税・消費税を含めた総額で比較できます。`,
    // 絞り込みの組み合わせは無数に増えるため、検索結果はインデックスさせない
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const query = parseSearchParams(await searchParams);
  const result = await searchProducts(query);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold">
        {query.q ? `「${query.q}」の検索結果` : '商品を検索'}
        <span className="tabular ml-3 text-sm font-normal text-muted">{result.total} 件</span>
      </h1>

      {result.failedProviders.length > 0 && (
        <p className="mt-3 rounded-xl border border-sun-deep/20 bg-sun px-4 py-2 text-xs text-sun-deep">
          {result.failedProviders.join('・')} からの取得に失敗したため、それ以外のショップの結果を表示しています。
        </p>
      )}

      <div className="mt-4 space-y-3">
        <ActiveFilters query={query} />
        <SortLinks query={query} />
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[220px_1fr]">
        <FilterPanel query={query} result={result} />

        <div>
          {result.hits.length === 0 ? (
            <div className="rounded-2xl border border-line bg-white p-10 text-center">
              <p className="font-semibold">条件に合う商品が見つかりませんでした。</p>
              <p className="mt-2 text-sm text-muted">
                絞り込みを外すか、ブランド名や「鎮静」「毛穴」などの言葉で探してみてください。
              </p>
              <Link href="/search" className="mt-4 inline-block rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white">
                絞り込みをすべて解除
              </Link>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-4 lg:grid-cols-3">
              {result.hits.map((hit) => (
                <li key={hit.product.id}>
                  <ProductCard hit={hit} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
