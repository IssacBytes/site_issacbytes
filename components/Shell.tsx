import { nav } from '@/site.config'
import { getAllArticles, getAllProjects } from '@/lib/content'
import { hasUses } from '@/content/uses'
import { hasNow } from '@/content/now'
import { Scanlines } from './Scanlines'
import { StatusBar } from './StatusBar'
import { Nav } from './Nav'
import { KeyBar, type KeyHint } from './KeyBar'
import { SiteFooter } from './SiteFooter'
import { CommandPalette, type PaletteItem } from './CommandPalette'

const DEFAULT_HINTS: KeyHint[] = [{ k: '⌘K', d: '搜索' }]

// 构建期收集命令面板索引:导航 + 内部页 + 文章 + 项目。
function buildPaletteItems(): PaletteItem[] {
  return [
    ...nav.map((n) => ({ title: n.label, href: n.href, kind: '跳转' })),
    ...(hasUses ? [{ title: '装备', href: '/uses/', kind: '跳转' }] : []),
    ...(hasNow ? [{ title: '动态', href: '/now/', kind: '跳转' }] : []),
    ...getAllArticles().map((a) => ({ title: a.title, href: `/writing/${a.slug}/`, kind: a.tag })),
    ...getAllProjects().map((p) => ({ title: p.name, href: `/projects/${p.slug}/`, kind: '项目' })),
  ]
}

interface ShellProps {
  active?: string
  keybar?: { label: string; hints?: KeyHint[] }
  children: React.ReactNode
}

// 全站统一骨架:扫描线 → 状态栏 → 导航 → 内容 → keybinding 条 → 页脚 → ⌘K。
export function Shell({ active, keybar, children }: ShellProps) {
  const items = buildPaletteItems()
  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <Scanlines />
      <StatusBar />
      <Nav active={active} />

      <main id="main">{children}</main>

      <footer className="wrap" style={{ padding: '34px var(--pad) 40px' }}>
        <KeyBar label={keybar?.label ?? 'NORMAL'} hints={keybar?.hints ?? DEFAULT_HINTS} />
        <SiteFooter />
      </footer>

      <CommandPalette items={items} />
    </div>
  )
}
