import type { ReactNode } from 'react'

interface CalloutProps {
  type?: 'info' | 'tip' | 'warning' | 'note'
  title?: string
  children: ReactNode
}

const CALLOUT_STYLES = {
  info: {
    bg: 'bg-blue-500/[0.06]',
    border: 'border-blue-500/20',
    iconColor: 'text-blue-400',
    titleColor: 'text-blue-300',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    label: '提示',
  },
  tip: {
    bg: 'bg-yuanbao-500/[0.06]',
    border: 'border-yuanbao-500/20',
    iconColor: 'text-yuanbao-400',
    titleColor: 'text-yuanbao-300',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    label: '建议',
  },
  warning: {
    bg: 'bg-amber-500/[0.06]',
    border: 'border-amber-500/20',
    iconColor: 'text-amber-400',
    titleColor: 'text-amber-300',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
    label: '注意',
  },
  note: {
    bg: 'bg-purple-500/[0.06]',
    border: 'border-purple-500/20',
    iconColor: 'text-purple-400',
    titleColor: 'text-purple-300',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
    label: '说明',
  },
}

/** 提示框组件 — info / tip / warning / note */
export default function Callout({ type = 'info', title, children }: CalloutProps) {
  const style = CALLOUT_STYLES[type]
  return (
    <div className={`rounded-xl border ${style.border} ${style.bg} p-4 my-6`}>
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 flex-shrink-0 ${style.iconColor}`}>{style.icon}</span>
        <div className="min-w-0 flex-1">
          {(title || style.label) && (
            <p className={`text-sm font-medium ${style.titleColor} mb-1`}>
              {title ?? style.label}
            </p>
          )}
          <div className="text-sm text-white/55 leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  )
}
