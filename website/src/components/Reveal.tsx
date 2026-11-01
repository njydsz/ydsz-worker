import { useEffect, useRef, useState, type ReactNode } from 'react'

interface RevealProps {
  children: ReactNode
  delay?: number
  className?: string
  direction?: 'up' | 'down' | 'left' | 'right'
}

const directionMap = {
  up: 'translate-y-8',
  down: '-translate-y-8',
  left: 'translate-x-8',
  right: '-translate-x-8',
}

export default function Reveal({ children, delay = 0, className = '', direction = 'up' }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    const inViewport = rect.top < window.innerHeight + 100 && rect.bottom > -100

    if (inViewport) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px -30px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className} ${
        visible
          ? 'opacity-100 translate-x-0 translate-y-0'
          : `opacity-0 ${directionMap[direction]}`
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}
