'use client'

import dynamic from 'next/dynamic'
import { hasAuth } from '@/content/auth'

// next/dynamic 的 `ssr: false` 在 Server Component 里不被允许,所以把「懒加载 +
// 客户端专用」这层包一个小 Client Component:真正的 AuthPanel(GitHub 查询/
// @supabase/supabase-js 都在其内)只有在浏览器端渲染 <RealAuthPanel /> 时才会
// 触发 import(),而这一行只有 hasAuth 为 true 才会执行到。
const RealAuthPanel = dynamic(() => import('@/components/AuthPanel').then((m) => m.AuthPanel), { ssr: false })

/**
 * 登录个人视图的挂载入口。未配置 content/auth.ts 时直接返回 null,
 * 不会渲染 RealAuthPanel,浏览器也就不会请求它所在的 chunk。
 */
export function AuthPanelLazy() {
  if (!hasAuth) return null
  return <RealAuthPanel />
}
