// 评论(giscus)—— 基于 GitHub Discussions 的静态可嵌入评论区。
//
// 现在是空的:未配置 repo/repoId/categoryId 时,评论组件整树不渲染,
// 文章/项目详情页与「我的」页的访客互动区都不会有任何残留痕迹。
//
// 启用步骤(需站主在 GitHub 侧操作,详见设计方案文档):
// 1. 选一个 public 仓库承载 Discussions,并在该仓库 Settings → Features 打开 Discussions。
// 2. 安装 giscus GitHub App(https://giscus.app/zh-CN → Install),授权到该仓库。
// 3. 在 giscus.app 生成器填仓库名、选分类,页面会给出 repo / repoId / category / categoryId。
// 4. 把下面 4 项填上即可,页面/组件无需再改。

export interface GiscusConfig {
  /** "owner/repo" */
  repo: string
  repoId: string
  category: string
  categoryId: string
  mapping: 'pathname'
  reactionsEnabled: boolean
  lang: string
}

export const giscus: GiscusConfig = {
  // ——— 加内容示例(去掉注释并填入 giscus.app 生成的真实值)———
  // repo: 'IssacBytes/site-comments',
  // repoId: 'R_kgxxxxxxxxxxxxxx',
  // category: 'Announcements',
  // categoryId: 'DIC_kwxxxxxxxxxxxxxx',
  repo: '',
  repoId: '',
  category: '',
  categoryId: '',
  mapping: 'pathname',
  reactionsEnabled: true,
  lang: 'zh-CN',
}

/** 有没有配好 —— 决定评论组件与「我的」页访客互动区是否显示 */
export const hasGiscus = Boolean(giscus.repo && giscus.repoId && giscus.categoryId)

/** 该仓库 Discussions 列表的外链,给访客自行查看历史评论 */
export const giscusDiscussionsUrl = giscus.repo ? `https://github.com/${giscus.repo}/discussions` : ''
