import type { Metadata } from 'next'
import { prompt } from '@/site.config'
import { getAllArticles } from '@/lib/content'
import { Shell } from '@/components/Shell'
import { WritingList } from '@/components/WritingList'

export const metadata: Metadata = {
  title: '写作',
  description: '全部文章索引 —— 教程、随笔、项目笔记,按年份归档。',
}

export default function WritingPage() {
  const articles = getAllArticles()
  return (
    <Shell active="/writing/" keybar={{ label: 'WRITING' }}>
      <div className="wrap" style={{ maxWidth: 1000, paddingBottom: 40 }}>
        <section style={{ padding: '38px 0 22px' }}>
          <div style={{ fontSize: 12, color: 'rgb(var(--inkrgb,233 226 208) / .75)', marginBottom: 8 }}>
            {prompt}:~$ ls -la ~/writing
          </div>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700, color: 'var(--am,#e8b25a)', textShadow: '0 0 18px rgb(var(--amrgb,232 178 90) / .35)' }}>
            写作 / WRITING
          </h1>
          <p style={{ margin: '10px 0 0', fontSize: 14, lineHeight: 1.7, color: 'rgb(var(--inkrgb,233 226 208) / .75)' }}>
            共 {articles.length} 篇 · 教程 / 随笔 / 项目笔记。
          </p>
        </section>

        <WritingList articles={articles} />
      </div>
    </Shell>
  )
}
