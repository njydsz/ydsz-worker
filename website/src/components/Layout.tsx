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

  return (
    <div className="min-h-screen bg-ink-900 overflow-x-hidden flex flex-col">
      <BackgroundDecorations />
      <Navbar onSearchOpen={isDocs ? onSearchOpen : undefined} />
      <main className="relative flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
