import type { Metadata, Viewport } from 'next'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import '@fontsource/jetbrains-mono/600.css'
import '@fontsource/jetbrains-mono/700.css'
import './globals.css'
import { site } from '@/site.config'
import { themeInitScript } from '@/lib/theme'
import { Providers } from '@/components/Providers'
import { Analytics } from '@/components/Analytics'

// 通过 @fontsource/jetbrains-mono 把字体文件随 npm 包一起装进 node_modules,
// 构建产物里直接自带静态字体文件 —— 构建期与运行时都不再访问 Google Fonts。
// 中文与部分符号字体本身不含,浏览器逐字回退到 ui-monospace(与原型一致)。

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.name,
    template: `%s · ${site.name}`,
  },
  description: site.bio || `${site.name} · 个人站`,
  authors: [{ name: site.name, url: site.url }],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: site.url,
    siteName: site.name,
    title: site.name,
    description: site.bio || `${site.name} · 个人站`,
  },
  twitter: {
    card: 'summary_large_image',
    title: site.name,
    description: site.bio || `${site.name} · 个人站`,
  },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
}

export const viewport: Viewport = {
  themeColor: '#0f0e0a',
  colorScheme: 'dark light',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        {/* 首帧前读 localStorage 把主题变量挂上 <html>,消除 FOUC */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript() }} />
        <Analytics />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
