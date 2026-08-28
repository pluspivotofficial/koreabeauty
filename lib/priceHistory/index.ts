import { jsonHistoryStore } from './jsonStore';
import type { HistoryStore } from './types';

export type { HistoryPoint, HistoryStore, ProductHistory } from './types';

/**
 * 使用する価格履歴ストアを返す。
 * DBに移すときは、ここで環境変数を見て実装を切り替える。
 */
export function getHistoryStore(): HistoryStore {
  return jsonHistoryStore;
}
