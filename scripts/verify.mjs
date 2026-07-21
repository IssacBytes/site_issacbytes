// 统一回归脚本:tsc → build(含 postbuild)→ lint → 起本地静态服务器对 out/ 做断言。
// 任何一步失败都会以非零退出码结束,可直接接入 CI/发布门禁。
//
// 断言覆盖(对应整改项 1/4):
//   a) 哨兵 URL(/writing/__empty__/、/projects/__empty__/)在最终静态产物里
//      必须返回真实 404(而不是 200 里塞 404 文案)。
//   b) 抽样真实页面返回 200。
//   c) 当前 giscus / GoatCounter 均为空配置,所有页面 HTML 里不得有相关脚本/域名残留。

import { spawn, spawnSync } from 'node:child_process'
import { createServer } from 'node:http'
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const siteRoot = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..')
const outDir = path.join(siteRoot, 'out')

const failures = []
const record = (label, ok, detail = '') => {
  const line = `${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? '  — ' + detail : ''}`
  console.log(line)
  if (!ok) failures.push(line)
}

function run(label, cmd, args) {
  console.log(`\n$ ${cmd} ${args.join(' ')}`)
  const res = spawnSync(cmd, args, { cwd: siteRoot, stdio: 'inherit', shell: false })
  record(label, res.status === 0, res.status === null ? '进程异常终止' : `exit ${res.status}`)
  if (res.status !== 0) {
    printSummaryAndExit()
  }
}

function printSummaryAndExit() {
  console.log('\n===== verify 汇总 =====')
  if (failures.length === 0) {
    console.log('全部通过。')
    process.exit(0)
  }
  console.log(`${failures.length} 项失败：`)
  for (const f of failures) console.log('  - ' + f)
  process.exit(1)
}

// 0. 对比度纯函数断言（整改项 3：WCAG AA）
//    颜色值复制自 lib/theme.ts computeVars() 的 A1 压暗值，与该文件保持同步。
//    正文级文本要求 ≥4.5:1，装饰/大字场景要求 ≥3:1。
function hexToRgb(hex) {
  const h = hex.replace('#', '')
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16))
}
function relLuminance([r, g, b]) {
  const lin = (c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  const [rl, gl, bl] = [lin(r), lin(g), lin(b)]
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl
}
function contrastRatio(hexA, hexB) {
  const l1 = relLuminance(hexToRgb(hexA))
  const l2 = relLuminance(hexToRgb(hexB))
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1]
  return (hi + 0.05) / (lo + 0.05)
}

// am（--am）按当前可选的三种荧光色分别列出（对应 lib/theme.ts HUE 表）；
// red（--red）、green（--green）为独立语义变量；ink（--ink）两模式通用。
// green 承载 prompt/标签/hash 值等信息文本（见 lib/theme.ts 注释与调用点排查），非纯装饰，
// 日间已按 WCAG AA 压暗（#3f7a4e → #346641），夜间原值已达标不动。
const THEME_COLORS = {
  day: {
    bg: '#e9e1cf',
    panel: '#f3ecda',
    ink: '#2a2419',
    red: '#a63c24',
    green: '#346641',
    am: { 琥珀: '#7a5310', 荧绿: '#256b3a', 冷白: '#4a4638' },
  },
  night: {
    bg: '#0f0e0a',
    panel: '#17150e',
    ink: '#e9e2d0',
    red: '#e0674a',
    green: '#79c98a',
    am: { 琥珀: '#e8b25a', 荧绿: '#7dd88f', 冷白: '#e9e2d0' },
  },
}
for (const mode of ['day', 'night']) {
  const { bg, panel, ink, red, green, am } = THEME_COLORS[mode]
  const bgTargets = mode === 'day' ? [['bg', bg], ['panel', panel]] : [['bg', bg]]
  for (const [label, fg] of [['ink', ink], ['red', red], ['green', green]]) {
    for (const [bgLabel, bgHex] of bgTargets) {
      const ratio = contrastRatio(fg, bgHex)
      record(`对比度 ${mode}/${label} on ${bgLabel} ≥4.5:1`, ratio >= 4.5, `实测 ${ratio.toFixed(2)}:1`)
    }
  }
  for (const [phosphor, fg] of Object.entries(am)) {
    for (const [bgLabel, bgHex] of bgTargets) {
      const ratio = contrastRatio(fg, bgHex)
      record(`对比度 ${mode}/am(${phosphor}) on ${bgLabel} ≥4.5:1`, ratio >= 4.5, `实测 ${ratio.toFixed(2)}:1`)
    }
  }
}

// 1. 类型检查
run('tsc --noEmit', 'npx', ['tsc', '--noEmit'])

// 2. 构建(build 脚本内部已串联 postbuild）
run('npm run build', 'npm', ['run', 'build'])

// 3. lint（非交互）
run('npm run lint', 'npx', ['next', 'lint'])

// 4. 起本地静态服务器，对 out/ 做真实状态码 + 内容断言
if (!existsSync(outDir)) {
  record('out/ 目录存在', false, 'build 后未找到 out/')
  printSummaryAndExit()
}

function listHtmlFiles(dir) {
  const results = []
  for (const entry of readdirSync(dir)) {
    const p = path.join(dir, entry)
    const st = statSync(p)
    if (st.isDirectory()) {
      results.push(...listHtmlFiles(p))
    } else if (entry.endsWith('.html')) {
      results.push(p)
    }
  }
  return results
}

// 极简静态服务器：文件存在则 200，否则用 out/404.html 内容返回 404 状态码
// （模拟 Cloudflare Pages / Netlify / GitHub Pages 等静态托管对不存在路径的标准回落行为）
function createStaticServer() {
  const notFoundHtml = readFileSync(path.join(outDir, '404.html'))
  return createServer((req, res) => {
    let urlPath = decodeURIComponent(req.url.split('?')[0])
    if (urlPath.endsWith('/')) urlPath += 'index.html'
    let filePath = path.join(outDir, urlPath)
    if (!filePath.startsWith(outDir)) {
      res.writeHead(400)
      res.end()
      return
    }
    if (existsSync(filePath) && statSync(filePath).isFile()) {
      res.writeHead(200)
      res.end(readFileSync(filePath))
    } else {
      res.writeHead(404)
      res.end(notFoundHtml)
    }
  })
}

async function main() {
  const http = await import('node:http')
  const server = createStaticServer()
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const port = server.address().port
  const base = `http://127.0.0.1:${port}`

  function get(urlPath) {
    return new Promise((resolve, reject) => {
      http.get(base + urlPath, (res) => {
        const chunks = []
        res.on('data', (c) => chunks.push(c))
        res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString('utf8') }))
      }).on('error', reject)
    })
  }

  // a) 哨兵 URL 必须真实 404
  for (const sentinelPath of ['/writing/__empty__/', '/projects/__empty__/']) {
    const { status } = await get(sentinelPath)
    record(`哨兵 URL 真实 404: ${sentinelPath}`, status === 404, `实际状态码 ${status}`)
  }

  // b) 抽样真实页面 200
  const samplePaths = ['/', '/writing/', '/projects/', '/about/', '/uses/', '/now/']
  for (const p of samplePaths) {
    if (!existsSync(path.join(outDir, p.replace(/^\//, ''), 'index.html')) && p !== '/') continue
    const { status } = await get(p)
    record(`真实页面 200: ${p}`, status === 200, `实际状态码 ${status}`)
  }
  // 抽样项目/文章详情页（若存在）
  for (const rel of ['projects', 'writing']) {
    const dir = path.join(outDir, rel)
    if (!existsSync(dir)) continue
    const slugs = readdirSync(dir).filter((e) => statSync(path.join(dir, e)).isDirectory() && e !== '__empty__')
    if (slugs[0]) {
      const p = `/${rel}/${slugs[0]}/`
      const { status } = await get(p)
      record(`真实详情页 200: ${p}`, status === 200, `实际状态码 ${status}`)
    }
  }

  // c) 空配置下全部 HTML 无 giscus/goatcounter 残留
  const htmlFiles = listHtmlFiles(outDir)
  const leakPatterns = [/giscus\.app/i, /goatcounter\.com/i, /gc\.zgo\.at/i]
  let leakCount = 0
  for (const file of htmlFiles) {
    const content = readFileSync(file, 'utf8')
    for (const pattern of leakPatterns) {
      if (pattern.test(content)) {
        leakCount++
        console.log(`  残留命中: ${pattern} in ${path.relative(outDir, file)}`)
      }
    }
  }
  record('空配置下全部 HTML 无 giscus/goatcounter 残留', leakCount === 0, `${htmlFiles.length} 个 HTML 文件，命中 ${leakCount} 处`)

  // d) 语义地标 / ARIA 结构（整改项 3）：首页含 <main、<footer；项目详情页含 tablist/tab/aria-selected
  const homeHtml = readFileSync(path.join(outDir, 'index.html'), 'utf8')
  record('首页含 <main 地标', /<main[\s>]/.test(homeHtml))
  record('首页含 <footer 地标', /<footer[\s>]/.test(homeHtml))

  const projectsDir = path.join(outDir, 'projects')
  if (existsSync(projectsDir)) {
    const slug = readdirSync(projectsDir).find((e) => statSync(path.join(projectsDir, e)).isDirectory() && e !== '__empty__')
    if (slug) {
      const detailHtml = readFileSync(path.join(projectsDir, slug, 'index.html'), 'utf8')
      record('项目详情页含 role="tablist"', detailHtml.includes('role="tablist"'))
      record('项目详情页含 role="tab"', detailHtml.includes('role="tab"'))
      record('项目详情页含 aria-selected', detailHtml.includes('aria-selected'))
    }
  }

  // e) 全局 CSS 产物含 :focus-visible 规则
  const cssDir = path.join(outDir, '_next', 'static', 'css')
  let cssHasFocusVisible = false
  if (existsSync(cssDir)) {
    for (const f of readdirSync(cssDir)) {
      if (f.endsWith('.css') && readFileSync(path.join(cssDir, f), 'utf8').includes(':focus-visible')) {
        cssHasFocusVisible = true
        break
      }
    }
  }
  record('构建产物 CSS 含 :focus-visible 规则', cssHasFocusVisible)

  // f) alpha 门禁（防回潮，整改项 3 全仓库排查后收口）：扫描 app/、components/、lib/ 下
  //    所有 .tsx/.ts/.css 文件，凡 `color:` 属性取值为 rgb(var(--ink|am|green|redrgb,...) / α)
  //    形式的，α 须 ≥.75（accent 色文本 α 无论多高都难过日间荧光色 4.5:1 门槛，本规则同样拦截，
  //    需改为实心色或 --ink α.75）；只匹配 `color:` 取值，不匹配 border/background/boxShadow/
  //    textShadow 等非文本用途。装饰性/非信息文本可在同行或上一行加 `alpha-ok` 注释豁免。
  const alphaGateDirs = ['app', 'components', 'lib'].map((d) => path.join(siteRoot, d))
  const alphaLeaks = []
  let alphaScannedFiles = 0
  let alphaWhitelisted = 0
  const colorAlphaRe = /(?<![-\w])color:\s*'?rgb\(var\(--(ink|am|green|red)rgb[^)]*\)\s*\/\s*([\d.]+)\)'?/g
  function scanAlphaDir(dir) {
    for (const entry of readdirSync(dir)) {
      const p = path.join(dir, entry)
      const st = statSync(p)
      if (st.isDirectory()) {
        scanAlphaDir(p)
      } else if (entry.endsWith('.tsx') || entry.endsWith('.ts') || entry.endsWith('.css')) {
        alphaScannedFiles++
        const lines = readFileSync(p, 'utf8').split('\n')
        lines.forEach((line, idx) => {
          const re = new RegExp(colorAlphaRe)
          let m
          while ((m = re.exec(line))) {
            const alphaMatch = /\.(\d+)\)/.exec(m[0])
            if (!alphaMatch) continue
            const alphaVal = Number('0.' + alphaMatch[1])
            const whitelisted = line.includes('alpha-ok') || (idx > 0 && lines[idx - 1].includes('alpha-ok'))
            if (alphaVal < 0.75) {
              if (whitelisted) {
                alphaWhitelisted++
              } else {
                alphaLeaks.push(`${path.relative(siteRoot, p)}:${idx + 1} α=${alphaVal}`)
              }
            }
          }
        })
      }
    }
  }
  for (const d of alphaGateDirs) {
    if (existsSync(d)) scanAlphaDir(d)
  }
  record(
    `alpha 门禁：app/components/lib 全仓库 color: 信息文本 α≥.75（扫描 ${alphaScannedFiles} 文件，豁免 ${alphaWhitelisted} 处装饰性用法）`,
    alphaLeaks.length === 0,
    alphaLeaks.length ? `${alphaLeaks.length} 处：${alphaLeaks.slice(0, 8).join('; ')}` : ''
  )

  server.close()
  printSummaryAndExit()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
