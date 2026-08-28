import type { Metadata } from 'next';
import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard';
import { formatJpy } from '@/lib/currency';
import { DROP_THRESHOLD_PCT } from '@/lib/priceDrop';
import { searchProducts } from '@/lib/search';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: '値下げ中の韓国・アメリカコスメ',
  description:
    '前回の記録から総額が下がった韓国・アメリカのコスメをまとめています。毎日1回の価格記録をもとに、値下げ幅の大きい順に並べています。',
};

export default async function SalePage() {
  const [drops, lows] = await Promise.all([
    searchProducts({ onlyDrops: true, sort: 'drop' }),
    searchProducts({ sort: 'popular' }),
  ]);

  const allTimeLows = lows.hits.filter((hit) => hit.insight.isAllTimeLow && hit.insight.hasHistory).slice(0, 8);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold">値下げ中のアイテム</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        毎日1回、各商品の「送料・税込みの最安総額」を記録しています。前回の記録から
        {DROP_THRESHOLD_PCT}%以上下がったものをここに集めました。為替や送料無料キャンペーンの影響も含めた、
        実際に払う金額での比較です。
      </p>

      {drops.total === 0 ? (
        <p className="mt-8 rounded-2xl border border-line bg-white p-10 text-center text-sm text-muted">
          いまは値下げ中のアイテムがありません。次の記録更新をお待ちください。
        </p>
      ) : (
        <>
          <p className="tabular mt-6 text-sm text-muted">{drops.total} 件</p>
          <ul className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {drops.hits.map((hit) => (
              <li key={hit.product.id}>
                <ProductCard hit={hit} />
              </li>
            ))}
          </ul>
        </>
      )}

      {allTimeLows.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl font-bold">記録上いちばん安いアイテム</h2>
          <p className="mt-1 text-sm text-muted">
            いま下がったばかりではないものの、記録している期間の中では最安の水準にあるアイテムです。
          </p>
          <ul className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {allTimeLows.map((hit) => (
              <li key={hit.product.id}>
                <ProductCard hit={hit} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-14 rounded-2xl border border-line bg-white p-6">
        <h2 className="text-lg font-bold">値下げを見逃さない</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          値下げはRSSでも配信しています。フィードリーダーやSlackのRSS連携に登録しておくと、
          サイトを見に来なくても通知が届きます。
        </p>
        <Link
          href="/feed.xml"
          className="mt-4 inline-block rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white transition hover:bg-rose-deep"
        >
          RSSフィードを開く
        </Link>
        {drops.hits[0] && (
          <p className="mt-4 text-xs text-muted">
            直近でいちばん下がったのは「{drops.hits[0].product.name}」で、
            {formatJpy(drops.hits[0].insight.previousJpy ?? 0)} から{' '}
            {formatJpy(drops.hits[0].bestLandedCost.totalJpy)} になりました。
          </p>
        )}
      </section>
    </div>
  );
}
