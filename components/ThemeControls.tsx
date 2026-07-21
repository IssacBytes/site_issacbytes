'use client'

import { useTheme } from './ThemeProvider'

// 状态栏右上角:荧光色点(点击循环 琥珀→荧绿→冷白)+ 昼夜切换。
// 首帧前用默认值渲染以避免水合不一致,mounted 后再显示真实主题。
export function ThemeControls() {
  const { theme, mounted, toggleMode, cyclePhosphor } = useTheme()
  const day = theme.mode === '日间'

  const box: React.CSSProperties = {
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    border: '1px solid rgb(var(--amrgb,232 178 90) / .3)',
    background: 'transparent',
    color: 'inherit',
    padding: '2px 8px',
    fontSize: 12,
    lineHeight: 1.6,
  }

  return (
    <span style={{ display: 'flex', gap: 7, alignItems: 'center', whiteSpace: 'nowrap' }}>
      <button
        type="button"
        onClick={cyclePhosphor}
        title="切换荧光色 (琥珀 / 荧绿 / 冷白)"
        aria-label="切换荧光色"
        className="hbg tap"
        style={box}
      >
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: '50%',
            background: 'var(--am,#e8b25a)',
            boxShadow: '0 0 6px var(--am,#e8b25a)',
          }}
        />
        <span suppressHydrationWarning style={{ color: 'rgb(var(--inkrgb,233 226 208) / .75)' }}>
          {mounted ? theme.phosphor : '琥珀'}
        </span>
      </button>
      <button
        type="button"
        onClick={toggleMode}
        title="切换日间 / 夜间"
        aria-label="切换日间夜间"
        className="hbg tap"
        style={{ ...box, color: 'var(--am,#e8b25a)', padding: '2px 9px' }}
        suppressHydrationWarning
      >
        {mounted ? (day ? '☀ 昼' : '☾ 夜') : '☾ 夜'}
      </button>
    </span>
  )
}
