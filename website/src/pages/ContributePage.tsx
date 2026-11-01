import { useState } from 'react'
import { Link } from 'react-router-dom'
import SectionDivider from '../components/SectionDivider'

/* ── 贡献排行榜数据 ── */
const INDIVIDUAL_LEADERBOARD = [
  { rank: 1,  name: '陈浩',   avatar: 'CH', contributions: 147, specialties: ['代码', '文档'] },
  { rank: 2,  name: '李伟',   avatar: 'LW', contributions: 135, specialties: ['插件', '生态'] },
  { rank: 3,  name: '张跃',   avatar: 'ZY', contributions: 128, specialties: ['代码', '测试'] },
  { rank: 4,  name: '王芳',   avatar: 'WF', contributions: 122, specialties: ['文档', '翻译'] },
  { rank: 5,  name: '刘洋',   avatar: 'LY', contributions: 118, specialties: ['插件', '设计'] },
  { rank: 6,  name: '赵敏',   avatar: 'ZM', contributions: 105, specialties: ['社区', '答疑'] },
  { rank: 7,  name: '孙杰',   avatar: 'SJ', contributions: 98,  specialties: ['代码', '生态'] },
  { rank: 8,  name: '周鑫',   avatar: 'ZX', contributions: 92,  specialties: ['插件', '文档'] },
  { rank: 9,  name: '吴磊',   avatar: 'WL', contributions: 87,  specialties: ['连接器'] },
  { rank: 10, name: '郑宇',   avatar: 'ZY', contributions: 80,  specialties: ['代码', '插件'] },
  { rank: 11, name: '黄蕾',   avatar: 'HL', contributions: 73,  specialties: ['文档', '社区'] },
  { rank: 12, name: '林峰',   avatar: 'LF', contributions: 68,  specialties: ['测试', '代码'] },
  { rank: 13, name: '冯雪',   avatar: 'FX', contributions: 62,  specialties: ['设计', 'UI'] },
  { rank: 14, name: '蒋勇',   avatar: 'JY', contributions: 58,  specialties: ['插件', '代码'] },
  { rank: 15, name: '沈静',   avatar: 'SJ', contributions: 54,  specialties: ['翻译', '文档'] },
  { rank: 16, name: '韩梅',   avatar: 'HM', contributions: 49,  specialties: ['社区', '答疑'] },
  { rank: 17, name: '杨帆',   avatar: 'YF', contributions: 45,  specialties: ['技能', '插件'] },
  { rank: 18, name: '许强',   avatar: 'XQ', contributions: 41,  specialties: ['代码', '修复'] },
  { rank: 19, name: '朱红',   avatar: 'ZH', contributions: 38,  specialties: ['安全', '测试'] },
  { rank: 20, name: '何冰',   avatar: 'HB', contributions: 35,  specialties: ['生态', '文档'] },
]

const COMPANY_LEADERBOARD = [
  { rank: 1,  company: '蚂蚁集团',     logo: '🐜', contributions: 28, category: '核心代码' },
  { rank: 2,  company: 'PingCAP',      logo: '🌊', contributions: 22, category: '数据库连接器' },
  { rank: 3,  company: '飞书',         logo: '🐦', contributions: 18, category: 'IM 通道' },
  { rank: 4,  company: '企业微信',     logo: '💼', contributions: 15, category: '企业集成' },
  { rank: 5,  company: '钉钉',         logo: '📌', contributions: 12, category: 'IM 通道' },
  { rank: 6,  company: '腾讯文档',     logo: '📄', contributions: 10, category: '连接器' },
  { rank: 7,  company: '语雀',         logo: '🐦', contributions: 9,  category: '知识库插件' },
  { rank: 8,  company: 'Notion',       logo: '📝', contributions: 8,  category: '文档集成' },
  { rank: 9,  company: 'Obsidian',     logo: '💎', contributions: 7,  category: '编辑器集成' },
  { rank: 10, company: 'Slack',        logo: '💬', contributions: 6,  category: 'IM 通道' },
  { rank: 11, company: 'Discord',      logo: '🎮', contributions: 5,  category: 'IM 通道' },
  { rank: 12, company: '华为云',       logo: '☁️', contributions: 5,  category: 'AI 模型' },
  { rank: 13, company: 'Moonshot',     logo: '🌙', contributions: 4,  category: 'LLM 集成' },
  { rank: 14, company: '智谱 AI',     logo: '🧠', contributions: 4,  category: 'LLM 集成' },
  { rank: 15, company: 'MiniMax',      logo: '⚡', contributions: 4,  category: 'AI 模型' },
  { rank: 16, company: 'DeepSeek',     logo: '🔍', contributions: 3,  category: 'LLM 集成' },
  { rank: 17, company: 'OpenAI',       logo: '🤖', contributions: 3,  category: 'LLM 集成' },
  { rank: 18, company: 'Anthropic',    logo: '🛡️', contributions: 3,  category: 'LLM 集成' },
  { rank: 19, company: 'Ollama',       logo: '🦙', contributions: 3,  category: '本地模型' },
  { rank: 20, company: 'Coze',         logo: '🪐', contributions: 2,  category: '竞品' },
]

const CONTRIBUTION_CATEGORIES = [
  {
    icon: '💻',
    title: '代码贡献',
    description: '向核心仓库提交 Bug 修复、新功能、性能优化或测试用例。遵循 Git 工作流，每个 PR 需要有清晰的描述和测试。',
    link: 'https://github.com/ydsz-buddy/ydsz-worker/blob/main/CONTRIBUTING.md',
    linkLabel: '贡献指南 →',
    popular: true,
  },
  {
    icon: '🌐',
    title: '生态共建',
    description: '为市场生态贡献专家（Expert）、技能（Skill）、插件（Plugin）或连接器（Connector）。构建可被社区复用的模块化能力。',
    link: '/marketplace',
    linkLabel: '浏览市场 →',
    popular: false,
  },
  {
    icon: '📖',
    title: '文档改进',
    description: '完善 API 文档、撰写使用教程、翻译多语言内容、补充示例代码。好的文档让每个人都能轻松上手。',
    link: 'https://github.com/ydsz-buddy/ydsz-worker/blob/main/docs',
    linkLabel: '查看文档 →',
    popular: false,
  },
  {
    icon: '🤝',
    title: '社区助力',
    description: '回答 Issues 中的问题、在讨论区帮助新人、分享使用经验、撰写博客推荐。每个有爱的互动都让社区更好。',
    link: 'https://github.com/ydsz-buddy/ydsz-worker/discussions',
    linkLabel: '参与讨论 →',
    popular: false,
  },
  {
    icon: '🎨',
    title: '设计共创',
    description: 'UI/UX 优化建议、Logo 设计、吉祥物创作、宣传物料。我们的视觉形象由社区共同塑造。',
    link: 'mailto:design@ydsz.dev',
    linkLabel: '联系设计组 →',
    popular: false,
  },
]

const STEPS = [
  { num: 1, title: 'Fork 仓库', desc: 'Fork ydsz-worker 到你自己的账号，创建特性的分支。' },
  { num: 2, title: '选择任务', desc: '浏览标记有 good-first-issue 或 help-wanted 的 Issue。' },
  { num: 3, title: '开发提交', desc: 'Fork → Branch → Code → Test → PR，保持代码清晰可维护。' },
  { num: 4, title: '评审合并', desc: '维护者评审反馈 → 修改 → 合并入 main → 进入贡献榜。' },
]

const FAQS = [
  { a: '我完全没有编程经验可以参与吗？', b: '当然可以！文档翻译、测试反馈、Bug 报告、UI 设计建议、社区答疑等都是非常重要且被认可的贡献形式。' },
  { a: '提交 PR 后多久能得到反馈？', b: '我们承诺在收到 PR 后 5 个工作日内给出首次反馈。紧急 Bug 修复 24 小时内响应。' },
  { a: '如何让自己的贡献被更多人使用？', b: '提交到市场生态的专家/技能/插件/连接器会自动展示在 Marketplace，获得社区评分和推荐位。' },
  { a: '可以组队参与吗？', b: '鼓励团队协作。请在 PR 描述中注明团队成员 GitHub ID，贡献榜会分别计入每人名下。' },
]

export default function ContributePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [leaderboardTab, setLeaderboardTab] = useState<'individual' | 'company'>('individual')

  const leaderboard = leaderboardTab === 'individual' ? INDIVIDUAL_LEADERBOARD : COMPANY_LEADERBOARD

  return (
    <div className="pt-24 pb-16 lg:pt-32 lg:pb-24">
      <div className="container-page">

        {/* ── Hero ── */}
        <div className="relative text-center mb-16 overflow-hidden">
          <svg className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[180px] opacity-20" viewBox="0 0 600 180" fill="none">
            <circle cx="300" cy="90" r="85" fill="#22c55e" opacity="0.15" />
            <circle cx="200" cy="50" r="40" fill="#22c55e" opacity="0.08" />
            <circle cx="420" cy="120" r="55" fill="#22c55e" opacity="0.05" />
          </svg>
          <div className="relative">
            <span className="section-label">开源贡献</span>
            <h1 className="heading-xl mt-4 mb-4">
              共筑<span className="text-gradient">开源生态</span>
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto text-balance">
              每一行代码、每一份文档、每一个插件，都在让企业 AI 变得更好。<br className="hidden sm:block" />
              无论你是谁，你的贡献都将被看见。
            </p>
          </div>
        </div>

        <SectionDivider variant="dots" />

        {/* ── Leaderboards ── */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <h2 className="heading-lg">开源贡献榜</h2>
            <p className="text-white/50 mt-3">代码永不眠，致敬每一位同行者</p>
          </div>

          {/* Tab switcher */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex gap-1 p-1 bg-white/[0.04] rounded-xl border border-white/[0.06]">
              <button
                onClick={() => setLeaderboardTab('individual')}
                className={`px-5 py-2 text-sm rounded-lg transition-all ${
                  leaderboardTab === 'individual'
                    ? 'bg-yuanbao-500/10 text-yuanbao-400 border border-yuanbao-500/20'
                    : 'text-white/50 hover:text-white/70'
                }`}
              >
                👤 个人贡献榜
              </button>
              <button
                onClick={() => setLeaderboardTab('company')}
                className={`px-5 py-2 text-sm rounded-lg transition-all ${
                  leaderboardTab === 'company'
                    ? 'bg-yuanbao-500/10 text-yuanbao-400 border border-yuanbao-500/20'
                    : 'text-white/50 hover:text-white/70'
                }`}
              >
                🏢 企业贡献榜
              </button>
            </div>
          </div>

          {/* Leaderboard cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 max-w-5xl mx-auto">
            {leaderboard.map((entry) => (
              <div
                key={entry.rank}
                className={`card-refined relative p-5 text-center group ${
                  entry.rank <= 3 ? 'ring-1 ring-yuanbao-500/15' : ''
                }`}
              >
                {/* Rank badge */}
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-lg ${
                  entry.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-ink-900' :
                  entry.rank === 2 ? 'bg-gradient-to-br from-gray-200 to-gray-400 text-ink-900' :
                  entry.rank === 3 ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white' :
                  'bg-ink-700 text-white/60 border border-white/[0.08]'
                }`}>
                  {entry.rank}
                </div>

                {leaderboardTab === 'individual' ? (
                  <>
                    {/* Individual avatar */}
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yuanbao-400/20 to-yuanbao-600/20 border border-yuanbao-500/20 flex items-center justify-center mx-auto mt-3 mb-3">
                      <span className="text-yuanbao-400 font-bold text-lg">
                        {(entry as typeof INDIVIDUAL_LEADERBOARD[0]).avatar}
                      </span>
                    </div>
                    <h3 className="text-white font-semibold text-sm mb-1">
                      {(entry as typeof INDIVIDUAL_LEADERBOARD[0]).name}
                    </h3>
                    <div className="text-2xl font-bold text-gradient my-2">
                      {(entry as typeof INDIVIDUAL_LEADERBOARD[0]).contributions}
                    </div>
                    <div className="text-xs text-white/40 mb-3">次贡献</div>
                    <div className="flex flex-wrap justify-center gap-1">
                      {(entry as typeof INDIVIDUAL_LEADERBOARD[0]).specialties.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-xs text-white/40">{s}</span>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Company logo */}
                    <div className="text-3xl mb-2 mt-3">
                      {(entry as typeof COMPANY_LEADERBOARD[0]).logo}
                    </div>
                    <h3 className="text-white font-semibold text-sm mb-1">
                      {(entry as typeof COMPANY_LEADERBOARD[0]).company}
                    </h3>
                    <div className="text-2xl font-bold text-gradient my-2">
                      {(entry as typeof COMPANY_LEADERBOARD[0]).contributions}
                    </div>
                    <div className="text-xs text-white/40 mb-3">次贡献</div>
                    <span className="inline-block px-2.5 py-1 rounded-full bg-yuanbao-500/10 border border-yuanbao-500/15 text-yuanbao-400 text-xs">
                      {(entry as typeof COMPANY_LEADERBOARD[0]).category}
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>

        <SectionDivider variant="line" />

        {/* ── Contribution Categories ── */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <h2 className="heading-lg">参与方式</h2>
            <p className="text-white/50 mt-3">选择你擅长或感兴趣的方式，开始你的贡献之旅</p>
          </div>
          <div className="space-y-4 max-w-4xl mx-auto">
            {CONTRIBUTION_CATEGORIES.map((cat) => (
              <div key={cat.title} className="card-glow p-6 lg:p-7 flex flex-col md:flex-row md:items-center gap-5 relative overflow-hidden group">
                {cat.popular && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-yuanbao-500 text-ink-900 text-xs font-bold px-3 py-1 rounded-bl-lg">
                      热门
                    </div>
                  </div>
                )}
                {cat.popular && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-yuanbao-400 to-yuanbao-600" />
                )}
                <div className="text-4xl shrink-0">{cat.icon}</div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-lg mb-1.5">{cat.title}</h3>
                  <p className="text-white/55 text-sm leading-relaxed">{cat.description}</p>
                </div>
                <a
                  href={cat.link}
                  target={cat.link.startsWith('http') ? '_blank' : undefined}
                  rel={cat.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="shrink-0 px-4 py-2 rounded-lg bg-yuanbao-500/10 border border-yuanbao-500/20 text-yuanbao-400 text-sm font-medium hover:bg-yuanbao-500/15 transition-colors"
                >
                  {cat.linkLabel}
                </a>
              </div>
            ))}
          </div>
        </section>

        <SectionDivider variant="wave" />

        {/* ── Contribution Steps ── */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <h2 className="heading-lg">开始贡献</h2>
            <p className="text-white/50 mt-3">4 步完成你的第一次贡献</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {STEPS.map((s, idx) => (
              <div key={s.num} className="card-glow p-6 relative group">
                <div className={`absolute -top-4 -left-2 w-10 h-10 rounded-full bg-yuanbao-500 text-ink-900 font-bold text-sm flex items-center justify-center shadow-lg shadow-yuanbao-500/30 ring-4 ring-ink-900`}>
                  {s.num}
                </div>
                {idx < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-6 -right-3 w-6 border-t border-dashed border-white/[0.1]" />
                )}
                <h3 className="text-white font-semibold mt-3 mb-2">{s.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <SectionDivider variant="dots" />

        {/* ── Repository Stats ── */}
        <section className="mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-center">
            {[
              { value: '2,400+', label: 'Stars' },
              { value: '180+',   label: 'Forks' },
              { value: '95+',    label: '贡献者' },
              { value: '50+',    label: '市场组件' },
            ].map((stat) => (
              <div key={stat.label} className="card-refined p-5">
                <div className="text-2xl font-bold text-gradient mb-1">{stat.value}</div>
                <div className="text-white/40 text-xs uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        <SectionDivider variant="line" />

        {/* ── FAQ ── */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <h2 className="heading-lg">常见问题</h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-3">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="card-glass overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left group"
                >
                  <span className="text-white font-medium pr-4 group-hover:text-yuanbao-300 transition-colors">
                    {faq.a}
                  </span>
                  <svg
                    className={`w-5 h-5 text-yuanbao-400 shrink-0 transition-transform duration-200 ${openFaq === idx ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFaq === idx ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="px-6 pb-4 text-white/55 text-sm leading-relaxed border-t border-white/[0.06] pt-4">
                    {faq.b}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="text-center relative overflow-hidden">
          <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 800 200" fill="none" preserveAspectRatio="none">
            <ellipse cx="400" cy="100" rx="380" ry="90" fill="#22c55e" opacity="0.4" />
          </svg>
          <div className="relative">
            <h2 className="heading-lg mb-4">准备好开始贡献了吗？</h2>
            <p className="text-white/60 mb-8 max-w-xl mx-auto">
              加入我们的 GitHub 社区，浏览 Issues，提交你的第一个 PR 或市场组件。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://github.com/ydsz-buddy/ydsz-worker"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                前往 GitHub
              </a>
              <Link to="/marketplace" className="btn-secondary">
                浏览市场生态
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
