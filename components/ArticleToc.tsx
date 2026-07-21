'use client'

import { useEffect, useState } from 'react'
import type { TocItem } from '@/lib/content'

// 文章目录 + 滚动高亮(scroll spy)。
export function ArticleToc({ toc }: { toc: TocItem[] }) {
  const [active, setActive] = useState('')

  useEffect(() => {
    if (toc.length === 0) return
    const headings = toc.map((t) => document.getElementById(t.id)).filter((el): el is HTMLElement => !!el)
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-70px 0px -70% 0px', threshold: 0 }
    )
    headings.forEach((h) => obs.observe(h))
    return () => obs.disconnect()
  }, [toc])

  if (toc.length === 0) return null

  return (
    <nav aria-label="目录" style={{ position: 'sticky', top: 70, fontSize: 12.5, lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <div style={{ fontSize: 11, letterSpacing: '.14em', color: 'rgb(var(--inkrgb,233 226 208) / .75)', marginBottom: 8 }}>目录 · TOC</div>
      {toc.map((t) => {
        const on = active === t.id
        return (
          <a
            key={t.id}
            href={`#${t.id}`}
            style={{
              paddingLeft: t.depth === 3 ? 14 : 0,
              color: on ? 'var(--am,#e8b25a)' : 'rgb(var(--inkrgb,233 226 208) / .75)',
              borderLeft: `2px solid ${on ? 'var(--am,#e8b25a)' : 'transparent'}`,
              marginLeft: -2,
              paddingTop: 2,
              paddingBottom: 2,
              paddingRight: 4,
              transition: 'color .15s',
            }}
          >
            {t.depth === 3 ? '· ' : ''}
            {t.text}
          </a>
        )
      })}
    </nav>
  )
}
