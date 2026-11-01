import { useState, useEffect, useRef, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import SectionDivider from '../components/SectionDivider'

// ─── 类型定义 ───────────────────────────────────────────────────────────────

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

// ─── 导航数据 ───────────────────────────────────────────────────────────────

const NAV_SECTIONS: NavSection[] = [
  {
    title: '入门',
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
    title: '配置',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    items: [
      { label: '配置文件', href: '#config-file', id: 'config-file' },
      { label: 'LLM 提供商', href: '#llm-providers', id: 'llm-providers' },
      { label: '模型设置', href: '#model-settings', id: 'model-settings' },
      { label: 'IM 通道', href: '#im-channels', id: 'im-channels' },
      { label: '存储后端', href: '#storage-backend', id: 'storage-backend' },
    ],
  },
  {
    title: '核心功能',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
      </svg>
    ),
    items: [
      { label: '专家系统', href: '#experts', id: 'experts' },
      { label: '多 Agent 协作', href: '#multi-agent', id: 'multi-agent' },
      { label: '知识库 RAG', href: '#knowledge-rag', id: 'knowledge-rag' },
      { label: 'ACP 协议', href: '#acp', id: 'acp' },
      { label: 'MCP 网关', href: '#mcp-gateway', id: 'mcp-gateway' },
      { label: '定时任务', href: '#cron', id: 'cron' },
      { label: '浏览器自动化', href: '#browser', id: 'browser' },
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
      { label: 'OAuth 配置', href: '#oauth', id: 'oauth' },
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
      { label: 'WebSocket', href: '#websocket', id: 'websocket' },
    ],
  },
]

// ─── 分页数据 ───────────────────────────────────────────────────────────────

const ALL_NAV_ITEMS = NAV_SECTIONS.flatMap((s) => s.items)

// ─── 工具组件 ───────────────────────────────────────────────────────────────

function CodeBlock({ children }: { children: string }) {
  return (
    <div className="code-block rounded-lg bg-black/40 border border-white/[0.06] p-4 font-mono text-sm text-white/80 overflow-x-auto my-4">
      <pre className="whitespace-pre">{children}</pre>
    </div>
  )
}

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

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState<string>('intro')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())
  const contentRef = useRef<HTMLDivElement>(null)

  // 滚动监听 — 高亮当前 section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length > 0) {
          // 取最靠上的
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

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setMobileNavOpen(false)
    }
  }

  // 面包屑：找当前 section 所属的 group
  const currentSectionGroup = NAV_SECTIONS.find((s) => s.items.some((i) => i.id === activeSection))
  const currentNavItem = ALL_NAV_ITEMS.find((i) => i.id === activeSection)

  return (
    <div className="min-h-screen bg-ink-900 pt-16">
      {/* ── 文档 Header ── */}
      <div className="border-b border-white/[0.06] bg-ink-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-white/40">
            <Link to="/" className="hover:text-white/70 transition-colors">首页</Link>
            <span>/</span>
            <span className="text-white/70">文档</span>
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

      {/* ── 主体布局 ── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex gap-8 py-8">
        {/* ── 左侧 Sidebar ── */}
        <aside className="w-64 shrink-0 hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto scrollbar-thin">
            {/* Logo / 品牌 */}
            <div className="flex items-center gap-2.5 mb-6 px-2">
              <img src="/logo-vertical.svg" alt="Ydsz Worker" className="h-7" />
              <span className="text-base font-bold text-white tracking-tight">
                产品文档
              </span>
            </div>

            {/* 导航 */}
            <nav className="space-y-5">
              {NAV_SECTIONS.map((section) => {
                const isCollapsed = collapsedSections.has(section.title)
                return (
                  <div key={section.title}>
                    <button
                      onClick={() => toggleSection(section.title)}
                      className="w-full flex items-center justify-between group mb-2 px-1"
                    >
                      <h4 className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-white/30 group-hover:text-white/50 transition-colors">
                        <span className="text-yuanbao-500/60">{section.icon}</span>
                        {section.title}
                      </h4>
                      <svg
                        className={`w-3 h-3 text-white/30 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {!isCollapsed && (
                      <ul className="space-y-0.5">
                        {section.items.map((item) => (
                          <li key={item.id}>
                            <button
                              onClick={() => scrollToSection(item.id)}
                              className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition-all duration-200 ${
                                activeSection === item.id
                                  ? 'text-yuanbao-400 font-medium border-l-2 border-yuanbao-500 bg-yuanbao-500/[0.06] -ml-px'
                                  : 'text-white/50 hover:text-white/80 hover:bg-white/[0.03]'
                              }`}
                            >
                              {item.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )
              })}
            </nav>

            <SectionDivider variant="line" />

            {/* 帮助链接 */}
            <div className="mt-6 px-2">
              <p className="text-xs text-white/30 mb-3">需要帮助？</p>
              <div className="space-y-2">
                <a href="https://github.com/ydsz-buddy/ydsz-worker/issues" className="block text-sm text-white/50 hover:text-yuanbao-400 transition-colors" target="_blank" rel="noopener noreferrer">
                  GitHub Issues
                </a>
                <a href="#" className="block text-sm text-white/50 hover:text-yuanbao-400 transition-colors">
                  微信群
                </a>
                <a href="mailto:support@ydsz.dev" className="block text-sm text-white/50 hover:text-yuanbao-400 transition-colors">
                  邮箱支持
                </a>
              </div>
            </div>
          </div>
        </aside>

        {/* ── 右侧内容区 ── */}
        <main ref={contentRef} className="flex-1 min-w-0">
          <article className="max-w-3xl mx-auto">
            {/* 面包屑 */}
            <nav className="flex items-center gap-2 text-xs text-white/40 mb-6">
              <span className="text-white/50">文档</span>
              <span>/</span>
              {currentSectionGroup && (
                <span className="text-white/50">{currentSectionGroup.title}</span>
              )}
              <span>/</span>
              <span className="text-white/70">{currentNavItem?.label}</span>
            </nav>

            {/* ════════ Section 1: 简介 ════════ */}
            <div id="intro" data-doc-section className="mb-20">
              <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-yuanbao-500/10 text-yuanbao-400 mb-4">入门</span>
              <h1 className="text-4xl font-bold text-white mb-4">简介</h1>
              <p className="text-lg text-white/60 mb-8">云顶数字工作台是什么，它解决了什么问题</p>

              <div className="space-y-6">
                <section>
                  <h2 className="text-2xl font-bold text-white mb-3">核心理念</h2>
                  <p className="text-white/60 leading-relaxed">
                    云顶数字工作台（Ydsz Worker）是一个自托管的企业级 AI 助手平台。它不依赖任何外部云服务，完全运行在你自己的硬件上，
                    确保数据隐私和安全。通过整合 LLM、多 Agent 协作、知识库、IM 通道、定时任务等能力，
                    它为企业和个人提供了一个"会思考、能干活、陪成长"的智能伙伴。
                  </p>
                  <p className="text-white/60 leading-relaxed mt-3">
                    与传统 SaaS AI 工具不同，Ydsz Worker 的核心哲学是：<strong className="text-white/80">数据归你、能力可扩展、生态开放</strong>。
                    无论是接入企业微信、飞书、钉钉等 IM 平台，还是集成自定义的 MCP 工具，都能在配置文件中完成。
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">六大亮点</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FeatureCard
                      icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>}
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
              <nav className="flex items-center justify-between mt-16 pt-8 border-t border-white/[0.06]">
                <div></div>
                <button onClick={() => scrollToSection('quickstart')} className="flex items-center gap-2 text-sm text-yuanbao-400 hover:text-yuanbao-300 transition-colors">
                  快速开始
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                </button>
              </nav>
            </div>

            {/* ════════ Section 2: 快速开始 ════════ */}
            <div id="quickstart" data-doc-section className="mb-20">
              <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-yuanbao-500/10 text-yuanbao-400 mb-4">入门</span>
              <h1 className="text-4xl font-bold text-white mb-4">快速开始</h1>
              <p className="text-lg text-white/60 mb-8">四步上手，五分钟跑起来</p>

              <div className="space-y-6">
                <section>
                  <h2 className="text-2xl font-bold text-white mb-3">安装</h2>
                  <p className="text-white/60 leading-relaxed">
                    最快捷的方式是使用 <code className="px-1.5 py-0.5 rounded bg-white/[0.06] text-yuanbao-300 text-sm font-mono">uv</code> 安装：
                  </p>
                  <CodeBlock>{`pip install ydsz-worker
# 或者使用 uv（推荐）
uv tool install ydsz-worker`}</CodeBlock>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-3">首次启动</h2>
                  <p className="text-white/60 leading-relaxed">
                    运行启动命令，程序会自动创建SQLite数据库并引导你完成初始化配置：
                  </p>
                  <CodeBlock>{`ydsz-worker run

# 输出：
# ✓ Database initialized at ~/.ydsz-worker/data.db
# ✓ Config file created at ~/.ydsz-worker/config.json
# ➜ Dashboard: http://localhost:8080
# ➜ API Docs:  http://localhost:8080/api/docs`}</CodeBlock>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">四步上手流程</h2>
                  <div className="space-y-4">
                    {[
                      { step: '1', title: '设置 LLM 提供商', desc: '在 Dashboard 设置页面填入你的 OpenAI/Anthropic/Ollama API Key，或选择本地 Ollama 模型。' },
                      { step: '2', title: '创建 Agent', desc: '新建你的第一个 Agent，选择一个 Expert 模板（如 Code Expert），赋予它合适的人格和能力。' },
                      { step: '3', title: '开启对话', desc: '在聊天窗口中发送消息，Agent 会调用工具（浏览器、代码执行、文件操作等）帮你完成任务。' },
                      { step: '4', title: '配置 IM 通道', desc: '绑定企业微信/飞书/钉钉，让 Agent 在日常工作群中响应消息，提供 7×24 服务。' },
                    ].map((item) => (
                      <div key={item.step} className="flex gap-4 items-start">
                        <div className="w-8 h-8 shrink-0 rounded-full bg-yuanbao-500/15 text-yuanbao-400 flex items-center justify-center text-sm font-bold">
                          {item.step}
                        </div>
                        <div>
                          <h4 className="text-white font-medium mb-1">{item.title}</h4>
                          <p className="text-sm text-white/50">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* 分页 */}
              <nav className="flex items-center justify-between mt-16 pt-8 border-t border-white/[0.06]">
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

            {/* ════════ Section 3: 截图和视频 ════════ */}
            <div id="screenshots" data-doc-section className="mb-20">
              <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-yuanbao-500/10 text-yuanbao-400 mb-4">入门</span>
              <h1 className="text-4xl font-bold text-white mb-4">截图和视频</h1>
              <p className="text-lg text-white/60 mb-8">一览 Dashboard 的核心界面</p>

              <div className="space-y-6">
                <section>
                  <h2 className="text-2xl font-bold text-white mb-3">Dashboard 概览</h2>
                  <p className="text-white/60 leading-relaxed">
                    Ydsz Worker 提供了功能完整的 Web Dashboard，你可以通过它管理 Agent、监控会话、配置连接器和 IM 通道。
                    四条核心工作流在首页一目了然：对话管理、专家配置、插件市场和系统监控。
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">功能截图</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { title: '对话界面', desc: '多轮对话，工具调用可视化，附件上传与代码高亮', color: 'from-yuanbao-500/20 to-emerald-900/20' },
                      { title: 'Agent 管理', desc: '创建、配置、启停 Agent，设置 SOUL 人格和专家模板', color: 'from-blue-500/20 to-indigo-900/20' },
                      { title: '定时任务面板', desc: '可视化管理 Cron 任务，支持 Webhook 触发和手动执行', color: 'from-purple-500/20 to-violet-900/20' },
                      { title: '连接器配置', desc: 'OAuth 授权、MCP 工具注册、第三方服务绑定', color: 'from-amber-500/20 to-orange-900/20' },
                    ].map((card) => (
                      <div key={card.title} className="group rounded-xl overflow-hidden border border-white/[0.06] hover:border-yuanbao-500/30 transition-all duration-300">
                        <div className={`h-40 bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                          <div className="w-16 h-16 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                            <svg className="w-8 h-8 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                            </svg>
                          </div>
                        </div>
                        <div className="p-4">
                          <h4 className="text-white font-medium text-sm mb-1">{card.title}</h4>
                          <p className="text-xs text-white/40">{card.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-3">视频教程</h2>
                  <p className="text-white/60 leading-relaxed">
                    我们制作了一系列入门视频教程，涵盖了安装、配置、创建第一个 Agent 以及接入 IM 通道的完整流程。
                    <a href="#" className="text-yuanbao-400 hover:text-yuanbao-300 underline underline-offset-4 ml-1">前往 B 站观看 →</a>
                  </p>
                </section>
              </div>

              {/* 分页 */}
              <nav className="flex items-center justify-between mt-16 pt-8 border-t border-white/[0.06]">
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

            {/* ════════ Section 4: 常见概念 ════════ */}
            <div id="concepts" data-doc-section className="mb-20">
              <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-yuanbao-500/10 text-yuanbao-400 mb-4">入门</span>
              <h1 className="text-4xl font-bold text-white mb-4">常见概念</h1>
              <p className="text-lg text-white/60 mb-8">理解 Ydsz Worker 的核心术语</p>

              <div className="space-y-6">
                {[
                  {
                    name: 'Agent',
                    desc: 'Agent 是 Ydsz Worker 的核心运行单元。每个 Agent 拥有自己的 Workspace、SOUL 人格定义、绑定的 Expert 和工具集。你可以创建多个 Agent，各自承担不同职责——比如一个负责日常对话，一个专注代码生成。',
                  },
                  {
                    name: 'Session（会话）',
                    desc: '会话是用户与 Agent 之间的一次交互上下文。每个会话包含完整的消息历史、工具调用记录和中间状态。会话支持持久化，你可以随时回到之前的对话继续工作。',
                  },
                  {
                    name: 'Thread（话题）',
                    desc: 'Thread 是 IM 通道中的消息线程。当 Agent 在群聊中被 @ 触发时，Thread 跟踪该次对话的上下文，让 Agent 能够理解群聊中多用户参与的讨论流。',
                  },
                  {
                    name: 'Workspace（工作区）',
                    desc: '每个 Agent 拥有独立的 Workspace 目录，存储 SOUL.md 人格文件、Memory 记忆、Skills 技能树、知识库和配置文件。Workspace 支持本地文件系统和远程存储后端（S3/COS）。',
                  },
                  {
                    name: 'Expert（专家）',
                    desc: 'Expert 是预配置的 Agent 模板，内置了特定领域的 Tool Set、SOUL 定义和工作流。例如 "Code Expert" 擅长代码生成和调试，"Ops Expert" 专注运维和部署任务。',
                  },
                  {
                    name: 'MCP（Model Context Protocol）',
                    desc: 'MCP 是 Anthropic 提出的开放协议，让 AI 模型能够安全地连接外部工具和数据源。Ydsz Worker 内置 MCP 网关，支持接入任意兼容 MCP 的工具服务。',
                  },
                ].map((concept, idx) => (
                  <section key={concept.name} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-7 h-7 rounded-lg bg-yuanbao-500/10 flex items-center justify-center text-yuanbao-400 text-xs font-bold">
                        {idx + 1}
                      </span>
                      <h2 className="text-xl font-bold text-white">{concept.name}</h2>
                    </div>
                    <p className="text-white/60 leading-relaxed">{concept.desc}</p>
                  </section>
                ))}
              </div>

              {/* 分页 */}
              <nav className="flex items-center justify-between mt-16 pt-8 border-t border-white/[0.06]">
                <button onClick={() => scrollToSection('screenshots')} className="flex items-center gap-2 text-sm text-white/50 hover:text-white/70 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                  截图和视频
                </button>
                <button onClick={() => scrollToSection('desktop')} className="flex items-center gap-2 text-sm text-yuanbao-400 hover:text-yuanbao-300 transition-colors">
                  桌面客户端
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                </button>
              </nav>
            </div>

            {/* ════════ Section 5: 桌面客户端 ════════ */}
            <div id="desktop" data-doc-section className="mb-20">
              <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-yuanbao-500/10 text-yuanbao-400 mb-4">安装指南</span>
              <h1 className="text-4xl font-bold text-white mb-4">桌面客户端</h1>
              <p className="text-lg text-white/60 mb-8">图形化安装，零命令行操作</p>

              <div className="space-y-6">
                <section>
                  <h2 className="text-2xl font-bold text-white mb-3">macOS / Windows / Linux</h2>
                  <p className="text-white/60 leading-relaxed">
                    桌面客户端提供图形化的安装向导，自动完成依赖检测、数据库初始化和端口配置。
                    适合不熟悉命令行的用户快速上手，内置自动更新机制确保你始终运行最新版本。
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-3">系统支持</h2>
                  <ul className="space-y-3">
                    {[
                      { platform: 'macOS', detail: '12+ (Monterey), Apple Silicon / Intel' },
                      { platform: 'Windows', detail: 'Windows 10/11, x64' },
                      { platform: 'Linux', detail: 'Ubuntu 20.04+, Debian 11+, Fedora 36+' },
                    ].map((item) => (
                      <li key={item.platform} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-yuanbao-500 mt-2 shrink-0" />
                        <span className="text-white/60"><strong className="text-white/80">{item.platform}：</strong>{item.detail}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-3">下载安装</h2>
                  <p className="text-white/60 leading-relaxed">
                    前往 <a href="https://gitee.com/njydsz/ydsz-worker/releases" className="text-yuanbao-400 hover:text-yuanbao-300 underline underline-offset-4" target="_blank" rel="noopener noreferrer">Releases 页面</a> 下载对应平台的安装包。
                    macOS 用户可以直接拖拽到 Applications 文件夹；Windows 用户运行 .exe 安装向导。
                  </p>
                </section>
              </div>

              {/* 分页 */}
              <nav className="flex items-center justify-between mt-16 pt-8 border-t border-white/[0.06]">
                <button onClick={() => scrollToSection('concepts')} className="flex items-center gap-2 text-sm text-white/50 hover:text-white/70 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                  常见概念
                </button>
                <button onClick={() => scrollToSection('pip-install')} className="flex items-center gap-2 text-sm text-yuanbao-400 hover:text-yuanbao-300 transition-colors">
                  pip 安装
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                </button>
              </nav>
            </div>

            {/* ════════ Section 6: pip 安装 ════════ */}
            <div id="pip-install" data-doc-section className="mb-20">
              <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-yuanbao-500/10 text-yuanbao-400 mb-4">安装指南</span>
              <h1 className="text-4xl font-bold text-white mb-4">pip 安装</h1>
              <p className="text-lg text-white/60 mb-8">Python 原生安装方式</p>

              <div className="space-y-6">
                <section>
                  <h2 className="text-2xl font-bold text-white mb-3">Python 版本要求</h2>
                  <p className="text-white/60 leading-relaxed">
                    Ydsz Worker 需要 <strong className="text-white/80">Python 3.12</strong> 或更高版本。推荐使用 <code className="px-1.5 py-0.5 rounded bg-white/[0.06] text-yuanbao-300 text-sm font-mono">uv</code> 包管理器以获得最佳体验：
                  </p>
                  <CodeBlock>{`# 检查 Python 版本
python3 --version  # >= 3.12

# 安装 uv（如未安装）
curl -LsSf https://astral.sh/uv/install.sh | sh`}</CodeBlock>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-3">安装命令</h2>
                  <CodeBlock>{`# 使用 uv 安装（推荐）
uv tool install ydsz-worker

# 或使用 pip
pip install ydsz-worker

# 验证安装
ydsz-worker --version`}</CodeBlock>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-3">运行服务</h2>
                  <CodeBlock>{`# 启动 server（默认端口 8080）
ydsz-worker run

# 指定端口
ydsz-worker run --port 9090

# 后台运行（Linux/macOS）
nohup ydsz-worker run &`}</CodeBlock>
                  <p className="text-white/60 leading-relaxed mt-3">
                    首次运行会自动创建 <code className="px-1.5 py-0.5 rounded bg-white/[0.06] text-yuanbao-300 text-sm font-mono">~/.ydsz-worker/</code> 目录并初始化数据库。
                    启动完成后，打开浏览器访问 <code className="px-1.5 py-0.5 rounded bg-white/[0.06] text-yuanbao-300 text-sm font-mono">http://localhost:8080</code> 进入 Dashboard。
                  </p>
                </section>
              </div>

              {/* 分页 */}
              <nav className="flex items-center justify-between mt-16 pt-8 border-t border-white/[0.06]">
                <button onClick={() => scrollToSection('desktop')} className="flex items-center gap-2 text-sm text-white/50 hover:text-white/70 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                  桌面客户端
                </button>
                <button onClick={() => scrollToSection('docker')} className="flex items-center gap-2 text-sm text-yuanbao-400 hover:text-yuanbao-300 transition-colors">
                  Docker 部署
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                </button>
              </nav>
            </div>

            {/* ════════ Section 7: Docker 部署 ════════ */}
            <div id="docker" data-doc-section className="mb-20">
              <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-yuanbao-500/10 text-yuanbao-400 mb-4">安装指南</span>
              <h1 className="text-4xl font-bold text-white mb-4">Docker 部署</h1>
              <p className="text-lg text-white/60 mb-8">容器化一键部署</p>

              <div className="space-y-6">
                <section>
                  <h2 className="text-2xl font-bold text-white mb-3">docker-compose.yml</h2>
                  <p className="text-white/60 leading-relaxed">
                    以下是一个完整的 Docker Compose 配置，包含了端口映射、数据持久化和环境变量设置：
                  </p>
                  <CodeBlock>{`version: "3.8"
services:
  ydsz-worker:
    image: njydsz/ydsz-worker:latest
    container_name: ydsz-worker
    restart: unless-stopped
    ports:
      - "8080:8080"
    volumes:
      - ~/.ydsz-worker:/app/data
    environment:
      - YDSZ_LLM_PROVIDER=openai
      - YDSZ_LLM_API_KEY=sk-xxx
      - YDSZ_LLM_MODEL=gpt-4o
      - YDSZ_DEFAULT_TIMEZONE=Asia/Shanghai
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3`}</CodeBlock>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-3">数据目录</h2>
                  <p className="text-white/60 leading-relaxed">
                    容器内的数据存储在 <code className="px-1.5 py-0.5 rounded bg-white/[0.06] text-yuanbao-300 text-sm font-mono">/app/data</code>，
                    通过 volume 映射到宿主机的 <code className="px-1.5 py-0.5 rounded bg-white/[0.06] text-yuanbao-300 text-sm font-mono">~/.ydsz-worker/</code>。
                    升级镜像时数据会自动保留：
                  </p>
                  <CodeBlock>{`# 启动
docker compose up -d

# 查看日志
docker compose logs -f

# 升级（保留数据）
docker compose pull
docker compose up -d`}</CodeBlock>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-3">单命令启动</h2>
                  <p className="text-white/60 leading-relaxed">
                    如果只是想快速试一下，也可以用一条命令启动：
                  </p>
                  <CodeBlock>{`docker run -d \\
  --name ydsz-worker \\
  -p 8080:8080 \\
  -v ~/.ydsz-worker:/app/data \\
  njydsz/ydsz-worker:latest`}</CodeBlock>
                </section>
              </div>

              {/* 分页 */}
              <nav className="flex items-center justify-between mt-16 pt-8 border-t border-white/[0.06]">
                <button onClick={() => scrollToSection('pip-install')} className="flex items-center gap-2 text-sm text-white/50 hover:text-white/70 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                  pip 安装
                </button>
                <button onClick={() => scrollToSection('fnos')} className="flex items-center gap-2 text-sm text-yuanbao-400 hover:text-yuanbao-300 transition-colors">
                  飞牛 FnOS
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                </button>
              </nav>
            </div>

            {/* ════════ Section 8: 飞牛 FnOS ════════ */}
            <div id="fnos" data-doc-section className="mb-20">
              <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-yuanbao-500/10 text-yuanbao-400 mb-4">安装指南</span>
              <h1 className="text-4xl font-bold text-white mb-4">飞牛 FnOS</h1>
              <p className="text-lg text-white/60 mb-8">NAS 上一键安装</p>

              <div className="space-y-6">
                <section>
                  <h2 className="text-2xl font-bold text-white mb-3">前置条件</h2>
                  <p className="text-white/60 leading-relaxed">
                    飞牛 FnOS（FnOS）是基于 Debian 的 NAS 操作系统，支持 Docker 应用。
                    确保你的 FnOS 版本在 0.8 以上，并且已开启 Docker 套件。
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">安装步骤</h2>
                  <div className="space-y-4">
                    {[
                      { step: '1', title: '开启 Docker', desc: '进入 FnOS 控制面板 → 应用管理 → Docker → 开启服务。' },
                      { step: '2', title: '创建容器', desc: '点击「新建容器」，选择「从镜像创建」，搜索 njydsz/ydsz-worker。' },
                      { step: '3', title: '配置映射', desc: '设置端口映射 8080:8080，创建一个 Volume 映射到 /app/data 用于数据持久化。' },
                      { step: '4', title: '启动使用', desc: '启动容器后，在浏览器访问 http://<NAS-IP>:8080 进入 Dashboard。' },
                    ].map((item) => (
                      <div key={item.step} className="flex gap-4 items-start">
                        <div className="w-8 h-8 shrink-0 rounded-full bg-yuanbao-500/15 text-yuanbao-400 flex items-center justify-center text-sm font-bold">
                          {item.step}
                        </div>
                        <div>
                          <h4 className="text-white font-medium mb-1">{item.title}</h4>
                          <p className="text-sm text-white/50">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-3">性能建议</h2>
                  <ul className="space-y-3">
                    {[
                      '推荐飞牛 NAS 至少具备 4GB RAM，确保 Agent 运行时流畅',
                      '存储后端建议使用本地磁盘模式，避免网络存储的延迟',
                      '如需运行浏览器自动化，建议开启 Docker 的 privileged 模式',
                      '定期备份 ~/.ydsz-worker 目录，防止系统升级时数据丢失',
                    ].map((tip, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-yuanbao-500 mt-2 shrink-0" />
                        <span className="text-white/60 text-sm">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              {/* 分页 */}
              <nav className="flex items-center justify-between mt-16 pt-8 border-t border-white/[0.06]">
                <button onClick={() => scrollToSection('docker')} className="flex items-center gap-2 text-sm text-white/50 hover:text-white/70 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                  Docker 部署
                </button>
                <button onClick={() => scrollToSection('requirements')} className="flex items-center gap-2 text-sm text-yuanbao-400 hover:text-yuanbao-300 transition-colors">
                  系统要求
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                </button>
              </nav>
            </div>

            {/* ════════ Section 9: 系统要求（附加） ════════ */}
            <div id="requirements" data-doc-section className="mb-20">
              <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-yuanbao-500/10 text-yuanbao-400 mb-4">安装指南</span>
              <h1 className="text-4xl font-bold text-white mb-4">系统要求</h1>
              <p className="text-lg text-white/60 mb-8">运行 Ydsz Worker 的最低配置</p>

              <div className="space-y-6">
                <section>
                  <h2 className="text-2xl font-bold text-white mb-3">硬件要求</h2>
                  <p className="text-white/60 leading-relaxed">
                    Ydsz Worker 对硬件要求不高，一台普通 NAS 或小型VPS即可运行。
                    具体需求取决于你选择的 LLM 提供商：使用云 API 时硬件要求极低，使用本地 Ollama 时则需要相应的 GPU 或充足 RAM。
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-3">软件要求</h2>
                  <ul className="space-y-3">
                    {[
                      { name: 'Python', ver: '3.12+ （如果使用 pip 安装）' },
                      { name: 'Docker', ver: '20.10+ （如果使用容器部署）' },
                      { name: 'SQLite', ver: '3.35+ （内置，一般无需关心）' },
                      { name: 'PostgreSQL', ver: '13+ （可选，替代 SQLite）' },
                    ].map((req) => (
                      <li key={req.name} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-yuanbao-500 mt-2 shrink-0" />
                        <span className="text-white/60"><strong className="text-white/80">{req.name}：</strong>{req.ver}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              {/* 分页 */}
              <nav className="flex items-center justify-between mt-16 pt-8 border-t border-white/[0.06]">
                <button onClick={() => scrollToSection('fnos')} className="flex items-center gap-2 text-sm text-white/50 hover:text-white/70 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                  飞牛 FnOS
                </button>
                <button onClick={() => scrollToSection('intro')} className="flex items-center gap-2 text-sm text-yuanbao-400 hover:text-yuanbao-300 transition-colors">
                  返回简介
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                </button>
              </nav>
            </div>

            {/* ── 文档底部 ── */}
            <div className="text-center py-12 border-t border-white/[0.06]">
              <p className="text-sm text-white/30">
                找不到所需内容？
                <a href="https://github.com/ydsz-buddy/ydsz-worker/issues" className="text-yuanbao-400 hover:text-yuanbao-300 ml-1 underline underline-offset-4" target="_blank" rel="noopener noreferrer">
                  在 GitHub 发起 Issue
                </a>
              </p>
            </div>
          </article>
        </main>
      </div>
    </div>
  )
}
