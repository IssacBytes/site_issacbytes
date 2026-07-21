import { site } from '@/site.config'
import { getAllArticles } from '@/lib/content'

// 静态导出:强制在构建期生成 /rss.xml
export const dynamic = 'force-static'

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function GET() {
  const articles = getAllArticles()
  const items = articles
    .map((a) => {
      const link = `${site.url}/writing/${a.slug}/`
      const pub = a.date ? new Date(a.date).toUTCString() : ''
      return `    <item>
      <title>${esc(a.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      ${pub ? `<pubDate>${pub}</pubDate>` : ''}
      <category>${esc(a.tag)}</category>
      <description>${esc(a.summary)}</description>
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(site.name)} · ${esc(site.role)}</title>
    <link>${site.url}</link>
    <atom:link href="${site.url}/rss.xml" rel="self" type="application/rss+xml" />
    <description>${esc(site.bio)}</description>
    <language>zh-CN</language>
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}
