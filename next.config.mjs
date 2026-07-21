/** @type {import('next').NextConfig} */
const nextConfig = {
  // 纯静态导出:构建产物是 out/ 下的静态文件,
  // Cloudflare Pages / Vercel / Netlify / GitHub Pages / nginx 都能直接托管。
  output: 'export',
  // 每个路由导出为 目录/index.html,静态托管路径解析更稳。
  trailingSlash: true,
  // 静态导出不跑 Next 图片优化服务;本站不用 next/image,这里兜底。
  images: { unoptimized: true },
  reactStrictMode: true,
}

export default nextConfig
