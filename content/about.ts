// /about —— 自我介绍页数据。
//
// 现在是空的:关于页只保留身份名片(来自 site.config),自述/名片明细/经历都不显示。
// 想启用:把下面数组/段落填上,对应板块会自动出现。

export interface AboutData {
  /** neofetch 名片键值对,如 ['语言', 'TypeScript · Rust'] */
  neofetch: [string, string][]
  /** 自述段落,每段一个字符串 */
  bio: string[]
  /** 经历时间线(git log 风格),head 标记当前 */
  timeline: { year: string; text: string; head?: boolean }[]
}

export const about: AboutData = {
  neofetch: [
    // ['身份', '全栈开发者'],
    // ['语言', 'TypeScript · Rust'],
    // ['编辑器', 'VS Code'],
  ],
  bio: [
    // '第一段自我介绍。',
    // '第二段。',
  ],
  timeline: [
    // { year: '2026', text: '发布了某项目', head: true },
    // { year: '2024', text: '入坑' },
  ],
}

export const hasNeofetch = about.neofetch.length > 0
export const hasBio = about.bio.length > 0
export const hasTimeline = about.timeline.length > 0
