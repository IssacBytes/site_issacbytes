'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { prompt } from '@/site.config'

// 运行时错误边界。捕获客户端渲染/交互时抛出的异常,
// 显示同款终端风的「崩溃页」,可重试或回首页。
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // 生产可在此上报错误
    console.error(error)
  }, [error])

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: 'var(--bg,#0f0e0a)', color: 'var(--ink,#e9e2d0)' }}>
      <div className="scanlines" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />
      <div
        style={{
          position: 'relative',
          zIndex: 5,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          maxWidth: 720,
          margin: '0 auto',
          padding: '40px 28px',
        }}
      >
        <div className="prompt" style={{ marginBottom: 10 }}>
          {prompt}:~$ ./render.sh
        </div>
        <div style={{ fontSize: 14, color: 'var(--red,#e0674a)', marginBottom: 30 }}>
          zsh: segmentation fault (core dumped) —— 这一页渲染时出错了
        </div>
        <div
          style={{
            fontSize: 96,
            fontWeight: 700,
            lineHeight: 0.9,
            letterSpacing: '-.03em',
            color: 'var(--am,#e8b25a)',
            textShadow: '0 0 22px rgb(var(--amrgb,232 178 90) / .5)',
          }}
        >
          ERR
        </div>
        <div style={{ fontSize: 16, color: 'rgb(var(--inkrgb,233 226 208) / .75)', margin: '18px 0 8px' }}>
          出了点意外 —— 你没做错什么。可以重试,或回到 <span style={{ color: 'var(--am,#e8b25a)' }}>~</span>。
        </div>
        {error?.digest && (
          <div style={{ fontSize: 12, color: 'rgb(var(--inkrgb,233 226 208) / .75)', marginBottom: 20 }}>trace: {error.digest}</div>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: 13, marginTop: 14 }}>
          <button
            type="button"
            onClick={reset}
            style={{ cursor: 'pointer', border: 'none', background: 'var(--am,#e8b25a)', color: 'var(--bg,#0f0e0a)', fontWeight: 600, padding: '9px 18px' }}
          >
            ↻ 重试
          </button>
          <Link href="/" className="hb" style={{ border: '1px solid rgb(var(--inkrgb,233 226 208) / .25)', padding: '9px 18px', color: 'var(--ink,#e9e2d0)' }}>
            cd ~ &amp; 回首页
          </Link>
        </div>
      </div>
    </div>
  )
}
