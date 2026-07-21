'use client'

import { useEffect, useRef } from 'react'
import { giscus, hasGiscus } from '@/content/comments'
import { THEME_EVENT, readTheme } from '@/lib/theme'
import { prompt } from '@/site.config'

const GISCUS_LIGHT = 'light'
const GISCUS_DARK = 'transparent_dark'

function giscusTheme(): string {
  return readTheme().mode === '日间' ? GISCUS_LIGHT : GISCUS_DARK
}

/**
 * 基于 giscus 官方 <script> 嵌入方式(不引入 @giscus/react 依赖)。
 * 未配置 repo/repoId/categoryId 时整树不渲染 —— 契合全站「有内容才显示」约定。
 */
export function Giscus() {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!hasGiscus) return
    const host = hostRef.current
    if (!host) return

    const script = document.createElement('script')
    script.src = 'https://giscus.app/client.js'
    script.async = true
    script.crossOrigin = 'anonymous'
    script.setAttribute('data-repo', giscus.repo)
    script.setAttribute('data-repo-id', giscus.repoId)
    script.setAttribute('data-category', giscus.category)
    script.setAttribute('data-category-id', giscus.categoryId)
    script.setAttribute('data-mapping', giscus.mapping)
    script.setAttribute('data-reactions-enabled', giscus.reactionsEnabled ? '1' : '0')
    script.setAttribute('data-input-position', 'top')
    script.setAttribute('data-theme', giscusTheme())
    script.setAttribute('data-lang', giscus.lang)
    host.appendChild(script)

    // 主题切换时向 giscus iframe 同步(夜间→dark、日间→light,先忽略荧光色差异)
    const syncTheme = () => {
      const iframe = host.querySelector<HTMLIFrameElement>('iframe.giscus-frame')
      iframe?.contentWindow?.postMessage({ giscus: { setConfig: { theme: giscusTheme() } } }, 'https://giscus.app')
    }
    window.addEventListener(THEME_EVENT, syncTheme)

    return () => {
      window.removeEventListener(THEME_EVENT, syncTheme)
      host.innerHTML = ''
    }
  }, [])

  if (!hasGiscus) return null

  return (
    <section style={{ padding: '48px 0 0' }}>
      <div className="prompt" style={{ marginBottom: 14 }}>
        {prompt}:~$ ./comments.sh
      </div>
      <div ref={hostRef} />
    </section>
  )
}
