import type { MetadataRoute } from 'next';

const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // 絞り込みの組み合わせで無限にURLが増えるため、検索結果はクロールさせない
      disallow: ['/search', '/api/'],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
