import raw from '../../data/price-history.json';
import type { HistoryStore, ProductHistory } from './types';

const HISTORIES = raw as unknown as ProductHistory[];
const BY_ID = new Map(HISTORIES.map((h) => [h.productId, h]));

/** リポジトリ同梱のJSONを読むだけの実装。認証情報も外部サービスも要らない。 */
export const jsonHistoryStore: HistoryStore = {
  id: 'json',
  async get(productId) {
    return BY_ID.get(productId);
  },
  async getAll() {
    return HISTORIES;
  },
};
