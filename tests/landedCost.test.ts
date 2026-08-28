import { describe, expect, it } from 'vitest';
import { computeLandedCost, DE_MINIMIS_JPY, POSTAL_CLEARANCE_FEE_JPY } from '@/lib/landedCost';
import { getShop } from '@/lib/shops';

const oliveYoung = getShop('oliveyoung-global')!;
const rakuten = getShop('rakuten')!;

describe('computeLandedCost', () => {
  it('課税価格が1万円以下なら免税になる', () => {
    // 16,000円 × 60% = 9,600円 → 1万円以下
    const result = computeLandedCost({ itemJpy: 16_000, shop: oliveYoung, category: 'skincare' });
    expect(result.dutiableValueJpy).toBe(9_600);
    expect(result.dutyFree).toBe(true);
    expect(result.consumptionTaxJpy).toBe(0);
    expect(result.clearanceFeeJpy).toBe(0);
  });

  it('免税ラインを1円でも超えたら消費税と通関料がかかる', () => {
    // 16,668円 × 60% = 10,001円 → 1万円超
    const result = computeLandedCost({ itemJpy: 16_668, shop: oliveYoung, category: 'skincare' });
    expect(result.dutiableValueJpy).toBeGreaterThan(DE_MINIMIS_JPY);
    expect(result.dutyFree).toBe(false);
    expect(result.consumptionTaxJpy).toBe(1_000); // 10,001 × 10% = 1,000.1 → 100円未満切り捨て
    expect(result.clearanceFeeJpy).toBe(POSTAL_CLEARANCE_FEE_JPY);
  });

  it('化粧品の関税は無税なので、税額は消費税だけになる', () => {
    const result = computeLandedCost({ itemJpy: 40_000, shop: oliveYoung, category: 'makeup' });
    expect(result.dutyJpy).toBe(0);
    expect(result.consumptionTaxJpy).toBe(2_400); // 24,000 × 10%
  });

  it('送料無料のしきい値を超えると国際送料が0になる', () => {
    const under = computeLandedCost({ itemJpy: 5_000, shop: oliveYoung, category: 'skincare' });
    const over = computeLandedCost({ itemJpy: 9_000, shop: oliveYoung, category: 'skincare' });
    expect(under.shippingJpy).toBe(oliveYoung.typicalShippingJpy);
    expect(over.shippingJpy).toBe(0);
  });

  it('国内発送のショップには関税・消費税を上乗せしない', () => {
    const result = computeLandedCost({ itemJpy: 30_000, shop: rakuten, category: 'skincare' });
    expect(result.dutyJpy).toBe(0);
    expect(result.consumptionTaxJpy).toBe(0);
    expect(result.clearanceFeeJpy).toBe(0);
    expect(result.totalJpy).toBe(30_000); // 3,980円以上なので送料も無料
  });

  it('総額は各項目の合計と一致する', () => {
    const r = computeLandedCost({ itemJpy: 50_000, shop: oliveYoung, category: 'tools' });
    expect(r.totalJpy).toBe(r.itemJpy + r.shippingJpy + r.dutyJpy + r.consumptionTaxJpy + r.clearanceFeeJpy);
  });
});
