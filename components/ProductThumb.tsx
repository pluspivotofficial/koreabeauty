/**
 * 商品画像のプレースホルダ。
 *
 * 各ECサイトの商品画像は権利関係の確認なしに転載できないため、画像URLが無い商品は
 * ブランド名から決定的に色を決めたグラデーションで代用する。
 * imageUrl を持つ商品（提携API経由など）はその画像を表示する。
 */
const PALETTES = [
  ['#fde4e9', '#f7c6d2'],
  ['#e5f1ec', '#c7e3d7'],
  ['#fdefdc', '#f7d9b0'],
  ['#e9e9f6', '#cdcfec'],
  ['#fce8f6', '#eec6e4'],
  ['#e6f0f8', '#c3dcef'],
];

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function ProductThumb({
  brand,
  name,
  imageUrl,
  className = '',
}: {
  brand: string;
  name: string;
  imageUrl?: string;
  className?: string;
}) {
  if (imageUrl) {
    return (
      // 外部ホストの画像は next/image の許可リスト設定に依存するため、
      // プロバイダが増えても壊れないよう素の img を使う。
      // eslint-disable-next-line @next/next/no-img-element
      <img src={imageUrl} alt={name} loading="lazy" className={`h-full w-full object-cover ${className}`} />
    );
  }

  const [from, to] = PALETTES[hash(brand) % PALETTES.length];
  const initials = brand.replace(/[^A-Za-z0-9ぁ-んァ-ヶ一-龠]/g, '').slice(0, 2) || '？';

  return (
    <div
      aria-hidden
      className={`flex h-full w-full items-center justify-center ${className}`}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      <span className="text-2xl font-bold uppercase tracking-widest text-ink/35">{initials}</span>
    </div>
  );
}
