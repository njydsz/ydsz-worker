import { useState, useMemo } from 'react'

interface Expert {
  id: string
  name: string
  category: string
  skillsCount: number
  description: string
  author: string
}

const CATEGORIES = [
  '全部',
  '金融',
  '内容创作',
  '生活',
  '健康',
  '学术',
  '技术',
  '教育',
  '医疗健康',
  '人力行政',
  '影视媒体',
  '设计',
] as const

const EXPERTS: Expert[] = [
  {
    id: 'quant-analyst',
    name: '量化分析师',
    category: '金融',
    skillsCount: 8,
    description: '股票、期货、加密货币市场分析，量化策略回测，技术指标计算，风险评估报告生成。',
    author: 'Ydsz Team',
  },
  {
    id: 'investment-researcher',
    name: '投资研究专家',
    category: '金融',
    skillsCount: 11,
    description: '基本面分析、行业研究、估值模型构建、财报解读、投资建议报告撰写。',
    author: 'Ydsz Team',
  },
  {
    id: 'content-creator',
    name: '内容创作大师',
    category: '内容创作',
    skillsCount: 12,
    description: '爆款文章撰写、短视频脚本、社交媒体运营、SEO 优化、标题党生成、热点追踪。',
    author: 'Ydsz Team',
  },
  {
    id: 'short-video-script',
    name: '短视频脚本师',
    category: '内容创作',
    skillsCount: 8,
    description: '抖音/TikTok/Reels 短视频脚本创作、分镜设计、爆款公式拆解、数据分析指导。',
    author: 'Ydsz Team',
  },
  {
    id: 'life-coach',
    name: '生活管家',
    category: '生活',
    skillsCount: 10,
    description: '旅行规划、餐厅推荐、日程管理、购物比价、菜谱生成、家居收纳建议。',
    author: 'Ydsz Team',
  },
  {
    id: 'food-explorer',
    name: '美食探索家',
    category: '生活',
    skillsCount: 7,
    description: '全球美食推荐、菜谱定制、食材搭配建议、餐厅探店指南、饮食文化介绍。',
    author: 'Ydsz Team',
  },
  {
    id: 'health-advisor',
    name: '健康顾问',
    category: '健康',
    skillsCount: 7,
    description: '饮食营养分析、运动处方制定、睡眠质量评估、体检报告解读、心理健康自测。',
    author: 'Ydsz Team',
  },
  {
    id: 'fitness-coach',
    name: '健身教练',
    category: '健康',
    skillsCount: 5,
    description: '增肌减脂健身计划、动作指导、训练强度评估、运动损伤预防、补剂建议。',
    author: 'Ydsz Team',
  },
  {
    id: 'research-assistant',
    name: '学术研究助手',
    category: '学术',
    skillsCount: 9,
    description: '文献检索与综述、论文润色、引用格式转换、研究假设生成、实验设计建议。',
    author: 'Ydsz Team',
  },
  {
    id: 'thesis-mentor',
    name: '论文写作导师',
    category: '学术',
    skillsCount: 6,
    description: '本硕博论文选题指导、结构优化、方法论润色、查重降重策略、答辩准备辅导。',
    author: 'Ydsz Team',
  },
  {
    id: 'fullstack-dev',
    name: '全栈工程师',
    category: '技术',
    skillsCount: 15,
    description: '前后端开发、数据库设计、API 架构、DevOps 部署、代码审查、性能优化、安全防护。',
    author: 'Ydsz Team',
  },
  {
    id: 'devops-engineer',
    name: '运维工程师',
    category: '技术',
    skillsCount: 10,
    description: 'Linux 系统管理、Kubernetes 集群运维、Docker 容器化、CI/CD 流水线搭建。',
    author: 'Ydsz Team',
  },
  {
    id: 'edu-tutor',
    name: '教育辅导老师',
    category: '教育',
    skillsCount: 8,
    description: '课程设计、习题生成、知识点讲解、学习路径规划、考试出题、作文批改。',
    author: 'Ydsz Team',
  },
  {
    id: 'course-designer',
    name: '在线课程设计师',
    category: '教育',
    skillsCount: 6,
    description: 'MOOC 课程设计、课件制作、互动练习设计、学习效果评估、教学视频脚本。',
    author: 'Ydsz Team',
  },
  {
    id: 'medical-doctor',
    name: '基层医生助手',
    category: '医疗健康',
    skillsCount: 13,
    description: '临床指南检索、症状分析、鉴别诊断辅助、用药提醒、慢性病管理、健康宣教。',
    author: 'Ydsz Team',
  },
  {
    id: 'pharmacy-advisor',
    name: '药学顾问',
    category: '医疗健康',
    skillsCount: 7,
    description: '药品说明书解读、药物相互作用审查、用药剂量计算、特殊人群用药指导。',
    author: 'Ydsz Team',
  },
  {
    id: 'recruitment-expert',
    name: '招聘专家',
    category: '人力行政',
    skillsCount: 8,
    description: '招聘 JD 编写、候选人筛选、面试评估体系设计、薪酬谈判策略、人才库管理。',
    author: 'Ydsz Team',
  },
  {
    id: 'office-automation',
    name: '办公自动化专家',
    category: '人力行政',
    skillsCount: 6,
    description: 'Word 文档自动化、Excel 报表生成、PPT 批量制作、PDF 处理、OCR 识别。',
    author: 'Ydsz Team',
  },
  {
    id: 'trending-reporter',
    name: '热点记者',
    category: '影视媒体',
    skillsCount: 1,
    description: '微博/抖音/知乎/B站/小红书 70+ 平台热点追踪、新闻稿件撰写、事件脉络梳理。',
    author: 'Ydsz Team',
  },
  {
    id: 'film-commentary',
    name: '影视解说',
    category: '影视媒体',
    skillsCount: 3,
    description: '电影/电视剧/纪录片解说文稿撰写、深度影评分析、票房/收视率预测报告。',
    author: 'Ydsz Team',
  },
  {
    id: 'ui-designer',
    name: 'UI 设计师',
    category: '设计',
    skillsCount: 7,
    description: '界面原型设计、设计规范输出、配色方案推荐、交互流程优化、图标设计建议。',
    author: 'Ydsz Team',
  },
  {
    id: 'brand-designer',
    name: '品牌设计师',
    category: '设计',
    skillsCount: 6,
    description: '品牌 VI 设计、Logo 方案提案、字体搭配建议、品牌故事撰写、延展物料规范。',
    author: 'Ydsz Team',
  },
]

const DOWNLOAD_BASE = 'https://gitee.com/njydsz/ydsz-worker/tree/main/infra/agents/experts/library'

/* ── 6 种渐变配色（按序号循环） ── */
const GRADIENTS = [
  { light: '#34d399' },
  { light: '#4ade80' },
  { light: '#a3e635' },
  { light: '#2dd4bf' },
  { light: '#06b6d4' },
  { light: '#6ee7b7' },
]

/* ── SVG: 专家卡片 90px 顶部渐变区（6 种不同 SVG 装饰） ── */
function ExpertCardDecoration({ index }: { index: number }) {
  // 每种模式基于 index 选择，使用渐变配色
  const color = GRADIENTS[index % GRADIENTS.length].light

  const patternElements = [
    // 0: 圆形光斑 + 底部渐隐
    <svg key="p0" className="absolute inset-0 w-full h-full" viewBox="0 0 400 90" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`eg-0-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.45" />
          <stop offset="100%" stopColor={color} stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <rect width="400" height="90" fill={`url(#eg-0-${index})`} />
      <circle cx="320" cy="20" r="55" fill="white" opacity="0.06" />
      <circle cx="320" cy="20" r="30" fill="white" opacity="0.04" />
      <circle cx="80" cy="70" r="35" fill="black" opacity="0.15" />
    </svg>,
    // 1: 斜线纹理
    <svg key="p1" className="absolute inset-0 w-full h-full" viewBox="0 0 400 90" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`eg-1-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0.08" />
        </linearGradient>
      </defs>
      <rect width="400" height="90" fill={`url(#eg-1-${index})`} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <line key={i} x1={50 + i * 70} y1="0" x2={90 + i * 70} y2="90" stroke="white" strokeWidth="0.5" opacity="0.08" />
      ))}
      <circle cx="50" cy="45" r="25" fill="white" opacity="0.04" />
    </svg>,
    // 2: 三角几何
    <svg key="p2" className="absolute inset-0 w-full h-full" viewBox="0 0 400 90" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`eg-2-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="50%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <rect width="400" height="90" fill={`url(#eg-2-${index})`} />
      <polygon points="20,90 65,15 110,90" fill="white" opacity="0.04" />
      <polygon points="330,90 375,5 420,90" fill="black" opacity="0.08" />
    </svg>,
    // 3: 波浪线
    <svg key="p3" className="absolute inset-0 w-full h-full" viewBox="0 0 400 90" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`eg-3-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0.08" />
        </linearGradient>
      </defs>
      <rect width="400" height="90" fill={`url(#eg-3-${index})`} />
      <path d="M0,55 Q100,15 200,45 T400,35" stroke="white" strokeWidth="1" fill="none" opacity="0.1" />
      <path d="M0,75 Q150,35 300,65 T400,45" stroke="white" strokeWidth="0.8" fill="none" opacity="0.06" />
      <circle cx="200" cy="40" r="20" fill="white" opacity="0.03" />
    </svg>,
    // 4: 菱形几何
    <svg key="p4" className="absolute inset-0 w-full h-full" viewBox="0 0 400 90" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`eg-4-${index}`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <rect width="400" height="90" fill={`url(#eg-4-${index})`} />
      <rect x="320" y="10" width="48" height="48" rx="4" transform="rotate(45 344 34)" fill="white" opacity="0.05" />
      <rect x="40" y="30" width="28" height="28" rx="2" transform="rotate(45 54 44)" fill="black" opacity="0.08" />
    </svg>,
    // 5: 散射三角
    <svg key="p5" className="absolute inset-0 w-full h-full" viewBox="0 0 400 90" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`eg-5-${index}`} x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.08" />
        </linearGradient>
      </defs>
      <rect width="400" height="90" fill={`url(#eg-5-${index})`} />
      <polygon points="0,90 55,25 110,90" fill="white" opacity="0.04" />
      <polygon points="290,90 340,8 390,90" fill="white" opacity="0.05" />
    </svg>,
  ]

  return (
    <div className="absolute top-0 left-0 right-0 h-[90px] overflow-hidden">
      {patternElements[index % patternElements.length]}
      {/* 底部渐变遮罩 */}
      <div className="absolute bottom-0 left-0 right-0 h-[45px] bg-gradient-to-t from-ink-900 to-transparent" />
    </div>
  )
}

/* ── SVG: 作者头像占位 ── */
function AuthorAvatarSvg() {
  return (
    <svg className="w-5 h-5 text-yuanbao-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
      <circle cx="10" cy="10" r="10" fill="currentColor" opacity="0.15" />
      <circle cx="10" cy="7" r="3" fill="currentColor" opacity="0.6" />
      <path d="M4 17c0-3.3 2.7-6 6-6s6 2.7 6 6" fill="currentColor" opacity="0.4" />
    </svg>
  )
}

/* ── SVG: Header 下划线装饰 ── */
function HeaderUnderline() {
  return (
    <svg className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-48 h-2 text-yuanbao-500" viewBox="0 0 200 8" fill="none" aria-hidden="true">
      <path
        d="M2 4 Q40 0 80 4 Q120 8 180 4 L198 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
      <circle cx="198" cy="4" r="1.5" fill="currentColor" opacity="0.8" />
    </svg>
  )
}

/* ── SVG: 搜索图标 ── */
function SearchIcon() {
  return (
    <svg
      className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  )
}

/* ── SVG: 清除按钮 ── */
function ClearIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

/* ── SVG: 空状态图 ── */
function EmptyStateSvg() {
  return (
    <svg className="w-24 h-24 mx-auto mb-6 text-yuanbao-500/20" viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="2" opacity="0.3" />
      <circle cx="50" cy="50" r="40" fill="currentColor" opacity="0.05" />
      <circle cx="44" cy="44" r="18" stroke="currentColor" strokeWidth="3" opacity="0.5" />
      <line x1="57" y1="57" x2="72" y2="72" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      <line x1="40" y1="44" x2="48" y2="44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.2" />
      <line x1="40" y1="48" x2="45" y2="48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.15" />
      <circle cx="35" cy="38" r="1.5" fill="currentColor" opacity="0.3" />
      <circle cx="55" cy="40" r="1" fill="currentColor" opacity="0.2" />
    </svg>
  )
}

export default function ExpertsPage() {
  const [activeCategory, setActiveCategory] = useState<string>('全部')
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = useMemo(() => {
    let result = EXPERTS
    if (activeCategory !== '全部') {
      result = result.filter((e) => e.category === activeCategory)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q)
      )
    }
    return result
  }, [activeCategory, searchQuery])

  return (
    <div className="py-16 lg:py-24">
      <div className="container-page">
        {/* Header — 含 SVG 下划线 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="section-label">专家市场</span>
            <span className="px-2.5 py-0.5 rounded-full bg-yuanbao-500/10 border border-yuanbao-500/20 text-yuanbao-400 text-xs font-semibold">
              {EXPERTS.length} 个专家
            </span>
          </div>
          <h1 className="relative inline-block heading-xl mt-4 mb-3">
            <span className="text-gradient">专家市场</span>
            <HeaderUnderline />
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto mt-6">
            精心构建的专家智能体，覆盖金融、技术、内容、生活等多个领域。即装即用，持续更新。
          </p>
        </div>

        {/* Filter Row: 分类 pill + 搜索框 */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-10">
          {/* 分类 pill — 精致化样式 */}
          <div className="flex flex-wrap gap-2 flex-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-yuanbao-500/15 text-yuanbao-300 border border-yuanbao-500/30 shadow-sm shadow-yuanbao-500/10'
                    : 'bg-white/[0.05] text-white/70 hover:bg-white/[0.1] hover:text-white border border-white/[0.08]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* 搜索框 — 含图标 + 清除按钮 */}
          <div className="relative lg:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="按名称、关键词或分类搜索..."
              className="w-full px-4 py-2.5 pl-10 pr-8 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white placeholder-white/35 text-sm focus:outline-none focus:border-yuanbao-500/50 focus:ring-1 focus:ring-yuanbao-500/25 transition-all"
            />
            <SearchIcon />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                aria-label="清除搜索"
              >
                <ClearIcon />
              </button>
            )}
          </div>
        </div>

        {/* Expert Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((expert, cardIndex) => {
            return (
              <div
                key={expert.id}
                className="card-glow p-0 overflow-hidden group cursor-default"
              >
                {/* 90px SVG 渐变装饰区 */}
                <ExpertCardDecoration index={cardIndex} />

                {/* Card Content */}
                <div className="relative pt-14 px-6 pb-6">
                  {/* 头像 */}
                  <div className="absolute -top-6 left-6 w-12 h-12 rounded-xl bg-gradient-to-br from-yuanbao-400 to-yuanbao-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-yuanbao-500/30 border-2 border-ink-900">
                    {expert.name.charAt(0)}
                  </div>

                  {/* 名称 + 分类 */}
                  <div className="mb-3">
                    <h3 className="text-white font-semibold text-base group-hover:text-yuanbao-300 transition-colors">
                      {expert.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-yuanbao-500/10 text-yuanbao-400 text-xs border border-yuanbao-500/20">
                        {expert.category}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/[0.05] text-white/60 text-xs border border-white/[0.08]">
                        {expert.skillsCount} 技能
                      </span>
                    </div>
                  </div>

                  {/* 描述 */}
                  <p className="text-white/55 text-sm leading-relaxed mb-5 line-clamp-2">
                    {expert.description}
                  </p>

                  {/* 分隔线 */}
                  <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent mb-4" />

                  {/* 底部行: 作者头像 + 下载按钮 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AuthorAvatarSvg />
                      <span className="text-xs text-white/40">{expert.author}</span>
                    </div>
                    <a
                      href={`${DOWNLOAD_BASE}/${expert.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-yuanbao-500 hover:bg-yuanbao-400 text-ink-900 text-xs font-semibold rounded-lg transition-all shadow-sm hover:shadow-md hover:shadow-yuanbao-500/20"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      下载
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* 空状态 — SVG */}
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <EmptyStateSvg />
            <p className="text-lg text-white/50 mb-2">未找到匹配的专家</p>
            <p className="text-sm text-white/35">尝试修改关键词或切换分类重新查找</p>
          </div>
        )}
      </div>
    </div>
  )
}
