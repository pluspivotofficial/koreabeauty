/** 通知1件ぶんの中身。どの通知先でも共通に使う。 */
export interface PriceDropNotice {
  productId: string;
  productName: string;
  brand: string;
  shopName: string;
  /** 商品ページのURL（サイト内） */
  url: string;
  previousJpy: number;
  currentJpy: number;
  changePct: number;
  isAllTimeLow: boolean;
}

/**
 * 値下げの通知先。
 *
 * 必要な環境変数が無いものは isEnabled() が false を返し、送信対象から外れる
 * （データソースのプロバイダと同じ考え方）。
 */
export interface Notifier {
  id: string;
  name: string;
  isEnabled(): boolean;
  send(notices: PriceDropNotice[]): Promise<void>;
}
