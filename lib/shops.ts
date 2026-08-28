import type { Shop } from './types';

/**
 * 取り扱いショップ（モール）の定義。
 * 送料・配送日数は日本向けの一般的な目安であり、実際の条件は各ショップで要確認。
 */
export const SHOPS: Shop[] = [
  {
    id: 'oliveyoung-global',
    name: 'OLIVE YOUNG Global',
    country: 'KR',
    currency: 'KRW',
    typicalShippingJpy: 2400,
    freeShippingOverJpy: 9000,
    etaDays: [5, 10],
    dutyPaid: false,
  },
  {
    id: 'coupang-global',
    name: 'Coupang（クーパン）',
    country: 'KR',
    currency: 'KRW',
    typicalShippingJpy: 1800,
    freeShippingOverJpy: 12000,
    etaDays: [6, 12],
    dutyPaid: false,
  },
  {
    id: 'naver-smartstore',
    name: 'NAVER スマートストア',
    country: 'KR',
    currency: 'KRW',
    typicalShippingJpy: 2900,
    etaDays: [7, 14],
    dutyPaid: false,
  },
  {
    id: 'yesstyle',
    name: 'YesStyle',
    country: 'KR',
    currency: 'USD',
    typicalShippingJpy: 1500,
    freeShippingOverJpy: 7500,
    etaDays: [7, 15],
    dutyPaid: false,
  },
  {
    id: 'stylevana',
    name: 'STYLEVANA',
    country: 'KR',
    currency: 'USD',
    typicalShippingJpy: 1300,
    freeShippingOverJpy: 8000,
    etaDays: [8, 16],
    dutyPaid: false,
  },
  {
    id: 'iherb',
    name: 'iHerb',
    country: 'US',
    currency: 'USD',
    typicalShippingJpy: 1400,
    freeShippingOverJpy: 6000,
    etaDays: [5, 9],
    dutyPaid: false,
  },
  {
    id: 'sephora-us',
    name: 'Sephora US',
    country: 'US',
    currency: 'USD',
    typicalShippingJpy: 3200,
    etaDays: [7, 14],
    dutyPaid: false,
  },
  {
    id: 'qoo10',
    name: 'Qoo10',
    country: 'JP',
    currency: 'JPY',
    typicalShippingJpy: 0,
    etaDays: [3, 10],
    dutyPaid: true,
  },
  {
    id: 'rakuten',
    name: '楽天市場',
    country: 'JP',
    currency: 'JPY',
    typicalShippingJpy: 550,
    freeShippingOverJpy: 3980,
    etaDays: [1, 4],
    dutyPaid: true,
  },
  {
    id: 'amazon-jp',
    name: 'Amazon.co.jp',
    country: 'JP',
    currency: 'JPY',
    typicalShippingJpy: 410,
    freeShippingOverJpy: 2000,
    etaDays: [1, 3],
    dutyPaid: true,
  },
];

const BY_ID = new Map(SHOPS.map((s) => [s.id, s]));

export function getShop(id: string): Shop | undefined {
  return BY_ID.get(id);
}

/** 見つからないショップIDが混ざってもページを落とさないためのフォールバック。 */
export function getShopOrFallback(id: string): Shop {
  return (
    BY_ID.get(id) ?? {
      id,
      name: id,
      country: 'KR',
      currency: 'KRW',
      typicalShippingJpy: 2500,
      etaDays: [7, 14],
      dutyPaid: false,
    }
  );
}

export const COUNTRY_LABEL: Record<Shop['country'], string> = {
  KR: '韓国',
  US: 'アメリカ',
  JP: '日本国内',
};
