import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'

interface Plugin {
  id: string
  name: string
  icon: string
  version: string
  category: string
  description: string
  author: string
  downloads: string
}

const CATEGORIES = [
  '全部',
  '工具',
  '资讯',
  '生活',
  '影音',
  '游戏',
  '趣味',
  '运维',
  '财经',
] as const

const PLUGINS: Plugin[] = [
  {
    id: 'arxiv-search',
    name: 'arXiv 论文查询',
    icon: '📄',
    version: 'v0.1.0',
    category: '工具',
    description: '搜索和查询 arXiv 学术论文，获取摘要、作者、引用信息。',
    author: 'Ydsz Team',
    downloads: '3.2k',
  },
  {
    id: 'github-trending',
    name: 'GitHub 趋势',
    icon: '🔥',
    version: 'v0.1.0',
    category: '资讯',
    description: '实时追踪 GitHub 热门开源项目趋势，按语言和时间维度筛选。',
    author: 'Ydsz Team',
    downloads: '5.1k',
  },
  {
    id: 'ip-lookup',
    name: 'IP 查询',
    icon: '🌐',
    version: 'v0.1.0',
    category: '工具',
    description: '查询 IP 地址归属地、ISP 信息、经纬度定位。',
    author: 'Ydsz Team',
    downloads: '8.7k',
  },
  {
    id: 'qrcode-gen',
    name: '二维码生成',
    icon: '🔲',
    version: 'v0.2.2',
    category: '工具',
    description: '生成自定义样式二维码，支持颜色、尺寸、Logo 嵌入。',
    author: 'Ydsz Team',
    downloads: '11.4k',
  },
  {
    id: 'what-to-eat',
    name: '今天吃什么',
    icon: '🍱',
    version: 'v0.1.0',
    category: '生活',
    description: '智能推荐今日餐食，支持随机选择、口味偏好、食材限制。',
    author: 'Ydsz Team',
    downloads: '18.9k',
  },
  {
    id: 'tetris',
    name: '俄罗斯方块',
    icon: '🎮',
    version: 'v0.2.2',
    category: '游戏',
    description: '经典俄罗斯方块游戏，支持分数记录、等级提升、排行榜。',
    author: 'Ydsz Team',
    downloads: '6.3k',
  },
  {
    id: 'unit-converter',
    name: '单位换算',
    icon: '📐',
    version: 'v0.1.0',
    category: '工具',
    description: '长度/重量/温度/面积/体积/速度等数十种单位互转。',
    author: 'Ydsz Team',
    downloads: '9.8k',
  },
  {
    id: 'bilibili-bangumi',
    name: '哔哩哔哩番剧',
    icon: '📺',
    version: 'v0.2.4',
    category: '影音',
    description: '查询 B 站番剧更新、追番列表、新番时间表、热门点评。',
    author: 'Ydsz Team',
    downloads: '14.2k',
  },
  {
    id: 'weather',
    name: '天气',
    icon: '🌤️',
    version: 'v0.2.2',
    category: '生活',
    description: '全球城市天气查询，支持 7 日预报、空气质量、穿衣建议。',
    author: 'Ydsz Team',
    downloads: '22.1k',
  },
  {
    id: 'mini-games',
    name: '小游戏合集',
    icon: '🕹️',
    version: 'v0.2.2',
    category: '游戏',
    description: '贪吃蛇、2048、数独、扫雷等 10+ 怀旧小游戏合集。',
    author: 'Ydsz Team',
    downloads: '7.6k',
  },
  {
    id: 'movie-search',
    name: '影视搜索',
    icon: '🎬',
    version: 'v0.1.0',
    category: '影音',
    description: '搜索电影/电视剧信息，聚合豆瓣评分、播放平台、预告片。',
    author: 'Ydsz Team',
    downloads: '4.5k',
  },
  {
    id: 'express-tracker',
    name: '快递查询',
    icon: '📦',
    version: 'v0.2.2',
    category: '生活',
    description: '支持主流快递公司物流信息实时追踪、签收提醒。',
    author: 'Ydsz Team',
    downloads: '16.8k',
  },
  {
    id: 'fortune-draw',
    name: '抽签运势',
    icon: '🎴',
    version: 'v0.2.2',
    category: '趣味',
    description: '每日一签、星座运势、生肖配对、塔罗牌趣味占卜。',
    author: 'Ydsz Team',
    downloads: '19.3k',
  },
  {
    id: 'slacking-calendar',
    name: '摸鱼日历',
    icon: '🐟',
    version: 'v0.1.0',
    category: '趣味',
    description: '距离下次放假还有多久？聚合所有假期、调休、节日信息。',
    author: 'Ydsz Team',
    downloads: '25.7k',
  },
  {
    id: 'server-monitor',
    name: '服务器监控',
    icon: '🖥️',
    version: 'v0.2.2',
    category: '运维',
    description: 'Linux/Windows 服务器 CPU/内存/磁盘/网络实时监控告警。',
    author: 'Ydsz Team',
    downloads: '8.9k',
  },
  {
    id: 'daily-english',
    name: '每日英语',
    icon: '📖',
    version: 'v0.1.0',
    category: '工具',
    description: '每日一句英文名言，附带翻译、发音、例句和文化背景。',
    author: 'Ydsz Team',
    downloads: '12.0k',
  },
  {
    id: 'hot-list',
    name: '热榜汇总',
    icon: '🔝',
    version: 'v0.2.2',
    category: '资讯',
    description: '微博/知乎/百度/B站/抖音 多平台热搜榜单聚合浏览。',
    author: 'Ydsz Team',
    downloads: '20.4k',
  },
  {
    id: 'pomodoro',
    name: '番茄钟',
    icon: '🍅',
    version: 'v0.2.2',
    category: '工具',
    description: '番茄工作法计时器，支持自定义时长、统计报表、习惯养成。',
    author: 'Ydsz Team',
    downloads: '10.6k',
  },
  {
    id: 'short-url',
    name: '短链接生成',
    icon: '🔗',
    version: 'v0.1.0',
    category: '工具',
    description: '将长链接转为短链接，支持自定义后缀、访问统计、有效期设置。',
    author: 'Ydsz Team',
    downloads: '13.2k',
  },
  {
    id: 'wikipedia',
    name: '维基百科',
    icon: '📚',
    version: 'v0.1.0',
    category: '工具',
    description: '查询维基百科词条摘要、多语言版本、相关词条推荐。',
    author: 'Ydsz Team',
    downloads: '7.4k',
  },
  {
    id: 'market-quotes',
    name: '行情查询',
    icon: '📈',
    version: 'v0.2.2',
    category: '财经',
    description: 'A股/港股/美股/加密货币实时行情、自选股管理、异动提醒。',
    author: 'Ydsz Team',
    downloads: '15.1k',
  },
  {
    id: 'sticker-gen',
    name: '表情包生成',
    icon: '😂',
    version: 'v0.1.0',
    category: '趣味',
    description: 'AI 自动生成表情包，热门模板库、自定义文字、GIF 制作。',
    author: 'Ydsz Team',
    downloads: '28.6k',
  },
  {
    id: 'live-scores',
    name: '赛事比分',
    icon: '⚽',
    version: 'v0.1.0',
    category: '资讯',
    description: '足球/篮球/电竞等主流赛事实时比分、赛程、积分榜数据。',
    author: 'Ydsz Team',
    downloads: '5.9k',
  },
  {
    id: 'fun-encyclopedia',
    name: '趣味百科',
    icon: '🧠',
    version: 'v0.1.0',
    category: '趣味',
    description: '冷知识百科、世界之最、未解之谜、奇闻趣事每日一读。',
    author: 'Ydsz Team',
    downloads: '4.1k',
  },
  {
    id: 'color-converter',
    name: '颜色转换',
    icon: '🎨',
    version: 'v0.1.0',
    category: '工具',
    description: 'HEX/RGB/HSL/CMYK 等颜色格式互转，调色板生成。',
    author: 'Ydsz Team',
    downloads: '6.8k',
  },
]

const DOWNLOAD_BASE = 'https://gitee.com/njydsz/ydsz-worker/tree/main/plugins'

const PLUGIN_GRADIENTS = [
  'from-violet-500/20 to-indigo-500/20',
  'from-blue-500/20 to-cyan-500/20',
  'from-emerald-500/20 to-teal-500/20',
  'from-orange-500/20 to-red-500/20',
  'from-pink-500/20 to-purple-500/20',
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

export default function PluginsPage() {
  const [activeCategory, setActiveCategory] = useState<string>('全部')
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = useMemo(() => {
    let result = PLUGINS
    if (activeCategory !== '全部') {
      result = result.filter((p) => p.category === activeCategory)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
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
            <span className="section-label">插件市场</span>
            <span className="px-2.5 py-0.5 rounded-full bg-yuanbao-500/10 border border-yuanbao-500/20 text-yuanbao-400 text-xs font-semibold">
              {PLUGINS.length} 个插件
            </span>
          </div>
          <h1 className="heading-xl mt-4 mb-3">
            <span className="text-gradient">插件市场</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            轻量级功能扩展插件，覆盖工具、生活、资讯、娱乐等场景。一键安装，即装即用。
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
              placeholder="搜索插件..."
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

        {/* Plugin Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((plugin) => {
            const gradientBg = PLUGIN_GRADIENTS[hashString(plugin.id) % PLUGIN_GRADIENTS.length]
            return (
              <div
                key={plugin.id}
                className="card-glow p-6 overflow-hidden relative group"
              >
                {/* Background Gradient Blob */}
                <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${gradientBg} rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500`} />

                {/* Icon + Name + Version */}
                <div className="relative flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-yuanbao-500/10 border border-yuanbao-500/20 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                    {plugin.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-white font-semibold truncate group-hover:text-yuanbao-300 transition-colors">
                      {plugin.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-white/40 font-mono">{plugin.version}</span>
                      <span className="text-white/20">·</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-yuanbao-500/10 text-yuanbao-400 text-xs border border-yuanbao-500/20">
                        {plugin.category}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="relative text-white/55 text-sm leading-relaxed mb-4 line-clamp-2">
                  {plugin.description}
                </p>

                {/* Meta */}
                <div className="relative flex items-center justify-between text-xs text-white/40 mb-5">
                  <span>by {plugin.author}</span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    {plugin.downloads}
                  </span>
                </div>

                {/* Actions */}
                <div className="relative flex items-center gap-3">
                  <Link
                    to={`/plugins/${plugin.id}`}
                    className="btn-secondary text-sm !px-4 !py-2"
                  >
                    详情
                  </Link>
                  <a
                    href={`${DOWNLOAD_BASE}/${plugin.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary text-sm !px-4 !py-2"
                  >
                    下载
                  </a>
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
            <p className="text-lg mb-2">未找到匹配的插件</p>
            <p className="text-sm">试试其他关键词或分类</p>
          </div>
        )}
      </div>
    </div>
  )
}
