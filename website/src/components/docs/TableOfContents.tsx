import { useEffect, useState, useCallback, type RefObject } from 'react'

interface TocItem {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  items: TocItem[]
  sticky?: boolean
  /** 滚动容器 ref，若为 undefined 则使用 window */
  scrollContainerRef?: RefObject<HTMLElement | null>
}

/** 右侧页内目录 — 滚动高亮 + 点击跳转 (适配容器或 window 滚动) */
export default function TableOfContents({ items, sticky = true, scrollContainerRef }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? '')

  useEffect(() => {
    const scrollEl = scrollContainerRef?.current ?? window
    const handleScroll = () => {
      let currentId = items[0]?.id ?? ''
      for (const item of items) {
        const el = document.getElementById(item.id)
        if (el) {
          let top: number
          if (scrollContainerRef?.current) {
            top = el.offsetTop - scrollContainerRef.current.offsetTop
            const containerScrollTop = scrollContainerRef.current.scrollTop
            if (top <= containerScrollTop + 100) {
              currentId = item.id
            }
          } else {
            top = el.getBoundingClientRect().top
            if (top <= 120) {
              currentId = item.id
            }
          }
        }
      }
      setActiveId(currentId)
    }
    scrollEl.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => scrollEl.removeEventListener('scroll', handleScroll)
  }, [items, scrollContainerRef])

  const handleClick = useCallback((id: string) => {
    if (scrollContainerRef?.current) {
      const container = scrollContainerRef.current
      const el = document.getElementById(id)
      if (el) {
        const top = el.offsetTop - container.offsetTop - 24
        container.scrollTo({ top, behavior: 'smooth' })
      }
    } else {
      const el = document.getElementById(id)
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 80
        window.scrollTo({ top, behavior: 'smooth' })
      }
    }
  }, [scrollContainerRef])

  if (items.length === 0) return null

  return (
    <div className={sticky ? 'sticky top-0' : ''}>
      <div className="flex items-center gap-2 mb-4 px-1">
        <svg className="w-3.5 h-3.5 text-yuanbao-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
        </svg>
        <span className="text-xs font-semibold uppercase tracking-wider text-white/40">目录</span>
      </div>
      <nav className="relative">
        {/* 左侧竖线 */}
        <div className="absolute left-0 top-0 bottom-0 w-px bg-white/[0.06]" />
        <ul className="space-y-0.5">
          {items.map((item) => {
            const isActive = activeId === item.id
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleClick(item.id)}
                  className={`block w-full text-left transition-all duration-200 rounded-r-md border-l-2 pl-3 pr-2 py-1.5 ${
                    item.level === 3 ? 'pl-6' : ''
                  } ${
                    isActive
                      ? 'border-yuanbao-500 text-yuanbao-400 bg-yuanbao-500/[0.04]'
                      : 'border-transparent text-white/40 hover:text-white/70 hover:bg-white/[0.02]'
                  }`}
                >
                  <span className={`truncate block ${item.level === 3 ? 'text-xs' : 'text-sm'}`}>
                    {item.text}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
