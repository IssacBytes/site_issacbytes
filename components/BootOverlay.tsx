'use client'

import { useEffect, useState } from 'react'

// BIOS 开机动画:每个会话首访首页时逐行打印一次,之后淡出。
// 尊重 prefers-reduced-motion,并用 sessionStorage 保证不重复打扰。
export function BootOverlay({ lines }: { lines: string[] }) {
  const [n, setN] = useState(0)
  const [show, setShow] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    try {
      if (sessionStorage.getItem('phosphor-booted')) return
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        sessionStorage.setItem('phosphor-booted', '1')
        return
      }
    } catch {
      /* 隐私模式等 —— 直接跳过开机动画 */
      return
    }
    setShow(true)
    let i = 0
    const id = setInterval(() => {
      i += 1
      setN(i)
      if (i >= lines.length) {
        clearInterval(id)
        setTimeout(() => {
          setDone(true)
          try {
            sessionStorage.setItem('phosphor-booted', '1')
          } catch {
            /* ignore */
          }
        }, 900)
      }
    }, 400)
    return () => clearInterval(id)
  }, [lines.length])

  if (!show || done) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        background: 'var(--bg,#0f0e0a)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 28px',
        animation: 'kin .2s ease',
      }}
    >
      <div style={{ width: 'min(620px,92vw)' }}>
        <div style={{ fontSize: 12, color: 'rgb(var(--inkrgb,233 226 208) / .75)', marginBottom: 14 }}>
          BIOS · phosphor build v0.1 ————————————
        </div>
        <div style={{ fontSize: 14, lineHeight: 2.15, color: 'var(--am,#e8b25a)', textShadow: '0 0 12px var(--am,#e8b25a)' }}>
          {lines.slice(0, n).map((ln, i) => (
            <div key={i}>{ln}</div>
          ))}
          <span className="cur" />
        </div>
      </div>
    </div>
  )
}
