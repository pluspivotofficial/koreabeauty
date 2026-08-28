import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'KoreaBeauty ｜ 韓国・アメリカのコスメを送料と関税込みの総額で比較',
    template: '%s ｜ KoreaBeauty',
  },
  description:
    '韓国とアメリカで話題のコスメを、OLIVE YOUNG・YesStyle・Qoo10・楽天など複数ショップ横断で検索。国際送料と関税・消費税まで含めた「日本に届くまでの総額」で比較できます。',
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    siteName: 'KoreaBeauty',
  },
  robots: { index: true, follow: true },
  alternates: { types: { 'application/rss+xml': `${siteUrl}/feed.xml` } },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
        >
          本文へスキップ
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
