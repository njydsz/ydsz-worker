import { useState } from 'react'
import { Link } from 'react-router-dom'

interface Expert {
  id: string
  name: string
  category: string
  skillsCount: number
  description: string
  avatar: string
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
    avatar: '📊',
  },
  {
    id: 'content-creator',
    name: '内容创作大师',
    category: '内容创作',
    skillsCount: 12,
    description: '爆款文章撰写、短视频脚本、社交媒体运营、SEO 优化、标题党生成、热点追踪。',
    avatar: '✍️',
  },
  {
    id: 'life-coach',
    name: '生活管家',
    category: '生活',
    skillsCount: 10,
    description: '旅行规划、餐厅推荐、日程管理、购物比价、菜谱生成、家居收纳建议。',
    avatar: '🏠',
  },
  {
    id: 'health-advisor',
    name: '健康顾问',
    category: '健康',
    skillsCount: 7,
    description: '饮食营养分析、运动处方制定、睡眠质量评估、体检报告解读、心理健康自测。',
    avatar: '💪',
  },
  {
    id: 'research-assistant',
    name: '学术研究助手',
    category: '学术',
    skillsCount: 9,
    description: '文献检索与综述、论文润色、引用格式转换、研究假设生成、实验设计建议。',
    avatar: '🎓',
  },
  {
    id: 'fullstack-dev',
    name: '全栈工程师',
    category: '技术',
    skillsCount: 15,
    description: '前后端开发、数据库设计、API 架构、DevOps 部署、代码审查、性能优化、安全防护。',
    avatar: '💻',
  },
  {
    id: 'edu-tutor',
    name: '教育辅导老师',
    category: '教育',
    skillsCount: 11,
    description: '课程设计、习题生成、知识点讲解、学习路径规划、考试出题、作文批改。',
    avatar: '📚',
  },
  {
    id: 'medical-consultant',
    name: '医疗健康顾问',
    category: '医疗健康',
    skillsCount: 6,
    description: '症状初步分析、就医指导、用药提醒、健康档案跟踪、医学科普内容生成。',
    avatar: '🏥',
  },
  {
    id: 'hr-specialist',
    name: '人力行政专家',
    category: '人力行政',
    skillsCount: 8,
    description: '招聘 JD 编写、面试题库、薪酬分析、绩效考核方案、劳动合同审查、员工关系处理。',
    avatar: '👥',
  },
  {
    id: 'video-producer',
    name: '影视媒体策划',
    category: '影视媒体',
    skillsCount: 9,
    description: '分镜脚本撰写、视频剪辑方案、配音字幕生成、宣发文案策划、数据分析报告。',
    avatar: '🎬',
  },
  {
    id: 'ui-designer',
    name: 'UI/UX 设计师',
    category: '设计',
    skillsCount: 7,
    description: '界面原型设计、设计规范输出、配色方案推荐、交互流程优化、图标设计建议。',
    avatar: '🎨',
  },
  {
    id: 'financial-planner',
    name: '理财规划师',
    category: '金融',
    skillsCount: 8,
    description: '个人资产配置、基金组合推荐、保险方案定制、税务筹划建议、退休规划分析。',
    avatar: '💰',
  },
]

const DOWNLOAD_BASE = 'https://gitee.com/njydsz/ydsz-worker/tree/main/infra/agents/experts/library'

export default function ExpertsPage() {
  const [activeCategory, setActiveCategory] = useState<string>('全部')

  const filtered =
    activeCategory === '全部'
      ? EXPERTS
      : EXPERTS.filter((e) => e.category === activeCategory)

  return (
    <div className="py-16 lg:py-24">
      <div className="container-page">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="section-label mb-4">专家市场</span>
          <h1 className="heading-xl mt-4 mb-3">
            <span className="text-gradient">专家市场</span>
          </h1>
          <p className="text-white/60 text-lg">
            共 {EXPERTS.length} 个专家 · 即装即用 · 持续更新
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
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

        {/* Expert Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((expert) => (
            <div
              key={expert.id}
              className="card-glass p-6 group hover:-translate-y-1 transition-all duration-300 hover:border-yuanbao-500/30"
            >
              {/* Avatar + Name */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-yuanbao-500/10 border border-yuanbao-500/20 flex items-center justify-center text-2xl shrink-0">
                  {expert.avatar}
                </div>
                <div className="min-w-0">
                  <h3 className="text-white font-semibold truncate">{expert.name}</h3>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-yuanbao-500/10 text-yuanbao-400 text-xs border border-yuanbao-500/20">
                    {expert.category}
                  </span>
                </div>
              </div>

              {/* Skills Count */}
              <div className="text-sm text-white/50 mb-3">
                <span className="text-yuanbao-400 font-medium">{expert.skillsCount}</span> 个技能
              </div>

              {/* Description */}
              <p className="text-white/60 text-sm leading-relaxed mb-5 line-clamp-3">
                {expert.description}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <Link
                  to={`/experts/${expert.id}`}
                  className="btn-secondary text-sm !px-4 !py-2"
                >
                  详情
                </Link>
                <a
                  href={`${DOWNLOAD_BASE}/${expert.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary text-sm !px-4 !py-2"
                >
                  下载
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-white/40">
            该分类暂无专家
          </div>
        )}
      </div>
    </div>
  )
}
