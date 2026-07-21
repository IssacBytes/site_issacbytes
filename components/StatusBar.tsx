'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { prompt } from '@/site.config'
import { ThemeControls } from './ThemeControls'

// 粘性状态栏:左 ● 提示符 · 中 当前路径(窄屏隐藏)· 右 时钟 + 主题控件。
export function StatusBar() {
  const pathname = usePathname()
  const p = (pathname || '/').replace(/\/+$/, '')
  const cwd = p === '' ? '~/' : '~' + p
  const [time, setTime] = useState('--:--:--')

  useEffect(() => {
    const tick = () => {
      const d = new Date()
      const p = (n: number) => String(n).padStart(2, '0')
      setTime(`${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 10,
        background: 'var(--panel,#17150e)',
        borderBottom: '1px solid rgb(var(--amrgb,232 178 90) / .16)',
        padding: '8px 14px 8px 20px',
        fontSize: 12,
      }}
    >
      <span style={{ color: 'var(--am,#e8b25a)', whiteSpace: 'nowrap' }}>● {prompt}</span>
      <span className="sb-sub" style={{ color: 'rgb(var(--inkrgb,233 226 208) / .75)' }}>
        {cwd}
      </span>
      <span style={{ display: 'flex', gap: 7, alignItems: 'center', whiteSpace: 'nowrap' }}>
        <span className="sb-sub" style={{ color: 'rgb(var(--inkrgb,233 226 208) / .75)' }} suppressHydrationWarning>
          ◷ {time}
        </span>
        <ThemeControls />
      </span>
    </div>
  )
}
