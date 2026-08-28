import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="text-lg font-bold">KoreaBeauty</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            韓国・アメリカで話題のコスメを複数ショップ横断で検索し、国際送料と関税・消費税まで含めた
            「日本に届くまでの総額」で比較できるサイトです。
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">カテゴリ</p>
          <ul className="mt-3 grid grid-cols-2 gap-1 text-sm text-muted">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link href={`/category/${c.slug}`} className="hover:text-ink hover:underline">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">ご利用にあたって</p>
          <ul className="mt-3 space-y-1 text-sm text-muted">
            <li>
              <Link href="/about" className="hover:text-ink hover:underline">
                このサイトについて
              </Link>
            </li>
            <li>
              <Link href="/guide/import" className="hover:text-ink hover:underline">
                個人輸入の税金ガイド
              </Link>
            </li>
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-muted">
            表示している総額は、為替・送料・税率をもとにした概算です。実際の請求額は各ショップと税関の判断により
            変わります。購入前に必ず各ショップの表示をご確認ください。
          </p>
        </div>
      </div>
      <div className="border-t border-line py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} KoreaBeauty
      </div>
    </footer>
  );
}
