import Link from 'next/link'
import { site, prompt } from '@/site.config'
import { getAllArticles, getAllProjects } from '@/lib/content'
import { fetchRepoStats } from '@/lib/github'
import { mmdd, tagBadgeClass } from '@/lib/format'
import { Shell } from '@/components/Shell'
import { DotSign } from '@/components/DotSign'
import { BootOverlay } from '@/components/BootOverlay'
import { StarBadge } from '@/components/StarBadge'

const BOOT_LINES = [
  '[ ok ] 挂载 ~ …',
  '[ ok ] 加载 phosphor 显示驱动',
  '[ ok ] 就绪 —— 欢迎,访客',
]

export default async function HomePage() {
  const articles = getAllArticles()
  const recent = articles.slice(0, 4)
  const projects = getAllProjects()
  const top = projects.slice(0, 3)
  const stats = await Promise.all(top.map((p) => fetchRepoStats(p.repo)))

  const tagCount = (t: string) => articles.filter((a) => a.tag === t).length

  // 信息面板:只列有内容的字段
  const infoRows: { k: string; v: React.ReactNode }[] = []
  if (site.role) infoRows.push({ k: '角色', v: site.role })
  if (site.profile.building) infoRows.push({ k: '在做', v: site.profile.building })
  if (site.profile.stack) infoRows.push({ k: '技术栈', v: site.profile.stack })
  if (articles.length) infoRows.push({ k: '写作', v: `${articles.length} 篇` })
  if (projects.length) infoRows.push({ k: '项目', v: `${projects.length} 个` })
  if (site.profile.availability)
    infoRows.push({
      k: '状态',
      v: (
        <>
          <span style={{ color: 'var(--am,#e8b25a)' }}>● {site.profile.availability}</span>
          {site.profile.cadence ? ` · ${site.profile.cadence}` : ''}
        </>
      ),
    })

  return (
    <Shell active="/" keybar={{ label: 'HOME' }}>
      <div className="wrap" style={{ zIndex: 5, paddingBottom: 60 }}>
        {/* HERO */}
        <section style={{ padding: '52px 0 56px' }}>
          <div className="prompt" style={{ marginBottom: 20 }}>
            {prompt}:~$ whoami
          </div>

          <div
            className="panel"
            style={{
              background: 'var(--bg,#0f0e0a)',
              padding: '34px 30px',
              boxShadow: 'inset 0 0 60px rgb(var(--amrgb,232 178 90) / .07)',
            }}
          >
            <DotSign text={site.sign} dot={9} />
            <div style={{ marginTop: 20, fontSize: 11, letterSpacing: '.22em', color: 'rgb(var(--inkrgb,233 226 208) / .75)' }}>
              — {site.role} · EST. {site.since} —
            </div>
          </div>

          {site.tagline && (
            <h1
              style={{
                margin: '32px 0 0',
                fontSize: 'clamp(26px,4.2vw,42px)',
                fontWeight: 700,
                lineHeight: 1.12,
                letterSpacing: '-.02em',
                color: 'var(--am,#e8b25a)',
                textShadow: '0 0 22px var(--am,#e8b25a)',
              }}
            >
              {site.tagline}
            </h1>
          )}
          {site.bio && (
            <p style={{ margin: '18px 0 0', fontSize: 16, lineHeight: 1.7, color: 'rgb(var(--inkrgb,233 226 208) / .75)', maxWidth: 560 }}>
              {/* alpha-ok: 装饰性注释前缀符号 */}
              <span style={{ color: 'rgb(var(--inkrgb,233 226 208) / .4)' }}>{'// '}</span>
              {site.bio}
            </p>
          )}

          {infoRows.length > 0 && (
            <div
              className="panel"
              style={{
                marginTop: 32,
                padding: '22px 26px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
                gap: '6px 34px',
                fontSize: 13.5,
                lineHeight: 1.95,
              }}
            >
              {infoRows.map((r) => (
                <div key={r.k}>
                  <span style={{ color: 'var(--green,#79c98a)', display: 'inline-block', width: 76 }}>{r.k}</span>
                  {r.v}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* WRITING —— 有文章才显示 */}
        {recent.length > 0 && (
          <section style={{ padding: '16px 0 0' }}>
            <SectionHead
              title="最近写的"
              right={
                <Link href="/writing/" className="ha" style={{ fontSize: 12.5, color: 'var(--green,#79c98a)' }}>{`全部 ${articles.length} 篇 →`}</Link>
              }
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {recent.map((a, i) => (
                <Link
                  key={a.slug}
                  href={`/writing/${a.slug}/`}
                  className="hrow"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '22px 58px 1fr auto',
                    gap: 14,
                    alignItems: 'baseline',
                    padding: '15px 12px',
                    borderTop: '1px solid rgb(var(--amrgb,232 178 90) / .14)',
                    borderBottom: i === recent.length - 1 ? '1px solid rgb(var(--amrgb,232 178 90) / .14)' : undefined,
                  }}
                >
                  <span style={{ color: 'var(--am,#e8b25a)' }}>›</span>
                  <span style={{ color: 'rgb(var(--inkrgb,233 226 208) / .75)', fontSize: 13 }}>{mmdd(a.date)}</span>
                  <span style={{ fontSize: 16 }}>{a.title}</span>
                  <span className={`badge ${tagBadgeClass(a.tag)}`}>{a.tag}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* PROJECTS —— 有项目才显示 */}
        {top.length > 0 && (
          <section style={{ padding: '52px 0 0' }}>
            <SectionHead
              title="个人项目"
              right={
                <Link href="/projects/" className="ha" style={{ fontSize: 12.5, color: 'var(--green,#79c98a)' }}>
                  全部 →
                </Link>
              }
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
              {top.map((p, i) => (
                <Link key={p.slug} href={`/projects/${p.slug}/`} className="panel hb" style={{ padding: 20, display: 'block' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ color: 'var(--am,#e8b25a)', fontWeight: 600, fontSize: 15 }}>{p.name}/</span>
                    <span style={{ color: 'rgb(var(--inkrgb,233 226 208) / .75)', fontSize: 12 }}>
                      <StarBadge repo={p.repo} manual={p.stars} initial={p.stars ?? stats[i]?.stars ?? null} />
                    </span>
                  </div>
                  <p style={{ margin: '10px 0 14px', fontSize: 13, lineHeight: 1.6, color: 'rgb(var(--inkrgb,233 226 208) / .75)' }}>{p.desc}</p>
                  {p.tags && p.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                      {p.tags.map((t) => (
                        <span
                          key={t}
                          style={{ fontSize: 11, color: 'rgb(var(--inkrgb,233 226 208) / .75)', border: '1px solid rgb(var(--inkrgb,233 226 208) / .18)', padding: '2px 8px' }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* LOG —— 有文章才显示 */}
        {recent.length > 0 && (
          <section style={{ padding: '52px 0 0' }}>
            <SectionHead title="最近动态" sub="— 最新更新" right={<span style={{ fontSize: 11.5, color: 'rgb(var(--inkrgb,233 226 208) / .75)' }}>git log --oneline</span>} />
            <div className="panel" style={{ padding: '18px 22px', fontSize: 13.5, lineHeight: 2.15 }}>
              {recent.map((a, i) => (
                <div key={a.slug}>
                  <span style={{ color: 'var(--am,#e8b25a)' }}>* </span>
                  <span style={{ color: 'var(--green,#79c98a)' }}>{a.slug.slice(0, 7).padEnd(7, '0')}</span>
                  {i === 0 && <span style={{ color: 'rgb(var(--inkrgb,233 226 208) / .75)' }}> (HEAD -&gt; main)</span>} 新增{a.tag}:{a.title}
                  <span style={{ color: 'rgb(var(--inkrgb,233 226 208) / .75)', float: 'right' }}>{mmdd(a.date)}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* BROWSE BY TAG —— 有文章才显示 */}
        {articles.length > 0 && (
          <section style={{ padding: '52px 0 0' }}>
            <SectionHead title="按标签浏览" sub="— 挑个话题读起" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12 }}>
              {(['教程', '随笔', '项目'] as const)
                .filter((t) => tagCount(t) > 0)
                .map((t) => (
                  <Link
                    key={t}
                    href={`/writing/?tag=${encodeURIComponent(t)}`}
                    className="panel hb"
                    style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14, height: 92, justifyContent: 'space-between' }}
                  >
                    <span style={{ color: 'var(--am,#e8b25a)', fontSize: 24, fontWeight: 600 }}>{String(tagCount(t)).padStart(2, '0')}</span>
                    <span style={{ fontSize: 13.5 }}>{t}/</span>
                  </Link>
                ))}
            </div>
          </section>
        )}

        {/* CONTACT —— 始终显示 */}
        <section style={{ padding: '56px 0 0' }}>
          <div className="panel" style={{ padding: '34px 32px', textAlign: 'center' }}>
            <div className="prompt" style={{ marginBottom: 12 }}>
              {prompt}:~$ ./contact.sh
            </div>
            <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--ink,#e9e2d0)', marginBottom: 20 }}>Contact</div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href={`mailto:${site.email}`} className="btn btn-primary hop">
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

      <BootOverlay lines={BOOT_LINES} />
    </Shell>
  )
}

function SectionHead({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink,#e9e2d0)' }}>
        <span style={{ color: 'var(--am,#e8b25a)' }}>▸</span> {title}
        {sub && <span style={{ fontSize: 12, fontWeight: 400, color: 'rgb(var(--inkrgb,233 226 208) / .75)' }}> {sub}</span>}
      </div>
      {right}
    </div>
  )
}
