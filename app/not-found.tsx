import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-4xl">🔎</p>
      <h1 className="mt-4 text-xl font-bold">ページが見つかりませんでした</h1>
      <p className="mt-2 text-sm text-muted">
        商品が入れ替わったか、URLが変わった可能性があります。検索から探し直してみてください。
      </p>
      <Link href="/" className="mt-6 inline-block rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white">
        トップページへ
      </Link>
    </div>
  );
}
