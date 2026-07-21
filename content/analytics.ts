// 访问统计(GoatCounter)—— 轻量、隐私友好、免费额度够个人站用。
//
// 现在是空的:未填 id 时不注入任何统计脚本,不产生任何第三方请求。
//
// 启用步骤:
// 1. 去 https://www.goatcounter.com 免费注册一个 site,得到形如
//    "yourcode" 的 code(统计后台地址是 https://yourcode.goatcounter.com)。
// 2. 把下面 goatCounterId 填成 "yourcode" 即可,构建后自动在 <head> 注入
//    官方计数脚本 https://gc.zgo.at/count.js。
// 3. 如需换成其他统计服务(Umami / Plausible 自托管等),改这一个文件即可,
//    不用改页面代码 —— 沿用同一个「有内容才显示」约定。

export interface AnalyticsConfig {
  /** GoatCounter 的 site code(即 https://<code>.goatcounter.com) */
  goatCounterId: string
}

export const analytics: AnalyticsConfig = {
  // goatCounterId: 'yourcode',
  goatCounterId: '',
}

/** 有没有配好 —— 决定是否注入统计脚本 */
export const hasAnalytics = Boolean(analytics.goatCounterId)
