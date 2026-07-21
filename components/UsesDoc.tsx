'use client'

import { usesConfig, usesSections, usesToText } from '@/content/uses'
import { site } from '@/site.config'
import { useToast } from './Toast'

const sid = (s: string) => `sec-${s}`

export function UsesDoc() {
  const toast = useToast()

  const copy = async (text: string, msg: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast(msg, 'ok')
    } catch {
      toast('复制失败 —— 浏览器拒绝了剪贴板访问', 'fail')
    }
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', fontSize: 12 }}>
          {usesSections.map((s) => (
            <a key={s} href={`#${sid(s)}`} className="chip">
              [{s}]
            </a>
          ))}
        </div>
        <button
          type="button"
          onClick={() => copy(usesToText(), '已复制整份 uses.toml')}
          className="hglow"
          style={{ cursor: 'pointer', fontSize: 12.5, color: 'var(--bg,#0f0e0a)', background: 'var(--am,#e8b25a)', border: 'none', padding: '6px 14px', fontWeight: 600, whiteSpace: 'nowrap' }}
        >
          ⧉ 复制整份
        </button>
      </div>

      <div className="panel" style={{ border: '1px solid rgb(var(--amrgb,232 178 90) / .2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', borderBottom: '1px solid rgb(var(--amrgb,232 178 90) / .12)', fontSize: 11.5, color: 'rgb(var(--inkrgb,233 226 208) / .75)' }}>
          <span>uses.toml</span>
          <span style={{ display: 'flex', gap: 16 }}>
            <span className="sb-sub">{usesConfig.length} 行</span>
            {/* alpha-ok: mac 窗口装饰点,纯图形非文本 */}
            <span style={{ letterSpacing: 2, color: 'rgb(var(--amrgb,232 178 90) / .4)' }}>● ● ●</span>
          </span>
        </div>

        <div style={{ padding: '14px 0', fontSize: 13.5, lineHeight: 1.9 }}>
          {usesConfig.map((l, i) => (
            <div
              key={i}
              id={l.kind === 'section' ? sid(l.text) : undefined}
              style={{ display: 'grid', gridTemplateColumns: '44px 1fr', gap: 14, padding: '1px 16px 1px 0', scrollMarginTop: 80 }}
            >
              {/* alpha-ok: 行号导航辅助,非核心内容 */}
              <span style={{ textAlign: 'right', color: 'rgb(var(--inkrgb,233 226 208) / .22)', userSelect: 'none', borderRight: '1px solid rgb(var(--amrgb,232 178 90) / .1)' }}>
                {i + 1}
              </span>
              <span style={{ minWidth: 0 }}>
                {l.kind === 'section' && <span style={{ color: 'var(--am,#e8b25a)', fontWeight: 600 }}>[{l.text}]</span>}
                {l.kind === 'comment' && (
                  <span style={{ color: 'rgb(var(--inkrgb,233 226 208) / .75)' }}>
                    <span style={{ color: 'var(--green,#79c98a)' }}>#</span> {l.text}
                  </span>
                )}
                {l.kind === 'blank' && <span>&nbsp;</span>}
                {l.kind === 'kv' && (
                  <span
                    onClick={() => copy(`${l.k} = "${l.v}"`, `已复制 ${l.k} = "${l.v}"`)}
                    title="点击复制这行"
                    className="hrow"
                    style={{ cursor: 'pointer', display: 'flex', gap: 8, alignItems: 'baseline', padding: '1px 8px', marginLeft: -8 }}
                  >
                    <span style={{ color: 'var(--green,#79c98a)', flex: 'none' }}>{l.k}</span>
                    {/* alpha-ok: 键值分隔符,两侧内容均已合规 */}
                    <span style={{ color: 'rgb(var(--inkrgb,233 226 208) / .3)', flex: 'none' }}>=</span>
                    <span style={{ color: 'rgb(var(--inkrgb,233 226 208) / .85)' }}>&quot;{l.v}&quot;</span>
                    {/* alpha-ok: 复制图标字形,非文本内容 */}
                    <span className="sb-sub" style={{ marginLeft: 'auto', color: 'rgb(var(--inkrgb,233 226 208) / .22)', fontSize: 11, flex: 'none' }}>
                      ⧉
                    </span>
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>

        <div style={{ padding: '14px 16px', borderTop: '1px solid rgb(var(--amrgb,232 178 90) / .14)', fontSize: 12.5, color: 'rgb(var(--inkrgb,233 226 208) / .75)' }}>
          <span style={{ color: 'var(--green,#79c98a)' }}># </span>
          遇到好工具欢迎来信 ——{' '}
          <a href={`mailto:${site.email}`} className="hu" style={{ color: 'var(--am,#e8b25a)' }}>
            {site.email}
          </a>{' '}
          <span className="cur" style={{ width: 8, height: '.9em' }} />
        </div>
      </div>
    </>
  )
}
