/** ある日の、その商品の最安総額（送料・税込み）1点ぶん。 */
export interface HistoryPoint {
  /** YYYY-MM-DD */
  date: string;
  /** その日の最安総額（円） */
  totalJpy: number;
  /** その総額を出していたショップ */
  shopId: string;
}

export interface ProductHistory {
  productId: string;
  /** 日付の昇順。1日1点。 */
  points: HistoryPoint[];
}

/**
 * 価格履歴の保管先。
 *
 * 既定はリポジトリ同梱のJSON（data/price-history.json）で、GitHub Actions が
 * 毎日追記してコミットする。件数が増えたら、このインターフェースを実装した
 * DB版（Vercel Postgres / Turso など）に差し替えれば画面側の変更は不要。
 */
export interface HistoryStore {
  id: string;
  get(productId: string): Promise<ProductHistory | undefined>;
  getAll(): Promise<ProductHistory[]>;
}
