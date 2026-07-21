// GitHub Linguist 官方语言配色(取自 github/linguist 的 languages.yml)。
// 语言色条按语言名取色,和 GitHub 仓库页一致。未收录的语言用中性灰兜底。

const COLORS: Record<string, string> = {
  HTML: '#e34c26',
  CSS: '#563d7c',
  SCSS: '#c6538c',
  Less: '#1d365d',
  JavaScript: '#f1e05a',
  JS: '#f1e05a',
  TypeScript: '#3178c6',
  TS: '#3178c6',
  Python: '#3572A5',
  PHP: '#4F5D95',
  R: '#198CE7',
  Rust: '#dea584',
  Go: '#00ADD8',
  Java: '#b07219',
  Kotlin: '#A97BFF',
  Swift: '#F05138',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
  Shell: '#89e051',
  Ruby: '#701516',
  Vue: '#41b883',
  Svelte: '#ff3e00',
  Astro: '#ff5a03',
  Dart: '#00B4AB',
  Lua: '#000080',
  'Jupyter Notebook': '#DA5B0B',
  Batchfile: '#C1F12E',
  Dockerfile: '#384d54',
  Makefile: '#427819',
  Markdown: '#083fa1',
  MATLAB: '#e16737',
  'Objective-C': '#438eff',
  Perl: '#0298c3',
  Scala: '#c22d40',
  Haskell: '#5e5086',
  Elixir: '#6e4a7e',
  Vim: '#199f4b',
  TeX: '#3D6117',
  SQL: '#e38c00',
}

const FALLBACK = '#8b949e' // GitHub 未知语言的中性灰

export function langColor(name: string): string {
  return COLORS[name] ?? FALLBACK
}
