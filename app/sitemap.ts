import type { MetadataRoute } from 'next';
import { CATEGORIES } from '@/lib/categories';
import { seedProductIds } from '@/lib/search';

const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: base, lastModified: now, priority: 1 },
    { url: `${base}/ranking`, lastModified: now, priority: 0.9 },
    { url: `${base}/sale`, lastModified: now, priority: 0.9 },
    { url: `${base}/guide/import`, lastModified: now, priority: 0.7 },
    { url: `${base}/about`, lastModified: now, priority: 0.3 },
    ...CATEGORIES.map((c) => ({ url: `${base}/category/${c.slug}`, lastModified: now, priority: 0.8 })),
    ...seedProductIds().map((id) => ({ url: `${base}/item/${id}`, lastModified: now, priority: 0.6 })),
  ];
}
