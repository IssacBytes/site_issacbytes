'use client'

// 根布局级别的灾难性错误(极少发生)。此时主题脚本未运行,
// 用硬编码的夜间琥珀配色,保证任何情况下都有可读的兜底页。
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="zh-CN">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          background: '#0f0e0a',
          color: '#e9e2d0',
          fontFamily: "ui-monospace, 'JetBrains Mono', monospace",
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: 16,
          padding: '40px 28px',
          maxWidth: 720,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        <div style={{ fontSize: 13, color: '#e0674a' }}>kernel panic —— 站点根渲染失败</div>
        <div style={{ fontSize: 72, fontWeight: 700, color: '#e8b25a', textShadow: '0 0 22px rgba(232,178,90,.5)' }}>ERR</div>
        <div style={{ fontSize: 15, color: 'rgba(233,226,208,.62)' }}>请刷新重试;若持续出现,说明构建有问题。</div>
        <button
          type="button"
          onClick={reset}
          style={{ cursor: 'pointer', border: 'none', background: '#e8b25a', color: '#0f0e0a', fontWeight: 600, padding: '9px 18px', fontFamily: 'inherit' }}
        >
          ↻ 刷新
        </button>
      </body>
    </html>
  )
}
