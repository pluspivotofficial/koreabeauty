import { getCategory } from './categories';
import type { CategorySlug, LandedCost, Shop } from './types';

/**
 * 個人輸入の課税価格は「海外小売価格 × 0.6」で計算する（関税定率法の運用）。
 * 商業輸入（仕入れ）の場合はこの掛け率は使えない。
 */
export const PERSONAL_IMPORT_RATIO = 0.6;

/** 課税価格の合計がこの額以下なら関税・消費税とも免除（少額輸入貨物の免税）。 */
export const DE_MINIMIS_JPY = 10_000;

/** 消費税＋地方消費税。 */
export const CONSUMPTION_TAX_RATE = 0.1;

/** 国際郵便（EMS・小型包装物）の通関料。クーリエ便は各社の立替手数料が別途かかる。 */
export const POSTAL_CLEARANCE_FEE_JPY = 200;

export interface LandedCostInput {
  /** 商品本体の円換算額 */
  itemJpy: number;
  shop: Shop;
  category: CategorySlug;
  /** 同時購入する点数。送料無料しきい値の判定に使う。 */
  quantity?: number;
}

/**
 * 商品が日本の玄関に届くまでの総額（landed cost）を概算する。
 *
 * あくまで個人輸入を前提とした目安であり、実際の課税額は税関の判断で変わる。
 * 画面には必ず「概算」であることを併記すること。
 */
export function computeLandedCost({ itemJpy, shop, category }: LandedCostInput): LandedCost {
  const notes: string[] = [];

  // 国内発送・DDP（関税元払い）のショップは、表示価格に税と送料の扱いが含まれる
  if (shop.dutyPaid) {
    const shippingJpy = shop.freeShippingOverJpy && itemJpy >= shop.freeShippingOverJpy ? 0 : shop.typicalShippingJpy;
    if (shippingJpy === 0 && shop.typicalShippingJpy > 0) {
      notes.push(`${shop.freeShippingOverJpy?.toLocaleString('ja-JP')}円以上で送料無料`);
    }
    notes.push('国内発送または関税元払いのため、追加の税金はかかりません');
    return {
      itemJpy,
      shippingJpy,
      dutiableValueJpy: 0,
      dutyJpy: 0,
      consumptionTaxJpy: 0,
      clearanceFeeJpy: 0,
      totalJpy: itemJpy + shippingJpy,
      dutyFree: true,
      notes,
    };
  }

  const shippingJpy =
    shop.freeShippingOverJpy && itemJpy >= shop.freeShippingOverJpy ? 0 : shop.typicalShippingJpy;
  if (shippingJpy === 0 && shop.typicalShippingJpy > 0) {
    notes.push(`${shop.freeShippingOverJpy?.toLocaleString('ja-JP')}円以上で国際送料無料`);
  }

  // 課税価格は「商品価格の60%」。送料は個人輸入の簡易計算では課税価格に含めない。
  const dutiableValueJpy = Math.round(itemJpy * PERSONAL_IMPORT_RATIO);

  if (dutiableValueJpy <= DE_MINIMIS_JPY) {
    notes.push(
      `課税価格 ${dutiableValueJpy.toLocaleString('ja-JP')}円（商品価格の60%）が1万円以下のため免税`,
    );
    return {
      itemJpy,
      shippingJpy,
      dutiableValueJpy,
      dutyJpy: 0,
      consumptionTaxJpy: 0,
      clearanceFeeJpy: 0,
      totalJpy: itemJpy + shippingJpy,
      dutyFree: true,
      notes,
    };
  }

  const dutyRate = getCategory(category)?.dutyRate ?? 0;
  const dutyJpy = Math.floor((dutiableValueJpy * dutyRate) / 100) * 100; // 関税は100円未満切り捨て
  const consumptionTaxJpy = Math.floor(((dutiableValueJpy + dutyJpy) * CONSUMPTION_TAX_RATE) / 100) * 100;

  if (dutyRate === 0) {
    notes.push('化粧品類の関税は無税（消費税のみ）');
  }
  notes.push('課税価格が1万円を超えるため、消費税と通関料がかかります');

  return {
    itemJpy,
    shippingJpy,
    dutiableValueJpy,
    dutyJpy,
    consumptionTaxJpy,
    clearanceFeeJpy: POSTAL_CLEARANCE_FEE_JPY,
    totalJpy: itemJpy + shippingJpy + dutyJpy + consumptionTaxJpy + POSTAL_CLEARANCE_FEE_JPY,
    dutyFree: false,
    notes,
  };
}

/** 個人輸入で気をつける数量制限。カテゴリページと商品ページに出す。 */
export const IMPORT_LIMITS: Partial<Record<CategorySlug, string>> = {
  skincare: '化粧品は標準サイズで1品目24個以内が個人輸入の目安です。',
  makeup: '化粧品は標準サイズで1品目24個以内が個人輸入の目安です。',
  'mask-sheet': 'シートマスクは「1品目24個以内」の数え方が枚数と異なる場合があります。',
  suncare: '日焼け止めは化粧品扱い。1品目24個以内が目安です。',
  haircare: '化粧品は標準サイズで1品目24個以内が個人輸入の目安です。',
  bodycare: '化粧品は標準サイズで1品目24個以内が個人輸入の目安です。',
  fragrance: 'アルコールを含むため航空便に載せられないショップがあります。',
  tools: '韓国は220V・米国は120Vです。日本で使うには変圧器や技適の確認が必要な場合があります。',
  'inner-beauty': 'サプリメント等の食品は、個人輸入では概ね2か月分以内が目安です。',
};
