import { useState } from 'react'
import { Link } from 'react-router-dom'

/* ─────────────────────────────────────────────
   Section 1: Hero
   ───────────────────────────────────────────── */
function Hero() {
  return (
    <section id="overview" className="relative pt-32 pb-20 lg:pt-40 lg:pb-32">
      <div className="container-page">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <a
            href="https://gitee.com/njydsz/ydsz-worker"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yuanbao-500/[0.08] border border-yuanbao-500/20 text-yuanbao-400 text-sm font-medium mb-8 hover:bg-yuanbao-500/[0.12] transition-colors"
          >
            <span className="glow-dot animate-pulse" />
            自托管 · MIT 开源 · 多 Agent 专家架构
          </a>

          {/* Headline */}
          <h1 className="heading-xl text-balance mb-6">
            <span className="block">会思考，能干活</span>
            <span className="block text-gradient">陪企业成长的智能伙伴</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-10 text-balance">
            不仅仅是工具，更是可并行运作的数字生命体。多 Agent 专家架构为团队打造，
            提供高效、灵活、可扩展的智能协作体验。
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <a href="#quickstart" className="btn-primary text-base">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              一分钟上手
            </a>
            <a href="https://gitee.com/njydsz/ydsz-worker" target="_blank" rel="noopener noreferrer" className="btn-secondary">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub
            </a>
          </div>

          {/* Hero Image — 吉祥物 + Dashboard 预览 */}
          <div className="relative max-w-5xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-transparent to-transparent z-10 pointer-events-none" />
            <div className="card-glass p-2 shadow-2xl shadow-yuanbao-500/5">
              <div className="rounded-xl overflow-hidden bg-gradient-to-br from-ink-800 via-ink-800 to-ink-700 aspect-[16/9] flex items-center justify-center relative">
                {/* 背景装饰光晕 */}
                <div className="absolute inset-0 opacity-40">
                  <div className="absolute inset-0 bg-gradient-to-br from-yuanbao-500/5 via-transparent to-yuanbao-600/5" />
                  <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-yuanbao-500/10 rounded-full blur-[100px]" />
                </div>
                <div className="relative flex flex-col sm:flex-row items-center gap-6 sm:gap-10 p-6">
                  {/* 吉祥物 */}
                  <img
                    src="/mascot-type.webp"
                    alt="Ydsz Worker 吉祥物"
                    className="w-28 sm:w-36 object-contain drop-shadow-2xl animate-float"
                  />
                  {/* Dashboard 模拟卡片 */}
                  <div className="flex-1 max-w-md w-full">
                    <div className="bg-ink-700/80 backdrop-blur-sm rounded-lg border border-white/[0.06] p-4 text-left">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-yuanbao-400 shadow-md shadow-yuanbao-400/50" />
                        <span className="text-xs text-white/50 font-mono">Dashboard · 运维工程师</span>
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 bg-white/[0.06] rounded-full w-full" />
                        <div className="h-2 bg-white/[0.06] rounded-full w-4/5" />
                        <div className="h-2 bg-yuanbao-500/20 rounded-full w-3/5" />
                      </div>
                      <div className="mt-3 flex gap-2">
                        <span className="px-2 py-0.5 rounded bg-yuanbao-500/10 text-yuanbao-400 text-[10px] font-mono">Cron</span>
                        <span className="px-2 py-0.5 rounded bg-white/[0.04] text-white/40 text-[10px] font-mono">Shell</span>
                        <span className="px-2 py-0.5 rounded bg-white/[0.04] text-white/40 text-[10px] font-mono">Browser</span>
                      </div>
                      <p className="text-white/40 text-xs mt-3 leading-relaxed">
                        已执行定时巡检 3 次 · 知识库文档 128 篇 · 活跃专家 4 位
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Decorative glow */}
            <div className="absolute -inset-4 bg-yuanbao-500/[0.03] rounded-3xl blur-3xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   Section 2: 通道/能力 Tag 条
   ───────────────────────────────────────────── */
const CHANNELS = [
  { name: '飞书', icon: '🐦' },
  { name: '钉钉', icon: '🔔' },
  { name: '企业微信', icon: '💬' },
  { name: 'QQ', icon: '🐧' },
  { name: '微信', icon: '💚' },
  { name: 'Telegram', icon: '✈️' },
  { name: 'Discord', icon: '🎮' },
]

function ChannelTags() {
  return (
    <section className="py-12 border-y border-white/[0.04]">
      <div className="container-page">
        <p className="text-center text-white/30 text-sm font-medium mb-8">
          全 IM 通道覆盖 · 你习惯的聊天方式我们都支持
        </p>
        <div className="flex flex-wrap justify-center items-center gap-4 lg:gap-6">
          {CHANNELS.map((ch) => (
            <div
              key={ch.name}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-white/50 hover:text-yuanbao-300 hover:border-yuanbao-500/20 transition-all duration-300"
            >
              <span className="text-xl">{ch.icon}</span>
              <span className="text-sm font-medium">{ch.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   Section 3: 换个专家来干活
   ───────────────────────────────────────────── */
const ROLES = [
  { name: '运维工程师', desc: '精通 Linux、Kubernetes、Docker、数据库、网络诊断', color: 'from-blue-500/20 to-blue-600/5', emoji: '🐧' },
  { name: '热点记者', desc: '跟踪 70+ 平台热点，个性化分析和总结', color: 'from-orange-500/20 to-orange-600/5', emoji: '📰' },
  { name: '育儿管家', desc: '记录疫苗、辅食、里程碑，所有建议带可验证来源', color: 'from-pink-500/20 to-pink-600/5', emoji: '👶' },
  { name: '办公自动化', desc: 'Word、Excel、PPT、PDF 全套文档技能', color: 'from-purple-500/20 to-purple-600/5', emoji: '📊' },
]

const CAPABILITIES = [
  { icon: '🖥️', text: '操控电脑' },
  { icon: '⏰', text: '定时任务' },
  { icon: '🌐', text: '浏览器自动化' },
  { icon: '📄', text: '知识库 RAG' },
  { icon: '🔌', text: '连接一切' },
  { icon: '🛡️', text: '数据不出门' },
]

function ExpertRoles() {
  const [activeRole, setActiveRole] = useState(0)

  return (
    <section className="py-24 relative">
      <div className="container-page">
        <div className="text-center mb-16">
          <span className="section-label mb-4">换个专家来干活</span>
          <h2 className="heading-lg mt-4">一键切换专业角色</h2>
          <p className="text-white/50 mt-4 max-w-xl mx-auto">
            写周报叫来分析师，查资料换成研究员——换角色，不用换环境
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* 左侧：角色列表 */}
          <div className="space-y-3">
            {ROLES.map((role, idx) => (
              <button
                key={role.name}
                onClick={() => setActiveRole(idx)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-300 ${
                  activeRole === idx
                    ? `bg-gradient-to-r ${role.color} border border-white/10 shadow-lg`
                    : 'bg-white/[0.02] border border-transparent hover:border-white/[0.06] hover:bg-white/[0.04]'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                  activeRole === idx ? 'bg-yuanbao-500/20' : 'bg-white/5'
                }`}>
                  {role.emoji}
                </div>
                <div className="flex-1">
                  <div className={`font-semibold ${activeRole === idx ? 'text-white' : 'text-white/80'}`}>
                    {role.name}
                  </div>
                  <div className="text-sm text-white/40 mt-0.5">{role.desc}</div>
                </div>
                <svg className={`w-5 h-5 transition-all duration-200 ${activeRole === idx ? 'text-yuanbao-400 translate-x-0' : 'text-white/20 -translate-x-1 opacity-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>

          {/* 右侧：大卡片预览 */}
          <div className="flex items-center justify-center">
            <div className="card-glass p-8 sm:p-10 w-full max-w-sm text-center relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${ROLES[activeRole].color} opacity-50`} />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/60 to-transparent" />
              <div className="relative">
                <div className="text-7xl mb-4">{ROLES[activeRole].emoji}</div>
                <h3 className="text-2xl font-bold text-white mb-2">{ROLES[activeRole].name}</h3>
                <p className="text-white/50 text-sm">{ROLES[activeRole].desc}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 底部能力 Tags */}
        <div className="mt-16 flex flex-wrap justify-center gap-3">
          {CAPABILITIES.map((cap) => (
            <div
              key={cap.text}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] text-white/60 hover:text-yuanbao-300 hover:border-yuanbao-500/20 transition-all duration-300"
            >
              <span>{cap.icon}</span>
              <span className="text-sm font-medium">{cap.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   Section 4: 三步上手
   ───────────────────────────────────────────── */
const TABS = [
  {
    id: 'install',
    label: '一键安装',
    icon: '⚡',
    code: `# Windows (PowerShell)\nirm https://raw.githubusercontent.com/njydsz/ydsz-worker/main/scripts/install.ps1 | iex\n\n# macOS / Linux\ncurl -fsSL https://raw.githubusercontent.com/njydsz/ydsz-worker/main/scripts/install.sh | bash`,
  },
  {
    id: 'pip',
    label: 'pip 安装',
    icon: '🐍',
    code: `pip install "ydsz-worker[browser]"\nydsz-worker run`,
  },
  {
    id: 'docker',
    label: 'Docker',
    icon: '🐳',
    code: `docker run -d \\\n  --name ydsz-worker \\\n  -p 8080:8080 \\\n  -v ydsz-data:/root/.ydsz \\\n  ydszbuddy/ydsz-worker:latest`,
  },
]

function QuickStart() {
  const [activeTab, setActiveTab] = useState('install')
  const [copied, setCopied] = useState(false)
  const current = TABS.find((t) => t.id === activeTab)!

  const handleCopy = () => {
    navigator.clipboard.writeText(current.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section id="quickstart" className="py-24">
      <div className="container-page">
        <div className="text-center mb-16">
          <span className="section-label mb-4">三步上手</span>
          <h2 className="heading-lg mt-4">不用先搞复杂环境</h2>
          <p className="text-white/50 mt-4 max-w-xl mx-auto">
            选一种你喜欢的方式，复制下面的命令直接运行，其他的事情我们来搞定
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-white/[0.03] rounded-xl border border-white/[0.06] mb-4">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white/[0.08] text-white shadow-sm'
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Code Block */}
          <div className="card-glass overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-yuanbao-500/60" />
              </div>
              <span className="text-xs text-white/30 ml-2 font-mono">{current.label}</span>
              <button
                onClick={handleCopy}
                className="ml-auto text-xs text-white/30 hover:text-yuanbao-400 transition-colors flex items-center gap-1"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4 text-yuanbao-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-yuanbao-400">已复制</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                    </svg>
                    复制
                  </>
                )}
              </button>
            </div>
            <pre className="p-5 text-sm font-mono text-white/70 overflow-x-auto leading-relaxed">
              <code>{current.code}</code>
            </pre>
          </div>

          {/* Footer note */}
          <div className="flex items-center justify-center gap-6 mt-6 text-xs text-white/30">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-yuanbao-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Windows / macOS / Linux
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-yuanbao-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Python 3.12+
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-yuanbao-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              免费开源
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   Section 5: 为什么选择
   ───────────────────────────────────────────── */
const REASONS = [
  {
    icon: '⚡',
    title: '一次部署，人人有专属助手',
    desc: '一台机器跑一套服务，家人和同事各有一个只记得自己事情的助手。写周报叫来分析师，查资料换成研究员。',
    visual: '多用户',
  },
  {
    icon: '🔗',
    title: '接上你每天在用的那些账号',
    desc: '腾讯文档、Notion、邮箱、日历......授权一次，之后一句「把今天会议的结论整理进文档」就够了。',
    visual: '连接器',
  },
  {
    icon: '💻',
    title: '和你的编辑器、终端搭伙',
    desc: '不抢你手上的 Cursor 和命令行：复杂改动通过 ACP 派给专业编程 Agent，你只负责验收结果。',
    visual: 'ACP',
  },
  {
    icon: '🎯',
    title: '它真的会用电脑',
    desc: '终端里敲命令、浏览器里点按钮填表单、顺手截图留证据——你说目标，它自己动手，卡住了才回来问你。',
    visual: '自动化',
  },
]

function WhyChoose() {
  return (
    <section id="why" className="py-24">
      <div className="container-page">
        <div className="text-center mb-16">
          <span className="section-label mb-4">为什么选择我们</span>
          <h2 className="heading-lg mt-4">数据留在家里，能力连接全世界</h2>
          <p className="text-white/50 mt-4 max-w-xl mx-auto">
            自托管不是限制，是对你的数据主权的尊重
          </p>
        </div>

        {/* 4 张编号卡片 */}
        <div className="grid md:grid-cols-2 gap-4 max-w-5xl mx-auto">
          {REASONS.map((reason, idx) => (
            <div
              key={reason.title}
              className="card-glass p-8 relative overflow-hidden group hover:bg-white/[0.05] transition-all duration-300"
            >
              {/* Large background number */}
              <span className="absolute -top-2 -right-2 text-[120px] font-black text-white/[0.02] leading-none select-none pointer-events-none">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{reason.icon}</span>
                  <span className="text-xs text-white/30 font-mono uppercase tracking-wider">{reason.visual}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{reason.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{reason.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 4 个数字统计 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-16">
          {[
            { value: '7+', label: 'IM 通道' },
            { value: '16', label: 'MBTI 人格' },
            { value: '50+', label: '连接器' },
            { value: '∞', label: '自定义专家' },
          ].map((stat) => (
            <div key={stat.label} className="card-glass p-6 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-gradient mb-1">{stat.value}</div>
              <div className="text-xs text-white/40 font-medium uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   Section 6: 桌面宠物
   ───────────────────────────────────────────── */
function DesktopPet() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container-page">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* 描述 */}
          <div>
            <span className="section-label mb-4">桌面伙伴</span>
            <h2 className="heading-lg mt-4 mb-6">不只是工具，更是陪伴</h2>
            <p className="text-white/50 leading-relaxed mb-6">
              云顶数字工作台内置可爱的桌面宠物，它不仅是你的 AI 助手，更是你桌面上的一位小伙伴。
              在你忙碌时安静守候，在你需要时随时出现。
            </p>
            <ul className="space-y-3 mb-8">
              {[
                '原生桌面客户端，托盘常驻',
                '实时感知任务状态，主动提醒',
                '多种互动反馈，陪伴不单调',
                '支持自定义形象与行为',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-white/60 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-yuanbao-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/experts" className="btn-primary text-sm">
              探索专家
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>

          {/* 图片 */}
          <div className="relative">
            <div className="absolute inset-0 bg-yuanbao-500/[0.06] rounded-3xl blur-3xl -z-10" />
            <div className="card-glass p-4 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-yuanbao-500/[0.08] via-transparent to-yuanbao-600/[0.03] rounded-2xl" />
              <img
                src="/mascot-peek.webp"
                alt="桌面宠物"
                className="w-full h-auto rounded-xl object-contain animate-float"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   Section 7: FAQ 手风琴
   ───────────────────────────────────────────── */
const FAQ_ITEMS = [
  {
    q: '云顶数字工作台是开源的吗？',
    a: '是的。云顶数字工作台是完全开源项目，基于 MIT 协议，你可以自由使用、修改和分发。所有数据留存在你自己的服务器上。',
  },
  {
    q: '数据会存储在哪里？',
    a: '默认存储在运行服务器的 ~/.ydsz-worker/ 目录下（SQLite WAL 模式）。你也可以配置为 PostgreSQL。工作区文件支持本地磁盘、Docker 沙箱、COS/S3 等后端存储。',
  },
  {
    q: '如何创建新的专家角色？',
    a: '在控制台的「专家」页面，你可以从内置模板创建（运维工程师、研究分析师、办公专家等），也可以从社区导入。每位专家拥有独立的工作区、凭证和配置。',
  },
  {
    q: '和 ChatGPT / 文心一言有什么区别？',
    a: '云顶数字工作台是自托管平台——你的对话和文件从不上传到任何第三方。它不仅能聊天，还能操控电脑（浏览器自动化、终端命令）、执行定时任务，并通过 IM 通道在你习惯的工具中与你交互。',
  },
  {
    q: 'ACP 是什么？和 MCP 有什么区别？',
    a: 'ACP（Agent Client Protocol）是把你的 IDE / 终端 AI 工具接入云顶数字工作台的桥梁。入站模式：外部工具（Cursor、OpenCode 等）可以调用你的专家。出站模式：你的专家可以把编程任务委派给外部 Agent。MCP 是连接外部服务（数据库、API、SaaS）的协议，两者互补。',
  },
  {
    q: '知识库支持哪些格式？',
    a: '支持 Markdown、纯文本、PDF、Word (.docx)、Excel (.xlsx/.csv)、PPT (.pptx)、代码文件等。支持 OCR 识别扫描件，内置向量检索和关键词检索双引擎。',
  },
  {
    q: 'Connector 连接器能接哪些平台？',
    a: '内置 50+ 连接器，覆盖：IM 类（飞书、钉钉、企业微信、QQ、微信）、文档类（腾讯文档、Notion、语雀、Obsidian）、API 类（企查查、OpenAlex、天气、股票行情）。还支持自定义 MCP 连接器接入任何第三方服务。',
  },
  {
    q: 'AgentTeams 是什么？怎么用？',
    a: 'AgentTeams 是多专家协作功能（目前 Beta）。你创建一个「协调者」专家，它会自动把复杂任务拆解、分发给多个「成员」专家并行执行。比如"帮我调研竞品"会分发给资料搜集者、分析者、报告撰写者三位专家协同完成。',
  },
]

function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="py-24">
      <div className="container-page">
        <div className="text-center mb-16">
          <span className="section-label mb-4">常见问题</span>
          <h2 className="heading-lg mt-4">你想知道的答案都在这里</h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-2">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx
            return (
              <div
                key={idx}
                className={`card-glass overflow-hidden transition-all duration-300 ${
                  isOpen ? 'bg-white/[0.05] border-yuanbao-500/20' : ''
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className={`font-medium transition-colors ${isOpen ? 'text-white' : 'text-white/80'}`}>
                    {item.q}
                  </span>
                  <svg
                    className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-yuanbao-400' : 'text-white/30'
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="px-5 pb-5 text-white/50 text-sm leading-relaxed">{item.a}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   Section 8: CTA 底部横幅
   ───────────────────────────────────────────── */
function CTA() {
  return (
    <section className="py-24">
      <div className="container-page">
        <div className="relative max-w-4xl mx-auto card-glass p-12 sm:p-16 text-center overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-yuanbao-500/[0.08] via-transparent to-yuanbao-600/[0.03]" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-yuanbao-500/[0.1] rounded-full blur-[80px]" />

          <div className="relative">
            <div className="text-4xl mb-6">🚀</div>
            <h2 className="heading-lg mb-4">准备好开启智能协作了吗？</h2>
            <p className="text-white/50 max-w-lg mx-auto mb-8">
              一分钟安装，即刻拥有一个真正属于你的 AI 团队成员
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#quickstart" className="btn-primary text-base">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                立即开始
              </a>
              <Link to="/contribute" className="btn-secondary">
                参与贡献
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   HomePage — 组合所有 section
   ───────────────────────────────────────────── */
export default function HomePage() {
  return (
    <>
      <Hero />
      <ChannelTags />
      <ExpertRoles />
      <QuickStart />
      <WhyChoose />
      <DesktopPet />
      <FAQ />
      <CTA />
    </>
  )
}
