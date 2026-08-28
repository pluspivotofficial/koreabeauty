/**
 * 商品名がブランド名で始まっていれば、その部分を落とす。
 *
 * カタログでは「COSRX アドバンスド スネイル…」のように商品名にブランドが
 * 入っていることが多く、ブランド名と並べると二重に見えるため。
 * 「VT Cosmetics」対「VT リードルショット」のような表記ゆれに対応するため、
 * 先頭の単語だけでも一致を見る。
 */
export function stripBrand(name: string, brand: string): string {
  for (const prefix of [brand, brand.split(' ')[0]]) {
    if (prefix.length >= 2 && name.startsWith(prefix)) return name.slice(prefix.length).trimStart();
  }
  return name;
}

/** 「ブランド名 + 商品名」を重複なく1行にする。通知やRSSのタイトル用。 */
export function fullTitle(name: string, brand: string): string {
  const rest = stripBrand(name, brand);
  return rest ? `${brand} ${rest}` : brand;
}
