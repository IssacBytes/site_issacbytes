// /now —— 近况快照(受 nownownow.com 启发)。
//
// 现在是空的:/now 页会显示空状态,页脚与 ⌘K 也不会挂它的链接。
// 想启用:把下面各数组填上内容(至少一项),页面/链接会自动出现。

export interface NowData {
  /** ISO 日期,如 2026-07-18;留空则不显示「更新于」 */
  updated: string
  status: { kind: 'ok' | 'warn'; text: string }[]
  working: { name: string; note: string; pct: number }[]
  reading: { t: string; who: string }[]
  learning: string[]
  nowPlaying: string[]
  quips: string[]
}

export const now: NowData = {
  updated: '',
  status: [
    // { kind: 'ok', text: '有余量接小活' },
    // { kind: 'warn', text: '邮件回复偏慢,见谅' },
  ],
  working: [
    // { name: '项目名', note: '一句话说明', pct: 60 },
  ],
  reading: [
    // { t: '《书名》', who: '作者 / 进度' },
  ],
  learning: [
    // 'Rust', '钢笔字',
  ],
  nowPlaying: [
    // 'Bonobo — Kerala',
  ],
  quips: [
    // '随便写句碎念,支持「换一条」随机切换。',
  ],
}

/** 有没有实际内容 —— 决定是否显示 /now 链接与页面 */
export const hasNow = [now.status, now.working, now.reading, now.learning, now.nowPlaying, now.quips].some(
  (a) => a.length > 0
)
