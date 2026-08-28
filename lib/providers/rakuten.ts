import type { CategorySlug, Product, SearchQuery } from '../types';
import type { Provider } from './types';

const ENDPOINT = 'https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601';

interface RakutenItem {
  itemCode: string;
  itemName: string;
  itemPrice: number;
  itemUrl: string;
  affiliateUrl?: string;
  shopName: string;
  availability: number;
  reviewCount: number;
  mediumImageUrls?: { imageUrl: string }[];
}

interface RakutenResponse {
  Items?: { Item: RakutenItem }[];
}

/** 商品名の先頭に入りがちなブランド表記を拾う。取れなければ店舗名で代用する。 */
function guessBrand(itemName: string, shopName: string): string {
  const bracket = itemName.match(/^[【\[]([^】\]]{2,20})[】\]]/);
  if (bracket) return bracket[1];
  const first = itemName.split(/[\s　/]/)[0];
  return first.length >= 2 && first.length <= 20 ? first : shopName;
}

function guessCategory(itemName: string): CategorySlug {
  const rules: [RegExp, CategorySlug][] = [
    [/日焼け止め|サンスクリーン|サンクリーム|UVカット/, 'suncare'],
    [/シートマスク|パック|マスク|パッド/, 'mask-sheet'],
    [/ティント|リップ|クッション|ファンデ|アイシャドウ|チーク|マスカラ/, 'makeup'],
    [/シャンプー|トリートメント|ヘアオイル|헤어|頭皮/, 'haircare'],
    [/ボディ|ハンドクリーム|ボディクリーム/, 'bodycare'],
    [/香水|パルファム|フレグランス|オードトワレ/, 'fragrance'],
    [/美顔器|ヘアアイロン|ドライヤー|デバイス/, 'tools'],
    [/サプリ|コラーゲン|乳酸菌|ドリンク/, 'inner-beauty'],
  ];
  for (const [re, slug] of rules) if (re.test(itemName)) return slug;
  return 'skincare';
}

/**
 * 楽天市場商品検索API。RAKUTEN_APP_ID が設定されているときだけ有効になる。
 * アプリIDは https://webservice.rakuten.co.jp/ で無料取得できる。
 */
export const rakutenProvider: Provider = {
  id: 'rakuten',
  name: '楽天市場',
  isEnabled: () => Boolean(process.env.RAKUTEN_APP_ID),

  async search(query: SearchQuery): Promise<Product[]> {
    const appId = process.env.RAKUTEN_APP_ID;
    if (!appId) return [];

    const keyword = [query.q, query.brand, '韓国コスメ'].filter(Boolean).join(' ').slice(0, 128);
    const params = new URLSearchParams({
      applicationId: appId,
      keyword,
      hits: '20',
      imageFlag: '1',
      format: 'json',
    });
    if (process.env.RAKUTEN_AFFILIATE_ID) {
      params.set('affiliateId', process.env.RAKUTEN_AFFILIATE_ID);
    }

    const res = await fetch(`${ENDPOINT}?${params.toString()}`, { next: { revalidate: 900 } });
    if (!res.ok) throw new Error(`楽天APIがエラーを返しました: ${res.status}`);
    const json = (await res.json()) as RakutenResponse;

    return (json.Items ?? []).map(({ Item }) => {
      const brand = guessBrand(Item.itemName, Item.shopName);
      return {
        id: `rakuten-${Item.itemCode}`,
        name: Item.itemName,
        brand,
        brandCountry: 'KR',
        category: guessCategory(Item.itemName),
        tags: ['楽天市場'],
        description: `${Item.shopName} が出品している商品です。国内発送のため関税・消費税はかかりません。`,
        highlights: [],
        imageUrl: Item.mediumImageUrls?.[0]?.imageUrl,
        // レビュー数を人気度の代理指標として 0-100 に丸める
        popularity: Math.min(100, Math.round(Math.log10(Item.reviewCount + 1) * 25)),
        trendScore: 0,
        addedAt: new Date().toISOString().slice(0, 10),
        offers: [
          {
            shopId: 'rakuten',
            url: Item.affiliateUrl || Item.itemUrl,
            price: { amount: Item.itemPrice, currency: 'JPY' },
            inStock: Item.availability === 1,
            providerId: 'rakuten',
          },
        ],
      } satisfies Product;
    });
  },
};
