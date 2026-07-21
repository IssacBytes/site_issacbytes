import Link from 'next/link'
import { prompt, site } from '@/site.config'
import { hasNow } from '@/content/now'
import { hasUses } from '@/content/uses'

const chip: React.CSSProperties = {
  border: '1px solid rgb(var(--amrgb,232 178 90) / .25)',
  padding: '3px 9px',
}

// 页脚链接行:左 署名,右 动态 / 装备 + 社交链接。
export function SiteFooter() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
        fontSize: 12,
        color: 'rgb(var(--inkrgb,233 226 208) / .75)',
      }}
    >
      <span>
        {prompt} · 用 Next.js 构建,静态部署
      </span>
      <span style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {hasNow && (
          <Link href="/now/" className="hb6 tap" style={chip}>
            动态
          </Link>
        )}
        {hasUses && (
          <Link href="/uses/" className="hb6 tap" style={chip}>
            装备
          </Link>
        )}
        {site.social.map((s) => (
          <a
            key={s.label}
            href={s.href}
            className="hb6 tap"
            style={chip}
            {...(s.href.startsWith('http') ? { target: '_blank', rel: 'me noopener' } : {})}
          >
            {s.short}
          </a>
        ))}
      </span>
    </div>
  )
}
