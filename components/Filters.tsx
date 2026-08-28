import Link from 'next/link';
import { CATEGORIES, categoryName } from '@/lib/categories';
import { buildSearchHref, SORT_LABELS } from '@/lib/search';
import { SHOPS } from '@/lib/shops';
import type { SearchQuery, SearchResult, SortKey } from '@/lib/types';

const PRICE_BANDS: { label: string; min?: number; max?: number }[] = [
  { label: '〜2,000円', max: 2000 },
  { label: '2,000〜4,000円', min: 2000, max: 4000 },
  { label: '4,000〜8,000円', min: 4000, max: 8000 },
  { label: '8,000円〜', min: 8000 },
];

export function SortLinks({ query }: { query: SearchQuery }) {
  const current = query.sort ?? 'popular';
  return (
    <div className="scroll-x">
      <ul className="flex gap-1 whitespace-nowrap text-sm">
        {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
          <li key={key}>
            <Link
              href={buildSearchHref(query, { sort: key })}
              aria-current={current === key ? 'true' : undefined}
              className={`inline-block rounded-full px-3 py-1.5 transition ${
                current === key ? 'bg-ink font-semibold text-white' : 'border border-line bg-white text-muted hover:border-rose'
              }`}
            >
              {SORT_LABELS[key]}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ActiveFilters({ query }: { query: SearchQuery }) {
  const chips: { label: string; clear: Partial<SearchQuery> }[] = [];
  if (query.q) chips.push({ label: `「${query.q}」`, clear: { q: undefined } });
  if (query.category) chips.push({ label: categoryName(query.category), clear: { category: undefined } });
  if (query.brand) chips.push({ label: query.brand, clear: { brand: undefined } });
  if (query.shopId) {
    const shop = SHOPS.find((s) => s.id === query.shopId);
    chips.push({ label: shop?.name ?? query.shopId, clear: { shopId: undefined } });
  }
  if (query.minJpy !== undefined || query.maxJpy !== undefined) {
    chips.push({
      label: `${query.minJpy?.toLocaleString('ja-JP') ?? ''}〜${query.maxJpy?.toLocaleString('ja-JP') ?? ''}円`,
      clear: { minJpy: undefined, maxJpy: undefined },
    });
  }
  if (chips.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-2 text-xs">
      {chips.map((chip) => (
        <li key={chip.label}>
          <Link
            href={buildSearchHref(query, chip.clear)}
            className="inline-flex items-center gap-1 rounded-full bg-rose-soft px-3 py-1 font-semibold text-rose-deep hover:bg-rose/20"
          >
            {chip.label}
            <span aria-hidden>×</span>
            <span className="sr-only">この絞り込みを外す</span>
          </Link>
        </li>
      ))}
      <li>
        <Link href="/search" className="inline-block rounded-full border border-line px-3 py-1 text-muted hover:text-ink">
          すべて解除
        </Link>
      </li>
    </ul>
  );
}

export function FilterPanel({ query, result }: { query: SearchQuery; result: SearchResult }) {
  return (
    <aside className="space-y-6 text-sm" aria-label="絞り込み">
      <FilterGroup title="カテゴリ">
        <ul className="space-y-1">
          {CATEGORIES.map((c) => {
            const count = result.categories.find((x) => x.slug === c.slug)?.count ?? 0;
            const active = query.category === c.slug;
            return (
              <li key={c.slug}>
                <Link
                  href={buildSearchHref(query, { category: active ? undefined : c.slug })}
                  className={`flex items-baseline justify-between gap-2 rounded-lg px-2 py-1 ${
                    active ? 'bg-rose-soft font-semibold text-rose-deep' : 'text-muted hover:bg-white hover:text-ink'
                  }`}
                >
                  <span>
                    {c.emoji} {c.name}
                  </span>
                  {count > 0 && <span className="tabular text-xs text-muted">{count}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </FilterGroup>

      <FilterGroup title="発送元・ショップ">
        <ul className="space-y-1">
          {SHOPS.map((shop) => {
            const active = query.shopId === shop.id;
            return (
              <li key={shop.id}>
                <Link
                  href={buildSearchHref(query, { shopId: active ? undefined : shop.id })}
                  className={`block rounded-lg px-2 py-1 ${
                    active ? 'bg-rose-soft font-semibold text-rose-deep' : 'text-muted hover:bg-white hover:text-ink'
                  }`}
                >
                  {shop.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </FilterGroup>

      <FilterGroup title="総額（送料・税込み）">
        <ul className="space-y-1">
          {PRICE_BANDS.map((band) => {
            const active = query.minJpy === band.min && query.maxJpy === band.max;
            return (
              <li key={band.label}>
                <Link
                  href={buildSearchHref(query, {
                    minJpy: active ? undefined : band.min,
                    maxJpy: active ? undefined : band.max,
                  })}
                  className={`block rounded-lg px-2 py-1 ${
                    active ? 'bg-rose-soft font-semibold text-rose-deep' : 'text-muted hover:bg-white hover:text-ink'
                  }`}
                >
                  {band.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </FilterGroup>

      {result.brands.length > 1 && (
        <FilterGroup title="ブランド">
          <ul className="space-y-1">
            {result.brands.slice(0, 20).map((brand) => {
              const active = query.brand === brand.name;
              return (
                <li key={brand.name}>
                  <Link
                    href={buildSearchHref(query, { brand: active ? undefined : brand.name })}
                    className={`flex items-baseline justify-between gap-2 rounded-lg px-2 py-1 ${
                      active ? 'bg-rose-soft font-semibold text-rose-deep' : 'text-muted hover:bg-white hover:text-ink'
                    }`}
                  >
                    <span>{brand.name}</span>
                    <span className="tabular text-xs text-muted">{brand.count}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </FilterGroup>
      )}
    </aside>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-xs font-bold tracking-wide text-muted">{title}</h2>
      {children}
    </section>
  );
}
