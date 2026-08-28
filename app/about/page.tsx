import type { Metadata } from 'next';
import Link from 'next/link';
import { enabledNotifiers, NOTIFIERS } from '@/lib/notify';
import { enabledProviders, PROVIDERS } from '@/lib/providers';
import { SHOPS } from '@/lib/shops';

export const metadata: Metadata = {
  title: 'このサイトについて',
  description:
    'KoreaBeauty は、韓国・アメリカのコスメを複数ショップ横断で検索し、送料・関税・消費税を含めた総額で比較できるサイトです。',
};

export default function AboutPage() {
  const enabled = new Set(enabledProviders().map((p) => p.id));
  const enabledAlerts = new Set(enabledNotifiers().map((n) => n.id));

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-bold">このサイトについて</h1>

      <section className="mt-8 space-y-4 text-sm leading-relaxed">
        <p>
          韓国やアメリカで話題になったコスメは、日本で発売されるまでに数か月かかることがあります。先に手に入れようと
          海外のショップを開いても、通貨も送料も税金の扱いもばらばらで、結局いくら払うことになるのかが分かりません。
        </p>
        <p>
          KoreaBeauty は、その「結局いくら？」だけを揃えて見せるサイトです。複数のショップの価格を集め、
          <strong>国際送料・関税・消費税・通関手数料まで含めた「日本に届くまでの総額」</strong>
          に直してから並べ替えます。表示価格が最安のショップが、総額でも最安とは限りません。
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold">比較しているショップ</h2>
        <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          {SHOPS.map((shop) => (
            <li key={shop.id} className="rounded-xl border border-line bg-white px-4 py-3">
              <span className="font-semibold">{shop.name}</span>
              <span className="ml-2 text-xs text-muted">
                {shop.dutyPaid ? '国内発送・税込み' : '海外発送・個人輸入'}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold">データの取得元</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {PROVIDERS.map((provider) => (
            <li key={provider.id} className="flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3">
              <span className={`h-2 w-2 shrink-0 rounded-full ${enabled.has(provider.id) ? 'bg-mint-deep' : 'bg-line'}`} />
              <span className="font-semibold">{provider.name}</span>
              <span className="ml-auto text-xs text-muted">{enabled.has(provider.id) ? '有効' : '未設定'}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs leading-relaxed text-muted">
          「未設定」のデータ取得元は、必要なAPIキーが設定されていないため今は使われていません。設定すると自動的に
          横断検索の対象に加わります。
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold">価格の記録と値下げの通知</h2>
        <p className="mt-3 text-sm leading-relaxed">
          1日1回、全商品の「送料・税込みの最安総額」を記録しています。前回から5%以上下がったものは
          <Link href="/sale" className="mx-1 font-semibold text-rose-deep underline">
            値下げ中のアイテム
          </Link>
          に集まり、
          <Link href="/feed.xml" className="mx-1 font-semibold text-rose-deep underline">
            RSS
          </Link>
          でも配信されます。商品ページでは記録した推移をグラフで確認できます。
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          {NOTIFIERS.map((notifier) => (
            <li key={notifier.id} className="flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3">
              <span className={`h-2 w-2 shrink-0 rounded-full ${enabledAlerts.has(notifier.id) ? 'bg-mint-deep' : 'bg-line'}`} />
              <span className="font-semibold">{notifier.name}</span>
              <span className="ml-auto text-xs text-muted">{enabledAlerts.has(notifier.id) ? '有効' : '未設定'}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold">表示金額についての注意</h2>
        <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted">
          <li>・総額はすべて概算です。実際の請求額は各ショップの表示と税関の判断によって変わります。</li>
          <li>・為替レートは自動取得した参考値で、カード会社の決済レートとは差が出ます。</li>
          <li>・税金の計算は「自分で使うための個人輸入」を前提にしています。転売目的の輸入では計算が変わります。</li>
          <li>・当サイトは販売を行っていません。購入はリンク先の各ショップで行ってください。</li>
        </ul>
        <Link href="/guide/import" className="mt-4 inline-block text-sm font-semibold text-rose-deep hover:underline">
          税金の計算方法をくわしく見る →
        </Link>
      </section>
    </div>
  );
}
