import type { Metadata } from 'next';
import Link from 'next/link';
import {
  CONSUMPTION_TAX_RATE,
  DE_MINIMIS_JPY,
  IMPORT_LIMITS,
  PERSONAL_IMPORT_RATIO,
  POSTAL_CLEARANCE_FEE_JPY,
} from '@/lib/landedCost';
import { CATEGORIES } from '@/lib/categories';

export const metadata: Metadata = {
  title: '韓国・アメリカコスメの個人輸入にかかる税金ガイド',
  description:
    '個人輸入の課税価格は海外小売価格の60%。課税価格が1万円以下なら関税・消費税は免除されます。韓国・アメリカからコスメを買うときの税金と数量制限をまとめました。',
};

export default function ImportGuidePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-bold">個人輸入の税金ガイド</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        海外のショップでコスメを買うと、商品代金と送料のほかに関税・消費税がかかることがあります。
        仕組みはシンプルで、覚えるのは3つだけです。
      </p>

      <section className="mt-10">
        <h2 className="text-lg font-bold">1. 課税されるのは「商品価格の60%」</h2>
        <p className="mt-3 text-sm leading-relaxed">
          自分で使うために買う個人輸入では、課税の基準になる金額（課税価格）は
          <strong>海外の小売価格 × {PERSONAL_IMPORT_RATIO * 100}%</strong> で計算されます。
          20,000円の商品なら、課税価格は 12,000円です。
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold">2. 課税価格が{DE_MINIMIS_JPY.toLocaleString('ja-JP')}円以下なら免税</h2>
        <p className="mt-3 text-sm leading-relaxed">
          課税価格の合計が {DE_MINIMIS_JPY.toLocaleString('ja-JP')} 円以下であれば、関税も消費税もかかりません。
          商品価格に直すと、<strong>およそ {Math.round(DE_MINIMIS_JPY / PERSONAL_IMPORT_RATIO).toLocaleString('ja-JP')} 円まで</strong>
          が免税ラインです。当サイトで「税金なし」と表示されているのは、このラインを下回っている場合です。
        </p>
        <div className="mt-4 rounded-2xl border border-line bg-white p-5 text-sm">
          <p className="font-semibold">計算例：22,000円のコスメを韓国から買う場合</p>
          <ul className="mt-3 space-y-1 text-muted">
            <li>・課税価格：22,000円 × 60% = 13,200円 → 1万円を超えるので課税対象</li>
            <li>・関税：化粧品は無税なので 0円</li>
            <li>・消費税：13,200円 × {CONSUMPTION_TAX_RATE * 100}% = 1,320円 →（100円未満切り捨てで）1,300円</li>
            <li>・通関手数料：{POSTAL_CLEARANCE_FEE_JPY}円（国際郵便の場合）</li>
            <li className="pt-1 font-semibold text-ink">・合計で約 1,500円が商品代金・送料に上乗せされます</li>
          </ul>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold">3. 関税率は品目で変わる（化粧品は無税）</h2>
        <p className="mt-3 text-sm leading-relaxed">
          化粧品類の関税は無税のため、実際にかかるのは消費税と通関手数料だけです。ただし衣類やバッグ、
          美容家電は品目ごとに税率が異なります。
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold">カテゴリ別の数量制限</h2>
        <p className="mt-3 text-sm leading-relaxed">
          個人輸入は「自分で使う量」に限られます。量が多いと商業輸入とみなされ、別の手続きが必要になります。
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          {CATEGORIES.filter((c) => IMPORT_LIMITS[c.slug]).map((c) => (
            <li key={c.slug} className="rounded-xl border border-line bg-white px-4 py-3">
              <Link href={`/category/${c.slug}`} className="font-semibold hover:text-rose-deep hover:underline">
                {c.emoji} {c.name}
              </Link>
              <p className="mt-1 text-xs leading-relaxed text-muted">{IMPORT_LIMITS[c.slug]}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold">よくある勘違い</h2>
        <dl className="mt-4 space-y-4 text-sm">
          <div>
            <dt className="font-semibold">Q. 送料も課税されますか？</dt>
            <dd className="mt-1 leading-relaxed text-muted">
              個人輸入の簡易計算では、課税価格に送料は含めません。当サイトの計算も同じ扱いです。
            </dd>
          </div>
          <div>
            <dt className="font-semibold">Q. 分けて注文すれば免税になりますか？</dt>
            <dd className="mt-1 leading-relaxed text-muted">
              同じ日に同じ人へ届く荷物は合算して判断されることがあります。注文を分ければ必ず免税になる、
              というものではありません。
            </dd>
          </div>
          <div>
            <dt className="font-semibold">Q. 買ったものを人に売ってもいいですか？</dt>
            <dd className="mt-1 leading-relaxed text-muted">
              個人輸入した化粧品を販売・譲渡することはできません。転売する場合は、薬機法にもとづく製造販売業の
              許可など、まったく別の手続きが必要になります。
            </dd>
          </div>
        </dl>
      </section>

      <p className="mt-12 rounded-2xl border border-line bg-white p-5 text-xs leading-relaxed text-muted">
        このページは一般的な仕組みを分かりやすく説明したもので、税務・法務のアドバイスではありません。税率や制度は
        変わることがあります。実際の課税は税関の判断によります。最新の情報は税関の公式サイトでご確認ください。
      </p>
    </div>
  );
}
