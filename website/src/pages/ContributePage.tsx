import { useState } from 'react'
import { Link } from 'react-router-dom'

interface FaqItem {
  question: string
  answer: string
}

const FAQS: FaqItem[] = [
  {
    question: '贡献季活动什么时候截止？',
    answer:
      '本期贡献季从 2026 年 7 月 1 日开始，至 2026 年 9 月 30 日结束。评审结果将于 2026 年 10 月 15 日在 GitHub Discussions 和社区群公布。',
  },
  {
    question: '我没有编程经验可以参与吗？',
    answer:
      '当然可以！文档翻译、测试反馈、Bug 报告、UI 设计建议、社区答疑等都是宝贵的贡献方式。活动设置了专门的「非代码贡献」赛道。',
  },
  {
    question: '提交贡献后多久能得到反馈？',
    answer:
      '我们承诺在收到 PR 后 5 个工作日内给出首次反馈。紧急 Bug 修复会在 24 小时内响应。',
  },
  {
    question: '一个 PR 可以同时参与多个奖励类别吗？',
    answer:
      '可以。只要 PR 符合多个类别的标准，即可同时获得对应类别的奖励。但同一类别内每个贡献者仅计最高分作品。',
  },
  {
    question: '奖品如何发放？',
    answer:
      '实物奖品（周边礼盒、定制键盘等）通过快递发放；数字奖品（GitHub Pro、JetBrains License）通过邮件发放兑换码；现金奖励通过支付宝/微信转账。',
  },
  {
    question: '可以组队参与吗？',
    answer:
      '鼓励团队协作。请在 PR 描述中注明团队成员 GitHub ID，奖励按贡献比例分配。团队作品需指定一名主负责人。',
  },
]

const TRACKS = [
  {
    id: 'code',
    icon: '💻',
    title: '代码贡献',
    description: '提交 Bug 修复、新功能、性能优化或测试用例到主仓库。',
    prize: '¥15,000 奖金 + 核心贡献者徽章',
    highlight: true,
  },
  {
    id: 'docs',
    icon: '📖',
    title: '文档改进',
    description: '完善 API 文档、撰写教程、翻译多语言内容。',
    prize: '周边大礼包 + 官方推荐位',
    highlight: false,
  },
  {
    id: 'plugins',
    icon: '🧩',
    title: '插件开发',
    description: '为插件市场贡献新插件或重度更新已有插件。',
    prize: '插件官方认证 + 首页推广位',
    highlight: false,
  },
  {
    id: 'community',
    icon: '🤝',
    title: '社区助力',
    description: '回答用户问题、组织线上活动、制作视频教程、传播推荐。',
    prize: '社区之星勋章 + 限定周边',
    highlight: false,
  },
  {
    id: 'design',
    icon: '🎨',
    title: '设计共创',
    description: 'UI/UX 优化建议、Logo 设计、吉祥物创作、宣传物料。',
    prize: '设计贡献者荣誉证书 + 定制礼品',
    highlight: false,
  },
]

const STEPS = [
  {
    title: 'Fork 仓库',
    desc: '访问 github.com/ydsz-buddy/ydsz-worker 并 Fork 到你自己的账号。',
  },
  {
    title: '选择任务',
    desc: '在 Issues 中寻找带有 good-first-issue 或 contribute-season 标签的任务。',
  },
  {
    title: '开发提交',
    desc: 'Fork → Branch → Code → Test → PR，PR 描述中注明参与贡献季。',
  },
  {
    title: '评审合并',
    desc: '维护者评审 → 反馈修改 → 合并入 main → 计入贡献榜。',
  },
]

export default function ContributePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="py-16 lg:py-24">
      <div className="container-page">

        {/* Header with SVG Decoration */}
        <div className="relative text-center mb-16 overflow-hidden">
          {/* Background SVG Decoration */}
          <svg className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] opacity-30" viewBox="0 0 600 200" fill="none">
            <defs>
              <linearGradient id="grad-orb" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#16a34a" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <circle cx="300" cy="100" r="90" fill="url(#grad-orb)" />
            <circle cx="180" cy="60" r="50" fill="#22c55e" opacity="0.08" />
            <circle cx="450" cy="140" r="70" fill="#22c55e" opacity="0.05" />
          </svg>

          <div className="relative">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="section-label">开源贡献季</span>
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                限定活动 2026 Q3
              </span>
            </div>
            <h1 className="heading-xl mt-4 mb-4">
              <span className="text-gradient">开源贡献季</span>
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              加入社区，一起打造更好的企业 AI 平台。贡献代码、文档、插件或想法，赢取限定好礼。
            </p>
          </div>
        </div>

        {/* Activity Description */}
        <section className="card-glass p-8 lg:p-10 mb-16 relative overflow-hidden">
          {/* Decorative blurred orb */}
          <svg className="absolute -top-10 -right-10 w-40 h-40 opacity-20" viewBox="0 0 160 160" fill="none">
            <circle cx="80" cy="80" r="80" fill="#22c55e" />
            <circle cx="60" cy="60" r="40" fill="#4ade80" opacity="0.5" />
          </svg>

          <div className="relative flex items-start gap-4 mb-6">
            <span className="text-3xl">🎁</span>
            <div>
              <h2 className="heading-lg text-2xl mb-3">活动说明</h2>
              <p className="text-white/60 leading-relaxed text-balance">
                「开源贡献季」是 Ydsz Worker 社区每季度举办的贡献激励活动。无论你是资深开发者、技术写作者、设计师还是开源新人，都可以通过多种形式参与贡献。我们为不同贡献类型设置了丰富的奖励机制，希望让每一份付出都被看见和认可。
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/[0.03] rounded-xl p-5 border border-white/[0.06] text-center">
              <div className="text-yuanbao-400 font-bold text-2xl mb-1">2026.07 — 2026.09</div>
              <div className="text-white/50 text-sm">活动时间</div>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-5 border border-white/[0.06] text-center">
              <div className="text-yuanbao-400 font-bold text-2xl mb-1">¥50,000+</div>
              <div className="text-white/50 text-sm">总奖池</div>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-5 border border-white/[0.06] text-center">
              <div className="text-yuanbao-400 font-bold text-2xl mb-1">5 大赛道</div>
              <div className="text-white/50 text-sm">参与方式</div>
            </div>
          </div>
        </section>

        {/* 5 Tracks */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <span className="section-label mb-3">参与方式</span>
            <h2 className="heading-lg mt-3">5 种方式参与贡献</h2>
          </div>
          <div className="space-y-4">
            {TRACKS.map((track) => (
              <div
                key={track.id}
                className={`card-glow p-6 lg:p-8 flex flex-col md:flex-row md:items-center gap-5 relative overflow-hidden ${
                  track.highlight ? 'ring-1 ring-yuanbao-500/30' : ''
                }`}
              >
                {track.highlight && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-yuanbao-500 text-ink-900 text-xs font-bold px-3 py-1 rounded-bl-lg">
                      热门赛道
                    </div>
                  </div>
                )}
                {/* Accent bar */}
                {track.highlight && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-yuanbao-400 to-yuanbao-600" />
                )}
                <div className="text-4xl shrink-0">{track.icon}</div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-lg mb-1">{track.title}</h3>
                  <p className="text-white/55 text-sm">{track.description}</p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-yuanbao-500/10 border border-yuanbao-500/20 text-yuanbao-400 text-sm font-medium">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {track.prize}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How to Submit — Steps */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <span className="section-label mb-3">提交步骤</span>
            <h2 className="heading-lg mt-3">如何提交贡献</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map((s, idx) => (
              <div key={idx} className="card-glow p-6 relative group">
                {/* Circle Number */}
                <div className="absolute -top-4 -left-2 w-10 h-10 rounded-full bg-yuanbao-500 text-ink-900 font-bold text-sm flex items-center justify-center shadow-lg shadow-yuanbao-500/30 ring-4 ring-ink-900">
                  {idx + 1}
                </div>
                {/* Connector line (hidden on last item) */}
                {idx < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-6 -right-3 w-6 border-t border-dashed border-white/[0.1]" />
                )}
                <h3 className="text-white font-semibold mt-3 mb-2">{s.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Accordion */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <span className="section-label mb-3">常见问题</span>
            <h2 className="heading-lg mt-3">FAQ</h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-3">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="card-glass overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left group"
                >
                  <span className="text-white font-medium pr-4 group-hover:text-yuanbao-300 transition-colors">
                    {faq.question}
                  </span>
                  <svg
                    className={`w-5 h-5 text-yuanbao-400 shrink-0 transition-transform duration-200 ${
                      openFaq === idx ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaq === idx ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 pb-4 text-white/55 text-sm leading-relaxed border-t border-white/[0.06] pt-4">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Notes */}
        <section className="card-glass p-8 lg:p-10 mb-16 relative overflow-hidden">
          {/* Decoration */}
          <svg className="absolute bottom-0 right-0 w-48 h-48 opacity-5" viewBox="0 0 200 200" fill="none">
            <circle cx="150" cy="150" r="100" fill="#22c55e" />
            <circle cx="100" cy="100" r="50" fill="#4ade80" />
          </svg>
          <div className="relative">
            <h2 className="heading-lg text-2xl mb-6">注意事项</h2>
            <ul className="space-y-3 text-white/55 text-sm leading-relaxed">
              <li className="flex items-start gap-3">
                <span className="text-yuanbao-400 mt-0.5 shrink-0">•</span>
                <span>所有贡献必须遵循项目的 Code of Conduct 和开源协议（MIT）。</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-yuanbao-400 mt-0.5 shrink-0">•</span>
                <span>提交的代码需要包含必要的测试，PR 需通过 CI 检查才能进入评审。</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-yuanbao-400 mt-0.5 shrink-0">•</span>
                <span>每位参与者需完成 CLA（贡献者许可协议）签署，模板见仓库根目录。</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-yuanbao-400 mt-0.5 shrink-0">•</span>
                <span>禁止抄袭、刷 PR 等行为，一经发现取消活动资格并公示。</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-yuanbao-400 mt-0.5 shrink-0">•</span>
                <span>活动最终解释权归 Ydsz Worker 核心团队所有，如有疑问请联系 contributes@ydsz.dev。</span>
              </li>
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center relative overflow-hidden">
          {/* Background decoration */}
          <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 800 200" fill="none" preserveAspectRatio="none">
            <defs>
              <linearGradient id="cta-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#16a34a" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <ellipse cx="400" cy="100" rx="380" ry="90" fill="url(#cta-grad)" />
          </svg>

          <div className="relative">
            <h2 className="heading-lg mb-4">准备好开始贡献了吗？</h2>
            <p className="text-white/60 mb-8 max-w-xl mx-auto">
              加入我们的 GitHub 社区，浏览 Issues，提交你的第一个 PR。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://gitee.com/njydsz/ydsz-worker"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                前往 GitHub
              </a>
              <Link to="/experts" className="btn-secondary">
                浏览专家市场
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
