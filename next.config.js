/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // API 路由重導向設定
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'development' 
          ? 'http://localhost:5000/api/:path*'  // 開發環境：轉發到 Express 伺服器
          : '/api/:path*',                      // 生產環境：使用 Vercel API 路由
      },
    ]
  },
  
  // 環境變數設定
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // 圖片優化設定
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // 頁面擴展名
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  
  // 靜態檔案設定
  trailingSlash: false,
  
  // 壓縮設定
  compress: true,
  
  // 產生 source map (開發時)
  productionBrowserSourceMaps: false,
  
  // ESLint 設定
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // TypeScript 設定
  typescript: {
    ignoreBuildErrors: false,
  },
}

module.exports = nextConfig