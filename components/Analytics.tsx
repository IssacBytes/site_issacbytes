import { analytics, hasAnalytics } from '@/content/analytics'

/**
 * GoatCounter 访问统计脚本。未配置 goatCounterId 时不渲染任何标签,
 * 不产生任何第三方请求 —— 契合全站「有内容才显示」约定。
 * 纯静态 <script> 标签,无需交互逻辑,故不是客户端组件。
 */
export function Analytics() {
  if (!hasAnalytics) return null

  return (
    <script
      data-goatcounter={`https://${analytics.goatCounterId}.goatcounter.com/count`}
      async
      src="https://gc.zgo.at/count.js"
    />
  )
}
