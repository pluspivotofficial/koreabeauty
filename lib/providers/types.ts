import type { Product, SearchQuery } from '../types';

/**
 * 商品データの取得元（プロバイダ）。
 *
 * 新しいショップやAPIを足すときは、このインターフェースを実装したファイルを
 * lib/providers/ に追加し、lib/providers/index.ts の PROVIDERS に登録する。
 * 認証情報が無いプロバイダは isEnabled() が false を返し、自動的に除外される。
 */
export interface Provider {
  id: string;
  /** 画面や出典表示に使う名前 */
  name: string;
  /** 必要な環境変数が揃っているか。false なら検索時に呼ばれない。 */
  isEnabled(): boolean;
  /**
   * 検索条件に合う商品を返す。
   * 外部APIの失敗でサイト全体を落とさないよう、実装側で例外を投げてもよい
   * （呼び出し側が握りつぶして他プロバイダの結果だけで応答する）。
   */
  search(query: SearchQuery): Promise<Product[]>;
}
