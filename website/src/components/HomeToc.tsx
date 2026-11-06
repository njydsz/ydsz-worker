import { useEffect, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { HOME_SECTIONS } from './HomeSections'

/** 右侧浮动目录（类似 Octop TOC）— 滚动高亮当前 section，点击平滑跳转 */
export default function HomeToc() {
  const { t } = useLanguage()
  const [activeId, setActiveId] = useState<string>(HOME_SECTIONS[0]?.id ?? '')

  useEffect(() => {
    const sections = HOME_SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null,
    )
    if (sections.length === 0) return

    let raf = 0
    const update = () => {
      raf = 0
      const probe = window.innerHeight * 0.35
      let current = sections[0].id
      for (const el of sections) {
        if (el.getBoundingClientRect().top <= probe) {
          current = el.id
        } else {
          break
        }
      }
      setActiveId(current)
    }

    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) window.cancelAnimationFrame(raf)
    }
  }, [])

  const handleClick = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY - 72
    window.scrollTo({ top, behavior: 'smooth' })
  }

  return (
    <nav
      aria-label={t('home.toc.label')}
      className="hidden xl:block fixed right-6 top-1/2 -translate-y-1/2 z-40"
    >
      <div className="relative pl-3">
        {/* 左侧竖线轨道 */}
        <div className="absolute left-0 top-1 bottom-1 w-px bg-white/[0.08]" />
        <ul className="space-y-2.5">
          {HOME_SECTIONS.map((section) => {
            const isActive = activeId === section.id
            return (
              <li key={section.id}>
                <button
                  onClick={() => handleClick(section.id)}
                  className="group relative flex items-center gap-2.5 text-left"
                  aria-current={isActive ? 'true' : undefined}
                >
                  {/* 指示点 */}
                  <span
                    className={`absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      isActive
                        ? 'bg-yuanbao-400 shadow-[0_0_8px_rgba(34,197,94,0.6)] scale-110'
                        : 'bg-white/20 group-hover:bg-white/50'
                    }`}
                  />
                  <span
                    className={`text-xs transition-colors duration-200 ${
                      isActive
                        ? 'text-yuanbao-400 font-medium'
                        : 'text-white/35 group-hover:text-white/70'
                    }`}
                  >
                    {t(section.labelKey)}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
