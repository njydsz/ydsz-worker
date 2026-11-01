import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import SectionDivider from '../components/SectionDivider'
import DashboardMock from '../components/DashboardMock'
import TableOfContents from '../components/docs/TableOfContents'
import SearchModal, { type SearchItem } from '../components/docs/SearchModal'
import SyntaxCodeBlock from '../components/docs/SyntaxCodeBlock'
import Callout from '../components/docs/Callout'
import ReadingProgressBar from '../components/docs/ReadingProgressBar'

/* ═══════════════════════════════════════════════════════════════
   文档页面结构定义 — 单一数据源 (导航 + TOC + 搜索)
   ═══════════════════════════════════════════════════════════════ */

interface NavItem {
  label: string
  href: string
  id: string
}

interface NavSection {
  title: string
  icon: ReactNode
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: '开始使用',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    items: [
      { label: '简介', href: '#intro', id: 'intro' },
      { label: '快速开始', href: '#quickstart', id: 'quickstart' },
      { label: '截图和视频', href: '#screenshots', id: 'screenshots' },
      { label: '常见概念', href: '#concepts', id: 'concepts' },
    ],
  },
  {
    title: '安装指南',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
    items: [
      { label: '桌面客户端', href: '#desktop', id: 'desktop' },
      { label: 'pip 安装', href: '#pip-install', id: 'pip-install' },
      { label: 'Docker 部署', href: '#docker', id: 'docker' },
      { label: '飞牛 FnOS', href: '#fnos', id: 'fnos' },
      { label: '系统要求', href: '#requirements', id: 'requirements' },
    ],
  },
  {
    title: '核心概念',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
      </svg>
    ),
    items: [
      { label: '专家系统', href: '#experts', id: 'experts' },
      { label: '多 Agent 协作', href: '#multi-agent', id: 'multi-agent' },
      { label: '知识库 RAG', href: '#knowledge-rag', id: 'knowledge-rag' },
    ],
  },
  {
    title: '连接器',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
    items: [
      { label: '连接器概述', href: '#connectors-overview', id: 'connectors-overview' },
      { label: '内置连接器', href: '#builtin-connectors', id: 'builtin-connectors' },
      { label: '自定义连接器', href: '#custom-connectors', id: 'custom-connectors' },
    ],
  },
  {
    title: 'API 参考',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    ),
    items: [
      { label: 'REST API', href: '#rest-api', id: 'rest-api' },
      { label: 'SSE 事件流', href: '#sse', id: 'sse' },
    ],
  },
]

/* ─── 搜索索引 ─── */
const SEARCH_ITEMS: SearchItem[] = NAV_SECTIONS.flatMap((s) =>
  s.items.map((item) => ({
    id: item.id,
    title: item.label,
    section: item.label,
    sectionGroup: s.title,
  }))
)

/* ─── 目录标题数据 ─── */
const TOC_ITEMS = [
  { id: 'intro-philosophy', text: '核心理念', level: 2 },
  { id: 'intro-highlights', text: '六大亮点', level: 2 },
  { id: 'quickstart-install', text: '安装', level: 2 },
  { id: 'quickstart-first-launch', text: '首次启动', level: 2 },
  { id: 'quickstart-steps', text: '四步上手流程', level: 2 },
  { id: 'screenshots-dashboard', text: 'Dashboard 概览', level: 2 },
  { id: 'screenshots-grid', text: '功能截图', level: 2 },
  { id: 'screenshots-video', text: '视频教程', level: 2 },
]

/* ═══════════════════════════════════════════════
   工具组件
   ═══════════════════════════════════════════════ */

function FeatureCard({ icon, title, desc }: { icon: ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 hover:border-yuanbao-500/30 hover:bg-yuanbao-500/[0.03] transition-all duration-300">
      <div className="w-10 h-10 rounded-lg bg-yuanbao-500/10 flex items-center justify-center text-yuanbao-400 mb-3">
        {icon}
      </div>
      <h3 className="text-white font-semibold mb-1.5">{title}</h3>
      <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
    </div>
  )
}

/** CTA 卡片 — 对标 Octop 三入口 */
function CtaCard({
  emoji,
  title,
  desc,
  href,
}: {
  emoji: string
  title: string
  desc: string
  href: string
}) {
  const handleClick = () => {
    const id = href.replace('#', '')
    const el = document.getElementById(id)
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  return (
    <button
      onClick={handleClick}
      className="group text-left p-5 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:border-yuanbao-500/30 hover:bg-yuanbao-500/[0.04] transition-all duration-300"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl mt-0.5">{emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-semibold text-base">{title}</h3>
            <svg className="w-4 h-4 text-white/20 group-hover:text-yuanbao-400 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </div>
          <p className="text-sm text-white/45 mt-1 leading-relaxed">{desc}</p>
        </div>
      </div>
    </button>
  )
}

/* ═══════════════════════════════════════════════
   主组件
   ═══════════════════════════════════════════════ */

export default function DocsPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())
  const [searchOpen, setSearchOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('intro')
  const contentRef = useRef<HTMLDivElement>(null)

  // 监听 Navbar 搜索事件
  useEffect(() => {
    const handler = () => setSearchOpen(true)
    window.addEventListener('ydsz:open-search', handler)
    return () => window.removeEventListener('ydsz:open-search', handler)
  }, [])

  // Cmd+K 文档内搜索触发
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // 滚动监听 — 高亮当前 section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length > 0) {
          const top = visible.reduce((a, b) =>
            a.boundingClientRect.top < b.boundingClientRect.top ? a : b
          )
          setActiveSection(top.target.id)
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    )
    const sections = contentRef.current?.querySelectorAll('[data-doc-section]')
    sections?.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  const toggleSection = (title: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev)
      if (next.has(title)) {
        next.delete(title)
      } else {
        next.add(title)
      }
      return next
    })
  }

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80
      window.scrollTo({ top, behavior: 'smooth' })
      setMobileNavOpen(false)
    }
  }, [])

  // 搜索选中处理
  const handleSearchSelect = useCallback((id: string) => {
    scrollToSection(id)
  }, [scrollToSection])

  // 面包屑
  const currentSectionGroup = NAV_SECTIONS.find((s) => s.items.some((i) => i.id === activeSection))
  const currentNavItem = NAV_SECTIONS.flatMap((s) => s.items).find((i) => i.id === activeSection)

  // 展开当前分组
  useEffect(() => {
    if (currentSectionGroup && collapsedSections.has(currentSectionGroup.title)) {
      setCollapsedSections((prev) => {
        const next = new Set(prev)
        next.delete(currentSectionGroup.title)
        return next
      })
    }
  }, [activeSection, currentSectionGroup, collapsedSections])

  return (
    <div className="min-h-screen bg-ink-900 pt-14">
      {/* 滚动进度条 (P2-11) */}
      <ReadingProgressBar />

      {/* 搜索弹窗 (P0-2) */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        items={SEARCH_ITEMS}
        onSelect={handleSearchSelect}
      />

      {/* ── 文档顶部栏 ── */}
      <div className="border-b border-white/[0.06] bg-ink-900/50 backdrop-blur-sm">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-3 flex items-center justify-between">
          {/* 面包屑 */}
          <div className="flex items-center gap-1.5 text-sm text-white/40 min-w-0">
            <Link to="/" className="hover:text-white/70 transition-colors flex-shrink-0">首页</Link>
            <span className="flex-shrink-0">/</span>
            <span className="text-white/55 flex-shrink-0">文档</span>
            {currentSectionGroup && (
              <>
                <span className="flex-shrink-0">/</span>
                <span className="text-white/55 truncate">{currentSectionGroup.title}</span>
              </>
            )}
            <span className="flex-shrink-0">/</span>
            <span className="text-white/80 font-medium truncate">{currentNavItem?.label ?? '简介'}</span>
          </div>

          {/* 右侧操作 (P0-4 + P2-10) */}
          <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
            <span className="text-[11px] text-white/25">更新于 2026-11-02</span>
            <button
              onClick={() => {
                const text = document.querySelector('article')?.textContent?.trim() ?? ''
                navigator.clipboard.writeText(text.slice(0, 5000)).catch(() => {})
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-white/40 hover:text-white/70 hover:bg-white/[0.04] border border-white/[0.08] transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
              </svg>
              复制 Markdown
            </button>
            <a
              href="https://gitee.com/njydsz/ydsz-worker/blob/main/website/src/pages/DocsPage.tsx"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-white/40 hover:text-white/70 hover:bg-white/[0.04] border border-white/[0.08] transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
              GitHub 编辑
            </a>
          </div>

          {/* 移动端导航切换 */}
          <button
            className="lg:hidden flex items-center gap-2 px-3 py-1.5 text-sm text-white/70 bg-white/[0.04] rounded-lg border border-white/[0.06]"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
            导航
          </button>
        </div>

        {/* 移动端下拉导航 */}
        {mobileNavOpen && (
          <div className="lg:hidden border-t border-white/[0.06] bg-ink-800/95 backdrop-blur-xl max-h-[60vh] overflow-y-auto">
            <div className="px-6 py-4 space-y-4">
              {NAV_SECTIONS.map((section) => (
                <div key={section.title}>
                  <h4 className="text-xs uppercase tracking-wider text-white/40 mb-2">{section.title}</h4>
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className={`block w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors ${
                          activeSection === item.id
                            ? 'text-yuanbao-400 bg-yuanbao-500/[0.08]'
                            : 'text-white/60 hover:text-white/80 hover:bg-white/[0.04]'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── 三栏布局：侧栏 + 正文 + TOC ── */}
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 flex gap-6 py-6">
        {/* ── 左侧 Sidebar ── */}
        <aside className="w-56 xl:w-60 shrink-0 hidden lg:block">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin pb-8">
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-5 px-2">
              <img src="/logo-appicon.png" alt="Ydsz Worker" className="h-6 w-6 rounded-md" />
              <span className="text-sm font-bold text-white/80 tracking-tight">产品文档</span>
            </div>

            {/* 导航分组 */}
            <nav className="space-y-4">
              {NAV_SECTIONS.map((section) => {
                const isCollapsed = collapsedSections.has(section.title)
                const isActive = section.items.some((i) => i.id === activeSection)
                return (
                  <div key={section.title}>
                    <button
                      onClick={() => toggleSection(section.title)}
                      className="w-full flex items-center justify-between group mb-1.5 px-1"
                    >
                      <h4 className={`flex items-center gap-1.5 text-[11px] uppercase tracking-wider transition-colors ${
                        isActive ? 'text-yuanbao-400/70' : 'text-white/30 group-hover:text-white/50'
                      }`}>
                        <span className={isActive ? 'text-yuanbao-500/80' : 'text-yuanbao-500/40'}>{section.icon}</span>
                        {section.title}
                      </h4>
                      <svg
                        className={`w-3 h-3 text-white/25 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className={`space-y-0.5 overflow-hidden transition-all duration-300 ${
                      isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'
                    }`}>
                      {section.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => scrollToSection(item.id)}
                          className={`w-full text-left px-3 py-1.5 text-[13px] rounded-md transition-all duration-200 ${
                            activeSection === item.id
                              ? 'text-yuanbao-400 font-medium border-l-2 border-yuanbao-500 bg-yuanbao-500/[0.06] -ml-px'
                              : 'text-white/45 hover:text-white/80 hover:bg-white/[0.03]'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </nav>

            <SectionDivider variant="line" />

            {/* 帮助链接 */}
            <div className="mt-4 px-2">
              <p className="text-[11px] text-white/25 mb-2.5 uppercase tracking-wider">需要帮助？</p>
              <div className="space-y-1.5">
                <a href="https://github.com/ydsz-buddy/ydsz-worker/issues" className="block text-[13px] text-white/45 hover:text-yuanbao-400 transition-colors" target="_blank" rel="noopener noreferrer">
                  GitHub Issues
                </a>
                <a href="#" className="block text-[13px] text-white/45 hover:text-yuanbao-400 transition-colors">
                  微信群
                </a>
                <a href="mailto:support@ydsz.dev" className="block text-[13px] text-white/45 hover:text-yuanbao-400 transition-colors">
                  邮箱支持
                </a>
              </div>
            </div>
          </div>
        </aside>

        {/* ── 中间正文 ── */}
        <main ref={contentRef} className="flex-1 min-w-0">
          <article className="max-w-3xl mx-auto">
            {/* ═══ Section: 简介 ═══ */}
            <div id="intro" data-doc-section className="mb-16">
              <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-yuanbao-500/10 text-yuanbao-400 mb-3">入门</span>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">简介</h1>
              <p className="text-base text-white/55 mb-6">云顶数字工作台是什么，它解决了什么问题</p>

              {/* CTA 入口卡片 (P1-6) */}
              <div className="grid sm:grid-cols-3 gap-3 mb-8">
                <CtaCard
                  emoji="🚀"
                  title="先聊起来"
                  desc="安装、完成设置向导、填好模型，发出第一条消息"
                  href="#quickstart"
                />
                <CtaCard
                  emoji="🤖"
                  title="创建你的助理"
                  desc="选一个专家模板，配上性格、文档和渠道"
                  href="#experts"
                />
                <CtaCard
                  emoji="💬"
                  title="接到聊天里"
                  desc="扫码把专家接到飞书、钉钉或企业微信"
                  href="#screenshots"
                />
              </div>

              <div className="space-y-6">
                <section id="intro-philosophy">
                  <h2 id="intro-philosophy" className="text-xl font-bold text-white mb-2.5">核心理念</h2>
                  <p className="text-white/60 leading-relaxed">
                    云顶数字工作台（Ydsz Worker）是一个自托管的企业级 AI 助手平台。它不依赖任何外部云服务，完全运行在你自己的硬件上，
                    确保数据隐私和安全。通过整合 LLM、多 Agent 协作、知识库、IM 通道、定时任务等能力，
                    它为企业和个人提供了一个"会思考、能干活、陪成长"的智能伙伴。
                  </p>
                  <p className="text-white/60 leading-relaxed mt-2.5">
                    与传统 SaaS AI 工具不同，Ydsz Worker 的核心哲学是：<strong className="text-white/80">数据归你、能力可扩展、生态开放</strong>。
                    无论是接入企业微信、飞书、钉钉等 IM 平台，还是集成自定义的 MCP 工具，都能在配置文件中完成。
                  </p>
                </section>

                <section id="intro-highlights">
                  <h2 id="intro-highlights" className="text-xl font-bold text-white mb-3">六大亮点</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FeatureCard
                      icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" /></svg>}
                      title="会思考"
                      desc="深度推理引擎，支持多轮对话、工具调用链、自主规划任务分解。Agent 能理解复杂意图，选择正确的工具执行。"
                    />
                    <FeatureCard
                      icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.1-5.1m0 0L11.42 4.97m-5.1 5.1H21" /></svg>}
                      title="能干活"
                      desc="浏览器自动化、文件处理、定时任务、API 调用。从数据抓取到报告生成，Agent 帮你完成真实的工作任务。"
                    />
                    <FeatureCard
                      icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>}
                      title="能协作"
                      desc="多 Agent 团队协作，ACP 协议支持跨平台 Agent 通信。专家系统让每个 Agent 各司其职，共同完成复杂目标。"
                    />
                    <FeatureCard
                      icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>}
                      title="安全可控"
                      desc="完全自托管部署，所有数据存储在本地 SQLite 或你自己的 PostgreSQL 中。零外部依赖，企业数据不出内网。"
                    />
                    <FeatureCard
                      icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v2.25A2.25 2.25 0 006 10.5zm0 9.75h2.25A2.25 2.25 0 0010.5 18v-2.25a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25V18A2.25 2.25 0 006 20.25zm9.75-9.75H18a2.25 2.25 0 002.25-2.25V6A2.25 2.25 0 0018 3.75h-2.25A2.25 2.25 0 0013.5 6v2.25a2.25 2.25 0 002.25 2.25z" /></svg>}
                      title="自由集成"
                      desc="MCP 网关支持接入任意工具，连接器架构让你轻松对接第三方 OAuth 服务。开放式插件生态，随时扩展能力。"
                    />
                    <FeatureCard
                      icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" /></svg>}
                      title="成长陪伴"
                      desc="记忆系统跨会话保持上下文，MBTI 人格系统让 Agent 风格与你匹配。越用越懂你，成为你的数字工作搭子。"
                    />
                  </div>
                </section>
              </div>

              {/* 分页 */}
              <nav className="flex items-center justify-between mt-12 pt-6 border-t border-white/[0.06]">
                <div></div>
                <button onClick={() => scrollToSection('quickstart')} className="flex items-center gap-2 text-sm text-yuanbao-400 hover:text-yuanbao-300 transition-colors">
                  快速开始
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                </button>
              </nav>
            </div>

            {/* ═══ Section: 快速开始 ═══ */}
            <div id="quickstart" data-doc-section className="mb-16">
              <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-yuanbao-500/10 text-yuanbao-400 mb-3">入门</span>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">快速开始</h1>
              <p className="text-base text-white/55 mb-6">四步上手，五分钟跑起来</p>

              <div className="space-y-6">
                <section>
                  <h2 id="quickstart-install" className="text-xl font-bold text-white mb-2.5">安装</h2>
                  <p className="text-white/60 leading-relaxed mb-2">
                    最快捷的方式是使用 <code className="px-1.5 py-0.5 rounded bg-white/[0.06] text-yuanbao-300 text-sm font-mono">uv</code> 安装：
                  </p>
                  <SyntaxCodeBlock
                    language="bash"
                    title="terminal"
                    code={`pip install ydsz-worker
# 或者使用 uv（推荐）
uv tool install ydsz-worker`}
                  />
                </section>

                <section>
                  <h2 id="quickstart-first-launch" className="text-xl font-bold text-white mb-2.5">首次启动</h2>
                  <p className="text-white/60 leading-relaxed mb-2">
                    运行启动命令，程序会自动创建 SQLite 数据库并引导你完成初始化配置：
                  </p>
                  <SyntaxCodeBlock
                    language="bash"
                    title="terminal"
                    code={`ydsz-worker run

# 输出：
# ✓ Database initialized at ~/.ydsz-worker/data.db
# ✓ Config file created at ~/.ydsz-worker/config.json
# ➜ Dashboard: http://localhost:8080
# ➜ API Docs:  http://localhost:8080/api/docs`}
                  />
                </section>

                <section>
                  <h2 id="quickstart-steps" className="text-xl font-bold text-white mb-3">四步上手流程</h2>
                  <div className="space-y-3">
                    {[
                      { step: '1', title: '设置 LLM 提供商', desc: '在 Dashboard 设置页面填入你的 OpenAI/Anthropic/Ollama API Key，或选择本地 Ollama 模型。' },
                      { step: '2', title: '创建 Agent', desc: '新建你的第一个 Agent，选择一个 Expert 模板（如 Code Expert），赋予它合适的人格和能力。' },
                      { step: '3', title: '开启对话', desc: '在聊天窗口中发送消息，Agent 会调用工具（浏览器、代码执行、文件操作等）帮你完成任务。' },
                      { step: '4', title: '配置 IM 通道', desc: '绑定企业微信/飞书/钉钉，让 Agent 在日常工作群中响应消息，提供 7×24 服务。' },
                    ].map((item) => (
                      <div key={item.step} className="flex gap-3.5 items-start">
                        <div className="w-7 h-7 shrink-0 rounded-lg bg-yuanbao-500/15 text-yuanbao-400 flex items-center justify-center text-xs font-bold">
                          {item.step}
                        </div>
                        <div>
                          <h4 className="text-white/90 font-medium text-sm mb-0.5">{item.title}</h4>
                          <p className="text-sm text-white/50">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <Callout type="tip" title="推荐配置">
                  使用 uv 安装比 pip 快 10 倍，且自动隔离依赖。推荐所有用户使用 <code className="px-1 py-0.5 rounded bg-yuanbao-500/10 text-yuanbao-300 text-xs font-mono">uv tool install ydsz-worker</code>。
                </Callout>
              </div>

              {/* 分页 */}
              <nav className="flex items-center justify-between mt-12 pt-6 border-t border-white/[0.06]">
                <button onClick={() => scrollToSection('intro')} className="flex items-center gap-2 text-sm text-white/50 hover:text-white/70 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                  简介
                </button>
                <button onClick={() => scrollToSection('screenshots')} className="flex items-center gap-2 text-sm text-yuanbao-400 hover:text-yuanbao-300 transition-colors">
                  截图和视频
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                </button>
              </nav>
            </div>

            {/* ═══ Section: 截图和视频 ═══ */}
            <div id="screenshots" data-doc-section className="mb-16">
              <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-yuanbao-500/10 text-yuanbao-400 mb-3">入门</span>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">截图和视频</h1>
              <p className="text-base text-white/55 mb-6">一览 Dashboard 的核心界面</p>

              <div className="space-y-6">
                <section id="screenshots-dashboard">
                  <h2 className="text-xl font-bold text-white mb-2.5">Dashboard 概览</h2>
                  <p className="text-white/60 leading-relaxed mb-4">
                    Ydsz Worker 提供了功能完整的 Web Dashboard，你可以通过它管理 Agent、监控会话、配置连接器和 IM 通道。
                    四条核心工作流在首页一目了然：对话管理、专家配置、插件市场和系统监控。
                  </p>

                  {/* 嵌入产品截图 (P0-3) */}
                  <div className="rounded-xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-yuanbao-500/[0.03] my-4">
                    <div className="bg-ink-800 px-4 py-2.5 border-b border-white/[0.06] flex items-center gap-2.5">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                      </div>
                      <span className="text-xs text-white/35 font-mono">Dashboard · Ydsz Worker</span>
                    </div>
                    <div className="p-1 bg-ink-900/50">
                      <DashboardMock />
                    </div>
                  </div>
                  <p className="text-center text-xs text-white/30 mt-2">Ydsz Worker Dashboard — 对话界面 + 文件面板 + 终端预览</p>
                </section>

                <section id="screenshots-grid">
                  <h2 className="text-xl font-bold text-white mb-3">功能截图</h2>
                  {/* 表格 (P1-8) */}
                  <div className="rounded-xl border border-white/[0.06] overflow-hidden my-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                          <th className="text-left px-4 py-3 text-white/70 font-medium">功能</th>
                          <th className="text-left px-4 py-3 text-white/70 font-medium">描述</th>
                          <th className="text-left px-4 py-3 text-white/70 font-medium hidden sm:table-cell">适用场景</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        <tr className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3 text-yuanbao-400 font-medium">对话界面</td>
                          <td className="px-4 py-3 text-white/55">多轮对话，工具调用可视化，附件上传与代码高亮</td>
                          <td className="px-4 py-3 text-white/35 hidden sm:table-cell">日常问答、编程辅助</td>
                        </tr>
                        <tr className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3 text-yuanbao-400 font-medium">Agent 管理</td>
                          <td className="px-4 py-3 text-white/55">创建、配置、启停 Agent，设置 SOUL 人格和专家模板</td>
                          <td className="px-4 py-3 text-white/35 hidden sm:table-cell">多角色管理</td>
                        </tr>
                        <tr className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3 text-yuanbao-400 font-medium">定时任务面板</td>
                          <td className="px-4 py-3 text-white/55">可视化管理 Cron 任务，支持 Webhook 触发和手动执行</td>
                          <td className="px-4 py-3 text-white/35 hidden sm:table-cell">定时推送、巡检</td>
                        </tr>
                        <tr className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3 text-yuanbao-400 font-medium">连接器配置</td>
                          <td className="px-4 py-3 text-white/55">OAuth 授权、MCP 工具注册、第三方服务绑定</td>
                          <td className="px-4 py-3 text-white/35 hidden sm:table-cell">企业集成</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>

                <section id="screenshots-video">
                  <h2 className="text-xl font-bold text-white mb-2.5">视频教程</h2>
                  <p className="text-white/60 leading-relaxed">
                    我们制作了一系列入门视频教程，涵盖了安装、配置、创建第一个 Agent 以及接入 IM 通道的完整流程。
                    <a href="#" className="text-yuanbao-400 hover:text-yuanbao-300 underline underline-offset-4 ml-1">前往 B 站观看 →</a>
                  </p>
                </section>
              </div>

              {/* 分页 */}
              <nav className="flex items-center justify-between mt-12 pt-6 border-t border-white/[0.06]">
                <button onClick={() => scrollToSection('quickstart')} className="flex items-center gap-2 text-sm text-white/50 hover:text-white/70 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                  快速开始
                </button>
                <button onClick={() => scrollToSection('concepts')} className="flex items-center gap-2 text-sm text-yuanbao-400 hover:text-yuanbao-300 transition-colors">
                  常见概念
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                </button>
              </nav>
            </div>

            {/* ═══ Section: 常见概念 ═══ */}
            <div id="concepts" data-doc-section className="mb-16">
              <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-yuanbao-500/10 text-yuanbao-400 mb-3">入门</span>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">常见概念</h1>
              <p className="text-base text-white/55 mb-6">理解 Ydsz Worker 的核心术语</p>

              <div className="space-y-4">
                {[
                  { name: 'Agent', desc: 'Agent 是 Ydsz Worker 的核心运行单元。每个 Agent 拥有自己的 Workspace、SOUL 人格定义、绑定的 Expert 和工具集。你可以创建多个 Agent，各自承担不同职责。' },
                  { name: 'Session（会话）', desc: '会话是用户与 Agent 之间的一次交互上下文。每个会话包含完整的消息历史、工具调用记录和中间状态。会话支持持久化。' },
                  { name: 'Thread（话题）', desc: 'Thread 是 IM 通道中的消息线程。当 Agent 在群聊中被 @ 触发时，Thread 跟踪该次对话的上下文。' },
                  { name: 'Workspace（工作区）', desc: '每个 Agent 拥有独立的 Workspace 目录，存储 SOUL.md 人格文件、Memory 记忆、Skills 技能树和配置文件。' },
                  { name: 'Expert（专家）', desc: 'Expert 是预配置的 Agent 模板，内置了特定领域的 Tool Set、SOUL 定义和工作流。' },
                  { name: 'MCP（Model Context Protocol）', desc: 'MCP 是开放协议，让 AI 模型能够安全地连接外部工具和数据源。Ydsz Worker 内置 MCP 网关。' },
                ].map((concept, idx) => (
                  <section key={concept.name} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="w-6 h-6 rounded-md bg-yuanbao-500/10 flex items-center justify-center text-yuanbao-400 text-[11px] font-bold">
                        {idx + 1}
                      </span>
                      <h2 className="text-base font-bold text-white">{concept.name}</h2>
                    </div>
                    <p className="text-sm text-white/55 leading-relaxed">{concept.desc}</p>
                  </section>
                ))}
              </div>

              <Callout type="info" title="了解更多">
                想深入了解每个概念的技术细节？请参考 <a href="#" className="text-yuanbao-400 hover:underline">核心概念</a> 和 <a href="#" className="text-yuanbao-400 hover:underline">API 参考</a> 章节。
              </Callout>

              {/* 分页 */}
              <nav className="flex items-center justify-between mt-12 pt-6 border-t border-white/[0.06]">
                <button onClick={() => scrollToSection('screenshots')} className="flex items-center gap-2 text-sm text-white/50 hover:text-white/70 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                  截图和视频
                </button>
                <button onClick={() => scrollToSection('intro')} className="flex items-center gap-2 text-sm text-yuanbao-400 hover:text-yuanbao-300 transition-colors">
                  返回简介
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                </button>
              </nav>
            </div>

            {/* ── 文档底部 ── */}
            <div className="text-center py-10 border-t border-white/[0.06]">
              <p className="text-sm text-white/30">
                找不到所需内容？
                <a href="https://github.com/ydsz-buddy/ydsz-worker/issues" className="text-yuanbao-400 hover:text-yuanbao-300 ml-1 underline underline-offset-4" target="_blank" rel="noopener noreferrer">
                  在 GitHub 发起 Issue
                </a>
              </p>
            </div>
          </article>
        </main>

        {/* ── 右侧 TOC (P0-1) ── */}
        <aside className="w-52 shrink-0 hidden xl:block">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pb-8">
            <TableOfContents items={TOC_ITEMS} />

            {/* 页内锚点链接 */}
            <div className="mt-8 pt-4 border-t border-white/[0.06]">
              <p className="text-[11px] text-white/25 mb-2.5 uppercase tracking-wider">本页操作</p>
              <div className="space-y-1.5">
                <a
                  href="https://gitee.com/njydsz/ydsz-worker"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[13px] text-white/45 hover:text-yuanbao-400 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                  在 Gitee 查看源码
                </a>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="flex items-center gap-2 text-[13px] text-white/45 hover:text-yuanbao-400 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                  </svg>
                  回到顶部
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
