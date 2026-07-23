// 构建后处理:清除 __empty__ 哨兵产物,确保静态托管对这些 URL 真正回落 404。
//
// generateStaticParams 在文章/项目为空时会产出哨兵 slug `__empty__`(见
// app/writing/[slug]/page.tsx、app/projects/[slug]/page.tsx),否则 `output:'export'`
// 会因动态段零静态路径而构建失败。哨兵页面本身用 notFound() 渲染 404 文案,
// 但 next export 仍会把它写成 out/**/__empty__/index.html —— 静态服务器对已存在的
// 文件一律返回 200,导致这两个 URL 显示 404 文案却是 200 状态码。
//
// 这里在构建产物生成后,把哨兵目录整个删掉。目录一旦不存在,静态托管
// (Cloudflare Pages / Vercel / Netlify / GitHub Pages / nginx 等)对该路径的
// 请求都会落到 out/404.html,返回真实的 404 状态码。
// 若当下有真实文章/项目,哨兵 slug 根本不会被生成,这一步是安全的空操作。

import { existsSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const siteRoot = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..')
const outDir = path.join(siteRoot, 'out')

// __empty__ 为保留字:真实文章 / 项目不得使用此 slug,否则会被下面当作
// 哨兵目录静默删除。该约束由 scripts/check-reserved-slugs.mjs 在 prebuild
// 阶段提前校验并阻断构建,这里仅删除确认无害的哨兵目录本身。
const sentinelDirs = [
  path.join(outDir, 'writing', '__empty__'),
  path.join(outDir, 'projects', '__empty__'),
]

for (const dir of sentinelDirs) {
  if (existsSync(dir)) {
    rmSync(dir, { recursive: true, force: true })
    console.log(`[postbuild] 已删除哨兵产物目录: ${path.relative(siteRoot, dir)}`)
  }
}

const notFoundPage = path.join(outDir, '404.html')
if (!existsSync(notFoundPage)) {
  console.error('[postbuild] 致命:out/404.html 不存在,静态托管无法为已删除的哨兵路径回落 404。')
  process.exit(1)
}

console.log('[postbuild] out/404.html 存在,哨兵路径将由静态托管正确回落为 404。')
