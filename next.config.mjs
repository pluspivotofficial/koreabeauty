/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // 各ショップの商品画像を将来的に表示する際に許可するホスト。
    // 追加時は必ず各サイトの利用規約・画像利用条件を確認すること。
    remotePatterns: [
      { protocol: 'https', hostname: '**.oliveyoung.co.kr' },
      { protocol: 'https', hostname: '**.qoo10.jp' },
      { protocol: 'https', hostname: '**.rakuten.co.jp' },
      { protocol: 'https', hostname: '**.yesstyle.com' },
      { protocol: 'https', hostname: '**.iherb.com' },
    ],
  },
};

export default nextConfig;
