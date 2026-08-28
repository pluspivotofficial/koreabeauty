import { describe, expect, it } from 'vitest';
import { analyzePrice, DROP_THRESHOLD_PCT, isPriceDrop, isPriceRise } from '@/lib/priceDrop';
import type { ProductHistory } from '@/lib/priceHistory';

const today = new Date().toISOString().slice(0, 10);
function daysAgo(n: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

function history(...totals: number[]): ProductHistory {
  return {
    productId: 'test',
    points: totals.map((totalJpy, i) => ({
      date: daysAgo(totals.length - i),
      totalJpy,
      shopId: 'qoo10',
    })),
  };
}

describe('analyzePrice', () => {
  it('履歴が無くても落ちず、判定できないことを示す', () => {
    const insight = analyzePrice(3000, 'qoo10');
    expect(insight.hasHistory).toBe(false);
    expect(insight.series).toHaveLength(1);
    expect(insight.currentJpy).toBe(3000);
    expect(isPriceDrop(insight)).toBe(false);
  });

  it('系列の最後は必ず「今の総額」になる', () => {
    // 履歴の最後が今日の日付でも、表示中の金額で置き換わること
    const withToday: ProductHistory = {
      productId: 'test',
      points: [
        { date: daysAgo(1), totalJpy: 4000, shopId: 'qoo10' },
        { date: today, totalJpy: 3900, shopId: 'qoo10' },
      ],
    };
    const insight = analyzePrice(3500, 'qoo10', withToday);
    expect(insight.series.at(-1)).toMatchObject({ date: today, totalJpy: 3500 });
    expect(insight.series.filter((p) => p.date === today)).toHaveLength(1);
    // 直前の記録は「今日より前」の最後の点
    expect(insight.previousJpy).toBe(4000);
  });

  it('しきい値を超えて下がったら値下げと判定する', () => {
    const insight = analyzePrice(3400, 'qoo10', history(4200, 4000, 4000));
    expect(insight.changeJpy).toBe(-600);
    expect(insight.changePct).toBeCloseTo(-15, 1);
    expect(isPriceDrop(insight)).toBe(true);
    expect(isPriceRise(insight)).toBe(false);
  });

  it('しきい値未満の変動は値下げとして扱わない', () => {
    const insight = analyzePrice(3900, 'qoo10', history(4000, 4000, 4000));
    expect(Math.abs(insight.changePct)).toBeLessThan(DROP_THRESHOLD_PCT);
    expect(isPriceDrop(insight)).toBe(false);
  });

  it('値上がりも検知する', () => {
    const insight = analyzePrice(4600, 'qoo10', history(4000, 4000, 4000));
    expect(isPriceRise(insight)).toBe(true);
  });

  it('過去最安は同値でも成立する', () => {
    expect(analyzePrice(3000, 'qoo10', history(3500, 3200, 3000)).isAllTimeLow).toBe(true);
    expect(analyzePrice(3100, 'qoo10', history(3500, 3200, 3000)).isAllTimeLow).toBe(false);
  });

  it('最高値からの下落率を出す', () => {
    const insight = analyzePrice(4000, 'qoo10', history(5000, 4800, 4500));
    expect(insight.highestJpy).toBe(5000);
    expect(insight.offFromHighPct).toBeCloseTo(20, 1);
  });

  it('履歴が1点しかないうちは判定を保留する', () => {
    const insight = analyzePrice(3000, 'qoo10', history(4000));
    expect(insight.hasHistory).toBe(false);
    expect(isPriceDrop(insight)).toBe(false);
  });
});
