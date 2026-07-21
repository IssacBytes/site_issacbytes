'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export const PALETTE_OPEN_EVENT = 'phosphor-palette-open'

export interface PaletteItem {
  title: string
  href: string
  kind: string
}

function fuzzy(q: string, t: string): boolean {
  t = t.toLowerCase()
  if (t.includes(q)) return true
  let i = 0
  for (const ch of t) {
    if (ch === q[i]) i++
    if (i >= q.length) break
  }
  return i >= q.length
}

// ⌘K 命令面板:全局快捷键 / 自定义事件唤起,模糊搜索 + 键盘导航。
export function CommandPalette({ items }: { items: PaletteItem[] }) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const restoreFocusRef = useRef<HTMLElement | null>(null)
  const router = useRouter()

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return items
    return items.filter((it) => fuzzy(query, it.title))
  }, [q, items])

  const close = useCallback(() => {
    setOpen(false)
    setQ('')
    setSel(0)
  }, [])

  const go = useCallback(
    (href: string) => {
      close()
      router.push(href)
    },
    [close, router]
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault()
        setOpen((v) => !v)
      } else if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    const onOpen = () => setOpen(true)
    document.addEventListener('keydown', onKey)
    window.addEventListener(PALETTE_OPEN_EVENT, onOpen)
    return () => {
      document.removeEventListener('keydown', onKey)
      window.removeEventListener(PALETTE_OPEN_EVENT, onOpen)
    }
  }, [])

  useEffect(() => {
    if (open) {
      restoreFocusRef.current = document.activeElement as HTMLElement | null
      setSel(0)
      const t = setTimeout(() => inputRef.current?.focus(), 40)
      return () => clearTimeout(t)
    }
    // 关闭时把焦点还原到打开前的元素
    restoreFocusRef.current?.focus?.()
    restoreFocusRef.current = null
  }, [open])

  if (!open) return null

  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSel((s) => Math.min(s + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSel((s) => Math.max(s - 1, 0))
    } else if (e.key === 'Enter' && filtered[sel]) {
      e.preventDefault()
      go(filtered[sel].href)
    }
  }

  // 焦点圈定:Tab/Shift+Tab 在对话框内可聚焦元素间循环,不允许焦点逃逸到对话框外
  const onDialogKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return
    const root = dialogRef.current
    if (!root) return
    const focusables = Array.from(
      root.querySelectorAll<HTMLElement>('a[href], button, input, [tabindex]:not([tabindex="-1"])')
    ).filter((el) => !el.hasAttribute('disabled'))
    if (focusables.length === 0) return
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    const active = document.activeElement as HTMLElement | null
    if (e.shiftKey) {
      if (active === first || !root.contains(active)) {
        e.preventDefault()
        last.focus()
      }
    } else {
      if (active === last || !root.contains(active)) {
        e.preventDefault()
        first.focus()
      }
    }
  }

  return (
    <div
      onClick={close}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        background: 'rgba(8,7,4,.72)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
      }}
    >
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onDialogKeyDown}
        role="dialog"
        aria-modal="true"
        aria-label="命令面板"
        style={{
          width: 'min(600px,92vw)',
          background: 'var(--panel,#17150e)',
          border: '1px solid rgb(var(--amrgb,232 178 90) / .4)',
          boxShadow: '0 20px 60px rgba(0,0,0,.6)',
          animation: 'kin .16s ease',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '15px 18px',
            borderBottom: '1px solid rgb(var(--amrgb,232 178 90) / .16)',
          }}
        >
          <span style={{ color: 'var(--am,#e8b25a)' }}>❯</span>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onListKey}
            placeholder="搜索文章、跳转…"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--ink,#e9e2d0)',
              fontFamily: 'inherit',
              fontSize: 15,
              caretColor: 'var(--am,#e8b25a)',
            }}
          />
          <span style={{ fontSize: 11, color: 'rgb(var(--inkrgb,233 226 208) / .75)' }}>
            {filtered.length}/{items.length}
          </span>
        </div>

        <div style={{ padding: 8, maxHeight: '52vh', overflow: 'auto' }}>
          {filtered.map((it, i) => (
            <a
              key={it.href}
              href={it.href}
              onClick={(e) => {
                e.preventDefault()
                go(it.href)
              }}
              onMouseEnter={() => setSel(i)}
              className="tap"
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 12,
                padding: '10px 12px',
                fontSize: 14,
                background: i === sel ? 'rgb(var(--amrgb,232 178 90) / .1)' : 'transparent',
              }}
            >
              <span style={{ color: 'var(--am,#e8b25a)', width: 10 }}>{i === sel ? '❯' : ' '}</span>
              <span style={{ flex: 1, color: i === sel ? 'var(--ink,#e9e2d0)' : 'rgb(var(--inkrgb,233 226 208) / .75)' }}>
                {it.title}
              </span>
              <span style={{ fontSize: 11, color: 'var(--green,#79c98a)' }}>{it.kind}</span>
            </a>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: '16px 12px', fontSize: 13.5, color: 'var(--red,#e0674a)' }}>
              no matches —— 换个关键词?
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '10px 16px',
            borderTop: '1px solid rgb(var(--amrgb,232 178 90) / .16)',
            fontSize: 11,
            color: 'rgb(var(--inkrgb,233 226 208) / .75)',
          }}
        >
          <span>↑↓ 选择 · ↵ 打开</span>
          <span>esc 关闭</span>
        </div>
      </div>
    </div>
  )
}
