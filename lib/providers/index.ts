import type { Product, SearchQuery } from '../types';
import { rakutenProvider } from './rakuten';
import { seedProvider } from './seed';
import type { Provider } from './types';

export type { Provider } from './types';

/**
 * 有効なプロバイダの一覧。
 * ここに追加するだけで横断検索の対象が増える。
 */
export const PROVIDERS: Provider[] = [seedProvider, rakutenProvider];

export function enabledProviders(): Provider[] {
  return PROVIDERS.filter((p) => p.isEnabled());
}

/** 商品の同一性を判定するためのキー。表記ゆれを落として比較する。 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[【】\[\]（）()｜|/／,、。・]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const STOP_TOKENS = new Set(['韓国コスメ', '正規品', '送料無料', 'メール便', '公式', 'セット']);

function tokens(text: string): string[] {
  return normalize(text)
    .split(' ')
    .filter((t) => t.length >= 2 && !STOP_TOKENS.has(t));
}

/**
 * 別プロバイダの商品が既存商品と同一かどうかを判定する。
 * ブランドが一致し、商品名のトークンが2つ以上重なれば同一とみなす。
 * 誤結合を避けるため、条件はあえて厳しめにしている。
 */
function isSameProduct(a: Product, b: Product): boolean {
  if (normalize(a.brand) !== normalize(b.brand)) return false;
  const bt = new Set(tokens(b.name));
  const overlap = tokens(a.name).filter((t) => bt.has(t)).length;
  return overlap >= 2;
}

/**
 * 複数プロバイダの結果を1つのカタログにまとめる。
 * 同一商品と判定できたものはオファーを束ね、そうでなければ別商品として並べる。
 * 1つのプロバイダが落ちても、残りの結果で応答する。
 */
export async function aggregate(query: SearchQuery): Promise<{ products: Product[]; failed: string[] }> {
  const providers = enabledProviders();
  const settled = await Promise.allSettled(providers.map((p) => p.search(query)));

  const merged: Product[] = [];
  const failed: string[] = [];

  settled.forEach((result, i) => {
    if (result.status === 'rejected') {
      failed.push(providers[i].name);
      return;
    }
    for (const incoming of result.value) {
      const existing = merged.find((m) => isSameProduct(m, incoming));
      if (existing) {
        for (const offer of incoming.offers) {
          if (!existing.offers.some((o) => o.url === offer.url)) existing.offers.push(offer);
        }
      } else {
        merged.push({ ...incoming, offers: [...incoming.offers] });
      }
    }
  });

  return { products: merged, failed };
}
