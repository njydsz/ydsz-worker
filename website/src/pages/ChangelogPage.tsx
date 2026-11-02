import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'

interface ChangeItem {
  text: string
}

interface ChangeGroup {
  labelKey: string
  icon: string
  color: string
  items: ChangeItem[]
}

interface VersionEntry {
  version: string
  codename: string
  date: string
  summary: string
  groups: ChangeGroup[]
}

const VERSIONS: VersionEntry[] = [
  {
    version: 'v2.4.0',
    codename: 'Azure',
    date: '2026-10-25',
    summary: '官方网站上线、多页面路由支持、安装脚本修正与启动器优化。',
    groups: [
      {
        labelKey: 'cl.new',
        icon: '✨',
        color: 'yuanbao',
        items: [
          { text: '官方文档网站：独立的 Vite + React 多页 SPA，含专家市场、插件市场、贡献季、更新日志' },
          { text: '多页面路由支持：React Router + 嵌套 Layout，共享 Navbar/Footer/背景装饰' },
          { text: '安装脚本修正：增强跨平台兼容性与错误提示' },
        ],
      },
      {
        labelKey: 'cl.change',
        icon: '🔄',
        color: 'blue',
        items: [
          { text: '前端构建配置优化：Tailwind 自定义主题 + 卡片发光动效' },
          { text: '项目目录结构重组：website 独立模块 + 统一资源路径' },
          { text: 'ydsz-worker run CLI 启动器稳定性改进' },
        ],
      },
      {
        labelKey: 'cl.fix',
        icon: '🐛',
        color: 'red',
        items: [
          { text: '修复 Windows 环境下 npm 脚本无法正确执行的问题' },
          { text: '修复 Tailwind 暗色模式部分配色变量未生效的 bug' },
          { text: '修复 Dashboard 暗色光标不可见问题' },
        ],
      },
      {
        labelKey: 'cl.security',
        icon: '🔒',
        color: 'amber',
        items: [
          { text: '更新依赖版本，修补已知安全漏洞' },
          { text: '强化 Content-Security-Policy 配置' },
        ],
      },
    ],
  },
  {
    version: 'v2.3.2',
    codename: 'Verdant',
    date: '2026-09-30',
    summary: '多页面视觉精致化、专家插件市场、全局动效升级。',
    groups: [
      {
        labelKey: 'cl.new',
        icon: '✨',
        color: 'yuanbao',
        items: [
          { text: '专家市场页面：筛选 + 搜索 + 22 名专家卡片展示' },
          { text: '插件市场页面：筛选 + 搜索 + 25 款插件卡片展示' },
          { text: 'card-glow 组件类：hover 发光 + 浮动效果' },
        ],
      },
      {
        labelKey: 'cl.change',
        icon: '🔄',
        color: 'blue',
        items: [
          { text: '全局 CSS 增强：渐变光晕、模糊装饰、mask-fade 工具类' },
          { text: '统一下载链接指向 GitHub 官方仓库' },
          { text: 'Hero 区块视觉重设计：大标题渐变、底部透明度遮罩优化' },
        ],
      },
      {
        labelKey: 'cl.fix',
        icon: '🐛',
        color: 'red',
        items: [
          { text: '修复专家卡片在响应式布局下错位的问题' },
          { text: '修复搜索框输入无法正确触发 useState 更新的问题' },
        ],
      },
    ],
  },
  {
    version: 'v2.3.1',
    codename: 'Canopy',
    date: '2026-09-15',
    summary: '独立 website 模块拆分、基础路由架构、单页应用升级。',
    groups: [
      {
        labelKey: 'cl.new',
        icon: '✨',
        color: 'yuanbao',
        items: [
          { text: 'website/ 独立前端模块：React 18 + TypeScript + Vite 基础配置' },
          { text: '基础路由架构：BrowserRouter + 嵌套 Layout + 页面懒加载' },
          { text: '通用 UI 组件库：Navbar, Footer, BackgroundDecorations, Layout' },
        ],
      },
      {
        labelKey: 'cl.change',
        icon: '🔄',
        color: 'blue',
        items: [
          { text: 'Tailwind 配置扩展：自定义 yuanbao/ink 调色板 + 字体内嵌' },
          { text: 'Git 仓库结构整合：website 自包含 + 资源一体化' },
        ],
      },
      {
        labelKey: 'cl.fix',
        icon: '🐛',
        color: 'red',
        items: [
          { text: '修复开发与生产构建产物路径不一致问题' },
          { text: '修复 Navbar 滚动状态检测在 Safari 浏览器下的背景错位' },
        ],
      },
    ],
  },
]

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; badge: string; dot: string }> = {
  yuanbao: {
    bg: 'bg-yuanbao-500/10',
    border: 'border-yuanbao-500/20',
    text: 'text-yuanbao-400',
    badge: 'bg-yuanbao-500/10 text-yuanbao-400 border-yuanbao-500/20',
    dot: 'bg-yuanbao-400',
  },
  blue: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    text: 'text-blue-400',
    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    dot: 'bg-blue-400',
  },
  red: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    text: 'text-red-400',
    badge: 'bg-red-500/10 text-red-400 border-red-500/20',
    dot: 'bg-red-400',
  },
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    text: 'text-amber-400',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    dot: 'bg-amber-400',
  },
}

export default function ChangelogPage() {
  const { t } = useLanguage()
  const [activeVersion, setActiveVersion] = useState<string>(VERSIONS[0].version)

  const current = VERSIONS.find((v) => v.version === activeVersion) ?? VERSIONS[0]
  const currentIdx = VERSIONS.findIndex((v) => v.version === activeVersion)

  return (
    <div className="py-16 lg:py-24">
      <div className="container-page">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="section-label mb-4">{t('cl.title')}</span>
          <h1 className="heading-xl mt-4 mb-3">
            <span className="text-gradient">Changelog</span>
          </h1>
          <p className="text-white/60 text-lg">
            {t('cl.subtitle')}
          </p>
        </div>

        {/* Content Layout: Left Nav + Right Details */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Version List (1/4 sticky) */}
          <aside className="lg:w-1/4 shrink-0">
            <div className="lg:sticky lg:top-24">
              <h2 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-4 px-1">
                版本列表
              </h2>
              <nav className="space-y-2">
                {VERSIONS.map((v) => (
                  <button
                    key={v.version}
                    onClick={() => setActiveVersion(v.version)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 border group ${
                      activeVersion === v.version
                        ? 'bg-yuanbao-500/10 border-yuanbao-500/30'
                        : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.1]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full transition-colors ${
                            activeVersion === v.version ? 'bg-yuanbao-400' : 'bg-white/20 group-hover:bg-white/40'
                          }`}
                        />
                        <span
                          className={`font-mono font-semibold text-sm transition-colors ${
                            activeVersion === v.version ? 'text-yuanbao-400' : 'text-white/70 group-hover:text-white'
                          }`}
                        >
                          {v.version}
                        </span>
                      </div>
                      <span className="text-xs text-white/40">{v.date}</span>
                    </div>
                    <div
                      className={`text-xs mt-0.5 ml-4 transition-colors ${
                        activeVersion === v.version ? 'text-white/50' : 'text-white/30 group-hover:text-white/50'
                      }`}
                    >
                      {v.codename} · {v.groups.reduce((n, g) => n + g.items.length, 0)} {t('cl.changes_count')}
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Right Content - Version Details (3/4) */}
          <div className="lg:w-3/4 min-w-0">
            <div className="card-glass p-8 relative overflow-hidden">
              {/* Background decoration */}
              <svg className="absolute -top-8 -right-8 w-40 h-40 opacity-5" viewBox="0 0 160 160" fill="none">
                <circle cx="80" cy="80" r="80" fill="#22c55e" />
                <circle cx="100" cy="60" r="40" fill="#4ade80" opacity="0.5" />
              </svg>

              {/* Version Header */}
              <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-white">{current.version}</h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-yuanbao-500/10 border border-yuanbao-500/20 text-yuanbao-400 text-xs font-medium">
                      代号：{current.codename}
                    </span>
                    <span className="text-xs text-white/30 font-mono">{current.date}</span>
                  </div>
                  <p className="text-white/60 text-sm">{current.summary}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-white/30">v{currentIdx + 1}/{VERSIONS.length}</span>
                  <a
                    href="https://gitee.com/njydsz/ydsz-worker/releases"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary text-sm !px-4 !py-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    全部 Release
                  </a>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-white/[0.06] pt-6 space-y-8">
                {current.groups.map((group) => {
                  const colors = COLOR_MAP[group.color] ?? COLOR_MAP.yuanbao
                  return (
                    <div key={group.labelKey}>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-lg">{group.icon}</span>
                        <h3 className={`font-semibold ${colors.text}`}>{t(group.labelKey)}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs border ${colors.badge}`}>
                          {group.items.length}
                        </span>
                      </div>
                      <ul className="space-y-3">
                        {group.items.map((item, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-3 text-white/70 text-sm leading-relaxed"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${colors.dot}`} />
                            {item.text}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Version Navigation */}
            <div className="flex items-center justify-between mt-6">
              {currentIdx > 0 ? (
                <button
                  onClick={() => setActiveVersion(VERSIONS[currentIdx - 1].version)}
                  className="btn-ghost"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="text-sm">{VERSIONS[currentIdx - 1].version}</span>
                </button>
              ) : <div />}
              {currentIdx < VERSIONS.length - 1 ? (
                <button
                  onClick={() => setActiveVersion(VERSIONS[currentIdx + 1].version)}
                  className="btn-ghost"
                >
                  <span className="text-sm">{VERSIONS[currentIdx + 1].version}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : <div />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
