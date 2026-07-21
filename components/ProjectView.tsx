'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { EnrichedProject } from '@/lib/content'
import { formatCount } from '@/lib/github'
import { useLiveRepoStats } from '@/lib/useLiveRepoStats'
import { LangBar } from './LangBar'
import { CopyButton } from './CopyButton'
import { useToast } from './Toast'
import { Giscus } from './Giscus'

type Tab = '概览' | '提交' | '文件树'
const TABS: Tab[] = ['概览', '提交', '文件树']

interface Props {
  project: EnrichedProject
  readmeHtml: string
  prev: { slug: string; name: string } | null
  next: { slug: string; name: string } | null
}

export function ProjectView({ project: p, readmeHtml, prev, next }: Props) {
  const [tab, setTab] = useState<Tab>('概览')
  const toast = useToast()

  // 挂载后向浏览器发起实时请求刷新 star/fork;失败则保留构建期解析出的 resolvedStars/resolvedForks 兜底。
  const hasBuildStats = p.resolvedStars != null || p.resolvedForks != null
  const live = useLiveRepoStats(p.repo, hasBuildStats ? { stars: p.resolvedStars ?? 0, forks: p.resolvedForks ?? 0 } : null)
  const liveStars = p.stars ?? live?.stars ?? p.resolvedStars
  const liveForks = p.forks ?? live?.forks ?? p.resolvedForks

  const starCount = liveStars
  const forkCount = liveForks

  const btn: React.CSSProperties = {
    cursor: 'pointer',
    fontSize: 12.5,
    padding: '6px 13px',
    border: '1px solid rgb(var(--amrgb,232 178 90) / .3)',
    background: 'transparent',
    color: 'var(--ink,#e9e2d0)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  }

  const meta: [string, string | undefined][] = [
    ['版本', p.version],
    ['协议', p.license],
    ['更新', p.updated],
    ['平台', p.platform],
    ['状态', p.status],
  ]

  return (
    <div className="wrap" style={{ paddingBottom: 40 }}>
      {/* 面包屑 */}
      <div style={{ fontSize: 12.5, color: 'rgb(var(--inkrgb,233 226 208) / .75)', padding: '34px 0 18px' }}>
        <Link href="/" className="ha">
          ~
        </Link>{' '}
        /{' '}
        <Link href="/projects/" className="ha">
          projects
        </Link>{' '}
        / <span style={{ color: 'var(--am,#e8b25a)' }}>{p.name}</span>
      </div>

      {/* 标题行 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: 'var(--am,#e8b25a)', textShadow: '0 0 18px rgb(var(--amrgb,232 178 90) / .3)' }}>
            {p.name}<span style={{ color: 'rgb(var(--inkrgb,233 226 208) / .75)' }}>/</span>
          </h1>
          {/* alpha-ok: α.7 已按方案 A2 实测达标（保留） */}
          <p style={{ margin: '10px 0 0', fontSize: 14, color: 'rgb(var(--inkrgb,233 226 208) / .7)', maxWidth: 560 }}>{p.desc}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {p.repo ? (
            <a
              href={`https://github.com/${p.repo}`}
              target="_blank"
              rel="noopener"
              title="前往 GitHub 为该仓库 Star"
              aria-label={`前往 GitHub 为该仓库 Star，当前 ${formatCount(starCount)} 个`}
              className="tap"
              style={{ ...btn, textDecoration: 'none' }}
            >
              ★ 去 GitHub Star <span style={{ color: 'rgb(var(--inkrgb,233 226 208) / .75)' }}>{formatCount(starCount)}</span>
            </a>
          ) : (
            <span className="tap" style={btn}>
              ★ Star <span style={{ color: 'rgb(var(--inkrgb,233 226 208) / .75)' }}>{formatCount(starCount)}</span>
            </span>
          )}
          <button
            type="button"
            onClick={() => toast('fork 需要在 GitHub 上完成', 'warn')}
            aria-label={`Fork：需在 GitHub 上完成，当前 ${formatCount(forkCount)} 个`}
            className="tap"
            style={btn}
          >
            ⑂ Fork <span style={{ color: 'rgb(var(--inkrgb,233 226 208) / .75)' }}>{formatCount(forkCount)}</span>
          </button>
        </div>
      </div>

      {/* 语言色条 */}
      <div style={{ margin: '22px 0' }}>
        <LangBar langs={p.langs} />
      </div>

      {/* 安装命令 */}
      {p.install && (
        <div className="panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 16px', marginBottom: 26 }}>
          <code style={{ fontSize: 13.5, color: 'var(--ink,#e9e2d0)', overflowX: 'auto' }}>
            <span style={{ color: 'var(--green,#79c98a)' }}>$ </span>
            {p.install}
          </code>
          <CopyButton
            text={p.install}
            toastMsg="已复制安装命令"
            className="hbg tap"
            style={{ cursor: 'pointer', flex: 'none', fontSize: 12, color: 'var(--am,#e8b25a)', border: '1px solid rgb(var(--amrgb,232 178 90) / .3)', background: 'transparent', padding: '5px 11px' }}
            title="复制"
          >
            ⧉ 复制
          </CopyButton>
        </div>
      )}

      {/* 两栏 */}
      <div className="repo-grid">
        <div>
          {/* tab 条 */}
          <div role="tablist" style={{ display: 'flex', gap: 4, borderBottom: '1px solid rgb(var(--amrgb,232 178 90) / .16)', marginBottom: 20 }}>
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                id={`tab-${t}`}
                aria-selected={tab === t}
                aria-controls={`tabpanel-${t}`}
                onClick={() => setTab(t)}
                className="tap"
                style={{
                  cursor: 'pointer',
                  fontSize: 13,
                  padding: '9px 14px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: `2px solid ${tab === t ? 'var(--am,#e8b25a)' : 'transparent'}`,
                  color: tab === t ? 'var(--am,#e8b25a)' : 'rgb(var(--inkrgb,233 226 208) / .75)',
                  marginBottom: -1,
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === '概览' && (
            <div role="tabpanel" id="tabpanel-概览" aria-labelledby="tab-概览">
              <div className="prose" dangerouslySetInnerHTML={{ __html: readmeHtml }} />
              {p.usage && (
                <div style={{ marginTop: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--green,#79c98a)', letterSpacing: '.1em' }}>▸ 用法</span>
                    <CopyButton
                      text={p.usage.code}
                      toastMsg="已复制代码"
                      className="ha tap"
                      style={{ cursor: 'pointer', fontSize: 11.5, color: 'rgb(var(--inkrgb,233 226 208) / .75)', background: 'transparent', border: 'none' }}
                    >
                      ⧉ 复制
                    </CopyButton>
                  </div>
                  <pre style={{ background: 'var(--panel,#17150e)', border: '1px solid rgb(var(--amrgb,232 178 90) / .16)', borderLeft: '3px solid rgb(var(--amrgb,232 178 90) / .5)', padding: '14px 16px', overflowX: 'auto', fontSize: 13, lineHeight: 1.7, margin: 0 }}>
                    <code style={{ color: 'rgb(var(--inkrgb,233 226 208) / .9)' }}>{p.usage.code}</code>
                  </pre>
                </div>
              )}
            </div>
          )}

          {tab === '提交' && (
            <div role="tabpanel" id="tabpanel-提交" aria-labelledby="tab-提交" className="panel" style={{ padding: '10px 0', fontSize: 13.5 }}>
              {(p.commits ?? []).length === 0 && <div style={{ padding: '14px 18px', color: 'rgb(var(--inkrgb,233 226 208) / .75)' }}>—— 暂无提交记录 ——</div>}
              {(p.commits ?? []).map((c) => (
                <div key={c.hash} style={{ display: 'flex', gap: 12, alignItems: 'baseline', padding: '9px 18px', borderTop: '1px solid rgb(var(--amrgb,232 178 90) / .08)' }}>
                  <span style={{ color: 'var(--green,#79c98a)', flex: 'none' }}>{c.hash}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>{c.msg}</span>
                  <span style={{ color: 'rgb(var(--inkrgb,233 226 208) / .75)', flex: 'none', fontSize: 12 }}>{c.date}</span>
                </div>
              ))}
            </div>
          )}

          {tab === '文件树' && (
            // alpha-ok: α.7 已按方案 A2 实测达标（保留）
            <pre role="tabpanel" id="tabpanel-文件树" aria-labelledby="tab-文件树" style={{ margin: 0, fontSize: 13, lineHeight: 1.9, color: 'rgb(var(--inkrgb,233 226 208) / .7)' }}>
              <span style={{ color: 'var(--am,#e8b25a)' }}>{p.name}/</span>
              {'\n├── README.md'}
              {'\n├── LICENSE'}
              {'\n├── package.json'}
              {'\n├── src/'}
              {'\n│   ├── index.ts'}
              {'\n│   └── lib/'}
              {'\n└── tests/'}
              {'\n\n'}
              <span style={{ color: 'rgb(var(--inkrgb,233 226 208) / .75)' }}># 文件树为示例结构 —— 真实站可接 GitHub 内容接口</span>
            </pre>
          )}
        </div>

        {/* 侧栏 */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 18, fontSize: 13 }}>
          <div className="panel" style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: 11, letterSpacing: '.14em', color: 'rgb(var(--inkrgb,233 226 208) / .75)', marginBottom: 12 }}>元信息</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 16px' }}>
              {meta.map(([k, v]) => (
                <span key={k} style={{ display: 'contents' }}>
                  <span style={{ color: 'var(--green,#79c98a)' }}>{k}</span>
                  <span style={{ color: 'rgb(var(--inkrgb,233 226 208) / .8)' }}>{v ?? '—'}</span>
                </span>
              ))}
            </div>
          </div>

          {(p.homepage || p.repo) && (
            <div className="panel" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 11, letterSpacing: '.14em', color: 'rgb(var(--inkrgb,233 226 208) / .75)', marginBottom: 4 }}>链接</div>
              {p.homepage && (
                <a href={p.homepage} target="_blank" rel="noopener" className="ha" style={{ color: 'var(--am,#e8b25a)' }}>
                  ↗ 主页
                </a>
              )}
              {p.repo && (
                <a href={`https://github.com/${p.repo}`} target="_blank" rel="noopener" className="ha" style={{ color: 'var(--am,#e8b25a)' }}>
                  ↗ github.com/{p.repo}
                </a>
              )}
            </div>
          )}

          {(p.commits ?? []).length > 0 && (
            <div className="panel" style={{ padding: '16px 18px' }}>
              <div style={{ fontSize: 11, letterSpacing: '.14em', color: 'rgb(var(--inkrgb,233 226 208) / .75)', marginBottom: 12 }}>近期提交</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9, fontSize: 12.5 }}>
                {(p.commits ?? []).slice(0, 4).map((c) => (
                  <div key={c.hash} style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                    <span style={{ color: 'var(--green,#79c98a)', flex: 'none' }}>{c.hash.slice(0, 7)}</span>
                    <span style={{ color: 'rgb(var(--inkrgb,233 226 208) / .75)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.msg}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* 上/下仓库 */}
      <nav style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 14, marginTop: 44 }}>
        {prev ? (
          <Link href={`/projects/${prev.slug}/`} className="panel hb" style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: 11.5, color: 'rgb(var(--inkrgb,233 226 208) / .75)', marginBottom: 6 }}>← 上一个</div>
            <div style={{ fontSize: 14, color: 'var(--am,#e8b25a)' }}>{prev.name}/</div>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/projects/${next.slug}/`} className="panel hb" style={{ padding: '16px 18px', textAlign: 'right' }}>
            <div style={{ fontSize: 11.5, color: 'rgb(var(--inkrgb,233 226 208) / .75)', marginBottom: 6 }}>下一个 →</div>
            <div style={{ fontSize: 14, color: 'var(--am,#e8b25a)' }}>{next.name}/</div>
          </Link>
        ) : (
          <span />
        )}
      </nav>

      <Giscus />
    </div>
  )
}
