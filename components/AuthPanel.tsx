'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Session, SupabaseClient } from '@supabase/supabase-js'
import { supabaseAuth, hasAuth, authRepo } from '@/content/auth'
import {
  fetchMyDiscussionComments,
  buildFallbackDiscussionsUrl,
  GithubPermissionError,
  GithubAuthError,
  GithubRateLimitError,
  type DiscussionComment,
} from '@/lib/githubDiscussions'
import { prompt } from '@/site.config'

type CommentsState =
  | { kind: 'idle' }
  | { kind: 'no-token' }
  | { kind: 'loading' }
  | { kind: 'auth-expired'; message: string }
  | { kind: 'rate-limited'; message: string }
  | { kind: 'forbidden'; message: string }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; comments: DiscussionComment[]; truncated: boolean; scannedDiscussions: number }

/**
 * 登录(Supabase Auth + GitHub OAuth)与登录后的个人视图。
 * 未配置 content/auth.ts 时整树不渲染 —— 契合全站「有内容才显示」约定,
 * 且 @supabase/supabase-js 只在此组件内动态 import,未配置时不会被加载。
 */
export function AuthPanel() {
  const [client, setClient] = useState<SupabaseClient | null>(null)
  const [checking, setChecking] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const [commentsState, setCommentsState] = useState<CommentsState>({ kind: 'idle' })

  // 初始化 Supabase 客户端 + 读现有 session
  useEffect(() => {
    if (!hasAuth) return
    let active = true
    let unsubscribe: (() => void) | undefined

    import('@supabase/supabase-js').then(({ createClient }) => {
      if (!active) return
      const c = createClient(supabaseAuth.url, supabaseAuth.anonKey)
      setClient(c)
      c.auth.getSession().then(({ data }) => {
        if (!active) return
        setSession(data.session)
        setChecking(false)
      })
      const { data: sub } = c.auth.onAuthStateChange((_event, s) => {
        if (!active) return
        setSession(s)
      })
      unsubscribe = () => sub.subscription.unsubscribe()
    })

    return () => {
      active = false
      unsubscribe?.()
    }
  }, [])

  // 登录后拉取该用户在 Discussions 里的互动
  useEffect(() => {
    if (!session) {
      setCommentsState({ kind: 'idle' })
      return
    }
    const login = session.user?.user_metadata?.user_name as string | undefined
    const token = session.provider_token
    // provider_token 只在 OAuth 刚登录后随 session 发一次;恢复已有会话(刷新页面/
    // 重新打开标签页)时通常拿不到 —— 绝不能把这种情况静默显示成「没有互动」,
    // 必须诚实告知并给出「重新登录」的操作入口。
    if (!token || !login) {
      setCommentsState({ kind: 'no-token' })
      return
    }
    let active = true
    setCommentsState({ kind: 'loading' })
    fetchMyDiscussionComments(token, login, authRepo.owner, authRepo.name)
      .then((result) => {
        if (active) {
          setCommentsState({
            kind: 'ready',
            comments: result.comments,
            truncated: result.truncated,
            scannedDiscussions: result.scannedDiscussions,
          })
        }
      })
      .catch((err: unknown) => {
        if (!active) return
        if (err instanceof GithubAuthError) {
          setCommentsState({ kind: 'auth-expired', message: err.message })
        } else if (err instanceof GithubRateLimitError) {
          setCommentsState({ kind: 'rate-limited', message: err.message })
        } else if (err instanceof GithubPermissionError) {
          setCommentsState({ kind: 'forbidden', message: err.message })
        } else {
          setCommentsState({ kind: 'error', message: err instanceof Error ? err.message : '获取失败' })
        }
      })
    return () => {
      active = false
    }
  }, [session])

  const handleLogin = useCallback(() => {
    client?.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/about/` },
    })
  }, [client])

  const handleLogout = useCallback(() => {
    client?.auth.signOut()
  }, [client])

  if (!hasAuth) return null

  const meta = session?.user?.user_metadata as
    | { user_name?: string; avatar_url?: string; full_name?: string }
    | undefined
  // 零权限兜底:查询失败(权限不足/其他错误)时,给一个不需要站内接口权限、
  // 直接在 GitHub 上按「涉及该用户」筛选的 Discussions 搜索链接。
  const fallbackUrl = meta?.user_name ? buildFallbackDiscussionsUrl(authRepo.owner, authRepo.name, meta.user_name) : null

  return (
    <section style={{ padding: '40px 0 0' }}>
      <div className="prompt" style={{ marginBottom: 14 }}>
        {prompt}:~$ ./whoami.sh
      </div>

      {!session && (
        <div className="panel" style={{ padding: '22px 24px', maxWidth: 640, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 14.5, color: 'rgb(var(--inkrgb,233 226 208) / .8)' }}>
            用 GitHub 账号登录,查看你在本站的互动记录。
          </div>
          <button type="button" className="btn btn-primary hglow" onClick={handleLogin} disabled={checking || !client}>
            登录查看我的
          </button>
        </div>
      )}

      {session && (
        <div className="panel" style={{ padding: '22px 24px', maxWidth: 640 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            {meta?.avatar_url && (
              // eslint-disable-next-line @next/next/no-img-element -- 外部 GitHub 头像,静态导出无 next/image 优化域配置
              <img
                src={meta.avatar_url}
                alt={meta?.user_name ? `${meta.user_name} 的 GitHub 头像` : 'GitHub 头像'}
                width={48}
                height={48}
                style={{ borderRadius: '50%', border: '1px solid rgb(var(--amrgb,232 178 90) / .3)' }}
              />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink,#e9e2d0)' }}>
                {meta?.full_name || meta?.user_name || '已登录'}
              </div>
              {meta?.user_name && (
                <div style={{ fontSize: 12.5, color: 'rgb(var(--inkrgb,233 226 208) / .75)' }}>@{meta.user_name}</div>
              )}
            </div>
            <button type="button" className="btn hb" onClick={handleLogout}>
              退出登录
            </button>
          </div>

          <div style={{ marginTop: 18, borderTop: '1px solid rgb(var(--amrgb,232 178 90) / .16)', paddingTop: 16 }}>
            <div style={{ fontSize: 12.5, color: 'rgb(var(--inkrgb,233 226 208) / .75)', marginBottom: 10 }}>
              我在 Discussions 里的互动
            </div>
            {commentsState.kind === 'loading' && (
              <div role="status" style={{ fontSize: 13.5, color: 'rgb(var(--inkrgb,233 226 208) / .8)' }}>
                正在从 GitHub 拉取…
              </div>
            )}
            {commentsState.kind === 'no-token' && (
              <div role="status" style={{ fontSize: 13.5, lineHeight: 1.7 }}>
                <div style={{ color: 'var(--am,#e8b25a)' }}>
                  当前登录态没有可用于查询 GitHub 的授权令牌(常见于恢复已有会话,而非刚登录),无法读取互动记录 —— 不是「没有互动」。
                </div>
                <button type="button" className="btn hb" onClick={handleLogin} style={{ marginTop: 10 }}>
                  重新登录以加载互动记录
                </button>
              </div>
            )}
            {commentsState.kind === 'auth-expired' && (
              <div role="status" style={{ fontSize: 13.5, lineHeight: 1.7 }}>
                <div style={{ color: 'var(--am,#e8b25a)' }}>
                  当前登录令牌已失效或过期,无法读取互动记录 —— 不是「没有互动」。
                </div>
                <button type="button" className="btn hb" onClick={handleLogin} style={{ marginTop: 10 }}>
                  重新登录以加载互动记录
                </button>
              </div>
            )}
            {commentsState.kind === 'rate-limited' && (
              <div role="status" style={{ fontSize: 13.5, color: 'var(--am,#e8b25a)', lineHeight: 1.7 }}>
                GitHub 接口暂时限流,稍后再试 —— 不是「没有互动」,也不是权限问题。
              </div>
            )}
            {commentsState.kind === 'forbidden' && (
              <div role="status" style={{ fontSize: 13.5, lineHeight: 1.7 }}>
                <div style={{ color: 'var(--am,#e8b25a)' }}>
                  GitHub 判定当前登录权限不足,无法在站内直接列出你的互动 —— 本站登录只申请只读身份权限,不会额外申请仓库读写权限,这不代表你「没有互动」。
                </div>
                {fallbackUrl && (
                  <a href={fallbackUrl} target="_blank" rel="noopener" className="btn hb" style={{ marginTop: 10 }}>
                    直接在 GitHub 上查看 ↗
                  </a>
                )}
              </div>
            )}
            {commentsState.kind === 'error' && (
              <div role="status" style={{ fontSize: 13.5, lineHeight: 1.7 }}>
                <div style={{ color: 'var(--red,#e0674a)' }}>拉取失败:{commentsState.message}</div>
                {fallbackUrl && (
                  <a href={fallbackUrl} target="_blank" rel="noopener" className="btn hb" style={{ marginTop: 10 }}>
                    直接在 GitHub 上查看 ↗
                  </a>
                )}
              </div>
            )}
            {commentsState.kind === 'ready' && commentsState.comments.length === 0 && (
              <div style={{ fontSize: 13.5, color: 'rgb(var(--inkrgb,233 226 208) / .8)' }}>
                还没有在本站的 Discussions 留下评论。
                {commentsState.truncated && `(仅检查了最近 ${commentsState.scannedDiscussions} 条讨论,未能确认查全,可能有遗漏)`}
              </div>
            )}
            {commentsState.kind === 'ready' && commentsState.comments.length > 0 && (
              <>
                {commentsState.truncated && (
                  <div style={{ fontSize: 12, color: 'var(--am,#e8b25a)', marginBottom: 10 }}>
                    数据量较大,本次仅检查了最近 {commentsState.scannedDiscussions} 条讨论,可能有遗漏。
                  </div>
                )}
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {commentsState.comments.map((c) => (
                    <li key={c.id} style={{ fontSize: 13.5, lineHeight: 1.7 }}>
                      <a href={c.url} target="_blank" rel="noopener" className="hu" style={{ color: 'var(--am,#e8b25a)' }}>
                        {c.discussionTitle} ↗
                      </a>
                      <div style={{ color: 'rgb(var(--inkrgb,233 226 208) / .8)', marginTop: 2 }}>
                        {c.bodyText.length > 140 ? `${c.bodyText.slice(0, 140)}…` : c.bodyText}
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
