import type { Metadata } from 'next'
import { prompt } from '@/site.config'
import { now, hasNow } from '@/content/now'
import { Shell } from '@/components/Shell'
import { NowView } from '@/components/NowView'

export const metadata: Metadata = {
  title: '现在 · now',
  description: '这一阵在忙什么、在读在学在听什么 —— 受 nownownow.com 启发的近况快照。',
}

export default function NowPage() {
  return (
    <Shell active="/now/" keybar={{ label: 'NOW' }}>
      <div className="wrap" style={{ maxWidth: 1000, paddingBottom: 40 }}>
        <section style={{ padding: '38px 0 18px' }}>
          <div style={{ fontSize: 12, color: 'rgb(var(--inkrgb,233 226 208) / .75)', marginBottom: 8 }}>
            {prompt}:~$ cat ~/.now
          </div>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700, color: 'var(--am,#e8b25a)', textShadow: '0 0 18px rgb(var(--amrgb,232 178 90) / .35)' }}>
            现在 / NOW
          </h1>
          <p style={{ margin: '10px 0 0', fontSize: 14, lineHeight: 1.7, color: 'rgb(var(--inkrgb,233 226 208) / .75)', maxWidth: 600 }}>
            这一阵在忙什么、在读在学在听什么。
            <span style={{ color: 'rgb(var(--inkrgb,233 226 208) / .75)' }}>
              {' '}受 <span style={{ color: 'var(--am,#e8b25a)' }}>nownownow.com</span> 启发的「近况快照」,不是博客,会经常过期。
            </span>
          </p>
        </section>

        {hasNow ? (
          <NowView data={now} />
        ) : (
          <div className="panel" style={{ padding: '28px 22px', fontSize: 14, color: 'rgb(var(--inkrgb,233 226 208) / .75)' }}>
            近况还没填 —— 在 <span style={{ color: 'var(--am,#e8b25a)' }}>content/now.ts</span> 里填上正在做/在读/在学等,页面和入口会自动出现。
          </div>
        )}
      </div>
    </Shell>
  )
}
