'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import type { ArticleMeta, Tag } from '@/lib/content'
import { mmdd, yearOf, tagBadgeClass } from '@/lib/format'

const TAGS: (Tag | '全部')[] = ['全部', '教程', '随笔', '项目']

export function WritingList({ articles }: { articles: ArticleMeta[] }) {
  const [query, setQuery] = useState('')
  const [tag, setTag] = useState<Tag | '全部'>('全部')

  // 支持首页 /writing/?tag=教程 深链
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('tag')
    if (t && (TAGS as string[]).includes(t)) setTag(t as Tag)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return articles.filter((a) => (tag === '全部' || a.tag === tag) && (!q || a.title.toLowerCase().includes(q)))
  }, [articles, query, tag])

  const groups = useMemo(() => {
    const map = new Map<string, ArticleMeta[]>()
    for (const a of filtered) {
      const y = yearOf(a.date)
      if (!map.has(y)) map.set(y, [])
      map.get(y)!.push(a)
    }
    return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1))
  }, [filtered])

  return (
    <>
      {/* 控制行 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        <label
          className="hb"
          style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid rgb(var(--amrgb,232 178 90) / .25)', background: 'var(--panel,#17150e)', padding: '7px 12px', flex: '1 1 260px', maxWidth: 360 }}
        >
          <span style={{ color: 'var(--green,#79c98a)', flex: 'none', fontSize: 13 }}>grep</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索标题…"
            style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none', color: 'var(--ink,#e9e2d0)', fontFamily: 'inherit', fontSize: 13.5, caretColor: 'var(--am,#e8b25a)' }}
          />
        </label>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          {TAGS.map((t) => (
            <button key={t} type="button" onClick={() => setTag(t)} className="chip" data-active={tag === t}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* 列表 */}
      {filtered.length === 0 ? (
        <div className="panel" style={{ padding: '28px 22px', fontSize: 14, color: 'rgb(var(--inkrgb,233 226 208) / .75)' }}>
          <span style={{ color: 'var(--red,#e0674a)' }}>grep: 没有匹配 “{query || tag}”</span>
          <div style={{ marginTop: 14 }}>
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setTag('全部')
              }}
              className="chip"
            >
              ↺ 清空筛选
            </button>
          </div>
        </div>
      ) : (
        groups.map(([year, rows]) => (
          <div key={year} style={{ marginBottom: 26 }}>
            <div style={{ fontSize: 12.5, color: 'rgb(var(--inkrgb,233 226 208) / .75)', marginBottom: 6, letterSpacing: '.02em' }}>
              <span style={{ color: 'var(--am,#e8b25a)' }}>drwxr-xr-x</span> {String(rows.length).padStart(2, ' ')}{' '}
              <span style={{ color: 'var(--green,#79c98a)' }}>{year}/</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {rows.map((a) => (
                <Link
                  key={a.slug}
                  href={`/writing/${a.slug}/`}
                  className="hrow"
                  style={{ display: 'flex', gap: 14, alignItems: 'baseline', padding: '12px', borderTop: '1px solid rgb(var(--amrgb,232 178 90) / .12)' }}
                >
                  {/* alpha-ok: 装饰性 ls -l 风格文案,非真实权限信息 */}
                  <span className="sb-sub" style={{ color: 'rgb(var(--inkrgb,233 226 208) / .3)', fontSize: 12, flex: 'none' }}>
                    -rw-r--r--
                  </span>
                  <span className="sb-sub" style={{ color: 'rgb(var(--inkrgb,233 226 208) / .75)', fontSize: 12.5, flex: 'none', width: 42, textAlign: 'right' }}>
                    {a.size}
                  </span>
                  <span style={{ color: 'rgb(var(--inkrgb,233 226 208) / .75)', fontSize: 13, flex: 'none', width: 46 }}>{mmdd(a.date)}</span>
                  <span style={{ flex: 1, minWidth: 0, fontSize: 15 }}>
                    {a.title}
                    {/* alpha-ok: 装饰性文件扩展名后缀 */}
                    <span style={{ color: 'rgb(var(--inkrgb,233 226 208) / .3)' }}>.md</span>
                  </span>
                  <span className={`badge ${tagBadgeClass(a.tag)}`} style={{ flex: 'none' }}>
                    {a.tag}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))
      )}
    </>
  )
}
