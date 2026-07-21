import type { MetadataRoute } from 'next'
import { site } from '@/site.config'
import { getAllArticles, getAllProjects } from '@/lib/content'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ['/', '/writing/', '/projects/', '/about/', '/uses/', '/now/']
  const articles = getAllArticles().map((a) => `/writing/${a.slug}/`)
  const projects = getAllProjects().map((p) => `/projects/${p.slug}/`)
  return [...paths, ...articles, ...projects].map((p) => ({
    url: `${site.url}${p}`,
    changeFrequency: 'weekly',
    priority: p === '/' ? 1 : 0.7,
  }))
}
