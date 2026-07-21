import type { Lang } from '@/content/projects'
import { langColor } from '@/lib/langColors'

// 语言占比色条 + 图例。按语言名取 GitHub 官方配色,和仓库页一致。
export function LangBar({ langs, legend = true }: { langs: Lang[]; legend?: boolean }) {
  return (
    <div>
      <div style={{ display: 'flex', height: 8, overflow: 'hidden', background: 'rgb(var(--inkrgb,233 226 208) / .08)' }}>
        {langs.map((l) => (
          <div key={l.name} style={{ width: `${l.pct}%`, background: langColor(l.name) }} title={`${l.name} ${l.pct}%`} />
        ))}
      </div>
      {legend && (
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 8 }}>
          {langs.map((l) => (
            <span key={l.name} style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 11.5, color: 'rgb(var(--inkrgb,233 226 208) / .75)' }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: langColor(l.name), flex: 'none' }} />
              {l.name} {l.pct}%
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
