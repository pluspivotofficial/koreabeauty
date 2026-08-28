import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';
import { SearchBar } from './SearchBar';

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:gap-6">
        <Link href="/" className="flex shrink-0 items-baseline gap-2">
          <span className="text-xl font-bold tracking-tight">KoreaBeauty</span>
          <span className="hidden text-xs text-muted sm:inline">総額で選ぶ韓国・US コスメ</span>
        </Link>
        <div className="sm:flex-1">
          <SearchBar />
        </div>
      </div>
      <nav aria-label="カテゴリ" className="scroll-x border-t border-line">
        <ul className="mx-auto flex max-w-6xl gap-1 px-2 py-1.5 text-sm whitespace-nowrap">
          <li>
            <Link href="/ranking" className="inline-block rounded-full px-3 py-1.5 font-semibold text-rose-deep hover:bg-rose-soft">
              🔥 ランキング
            </Link>
          </li>
          <li>
            <Link href="/sale" className="inline-block rounded-full px-3 py-1.5 font-semibold text-rose-deep hover:bg-rose-soft">
              ↓ 値下げ中
            </Link>
          </li>
          {CATEGORIES.map((c) => (
            <li key={c.slug}>
              <Link href={`/category/${c.slug}`} className="inline-block rounded-full px-3 py-1.5 text-muted hover:bg-rose-soft hover:text-ink">
                {c.emoji} {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
