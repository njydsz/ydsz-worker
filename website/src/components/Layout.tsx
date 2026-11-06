import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import BackgroundDecorations from './BackgroundDecorations'

interface LayoutProps {
  onSearchOpen?: () => void
}

export default function Layout({ onSearchOpen }: LayoutProps) {
  const { pathname } = useLocation()

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pathname])

  // 只在文档页启用搜索
  const isDocs = pathname === '/docs'

  // 文档页使用全屏布局（无 Footer，main 撑满剩余高度）
  if (isDocs) {
    return (
      <div className="h-screen bg-ink-900 overflow-hidden flex flex-col">
        <BackgroundDecorations />
        <Navbar onSearchOpen={onSearchOpen} />
        <main className="relative flex-1 min-h-0 overflow-hidden">
          <Outlet />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink-900 overflow-x-hidden flex flex-col">
      <BackgroundDecorations />
      <Navbar onSearchOpen={undefined} />
      <main className="relative flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
