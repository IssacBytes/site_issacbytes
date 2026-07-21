'use client'

// 客户端实时刷新 GitHub star/fork:组件挂载后请求一次 GitHub API,
// 成功则无闪烁地把 state 从「构建期初始值」替换成「实时值」;
// 失败(离线/限额超限/CORS 异常)保留传入的初始值作为兜底,不报错、不闪烁。

import { useEffect, useState } from 'react'
import { fetchRepoStatsLive, type RepoStats } from './github'

export function useLiveRepoStats(repo: string | undefined, initial: RepoStats | null): RepoStats | null {
  const [stats, setStats] = useState<RepoStats | null>(initial)

  useEffect(() => {
    if (!repo) return
    let cancelled = false
    fetchRepoStatsLive(repo).then((live) => {
      if (!cancelled && live) setStats(live)
    })
    return () => {
      cancelled = true
    }
  }, [repo])

  return stats
}
