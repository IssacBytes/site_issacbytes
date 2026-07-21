'use client'

import { useEffect, useState } from 'react'

// 顶部阅读进度条,随滚动填充。
export function ReadingProgress() {
  const [pct, setPct] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement
      const max = h.scrollHeight - h.clientHeight
      setPct(max > 0 ? Math.min(1, h.scrollTop / max) : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 2, zIndex: 50, background: 'transparent', pointerEvents: 'none' }} aria-hidden="true">
      <div
        className="rp-bar"
        style={{
          height: '100%',
          width: '100%',
          transform: `scaleX(${pct})`,
          transformOrigin: 'left',
          background: 'var(--am,#e8b25a)',
          boxShadow: '0 0 10px var(--am,#e8b25a)',
        }}
      />
    </div>
  )
}
