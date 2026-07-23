// 用登录后拿到的 GitHub provider_token,读该用户在指定仓库 Discussions 里的
// 评论/回复(GraphQL 分页遍历)。纯前端调用,不落任何自有数据库。
//
// 诚实边界:讨论数 / 单讨论评论数 / 单评论回复数都设了护栏上限(小站数据量小,
// 正常远够用)。一旦触达任一护栏,返回结果会标 truncated:true,
// UI 必须据此提示「仅检查了部分」,不得把「未查全」说成「没有互动」。

export interface DiscussionComment {
  id: string
  url: string
  bodyText: string
  createdAt: string
  discussionTitle: string
  discussionUrl: string
}

export interface FetchResult {
  comments: DiscussionComment[]
  /** 是否命中了任一护栏上限(讨论数 / 评论数 / 回复数),未能保证查全 */
  truncated: boolean
  /** 实际扫描过的讨论数 */
  scannedDiscussions: number
}

/**
 * 登录时授予的 GitHub token 权限不足以读取 Discussions(本站不申请
 * public_repo 等写权限范围的 scope,遵循「只读」原则,默认 scope 在部分账号/
 * 时段下可能被 GitHub 判定权限不足)。UI 需据此给专门的诚实提示 + 零权限兜底链接,
 * 而不是把「查不到」误报成「没有互动」。
 */
export class GithubPermissionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'GithubPermissionError'
  }
}

/** provider_token 本身已失效/过期(401)—— 与「权限范围不足」是两回事,应提示重新登录。 */
export class GithubAuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'GithubAuthError'
  }
}

/** GitHub 接口触发限流(403 + 限流特征)—— 与「权限不足」无关,是「稍后再试」的临时状态。 */
export class GithubRateLimitError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'GithubRateLimitError'
  }
}

/** 零权限兜底:直接跳到该仓库 Discussions 里「涉及某用户」的搜索结果页 */
export function buildFallbackDiscussionsUrl(owner: string, name: string, login: string): string {
  const q = encodeURIComponent(`involves:${login}`)
  return `https://github.com/${owner}/${name}/discussions?discussions_q=${q}`
}

interface GqlAuthor {
  login: string
}

interface GqlPageInfo {
  hasNextPage: boolean
  endCursor: string | null
}

interface GqlComment {
  id: string
  url: string
  bodyText: string
  createdAt: string
  author: GqlAuthor | null
  replies?: { pageInfo: GqlPageInfo; nodes: GqlComment[] }
}

interface GqlDiscussion {
  title: string
  url: string
  comments: { pageInfo: GqlPageInfo; nodes: GqlComment[] }
}

interface GqlErrorItem {
  message: string
  type?: string
}

interface GqlResponse {
  data?: {
    repository?: {
      discussions?: {
        pageInfo: GqlPageInfo
        nodes: GqlDiscussion[]
      }
    }
  }
  errors?: GqlErrorItem[]
}

const PERMISSION_ERROR_TYPES = new Set(['FORBIDDEN', 'INSUFFICIENT_SCOPES'])

const QUERY = `
query($owner: String!, $name: String!, $after: String) {
  repository(owner: $owner, name: $name) {
    discussions(first: 20, after: $after, orderBy: { field: UPDATED_AT, direction: DESC }) {
      pageInfo { hasNextPage endCursor }
      nodes {
        title
        url
        comments(first: 100) {
          pageInfo { hasNextPage endCursor }
          nodes {
            id
            url
            bodyText
            createdAt
            author { login }
            replies(first: 100) {
              pageInfo { hasNextPage endCursor }
              nodes { id url bodyText createdAt author { login } }
            }
          }
        }
      }
    }
  }
}
`

/** 讨论列表最多翻这么多页(每页 20 条)—— 小站够用,命中即诚实标记 truncated。 */
const MAX_DISCUSSION_PAGES = 10

const RATE_LIMIT_RE = /rate limit/i
const PERMISSION_RE = /scope|forbidden|permission/i

async function graphql(token: string, owner: string, name: string, after: string | null): Promise<GqlResponse> {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: QUERY, variables: { owner, name, after } }),
  })

  // 401:令牌本身无效/已过期 —— 与「权限范围不足」是两回事,提示重新登录。
  if (res.status === 401) {
    throw new GithubAuthError(`GitHub 判定当前登录令牌无效或已过期(状态码 401)`)
  }

  // 限流信号来自响应头,与状态码无关(GraphQL 触发限流时常见的是 200 + errors[],
  // 而非 403)。先统一取一次,供下面 403 分支与 errors[] 分支共用,避免遗漏。
  const remaining = res.headers.get('x-ratelimit-remaining')
  const retryAfter = res.headers.get('retry-after')
  const looksRateLimitedByHeaders = remaining === '0' || retryAfter !== null

  // 403:先看是不是限流(有明确限流信号才归为限流),否则才归为权限不足。
  if (res.status === 403) {
    let bodyText = ''
    try {
      bodyText = await res.text()
    } catch {
      /* 读取失败就按空文本处理,不影响限流信号判断 */
    }
    const looksRateLimited = looksRateLimitedByHeaders || RATE_LIMIT_RE.test(bodyText)
    if (looksRateLimited) {
      throw new GithubRateLimitError('GitHub 接口暂时限流,稍后再试(状态码 403)')
    }
    throw new GithubPermissionError(`GitHub 判定当前登录权限不足(状态码 403)`)
  }

  if (!res.ok) {
    throw new Error(`GitHub API 请求失败(状态码 ${res.status})`)
  }

  const json = (await res.json()) as GqlResponse
  if (json.errors?.length) {
    // 混合信号场景:响应头已表明限流,即便 errors[] 里同时混有权限不足的信息,
    // 也优先按限流处理(限流是临时状态,「权限不足」的 involves: 兜底链接此时
    // 不该出现——那会误导用户去做无关的权限排查)。
    const rateLimited =
      looksRateLimitedByHeaders ||
      json.errors.some((e) => e.type === 'RATE_LIMITED' || RATE_LIMIT_RE.test(e.message || ''))
    if (rateLimited) {
      const rateLimitedEntry = json.errors.find(
        (e) => e.type === 'RATE_LIMITED' || RATE_LIMIT_RE.test(e.message || '')
      )
      throw new GithubRateLimitError(rateLimitedEntry?.message || 'GitHub 接口暂时限流,稍后再试')
    }
    const permissionIssue = json.errors.find(
      (e) => (e.type && PERMISSION_ERROR_TYPES.has(e.type)) || PERMISSION_RE.test(e.message || '')
    )
    if (permissionIssue) {
      throw new GithubPermissionError(permissionIssue.message || 'GitHub 判定当前登录权限不足')
    }
    throw new Error(json.errors[0]?.message || 'GitHub API 返回了错误')
  }
  return json
}

export async function fetchMyDiscussionComments(
  token: string,
  login: string,
  owner: string,
  name: string
): Promise<FetchResult> {
  const results: DiscussionComment[] = []
  let after: string | null = null
  let truncated = false
  let scannedDiscussions = 0

  for (let page = 0; page < MAX_DISCUSSION_PAGES; page++) {
    const json = await graphql(token, owner, name, after)
    const discussions = json.data?.repository?.discussions
    if (!discussions) break

    const collect = (c: GqlComment, discussionTitle: string, discussionUrl: string) => {
      if (c.author?.login === login) {
        results.push({
          id: c.id,
          url: c.url,
          bodyText: c.bodyText,
          createdAt: c.createdAt,
          discussionTitle,
          discussionUrl,
        })
      }
    }

    for (const d of discussions.nodes ?? []) {
      scannedDiscussions++
      const comments = d.comments
      if (comments?.pageInfo?.hasNextPage) truncated = true // 该讨论评论数超过护栏上限(100)
      for (const c of comments?.nodes ?? []) {
        collect(c, d.title, d.url)
        if (c.replies?.pageInfo?.hasNextPage) truncated = true // 该评论回复数超过护栏上限(100)
        for (const r of c.replies?.nodes ?? []) collect(r, d.title, d.url)
      }
    }

    if (!discussions.pageInfo?.hasNextPage) {
      after = null
      break
    }
    after = discussions.pageInfo.endCursor
    if (page === MAX_DISCUSSION_PAGES - 1) truncated = true // 讨论数超过护栏上限
  }

  results.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  return { comments: results, truncated, scannedDiscussions }
}
