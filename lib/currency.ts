import type { Currency, Money } from './types';

/**
 * フォールバックの為替レート（1通貨あたりの円）。
 * EXCHANGE_RATE_API_URL が設定されていればそちらを優先し、失敗時のみこの値を使う。
 * 概算表示用の目安であり、実際の決済レートとは異なる。
 */
export const FALLBACK_RATES: Record<Currency, number> = {
  JPY: 1,
  KRW: 0.115,
  USD: 155,
};

export const FALLBACK_RATE_LABEL = '参考レート（自動更新できなかった場合の固定値）';

export interface Rates {
  rates: Record<Currency, number>;
  /** レートの取得元。画面に出して「概算である」ことを明示する。 */
  source: string;
  fetchedAt: string;
}

let cached: { value: Rates; expiresAt: number } | null = null;
const CACHE_MS = 60 * 60 * 1000;

/**
 * 為替レートを取得する。APIが未設定・到達不能でも必ず値を返す
 * （レート取得の失敗でサイト全体が落ちないようにするため）。
 */
export async function getRates(): Promise<Rates> {
  const now = Date.now();
  if (cached && cached.expiresAt > now) return cached.value;

  const url = process.env.EXCHANGE_RATE_API_URL;
  if (url) {
    try {
      const res = await fetch(url, { next: { revalidate: 3600 } });
      if (res.ok) {
        const json = (await res.json()) as { rates?: Record<string, number> };
        // JPY を基準に取得したレートは「1円あたりの外貨」なので逆数にする
        const perJpy = json.rates;
        if (perJpy?.KRW && perJpy?.USD) {
          const value: Rates = {
            rates: { JPY: 1, KRW: 1 / perJpy.KRW, USD: 1 / perJpy.USD },
            source: new URL(url).hostname,
            fetchedAt: new Date().toISOString(),
          };
          cached = { value, expiresAt: now + CACHE_MS };
          return value;
        }
      }
    } catch {
      // ネットワーク失敗時はフォールバックへ落ちる
    }
  }

  const value: Rates = {
    rates: FALLBACK_RATES,
    source: FALLBACK_RATE_LABEL,
    fetchedAt: new Date().toISOString(),
  };
  cached = { value, expiresAt: now + CACHE_MS };
  return value;
}

/** 任意通貨を円に換算する。1円未満は切り上げ（総額を過小に見せないため）。 */
export function toJpy(money: Money, rates: Record<Currency, number>): number {
  return Math.ceil(money.amount * (rates[money.currency] ?? FALLBACK_RATES[money.currency]));
}

export function formatJpy(amount: number): string {
  return `¥${Math.round(amount).toLocaleString('ja-JP')}`;
}

export function formatLocal(money: Money): string {
  const symbols: Record<Currency, string> = { KRW: '₩', USD: '$', JPY: '¥' };
  const digits = money.currency === 'USD' ? 2 : 0;
  return `${symbols[money.currency]}${money.amount.toLocaleString('ja-JP', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}
