// 内容层 —— 文章走 Markdown,项目走数据文件。
// 全部在构建期(Server Component / SSG)读取,静态导出无运行时依赖。
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeSlug from 'rehype-slug'
import rehypeAutolink from 'rehype-autolink-headings'
import rehypeHighlight from 'rehype-highlight'
import rehypeStringify from 'rehype-stringify'
import { projects as projectData, type Project } from '@/content/projects'
import { fetchRepoStats } from './github'

const ARTICLES_DIR = path.join(process.cwd(), 'content', 'articles')

export type Tag = '教程' | '随笔' | '项目'

export interface ArticleMeta {
  slug: string
  title: string
  /** ISO 日期,如 2026-06-26 */
  date: string
  tag: Tag
  summary: string
  draft: boolean
  /** ls -la 列表用的伪文件大小,如 4.2k */
  size: string
}

export interface TocItem {
  depth: 2 | 3
  id: string
  text: string
}

export interface Article extends ArticleMeta {
  html: string
  toc: TocItem[]
  minutes: number
  words: number
}

export type { Project }

// —— 文章 ——

function readArticleFiles(): { slug: string; raw: string }[] {
  if (!fs.existsSync(ARTICLES_DIR)) return []
  return fs
    .readdirSync(ARTICLES_DIR)
    .filter((f) => f.endsWith('.md') || f.endsWith('.mdx'))
    .map((f) => ({
      slug: f.replace(/\.mdx?$/, ''),
      raw: fs.readFileSync(path.join(ARTICLES_DIR, f), 'utf8'),
    }))
}

function toMeta(slug: string, raw: string): ArticleMeta {
  const { data, content } = matter(raw)
  const chars = content.replace(/\s+/g, '').length
  return {
    slug,
    title: String(data.title ?? slug),
    date: String(data.date ?? ''),
    tag: (['教程', '随笔', '项目'].includes(data.tag) ? data.tag : '随笔') as Tag,
    summary: String(data.summary ?? ''),
    draft: Boolean(data.draft),
    size: chars >= 1000 ? `${(chars / 1000).toFixed(1)}k` : `${chars}`,
  }
}

/** 全部已发布文章,按日期倒序。 */
export function getAllArticles(): ArticleMeta[] {
  return readArticleFiles()
    .map(({ slug, raw }) => toMeta(slug, raw))
    .filter((m) => !m.draft)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

/** 提取 hast 节点纯文本。 */
function textOf(node: any): string {
  if (node.type === 'text') return node.value
  if (Array.isArray(node.children)) return node.children.map(textOf).join('')
  return ''
}

/** 自定义 rehype 插件:收集 h2/h3 生成目录树。 */
function collectToc(bucket: TocItem[]) {
  const walk = (node: any) => {
    if (node.tagName === 'h2' || node.tagName === 'h3') {
      bucket.push({
        depth: node.tagName === 'h2' ? 2 : 3,
        id: String(node.properties?.id ?? ''),
        text: textOf(node),
      })
    }
    if (Array.isArray(node.children)) node.children.forEach(walk)
  }
  return (tree: any) => walk(tree)
}

export async function getArticle(slug: string): Promise<Article | null> {
  const file = ['md', 'mdx']
    .map((ext) => path.join(ARTICLES_DIR, `${slug}.${ext}`))
    .find((p) => fs.existsSync(p))
  if (!file) return null

  const raw = fs.readFileSync(file, 'utf8')
  const { content } = matter(raw)
  const meta = toMeta(slug, raw)
  const toc: TocItem[] = []

  const processed = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(() => collectToc(toc))
    .use(rehypeAutolink, { behavior: 'wrap', properties: { className: ['anchor'] } })
    .use(rehypeHighlight, { detect: true })
    .use(rehypeStringify)
    .process(content)

  const words = content.replace(/\s+/g, '').length
  return { ...meta, html: String(processed), toc, minutes: Math.max(1, Math.round(words / 350)), words }
}

/** 渲染一段独立 Markdown 为 HTML(用于项目 README 等,无目录收集)。 */
export async function renderMarkdown(md: string): Promise<string> {
  const processed = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeHighlight, { detect: true })
    .use(rehypeStringify)
    .process(md)
  return String(processed)
}

/** 上一篇 / 下一篇(按倒序列表相邻)。 */
export function getArticleSiblings(slug: string): { prev: ArticleMeta | null; next: ArticleMeta | null } {
  const all = getAllArticles()
  const i = all.findIndex((a) => a.slug === slug)
  if (i === -1) return { prev: null, next: null }
  return { prev: all[i + 1] ?? null, next: all[i - 1] ?? null }
}

// —— 项目 ——

export function getAllProjects(): Project[] {
  return projectData.filter((p) => !p.draft)
}

export function getProject(slug: string): Project | null {
  return getAllProjects().find((p) => p.slug === slug) ?? null
}

export function getProjectSiblings(slug: string): { prev: Project | null; next: Project | null } {
  const all = getAllProjects()
  const i = all.findIndex((p) => p.slug === slug)
  if (i === -1) return { prev: null, next: null }
  return { prev: all[i - 1] ?? null, next: all[i + 1] ?? null }
}

/** 项目 + 构建期解析出的真实 star/fork(取不到为 null),可安全传给客户端组件。 */
export type EnrichedProject = Project & { resolvedStars: number | null; resolvedForks: number | null }

async function enrich(p: Project): Promise<EnrichedProject> {
  const s = await fetchRepoStats(p.repo)
  return { ...p, resolvedStars: p.stars ?? s?.stars ?? null, resolvedForks: p.forks ?? s?.forks ?? null }
}

export async function getEnrichedProjects(): Promise<EnrichedProject[]> {
  return Promise.all(getAllProjects().map(enrich))
}

export async function getEnrichedProject(slug: string): Promise<EnrichedProject | null> {
  const p = getProject(slug)
  return p ? enrich(p) : null
}
