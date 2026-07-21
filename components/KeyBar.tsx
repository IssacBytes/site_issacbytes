import { site } from '@/site.config'

export interface KeyHint {
  k: string
  d: string
}

// less 风格的 keybinding 页脚条:琥珀实底黑字。
export function KeyBar({ label, hints }: { label: string; hints: KeyHint[] }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        background: 'var(--am,#e8b25a)',
        color: 'var(--bg,#0f0e0a)',
        padding: '6px 16px',
        fontSize: 11.5,
        fontWeight: 500,
        marginBottom: 16,
      }}
    >
      <span style={{ whiteSpace: 'nowrap' }}>-- {label} --</span>
      <span style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
        {hints.map((h) => (
          <span key={h.k + h.d} style={{ whiteSpace: 'nowrap' }}>
            <b style={{ fontWeight: 700 }}>{h.k}</b> {h.d}
          </span>
        ))}
      </span>
      <span style={{ whiteSpace: 'nowrap' }}>© {site.since}</span>
    </div>
  )
}
