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
  '生活',
  '资讯',
  '财经',
  '影音',
  '趣味',
  '游戏',
  '工具',
  '运维',
] as const

const PLUGINS: Plugin[] = [
  {
    id: 'weather-forecast',
    name: '天气预报',
    icon: '🌤️',
    version: 'v2.1.0',
    category: '生活',
    description: '全球城市天气查询，支持7日预报、空气质量、穿衣建议、紫外线指数。',
    author: 'Ydsz Team',
    downloads: '12.3k',
  },
  {
    id: 'news-aggregator',
    name: '今日要闻',
    icon: '📰',
    version: 'v1.5.2',
    category: '资讯',
    description: '聚合多源新闻，AI 摘要提炼，个性化推荐，语音播报支持。',
    author: 'Ydsz Team',
    downloads: '8.7k',
  },
  {
    id: 'stock-tracker',
    name: '股票追踪',
    icon: '📈',
    version: 'v1.8.0',
    category: '财经',
    description: 'A股/港股/美股实时行情，自选股管理，异动提醒，K线分析。',
    author: 'Quant Plug',
    downloads: '15.2k',
  },
  {
    id: 'music-player',
    icon: '🎵',
    name: '云音乐播放器',
    version: 'v1.3.1',
    category: '影音',
    description: '多平台音乐搜索播放，歌单导入，歌词同步，智能推荐算法。',
    author: 'AudioLab',
    downloads: '9.1k',
  },
  {
    id: 'meme-generator',
    name: '表情包工厂',
    icon: '😂',
    version: 'v2.0.3',
    category: '趣味',
    description: 'AI 自动生成表情包，热门模板库，自定义文字，GIF 制作。',
    author: 'Fun Dev',
    downloads: '22.6k',
  },
  {
    id: 'pixel-adventure',
    name: '像素冒险',
    icon: '🎮',
    version: 'v1.1.0',
    category: '游戏',
    description: '像素风 Roguelike，支持存档、成就系统、每日挑战。',
    author: 'Pixel Studio',
    downloads: '6.4k',
  },
  {
    id: 'json-formatter',
    name: 'JSON 工具箱',
    icon: '🧰',
    version: 'v3.2.1',
    category: '工具',
    description: 'JSON 格式化、压缩、校验、转换、Schema 生成、Diff 比对。',
    author: 'DevTools',
    downloads: '31.8k',
  },
  {
    id: 'docker-manager',
    name: 'Docker 运维助手',
    icon: '🐳',
    version: 'v1.6.0',
    category: '运维',
    description: '容器状态监控、镜像管理、日志查看、Compose 文件生成。',
    author: 'Ops Master',
    downloads: '7.9k',
  },
  {
    id: 'recipe-book',
    name: '智能菜谱',
    icon: '🍳',
    version: 'v2.4.0',
    category: '生活',
    description: '根据现有食材推荐菜谱，步骤详解，营养分析，购物清单生成。',
    author: 'Foodie Lab',
    downloads: '18.5k',
  },
  {
    id: 'crypto-radar',
    name: '加密货币雷达',
    icon: '₿',
    version: 'v1.2.3',
    category: '财经',
    description: 'BTC/ETH 等实时价格，链上数据分析，巨鲸追踪，情绪指数。',
    author: 'Crypto Watch',
    downloads: '11.0k',
  },
  {
    id: 'movie-recommend',
    name: '影视推荐官',
    icon: '🍿',
    version: 'v1.4.1',
    category: '影音',
    description: '基于口味推荐影片，豆瓣/IMDb 评分聚合，片单管理，排期提醒。',
    author: 'CineMatch',
    downloads: '5.6k',
  },
  {
    id: 'markdown-editor',
    name: 'Markdown 编辑器',
    icon: '📝',
    version: 'v2.3.0',
    category: '工具',
    description: '实时预览、目录导航、表格编辑、Mermaid 图表、导出 PDF。',
    author: 'Writers Hub',
    downloads: '28.4k',
  },
  {
    id: 'server-monitor',
    name: '服务器监控',
    icon: '🖥️',
    version: 'v1.7.2',
    category: '运维',
    description: 'CPU/内存/磁盘/网络实时监控，告警规则配置，历史趋势图。',
    author: 'Ops Master',
    downloads: '10.3k',
  },
  {
    id: 'daily-quote',
    name: '每日一言',
    icon: '💬',
    version: 'v1.0.8',
    category: '趣味',
    description: '精选中英文励志名言，每日推送，分类浏览，收藏分享。',
    author: 'Inspire Me',
    downloads: '14.7k',
  },
  {
    id: 'rss-reader',
    name: 'RSS 阅读器',
    icon: '📡',
    version: 'v1.9.0',
    category: '资讯',
    description: '订阅管理、全文抓取、关键词过滤、AI 摘要、OPML 导入导出。',
    author: 'FeedFlow',
    downloads: '8.2k',
  },
  {
    id: 'chess-master',
    name: '象棋对弈',
    icon: '♟️',
    version: 'v1.3.4',
    category: '游戏',
    description: '中国象棋人机对弈，残局挑战，棋谱回放，棋力评测。',
    author: 'Game Forge',
    downloads: '4.9k',
  },
]

const DOWNLOAD_BASE = 'https://gitee.com/njydsz/ydsz-worker/tree/main/plugins'

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
          p.author.toLowerCase().includes(q)
      )
    }
    return result
  }, [activeCategory, searchQuery])

  return (
    <div className="py-16 lg:py-24">
      <div className="container-page">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="section-label mb-4">插件市场</span>
          <h1 className="heading-xl mt-4 mb-3">
            <span className="text-gradient">插件市场</span>
          </h1>
          <p className="text-white/60 text-lg">
            共 {PLUGINS.length} 个插件 · 一键安装 · 无限可能
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
          {filtered.map((plugin) => (
            <div
              key={plugin.id}
              className="card-glass p-6 group hover:-translate-y-1 transition-all duration-300 hover:border-yuanbao-500/30"
            >
              {/* Icon + Name + Version */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-yuanbao-500/10 border border-yuanbao-500/20 flex items-center justify-center text-2xl shrink-0">
                  {plugin.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-white font-semibold truncate">{plugin.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-white/40 font-mono">{plugin.version}</span>
                    <span className="text-white/20">·</span>
                    <span className="inline-block px-2 py-0.5 rounded-full bg-yuanbao-500/10 text-yuanbao-400 text-xs border border-yuanbao-500/20">
                      {plugin.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-white/60 text-sm leading-relaxed mb-4 line-clamp-2">
                {plugin.description}
              </p>

              {/* Meta */}
              <div className="flex items-center justify-between text-xs text-white/40 mb-5">
                <span>by {plugin.author}</span>
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  {plugin.downloads}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
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
          ))}
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-white/40">
            <p className="text-lg mb-2">未找到匹配的插件</p>
            <p className="text-sm">试试其他关键词或分类</p>
          </div>
        )}
      </div>
    </div>
  )
}
