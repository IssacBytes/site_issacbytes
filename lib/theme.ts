// 主题引擎 —— 夜/昼 × 荧光色 × CRT 强度 → 一串 CSS 变量。
// 映射值 1:1 抄自设计原型的 renderVals()(见 design_handoff/首页.dc.html),
// 是最终值,勿随意改动。
//
// 关键约束:computeVars 必须「自包含」(函数体内不引用任何模块级符号),
// 因为它会被 .toString() 注入进 <head> 的阻塞脚本,在首帧绘制前运行以消除 FOUC。
// 若引用外部符号,生产构建压缩改名后注入脚本会失效。

export type Mode = '夜间' | '日间'
export type Phosphor = '琥珀' | '荧绿' | '冷白'
export type Crt = '关闭' | '微弱' | '强烈'

export interface Theme {
  mode: Mode
  phosphor: Phosphor
  crt: Crt
}

export const THEME_KEY = 'phosphor-theme-v1'
export const THEME_EVENT = 'phosphor-theme'
export const DEFAULT_THEME: Theme = { mode: '夜间', phosphor: '琥珀', crt: '微弱' }

export const PHOSPHORS: Phosphor[] = ['琥珀', '荧绿', '冷白']
export const CRTS: Crt[] = ['关闭', '微弱', '强烈']

/** 纯函数 · 自包含。输入完整主题,输出可直接赋给 style.cssText 的 CSS 变量串。 */
export function computeVars(t: Theme): string {
  const HUE: Record<string, { night: string; nrgb: string; day: string; drgb: string }> = {
    琥珀: { night: '#e8b25a', nrgb: '232 178 90', day: '#7a5310', drgb: '122 83 16' },
    荧绿: { night: '#7dd88f', nrgb: '125 216 143', day: '#256b3a', drgb: '37 107 58' },
    冷白: { night: '#e9e2d0', nrgb: '233 226 208', day: '#4a4638', drgb: '74 70 56' },
  }
  const day = t.mode === '日间'
  const hue = HUE[t.phosphor] || HUE['琥珀']
  const am = day ? hue.day : hue.night
  const amrgb = day ? hue.drgb : hue.nrgb
  // --green 承载信息文本（prompt/标签/hash 值等，见调用点），非纯装饰，须过 WCAG AA。
  // 日间压暗自 #3f7a4e（bg 3.93:1，不达标）→ #346641（bg 5.17 / panel 5.71，实算达标）；夜间已达标不动。
  const green = day ? '#346641' : '#79c98a'
  const greenrgb = day ? '52 102 65' : '121 201 138'
  const red = day ? '#a63c24' : '#e0674a'
  const redrgb = day ? '166 60 36' : '224 103 74'
  const bg = day ? '#e9e1cf' : '#0f0e0a'
  const panel = day ? '#f3ecda' : '#17150e'
  const ink = day ? '#2a2419' : '#e9e2d0'
  const inkrgb = day ? '42 36 25' : '233 226 208'
  const scanBase = t.crt === '关闭' ? 0 : t.crt === '强烈' ? 0.9 : 0.5
  const scan = day ? scanBase * 0.22 : scanBase
  const vig = t.crt === '关闭' ? 0 : t.crt === '强烈' ? 0.14 : 0.06
  return (
    `--bg:${bg};--panel:${panel};--ink:${ink};--inkrgb:${inkrgb};` +
    `--am:${am};--amrgb:${amrgb};--green:${green};--greenrgb:${greenrgb};` +
    `--red:${red};--redrgb:${redrgb};--scan:${scan};--vig:${vig}`
  )
}

/** 规范化任意可能残缺的对象为合法 Theme(回退到默认)。 */
export function normalizeTheme(raw: Partial<Theme> | null | undefined): Theme {
  const r = raw || {}
  return {
    mode: r.mode === '日间' ? '日间' : '夜间',
    phosphor: PHOSPHORS.includes(r.phosphor as Phosphor) ? (r.phosphor as Phosphor) : DEFAULT_THEME.phosphor,
    crt: CRTS.includes(r.crt as Crt) ? (r.crt as Crt) : DEFAULT_THEME.crt,
  }
}

// —— 客户端辅助(仅在浏览器调用)——

export function readTheme(): Theme {
  try {
    return normalizeTheme(JSON.parse(localStorage.getItem(THEME_KEY) || '{}'))
  } catch {
    return { ...DEFAULT_THEME }
  }
}

export function applyTheme(t: Theme): void {
  const el = document.documentElement
  el.style.cssText = computeVars(t)
  el.dataset.mode = t.mode === '日间' ? 'day' : 'night'
}

export function writeTheme(patch: Partial<Theme>): Theme {
  const next = normalizeTheme({ ...readTheme(), ...patch })
  try {
    localStorage.setItem(THEME_KEY, JSON.stringify(next))
  } catch {
    /* localStorage 不可用时静默降级 */
  }
  applyTheme(next)
  window.dispatchEvent(new Event(THEME_EVENT))
  return next
}

/**
 * 生成 <head> 内的阻塞脚本源码:首帧前读 localStorage 并把变量挂到 <html>。
 * 通过 computeVars.toString() 复用同一份映射,避免夜/昼逻辑写两遍产生漂移。
 */
export function themeInitScript(): string {
  return (
    `(function(){var K=${JSON.stringify(THEME_KEY)},D=${JSON.stringify(DEFAULT_THEME)};` +
    `var C=${computeVars.toString()};` +
    `try{var r=JSON.parse(localStorage.getItem(K)||'{}');` +
    `var t={mode:r.mode==='日间'?'日间':'夜间',` +
    `phosphor:['琥珀','荧绿','冷白'].indexOf(r.phosphor)>=0?r.phosphor:D.phosphor,` +
    `crt:['关闭','微弱','强烈'].indexOf(r.crt)>=0?r.crt:D.crt};` +
    `var e=document.documentElement;e.style.cssText=C(t);` +
    `e.dataset.mode=t.mode==='日间'?'day':'night';}catch(e){` +
    `document.documentElement.style.cssText=C(D);}})();`
  )
}
