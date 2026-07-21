import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { site, prompt } from '@/site.config'
import { getAllArticles, getArticle, getArticleSiblings } from '@/lib/content'
import { mmdd, tagBadgeClass } from '@/lib/format'
import { Shell } from '@/components/Shell'
import { ReadingProgress } from '@/components/ReadingProgress'
import { ArticleToc } from '@/components/ArticleToc'
import { Giscus } from '@/components/Giscus'

export function generateStaticParams() {
  const all = getAllArticles().map((a) => ({ slug: a.slug }))
  // output:'export' 要求动态段至少产出一个静态路径;文章清空时用哨兵 slug 占位,
  // 该 slug 不会匹配任何真实文章,下方 getArticle 找不到会走 notFound()。
  return all.length > 0 ? all : [{ slug: '__empty__' }]
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const a = await getArticle(slug)
  if (!a) return { title: '文章未找到' }
  return {
    title: a.title,
    description: a.summary,
    openGraph: { title: a.title, description: a.summary, type: 'article', url: `${site.url}/writing/${slug}/` },
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) notFound()

  const { prev, next } = getArticleSiblings(slug)

  return (
    <Shell active="/writing/" keybar={{ label: 'READING' }}>
      <ReadingProgress />
      <div className="wrap" style={{ maxWidth: 1000, paddingBottom: 40 }}>
        {/* header */}
        <section style={{ padding: '38px 0 6px' }}>
          <Link href="/writing/" className="ha" style={{ fontSize: 12.5, color: 'rgb(var(--inkrgb,233 226 208) / .75)' }}>
            {prompt}:~$ cd ~/writing
          </Link>
          <h1 style={{ margin: '18px 0 0', fontSize: 'clamp(24px,3.4vw,34px)', fontWeight: 700, lineHeight: 1.2, letterSpacing: '-.01em', color: 'var(--ink,#e9e2d0)' }}>
            {article.title}
          </h1>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginTop: 14, fontSize: 12.5, color: 'rgb(var(--inkrgb,233 226 208) / .75)' }}>
            <span>{mmdd(article.date)}</span>
            <span className={`badge ${tagBadgeClass(article.tag)}`}>{article.tag}</span>
            <span>◷ {article.minutes} 分钟</span>
            <span>{article.words} 字</span>
          </div>
        </section>

        <div className="article-grid" style={{ paddingTop: 28 }}>
          <article className="prose" dangerouslySetInnerHTML={{ __html: article.html }} />
          <aside className="article-aside">
            <ArticleToc toc={article.toc} />
          </aside>
        </div>

        {/* prev / next */}
        <nav style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 14, marginTop: 48 }}>
          {prev ? (
            <Link href={`/writing/${prev.slug}/`} className="panel hb" style={{ padding: '16px 18px', display: 'block' }}>
              <div style={{ fontSize: 11.5, color: 'rgb(var(--inkrgb,233 226 208) / .75)', marginBottom: 6 }}>← 上一篇</div>
              <div style={{ fontSize: 14, color: 'var(--am,#e8b25a)' }}>{prev.title}</div>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/writing/${next.slug}/`} className="panel hb" style={{ padding: '16px 18px', display: 'block', textAlign: 'right' }}>
              <div style={{ fontSize: 11.5, color: 'rgb(var(--inkrgb,233 226 208) / .75)', marginBottom: 6 }}>下一篇 →</div>
              <div style={{ fontSize: 14, color: 'var(--am,#e8b25a)' }}>{next.title}</div>
            </Link>
          ) : (
            <span />
          )}
        </nav>

        <Giscus />
      </div>
    </Shell>
  )
}
