import type { Metadata } from 'next'
import { site, prompt } from '@/site.config'
import { about, hasNeofetch, hasBio, hasTimeline } from '@/content/about'
import { hasGiscus, giscusDiscussionsUrl } from '@/content/comments'
import { Shell } from '@/components/Shell'

export const metadata: Metadata = {
  title: '我的',
  description: site.bio || `${site.name} —— ${site.role}`,
}

const pad = (s: string) => s + ' '.repeat(Math.max(0, 15 - [...s].length))
const ASCII = ` ┌──────────────────┐
 │  ${pad(prompt)} │
 │  ┌────────────┐  │
 │  │  ❯ _       │  │
 │  └────────────┘  │
 │  ${pad(`</> since ${site.since}`)} │
 └──────────────────┘`

const swatch = (bg: string) => ({ width: 24, height: 15, background: bg })

export default function AboutPage() {
  return (
    <Shell active="/about/" keybar={{ label: 'ABOUT' }}>
      <div className="wrap" style={{ paddingBottom: 40 }}>
        {/* NEOFETCH */}
        <section style={{ padding: '44px 0 8px' }}>
          <div className="prompt" style={{ marginBottom: 24 }}>
            {prompt}:~$ neofetch
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(270px,1fr))', gap: '34px 46px', alignItems: 'center' }}>
            <div
              className="panel"
              style={{ border: '1px solid rgb(var(--amrgb,232 178 90) / .2)', boxShadow: 'inset 0 0 60px rgb(var(--amrgb,232 178 90) / .06)', padding: '26px 24px', display: 'flex', justifyContent: 'center' }}
            >
              <pre style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: 'var(--am,#e8b25a)', textShadow: '0 0 12px rgb(var(--amrgb,232 178 90) / .5)' }}>{ASCII}</pre>
            </div>
            <div style={{ fontSize: 13.5, lineHeight: 1.7 }}>
              <div style={{ color: 'var(--am,#e8b25a)', fontWeight: 600, fontSize: 16 }}>
                {site.name}
                {/* alpha-ok: 装饰性连接符 */}
                <span style={{ color: 'rgb(var(--inkrgb,233 226 208) / .4)' }}>@</span>
                {site.host}
              </div>
              {/* alpha-ok: 纯装饰分隔线 */}
              <div style={{ color: 'rgb(var(--amrgb,232 178 90) / .4)', margin: '3px 0 14px', letterSpacing: 1 }}>──────────────────────────</div>
              {hasNeofetch && (
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 18px' }}>
                  {about.neofetch.map(([k, v]) => (
                    <span key={k} style={{ display: 'contents' }}>
                      <span style={{ color: 'var(--green,#79c98a)' }}>{k}</span>
                      <span>{v}</span>
                    </span>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: 5, marginTop: 18, flexWrap: 'wrap' }}>
                <span style={swatch('var(--bg,#0f0e0a)')} />
                <span style={swatch('rgb(var(--amrgb,232 178 90) / .3)')} />
                <span style={swatch('rgb(var(--amrgb,232 178 90) / .55)')} />
                <span style={swatch('var(--am,#e8b25a)')} />
                <span style={swatch('rgb(var(--greenrgb,121 201 138) / .5)')} />
                <span style={swatch('var(--green,#79c98a)')} />
                <span style={swatch('rgb(var(--inkrgb,233 226 208) / .55)')} />
                <span style={swatch('var(--ink,#e9e2d0)')} />
              </div>
            </div>
          </div>
        </section>

        {/* 访客互动 —— giscus 未配置时整块隐藏,不放任何点了没反应的「登录」按钮 */}
        {hasGiscus && (
          <section style={{ padding: '40px 0 0' }}>
            <div className="prompt" style={{ marginBottom: 14 }}>
              {prompt}:~$ ./interact.sh
            </div>
            <div className="panel" style={{ padding: '22px 24px', maxWidth: 640 }}>
              <div style={{ fontSize: 14.5, lineHeight: 1.85, color: 'rgb(var(--inkrgb,233 226 208) / .8)' }}>
                用 GitHub 账号在文章/项目详情页底部即可评论、回应 —— 你的发言留存在 GitHub Discussions,可随时自行查看。
              </div>
              <div style={{ marginTop: 16 }}>
                <a href={giscusDiscussionsUrl} target="_blank" rel="noopener" className="btn hb">
                  查看 Discussions ↗
                </a>
              </div>
              <div style={{ marginTop: 16, fontSize: 12, color: 'rgb(var(--inkrgb,233 226 208) / .75)' }}>
                路线图 · 未来开放:同一 GitHub 身份下的个人主页(我的评论/收藏等)。现阶段尚未上线。
              </div>
            </div>
          </section>
        )}

        {/* 订阅(RSS)—— 本站始终提供 /rss.xml,故不设内容门控 */}
        <section style={{ padding: '40px 0 0' }}>
          <div className="prompt" style={{ marginBottom: 14 }}>
            {prompt}:~$ ./subscribe.sh
          </div>
          <div className="panel" style={{ padding: '22px 24px', maxWidth: 640, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 14.5, color: 'rgb(var(--inkrgb,233 226 208) / .8)' }}>用 RSS 阅读器订阅本站更新</div>
            <a href="/rss.xml" className="btn hb">
              订阅 RSS ↗
            </a>
          </div>
        </section>

        {/* BIO —— 有内容才显示 */}
        {hasBio && (
          <section style={{ padding: '40px 0 0' }}>
            <div className="prompt" style={{ marginBottom: 14 }}>
              {prompt}:~$ cat bio.txt
            </div>
            <div style={{ borderLeft: '2px solid rgb(var(--amrgb,232 178 90) / .35)', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 640 }}>
              {about.bio.map((p, i) => (
                <p key={i} style={{ margin: 0, fontSize: 15, lineHeight: 1.85, color: 'rgb(var(--inkrgb,233 226 208) / .8)' }}>
                  {/* alpha-ok: 装饰性注释前缀符号 */}
                  <span style={{ color: 'rgb(var(--inkrgb,233 226 208) / .4)' }}>{'// '}</span>
                  {p}
                </p>
              ))}
            </div>
          </section>
        )}

        {/* TIMELINE —— 有内容才显示 */}
        {hasTimeline && (
          <section style={{ padding: '44px 0 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18, gap: 12, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink,#e9e2d0)' }}>
                <span style={{ color: 'var(--am,#e8b25a)' }}>▸</span> 一些经历
              </div>
              <span style={{ fontSize: 11.5, color: 'rgb(var(--inkrgb,233 226 208) / .75)' }}>git log --author={site.name} --oneline</span>
            </div>
            <div className="panel" style={{ padding: '18px 22px', fontSize: 13.5, lineHeight: 2.15 }}>
              {about.timeline.map((t) => (
                <div key={t.year}>
                  <span style={{ color: 'var(--am,#e8b25a)' }}>* </span>
                  <span style={{ color: 'var(--green,#79c98a)' }}>{t.year}</span>
                  {t.head && <span style={{ color: 'rgb(var(--inkrgb,233 226 208) / .75)' }}> (HEAD -&gt; main)</span>} {t.text}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CONTACT */}
        <section style={{ padding: '48px 0 0' }}>
          <div className="panel" style={{ padding: '32px 30px', textAlign: 'center' }}>
            <div className="prompt" style={{ marginBottom: 12 }}>
              {prompt}:~$ ./contact.sh
            </div>
            <div style={{ fontSize: 21, fontWeight: 600, color: 'var(--ink,#e9e2d0)', marginBottom: 20 }}>Contact</div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href={`mailto:${site.email}`} className="btn btn-primary hglow">
                ✉ 写信给我
              </a>
              {site.social.map((s) => (
                <a key={s.label} href={s.href} className="btn hb" {...(s.href.startsWith('http') ? { target: '_blank', rel: 'me noopener' } : {})}>
                  {s.label} {s.href.startsWith('http') ? '↗' : ''}
                </a>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Shell>
  )
}
