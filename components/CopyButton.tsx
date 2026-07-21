'use client'

import { useToast } from './Toast'

interface Props {
  text: string
  children: React.ReactNode
  toastMsg?: string
  className?: string
  style?: React.CSSProperties
  title?: string
  'aria-label'?: string
}

// 复制到剪贴板 + toast 反馈。用于安装命令、uses 行、代码块等。
export function CopyButton({ text, children, toastMsg, className, style, title, ...rest }: Props) {
  const toast = useToast()
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      toast(toastMsg ?? '已复制到剪贴板', 'ok')
    } catch {
      toast('复制失败 —— 浏览器拒绝了剪贴板访问', 'fail')
    }
  }
  return (
    <button type="button" onClick={onCopy} className={className} style={style} title={title} aria-label={rest['aria-label']}>
      {children}
    </button>
  )
}
