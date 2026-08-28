import type { CategorySlug } from './types';

export interface CategoryDef {
  slug: CategorySlug;
  name: string;
  /** カテゴリページの導入文。SEOの本文としても効かせる。 */
  description: string;
  emoji: string;
  /** 日本の関税率（従価税）。化粧品はおおむね無税だが品目で異なる。 */
  dutyRate: number;
}

export const CATEGORIES: CategoryDef[] = [
  {
    slug: 'skincare',
    name: 'スキンケア',
    description:
      '化粧水・美容液・クリームなど。韓国発のトナーパッドやレチノール、アメリカ発の高濃度アクティブ系まで、日本で手に入りにくいアイテムを横断で比較できます。',
    emoji: '🧴',
    dutyRate: 0,
  },
  {
    slug: 'makeup',
    name: 'メイク',
    description:
      'クッションファンデ、ティント、シェーディングなど。韓国の新作は日本上陸まで数か月かかることが多く、現地価格との差が出やすいカテゴリです。',
    emoji: '💄',
    dutyRate: 0,
  },
  {
    slug: 'mask-sheet',
    name: 'シートマスク・パック',
    description:
      'まとめ買いで単価が大きく変わるカテゴリ。枚数違いの出品が多いため、1枚あたりの総額で比較するのがコツです。',
    emoji: '🎭',
    dutyRate: 0,
  },
  {
    slug: 'suncare',
    name: '日焼け止め',
    description:
      '韓国製サンスクリーンは軽い使用感で人気。日本の薬機法上、個人輸入した日焼け止めは自己使用の範囲に限られます。',
    emoji: '☀️',
    dutyRate: 0,
  },
  {
    slug: 'haircare',
    name: 'ヘアケア',
    description: 'ヘアオイル、トリートメント、頭皮ケア。液体のため送料が効きやすく、総額比較の効果が大きいカテゴリです。',
    emoji: '💇',
    dutyRate: 0,
  },
  {
    slug: 'bodycare',
    name: 'ボディケア',
    description: 'ボディローション、角質ケア、ハンドクリーム。US発のセラミド系・韓国発の香り系が中心です。',
    emoji: '🛁',
    dutyRate: 0,
  },
  {
    slug: 'fragrance',
    name: 'フレグランス',
    description:
      'ニッチ系の韓国パフューム、ヘアミスト。アルコールを含むため航空便で送れないショップがある点に注意してください。',
    emoji: '🌸',
    dutyRate: 0,
  },
  {
    slug: 'tools',
    name: '美容家電・ツール',
    description:
      '美顔器、ヘアアイロン、かっさなど。電圧（韓国220V／米国120V）と技適の確認が必要です。関税率もコスメとは異なります。',
    emoji: '💫',
    dutyRate: 0,
  },
  {
    slug: 'inner-beauty',
    name: 'インナービューティー',
    description:
      'コラーゲン、乳酸菌、サプリメント。食品扱いのため、個人輸入では2か月分以内などの数量制限がかかります。',
    emoji: '🍋',
    dutyRate: 0,
  },
];

const BY_SLUG = new Map(CATEGORIES.map((c) => [c.slug, c]));

export function getCategory(slug: string): CategoryDef | undefined {
  return BY_SLUG.get(slug as CategorySlug);
}

export function categoryName(slug: CategorySlug): string {
  return BY_SLUG.get(slug)?.name ?? slug;
}
