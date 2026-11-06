import { useState } from 'react'
import { Link } from 'react-router-dom'
import SectionDivider from '../components/SectionDivider'
import { useLanguage } from '../context/LanguageContext'

const CONTRIBUTION_CATEGORIES = [
  {
    icon: '💻',
    titleKey: '代码贡献',
    descKey: '向核心仓库提交 Bug 修复、新功能、性能优化或测试用例。遵循 Git 工作流，每个 PR 需要有清晰的描述和测试。',
    link: 'https://github.com/ydsz-buddy/ydsz-worker/blob/main/CONTRIBUTING.md',
    linkLabelKey: '贡献指南 →',
    popular: true,
  },
  {
    icon: '🌐',
    titleKey: '生态共建',
    descKey: '为市场生态贡献专家（Expert）、技能（Skill）、插件（Plugin）或连接器（Connector）。构建可被社区复用的模块化能力。',
    link: '/marketplace',
    linkLabelKey: '浏览市场 →',
    popular: false,
  },
  {
    icon: '📖',
    titleKey: '文档改进',
    descKey: '完善 API 文档、撰写使用教程、翻译多语言内容、补充示例代码。好的文档让每个人都能轻松上手。',
    link: 'https://github.com/ydsz-buddy/ydsz-worker/blob/main/docs',
    linkLabelKey: '查看文档 →',
    popular: false,
  },
  {
    icon: '🤝',
    titleKey: '社区助力',
    descKey: '回答 Issues 中的问题、在讨论区帮助新人、分享使用经验、撰写博客推荐。每个有爱的互动都让社区更好。',
    link: 'https://github.com/ydsz-buddy/ydsz-worker/discussions',
    linkLabelKey: '参与讨论 →',
    popular: false,
  },
  {
    icon: '🎨',
    titleKey: '设计共创',
    descKey: 'UI/UX 优化建议、Logo 设计、吉祥物创作、宣传物料。我们的视觉形象由社区共同塑造。',
    link: 'mailto:design@ydsz.dev',
    linkLabelKey: '联系设计组 →',
    popular: false,
  },
]

const STEPS = [
  { num: 1, titleKey: 'contrib.steps.s1', descKey: 'contrib.steps.s1_desc' },
  { num: 2, titleKey: 'contrib.steps.s2', descKey: 'contrib.steps.s2_desc' },
  { num: 3, titleKey: 'contrib.steps.s3', descKey: 'contrib.steps.s3_desc' },
  { num: 4, titleKey: 'contrib.steps.s4', descKey: 'contrib.steps.s4_desc' },
]

const FAQS = [
  { aKey: 'contrib.faq.q1', bKey: 'contrib.faq.a1' },
  { aKey: 'contrib.faq.q2', bKey: 'contrib.faq.a2' },
  { aKey: 'contrib.faq.q3', bKey: 'contrib.faq.a3' },
  { aKey: 'contrib.faq.q4', bKey: 'contrib.faq.a4' },
]

function LeaderboardEmptyStateSvg() {
  return (
    <svg className="w-28 h-28 mx-auto mb-6 text-yuanbao-500/20" viewBox="0 0 112 112" fill="none">
      <circle cx="56" cy="56" r="52" stroke="currentColor" strokeWidth="2" opacity="0.2" />
      <circle cx="56" cy="56" r="44" fill="currentColor" opacity="0.04" />
      {/* Podium */}
      <rect x="28" y="64" width="16" height="24" rx="3" stroke="currentColor" strokeWidth="2" opacity="0.3" />
      <rect x="48" y="52" width="16" height="36" rx="3" stroke="currentColor" strokeWidth="2" opacity="0.4" />
      <rect x="68" y="72" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="2" opacity="0.25" />
      <circle cx="56" cy="44" r="8" stroke="currentColor" strokeWidth="2" opacity="0.3" />
      <circle cx="36" cy="56" r="6" stroke="currentColor" strokeWidth="2" opacity="0.2" />
      <circle cx="76" cy="64" r="5" stroke="currentColor" strokeWidth="2" opacity="0.15" />
    </svg>
  )
}

export default function ContributePage() {
  const { t } = useLanguage()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

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
            <span className="section-label">{t('contrib.hero.badge')}</span>
            <h1 className="heading-xl mt-4 mb-4">
              {t('contrib.hero.title1')}<span className="text-gradient">{t('contrib.hero.title2')}</span>
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto text-balance">
              {t('contrib.hero.desc')}
            </p>
          </div>
        </div>

        <SectionDivider variant="dots" />

        {/* ── Leaderboards ── */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <h2 className="heading-lg">{t('contrib.lb.title')}</h2>
            <p className="text-white/50 mt-3">{t('contrib.lb.subtitle')}</p>
          </div>

          {/* Placeholder state */}
          <div className="max-w-2xl mx-auto card-glass p-12 text-center">
            <LeaderboardEmptyStateSvg />
            <p className="text-base text-white/45 mb-1.5">贡献榜数据正在收集中，敬请期待</p>
            <p className="text-[13px] text-white/30">我们将在 GitHub 贡献统计接入后展示个人与企业排行榜</p>
          </div>
        </section>

        <SectionDivider variant="line" />

        {/* ── Contribution Categories ── */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <h2 className="heading-lg">{t('contrib.cats.title')}</h2>
            <p className="text-white/50 mt-3">{t('contrib.cats.subtitle')}</p>
          </div>
          <div className="space-y-4 max-w-4xl mx-auto">
            {CONTRIBUTION_CATEGORIES.map((cat) => (
              <div key={cat.titleKey} className="card-glow p-6 lg:p-7 flex flex-col md:flex-row md:items-center gap-5 relative overflow-hidden group">
                {cat.popular && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-yuanbao-500 text-ink-900 text-xs font-bold px-3 py-1 rounded-bl-lg">
                      {t('contrib.cats.popular')}
                    </div>
                  </div>
                )}
                {cat.popular && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-yuanbao-400 to-yuanbao-600" />
                )}
                <div className="text-4xl shrink-0">{cat.icon}</div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-lg mb-1.5">{t(cat.titleKey)}</h3>
                  <p className="text-white/55 text-sm leading-relaxed">{t(cat.descKey)}</p>
                </div>
                <a
                  href={cat.link}
                  target={cat.link.startsWith('http') ? '_blank' : undefined}
                  rel={cat.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="shrink-0 px-4 py-2 rounded-lg bg-yuanbao-500/10 border border-yuanbao-500/20 text-yuanbao-400 text-sm font-medium hover:bg-yuanbao-500/15 transition-colors"
                >
                  {t(cat.linkLabelKey)}
                </a>
              </div>
            ))}
          </div>
        </section>

        <SectionDivider variant="wave" />

        {/* ── Contribution Steps ── */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <h2 className="heading-lg">{t('contrib.steps.title')}</h2>
            <p className="text-white/50 mt-3">{t('contrib.steps.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {STEPS.map((s, idx) => (
              <div key={s.num} className="card-glow p-6 pt-8 relative group">
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-yuanbao-500 text-ink-900 font-bold text-sm flex items-center justify-center shadow-lg shadow-yuanbao-500/30">
                  {s.num}
                </div>
                {idx < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-7 -right-3 w-6 border-t border-dashed border-white/[0.1]" />
                )}
                <h3 className="text-white font-semibold mt-2 mb-2 text-center">{t(s.titleKey)}</h3>
                <p className="text-white/55 text-sm leading-relaxed text-center">{t(s.descKey)}</p>
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
              { value: '95+',    labelKey: 'contrib.stats.contributors' },
              { value: '50+',    labelKey: 'contrib.stats.components' },
            ].map((stat) => (
              <div key={stat.labelKey || stat.label} className="card-refined p-5">
                <div className="text-2xl font-bold text-gradient mb-1">{stat.value}</div>
                <div className="text-white/40 text-xs uppercase tracking-wider">{stat.labelKey ? t(stat.labelKey) : stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        <SectionDivider variant="line" />

        {/* ── FAQ ── */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <h2 className="heading-lg">{t('contrib.faq.title')}</h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-3">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="card-glass overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left group"
                >
                  <span className="text-white font-medium pr-4 group-hover:text-yuanbao-300 transition-colors">
                    {t(faq.aKey)}
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
                    {t(faq.bKey)}
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
            <h2 className="heading-lg mb-4">{t('contrib.cta.title')}</h2>
            <p className="text-white/60 mb-8 max-w-xl mx-auto">
              {t('contrib.cta.desc')}
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
                {t('contrib.cta.github')}
              </a>
              <Link to="/marketplace" className="btn-secondary">
                {t('contrib.cta.market')}
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
