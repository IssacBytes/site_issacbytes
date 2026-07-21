import type { Metadata } from 'next'
import { prompt } from '@/site.config'
import { hasUses } from '@/content/uses'
import { Shell } from '@/components/Shell'
import { UsesDoc } from '@/components/UsesDoc'

export const metadata: Metadata = {
  title: '装备 · uses',
  description: '我日常用的软硬件与工具链,整页排成一份 uses.toml。抄走随意。',
}

export default function UsesPage() {
  return (
    <Shell active="/uses/" keybar={{ label: 'USES.TOML' }}>
      <div className="wrap" style={{ maxWidth: 1000, paddingBottom: 40 }}>
        <section style={{ padding: '38px 0 18px' }}>
          <div style={{ fontSize: 12, color: 'rgb(var(--inkrgb,233 226 208) / .75)', marginBottom: 8 }}>
            {prompt}:~$ bat ~/.config/uses.toml
          </div>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700, color: 'var(--am,#e8b25a)', textShadow: '0 0 18px rgb(var(--amrgb,232 178 90) / .35)' }}>
            装备 / USES
          </h1>
          <p style={{ margin: '10px 0 0', fontSize: 14, lineHeight: 1.7, color: 'rgb(var(--inkrgb,233 226 208) / .75)', maxWidth: 600 }}>
            我日常用的软硬件与工具链,整页排成一份 <span style={{ color: 'var(--am,#e8b25a)' }}>uses.toml</span>。
            <span style={{ color: 'rgb(var(--inkrgb,233 226 208) / .75)' }}> 点任意一行复制那条配置,或右上「复制整份」。抄走随意。</span>
          </p>
        </section>

        {hasUses ? (
          <UsesDoc />
        ) : (
          <div className="panel" style={{ padding: '28px 22px', fontSize: 14, color: 'rgb(var(--inkrgb,233 226 208) / .75)' }}>
            这份 uses.toml 还没填 —— 在 <span style={{ color: 'var(--am,#e8b25a)' }}>content/uses.ts</span> 里按模板加几行,页面和入口会自动出现。
          </div>
        )}
      </div>
    </Shell>
  )
}
