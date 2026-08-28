import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard';
import { SearchBar } from '@/components/SearchBar';
import { CATEGORIES } from '@/lib/categories';
import { getRates } from '@/lib/currency';
import { searchProducts } from '@/lib/search';

// 為替レートを1時間ごとに取り込み直す
export const revalidate = 3600;

const POPULAR_KEYWORDS = ['鎮静', '毛穴', '日焼け止め', 'ティント', 'トナーパッド', 'ヒアルロン酸', 'コラーゲン'];

export default async function HomePage() {
  const [trending, popular, { source, rates }] = await Promise.all([
    searchProducts({ sort: 'trending' }),
    searchProducts({ sort: 'popular' }),
    getRates(),
  ]);

  return (
    <>
      <section className="border-b border-line bg-linear-to-b from-rose-soft to-cream">
        <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:py-20">
          <h1 className="text-3xl leading-tight font-bold sm:text-4xl">
            韓国・アメリカのコスメを
            <br className="sm:hidden" />
            <span className="text-rose-deep">送料と関税込みの総額</span>で比べる
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            OLIVE YOUNG、YesStyle、iHerb、Qoo10、楽天市場など {new Set(popular.hits.flatMap((h) => h.product.offers.map((o) => o.shopId))).size} ショップを横断検索。
            「表示価格は安いのに、送料と税金を足したら国内で買うより高かった」を無くします。
          </p>
          <div className="mx-auto mt-7 max-w-xl">
            <SearchBar />
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {POPULAR_KEYWORDS.map((kw) => (
              <Link
                key={kw}
                href={`/search?q=${encodeURIComponent(kw)}`}
                className="rounded-full border border-line bg-white px-3 py-1 text-xs text-muted transition hover:border-rose hover:text-rose-deep"
              >
                {kw}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              title: '総額で比較する',
              body: '国際送料・関税・消費税・通関手数料まで自動で計算。ショップの表示価格ではなく、実際に払う金額で並べ替えられます。',
            },
            {
              title: '免税ラインが分かる',
              body: '課税価格（商品価格の60%）が1万円以下なら免税。どのショップなら税金がかからないかをバッジで表示します。',
            },
            {
              title: '日本より先に出る新作',
              body: '韓国・アメリカで先行発売され、日本ではまだ買えないアイテムを「伸びている順」で追いかけられます。',
            },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-line bg-white p-5">
              <h2 className="text-sm font-bold">{f.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <Section
        title="いま伸びているアイテム"
        description="直近の検索・言及の伸びが大きい順。日本上陸前の商品が上位に来やすいセクションです。"
        href="/search?sort=trending"
        hits={trending.hits.slice(0, 8)}
      />

      <section className="mx-auto max-w-6xl px-4 py-8">
        <h2 className="text-xl font-bold">カテゴリから探す</h2>
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/category/${c.slug}`}
                className="flex h-full flex-col gap-1 rounded-2xl border border-line bg-white p-4 transition hover:border-rose hover:bg-rose-soft/40"
              >
                <span className="text-2xl">{c.emoji}</span>
                <span className="text-sm font-semibold">{c.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <Section
        title="人気ランキング"
        description="レビュー数・言及数をもとにした総合の人気順です。"
        href="/ranking"
        hits={popular.hits.slice(0, 8)}
      />

      <section className="mx-auto max-w-6xl px-4 pb-4">
        <p className="rounded-2xl border border-line bg-white px-5 py-4 text-xs leading-relaxed text-muted">
          表示している円換算額は {source} をもとにした概算です（1 KRW ≒ {rates.KRW.toFixed(3)} 円 / 1 USD ≒{' '}
          {rates.USD.toFixed(1)} 円）。税・送料の計算は個人輸入を前提としており、実際の請求額は各ショップと税関の
          判断によって変わります。詳しくは
          <Link href="/guide/import" className="mx-1 font-semibold text-rose-deep underline">
            個人輸入の税金ガイド
          </Link>
          をご覧ください。
        </p>
      </section>
    </>
  );
}

function Section({
  title,
  description,
  href,
  hits,
}: {
  title: string;
  description: string;
  href: string;
  hits: Awaited<ReturnType<typeof searchProducts>>['hits'];
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="mt-1 text-sm text-muted">{description}</p>
        </div>
        <Link href={href} className="shrink-0 text-sm font-semibold text-rose-deep hover:underline">
          すべて見る →
        </Link>
      </div>
      <ul className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {hits.map((hit) => (
          <li key={hit.product.id}>
            <ProductCard hit={hit} />
          </li>
        ))}
      </ul>
    </section>
  );
}
