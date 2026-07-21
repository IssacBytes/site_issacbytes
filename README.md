# Phosphor Terminal · 个人站

终端荧光屏风格个人站,由 `design_handoff_phosphor_site/` 的设计稿重建为**可上线的生产代码**。
技术栈 **Next.js 15(App Router)+ 静态导出**,构建产物是纯静态文件,任意静态托管即可。

## 快速开始

```bash
npm install
npm run dev       # 本地开发 http://localhost:3000
npm run build     # 生产构建 → 静态文件输出到 out/
npm run serve     # 本地预览 out/(端口 4321)
```

## 上线前必改(3 步)

1. **身份** —— `site.config.ts`
   名字、handle、域名、邮箱、社交链接、点阵招牌文字(`sign`)、坐标、近况。
   > 设计稿里散落的 `dev@localhost` / `linyuan@dev` / `ISSACBYTES` 已全部收敛到这一个文件。

2. **内容** —— `content/`(**默认基本为空,加内容对应板块自动出现**)
   - `articles/` —— 文章。放 `.md` 即发布;格式见 `_模板.md.example`。空 → 首页「最近写的/动态/标签」区块与写作列表都隐藏。
   - `projects.ts` —— 开源项目(已放你的 Database-Design)。设 `repo: "owner/name"` 则**构建期自动拉 GitHub 真实 star/fork**,取不到显示 `—`(不编数字)。文件内有加项目的注释模板。
   - `uses.ts` / `now.ts` —— 数组填了才显示;空 → 页脚、⌘K、页面都不挂/走空状态。文件内有模板。
   - `about.ts` —— 名片明细 / 自述 / 经历,分别填了才显示;身份名片始终在。

   > **自增长设计**:所有板块「有内容才出现」。现在站很干净(招牌 + 一句话 + 1 个项目 + 联系),你往 `content/` 里加东西,页面自己长出来 —— 不用改组件。

3. **域名** —— `site.config.ts` 的 `url`(用于 canonical / OG / RSS / sitemap 的绝对地址)。

## 部署

`npm run build` 后把 `out/` 整个目录部署到任意静态托管:

| 平台 | 命令 / 方式 |
|---|---|
| Cloudflare Pages | 构建命令 `npm run build`,输出目录 `out`(国内访问较优) |
| Vercel | 直接连仓库,自动识别 Next.js |
| Netlify | 构建命令 `npm run build`,发布目录 `out` |
| GitHub Pages | 把 `out/` 推到 `gh-pages` 分支 |
| 自有 nginx | 把 `out/` 作为静态根目录 |

> 静态导出无任何服务端依赖 —— 换托管不用改代码。

## 结构

```
site.config.ts        # 身份唯一真源
lib/theme.ts          # 夜/昼 × 荧光色 × CRT → CSS 变量;含首帧防闪脚本
lib/content.ts        # Markdown / 项目 内容层(构建期读取)
lib/dotmatrix.ts      # 点阵招牌字模
components/            # 骨架(状态栏/导航/⌘K/页脚)+ 各页交互组件
content/              # 文章、项目、uses、now、about 数据
app/                  # 9 个公开页 + rss/sitemap/robots/og
```

## 已实现

- 9 个公开页:首页 / 关于 / 写作(归档 + 文章详情)/ 项目(列表 + 仓库详情)/ 装备 / 动态 / 404
- 主题系统:夜/昼 × 3 荧光色 × 3 档 CRT,localStorage 持久化 + 跨标签页同步 + **首帧无闪**
- ⌘K 命令面板、归档筛选/搜索、项目筛选/排序/视图切换、仓库 tab、/now 实时 uptime、点击复制
- 自托管 JetBrains Mono(零运行时第三方请求)、favicon、OG 图、RSS、sitemap、robots
- `prefers-reduced-motion` 无障碍支持

## 未做(设计稿里但不上线)

设计系统文档页(设计语言/点阵字/图标系统/氛围组件/终端惯例/写作数据/组件库)是给团队看的内部规范,非公开内容,未包含在本站。

## 已知依赖漏洞(npm audit)

`npm audit --omit=dev` 报 **2 个 moderate**,均来自同一条链:

```
next@15.5.20 → postcss@8.4.31（< 8.5.10 存在漏洞）
```

- **漏洞内容**:PostCSS stringify 在特定输入下对 `</style>` 转义不完整,存在 XSS 风险(GHSA-qx2v-qp2m-jg93)。
- **触发条件**:漏洞发生在 PostCSS 把 AST 转字符串输出的阶段,只有当**不受信任的用户输入被喂给 PostCSS 处理**时才可能被利用。本站 PostCSS 只在**构建期**处理项目自己写的 `globals.css`,不解析任何运行时/用户输入的 CSS,不动态拼接样式字符串到页面。**实际可利用面为零**。
- **为何不能直接修复**:该 `postcss` 是 `next` 包内部固定依赖(不是本项目 `package.json` 直接依赖),`npm audit fix --force` 给出的方案是把 `next` **降级到 9.3.3**(比当前 15.x 倒退 6 个大版本),属于破坏性变更,不采纳。
- **处置策略**:
  1. 现阶段维持现状,不做强制降级/override,原因见上(风险不可利用 + 修复方案破坏性远大于收益)。
  2. 跟随 Next.js 官方发布节奏正常升级 `next`(`npm install next@latest`);Next 团队会在其内部依赖里同步把 `postcss` 升到修复版本,届时随大版本升级自然消除,无需手动干预。
  3. 上线前 / 定期(建议每季度)重跑一次 `npm audit --omit=dev`,一旦 `next` 新版本已解决该项,及时升级验证。
