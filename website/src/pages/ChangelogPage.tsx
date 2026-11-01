import { useState } from 'react'

interface ChangeItem {
  text: string
}

interface ChangeGroup {
  label: string
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
    date: '2025-06-15',
    summary: '全新的插件架构、多模态支持与性能大幅提升。',
    groups: [
      {
        label: '新增',
        icon: '✨',
        color: 'yuanbao',
        items: [
          { text: '插件系统 2.0：支持热加载、依赖隔离和版本锁定' },
          { text: '多模态输入：支持图片、PDF、音频作为对话上下文' },
          { text: 'Agent 团队协作：多 Agent 并行任务编排引擎' },
        ],
      },
      {
        label: '变更',
        icon: '🔄',
        color: 'blue',
        items: [
          { text: '重构了消息流水线，延迟降低约 40%' },
          { text: 'Dashboard 升级至 React 19，迁移至 Vite 6' },
          { text: 'CLI 工具增加自动补全与交互式向导' },
        ],
      },
      {
        label: '修复',
        icon: '🐛',
        color: 'red',
        items: [
          { text: '修复 PostgreSQL 连接池在高并发下的泄漏问题' },
          { text: '修复 WeCom 渠道文件上传超过 10MB 失败的问题' },
          { text: '修复 cron 任务在夏令时切换时重复触发的问题' },
          { text: '修复专家市场中技能加载超时导致的渲染阻塞' },
        ],
      },
      {
        label: '安全',
        icon: '🔒',
        color: 'amber',
        items: [
          { text: '升级 JWT 验证算法，增加 token 刷新频率限制' },
          { text: '修补 MCP 网关中可能导致 SSRF 的路径遍历漏洞' },
        ],
      },
    ],
  },
  {
    version: 'v2.3.2',
    codename: 'Breeze',
    date: '2025-05-08',
    summary: '稳定性专项修复，提升生产环境可靠性。',
    groups: [
      {
        label: '新增',
        icon: '✨',
        color: 'yuanbao',
        items: [
          { text: '支持自定义模型 Provider 的健康检查端点' },
          { text: '新增审计日志导出功能（CSV / JSON 格式）' },
        ],
      },
      {
        label: '变更',
        icon: '🔄',
        color: 'blue',
        items: [
          { text: '优化了 Gateway 的消息路由算法，减少 20% CPU 占用' },
          { text: '日志输出格式统一为结构化 JSON' },
        ],
      },
      {
        label: '修复',
        icon: '🐛',
        color: 'red',
        items: [
          { text: '修复 WebSocket 连接在断网后无法自动重连的问题' },
          { text: '修复记忆系统在大量对话记录下的检索超时' },
          { text: '修复部分场景下 Agent 工作区文件同步冲突' },
        ],
      },
      {
        label: '安全',
        icon: '🔒',
        color: 'amber',
        items: [
          { text: '修复了工作区路径遍历导致潜在文件泄露的风险' },
          { text: '增强用户角色权限校验，防止越权访问' },
        ],
      },
    ],
  },
  {
    version: 'v2.3.1',
    codename: 'Aurora',
    date: '2025-04-20',
    summary: '紧急补丁版本，修复若干影响使用的关键问题。',
    groups: [
      {
        label: '新增',
        icon: '✨',
        color: 'yuanbao',
        items: [
          { text: '新增 server 命令用于系统服务管理（systemd / NSSM）' },
        ],
      },
      {
        label: '变更',
        icon: '🔄',
        color: 'blue',
        items: [
          { text: '改进了安装向导的 UI 交互和表单校验' },
        ],
      },
      {
        label: '修复',
        icon: '🐛',
        color: 'red',
        items: [
          { text: '修复 SQLite WAL 模式在 Windows 共享网络驱动器上的兼容性问题' },
          { text: '修复内存中 metrics 计数器在长时间运行后的溢出问题' },
          { text: '修复中文文件名上传到 S3 存储时的编码问题' },
          { text: '修复 TLS 证书续期过程中服务短暂不可用的时间窗口' },
        ],
      },
      {
        label: '安全',
        icon: '🔒',
        color: 'amber',
        items: [
          { text: '更新依赖库以修补已知 CVE（axios, vite）' },
        ],
      },
    ],
  },
]

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  yuanbao: {
    bg: 'bg-yuanbao-500/10',
    border: 'border-yuanbao-500/20',
    text: 'text-yuanbao-400',
    badge: 'bg-yuanbao-500/10 text-yuanbao-400 border-yuanbao-500/20',
  },
  blue: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    text: 'text-blue-400',
    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  red: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    text: 'text-red-400',
    badge: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    text: 'text-amber-400',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
}

export default function ChangelogPage() {
  const [activeVersion, setActiveVersion] = useState<string>(VERSIONS[0].version)

  const current = VERSIONS.find((v) => v.version === activeVersion) ?? VERSIONS[0]

  return (
    <div className="py-16 lg:py-24">
      <div className="container-page">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="section-label mb-4">更新日志</span>
          <h1 className="heading-xl mt-4 mb-3">
            <span className="text-gradient">Changelog</span>
          </h1>
          <p className="text-white/60 text-lg">
            Ydsz Worker 的所有版本变更记录
          </p>
        </div>

        {/* Content Layout: Left Nav + Right Details */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Version List */}
          <aside className="lg:w-1/4 shrink-0">
            <div className="lg:sticky lg:top-24">
              <h2 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-4">
                版本列表
              </h2>
              <nav className="space-y-2">
                {VERSIONS.map((v) => (
                  <button
                    key={v.version}
                    onClick={() => setActiveVersion(v.version)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 border ${
                      activeVersion === v.version
                        ? 'bg-yuanbao-500/10 border-yuanbao-500/30 text-yuanbao-400'
                        : 'bg-white/[0.02] border-white/[0.06] text-white/70 hover:bg-white/[0.05] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-semibold text-sm">{v.version}</span>
                      <span className="text-xs text-white/40">{v.date}</span>
                    </div>
                    <div className="text-xs opacity-60 mt-0.5">{v.codename}</div>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Right Content - Version Details */}
          <div className="lg:w-3/4 min-w-0">
            <div className="card-glass p-8">
              {/* Version Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-white">{current.version}</h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-yuanbao-500/10 border border-yuanbao-500/20 text-yuanbao-400 text-xs font-medium">
                      {current.codename}
                    </span>
                  </div>
                  <p className="text-white/60">{current.summary}</p>
                </div>
                <a
                  href="https://gitee.com/njydsz/ydsz-worker/releases"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-sm !px-4 !py-2 shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  全部 Release
                </a>
              </div>

              <div className="border-t border-white/[0.06] pt-6 space-y-8">
                {current.groups.map((group) => {
                  const colors = COLOR_MAP[group.color] ?? COLOR_MAP.yuanbao
                  return (
                    <div key={group.label}>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-lg">{group.icon}</span>
                        <h3 className={`font-semibold ${colors.text}`}>{group.label}</h3>
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
                            <span className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${colors.bg} border ${colors.border}`} />
                            {item.text}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
