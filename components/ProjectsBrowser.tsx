'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import type { EnrichedProject } from '@/lib/content'
import { LangBar } from './LangBar'
import { StarBadge } from './StarBadge'

type Sort = 'stars' | 'updated'
type View = 'grid' | 'list'

const starOf = (p: EnrichedProject) => p.resolvedStars ?? -1

export function ProjectsBrowser({ projects }: { projects: EnrichedProject[] }) {
  const [cat, setCat] = useState('all')
  const [sort, setSort] = useState<Sort>('stars')
  const [view, setView] = useState<View>('grid')

  // 分类筛选来自各项目的 tags;没有任何分类时不显示这排筛选
  const cats = useMemo(() => {
    const set = new Set<string>()
    projects.forEach((p) => (p.tags ?? []).forEach((t) => set.add(t)))
    return ['all', ...[...set]]
  }, [projects])
  const hasCats = cats.length > 1

  const shown = useMemo(() => {
    const f = projects.filter((p) => cat === 'all' || (p.tags ?? []).includes(cat))
    return f.sort((a, b) => (sort === 'stars' ? starOf(b) - starOf(a) : (a.updated ?? '') < (b.updated ?? '') ? 1 : -1))
  }, [projects, cat, sort])

  const segBtn = (on: boolean): React.CSSProperties => ({
    cursor: 'pointer',
    fontSize: 12,
    padding: '5px 12px',
    border: '1px solid rgb(var(--amrgb,232 178 90) / .25)',
    background: on ? 'var(--am,#e8b25a)' : 'transparent',
    color: on ? 'var(--bg,#0f0e0a)' : 'rgb(var(--inkrgb,233 226 208) / .75)',
  })

  return (
    <>
      {/* 控制行 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        {hasCats ? (
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {cats.map((c) => (
              <button key={c} type="button" onClick={() => setCat(c)} className="chip" data-active={cat === c}>
                {c === 'all' ? '全部' : c}
              </button>
            ))}
          </div>
        ) : (
          <div />
        )}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex' }}>
            <button type="button" onClick={() => setSort('stars')} style={segBtn(sort === 'stars')}>
              ★ Stars
            </button>
            <button type="button" onClick={() => setSort('updated')} style={{ ...segBtn(sort === 'updated'), borderLeft: 'none' }}>
              最近更新
            </button>
          </div>
          <div style={{ display: 'flex' }}>
            <button type="button" onClick={() => setView('grid')} aria-label="网格视图" style={segBtn(view === 'grid')}>
              ▦
            </button>
            <button type="button" onClick={() => setView('list')} aria-label="列表视图" style={{ ...segBtn(view === 'list'), borderLeft: 'none' }}>
              ≣
            </button>
          </div>
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="panel" style={{ padding: '28px 22px', fontSize: 14, color: 'rgb(var(--inkrgb,233 226 208) / .75)' }}>
          <span style={{ color: 'var(--red,#e0674a)' }}>没有「{cat}」分类的项目</span>
          <div style={{ marginTop: 14 }}>
            <button type="button" onClick={() => setCat('all')} className="chip">
              ↺ 显示全部
            </button>
          </div>
        </div>
      ) : view === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
          {shown.map((p) => (
            <Link key={p.slug} href={`/projects/${p.slug}/`} className="panel hb" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ color: 'var(--am,#e8b25a)', fontWeight: 600, fontSize: 15 }}>{p.name}/</span>
                  <span style={{ color: 'rgb(var(--inkrgb,233 226 208) / .75)', fontSize: 12 }}>
                    <StarBadge repo={p.repo} manual={p.stars} initial={p.resolvedStars} />
                  </span>
                </div>
                <p style={{ margin: '10px 0 0', fontSize: 13, lineHeight: 1.6, color: 'rgb(var(--inkrgb,233 226 208) / .75)' }}>{p.desc}</p>
              </div>
              <div style={{ marginTop: 'auto' }}>
                <LangBar langs={p.langs} />
                <div style={{ marginTop: 12 }}>
                  <span className="badge badge-warn">{p.status}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {shown.map((p) => (
            <Link
              key={p.slug}
              href={`/projects/${p.slug}/`}
              className="hrow"
              style={{ display: 'flex', gap: 14, alignItems: 'baseline', padding: '14px 12px', borderTop: '1px solid rgb(var(--amrgb,232 178 90) / .12)' }}
            >
              {/* alpha-ok: 装饰性 ls -l 风格文案,非真实权限信息 */}
              <span className="sb-sub" style={{ color: 'rgb(var(--inkrgb,233 226 208) / .3)', fontSize: 12, flex: 'none' }}>
                drwxr-xr-x
              </span>
              <span style={{ color: 'var(--am,#e8b25a)', fontWeight: 600, flex: 'none', minWidth: 120 }}>{p.name}/</span>
              <span style={{ flex: 1, minWidth: 0, fontSize: 13, color: 'rgb(var(--inkrgb,233 226 208) / .75)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {p.desc}
              </span>
              <span style={{ color: 'rgb(var(--inkrgb,233 226 208) / .75)', fontSize: 12, flex: 'none' }}>
                <StarBadge repo={p.repo} manual={p.stars} initial={p.resolvedStars} />
              </span>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
