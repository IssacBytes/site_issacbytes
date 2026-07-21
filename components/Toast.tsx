'use client'

import { createContext, useCallback, useContext, useRef, useState } from 'react'

type ToastKind = 'ok' | 'warn' | 'fail'
interface ToastState {
  id: number
  msg: string
  kind: ToastKind
}

const Ctx = createContext<(msg: string, kind?: ToastKind) => void>(() => {})

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const push = useCallback((msg: string, kind: ToastKind = 'ok') => {
    if (timer.current) clearTimeout(timer.current)
    setToast({ id: Date.now(), msg, kind })
    timer.current = setTimeout(() => setToast(null), 2200)
  }, [])

  const color =
    toast?.kind === 'fail' ? 'var(--red,#e0674a)' : toast?.kind === 'warn' ? 'var(--am,#e8b25a)' : 'var(--green,#79c98a)'

  return (
    <Ctx.Provider value={push}>
      {children}
      {toast && (
        <div
          role="status"
          key={toast.id}
          style={{
            position: 'fixed',
            right: 20,
            bottom: 20,
            zIndex: 90,
            maxWidth: '80vw',
            background: 'var(--panel,#17150e)',
            borderLeft: `3px solid ${color}`,
            border: '1px solid rgb(var(--amrgb,232 178 90) / .2)',
            borderLeftWidth: 3,
            borderLeftColor: color,
            padding: '11px 16px',
            fontSize: 13,
            color: 'var(--ink,#e9e2d0)',
            boxShadow: '0 12px 32px rgba(0,0,0,.45)',
            animation: 'pop .2s ease',
          }}
        >
          {toast.msg}
        </div>
      )}
    </Ctx.Provider>
  )
}

export function useToast() {
  return useContext(Ctx)
}
