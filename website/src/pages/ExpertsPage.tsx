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

const GRADIENTS = [
  'from-emerald-500 to-teal-600',
  'from-green-400 to-cyan-500',
  'from-lime-400 to-emerald-500',
  'from-teal-400 to-green-600',
  'from-cyan-500 to-emerald-400',
  'from-emerald-400 to-green-500',
]

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return Math.abs(hash)
}

// Subtle SVG decoration pattern for expert cards
function ExpertCardDecoration({ gradient }: { gradient: string }) {
  return (
    <div className="absolute top-0 left-0 right-0 h-24 overflow-hidden rounded-t-2xl">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-80`} />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-900/60 to-transparent" />
      {/* Blurred decorative orbs */}
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl" />
      <div className="absolute top-8 -left-4 w-16 h-16 bg-black/20 rounded-full blur-lg" />
    </div>
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
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="section-label">专家市场</span>
            <span className="px-2.5 py-0.5 rounded-full bg-yuanbao-500/10 border border-yuanbao-500/20 text-yuanbao-400 text-xs font-semibold">
              {EXPERTS.length} 个专家
            </span>
          </div>
          <h1 className="heading-xl mt-4 mb-3">
            <span className="text-gradient">专家市场</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            精心构建的专家智能体，覆盖金融、技术、内容、生活等多个领域。即装即用，持续更新。
          </p>
        </div>

        {/* Filter Row: Categories + Search */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-10">
          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 flex-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-yuanbao-500 text-ink-900 shadow-lg shadow-yuanbao-500/25'
                    : 'bg-white/[0.05] text-white/70 hover:bg-white/[0.1] hover:text-white border border-white/[0.08]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative lg:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索专家..."
              className="w-full px-4 py-2.5 pl-10 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white placeholder-white/40 text-sm focus:outline-none focus:border-yuanbao-500/50 focus:ring-1 focus:ring-yuanbao-500/25 transition-all"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Expert Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((expert) => {
            const gradient = GRADIENTS[hashString(expert.id) % GRADIENTS.length]
            return (
              <div
                key={expert.id}
                className="card-glow p-0 overflow-hidden group cursor-default"
              >
                {/* Gradient Header Area */}
                <ExpertCardDecoration gradient={gradient} />

                {/* Card Content */}
                <div className="relative pt-14 px-6 pb-6">
                  {/* Avatar */}
                  <div className="absolute -top-6 left-6 w-12 h-12 rounded-xl bg-gradient-to-br from-yuanbao-400 to-yuanbao-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-yuanbao-500/30 border-2 border-ink-900">
                    {expert.name.charAt(0)}
                  </div>

                  {/* Name + Category */}
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

                  {/* Description */}
                  <p className="text-white/55 text-sm leading-relaxed mb-5 line-clamp-2">
                    {expert.description}
                  </p>

                  {/* Bottom Row */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                    <span className="text-xs text-white/40">by {expert.author}</span>
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

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="text-center py-20 text-white/40">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-lg mb-2">未找到匹配的专家</p>
            <p className="text-sm">试试其他关键词或分类</p>
          </div>
        )}
      </div>
    </div>
  )
}
