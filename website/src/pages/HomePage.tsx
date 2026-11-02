import { useState } from 'react'
import { Link } from 'react-router-dom'
import Reveal from '../components/Reveal'
import { useLanguage } from '../context/LanguageContext'
import DashboardMock from '../components/DashboardMock'
import SectionDivider from '../components/SectionDivider'

/* ═══════════════════════════════════════════════
   外部链接常量
   ═══════════════════════════════════════════════ */
const GITHUB = 'https://gitee.com/njydsz/ydsz-worker'

/* ───────────────────────────────────────────────
   SVG: 显示器 + 简笔小猫（Desktop Pet 区域）
   ─────────────────────────────────────────────── */
function CatMonitorGraphic() {
  return (
    <svg className="w-full max-w-sm mx-auto h-auto" viewBox="0 0 320 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 显示器 */}
      <rect x="60" y="30" width="180" height="120" rx="6" fill="#1a2320" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
      <rect x="68" y="38" width="164" height="104" rx="3" fill="#0d1512" />
      {/* 屏幕光晕 */}
      <rect x="68" y="38" width="164" height="104" rx="3" fill="url(#screenGlow)" opacity="0.5" />
      {/* 屏幕代码行 */}
      <rect x="78" y="52" width="60" height="4" rx="2" fill="#22c55e" opacity="0.5" />
      <rect x="78" y="62" width="90" height="4" rx="2" fill="#22c55e" opacity="0.25" />
      <rect x="78" y="72" width="45" height="4" rx="2" fill="#22c55e" opacity="0.15" />
      <rect x="78" y="82" width="70" height="4" rx="2" fill="#22c55e" opacity="0.35" />
      <rect x="78" y="92" width="55" height="4" rx="2" fill="#22c55e" opacity="0.2" />
      <rect x="78" y="102" width="80" height="4" rx="2" fill="#22c55e" opacity="0.3" />
      <rect x="78" y="112" width="40" height="4" rx="2" fill="#22c55e" opacity="0.15" />
      {/* 显示器支架 */}
      <rect x="130" y="150" width="40" height="12" rx="2" fill="#1a2320" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <rect x="115" y="160" width="70" height="6" rx="3" fill="#1a2320" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      {/* 显示器指示灯 */}
      <circle cx="150" cy="22" r="2" fill="#22c55e" opacity="0.6" />

      {/* 🐱 简笔小猫（坐在显示器旁） */}
      {/* 身体 */}
      <ellipse cx="250" cy="175" rx="30" ry="22" fill="#22c55e" opacity="0.9" />
      {/* 头部 */}
      <circle cx="250" cy="140" r="22" fill="#22c55e" />
      {/* 左耳 */}
      <polygon points="235,122 230,100 245,115" fill="#22c55e" />
      {/* 右耳 */}
      <polygon points="265,122 270,100 255,115" fill="#22c55e" />
      {/* 内耳 */}
      <polygon points="237,120 235,110 243,117" fill="#166534" opacity="0.5" />
      <polygon points="263,120 265,110 257,117" fill="#166534" opacity="0.5" />
      {/* 眼睛 */}
      <ellipse cx="243" cy="138" rx="4" ry="4.5" fill="#0a0f0d" />
      <ellipse cx="257" cy="138" rx="4" ry="4.5" fill="#0a0f0d" />
      {/* 眼睛高光 */}
      <circle cx="244.5" cy="136.5" r="1.5" fill="white" opacity="0.8" />
      <circle cx="258.5" cy="136.5" r="1.5" fill="white" opacity="0.8" />
      {/* 鼻子 */}
      <ellipse cx="250" cy="145" rx="2.5" ry="1.8" fill="#166534" />
      {/* 嘴巴 */}
      <path d="M247 147 Q250 150 253 147" stroke="#166534" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* 胡须 */}
      <line x1="228" y1="143" x2="240" y2="145" stroke="#166534" strokeWidth="0.8" opacity="0.6" />
      <line x1="228" y1="147" x2="240" y2="147" stroke="#166534" strokeWidth="0.8" opacity="0.6" />
      <line x1="260" y1="145" x2="272" y2="143" stroke="#166534" strokeWidth="0.8" opacity="0.6" />
      <line x1="260" y1="147" x2="272" y2="147" stroke="#166534" strokeWidth="0.8" opacity="0.6" />
      {/* 尾巴 */}
      <path d="M280 175 Q295 160 290 145" stroke="#22c55e" strokeWidth="6" fill="none" strokeLinecap="round" />
      {/* 前爪 */}
      <ellipse cx="238" cy="190" rx="8" ry="5" fill="#22c55e" />
      <ellipse cx="262" cy="190" rx="8" ry="5" fill="#22c55e" />
      {/* 爪垫细节 */}
      <circle cx="236" cy="190" r="1.5" fill="#166534" opacity="0.3" />
      <circle cx="240" cy="190" r="1.5" fill="#166534" opacity="0.3" />
      <circle cx="238" cy="187" r="1.5" fill="#166534" opacity="0.3" />

      {/* 装饰小元素 */}
      {/* 围绕小猫的光晕点 */}
      <circle cx="218" cy="130" r="2" fill="#22c55e" opacity="0.15" />
      <circle cx="282" cy="125" r="3" fill="#22c55e" opacity="0.1" />
      <circle cx="290" cy="155" r="1.5" fill="#22c55e" opacity="0.2" />
      <circle cx="215" cy="160" r="2.5" fill="#22c55e" opacity="0.12" />

      {/* 装饰爱心 */}
      <path d="M220 118 C220 115 225 113 225 117 C225 113 230 115 230 118 C230 122 225 124 225 124 C225 124 220 122 220 118Z" fill="#22c55e" opacity="0.4" />

      {/* 小代码符号漂浮 */}
      <text x="270" y="100" fill="#22c55e" opacity="0.2" fontSize="12" fontFamily="monospace">{'</>'}</text>
      <text x="200" y="95" fill="#22c55e" opacity="0.15" fontSize="10" fontFamily="monospace">{'{ }'}</text>

      <defs>
        <linearGradient id="screenGlow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}

/* ───────────────────────────────────────────────
   SVG: Dashboard 四个角 L 形装饰标记
   ─────────────────────────────────────────────── */
function CornerMarkers() {
  return (
    <div className="absolute inset-0 z-10 pointer-events-none" aria-hidden="true">
      {/* 左上 */}
      <svg className="absolute -top-1.5 -left-1.5 w-6 h-6 text-yuanbao-500/50" viewBox="0 0 24 24" fill="none">
        <path d="M2 8V2H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {/* 右上 */}
      <svg className="absolute -top-1.5 -right-1.5 w-6 h-6 text-yuanbao-500/50" viewBox="0 0 24 24" fill="none">
        <path d="M16 2H22V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {/* 左下 */}
      <svg className="absolute -bottom-1.5 -left-1.5 w-6 h-6 text-yuanbao-500/50" viewBox="0 0 24 24" fill="none">
        <path d="M2 16V22H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {/* 右下 */}
      <svg className="absolute -bottom-1.5 -right-1.5 w-6 h-6 text-yuanbao-500/50" viewBox="0 0 24 24" fill="none">
        <path d="M16 22H22V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

/* ───────────────────────────────────────────────
   SVG: 复制成功动画
   ─────────────────────────────────────────────── */
function CopySuccessIcon() {
  return (
    <svg className="w-4 h-4 text-yuanbao-400" viewBox="0 0 24 24" fill="none">
      <path
        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* ═══════════════════════════════════════════════
   Section 1: Hero
   ═══════════════════════════════════════════════ */
function Hero() {
  const { t } = useLanguage()
  return (
    <section id="overview" className="relative pt-32 pb-20 lg:pt-44 lg:pb-28 overflow-hidden">
      {/* 背景装饰光晕 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-yuanbao-500/[0.04] rounded-full blur-[160px] -z-10" />
      <div className="absolute top-20 -left-[300px] w-[600px] h-[600px] bg-yuanbao-600/[0.03] rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 -right-[200px] w-[500px] h-[500px] bg-yuanbao-400/[0.02] rounded-full blur-[100px] -z-10" />

      <div className="container-page">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge 横幅 */}
          <Reveal>
            <a
              href={GITHUB}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-yuanbao-500/[0.07] border border-yuanbao-500/20 text-yuanbao-400 text-sm font-medium mb-8 hover:bg-yuanbao-500/[0.12] hover:border-yuanbao-500/30 transition-all duration-300 group"
            >
              <span className="glow-dot animate-pulse" />
              <span>{t('hero.badge')}</span>
              <svg className="w-3.5 h-3.5 -translate-x-0.5 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </Reveal>

          {/* 主标题 */}
          <Reveal delay={100}>
              <h1 className="heading-xl text-balance mb-5">
              <span className="block">{t('hero.title1')}</span>
              <span className="block text-gradient mt-1">{t('hero.title2')}</span>
            </h1>
          </Reveal>

          {/* 副标题 */}
          <Reveal delay={200}>
            <p className="text-base sm:text-lg text-white/55 max-w-xl mx-auto mb-10 text-balance leading-relaxed">
              {t('hero.subtitle')}
            </p>
          </Reveal>

          {/* CTA 按钮 */}
          <Reveal delay={300}>
            <div className="flex flex-col sm:flex-row gap-3.5 justify-center items-center mb-20">
              <a href="#quickstart" className="btn-primary text-base px-7 py-3.5">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {t('hero.cta_primary')}
              </a>
              <a href={GITHUB} target="_blank" rel="noopener noreferrer" className="btn-secondary text-base px-7 py-3.5">
                <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                {t('hero.cta_secondary')}
              </a>
            </div>
          </Reveal>

          {/* 核心视觉区：吉祥物 + Dashboard 模拟 */}
          <Reveal delay={400}>
            <div className="relative max-w-5xl mx-auto">
              {/* 中央发光 */}
              <div className="absolute inset-0 flex items-center justify-center -z-10">
                <div className="w-[700px] h-[400px] bg-yuanbao-500/[0.05] rounded-full blur-[120px]" />
              </div>

              {/* 角落 L 形装饰 */}
              <CornerMarkers />

              <div className="card-glass p-2.5 shadow-2xl shadow-yuanbao-500/[0.04]">
                <div className="rounded-xl overflow-hidden bg-ink-800 border border-white/[0.04]">
                  <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-10 p-6 lg:p-10">
                    {/* 吉祥物 */}
                    <div className="flex-shrink-0 relative">
                      <div className="absolute -inset-8 bg-yuanbao-500/10 rounded-full blur-[50px]" />
                      <img
                        src="/mascot-type.webp"
                        alt="Ydsz Worker 吉祥物"
                        className="relative w-32 sm:w-40 lg:w-44 object-contain drop-shadow-2xl animate-float"
                      />
                    </div>

                    {/* Dashboard 模拟对话 */}
                    <div className="flex-1 w-full min-w-0">
                      <DashboardMock />
                    </div>
                  </div>
                </div>
              </div>

              {/* 底部渐变遮罩 */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-ink-900 via-ink-900/80 to-transparent pointer-events-none" />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════
   Section 2: 通道能力标签
   ═══════════════════════════════════════════════ */
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
  const { t } = useLanguage()
  return (
    <section className="py-14 border-y border-white/[0.04]">
      <div className="container-page">
        <Reveal>
          <p className="text-center text-white/30 text-sm font-medium mb-8 tracking-wide">
            {t('ch.heading')}
          </p>
        </Reveal>
        <Reveal delay={100}>
          <div className="flex flex-wrap justify-center items-center gap-3 lg:gap-5">
            {CHANNELS.map((ch) => (
              <div
                key={ch.name}
                className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-white/50 hover:text-yuanbao-300 hover:border-yuanbao-500/20 hover:bg-yuanbao-500/[0.04] transition-all duration-300 cursor-default"
              >
                <span className="text-lg">{ch.icon}</span>
                <span className="text-sm font-medium">{ch.name}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════
   Section 3: 换个专家来干活
   ═══════════════════════════════════════════════ */
const ROLES = [
  { nameKey: 'expert.ops_name', descKey: 'expert.ops_desc', emoji: '🐧', color: 'from-blue-500/25 to-blue-600/8', borderColor: 'border-blue-500/20' },
  { nameKey: 'expert.research_name', descKey: 'expert.research_desc', emoji: '📊', color: 'from-orange-500/25 to-orange-600/8', borderColor: 'border-orange-500/20' },
  { nameKey: 'expert.office_name', descKey: 'expert.office_desc', emoji: '📑', color: 'from-purple-500/25 to-purple-600/8', borderColor: 'border-purple-500/20' },
  { nameKey: 'expert.life_name', descKey: 'expert.life_desc', emoji: '👶', color: 'from-pink-500/25 to-pink-600/8', borderColor: 'border-pink-500/20' },
]

const CAPABILITIES = [
  { icon: '🖥️', text: '操控电脑' },
  { icon: '⏰', text: '定时任务' },
  { icon: '🌐', text: '浏览器' },
  { icon: '📄', text: '知识库' },
  { icon: '🔌', text: '连接器' },
  { icon: '🛡️', text: '数据不出门' },
]

function ExpertRoles() {
  const { t } = useLanguage()
  const [activeRole, setActiveRole] = useState(0)

  return (
    <section className="py-24 lg:py-28 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-yuanbao-500/[0.02] rounded-full blur-[140px] -z-10" />

      <div className="container-page">
        <Reveal>
          <div className="text-center mb-16">
            <span className="section-label mb-4">{t('expert.badge')}</span>
            <h2 className="heading-lg mt-4">{t('expert.title')}</h2>
            <p className="text-white/50 mt-4 max-w-lg mx-auto">
              {t('expert.subtitle')}
            </p>
          </div>
        </Reveal>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center max-w-6xl mx-auto">
          {/* 左侧：角色切换列表 */}
          <Reveal delay={100}>
            <div className="space-y-3">
              {ROLES.map((role, idx) => (
                <button
                  key={role.nameKey}
                  onClick={() => setActiveRole(idx)}
                  className={`relative w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-300 group border-l-2 ${
                    activeRole === idx
                      ? 'bg-gradient-to-r ' + role.color + ' ' + role.borderColor + ' shadow-lg border-l-yuanbao-500'
                      : 'bg-white/[0.02] border-l-transparent hover:border-l-yuanbao-500/50 hover:border-white/[0.06] hover:bg-white/[0.04]'
                  }`}
                >
                  <div className={`w-11 h-11 rounded-lg flex items-center justify-center text-xl flex-shrink-0 transition-all duration-300 ${
                    activeRole === idx ? 'bg-white/10' : 'bg-white/[0.04]'
                  }`}>
                    {role.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-semibold transition-colors ${activeRole === idx ? 'text-white' : 'text-white/75'}`}>
                      {t(role.nameKey)}
                    </div>
                    <div className="text-sm text-white/40 mt-0.5 truncate">{t(role.descKey)}</div>
                  </div>
                  <svg
                    className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${
                      activeRole === idx ? 'text-yuanbao-400 opacity-100' : 'text-white/15 opacity-0 group-hover:opacity-50'
                    }`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </Reveal>

          {/* 右侧：当前角色大预览 */}
          <Reveal delay={200} direction="left">
            <div className="relative">
              <div className={`absolute inset-0 bg-gradient-to-br ${ROLES[activeRole].color} rounded-3xl blur-xl opacity-30`} />
              <div className="relative card-glass p-10 sm:p-12 text-center min-h-[280px] flex flex-col items-center justify-center border border-white/[0.08]">
                <div className="text-7xl mb-5 animate-float">{ROLES[activeRole].emoji}</div>
                <h3 className="text-2xl font-bold text-white mb-2">{t(ROLES[activeRole].nameKey)}</h3>
                <p className="text-white/50 text-sm max-w-xs mx-auto leading-relaxed">{t(ROLES[activeRole].descKey)}</p>
              </div>
            </div>
          </Reveal>
        </div>

        {/* 底部能力标签胶囊 */}
        <Reveal delay={300}>
          <div className="mt-16 flex flex-wrap justify-center gap-3">
            {CAPABILITIES.map((cap) => (
              <div
                key={cap.text}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] text-white/55 hover:text-yuanbao-300 hover:border-yuanbao-500/20 transition-all duration-300 cursor-default"
              >
                <span>{cap.icon}</span>
                <span className="text-sm font-medium">{cap.text}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════
   Section 4: Quick Start — 精致终端窗口 + 复制动画
   ═══════════════════════════════════════════════ */
const TABS = [
  {
    id: 'quick',
    label: 'Windows (PowerShell)',
    icon: '⚡',
    code: 'irm https://raw.githubusercontent.com/njydsz/ydsz-worker/main/scripts/install.ps1 | iex',
    lang: 'powershell',
  },
  {
    id: 'unix',
    label: 'macOS / Linux',
    icon: '💻',
    code: 'curl -fsSL https://raw.githubusercontent.com/njydsz/ydsz-worker/main/scripts/install.sh | bash',
    lang: 'bash',
  },
  {
    id: 'pip',
    label: 'pip 安装',
    icon: '🐍',
    code: 'pip install "ydsz-worker[browser]" && ydsz-worker run',
    lang: 'bash',
  },
  {
    id: 'docker',
    label: 'Docker',
    icon: '🐳',
    code: 'docker run -d --name ydsz-worker -p 8080:8080 -v ydsz-data:/root/.ydsz ydszbuddy/ydsz-worker:latest',
    lang: 'bash',
  },
]

const PLATFORM_SUPPORT = [
  { icon: '🪟', label: 'Windows' },
  { icon: '🍎', label: 'macOS' },
  { icon: '🐧', label: 'Linux' },
]

function QuickStart() {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState('quick')
  const [copied, setCopied] = useState(false)
  const current = TABS.find((t) => t.id === activeTab)!

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(current.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const ta = document.createElement('textarea')
      ta.value = current.code
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <section id="quickstart" className="py-24 lg:py-28 relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yuanbao-500/[0.02] rounded-full blur-[120px] -z-10" />

      <div className="container-page">
        <Reveal>
          <div className="text-center mb-16">
            <span className="section-label mb-4">{t('qs.badge')}</span>
            <h2 className="heading-lg mt-4">{t('qs.title')}</h2>
            <p className="text-white/50 mt-4 max-w-lg mx-auto">
              {t('qs.subtitle')}
            </p>
          </div>
        </Reveal>

        <Reveal delay={150}>
          <div className="max-w-3xl mx-auto">
            {/* Tab 栏 */}
            <div className="flex gap-1 p-1.5 bg-white/[0.03] rounded-xl border border-white/[0.06] mb-3 overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setCopied(false) }}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap flex-1 min-w-0 ${
                    activeTab === tab.id
                      ? 'bg-white/[0.08] text-white shadow-sm'
                      : 'text-white/45 hover:text-white/75 hover:bg-white/[0.03]'
                  }`}
                >
                  <span className="flex-shrink-0">{tab.icon}</span>
                  <span className="truncate text-xs sm:text-sm">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* 终端代码块 */}
            <div className="rounded-xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/30">
              {/* 标题栏 — 红黄绿点 */}
              <div className="flex items-center gap-2.5 px-4 py-3 bg-ink-800 border-b border-white/[0.06]">
                <div className="flex gap-1.5 flex-shrink-0">
                  <div className="w-3 h-3 rounded-full bg-red-500/60 hover:bg-red-400 transition-colors" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60 hover:bg-yellow-400 transition-colors" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60 hover:bg-green-400 transition-colors" />
                </div>
                <span className="text-xs text-white/30 ml-2 font-mono truncate">{current.label}</span>

                {/* 复制按钮 — 带 SVG 成功动画 */}
                <button
                  onClick={handleCopy}
                  className={`ml-auto flex items-center gap-1.5 text-xs font-medium transition-all duration-300 px-2.5 py-1 rounded-md flex-shrink-0 ${
                    copied
                      ? 'text-yuanbao-400 bg-yuanbao-500/15 shadow-sm shadow-yuanbao-500/10'
                      : 'text-white/40 hover:text-white/70 hover:bg-white/[0.06]'
                  }`}
                >
                  {copied ? (
                    <span className="flex items-center gap-1.5">
                      <CopySuccessIcon />
                      <span className="hidden sm:inline">{t('qs.copied')}</span>
                      <span className="sm:hidden">✓</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                      </svg>
                      <span className="hidden sm:inline">{t('qs.copy')}</span>
                    </span>
                  )}
                </button>
              </div>

              {/* 代码区 — 精致的终端输出模拟 */}
              <div className="bg-ink-800/90 p-5 sm:p-6 overflow-x-auto">
                <div className="font-mono text-sm leading-relaxed space-y-1">
                  {/* 蓝色路径提示符 */}
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400">
                      {current.lang === 'powershell' ? 'PS C:\\Users\\admin>' : '$ ~'}
                    </span>
                  </div>
                  {/* 绿色 echo 文本 — 命令本身 */}
                  <code className="block text-yuanbao-300/90 my-1 font-medium">{current.code}</code>
                  {/* 模拟命令输出 */}
                  <div className="pt-2 space-y-0.5 border-t border-white/[0.04] mt-2">
                    <div className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-yuanbao-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-yuanbao-400">{t('qs.downloading')}</span>
                    </div>
                    <div className="text-white/40 pl-5.5">
                      [━━━━━━━━━━━━━━━━━━━━] 100% ████████████
                    </div>
                    <div className="text-white/30">
                    <span className="text-yuanbao-500">  ✓</span> {t('qs.install_done')}
                    </div>
                    <div className="text-white/25">
                    <span className="text-yuanbao-500">  →</span> {t('qs.visit_prompt')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 平台支持标签 */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
              {PLATFORM_SUPPORT.map((p) => (
                <span key={p.label} className="flex items-center gap-1.5 text-xs text-white/30 font-medium">
                  <span>{p.icon}</span>
                  {p.label}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════
   Section 5: 为什么选择
   ═══════════════════════════════════════════════ */
const REASONS = [
  {
    num: '01',
    titleKey: 'why.r1_title',
    descKey: 'why.r1_desc',
    icon: '⚡',
    tag: '多用户',
  },
  {
    num: '02',
    titleKey: 'why.r2_title',
    descKey: 'why.r2_desc',
    icon: '🔗',
    tag: '连接器',
  },
  {
    num: '03',
    titleKey: 'why.r3_title',
    descKey: 'why.r3_desc',
    icon: '💻',
    tag: 'ACP',
  },
  {
    num: '04',
    titleKey: 'why.r4_title',
    descKey: 'why.r4_desc',
    icon: '🎯',
    tag: '自动化',
  },
]

const STATS = [
  { value: '7', suffix: '通道', labelKey: 'why.stat_im' },
  { value: '16', suffix: '型', labelKey: 'why.stat_mbti' },
  { value: '50', suffix: '+', labelKey: 'why.stat_connectors' },
  { value: '∞', suffix: '', labelKey: 'why.stat_experts' },
]

function WhyChoose() {
  const { t } = useLanguage()
  return (
    <section id="why" className="py-24 lg:py-28 relative">
      <div className="absolute bottom-0 left-0 w-[600px] h-[400px] bg-yuanbao-600/[0.02] rounded-full blur-[100px] -z-10" />

      <div className="container-page">
        <Reveal>
          <div className="text-center mb-16">
            <span className="section-label mb-4">{t('why.badge')}</span>
            <h2 className="heading-lg mt-4">{t('why.title')}</h2>
            <p className="text-white/50 mt-4 max-w-lg mx-auto">
              {t('why.subtitle')}
            </p>
          </div>
        </Reveal>

        {/* 4 张编号卡片 */}
        <div className="grid md:grid-cols-2 gap-4 max-w-5xl mx-auto">
          {REASONS.map((reason, idx) => (
            <Reveal key={reason.num} delay={idx * 100}>
              <div className="card-glass p-7 sm:p-8 relative overflow-hidden group hover:bg-white/[0.05] transition-all duration-300 h-full border-l-2 border-l-yuanbao-500/30 hover:border-l-yuanbao-500">
                {/* 大编号背景水印 */}
                <span className="absolute -top-3 -right-2 text-[100px] sm:text-[120px] font-black text-white/[0.015] leading-none select-none pointer-events-none group-hover:text-white/[0.03] transition-all duration-500">
                  {reason.num}
                </span>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{reason.icon}</span>
                    <span className="text-[11px] text-yuanbao-400/60 font-mono uppercase tracking-widest">{reason.tag}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2.5">{t(reason.titleKey)}</h3>
                  <p className="text-white/45 text-sm leading-relaxed">{t(reason.descKey)}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* 数字统计行 */}
        <Reveal delay={200}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto mt-14">
            {STATS.map((stat) => (
              <div key={stat.labelKey} className="card-glass p-5 sm:p-6 text-center group hover:bg-white/[0.05] transition-all duration-300">
                <div className="text-2xl sm:text-3xl font-bold text-gradient mb-1 font-mono">
                  {stat.value}<span className="text-lg">{stat.suffix}</span>
                </div>
                <div className="text-[11px] text-white/35 font-medium uppercase tracking-wider">{t(stat.labelKey)}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════
   Section 6: 桌面宠物 — 精致 SVG 小猫 + 显示器
   ═══════════════════════════════════════════════ */
function DesktopPet() {
  const { t } = useLanguage()
  return (
    <section className="py-24 lg:py-28 relative overflow-hidden">
      <div className="container-page">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
          {/* 左侧描述 */}
          <Reveal direction="right">
            <div>
              <span className="section-label mb-4">{t('desk.badge')}</span>
              <h2 className="heading-lg mt-4 mb-6">{t('desk.title')}</h2>
              <p className="text-white/50 leading-relaxed mb-8">
                {t('desk.desc')}
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  t('desk.f1'),
                  t('desk.f2'),
                  t('desk.f3'),
                  t('desk.f4'),
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-white/55 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-yuanbao-400 flex-shrink-0 shadow-sm shadow-yuanbao-400/50" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/experts" className="btn-primary text-sm">
                {t('desk.explore')}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </Reveal>

          {/* 右侧 SVG 图形：小猫 + 显示器 */}
          <Reveal delay={200} direction="left">
            <div className="relative">
              <div className="absolute -inset-8 bg-yuanbao-500/[0.06] rounded-full blur-[60px] -z-10" />
              <div className="card-glass p-3 relative border border-white/[0.08]">
                <div className="absolute inset-0 bg-gradient-to-br from-yuanbao-500/[0.06] via-transparent to-yuanbao-600/[0.03] rounded-2xl" />
                <CatMonitorGraphic />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════
   Section 7: FAQ 手风琴
   ═══════════════════════════════════════════════ */
const FAQ_ITEMS = [
  { qKey: 'faq.q1', aKey: 'faq.a1' },
  { qKey: 'faq.q2', aKey: 'faq.a2' },
  { qKey: 'faq.q3', aKey: 'faq.a3' },
  { qKey: 'faq.q4', aKey: 'faq.a4' },
  { qKey: 'faq.q5', aKey: 'faq.a5' },
  { qKey: 'faq.q6', aKey: 'faq.a6' },
  { qKey: 'faq.q7', aKey: 'faq.a7' },
  { qKey: 'faq.q8', aKey: 'faq.a8' },
]

function FAQ() {
  const { t } = useLanguage()
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="py-24 lg:py-28">
      <div className="container-page">
        <Reveal>
          <div className="text-center mb-16">
            <span className="section-label mb-4">{t('faq.badge')}</span>
            <h2 className="heading-lg mt-4">{t('faq.title')}</h2>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="max-w-3xl mx-auto space-y-2.5">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openIndex === idx
              return (
                <div
                  key={idx}
                  className={`rounded-xl overflow-hidden border transition-all duration-300 ${
                    isOpen
                      ? 'bg-white/[0.04] border-yuanbao-500/20 shadow-lg shadow-yuanbao-500/[0.03]'
                      : 'bg-white/[0.02] border-white/[0.05] hover:border-white/[0.08]'
                  }`}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left group"
                  >
                    <span className={`font-medium text-sm transition-colors pr-4 ${isOpen ? 'text-white' : 'text-white/75'}`}>
                      {t(item.qKey)}
                    </span>
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                      isOpen
                        ? 'bg-yuanbao-500/15 text-yuanbao-400 rotate-180'
                        : 'bg-white/[0.04] text-white/30 group-hover:text-white/50'
                    }`}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </span>
                  </button>
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <p className="px-5 pb-5 text-white/50 text-sm leading-relaxed">
                      {t(item.aKey)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════
   Section 8: CTA 底部横幅
   ═══════════════════════════════════════════════ */
function CTA() {
  const { t } = useLanguage()
  return (
    <section className="py-24 lg:py-28">
      <div className="container-page">
        <Reveal>
          <div className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden border border-white/[0.08]">
            {/* 背景渐变层 */}
            <div className="absolute inset-0 bg-gradient-to-br from-yuanbao-500/[0.07] via-yuanbao-600/[0.03] to-transparent" />
            <div className="absolute top-0 right-0 w-72 h-72 bg-yuanbao-500/[0.08] rounded-full blur-[90px]" />
            <div className="absolute bottom-0 left-0 w-56 h-56 bg-yuanbao-600/[0.05] rounded-full blur-[70px]" />
            {/* 网格纹理 */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

            <div className="relative p-10 sm:p-14 lg:p-16 text-center">
              {/* 装饰性小图标 */}
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-yuanbao-500/10 border border-yuanbao-500/20 mb-6">
                <svg className="w-7 h-7 text-yuanbao-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                </svg>
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                {t('cta.title')}
              </h2>
              <p className="text-white/50 max-w-lg mx-auto mb-8 leading-relaxed">
                {t('cta.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3.5 justify-center">
                <a href="#quickstart" className="btn-primary text-base px-7 py-3.5">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {t('cta.primary')}
                </a>
                <Link to="/contribute" className="btn-secondary text-base px-7 py-3.5">
                  {t('cta.secondary')}
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════
   HomePage — 组合所有 section（含 SectionDivider）
   ═══════════════════════════════════════════════ */
export default function HomePage() {
  return (
    <>
      <Hero />
      <SectionDivider variant="dots" />
      <ChannelTags />
      <SectionDivider variant="line" />
      <ExpertRoles />
      <SectionDivider variant="wave" />
      <QuickStart />
      <SectionDivider variant="dots" />
      <WhyChoose />
      <SectionDivider variant="curve" />
      <DesktopPet />
      <SectionDivider variant="line" />
      <FAQ />
      <SectionDivider variant="arrow" />
      <CTA />
    </>
  )
}
