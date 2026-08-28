import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ActiveFilters, SortLinks } from '@/components/Filters';
import { ProductCard } from '@/components/ProductCard';
import { CATEGORIES, getCategory } from '@/lib/categories';
import { IMPORT_LIMITS } from '@/lib/landedCost';
import { parseSearchParams, searchProducts } from '@/lib/search';

export const revalidate = 3600;

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const category = getCategory((await params).slug);
  if (!category) return {};
  return {
    title: `${category.name}｜韓国・アメリカの人気アイテムを総額で比較`,
    description: category.description,
  };
}

export default async function CategoryPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  const query = { ...parseSearchParams(await searchParams), category: category.slug };
  const result = await searchProducts(query);
  const limit = IMPORT_LIMITS[category.slug];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="max-w-2xl">
        <p className="text-3xl">{category.emoji}</p>
        <h1 className="mt-2 text-2xl font-bold">{category.name}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">{category.description}</p>
        {limit && (
          <p className="mt-4 rounded-xl border border-sun-deep/20 bg-sun px-4 py-3 text-xs leading-relaxed text-sun-deep">
            個人輸入の注意：{limit}
          </p>
        )}
      </header>

      <div className="mt-8 space-y-3">
        <ActiveFilters query={query} />
        <SortLinks query={query} />
      </div>

      <p className="tabular mt-4 text-sm text-muted">{result.total} 件</p>

      <ul className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {result.hits.map((hit) => (
          <li key={hit.product.id}>
            <ProductCard hit={hit} />
          </li>
        ))}
      </ul>
    </div>
  );
}
