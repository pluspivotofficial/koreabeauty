/** 通貨コード。本サイトが扱うのは韓国ウォン・米ドル・日本円の3種類。 */
export type Currency = 'KRW' | 'USD' | 'JPY';

/** 商品の発送元の国。関税・消費税の概算と配送日数の目安に使う。 */
export type Country = 'KR' | 'US' | 'JP';

/** カテゴリのスラッグ。lib/categories.ts の CATEGORIES と対応する。 */
export type CategorySlug =
  | 'skincare'
  | 'makeup'
  | 'mask-sheet'
  | 'suncare'
  | 'haircare'
  | 'bodycare'
  | 'fragrance'
  | 'tools'
  | 'inner-beauty';

export interface Money {
  amount: number;
  currency: Currency;
}

/** 商品を販売しているショップ（モール）1件ぶんの情報。 */
export interface Shop {
  id: string;
  /** 表示名（日本語） */
  name: string;
  /** 発送元 */
  country: Country;
  /** このショップの表示価格の通貨 */
  currency: Currency;
  /** 日本向けの標準的な国際送料の目安（円）。実額は購入時に要確認。 */
  typicalShippingJpy: number;
  /** 送料無料になる購入金額のしきい値（円）。無い場合は undefined。 */
  freeShippingOverJpy?: number;
  /** 配送日数の目安 */
  etaDays: [number, number];
  /** 日本の消費税・関税が販売時に徴収済み（国内発送 or DDP）なら true */
  dutyPaid: boolean;
}

/** ある商品を、あるショップが売っている「出品」1件。価格比較の最小単位。 */
export interface Offer {
  shopId: string;
  /** 商品ページへのURL（アフィリエイトIDが付く場合あり） */
  url: string;
  /** ショップ表示価格（ショップの通貨のまま保持し、表示時に換算する） */
  price: Money;
  /** 割引前価格。セール表示に使う。 */
  listPrice?: Money;
  /** 内容量など、同一商品でもショップごとに違う入り数の注記 */
  variantNote?: string;
  inStock: boolean;
  /** このオファーを取得したプロバイダのID */
  providerId: string;
}

/** 正規化された商品。複数ショップのオファーを束ねる。 */
export interface Product {
  id: string;
  /** 日本語の商品名 */
  name: string;
  /** 現地表記の商品名（検索の当たりを良くするため保持） */
  nameOriginal?: string;
  brand: string;
  brandCountry: Country;
  category: CategorySlug;
  /** 検索・絞り込み用のキーワード（肌悩み、成分、雰囲気など） */
  tags: string[];
  /** 日本語の紹介文 */
  description: string;
  /** 注目成分・特徴 */
  highlights: string[];
  /** 商品画像URL。未設定の場合はブランド名からプレースホルダを生成する。 */
  imageUrl?: string;
  /** 人気度スコア（0-100）。ランキングの並び順に使う。 */
  popularity: number;
  /** 直近の伸び。トレンドバッジの表示判定に使う（％）。 */
  trendScore: number;
  /** 発売・掲載開始日（ISO 8601） */
  addedAt: string;
  offers: Offer[];
}

/** 関税・消費税・送料まで含めた「日本に届くまでの総額」の内訳。 */
export interface LandedCost {
  /** 商品本体（円換算） */
  itemJpy: number;
  /** 国際送料（円） */
  shippingJpy: number;
  /** 課税価格（個人輸入は海外小売価格の60%） */
  dutiableValueJpy: number;
  /** 関税（円） */
  dutyJpy: number;
  /** 消費税＋地方消費税（円） */
  consumptionTaxJpy: number;
  /** 通関手数料（円） */
  clearanceFeeJpy: number;
  /** 合計（円） */
  totalJpy: number;
  /** 少額免税（課税価格1万円以下）が適用されたか */
  dutyFree: boolean;
  /** 画面に出す注記 */
  notes: string[];
}

/** 検索・絞り込みの条件。URLクエリと1対1で対応する。 */
export interface SearchQuery {
  q?: string;
  category?: CategorySlug;
  brand?: string;
  country?: Country;
  shopId?: string;
  /** 総額（円）の下限・上限 */
  minJpy?: number;
  maxJpy?: number;
  sort?: SortKey;
}

export type SortKey = 'popular' | 'trending' | 'price-asc' | 'price-desc' | 'newest';

/** 商品1件の検索結果。最安オファーとその総額を添えて返す。 */
export interface SearchHit {
  product: Product;
  /** 総額が最も安いオファー */
  bestOffer: Offer;
  bestShop: Shop;
  bestLandedCost: LandedCost;
  /** 最安と最高の総額の差（円）。「比較する価値」の指標。 */
  spreadJpy: number;
}

export interface SearchResult {
  hits: SearchHit[];
  total: number;
  /** 現在の絞り込み結果に含まれるブランド一覧（ファセット） */
  brands: { name: string; count: number }[];
  categories: { slug: CategorySlug; count: number }[];
}
