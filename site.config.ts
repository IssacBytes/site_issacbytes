// ─────────────────────────────────────────────────────────────
//  站点身份 · 唯一真源
//  设计原型里 dev@localhost / linyuan@dev / ISSACBYTES 三套身份散落 45+ 处,
//  全部收敛到这里。上线前改这一个文件,全站生效。
// ─────────────────────────────────────────────────────────────

export interface SocialLink {
  label: string
  href: string
  /** 页脚/联系区展示用的短名 */
  short: string
}

export interface SiteConfig {
  /** 显示名(中文名或昵称) */
  name: string
  /** 点阵招牌文字 —— 仅支持 A-Z 0-9 空格 . - _ > /(见 lib/dotmatrix.ts 字模) */
  sign: string
  /** 终端提示符用户名 */
  handle: string
  /** 终端提示符主机名 → 提示符渲染为 `${handle}@${host}` */
  host: string
  role: string
  /** 裸域名,用于展示 */
  domain: string
  /** 完整站点 URL,用于 canonical / OG / RSS / sitemap */
  url: string
  email: string
  /** 首页 hero 大标题 */
  tagline: string
  /** 首页 hero 副文案 */
  bio: string
  /** 建站年份(页脚 © 与 neofetch) */
  since: number
  social: SocialLink[]
  /** neofetch / 首页信息面板 / now 页共用的近况字段 */
  profile: {
    building: string
    stack: string
    availability: string
    cadence: string
  }
}

export const site: SiteConfig = {
  // ↓↓↓ 上线前逐项确认 ↓↓↓
  name: 'IssacBytes',
  sign: 'ISSACBYTES',
  handle: 'issacbytes',
  host: 'dev',
  role: 'BNBU CST在读（2024）',
  // 域名已确认:issacbytes.com(Cloudflare)。
  // 邮箱 hi@issacbytes.com 需在 Cloudflare 配 Email Routing 才能收信;否则换成你常用邮箱。
  domain: 'issacbytes.com',
  url: 'https://issacbytes.com',
  email: 'hi@issacbytes.com',
  tagline: '把复杂的事,讲清楚。', // 首页 hero 大标题,改成你自己的一句话
  bio: '', // 副文案;留空则首页不显示这段
  since: 2024,
  social: [
    { label: 'GitHub', short: 'GitHub', href: 'https://github.com/IssacBytes' },
    // 想加回 Twitter / RSS,在这里补一条即可(RSS href 用 '/rss.xml')
  ],
  // 首页信息面板的近况字段;留空的行不显示。想展示就填。
  profile: {
    building: '', // 在做
    stack: '', // 技术栈
    availability: '', // 状态(如 开放合作)
    cadence: '', // 更新频率(如 半月更)
  },
}

/** 终端提示符,如 `linyuan@dev`。 */
export const prompt = `${site.handle}@${site.host}`

/** 主导航项。当前页高亮由各页传入的 active 决定。 */
export const nav = [
  { label: '首页', href: '/' },
  { label: '写作', href: '/writing/' },
  { label: '项目', href: '/projects/' },
  { label: '我的', href: '/about/' },
] as const
