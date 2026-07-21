'use client'

// ★ star 数展示,挂载后向浏览器发起实时请求刷新;manual 手动覆盖优先,其次实时值,最后回退构建期初始值。
import { formatCount } from '@/lib/github'
import { useLiveRepoStats } from '@/lib/useLiveRepoStats'

export function StarBadge({ repo, manual, initial }: { repo?: string; manual?: number | null; initial: number | null }) {
  const live = useLiveRepoStats(repo, initial != null ? { stars: initial, forks: 0 } : null)
  const stars = manual ?? live?.stars ?? initial
  return <>★ {formatCount(stars)}</>
}
