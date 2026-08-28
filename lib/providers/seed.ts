import raw from '../../data/products.json';
import type { Product } from '../types';
import type { Provider } from './types';

/**
 * リポジトリに同梱した商品カタログ。認証情報なしで常に動く土台。
 * 商品の追加は scripts/seed-source.mjs を編集して再生成する。
 */
const PRODUCTS = raw as unknown as Product[];

export const seedProvider: Provider = {
  id: 'seed',
  name: '編集部キュレーション',
  isEnabled: () => true,
  async search() {
    // 絞り込みは lib/search.ts 側で一括して行うため、ここでは全件返す。
    return PRODUCTS;
  },
};

export function allSeedProducts(): Product[] {
  return PRODUCTS;
}
