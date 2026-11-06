import { useState, useEffect, useRef, useCallback } from 'react'
import DashboardMock from '../components/DashboardMock'
import ReadingProgressBar from '../components/docs/ReadingProgressBar'
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
    <div className="h-full bg-ink-900 flex flex-col overflow-hidden relative">
      <ReadingProgressBar scrollRef={contentRef} />
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
              href="https://github.com/ydsz-buddy/ydsz-worker/blob/main/website/src/pages/DocsPage.tsx"
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
        <aside className="w-44 shrink-0 hidden sm:block overflow-y-auto scrollbar-thin pr-4">
          <div className="pb-10">
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
                  云顶数字工作台：自托管多用户 AI 助手
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
                对话和凭据都留在这台机器的 <code className="text-yuanbao-400 bg-yuanbao-500/[0.08] px-1.5 py-0.5 rounded text-[13px] font-mono">~/.ydsz/</code>。
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
                    code={`ydsz-worker run\n\n# 输出：\n# ✓ Database initialized at ~/.ydsz/data.db\n# ✓ Config file created at ~/.ydsz/config.json\n# ➜ Dashboard: http://localhost:8080\n# ➜ API Docs:  http://localhost:8080/api/docs`}
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

            {/* ═══ Section 桌面客户端 ═══ */}
            <div id="desktop" data-doc-section className="pt-12 mt-12 border-t border-white/[0.08]">
              <h1 className="text-2xl font-extrabold text-white mb-2">桌面客户端</h1>
              <p className="text-[13px] text-white/45 mb-8">一键安装，开箱即用</p>

              <p className="text-white/55 text-[14px] leading-[1.85] mb-4">
                云顶数字工作台提供原生桌面客户端，支持 Windows、macOS 和 Linux 三大平台。
                桌面客户端内置了完整的后端服务，无需额外配置 Python 环境或依赖，安装后即可使用。
              </p>

              <h2 id="desktop-download" className="text-base font-semibold text-white mb-3">下载与安装</h2>
              <p className="text-white/55 text-[14px] leading-[1.8] mb-4">
                访问 GitHub Releases 页面下载对应平台的安装包：
              </p>
              <SyntaxCodeBlock
                language="bash"
                title="下载链接"
                code={`# GitHub Releases
https://github.com/ydsz-buddy/ydsz-worker/releases

# Windows — 下载 .exe 安装包
# macOS — 下载 .dmg 文件（支持 Intel 和 Apple Silicon）
# Linux — 下载 .AppImage 或 .deb 包`}
              />

              <div className="mt-4 space-y-3">
                {[
                  { step: 'Windows', detail: '下载 YdszWorker-Setup-x.y.z.exe，双击运行安装向导。安装完成后从开始菜单启动。' },
                  { step: 'macOS', detail: '下载 YdszWorker-x.y.z.dmg，拖拽到 Applications 文件夹。首次启动需要在系统偏好设置中允许。' },
                  { step: 'Linux', detail: '下载 .AppImage 文件，赋予执行权限（chmod +x）后直接运行。' },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <span className="shrink-0 px-2 py-0.5 rounded bg-yuanbao-500/10 border border-yuanbao-500/20 text-yuanbao-400 text-[12px] font-medium">{item.step}</span>
                    <p className="text-[13px] text-white/50 leading-relaxed">{item.detail}</p>
                  </div>
                ))}
              </div>

              <h2 id="desktop-requirements" className="text-base font-semibold text-white mb-3 mt-8">系统要求</h2>
              <div className="rounded-xl border border-white/[0.06] overflow-hidden my-4">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-white/[0.07] bg-white/[0.02]">
                      <th className="text-left px-4 py-2.5 text-white/60 font-medium">平台</th>
                      <th className="text-left px-4 py-2.5 text-white/60 font-medium">最低要求</th>
                      <th className="text-left px-4 py-2.5 text-white/60 font-medium hidden sm:table-cell">推荐配置</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {[
                      { p: 'Windows', min: 'Windows 10 64-bit, 4GB RAM', rec: 'Windows 11, 8GB RAM' },
                      { p: 'macOS', min: 'macOS 12 (Monterey), 4GB RAM', rec: 'macOS 14 (Sonoma), 8GB RAM' },
                      { p: 'Linux', min: 'Ubuntu 20.04 / Debian 11, 4GB RAM', rec: 'Ubuntu 22.04, 8GB RAM' },
                    ].map((item) => (
                      <tr key={item.p} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-2.5 text-yuanbao-400 font-medium">{item.p}</td>
                        <td className="px-4 py-2.5 text-white/50">{item.min}</td>
                        <td className="px-4 py-2.5 text-white/30 hidden sm:table-cell">{item.rec}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Callout type="tip">
                桌面客户端会自动管理后端进程，无需手动启动服务。所有数据存储在 <code className="text-yuanbao-400 bg-yuanbao-500/[0.08] px-1 py-0.5 rounded text-[12px] font-mono">~/.ydsz/</code> 目录下。
              </Callout>

              {/* 分页 */}
              <div className="flex items-center justify-between mt-10 pt-5 border-t border-white/[0.06]">
                <button onClick={() => scrollToSection('concepts')} className="flex items-center gap-1 text-[13px] text-white/40 hover:text-white/65 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  常见概念
                </button>
                <button onClick={() => scrollToSection('pip-install')} className="group/doc flex items-center gap-1.5 text-[13px] text-yuanbao-400 hover:text-yuanbao-300 transition-colors">
                  pip 安装
                  <svg className="w-4 h-4 group-hover/doc:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            </div>

            {/* ═══ Section pip 安装 ═══ */}
            <div id="pip-install" data-doc-section className="pt-12 mt-12 border-t border-white/[0.08]">
              <h1 className="text-2xl font-extrabold text-white mb-2">pip 安装</h1>
              <p className="text-[13px] text-white/45 mb-8">通过 Python 包管理器安装</p>

              <p className="text-white/55 text-[14px] leading-[1.85] mb-4">
                云顶数字工作台要求 Python 3.12 或更高版本。推荐使用 <code className="text-yuanbao-400 bg-yuanbao-500/[0.08] px-1.5 py-0.5 rounded text-[13px] font-mono">uv</code> 进行安装，
                它比传统 pip 快 10 倍，且自动管理虚拟环境。
              </p>

              <SyntaxCodeBlock
                language="bash"
                title="使用 uv 安装（推荐）"
                code={`# 安装 uv（如果尚未安装）
curl -LsSf https://astral.sh/uv/install.sh | sh

# 安装 ydsz-worker
uv tool install ydsz-worker

# 验证安装
ydsz-worker --version`}
              />

              <div className="mt-4">
                <SyntaxCodeBlock
                  language="bash"
                  title="使用 pip 安装"
                  code={`# 需要 Python 3.12+
pip install ydsz-worker

# 验证安装
ydsz-worker --version`}
                />
              </div>

              <h2 id="pip-install-venv" className="text-base font-semibold text-white mb-3 mt-8">虚拟环境</h2>
              <p className="text-white/55 text-[14px] leading-[1.8] mb-4">
                如果你更倾向于手动管理虚拟环境，可以使用以下方式：
              </p>
              <SyntaxCodeBlock
                language="bash"
                title="手动创建虚拟环境"
                code={`# 创建虚拟环境
python -m venv ~/.venvs/ydsz

# 激活虚拟环境
source ~/.venvs/ydsz/bin/activate  # Linux/macOS
# ~/.venvs/ydsz\\Scripts\\activate  # Windows

# 安装
pip install ydsz-worker

# 运行
ydsz-worker run`}
              />

              <Callout type="warning">
                Windows 用户请注意：PowerShell 执行策略可能阻止脚本运行。如遇此问题，请执行 <code className="text-yuanbao-400 bg-yuanbao-500/[0.08] px-1 py-0.5 rounded text-[12px] font-mono">Set-ExecutionPolicy RemoteSigned -Scope CurrentUser</code>。
              </Callout>

              <Callout type="info">
                安装完成后，运行 <code className="text-yuanbao-400 bg-yuanbao-500/[0.08] px-1 py-0.5 rounded text-[12px] font-mono">ydsz-worker run</code> 启动服务。首次启动会自动创建数据库和配置文件。
              </Callout>

              {/* 分页 */}
              <div className="flex items-center justify-between mt-10 pt-5 border-t border-white/[0.06]">
                <button onClick={() => scrollToSection('desktop')} className="flex items-center gap-1 text-[13px] text-white/40 hover:text-white/65 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  桌面客户端
                </button>
                <button onClick={() => scrollToSection('docker')} className="group/doc flex items-center gap-1.5 text-[13px] text-yuanbao-400 hover:text-yuanbao-300 transition-colors">
                  Docker 部署
                  <svg className="w-4 h-4 group-hover/doc:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            </div>

            {/* ═══ Section Docker 部署 ═══ */}
            <div id="docker" data-doc-section className="pt-12 mt-12 border-t border-white/[0.08]">
              <h1 className="text-2xl font-extrabold text-white mb-2">Docker 部署</h1>
              <p className="text-[13px] text-white/45 mb-8">容器化部署，环境隔离，运维简单</p>

              <p className="text-white/55 text-[14px] leading-[1.85] mb-4">
                云顶数字工作台提供官方 Docker 镜像，支持一键部署。容器化方式特别适合需要环境隔离、
                快速扩容或在 Kubernetes 集群中运行的场景。
              </p>

              <h2 id="docker-run" className="text-base font-semibold text-white mb-3">Docker 运行</h2>
              <p className="text-white/55 text-[14px] leading-[1.8] mb-4">
                使用单条命令即可启动完整服务：
              </p>
              <SyntaxCodeBlock
                language="bash"
                title="docker run"
                code={`docker run -d \\
  --name ydsz-worker \\
  -p 8080:8080 \\
  -v ydsz-data:/root/.ydsz \\
  --restart unless-stopped \\
  ydszbuddy/ydsz-worker:latest`}
              />

              <div className="mt-4 space-y-2">
                {[
                  { flag: '-d', desc: '后台运行容器' },
                  { flag: '--name ydsz-worker', desc: '指定容器名称，便于管理' },
                  { flag: '-p 8080:8080', desc: '映射 HTTP 端口' },
                  { flag: '-v ydsz-data:/root/.ydsz', desc: '持久化数据卷，存储对话和配置' },
                  { flag: '--restart unless-stopped', desc: '容器异常退出时自动重启' },
                ].map((item) => (
                  <div key={item.flag} className="flex items-start gap-3 text-[13px]">
                    <code className="shrink-0 text-yuanbao-400 bg-yuanbao-500/[0.08] px-1.5 py-0.5 rounded font-mono text-[12px]">{item.flag}</code>
                    <span className="text-white/50">{item.desc}</span>
                  </div>
                ))}
              </div>

              <h2 id="docker-compose" className="text-base font-semibold text-white mb-3 mt-8">Docker Compose</h2>
              <p className="text-white/55 text-[14px] leading-[1.8] mb-4">
                对于需要自定义配置的场景，推荐使用 Docker Compose：
              </p>
              <SyntaxCodeBlock
                language="yaml"
                title="docker-compose.yml"
                code={`version: '3.8'

services:
  ydsz-worker:
    image: ydszbuddy/ydsz-worker:latest
    container_name: ydsz-worker
    ports:
      - "8080:8080"
    volumes:
      - ydsz-data:/root/.ydsz
    environment:
      - YDSZ_DEFAULT_TIMEZONE=Asia/Shanghai
      # - YDSZ_JWT_SECRET=your-secret-key
    restart: unless-stopped

volumes:
  ydsz-data:`}
              />

              <Callout type="tip">
                Docker 镜像支持 linux/amd64 和 linux/arm64 架构，可在 x86 服务器和树莓派等 ARM 设备上运行。
              </Callout>

              <Callout type="warning">
                生产环境请务必修改 JWT 密钥。通过环境变量 <code className="text-yuanbao-400 bg-yuanbao-500/[0.08] px-1 py-0.5 rounded text-[12px] font-mono">YDSZ_JWT_SECRET</code> 设置，避免使用默认值。
              </Callout>

              {/* 分页 */}
              <div className="flex items-center justify-between mt-10 pt-5 border-t border-white/[0.06]">
                <button onClick={() => scrollToSection('pip-install')} className="flex items-center gap-1 text-[13px] text-white/40 hover:text-white/65 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  pip 安装
                </button>
                <button onClick={() => scrollToSection('fnos')} className="group/doc flex items-center gap-1.5 text-[13px] text-yuanbao-400 hover:text-yuanbao-300 transition-colors">
                  飞牛 FnOS
                  <svg className="w-4 h-4 group-hover/doc:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            </div>

            {/* ═══ Section 飞牛 FnOS ═══ */}
            <div id="fnos" data-doc-section className="pt-12 mt-12 border-t border-white/[0.08]">
              <h1 className="text-2xl font-extrabold text-white mb-2">飞牛 FnOS</h1>
              <p className="text-[13px] text-white/45 mb-8">在 NAS 上部署云顶数字工作台</p>

              <p className="text-white/55 text-[14px] leading-[1.85] mb-4">
                飞牛 OS（FnOS）是国产 NAS 操作系统，支持 Docker 容器。
                你可以将云顶数字工作台部署在飞牛 NAS 上，让 AI 助手 24 小时在线，
                随时随地通过手机或电脑访问。
              </p>

              <h2 id="fnos-app-center" className="text-base font-semibold text-white mb-3">应用中心安装</h2>
              <p className="text-white/55 text-[14px] leading-[1.8] mb-4">
                通过飞牛应用中心是最简单的安装方式：
              </p>

              <div className="space-y-3 mb-6">
                {[
                  { step: '1', title: '打开应用中心', desc: '登录飞牛 OS 管理界面，进入「应用中心」。' },
                  { step: '2', title: '搜索应用', desc: '在搜索框中输入「ydsz-worker」或「云顶数字工作台」。' },
                  { step: '3', title: '安装部署', desc: '点击安装，配置端口映射（默认 8080）和数据卷路径。' },
                  { step: '4', title: '访问服务', desc: '安装完成后，通过 http://NAS-IP:8080 访问 Dashboard。' },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3.5">
                    <div className="w-6 h-6 shrink-0 rounded-full bg-yuanbao-500/[0.08] border border-yuanbao-500/20 flex items-center justify-center">
                      <span className="text-[12px] font-bold text-yuanbao-400">{item.step}</span>
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-white/85 mb-0.5">{item.title}</p>
                      <p className="text-[13px] text-white/50">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <SyntaxCodeBlock
                  language="bash"
                  title="手动 Docker Compose 安装"
                  code={`# 在飞牛 SSH 中执行
mkdir -p /vol1/1000/docker/ydsz-worker
cd /vol1/1000/docker/ydsz-worker

# 创建 docker-compose.yml 后启动
docker-compose up -d

# 查看日志
docker-compose logs -f ydsz-worker`}
                />
              </div>

              <Callout type="info">
                飞牛 NAS 的 Docker 管理界面基于 Container Manager，你也可以在「容器」页面手动创建容器并填入镜像 <code className="text-yuanbao-400 bg-yuanbao-500/[0.08] px-1 py-0.5 rounded text-[12px] font-mono">ydszbuddy/ydsz-worker:latest</code>。
              </Callout>

              {/* 分页 */}
              <div className="flex items-center justify-between mt-10 pt-5 border-t border-white/[0.06]">
                <button onClick={() => scrollToSection('docker')} className="flex items-center gap-1 text-[13px] text-white/40 hover:text-white/65 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  Docker 部署
                </button>
                <button onClick={() => scrollToSection('requirements')} className="group/doc flex items-center gap-1.5 text-[13px] text-yuanbao-400 hover:text-yuanbao-300 transition-colors">
                  系统要求
                  <svg className="w-4 h-4 group-hover/doc:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            </div>

            {/* ═══ Section 系统要求 ═══ */}
            <div id="requirements" data-doc-section className="pt-12 mt-12 border-t border-white/[0.08]">
              <h1 className="text-2xl font-extrabold text-white mb-2">系统要求</h1>
              <p className="text-[13px] text-white/45 mb-8">硬件与软件环境要求</p>

              <p className="text-white/55 text-[14px] leading-[1.85] mb-6">
                云顶数字工作台设计为轻量级自托管应用，对硬件要求不高。
                以下为各部署方式的详细系统要求。
              </p>

              <h2 className="text-base font-semibold text-white mb-3">硬件要求</h2>
              <div className="rounded-xl border border-white/[0.06] overflow-hidden my-4">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-white/[0.07] bg-white/[0.02]">
                      <th className="text-left px-4 py-2.5 text-white/60 font-medium">资源</th>
                      <th className="text-left px-4 py-2.5 text-white/60 font-medium">最低配置</th>
                      <th className="text-left px-4 py-2.5 text-white/60 font-medium">推荐配置</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {[
                      { r: 'CPU', min: '2 核心', rec: '4 核心及以上' },
                      { r: '内存', min: '4 GB', rec: '8 GB 及以上' },
                      { r: '存储', min: '10 GB 可用空间', rec: '50 GB 及以上（含知识库）' },
                      { r: '网络', min: '10 Mbps', rec: '100 Mbps 及以上' },
                    ].map((item) => (
                      <tr key={item.r} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-2.5 text-yuanbao-400 font-medium">{item.r}</td>
                        <td className="px-4 py-2.5 text-white/50">{item.min}</td>
                        <td className="px-4 py-2.5 text-white/30">{item.rec}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h2 className="text-base font-semibold text-white mb-3 mt-8">软件要求</h2>
              <div className="rounded-xl border border-white/[0.06] overflow-hidden my-4">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-white/[0.07] bg-white/[0.02]">
                      <th className="text-left px-4 py-2.5 text-white/60 font-medium">软件</th>
                      <th className="text-left px-4 py-2.5 text-white/60 font-medium">版本要求</th>
                      <th className="text-left px-4 py-2.5 text-white/60 font-medium hidden sm:table-cell">备注</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {[
                      { s: 'Python', v: '3.12+', n: 'pip / uv 安装时需要' },
                      { s: 'Docker', v: '20.10+', n: 'Docker 部署时需要' },
                      { s: 'Docker Compose', v: '2.0+', n: 'Compose 部署时需要' },
                      { s: 'SQLite', v: '内置', n: '默认数据库，无需安装' },
                      { s: 'PostgreSQL', v: '13+', n: '可选，生产环境推荐' },
                    ].map((item) => (
                      <tr key={item.s} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-2.5 text-yuanbao-400 font-medium">{item.s}</td>
                        <td className="px-4 py-2.5 text-white/50">{item.v}</td>
                        <td className="px-4 py-2.5 text-white/30 hidden sm:table-cell">{item.n}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Callout type="info">
                支持在树莓派 4（4GB RAM）上运行基础功能。如需处理大模型推理或大量知识库检索，推荐使用 x86 服务器。
              </Callout>

              {/* 分页 */}
              <div className="flex items-center justify-between mt-10 pt-5 border-t border-white/[0.06]">
                <button onClick={() => scrollToSection('fnos')} className="flex items-center gap-1 text-[13px] text-white/40 hover:text-white/65 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  飞牛 FnOS
                </button>
                <button onClick={() => scrollToSection('experts')} className="group/doc flex items-center gap-1.5 text-[13px] text-yuanbao-400 hover:text-yuanbao-300 transition-colors">
                  专家系统
                  <svg className="w-4 h-4 group-hover/doc:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            </div>

            {/* ═══ Section 专家系统 ═══ */}
            <div id="experts" data-doc-section className="pt-12 mt-12 border-t border-white/[0.08]">
              <h1 className="text-2xl font-extrabold text-white mb-2">专家系统</h1>
              <p className="text-[13px] text-white/45 mb-8">创建、配置和管理你的 AI 专家</p>

              <p className="text-white/55 text-[14px] leading-[1.85] mb-4">
                专家（Expert）是云顶数字工作台的核心抽象。每个专家是一个预配置的 Agent 模板，
                内置了特定领域的 Tool Set、SOUL 人格定义和工作流。你可以基于内置模板快速创建专家，
                也可以从零开始自定义。
              </p>

              <h2 id="experts-create" className="text-base font-semibold text-white mb-3">创建专家</h2>
              <p className="text-white/55 text-[14px] leading-[1.8] mb-4">
                在 Dashboard 中打开「专家」页面，点击「创建专家」。你可以选择：
              </p>
              <div className="space-y-3 mb-6">
                {[
                  { icon: '📦', title: '从模板创建', desc: '选择内置专家模板（周报、研究、代码等），一键生成预配置专家。' },
                  { icon: '🔧', title: '从市场导入', desc: '浏览专家市场，导入社区分享的专家配置。' },
                  { icon: '✨', title: '自定义创建', desc: '从零开始配置 SOUL、Tool Set、知识库和 IM 通道。' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                    <span className="text-lg flex-shrink-0">{item.icon}</span>
                    <div>
                      <h4 className="text-[13px] font-semibold text-white/85 mb-0.5">{item.title}</h4>
                      <p className="text-[12px] text-white/45 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <h2 id="experts-soul" className="text-base font-semibold text-white mb-3 mt-8">SOUL 配置</h2>
              <p className="text-white/55 text-[14px] leading-[1.8] mb-4">
                SOUL 是专家的人格定义文件，采用 Markdown 格式。它定义了专家的沟通风格、
                专业领域、行为准则和特殊指令。
              </p>
              <SyntaxCodeBlock
                language="markdown"
                title="SOUL.md 示例"
                code={`# 角色定义
你是一位资深的数据分析师，擅长从海量数据中提炼商业洞察。

# 沟通风格
- 简洁直接，避免冗长解释
- 用数据说话，引用具体指标
- 主动提出可行的建议

# 专业领域
- SQL 查询与优化
- 数据可视化（Tableau / Grafana）
- A/B 测试设计

# 行为准则
- 遇到不确定时明确说明
- 拒绝执行可能危害数据安全的操作`}
              />

              <Callout type="tip">
                SOUL 文件存储在 Workspace 的 <code className="text-yuanbao-400 bg-yuanbao-500/[0.08] px-1 py-0.5 rounded text-[12px] font-mono">SOUL.md</code> 路径下。你可以随时通过 Dashboard 或 API 修改它，修改后立即生效。
              </Callout>

              {/* 分页 */}
              <div className="flex items-center justify-between mt-10 pt-5 border-t border-white/[0.06]">
                <button onClick={() => scrollToSection('requirements')} className="flex items-center gap-1 text-[13px] text-white/40 hover:text-white/65 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  系统要求
                </button>
                <button onClick={() => scrollToSection('multi-agent')} className="group/doc flex items-center gap-1.5 text-[13px] text-yuanbao-400 hover:text-yuanbao-300 transition-colors">
                  多 Agent 协作
                  <svg className="w-4 h-4 group-hover/doc:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            </div>

            {/* ═══ Section 多 Agent 协作 ═══ */}
            <div id="multi-agent" data-doc-section className="pt-12 mt-12 border-t border-white/[0.08]">
              <h1 className="text-2xl font-extrabold text-white mb-2">多 Agent 协作</h1>
              <p className="text-[13px] text-white/45 mb-8">AgentTeams 与 DAG 编排</p>

              <p className="text-white/55 text-[14px] leading-[1.85] mb-4">
                云顶数字工作台支持多个 Agent 协同完成复杂任务。通过 AgentTeams 和 DAG 编排，
                你可以构建「研究 Agent → 分析 Agent → 撰写 Agent」这样的流水线，
                让每个 Agent 专注于自己擅长的环节。
              </p>

              <h2 id="multi-agent-teams" className="text-base font-semibold text-white mb-3">AgentTeams</h2>
              <p className="text-white/55 text-[14px] leading-[1.8] mb-4">
                AgentTeams 是一种松耦合的协作模式。一个「协调者」Agent 接收用户请求，
                将子任务分派给团队中的其他 Agent，最后汇总结果。
              </p>
              <SyntaxCodeBlock
                language="bash"
                title="创建 AgentTeam"
                code={`# 通过 Dashboard 创建 AgentTeam
# 或使用 CLI：
ydsz-worker agent create --name "研究团队" --role coordinator
ydsz-worker agent create --name "数据分析师" --role specialist
ydsz-worker agent create --name "报告撰写者" --role specialist

# 组建团队
ydsz-worker team create --name "研究流水线" \\
  --coordinator "研究团队" \\
  --members "数据分析师,报告撰写者"`}
              />

              <h2 id="multi-agent-dag" className="text-base font-semibold text-white mb-3 mt-8">DAG 编排</h2>
              <p className="text-white/55 text-[14px] leading-[1.8] mb-4">
                DAG（有向无环图）编排适合需要严格顺序控制的场景。你可以定义 Agent 之间的
                依赖关系和数据流，确保前置任务完成后才启动后续任务。
              </p>
              <SyntaxCodeBlock
                language="yaml"
                title="pipeline.yaml 示例"
                code={`name: 数据分析流水线
agents:
  - id: researcher
    name: 研究员
    tools: [web_search, file_reader]

  - id: analyst
    name: 分析师
    depends_on: [researcher]
    tools: [python, sql_query]

  - id: writer
    name: 撰稿人
    depends_on: [analyst]
    tools: [doc_writer]`}
              />

              <Callout type="info">
                Agent 之间通过 ACP（Agent Communication Protocol）进行通信，支持跨平台、跨语言的 Agent 互操作。
              </Callout>

              {/* 分页 */}
              <div className="flex items-center justify-between mt-10 pt-5 border-t border-white/[0.06]">
                <button onClick={() => scrollToSection('experts')} className="flex items-center gap-1 text-[13px] text-white/40 hover:text-white/65 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  专家系统
                </button>
                <button onClick={() => scrollToSection('knowledge-rag')} className="group/doc flex items-center gap-1.5 text-[13px] text-yuanbao-400 hover:text-yuanbao-300 transition-colors">
                  知识库 RAG
                  <svg className="w-4 h-4 group-hover/doc:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            </div>

            {/* ═══ Section 知识库 RAG ═══ */}
            <div id="knowledge-rag" data-doc-section className="pt-12 mt-12 border-t border-white/[0.08]">
              <h1 className="text-2xl font-extrabold text-white mb-2">知识库 RAG</h1>
              <p className="text-[13px] text-white/45 mb-8">检索增强生成，让 AI 读懂你的文档</p>

              <p className="text-white/55 text-[14px] leading-[1.85] mb-4">
                知识库是云顶数字工作台的 RAG（Retrieval-Augmented Generation）模块。
                你可以上传 PDF、Word、Markdown 等格式的文档，系统会自动进行文本切分、
                向量化索引，并在对话时基于语义搜索检索相关片段。
              </p>

              <h2 id="knowledge-rag-upload" className="text-base font-semibold text-white mb-3">文档上传</h2>
              <p className="text-white/55 text-[14px] leading-[1.8] mb-4">
                支持多种方式向知识库添加文档：
              </p>
              <div className="space-y-3 mb-6">
                {[
                  { method: 'Dashboard 上传', desc: '在「知识库」页面拖拽或选择文件，支持批量上传。' },
                  { method: 'API 上传', desc: '通过 REST API 程序化上传，适合 CI/CD 集成。' },
                  { method: 'CLI 导入', desc: '使用命令行工具从本地目录批量导入。' },
                ].map((item) => (
                  <div key={item.method} className="flex items-start gap-3">
                    <span className="shrink-0 w-2 h-2 mt-1.5 rounded-full bg-yuanbao-500" />
                    <div>
                      <span className="text-[13px] font-medium text-white/80">{item.method}</span>
                      <span className="text-[13px] text-white/50 ml-2">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
              <SyntaxCodeBlock
                language="bash"
                title="CLI 导入"
                code={`# 导入整个目录
ydsz-worker kb import ./docs --kb "产品手册"

# 查看知识库列表
ydsz-worker kb list

# 查看文档索引状态
ydsz-worker kb status --kb "产品手册"`}
              />

              <h2 id="knowledge-rag-search" className="text-base font-semibold text-white mb-3 mt-8">语义搜索</h2>
              <p className="text-white/55 text-[14px] leading-[1.8] mb-4">
                知识库使用向量检索引擎，支持自然语言查询。例如，你可以问「如何配置飞书通道」，
                系统会返回最相关的文档片段，即使文档中没有完全匹配的关键词。
              </p>
              <SyntaxCodeBlock
                language="python"
                title="Python SDK 示例"
                code={`import requests

# 搜索知识库
response = requests.post(
    "http://localhost:8080/api/knowledge/search",
    headers={"Authorization": "Bearer <token>"},
    json={
        "kb_id": "product-manual",
        "query": "如何配置飞书通道",
        "top_k": 5,
    }
)

for result in response.json()["results"]:
    print(f"[{result['score']:.2f}] {result['content'][:100]}")`}
              />

              <Callout type="tip">
                知识库支持自动重建索引。当文档更新后，系统会在后台重新计算向量，无需手动干预。
              </Callout>

              {/* 分页 */}
              <div className="flex items-center justify-between mt-10 pt-5 border-t border-white/[0.06]">
                <button onClick={() => scrollToSection('multi-agent')} className="flex items-center gap-1 text-[13px] text-white/40 hover:text-white/65 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  多 Agent 协作
                </button>
                <button onClick={() => scrollToSection('connectors-overview')} className="group/doc flex items-center gap-1.5 text-[13px] text-yuanbao-400 hover:text-yuanbao-300 transition-colors">
                  连接器概述
                  <svg className="w-4 h-4 group-hover/doc:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            </div>

            {/* ═══ Section 连接器概述 ═══ */}
            <div id="connectors-overview" data-doc-section className="pt-12 mt-12 border-t border-white/[0.08]">
              <h1 className="text-2xl font-extrabold text-white mb-2">连接器概述</h1>
              <p className="text-[13px] text-white/45 mb-8">连接外部服务，扩展 Agent 能力边界</p>

              <p className="text-white/55 text-[14px] leading-[1.85] mb-4">
                连接器是云顶数字工作台与外部服务之间的桥梁。通过连接器，Agent 可以调用第三方 API、
                读取外部数据源、触发远程操作。所有连接器统一由 MCP 网关管理，提供标准化的工具注册和调用接口。
              </p>

              <h2 id="connectors-overview-arch" className="text-base font-semibold text-white mb-3">架构与原理</h2>
              <p className="text-white/55 text-[14px] leading-[1.8] mb-4">
                连接器的核心架构分为三层：
              </p>
              <div className="space-y-3 mb-6">
                {[
                  { layer: '协议层', desc: '定义统一的 MCP 协议接口，包括工具发现、参数校验和调用规范。' },
                  { layer: '适配层', desc: '将不同第三方服务的 API 转换为标准 MCP 工具描述，处理认证和限流。' },
                  { layer: '网关层', desc: 'MCP Gateway 负责路由分发、负载均衡和日志记录。' },
                ].map((item) => (
                  <div key={item.layer} className="flex items-start gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                    <span className="shrink-0 px-2 py-0.5 rounded bg-yuanbao-500/10 border border-yuanbao-500/20 text-yuanbao-400 text-[12px] font-medium">{item.layer}</span>
                    <p className="text-[13px] text-white/50 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
              <SyntaxCodeBlock
                language="bash"
                title="MCP 网关状态"
                code={`# 查看已注册的 MCP 服务器
ydsz-worker connector list

# 测试连接器连通性
ydsz-worker connector test --name "feishu"

# 查看连接器日志
ydsz-worker connector logs --name "feishu" --tail 100`}
              />

              <Callout type="info">
                内置连接器覆盖主流 IM 平台、云存储、数据库、开发工具等类别，无需额外开发即可使用。如需对接自有系统，请参考「自定义连接器」章节。
              </Callout>

              {/* 分页 */}
              <div className="flex items-center justify-between mt-10 pt-5 border-t border-white/[0.06]">
                <button onClick={() => scrollToSection('knowledge-rag')} className="flex items-center gap-1 text-[13px] text-white/40 hover:text-white/65 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  知识库 RAG
                </button>
                <button onClick={() => scrollToSection('builtin-connectors')} className="group/doc flex items-center gap-1.5 text-[13px] text-yuanbao-400 hover:text-yuanbao-300 transition-colors">
                  内置连接器
                  <svg className="w-4 h-4 group-hover/doc:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            </div>

            {/* ═══ Section 内置连接器 ═══ */}
            <div id="builtin-connectors" data-doc-section className="pt-12 mt-12 border-t border-white/[0.08]">
              <h1 className="text-2xl font-extrabold text-white mb-2">内置连接器</h1>
              <p className="text-[13px] text-white/45 mb-8">50+ 预置连接器，覆盖主流服务</p>

              <p className="text-white/55 text-[14px] leading-[1.85] mb-4">
                云顶数字工作台内置了 50+ 连接器，涵盖即时通讯、云存储、数据库、开发工具、
                办公软件等多个类别。所有连接器均已通过测试，可直接在 Dashboard 中一键启用。
              </p>

              <h2 id="builtin-connectors-list" className="text-base font-semibold text-white mb-3">连接器列表</h2>
              <div className="rounded-xl border border-white/[0.06] overflow-hidden my-4">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-white/[0.07] bg-white/[0.02]">
                      <th className="text-left px-4 py-2.5 text-white/60 font-medium">分类</th>
                      <th className="text-left px-4 py-2.5 text-white/60 font-medium">连接器</th>
                      <th className="text-left px-4 py-2.5 text-white/60 font-medium hidden sm:table-cell">功能</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {[
                      { cat: '即时通讯', name: '飞书 / 企业微信 / 钉钉 / QQ / 微信 / Telegram', func: '消息收发、群管理' },
                      { cat: '云存储', name: '阿里云 OSS / 腾讯云 COS / AWS S3 / MinIO', func: '文件上传下载' },
                      { cat: '数据库', name: 'PostgreSQL / MySQL / MongoDB / Redis', func: '数据查询与写入' },
                      { cat: '开发工具', name: 'GitHub / GitLab / Jira / Linear', func: '代码与项目管理' },
                      { cat: '办公软件', name: 'Notion / Confluence / 飞书文档', func: '文档读写' },
                    ].map((item) => (
                      <tr key={item.cat} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-2.5 text-yuanbao-400 font-medium whitespace-nowrap">{item.cat}</td>
                        <td className="px-4 py-2.5 text-white/60">{item.name}</td>
                        <td className="px-4 py-2.5 text-white/30 hidden sm:table-cell">{item.func}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Callout type="tip">
                连接器配置集中在 Dashboard 的「连接器」页面。每个连接器都有独立的配置向导，引导你完成 OAuth 授权或 API Key 填写。
              </Callout>

              {/* 分页 */}
              <div className="flex items-center justify-between mt-10 pt-5 border-t border-white/[0.06]">
                <button onClick={() => scrollToSection('connectors-overview')} className="flex items-center gap-1 text-[13px] text-white/40 hover:text-white/65 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  连接器概述
                </button>
                <button onClick={() => scrollToSection('custom-connectors')} className="group/doc flex items-center gap-1.5 text-[13px] text-yuanbao-400 hover:text-yuanbao-300 transition-colors">
                  自定义连接器
                  <svg className="w-4 h-4 group-hover/doc:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            </div>

            {/* ═══ Section 自定义连接器 ═══ */}
            <div id="custom-connectors" data-doc-section className="pt-12 mt-12 border-t border-white/[0.08]">
              <h1 className="text-2xl font-extrabold text-white mb-2">自定义连接器</h1>
              <p className="text-[13px] text-white/45 mb-8">基于 MCP 协议开发自定义工具</p>

              <p className="text-white/55 text-[14px] leading-[1.85] mb-4">
                当内置连接器无法满足需求时，你可以基于 MCP（Model Context Protocol）协议开发自定义连接器。
                MCP 是一个开放协议，定义了 AI 模型与外部工具之间的标准化通信方式。
              </p>

              <h2 id="custom-connectors-mcp" className="text-base font-semibold text-white mb-3">MCP 协议</h2>
              <p className="text-white/55 text-[14px] leading-[1.8] mb-4">
                MCP 服务器通过 JSON-RPC 2.0 与 Ydsz Worker 通信。你需要实现以下核心方法：
              </p>
              <SyntaxCodeBlock
                language="python"
                title="MCP 服务器示例（Python）"
                code={`from mcp.server import Server
from mcp.types import Tool, TextContent

app = Server("my-connector")

@app.list_tools()
async def list_tools() -> list[Tool]:
    return [
        Tool(
            name="search_internal_db",
            description="搜索内部数据库",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {"type": "string"},
                    "limit": {"type": "integer", "default": 10},
                },
                "required": ["query"],
            },
        )
    ]

@app.call_tool()
async def call_tool(name: str, arguments: dict):
    if name == "search_internal_db":
        results = db.search(arguments["query"], arguments.get("limit", 10))
        return [TextContent(type="text", text=results)]
    raise ValueError(f"Unknown tool: {name}")`}
              />

              <div className="mt-4">
                <SyntaxCodeBlock
                  language="json"
                  title="connector.json 配置"
                  code={`{
  "name": "my-custom-connector",
  "display_name": "我的自定义连接器",
  "description": "连接内部系统的自定义工具集",
  "transport": "stdio",
  "command": "python",
  "args": ["-m", "my_connector.server"],
  "env": {
    "DB_HOST": "internal-db.example.com",
    "DB_PORT": "5432"
  }
}`}
                />
              </div>

              <Callout type="warning">
                自定义连接器需要通过安全审核。提交连接器到市场前，请确保不包含硬编码的凭据或敏感信息。
              </Callout>

              {/* 分页 */}
              <div className="flex items-center justify-between mt-10 pt-5 border-t border-white/[0.06]">
                <button onClick={() => scrollToSection('builtin-connectors')} className="flex items-center gap-1 text-[13px] text-white/40 hover:text-white/65 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  内置连接器
                </button>
                <button onClick={() => scrollToSection('rest-api')} className="group/doc flex items-center gap-1.5 text-[13px] text-yuanbao-400 hover:text-yuanbao-300 transition-colors">
                  REST API
                  <svg className="w-4 h-4 group-hover/doc:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            </div>

            {/* ═══ Section REST API ═══ */}
            <div id="rest-api" data-doc-section className="pt-12 mt-12 border-t border-white/[0.08]">
              <h1 className="text-2xl font-extrabold text-white mb-2">REST API</h1>
              <p className="text-[13px] text-white/45 mb-8">完整的 HTTP API 接口参考</p>

              <p className="text-white/55 text-[14px] leading-[1.85] mb-4">
                云顶数字工作台提供 RESTful API，覆盖 Agent 管理、会话操作、知识库、定时任务等所有功能。
                所有 API 均返回 JSON 格式数据，支持 JWT 认证。
              </p>

              <h2 id="rest-api-endpoints" className="text-base font-semibold text-white mb-3">核心端点</h2>
              <div className="rounded-xl border border-white/[0.06] overflow-hidden my-4">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-white/[0.07] bg-white/[0.02]">
                      <th className="text-left px-4 py-2.5 text-white/60 font-medium">方法</th>
                      <th className="text-left px-4 py-2.5 text-white/60 font-medium">端点</th>
                      <th className="text-left px-4 py-2.5 text-white/60 font-medium hidden sm:table-cell">描述</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {[
                      { m: 'GET', e: '/api/agents', d: '列出所有 Agent' },
                      { m: 'POST', e: '/api/agents', d: '创建新 Agent' },
                      { m: 'GET', e: '/api/agents/{id}', d: '获取 Agent 详情' },
                      { m: 'POST', e: '/api/chats/send', d: '发送消息' },
                      { m: 'GET', e: '/api/chats/{id}', d: '获取会话历史' },
                      { m: 'GET', e: '/api/knowledge/{id}/search', d: '知识库语义搜索' },
                    ].map((item) => (
                      <tr key={item.e + item.m} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-2.5"><span className={`inline-flex px-1.5 py-0.5 rounded text-[11px] font-bold ${item.m === 'GET' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>{item.m}</span></td>
                        <td className="px-4 py-2.5 text-white/60 font-mono text-[12px]">{item.e}</td>
                        <td className="px-4 py-2.5 text-white/30 hidden sm:table-cell">{item.d}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h2 id="rest-api-auth" className="text-base font-semibold text-white mb-3 mt-8">认证方式</h2>
              <p className="text-white/55 text-[14px] leading-[1.8] mb-4">
                所有 API 请求需要在 HTTP Header 中携带 JWT Token：
              </p>
              <SyntaxCodeBlock
                language="bash"
                title="API 调用示例"
                code={`# 登录获取 Token
curl -X POST http://localhost:8080/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"username":"admin","password":"your-password"}'

# 使用 Token 调用 API
curl http://localhost:8080/api/agents \\
  -H "Authorization: Bearer <your-jwt-token>"

# 发送消息
curl -X POST http://localhost:8080/api/chats/send \\
  -H "Authorization: Bearer <your-jwt-token>" \\
  -H "Content-Type: application/json" \\
  -d '{"agent_id":"main","message":"你好"}'`}
              />

              <Callout type="info">
                API 文档的完整交互式版本可在 Dashboard 中访问 <code className="text-yuanbao-400 bg-yuanbao-500/[0.08] px-1 py-0.5 rounded text-[12px] font-mono">/api/docs</code>（基于 Scalar）。
              </Callout>

              {/* 分页 */}
              <div className="flex items-center justify-between mt-10 pt-5 border-t border-white/[0.06]">
                <button onClick={() => scrollToSection('custom-connectors')} className="flex items-center gap-1 text-[13px] text-white/40 hover:text-white/65 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  自定义连接器
                </button>
                <button onClick={() => scrollToSection('sse')} className="group/doc flex items-center gap-1.5 text-[13px] text-yuanbao-400 hover:text-yuanbao-300 transition-colors">
                  SSE 事件流
                  <svg className="w-4 h-4 group-hover/doc:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            </div>

            {/* ═══ Section SSE 事件流 ═══ */}
            <div id="sse" data-doc-section className="pt-12 mt-12 border-t border-white/[0.08]">
              <h1 className="text-2xl font-extrabold text-white mb-2">SSE 事件流</h1>
              <p className="text-[13px] text-white/45 mb-8">Server-Sent Events 实时推送</p>

              <p className="text-white/55 text-[14px] leading-[1.85] mb-4">
                对于需要实时更新的场景（如流式对话、工具执行进度），云顶数字工作台提供 SSE（Server-Sent Events）接口。
                客户端通过 HTTP 长连接订阅事件流，服务端在事件产生时主动推送。
              </p>

              <h2 id="sse-events" className="text-base font-semibold text-white mb-3">事件类型</h2>
              <div className="rounded-xl border border-white/[0.06] overflow-hidden my-4">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-white/[0.07] bg-white/[0.02]">
                      <th className="text-left px-4 py-2.5 text-white/60 font-medium">事件名</th>
                      <th className="text-left px-4 py-2.5 text-white/60 font-medium">触发时机</th>
                      <th className="text-left px-4 py-2.5 text-white/60 font-medium hidden sm:table-cell">数据格式</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {[
                      { e: 'message_start', t: 'Agent 开始回复', f: '{ thread_id, message_id }' },
                      { e: 'message_delta', t: '流式文本块', f: '{ content, index }' },
                      { e: 'tool_start', t: '工具调用开始', f: '{ tool_name, args }' },
                      { e: 'tool_end', t: '工具调用结束', f: '{ tool_name, result }' },
                      { e: 'message_end', t: 'Agent 回复完成', f: '{ message_id, usage }' },
                    ].map((item) => (
                      <tr key={item.e} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-2.5 text-yuanbao-400 font-mono text-[12px]">{item.e}</td>
                        <td className="px-4 py-2.5 text-white/50">{item.t}</td>
                        <td className="px-4 py-2.5 text-white/30 hidden sm:table-cell font-mono text-[12px]">{item.f}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h2 id="sse-subscribe" className="text-base font-semibold text-white mb-3 mt-8">订阅方式</h2>
              <p className="text-white/55 text-[14px] leading-[1.8] mb-4">
                使用标准 EventSource API 即可订阅：
              </p>
              <SyntaxCodeBlock
                language="javascript"
                title="JavaScript 客户端"
                code={`const eventSource = new EventSource(
  'http://localhost:8080/api/chats/stream?agent_id=main',
  { headers: { 'Authorization': 'Bearer <token>' } }
)

eventSource.addEventListener('message_delta', (e) => {
  const data = JSON.parse(e.data)
  // 增量渲染到 UI
  appendToMessage(data.content)
})

eventSource.addEventListener('message_end', (e) => {
  const data = JSON.parse(e.data)
  console.log('Token usage:', data.usage)
  eventSource.close()
})`}
              />

              <Callout type="warning">
                SSE 连接在服务端有 30 分钟空闲超时限制。客户端需要实现自动重连逻辑，或在超时前发送心跳包。
              </Callout>

              <Callout type="tip">
                生产环境推荐使用 SSE 替代轮询，可降低 90% 的无效请求量，显著减少服务器负载。
              </Callout>

              {/* 分页 */}
              <div className="flex items-center justify-between mt-10 pt-5 border-t border-white/[0.06]">
                <button onClick={() => scrollToSection('rest-api')} className="flex items-center gap-1 text-[13px] text-white/40 hover:text-white/65 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  REST API
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
                本文档对应版本 v1.0.0 · 找不到所需内容？
                <a href="https://github.com/ydsz-buddy/ydsz-worker/issues" className="text-yuanbao-400/70 hover:text-yuanbao-400 ml-1 underline underline-offset-2" target="_blank" rel="noopener noreferrer">
                  发起 Issue
                </a>
              </p>
            </div>
          </article>
        </main>
      </div>
    </div>
  )
}
