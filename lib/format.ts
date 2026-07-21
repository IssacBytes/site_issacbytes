import type { Tag } from './content'

/** 2026-06-26 → 06.26 */
export function mmdd(iso: string): string {
  const m = /(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  return m ? `${m[2]}.${m[3]}` : iso
}

/** 2026-06-26 → 2026 */
export function yearOf(iso: string): string {
  return (/(\d{4})/.exec(iso)?.[1]) ?? '—'
}

export function tagBadgeClass(tag: Tag): string {
  return tag === '教程' ? 'badge-tut' : tag === '项目' ? 'badge-proj' : 'badge-essay'
}
