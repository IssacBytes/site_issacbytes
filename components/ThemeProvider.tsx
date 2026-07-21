'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import {
  type Theme,
  type Phosphor,
  type Crt,
  DEFAULT_THEME,
  THEME_EVENT,
  PHOSPHORS,
  CRTS,
  readTheme,
  writeTheme,
} from '@/lib/theme'

interface ThemeCtx {
  theme: Theme
  /** 首帧后置真,用于避免控件文案的水合不一致 */
  mounted: boolean
  toggleMode: () => void
  cyclePhosphor: () => void
  cycleCrt: () => void
  setTheme: (patch: Partial<Theme>) => void
}

const Ctx = createContext<ThemeCtx | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setThemeState(readTheme())
    setMounted(true)
    const sync = () => setThemeState(readTheme())
    // 同页各组件间广播 + 跨标签页 storage 事件
    window.addEventListener(THEME_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(THEME_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const setTheme = useCallback((patch: Partial<Theme>) => {
    setThemeState(writeTheme(patch))
  }, [])

  const toggleMode = useCallback(() => {
    setThemeState((t) => writeTheme({ mode: t.mode === '日间' ? '夜间' : '日间' }))
  }, [])

  const cyclePhosphor = useCallback(() => {
    setThemeState((t) => {
      const next = PHOSPHORS[(PHOSPHORS.indexOf(t.phosphor) + 1) % PHOSPHORS.length] as Phosphor
      return writeTheme({ phosphor: next })
    })
  }, [])

  const cycleCrt = useCallback(() => {
    setThemeState((t) => {
      const next = CRTS[(CRTS.indexOf(t.crt) + 1) % CRTS.length] as Crt
      return writeTheme({ crt: next })
    })
  }, [])

  return (
    <Ctx.Provider value={{ theme, mounted, toggleMode, cyclePhosphor, cycleCrt, setTheme }}>
      {children}
    </Ctx.Provider>
  )
}

export function useTheme(): ThemeCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useTheme 必须在 <ThemeProvider> 内使用')
  return ctx
}
