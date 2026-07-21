import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { site } from '@/site.config'
import { getAllProjects, getEnrichedProject, getProjectSiblings, renderMarkdown } from '@/lib/content'
import { Shell } from '@/components/Shell'
import { ProjectView } from '@/components/ProjectView'

export function generateStaticParams() {
  const all = getAllProjects().map((p) => ({ slug: p.slug }))
  // output:'export' 要求动态段至少产出一个静态路径;项目清空时用哨兵 slug 占位,
  // 该 slug 不会匹配任何真实项目,下方 getEnrichedProject 找不到会走 notFound()。
  return all.length > 0 ? all : [{ slug: '__empty__' }]
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const p = getAllProjects().find((x) => x.slug === slug)
  if (!p) return { title: '项目未找到' }
  return {
    title: `${p.name} · 项目`,
    description: p.desc,
    openGraph: { title: p.name, description: p.desc, url: `${site.url}/projects/${slug}/` },
  }
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = await getEnrichedProject(slug)
  if (!project) notFound()

  const readmeHtml = project.readme ? await renderMarkdown(project.readme) : '<p style="opacity:.55">暂无 README。</p>'
  const { prev, next } = getProjectSiblings(slug)

  return (
    <Shell active="/projects/" keybar={{ label: 'REPO' }}>
      <ProjectView
        project={project}
        readmeHtml={readmeHtml}
        prev={prev ? { slug: prev.slug, name: prev.name } : null}
        next={next ? { slug: next.slug, name: next.name } : null}
      />
    </Shell>
  )
}
