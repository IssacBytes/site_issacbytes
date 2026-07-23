// 保留 slug 校验:`__empty__` 是 postbuild.mjs 用来清理的哨兵目录名
// (见 app/writing/[slug]/page.tsx、app/projects/[slug]/page.tsx 的
// generateStaticParams 空态占位,以及 scripts/postbuild.mjs 的删除逻辑)。
//
// 若真实文章 / 项目使用了这个 slug,会在 postbuild 阶段被当作哨兵目录
// 静默删除,导致该内容的页面产物丢失且没有任何报错。这里在构建早期
// (npm run build 自动触发的 prebuild 钩子)提前校验并阻断,把「静默删除」
// 变成「响亮失败」。

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const RESERVED_SLUG = '__empty__'

const siteRoot = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..')
const articlesDir = path.join(siteRoot, 'content', 'articles')

const violations = []

// 文章:slug 取自文件名(去扩展名),见 lib/content.ts readArticleFiles()
if (fs.existsSync(articlesDir)) {
  for (const f of fs.readdirSync(articlesDir)) {
    if (!f.endsWith('.md') && !f.endsWith('.mdx')) continue
    const slug = f.replace(/\.mdx?$/, '')
    if (slug === RESERVED_SLUG) {
      violations.push(`content/articles/${f} → slug "${RESERVED_SLUG}" 是保留字（postbuild 哨兵目录名）`)
    }
  }
}

// 项目:slug 取自 content/projects.ts 数据数组。
// 该文件是带类型标注的 .ts,不用 dynamic import(需要 TS loader),
// 改用逐行文本扫描提取 `slug: '...'`,并跳过注释行(含示例模板)。
const projectsFile = path.join(siteRoot, 'content', 'projects.ts')
if (fs.existsSync(projectsFile)) {
  const raw = fs.readFileSync(projectsFile, 'utf8')
  const lines = raw.split('\n')
  const slugLineRe = /slug:\s*['"]([^'"]+)['"]/
  lines.forEach((line, i) => {
    const trimmed = line.trim()
    if (trimmed.startsWith('//')) return
    const m = trimmed.match(slugLineRe)
    if (m && m[1] === RESERVED_SLUG) {
      violations.push(`content/projects.ts:${i + 1} → slug "${RESERVED_SLUG}" 是保留字（postbuild 哨兵目录名）`)
    }
  })
}

if (violations.length > 0) {
  console.error('[check-reserved-slugs] 发现使用了保留 slug 的内容，构建已中止：')
  for (const v of violations) console.error(`  - ${v}`)
  console.error(`\n请将上述内容改用其它 slug（"${RESERVED_SLUG}" 被 scripts/postbuild.mjs 用作空态哨兵目录名，同名内容会被误删）。`)
  process.exit(1)
}

console.log('[check-reserved-slugs] 通过：未发现使用保留 slug 的文章 / 项目。')
