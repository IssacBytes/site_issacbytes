// 登录(Supabase Auth + GitHub OAuth)—— 仿 giscus 门控模式。
//
// 现在是空的:url/anonKey 未配置时,登录入口与「我的」页个人视图整树不渲染,
// 全站与当前上线状态完全一致,不留任何残留痕迹。
//
// 启用步骤(需站主在 Supabase 侧操作):
// 1. 在 supabase.com 新建项目,拿到 Project URL 与 anon public key。
// 2. 项目 Authentication → Providers → 开启 GitHub,填入 GitHub OAuth App 的 client id/secret。
// 3. GitHub OAuth App 的 Authorization callback URL 填 Supabase 给出的回调地址。
// 4. 把下面两项填上即可,页面/组件无需再改。

export interface SupabaseAuthConfig {
  url: string
  anonKey: string
}

export const supabaseAuth: SupabaseAuthConfig = {
  url: 'https://kfcgjlfljgjpploroirb.supabase.co',
  anonKey: 'sb_publishable_6S5elrzAqD-wuK3M6dzADQ_O1e0gjAx',
}

/** 有没有配好 —— 决定登录入口与「我的」页个人视图是否显示 */
export const hasAuth = Boolean(supabaseAuth.url && supabaseAuth.anonKey)

/** 承载 Discussions 互动数据的仓库(与 content/comments.ts 的 giscus 仓库一致) */
export const authRepo = {
  owner: 'IssacBytes',
  name: 'site_issacbytes',
}
