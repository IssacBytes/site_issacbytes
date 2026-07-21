// 构建期抓取 GitHub 仓库真实 star/fork。取不到就返回 null → 页面显示「—」。
// 无 token 走匿名接口(够个人站用量);设了 GITHUB_TOKEN 环境变量则带上以提额度。

export interface RepoStats {
  stars: number
  forks: number
}

const cache = new Map<string, RepoStats | null>()

export async function fetchRepoStats(repo?: string): Promise<RepoStats | null> {
  if (!repo) return null
  if (cache.has(repo)) return cache.get(repo)!
  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'phosphor-site',
    }
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
    const res = await fetch(`https://api.github.com/repos/${repo}`, { headers })
    if (!res.ok) {
      cache.set(repo, null)
      return null
    }
    const j: { stargazers_count?: number; forks_count?: number } = await res.json()
    const stats: RepoStats = { stars: j.stargazers_count ?? 0, forks: j.forks_count ?? 0 }
    cache.set(repo, stats)
    return stats
  } catch {
    cache.set(repo, null)
    return null
  }
}

/**
 * 浏览器端实时抓取(客户端组件调用,挂载后触发)。
 * 不带 User-Agent(浏览器禁止脚本设置该头,设了会被静默忽略/报错)、不带 token(避免把密钥打进客户端包)、
 * 不查/写构建期缓存 —— 失败直接返回 null,由调用方回退到构建期抓到的初始值。
 */
export async function fetchRepoStatsLive(repo?: string): Promise<RepoStats | null> {
  if (!repo) return null
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: { Accept: 'application/vnd.github+json' },
    })
    if (!res.ok) return null
    const j: { stargazers_count?: number; forks_count?: number } = await res.json()
    return { stars: j.stargazers_count ?? 0, forks: j.forks_count ?? 0 }
  } catch {
    return null
  }
}

/** 1234 → "1.2k";null/undefined → "—"(不编数字)。 */
export function formatCount(n: number | null | undefined): string {
  if (n == null) return '—'
  if (n < 1000) return String(n)
  const k = n / 1000
  return (n >= 10000 ? Math.round(k) : k.toFixed(1)) + 'k'
}
