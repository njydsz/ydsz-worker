import { useEffect, useState, type RefObject } from 'react'

interface ReadingProgressBarProps {
  /** 滚动容器的 ref，若为 undefined 则使用 window */
  scrollRef?: RefObject<HTMLElement | null>
}

/** 顶部滚动进度条 — 适配容器或 window 滚动 */
export default function ReadingProgressBar({ scrollRef }: ReadingProgressBarProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const target = scrollRef?.current
    const handleScroll = () => {
      if (target) {
        const scrollTop = target.scrollTop
        const docHeight = target.scrollHeight - target.clientHeight
        setProgress(docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0)
      } else {
        const scrollTop = window.scrollY
        const docHeight = document.documentElement.scrollHeight - window.innerHeight
        setProgress(docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0)
      }
    }
    const el = target ?? window
    el.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => el.removeEventListener('scroll', handleScroll)
  }, [scrollRef])

  return (
    <div className="absolute top-0 left-0 right-0 h-[2px] z-10 pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-yuanbao-400 to-yuanbao-500 transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
