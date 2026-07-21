'use client'

import { useEffect, useRef, useState } from 'react'
import { buildSign } from '@/lib/dotmatrix'

// 点阵招牌。亮点用 var(--am),切主题自动跟随。
// 窄屏按容器宽度等比缩放(而非换行/降级为文字),保形、保基调、消除横向滚动。
export function DotSign({ text, dot = 9 }: { text: string; dot?: number }) {
  const { rows, gap } = buildSign(text, dot)
  const glow = Math.round(dot * 0.95)
  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [height, setHeight] = useState<number | undefined>(undefined)

  useEffect(() => {
    const outer = outerRef.current
    const inner = innerRef.current
    if (!outer || !inner) return
    const fit = () => {
      const avail = outer.clientWidth
      const needW = inner.scrollWidth
      const needH = inner.scrollHeight
      const s = avail > 0 && needW > avail ? avail / needW : 1
      setScale(s)
      setHeight(needH * s)
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(outer)
    return () => ro.disconnect()
  }, [rows, gap])

  return (
    <div ref={outerRef} style={{ overflow: 'hidden', width: '100%', height }}>
      <div
        ref={innerRef}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap,
          width: 'max-content',
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
        aria-label={text}
        role="img"
      >
        {rows.map((row, ri) => (
          <div key={ri} style={{ display: 'flex', gap }}>
            {row.map((lit, ci) => (
              <div
                key={ci}
                style={{
                  width: dot,
                  height: dot,
                  borderRadius: 1,
                  background: lit ? 'var(--am,#e8b25a)' : 'rgb(var(--amrgb,232 178 90) / .07)',
                  boxShadow: lit ? `0 0 ${glow}px var(--am,#e8b25a)` : 'none',
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
