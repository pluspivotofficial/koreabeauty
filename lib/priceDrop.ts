import type { HistoryPoint, ProductHistory } from './priceHistory';

/** この率以上下がったら「値下げ」として扱う（％）。小さすぎる変動を拾わないため。 */
export const DROP_THRESHOLD_PCT = 5;

export interface PriceInsight {
  /** 表示用の系列。保存済みの履歴に、今日の実測値を足したもの。 */
  series: HistoryPoint[];
  currentJpy: number;
  /** 直前の記録（今日を除く最後の点） */
  previousJpy?: number;
  /** 直前との差額。マイナスなら値下げ。 */
  changeJpy: number;
  /** 直前との変化率（％）。マイナスなら値下げ。 */
  changePct: number;
  lowestJpy: number;
  highestJpy: number;
  /** 記録した中でいちばん安い（同値を含む） */
  isAllTimeLow: boolean;
  /** 期間中の最高値からの下落率（％）。「実質◯%OFF」の表示に使う。 */
  offFromHighPct: number;
  /** 履歴が何日ぶんあるか */
  windowDays: number;
  /** 判定できるだけの履歴があるか */
  hasHistory: boolean;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * 保存済みの履歴と「今の総額」から、値下げ判定と表示用の系列を作る。
 *
 * 今の総額は為替を含めてリクエスト時に計算されるため、履歴の最後の点と
 * 一致するとは限らない。同じ日付の点は今の値で置き換え、無ければ足すことで、
 * グラフの右端が必ず画面に出ている金額と一致するようにしている。
 */
export function analyzePrice(currentJpy: number, shopId: string, history?: ProductHistory): PriceInsight {
  const date = today();
  const stored = (history?.points ?? []).filter((p) => p.date < date);
  const series: HistoryPoint[] = [...stored, { date, totalJpy: currentJpy, shopId }];

  const totals = series.map((p) => p.totalJpy);
  const lowestJpy = Math.min(...totals);
  const highestJpy = Math.max(...totals);
  const previous = stored.at(-1);
  const changeJpy = previous ? currentJpy - previous.totalJpy : 0;

  return {
    series,
    currentJpy,
    previousJpy: previous?.totalJpy,
    changeJpy,
    changePct: previous ? (changeJpy / previous.totalJpy) * 100 : 0,
    lowestJpy,
    highestJpy,
    isAllTimeLow: stored.length > 0 && currentJpy <= lowestJpy,
    offFromHighPct: highestJpy > 0 ? ((highestJpy - currentJpy) / highestJpy) * 100 : 0,
    windowDays: series.length,
    hasHistory: stored.length >= 2,
  };
}

/** 通知・値下げ一覧に載せるべき下がり方か。 */
export function isPriceDrop(insight: PriceInsight): boolean {
  return insight.hasHistory && insight.changePct <= -DROP_THRESHOLD_PCT;
}

/** 値上がりを警告表示するか。 */
export function isPriceRise(insight: PriceInsight): boolean {
  return insight.hasHistory && insight.changePct >= DROP_THRESHOLD_PCT;
}
