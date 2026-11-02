import { useState, useEffect, useRef, useCallback, type RefObject } from 'react'
import DashboardMock from '../components/DashboardMock'
import TableOfContents from '../components/docs/TableOfContents'
import SearchModal, { type SearchItem } from '../components/docs/SearchModal'
import SyntaxCodeBlock from '../components/docs/SyntaxCodeBlock'
import Callout from '../components/docs/Callout'

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
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: '开始使用',
    items: [
      { label: '简介', href: '#intro', id: 'intro' },
      { label: '快速开始', href: '#quickstart', id: 'quickstart' },
      { label: '截图和视频', href: '#screenshots', id: 'screenshots' },
      { label: '常见概念', href: '#concepts', id: 'concepts' },
    ],
  },
  {
    title: '安装指南',
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
    items: [
      { label: '专家系统', href: '#experts', id: 'experts' },
      { label: '多 Agent 协作', href: '#multi-agent', id: 'multi-agent' },
      { label: '知识库 RAG', href: '#knowledge-rag', id: 'knowledge-rag' },
    ],
  },
  {
    title: '连接器',
    items: [
      { label: '连接器概述', href: '#connectors-overview', id: 'connectors-overview' },
      { label: '内置连接器', href: '#builtin-connectors', id: 'builtin-connectors' },
      { label: '自定义连接器', href: '#custom-connectors', id: 'custom-connectors' },
    ],
  },
  {
    title: 'API 参考',
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

/** CTA 卡片 — 对标 Octop 三入口 */
function CtaCard({
  emoji,
  title,
  description,
  href,
}: {
  emoji: string
  title: string
  description: string
  href: string
}) {
  const handleClick = () => {
    const id = href.replace('#', '')
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <button
      onClick={handleClick}
      className="group/doc text-left rounded-xl border border-white/[0.08] bg-white/[0.025] hover:border-yuanbao-500/[0.25] hover:bg-yuanbao-500/[0.04] transition-all duration-300"
    >
      <div className="p-5">
        <div className="flex items-start gap-3">
          <span className="text-[28px] leading-none mt-0.5">{emoji}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="text-[15px] font-semibold text-white/90 group-hover/doc:text-yuanbao-400 transition-colors">{title}</h3>
              <svg className="w-3.5 h-3.5 text-white/15 group-hover/doc:text-yuanbao-400 group-hover/doc:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
            <p className="text-[13px] text-white/45 leading-relaxed">{description}</p>
          </div>
        </div>
      </div>
    </button>
  )
}

/* ═══════════════════════════════════════════════
   主组件 — 布局参考 docs.octop.cloud:
   - 顶栏轻薄面包屑 + Copy/编辑
   - 左侧 sticky sidebar (不独立滚动)
   - 中间文章流式布局 (滚动)
   - 右侧 TOC (sticky)
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

  // 滚动监听 — 高亮当前 section (监听内容容器)
  useEffect(() => {
    const container = contentRef.current
    if (!container) return
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
      { root: container, rootMargin: '-10% 0px -60% 0px', threshold: 0 }
    )
    const sections = container.querySelectorAll('[data-doc-section]')
    sections?.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  const toggleSection = (title: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev)
      if (next.has(title)) next.delete(title)
      else next.add(title)
      return next
    })
  }

  const scrollToSection = useCallback((id: string) => {
    const container = contentRef.current
    const el = document.getElementById(id)
    if (container && el) {
      const top = el.offsetTop - 24
      container.scrollTo({ top, behavior: 'smooth' })
    }
    setMobileNavOpen(false)
  }, [])

  const handleSearchSelect = useCallback((id: string) => {
    scrollToSection(id)
  }, [scrollToSection])

  // 展开当前分组
  useEffect(() => {
    const group = NAV_SECTIONS.find((s) => s.items.some((i) => i.id === activeSection))
    if (group && collapsedSections.has(group.title)) {
      setCollapsedSections((prev) => {
        const next = new Set(prev)
        next.delete(group.title)
        return next
      })
    }
  }, [activeSection, collapsedSections])

  const currentNavItem = NAV_SECTIONS.flatMap((s) => s.items).find((i) => i.id === activeSection)
  const isSectionCollapsed = (title: string) => collapsedSections.has(title)

  return (
    <div className="h-screen bg-ink-900 pt-14 flex flex-col overflow-hidden">
      {/* 搜索弹窗 */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        items={SEARCH_ITEMS}
        onSelect={handleSearchSelect}
      />

      {/* ── 轻薄顶栏（面包屑 + 操作） ── */}
      <div className="shrink-0 border-b border-white/[0.05] bg-ink-900/40 backdrop-blur-sm z-10">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-2.5 flex items-center justify-between">
          {/* 面包屑 — Octop 风格 */}
          <div className="flex items-center gap-1.5 text-[13px] text-white/30 min-w-0">
            <span className="text-white/20">开始使用 {'>'} </span>
            <span className="text-white/80 font-medium truncate">{currentNavItem?.label ?? '简介'}</span>
          </div>

          {/* 右侧操作 */}
          <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
            <span className="text-[11px] text-white/20">更新于 2026-11-02</span>
            <button
              onClick={() => {
                const text = document.querySelector('.docs-article')?.textContent?.trim() ?? ''
                navigator.clipboard.writeText(text.slice(0, 5000)).catch(() => {})
              }}
              className="flex items-center gap-1.5 px-2 py-1 rounded text-[11px] text-white/35 hover:text-white/60 hover:bg-white/[0.04] border border-transparent hover:border-white/[0.08] transition-all"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
              </svg>
              复制 Markdown
            </button>
            <a
              href="https://gitee.com/njydsz/ydsz-worker/blob/main/website/src/pages/DocsPage.tsx"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2 py-1 rounded text-[11px] text-white/35 hover:text-white/60 hover:bg-white/[0.04] border border-transparent hover:border-white/[0.08] transition-all"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              编辑此页
            </a>
          </div>

          {/* 移动端菜单 */}
          <button
            className="lg:hidden flex items-center gap-1.5 px-2.5 py-1 text-[12px] text-white/60 bg-white/[0.04] rounded border border-white/[0.06]"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            导航
          </button>
        </div>

        {/* 移动端下拉导航 */}
        {mobileNavOpen && (
          <div className="lg:hidden border-t border-white/[0.05] bg-ink-800/95 backdrop-blur-xl max-h-[55vh] overflow-y-auto scrollbar-thin">
            <div className="px-5 py-3 space-y-3">
              {NAV_SECTIONS.map((section) => (
                <div key={section.title}>
                  <h4 className="text-[10px] uppercase tracking-wider text-white/30 mb-1.5">{section.title}</h4>
                  <div className="space-y-0.5">
                    {section.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className={`block w-full text-left px-3 py-1.5 text-[13px] rounded-md transition-colors ${
                          activeSection === item.id
                            ? 'text-yuanbao-400 bg-yuanbao-500/[0.08]'
                            : 'text-white/55 hover:text-white/80 hover:bg-white/[0.04]'
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

      {/* ── 三栏布局（侧栏、正文、目录） ── */}
      <div className="flex-1 min-h-0 overflow-hidden max-w-[1400px] mx-auto w-full px-4 lg:px-8 flex gap-8 py-5">
        {/* ── 左侧 Sidebar ── */}
        <aside className="w-52 xl:w-56 shrink-0 hidden lg:block">
          <div className="sticky top-5 pb-10">
            {/* 分组侧栏 */}
            <nav className="space-y-3.5">
              {NAV_SECTIONS.map((section) => {
                const isActive = section.items.some((i) => i.id === activeSection)
                const isCollapsed = isSectionCollapsed(section.title)
                return (
                  <div key={section.title}>
                    <button
                      onClick={() => toggleSection(section.title)}
                      className="w-full flex items-center justify-between group mb-1"
                    >
                      <h4 className={`text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                        isActive ? 'text-white/60' : 'text-white/25 group-hover:text-white/40'
                      }`}>
                        {section.title}
                      </h4>
                      <svg
                        className={`w-3 h-3 text-white/20 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className={`space-y-0 overflow-hidden transition-all duration-300 ${
                      isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[400px] opacity-100'
                    }`}>
                      {section.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => scrollToSection(item.id)}
                          className={`w-full text-left pl-2 pr-2 py-1.5 text-[13px] rounded transition-all duration-200 ${
                            activeSection === item.id
                              ? 'text-yuanbao-400 font-medium'
                              : 'text-white/35 hover:text-white/70'
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
          </div>
        </aside>

        {/* ── 中间正文 ── */}
        <main ref={contentRef} className="flex-1 min-w-0 overflow-y-auto scrollbar-thin">
          <article className="docs-article max-w-[720px] mx-auto pb-16">

            {/* ═══ Section 简介 ═══ */}
            <div id="intro" data-doc-section>
              {/* H1 + 操作 */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <h1 className="text-3xl font-extrabold text-white tracking-tight">
                  Octop：自托管多用户 AI 助手
                </h1>
              </div>

              {/* Tagline */}
              <p className="text-[15px] text-white/50 leading-relaxed mb-8">
                懂你、帮你陪你成长的智能伙伴
              </p>

              {/* 引言段落 - Octop 风格 图文混排 */}
              <p className="text-white/55 text-[15px] leading-[1.85] mb-6">
                云顶数字工作台跑在你自己的电脑或服务器上。装好之后，你在网页里和专家聊天；
                也可以把同一个专家接到飞书、企业微信、钉钉、QQ、微信或 Telegram。
                对话和凭据都留在这台机器的 <code className="text-yuanbao-400 bg-yuanbao-500/[0.08] px-1.5 py-0.5 rounded text-[13px] font-mono">~/.ydsz-worker/</code>。
              </p>

              {/* 嵌入式截图 (P0-3) */}
              <figure className="rounded-xl overflow-hidden border border-white/[0.07] shadow-xl shadow-black/20 my-6">
                <div className="bg-ink-800 px-4 py-2 border-b border-white/[0.06] flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                  </div>
                  <span className="text-[11px] text-white/30 font-mono">Dashboard · 云顶数字工作台</span>
                </div>
                <div className="bg-ink-900/30 p-1">
                  <DashboardMock />
                </div>
              </figure>
              <figcaption className="text-center text-[12px] text-white/25 -mt-3 mb-8">
                图 1 · 云顶数字工作台对话界面 — 对话 · 文件面板 · 终端预览
              </figcaption>

              {/* CTA 三入口 (P1-6) */}
              <h2 id="intro-philosophy" className="text-[13px] uppercase font-semibold tracking-wider text-yuanbao-400/70 mb-4">
                先从这三件事里选一件
              </h2>
              <div className="grid sm:grid-cols-3 gap-2.5 mb-10">
                <CtaCard
                  emoji="🚀"
                  title="先聊起来"
                  description="安装、完成设置向导、填好模型，发出第一条消息"
                  href="#quickstart"
                />
                <CtaCard
                  emoji="🤖"
                  title="创建你的助理"
                  description="选一个专家模板，配上性格、文档和渠道"
                  href="#experts"
                />
                <CtaCard
                  emoji="💬"
                  title="接到聊天里"
                  description="扫码把专家接到飞书、钉钉或企业微信"
                  href="#screenshots"
                />
              </div>

              {/* 核心理念 - prose 风格 */}
              <h2 id="intro-highlights" className="text-xl font-bold text-white mb-3">
                核心理念
              </h2>
              <p className="text-white/55 text-[15px] leading-[1.85] mb-3">
                云顶数字工作台（Ydsz Worker）是一个自托管的企业级 AI 助手平台。
                它不依赖任何外部云服务，完全运行在你自己的硬件上，确保数据隐私和安全。
                通过整合 LLM、多 Agent 协作、知识库、IM 通道、定时任务等能力，
                为企业和个人提供了一个"会思考、能干活、陪成长"的智能伙伴。
              </p>
              <p className="text-white/55 text-[15px] leading-[1.85] mb-6">
                与传统 SaaS AI 工具不同，Ydsz Worker 的核心哲学是：
                <span className="heading-underline">数据归你、能力可扩展、生态开放</span>。
                无论是接入企业微信、飞书、钉钉等 IM 平台，还是集成自定义的 MCP 工具，都能在配置文件中完成。
              </p>

              {/* 六大亮点卡片 */}
              <h3 className="text-base font-semibold text-white/80 mb-3 mt-2">六大亮点</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
                {[
                  { icon: '🧠', title: '会思考', desc: '深度推理引擎，支持多轮对话、工具调用链、自主规划任务分解' },
                  { icon: '⚡', title: '能干活', desc: '浏览器自动化、文件处理、定时任务、API 调用。从数据抓取到报告生成' },
                  { icon: '🤝', title: '能协作', desc: '多 Agent 团队协作，ACP 协议支持跨平台 Agent 通信' },
                  { icon: '🔒', title: '安全可控', desc: '完全自托管部署，所有数据存储在本地，零外部依赖' },
                  { icon: '🔌', title: '自由集成', desc: 'MCP 网关支持接入任意工具，连接器架构轻松对接第三方服务' },
                  { icon: '🌱', title: '成长陪伴', desc: '记忆系统跨会话保持上下文，MBTI 人格系统让 Agent 与你匹配' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3.5 card-refined">
                    <span className="text-xl flex-shrink-0">{item.icon}</span>
                    <div>
                      <h4 className="text-[13px] font-semibold text-white/85 mb-0.5">{item.title}</h4>
                      <p className="text-[12px] text-white/40 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* 分页 */}
              <div className="flex items-center justify-between mt-10 pt-5 border-t border-white/[0.06]">
                <div></div>
                <button onClick={() => scrollToSection('quickstart')} className="group/doc flex items-center gap-1.5 text-[13px] text-yuanbao-400 hover:text-yuanbao-300 transition-colors">
                  下一节：快速开始
                  <svg className="w-4 h-4 group-hover/doc:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            </div>

            {/* ═══ Section 快速开始 ═══ */}
            <div id="quickstart" data-doc-section className="pt-12 mt-12 border-t border-white/[0.08]">
              <h1 className="text-2xl font-extrabold text-white mb-2">快速开始</h1>
              <p className="text-[13px] text-white/45 mb-8">四步上手，五分钟跑起来</p>

              <div className="space-y-7">
                <section>
                  <h2 id="quickstart-install" className="text-base font-semibold text-white mb-2">安装</h2>
                  <p className="text-white/55 text-[14px] leading-[1.8] mb-3">
                    最快捷的方式是使用 <code className="text-yuanbao-400 bg-yuanbao-500/[0.08] px-1.5 py-0.5 rounded text-[13px] font-mono">uv</code> 安装：
                  </p>
                  <SyntaxCodeBlock
                    language="bash"
                    title="terminal"
                    code={`pip install ydsz-worker\n# 或者使用 uv（推荐）\nuv tool install ydsz-worker`}
                  />
                </section>

                <section>
                  <h2 id="quickstart-first-launch" className="text-base font-semibold text-white mb-2">首次启动</h2>
                  <p className="text-white/55 text-[14px] leading-[1.8] mb-3">
                    运行启动命令，程序会自动创建 SQLite 数据库并引导你完成初始化配置：
                  </p>
                  <SyntaxCodeBlock
                    language="bash"
                    title="terminal"
                    code={`ydsz-worker run\n\n# 输出：\n# ✓ Database initialized at ~/.ydsz-worker/data.db\n# ✓ Config file created at ~/.ydsz-worker/config.json\n# ➜ Dashboard: http://localhost:8080\n# ➜ API Docs:  http://localhost:8080/api/docs`}
                  />
                </section>

                <section>
                  <h2 id="quickstart-steps" className="text-base font-semibold text-white mb-3">装好之后通常会这样用</h2>
                  <div className="space-y-3 mt-4">
                    {[
                      { 'title': '在网页里问一句', 'desc': '设置向导会留下默认专家 main。打开对话，直接说出你要办的事。' },
                      { 'title': '换成更对口的专家', 'desc': '打开专家 → 内置专家或专家市场，按周报、研究、代码这类工作创建。' },
                      { 'title': '让它读你的文件、操作你的应用', 'desc': '把规章、手册放进知识库。在连接器里授权邮箱、会议或文档服务。' },
                      { 'title': '不用一直开着网页', 'desc': '在通道里绑定后，在飞书或微信里发消息即可。需要固定推送时加一条定时任务。' },
                    ].map((step, i) => (
                      <div key={i} className="flex items-start gap-3.5 group/step">
                        <div className="w-6 h-6 shrink-0 rounded-full bg-yuanbao-500/[0.08] border border-yuanbao-500/20 flex items-center justify-center mt-0.5">
                          <span className="text-[12px] font-bold text-yuanbao-400">{i + 1}</span>
                        </div>
                        <div className="flex-1 pt-0.5">
                          <p className="text-[14px] leading-[1.75]">
                            <strong className="text-white/85 font-semibold">{step.title}。</strong>
                            <span className="text-white/50">{step.desc}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <Callout type="tip" title="推荐配置">
                  使用 uv 安装比 pip 快 10 倍，且自动隔离依赖。
                </Callout>
              </div>

              {/* 分页 */}
              <div className="flex items-center justify-between mt-10 pt-5 border-t border-white/[0.06]">
                <button onClick={() => scrollToSection('intro')} className="flex items-center gap-1 text-[13px] text-white/40 hover:text-white/65 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  简介
                </button>
                <button onClick={() => scrollToSection('screenshots')} className="group/doc flex items-center gap-1.5 text-[13px] text-yuanbao-400 hover:text-yuanbao-300 transition-colors">
                  截图和视频
                  <svg className="w-4 h-4 group-hover/doc:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            </div>

            {/* ═══ Section 截图和视频 ═══ */}
            <div id="screenshots" data-doc-section className="pt-12 mt-12 border-t border-white/[0.08]">
              <h1 className="text-2xl font-extrabold text-white mb-2">截图和视频</h1>
              <p className="text-[13px] text-white/45 mb-8">一览 Dashboard 的核心界面</p>

              <div className="space-y-6">
                <section id="screenshots-dashboard">
                  <h2 className="text-base font-semibold text-white mb-2.5">Dashboard 概览</h2>
                  <p className="text-white/55 text-[14px] leading-[1.8] mb-4">
                    Ydsz Worker 提供了功能完整的 Web Dashboard，你可以通过它管理 Agent、监控会话、配置连接器和 IM 通道。
                    四条核心工作流在首页一目了然：对话管理、专家配置、插件市场和系统监控。
                  </p>
                  {/* Dashboard 截图更精致 */}
                  <figure className="rounded-xl overflow-hidden border border-white/[0.07] shadow-xl shadow-black/20 my-5">
                    <div className="bg-ink-800 px-4 py-2 border-b border-white/[0.06] flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                      </div>
                      <span className="text-[11px] text-white/30 font-mono">Dashboard · 云顶数字工作台</span>
                    </div>
                    <div className="bg-ink-900/30 p-1.5">
                      <DashboardMock />
                    </div>
                  </figure>
                </section>

                <section id="screenshots-grid">
                  <h2 className="text-base font-semibold text-white mb-3">功能截图</h2>
                  <div className="rounded-xl border border-white/[0.06] overflow-hidden my-4">
                    <table className="w-full text-[13px]">
                      <thead>
                        <tr className="border-b border-white/[0.07] bg-white/[0.02]">
                          <th className="text-left px-4 py-2.5 text-white/60 font-medium">功能</th>
                          <th className="text-left px-4 py-2.5 text-white/60 font-medium">描述</th>
                          <th className="text-left px-4 py-2.5 text-white/60 font-medium hidden sm:table-cell">适用场景</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {[
                          { f: '对话界面', d: '多轮对话，工具调用可视化，附件上传与代码高亮', s: '日常问答、编程辅助' },
                          { f: 'Agent 管理', d: '创建、配置、启停 Agent，设置人格和专家模板', s: '多角色管理' },
                          { f: '定时任务面板', d: '可视化管理 Cron 任务，支持 Webhook 触发', s: '定时推送、巡检' },
                          { f: '连接器配置', d: 'OAuth 授权、MCP 工具注册、第三方服务绑定', s: '企业集成' },
                        ].map((item) => (
                          <tr key={item.f} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-4 py-2.5 text-yuanbao-400 font-medium">{item.f}</td>
                            <td className="px-4 py-2.5 text-white/50">{item.d}</td>
                            <td className="px-4 py-2.5 text-white/30 hidden sm:table-cell">{item.s}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section id="screenshots-video">
                  <h2 className="text-base font-semibold text-white mb-2.5">视频教程</h2>
                  <p className="text-white/55 text-[14px] leading-[1.8]">
                    我们制作了一系列入门视频教程，涵盖了安装、配置、创建第一个 Agent 以及接入 IM 通道的完整流程。
                    <a href="#" className="text-yuanbao-400 hover:text-yuanbao-300 underline underline-offset-4 decoration-yuanbao-400/30 ml-1">前往 B 站观看 →</a>
                  </p>
                </section>
              </div>

              {/* 分页 */}
              <div className="flex items-center justify-between mt-10 pt-5 border-t border-white/[0.06]">
                <button onClick={() => scrollToSection('quickstart')} className="flex items-center gap-1 text-[13px] text-white/40 hover:text-white/65 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  快速开始
                </button>
                <button onClick={() => scrollToSection('concepts')} className="group/doc flex items-center gap-1.5 text-[13px] text-yuanbao-400 hover:text-yuanbao-300 transition-colors">
                  常见概念
                  <svg className="w-4 h-4 group-hover/doc:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            </div>

            {/* ═══ Section 常见概念 ═══ */}
            <div id="concepts" data-doc-section className="pt-12 mt-12 border-t border-white/[0.08]">
              <h1 className="text-2xl font-extrabold text-white mb-2">常见概念</h1>
              <p className="text-[13px] text-white/45 mb-8">理解 Ydsz Worker 的核心术语</p>

              <div className="space-y-3">
                {[
                  { name: 'Agent', desc: 'Agent 是核心运行单元。每个 Agent 拥有自己的 Workspace、SOUL 人格定义、绑定的 Expert 和工具集。你可以创建多个 Agent，各自承担不同职责。' },
                  { name: 'Session（会话）', desc: '会话是用户与 Agent 之间的一次交互上下文。每个会话包含完整的消息历史、工具调用记录和中间状态。' },
                  { name: 'Thread（话题）', desc: 'Thread 是 IM 通道中的消息线程。当 Agent 在群聊中被 @ 触发时，Thread 跟踪该次对话的上下文。' },
                  { name: 'Expert（专家）', desc: 'Expert 是预配置的 Agent 模板，内置了特定领域的 Tool Set、SOUL 定义和工作流。' },
                  { name: 'MCP', desc: 'Model Context Protocol — 让 AI 模型安全连接外部工具和数据源的开放协议。Ydsz Worker 内置 MCP 网关。' },
                  { name: 'Workspace', desc: '每个 Agent 拥有独立的 Workspace 目录，存储 SOUL.md 人格文件、Memory 记忆、Skills 技能树和配置文件。' },
                ].map((c, i) => (
                  <div key={c.name} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="w-5 h-5 rounded bg-yuanbao-500/10 flex items-center justify-center text-yuanbao-400 text-[11px] font-bold">
                        {i + 1}
                      </span>
                      <h3 className="text-[14px] font-semibold text-white/90">{c.name}</h3>
                    </div>
                    <p className="text-[13px] text-white/45 leading-[1.75]">{c.desc}</p>
                  </div>
                ))}
              </div>

              <Callout type="info">
                想深入了解每个概念的技术细节？请参考 <a href="#" className="text-yuanbao-400 hover:underline">核心概念</a> 和 <a href="#" className="text-yuanbao-400 hover:underline">API 参考</a> 章节。
              </Callout>

              {/* 分页 */}
              <div className="flex items-center justify-between mt-10 pt-5 border-t border-white/[0.06]">
                <button onClick={() => scrollToSection('screenshots')} className="flex items-center gap-1 text-[13px] text-white/40 hover:text-white/65 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  截图和视频
                </button>
                <button onClick={() => scrollToSection('intro')} className="group/doc flex items-center gap-1.5 text-[13px] text-white/50 hover:text-white/70 transition-colors">
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                  </svg>
                  返回顶部
                </button>
              </div>
            </div>

            {/* ── 底部 ── */}
            <div className="text-center py-8 border-t border-white/[0.05] mt-8">
              <p className="text-[12px] text-white/25">
                本文档对应版本 v0.4.0 · 找不到所需内容？
                <a href="https://github.com/ydsz-buddy/ydsz-worker/issues" className="text-yuanbao-400/70 hover:text-yuanbao-400 ml-1 underline underline-offset-2" target="_blank" rel="noopener noreferrer">
                  发起 Issue
                </a>
              </p>
            </div>
          </article>
        </main>

        {/* ── 右侧 TOC (P0-1) ── */}
        <aside className="w-48 shrink-0 hidden xl:block">
          <div className="sticky top-5">
            <TableOfContents items={TOC_ITEMS} scrollContainerRef={contentRef as RefObject<HTMLElement | null>} />

            {/* 页内锚点 */}
            <div className="mt-6 pt-4 border-t border-white/[0.05] space-y-1.5">
              <a
                href="https://gitee.com/njydsz/ydsz-worker"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[12px] text-white/30 hover:text-yuanbao-400 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
                在 Gitee 查看源码
              </a>
              <button
                onClick={() => contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex items-center gap-1.5 text-[12px] text-white/30 hover:text-yuanbao-400 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                </svg>
                回到顶部
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
