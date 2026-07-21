// 个人项目数据源。
// star / fork 若设了 repo("owner/name")则构建期取 GitHub 实时值,
// 未设或取不到就显示「—」;真实为 0 则显示 0 —— 不编数字。
//
// 再加项目就往数组里 push 一条;整段删空则项目页走空状态。

export interface Lang {
  name: string
  /** 占比 0–100,用于语言色条 */
  pct: number
}

export interface Commit {
  hash: string
  msg: string
  date: string
}

export type ProjectStatus = '进行中' | '维护中' | '完成' | '实验'

export interface Project {
  slug: string
  name: string
  desc: string
  langs: Lang[]
  /** 分类标签(按类别,如 课程项目 / Web / 工具 / 算法);项目页按它筛选,空则不显示分类筛选。分类体系自定,先占位。 */
  tags?: string[]
  /** "owner/name",设了就构建期取真实 star/fork */
  repo?: string
  /** 手动覆盖;留空用 repo 实时值,再空显示 — */
  stars?: number | null
  forks?: number | null
  status: ProjectStatus
  updated?: string
  version?: string
  license?: string
  platform?: string
  homepage?: string
  /** 一行安装 / 拉取命令 */
  install?: string
  usage?: { lang: string; code: string }
  /** 概览 tab 的 markdown 正文 */
  readme?: string
  commits?: Commit[]
  draft?: boolean
}

export const projects: Project[] = [
  {
    slug: 'dpw-project',
    name: 'DPW_Project',
    desc: '基于 Python Dash + Plotly 的全球 COVID-19 数据分析与可视化平台。',
    // 语言占比来自 GitHub(HTML 619KB · Python 260KB · CSS 16KB)
    langs: [
      { name: 'HTML', pct: 69 },
      { name: 'Python', pct: 29 },
      { name: 'CSS', pct: 2 },
    ],
    tags: ['课程项目', '数据可视化'],
    repo: 'IssacBytes/DPW_Project',
    status: '完成',
    updated: '2026-05',
    platform: 'Web · Python Dash',
    install: 'git clone https://github.com/IssacBytes/DPW_Project.git',
    readme:
      '## COVID-19 数据探索平台\n\n基于 Python Dash 和 Plotly 构建的全球 COVID-19 数据分析与可视化平台。\n\n## 数据集\n\n- 来源:Our World in Data (OWID) COVID-19 数据集\n- 规模:570,606 行,覆盖 262 个国家/地区\n- 范围:2020-01 至 2026-02,67 列指标(病例、死亡、疫苗接种、检测、政策等)\n\n## 功能特性\n\n- **数据管道**:展示数据从加载到清洗的完整流程(去重、排序、缺失值填充)。\n- **概览**:统计卡片 + 可翻页数据表,快速了解数据集整体。\n- **全球趋势**:世界地图(Choropleth)+ 时间轴滑块联动,可播放疫情时空演变。\n- **国家对比**:多国折线图对比同一指标(最多 6 国)。\n- **国家深度分析**:单国多指标深入分析。\n\n> 技术栈:Python · Dash · Plotly · pandas。',
    commits: [
      { hash: '338c411', msg: 'Merge pull request #3 from GUI_optimize', date: '05-16' },
      { hash: 'de6a76c', msg: 'feat: implement lazy data loading with splash screen', date: '05-16' },
      { hash: '2261dc1', msg: 'Merge pull request #2 from GUI_optimize', date: '05-15' },
      { hash: '0297029', msg: 'feat: add start page and refactor layout', date: '05-15' },
    ],
  },
  {
    slug: 'database-design',
    name: 'Database-Design',
    desc: '基于 PHP + MySQL 的数据库课程设计:美发沙龙管理系统,含管理员 / 发型师 / 客户三端。',
    // 语言占比来自 GitHub(HTML 101.5KB · PHP 43.5KB · CSS 7.8KB)
    langs: [
      { name: 'HTML', pct: 66 },
      { name: 'PHP', pct: 29 },
      { name: 'CSS', pct: 5 },
    ],
    tags: ['课程项目', 'Web'], // ← 分类占位,按你的分类体系改
    repo: 'IssacBytes/Database-Design',
    status: '完成',
    updated: '2026-03',
    platform: 'Web · PHP / MySQL',
    install: 'git clone https://github.com/IssacBytes/Database-Design.git',
    readme:
      '## 美发沙龙管理系统 (Beauty Salon System)\n\n基于 PHP + MySQL 的数据库课程设计 —— 把网站与 MySQL 数据库结合,并讲解完整流程。\n\n## 项目亮点\n\n- **三角色管理**:集成管理员(Admin)、发型师(Staff)与客户(Customer)三端逻辑。\n- **权限校验**:完善的 Session 守护机制(`session_guard.php`)。\n- **数据分析**:管理员可查看发型师业绩及 VIP 统计。\n\n## 目录结构\n\n- `/admin` —— 管理员端后台及界面\n- `/hairdresser` —— 发型师预约及排班管理\n- `/auth` —— 统一权限验证与登录模块\n- `/sql` —— 数据库 E-R 图及 SQL 建表脚本\n\n> 完整实验报告见仓库 `docs/Report.md`。',
    commits: [
      { hash: '1e3d077', msg: 'Update Report.md', date: '03-16' },
      { hash: '73f3ee4', msg: 'Update README.md', date: '03-16' },
      { hash: 'd70a153', msg: 'Update Report.md', date: '03-16' },
      { hash: 'c38d2b6', msg: 'Update Report.md', date: '03-16' },
    ],
  },

  // ——— 再加项目就复制这段(去掉注释),必填 slug/name/desc/langs/status ———
  // {
  //   slug: 'my-repo',                       // URL:/projects/my-repo/
  //   name: 'my-repo',
  //   desc: '一句话描述。',
  //   langs: [{ name: 'TS', pct: 80 }, { name: 'CSS', pct: 20 }],  // 占比合计 ~100
  //   tags: ['Web', '工具'],                 // 分类标签,项目页按此筛选
  //   repo: 'IssacBytes/my-repo',            // 设了就构建期自动取真实 star/fork
  //   status: '进行中',                       // 进行中 / 维护中 / 完成 / 实验
  //   updated: '2026-07',
  //   platform: 'Web',
  //   install: 'npm i my-repo',              // 顶部一行可复制的命令(可省)
  //   readme: '## 标题\n\n正文 markdown。',   // 概览 tab(可省)
  // },
]
