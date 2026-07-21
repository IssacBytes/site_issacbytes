import type { Metadata } from 'next'
import { prompt } from '@/site.config'
import { getEnrichedProjects } from '@/lib/content'
import { Shell } from '@/components/Shell'
import { ProjectsBrowser } from '@/components/ProjectsBrowser'

export const metadata: Metadata = {
  title: '项目',
  description: '全部个人项目索引 —— 按语言筛选、按 star 或更新排序。',
}

export default async function ProjectsPage() {
  const projects = await getEnrichedProjects()
  return (
    <Shell active="/projects/" keybar={{ label: 'PROJECTS' }}>
      <div className="wrap" style={{ paddingBottom: 40 }}>
        <section style={{ padding: '38px 0 22px' }}>
          <div style={{ fontSize: 12, color: 'rgb(var(--inkrgb,233 226 208) / .75)', marginBottom: 8 }}>
            {prompt}:~$ ls ~/projects
          </div>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700, color: 'var(--am,#e8b25a)', textShadow: '0 0 18px rgb(var(--amrgb,232 178 90) / .35)' }}>
            项目 / PROJECTS
          </h1>
          <p style={{ margin: '10px 0 0', fontSize: 14, lineHeight: 1.7, color: 'rgb(var(--inkrgb,233 226 208) / .75)' }}>
            共 {projects.length} 个个人仓库
          </p>
        </section>

        {projects.length === 0 ? (
          <div className="panel" style={{ padding: '28px 22px', fontSize: 14, color: 'rgb(var(--inkrgb,233 226 208) / .75)' }}>
            暂无项目 —— 在 <span style={{ color: 'var(--am,#e8b25a)' }}>content/projects.ts</span> 添加你的仓库。
          </div>
        ) : (
          <ProjectsBrowser projects={projects} />
        )}
      </div>
    </Shell>
  )
}
