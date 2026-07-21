'use client'

import Link from 'next/link'
import { useState } from 'react'
import { nav } from '@/site.config'
import { PALETTE_OPEN_EVENT } from './CommandPalette'

function openPalette() {
  window.dispatchEvent(new Event(PALETTE_OPEN_EVENT))
}

// logo(~/▮)+ 桌面导航 + 窄屏汉堡。active 为当前路径,高亮对应项。
export function Nav({ active }: { active?: string }) {
  const [open, setOpen] = useState(false)
  const isActive = (href: string) => active === href

  return (
    <>
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: 'var(--wrap)',
          margin: '0 auto',
          padding: '22px var(--pad) 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Link href="/" style={{ fontSize: 18, fontWeight: 700, color: 'var(--am,#e8b25a)' }}>
          ~/<span className="cur" style={{ height: '.8em', width: 8 }} />
        </Link>

        <nav className="nav-full" style={{ display: 'flex', gap: 6, fontSize: 12.5, alignItems: 'center' }}>
          {nav.map((item) =>
            isActive(item.href) ? (
              <span
                key={item.href}
                aria-current="page"
                style={{ color: 'var(--bg,#0f0e0a)', background: 'var(--am,#e8b25a)', padding: '5px 13px' }}
              >
                {item.label}
              </span>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="ha"
                style={{ color: 'rgb(var(--inkrgb,233 226 208) / .75)', padding: '5px 13px' }}
              >
                {item.label}
              </Link>
            )
          )}
          <button
            type="button"
            onClick={openPalette}
            className="hbg"
            style={{
              color: 'var(--am,#e8b25a)',
              border: '1px solid rgb(var(--amrgb,232 178 90) / .4)',
              background: 'transparent',
              padding: '5px 11px',
              marginLeft: 6,
              cursor: 'pointer',
              fontSize: 12.5,
            }}
          >
            ⌕ ⌘K
          </button>
        </nav>

        <div className="nav-burger" style={{ gap: 8, alignItems: 'center' }}>
          <button
            type="button"
            onClick={openPalette}
            aria-label="搜索"
            className="tap"
            style={{
              color: 'var(--am,#e8b25a)',
              border: '1px solid rgb(var(--amrgb,232 178 90) / .4)',
              background: 'transparent',
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            ⌕
          </button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="菜单"
            aria-expanded={open}
            className="tap"
            style={{
              color: 'var(--am,#e8b25a)',
              border: '1px solid rgb(var(--amrgb,232 178 90) / .4)',
              background: 'transparent',
              padding: '6px 13px',
              cursor: 'pointer',
              fontSize: 15,
              lineHeight: 1,
            }}
          >
            {open ? '✕' : '≡'}
          </button>
        </div>
      </div>

      {open && (
        <div style={{ position: 'relative', zIndex: 9, maxWidth: 'var(--wrap)', margin: '8px auto 0', padding: '0 var(--pad)' }}>
          <nav
            className="panel"
            style={{
              display: 'flex',
              flexDirection: 'column',
              fontSize: 14,
              boxShadow: '0 12px 30px rgba(0,0,0,.4)',
            }}
          >
            {nav.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="tap"
                style={{
                  color: isActive(item.href) ? 'var(--am,#e8b25a)' : 'rgb(var(--inkrgb,233 226 208) / .75)',
                  padding: '12px 16px',
                  borderBottom: i < nav.length - 1 ? '1px solid rgb(var(--amrgb,232 178 90) / .1)' : 'none',
                }}
              >
                › {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  )
}
