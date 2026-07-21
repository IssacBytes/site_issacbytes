// /uses —— 软硬件与工具链,整页排成一份 uses.toml。
//
// 现在是空的:/uses 页会显示空状态,页脚与 ⌘K 也不会挂它的链接。
// 想启用:往下面 usesConfig 数组里按注释模板加行即可,页面/链接会自动出现。

export type UsesLine =
  | { kind: 'section'; text: string } // [section] 章节
  | { kind: 'comment'; text: string } // # 注释
  | { kind: 'kv'; k: string; v: string } // key = "value"(可点击复制)
  | { kind: 'blank' } // 空行

export const usesConfig: UsesLine[] = [
  // ——— 加内容示例(去掉注释即可)———
  // { kind: 'comment', text: '我常用的软硬件与工具链' },
  // { kind: 'blank' },
  // { kind: 'section', text: 'editor' },
  // { kind: 'kv', k: 'app', v: 'VS Code' },
  // { kind: 'kv', k: 'font', v: 'JetBrains Mono 14' },
  // { kind: 'blank' },
  // { kind: 'section', text: 'hardware' },
  // { kind: 'kv', k: 'laptop', v: 'MacBook Air M2' },
]

/** 有没有实际条目 —— 决定是否显示 /uses 链接与页面内容 */
export const hasUses = usesConfig.some((l) => l.kind === 'kv')

/** 章节锚点 chips */
export const usesSections = usesConfig
  .filter((l): l is Extract<UsesLine, { kind: 'section' }> => l.kind === 'section')
  .map((l) => l.text)

/** 「复制整份」用的纯文本 */
export function usesToText(): string {
  return usesConfig
    .map((l) => {
      if (l.kind === 'section') return `[${l.text}]`
      if (l.kind === 'comment') return `# ${l.text}`
      if (l.kind === 'kv') return `${l.k} = "${l.v}"`
      return ''
    })
    .join('\n')
}
