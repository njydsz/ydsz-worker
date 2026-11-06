import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'

interface SectionRevealProps {
  children: ReactNode
  /** section 在页面中的序号，用于递增过渡延迟 */
  index?: number
  /** 每个 section 之间的延迟步进（ms） */
  step?: number
  className?: string
  id?: string
  as?: 'section' | 'div'
}

const OBSERVER_SUPPORTED = typeof IntersectionObserver !== 'undefined'

/**
 * 用 IntersectionObserver 实现 section 入场动画：
 * 进入视口前 opacity-0 translate-y-8，进入后 opacity-100 translate-y-0。
 */
export default function SectionReveal({
  children,
  index = 0,
  step = 100,
  className = '',
  id,
  as = 'section',
}: SectionRevealProps) {
  const ref = useRef<HTMLElement | null>(null)
  // 不支持 IntersectionObserver 时直接显示，避免内容永久隐藏
  const [visible, setVisible] = useState(!OBSERVER_SUPPORTED)

  useEffect(() => {
    const el = ref.current
    if (!el || !OBSERVER_SUPPORTED) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const style = { transitionDelay: `${index * step}ms` }

  if (as === 'div') {
    return (
      <div
        ref={ref as RefObject<HTMLDivElement>}
        id={id}
        className={`transition-all duration-700 ease-out ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        } ${className}`}
        style={style}
      >
        {children}
      </div>
    )
  }

  return (
    <section
      ref={ref as RefObject<HTMLElement>}
      id={id}
      className={`transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
      style={style}
    >
      {children}
    </section>
  )
}
