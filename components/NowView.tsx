'use client'

import { useEffect, useState } from 'react'
import type { NowData } from '@/content/now'
import { mmdd } from '@/lib/format'

function hhmmss(secs: number): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(Math.floor(secs / 3600))}:${p(Math.floor((secs % 3600) / 60))}:${p(secs % 60)}`
}

export function NowView({ data }: { data: NowData }) {
  const [secs, setSecs] = useState(0)
  const [quipI, setQuipI] = useState(0)

  useEffect(() => {
    const t0 = Date.now()
    const id = setInterval(() => setSecs(Math.floor((Date.now() - t0) / 1000)), 1000)
    return () => clearInterval(id)
  }, [])

  const reroll = () => setQuipI((i) => (i + 1 + Math.floor(Math.random() * (data.quips.length - 1))) % data.quips.length)

  const card: React.CSSProperties = { border: '1px solid rgb(var(--amrgb,232 178 90) / .16)', background: 'var(--panel,#17150e)', padding: '20px 22px' }
  const secTitle: React.CSSProperties = { fontSize: 12, color: 'var(--green,#79c98a)', letterSpacing: '.12em', marginBottom: 16 }

  return (
    <>
      {/* 状态 + session uptime */}
      <div
        className="panel"
        style={{ border: '1px solid rgb(var(--amrgb,232 178 90) / .2)', padding: '16px 18px', marginBottom: 24, fontSize: 13, display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px 24px', alignItems: 'center' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {data.updated && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
              <span style={{ color: 'var(--green,#79c98a)', flex: 'none' }}>[ ok ]</span>
              <span style={{ color: 'rgb(var(--inkrgb,233 226 208) / .8)' }}>
                更新于 <span style={{ color: 'var(--am,#e8b25a)' }}>{data.updated.replace(/-/g, '.')}</span>
              </span>
            </div>
          )}
          {data.status.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
              <span style={{ color: s.kind === 'warn' ? 'var(--am,#e8b25a)' : 'var(--green,#79c98a)', flex: 'none' }}>
                {s.kind === 'warn' ? '[warn]' : '[ ok ]'}
              </span>
              <span style={{ color: 'rgb(var(--inkrgb,233 226 208) / .8)' }}>{s.text}</span>
            </div>
          ))}
        </div>
        <div className="sb-sub" style={{ textAlign: 'right', borderLeft: '1px solid rgb(var(--amrgb,232 178 90) / .14)', paddingLeft: 24 }}>
          <div style={{ fontSize: 11, color: 'rgb(var(--inkrgb,233 226 208) / .75)', marginBottom: 4 }}>session uptime</div>
          <div suppressHydrationWarning style={{ fontSize: 26, fontWeight: 700, color: 'var(--am,#e8b25a)', textShadow: '0 0 14px rgb(var(--amrgb,232 178 90) / .4)', fontVariantNumeric: 'tabular-nums' }}>
            {hhmmss(secs)}
          </div>
        </div>
      </div>

      {/* 正在做 / 在读在学 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 14 }}>
        <div style={card}>
          <div style={secTitle}>▸ 正在做 · WORKING ON</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontSize: 13 }}>
            {data.working.map((w) => (
              <div key={w.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 }}>
                  <span style={{ color: 'rgb(var(--inkrgb,233 226 208) / .85)' }}>
                    <span style={{ color: 'var(--am,#e8b25a)' }}>{w.name}</span> — {w.note}
                  </span>
                  <span style={{ color: 'rgb(var(--inkrgb,233 226 208) / .75)', fontSize: 11.5 }}>{w.pct}%</span>
                </div>
                <div style={{ height: 6, background: 'rgb(var(--amrgb,232 178 90) / .12)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${w.pct}%`, background: 'var(--am,#e8b25a)', boxShadow: '0 0 8px var(--am,#e8b25a)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={card}>
          <div style={secTitle}>▸ 在读 · READING</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11, fontSize: 13 }}>
            {data.reading.map((r) => (
              <div key={r.t} style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
                <span style={{ color: 'var(--am,#e8b25a)', flex: 'none' }}>›</span>
                <span style={{ color: 'rgb(var(--inkrgb,233 226 208) / .82)' }}>
                  {r.t} <span style={{ color: 'rgb(var(--inkrgb,233 226 208) / .75)' }}>— {r.who}</span>
                </span>
              </div>
            ))}
          </div>
          <div style={{ ...secTitle, margin: '22px 0 16px' }}>▸ 在学 · LEARNING</div>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', fontSize: 12 }}>
            {data.learning.map((t) => (
              <span key={t} style={{ border: '1px solid rgb(var(--amrgb,232 178 90) / .3)', color: 'rgb(var(--inkrgb,233 226 208) / .75)', padding: '3px 10px' }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* now playing marquee */}
      <div className="panel" style={{ marginTop: 14, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 22, flex: 'none' }}>
            {[0, 0.3, 0.15, 0.45].map((d, i) => (
              <span key={i} style={{ width: 3, background: 'var(--am,#e8b25a)', animation: `eq .9s ease-in-out ${d}s infinite` }} />
            ))}
          </div>
          <span style={{ fontSize: 12, color: 'rgb(var(--inkrgb,233 226 208) / .75)', flex: 'none' }}>now playing</span>
          <div style={{ overflow: 'hidden', flex: 1, minWidth: 0 }}>
            <div style={{ display: 'inline-flex', whiteSpace: 'nowrap', fontSize: 13, color: 'var(--am,#e8b25a)', animation: 'mq 22s linear infinite' }}>
              {[...data.nowPlaying, ...data.nowPlaying].map((s, i) => (
                <span key={i} style={{ padding: '0 22px' }}>
                  ♪ {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 碎念 */}
      <div className="panel" style={{ marginTop: 14, padding: '20px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={secTitle}>▸ 碎念 · echo $STATUS</div>
          <button
            type="button"
            onClick={reroll}
            className="ha hb"
            style={{ cursor: 'pointer', fontSize: 11.5, color: 'rgb(var(--inkrgb,233 226 208) / .75)', background: 'transparent', border: '1px solid rgb(var(--amrgb,232 178 90) / .25)', padding: '3px 10px' }}
          >
            ↻ 换一条
          </button>
        </div>
        <div style={{ fontSize: 14.5, lineHeight: 1.7, color: 'rgb(var(--inkrgb,233 226 208) / .82)' }}>
          <span style={{ color: 'var(--green,#79c98a)' }}>$</span> {data.quips[quipI]}
          <span className="cur" style={{ width: 8, height: '1em', marginLeft: 4 }} />
        </div>
      </div>
    </>
  )
}
