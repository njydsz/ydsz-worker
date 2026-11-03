import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import SectionDivider from '../components/SectionDivider'
import { useLanguage } from '../context/LanguageContext'

/* ═══════════════════════════════════════════
   Types
   ═══════════════════════════════════════════ */

interface MarketplaceItem {
  id: string
  name: string
  description: string
  author: string
  downloads: string
  category: string
  badge?: string
}

type TabKey = 'all' | 'experts' | 'skills' | 'plugins' | 'connectors'

/* ═══════════════════════════════════════════
   Data — Experts (24)
   ═══════════════════════════════════════════ */

const EXPERTS: MarketplaceItem[] = [
  { id: 'quant-analyst', name: '量化分析师', description: '股票、期货、加密货币市场分析，量化策略回测，技术指标计算，风险评估报告生成。', author: 'Ydsz Team', downloads: '2.1k', category: '金融', badge: '8 技能' },
  { id: 'investment-researcher', name: '投资研究专家', description: '基本面分析、行业研究、估值模型构建、财报解读、投资建议报告撰写。', author: 'Ydsz Team', downloads: '1.8k', category: '金融', badge: '11 技能' },
  { id: 'content-creator', name: '内容创作大师', description: '爆款文章撰写、短视频脚本、社交媒体运营、SEO 优化、标题党生成、热点追踪。', author: 'Ydsz Team', downloads: '3.4k', category: '内容创作', badge: '12 技能' },
  { id: 'short-video-script', name: '短视频脚本师', description: '抖音/TikTok/Reels 短视频脚本创作、分镜设计、爆款公式拆解、数据分析指导。', author: 'Ydsz Team', downloads: '2.7k', category: '内容创作', badge: '8 技能' },
  { id: 'life-coach', name: '生活管家', description: '旅行规划、餐厅推荐、日程管理、购物比价、菜谱生成、家居收纳建议。', author: 'Ydsz Team', downloads: '4.2k', category: '生活', badge: '10 技能' },
  { id: 'food-explorer', name: '美食探索家', description: '全球美食推荐、菜谱定制、食材搭配建议、餐厅探店指南、饮食文化介绍。', author: 'Ydsz Team', downloads: '3.1k', category: '生活', badge: '7 技能' },
  { id: 'health-advisor', name: '健康顾问', description: '饮食营养分析、运动处方制定、睡眠质量评估、体检报告解读、心理健康自测。', author: 'Ydsz Team', downloads: '5.6k', category: '健康', badge: '7 技能' },
  { id: 'fitness-coach', name: '健身教练', description: '增肌减脂健身计划、动作指导、训练强度评估、运动损伤预防、补剂建议。', author: 'Ydsz Team', downloads: '4.8k', category: '健康', badge: '5 技能' },
  { id: 'research-assistant', name: '学术研究助手', description: '文献检索与综述、论文润色、引用格式转换、研究假设生成、实验设计建议。', author: 'Ydsz Team', downloads: '3.9k', category: '学术', badge: '9 技能' },
  { id: 'thesis-mentor', name: '论文写作导师', description: '本硕博论文选题指导、结构优化、方法论润色、查重降重策略、答辩准备辅导。', author: 'Ydsz Team', downloads: '4.5k', category: '学术', badge: '6 技能' },
  { id: 'fullstack-dev', name: '全栈工程师', description: '前后端开发、数据库设计、API 架构、DevOps 部署、代码审查、性能优化、安全防护。', author: 'Ydsz Team', downloads: '6.3k', category: '技术', badge: '15 技能' },
  { id: 'devops-engineer', name: '运维工程师', description: 'Linux 系统管理、Kubernetes 集群运维、Docker 容器化、CI/CD 流水线搭建。', author: 'Ydsz Team', downloads: '3.7k', category: '技术', badge: '10 技能' },
  { id: 'edu-tutor', name: '教育辅导老师', description: '课程设计、习题生成、知识点讲解、学习路径规划、考试出题、作文批改。', author: 'Ydsz Team', downloads: '5.2k', category: '教育', badge: '8 技能' },
  { id: 'course-designer', name: '在线课程设计师', description: 'MOOC 课程设计、课件制作、互动练习设计、学习效果评估、教学视频脚本。', author: 'Ydsz Team', downloads: '2.4k', category: '教育', badge: '6 技能' },
  { id: 'medical-doctor', name: '基层医生助手', description: '临床指南检索、症状分析、鉴别诊断辅助、用药提醒、慢性病管理、健康宣教。', author: 'Ydsz Team', downloads: '3.3k', category: '医疗健康', badge: '13 技能' },
  { id: 'pharmacy-advisor', name: '药学顾问', description: '药品说明书解读、药物相互作用审查、用药剂量计算、特殊人群用药指导。', author: 'Ydsz Team', downloads: '1.9k', category: '医疗健康', badge: '7 技能' },
  { id: 'recruitment-expert', name: '招聘专家', description: '招聘 JD 编写、候选人筛选、面试评估体系设计、薪酬谈判策略、人才库管理。', author: 'Ydsz Team', downloads: '2.8k', category: '人力行政', badge: '8 技能' },
  { id: 'office-automation', name: '办公自动化专家', description: 'Word 文档自动化、Excel 报表生成、PPT 批量制作、PDF 处理、OCR 识别。', author: 'Ydsz Team', downloads: '7.1k', category: '人力行政', badge: '6 技能' },
  { id: 'trending-reporter', name: '热点记者', description: '微博/抖音/知乎/B站/小红书 70+ 平台热点追踪、新闻稿件撰写、事件脉络梳理。', author: 'Ydsz Team', downloads: '8.9k', category: '影视媒体', badge: '1 技能' },
  { id: 'film-commentary', name: '影视解说', description: '电影/电视剧/纪录片解说文稿撰写、深度影评分析、票房/收视率预测报告。', author: 'Ydsz Team', downloads: '3.6k', category: '影视媒体', badge: '3 技能' },
  { id: 'ui-designer', name: 'UI 设计师', description: '界面原型设计、设计规范输出、配色方案推荐、交互流程优化、图标设计建议。', author: 'Ydsz Team', downloads: '4.1k', category: '设计', badge: '7 技能' },
  { id: 'brand-designer', name: '品牌设计师', description: '品牌 VI 设计、Logo 方案提案、字体搭配建议、品牌故事撰写、延展物料规范。', author: 'Ydsz Team', downloads: '2.5k', category: '设计', badge: '6 技能' },
  { id: 'legal-advisor', name: '法律顾问', description: '合同审查、法律文书起草、企业合规咨询、劳动纠纷分析、知识产权指导。', author: 'Ydsz Team', downloads: '3.0k', category: '金融', badge: '9 技能' },
  { id: 'data-analyst', name: '数据分析师', description: '数据清洗、统计分析、可视化报表、AB 测试、业务洞察报告生成。', author: 'Ydsz Team', downloads: '5.4k', category: '技术', badge: '12 技能' },
]

/* ═══════════════════════════════════════════
   Data — Skills (16)
   ═══════════════════════════════════════════ */

const SKILLS: MarketplaceItem[] = [
  { id: 'summarize', name: '文本摘要', description: '智能提取长文本核心概要，支持多语言、多长度档位，保留关键信息。', author: 'Ydsz Team', downloads: '12.3k', category: '文本处理', badge: 'NLP' },
  { id: 'translate', name: '智能翻译', description: '中英日韩法德等 50+ 语言互译，支持领域术语定制、上下文感知翻译。', author: 'Ydsz Team', downloads: '18.7k', category: '文本处理', badge: 'NLP' },
  { id: 'sentiment', name: '情感分析', description: '分析文本情绪倾向（正/负/中性），输出置信度分数，适用评论监控、舆情分析。', author: 'Ydsz Team', downloads: '7.2k', category: '文本处理', badge: 'NLP' },
  { id: 'code-review', name: '代码审查', description: '自动审查代码质量、发现潜在 Bug、安全漏洞、性能瓶颈，给出改进建议。', author: 'Ydsz Team', downloads: '9.5k', category: '开发', badge: 'Dev' },
  { id: 'unit-test', name: '单元测试生成', description: '根据源码自动生成覆盖核心路径的单元测试用例，支持主流测试框架。', author: 'Ydsz Team', downloads: '6.1k', category: '开发', badge: 'Dev' },
  { id: 'regex', name: '正则表达式', description: '根据自然语言描述生成正则表达式，附带解释、测试用例、常见变体。', author: 'Ydsz Team', downloads: '4.8k', category: '开发', badge: 'Dev' },
  { id: 'extract', name: '信息抽取', description: '从非结构化文本中抽取指定字段（人名/日期/金额/地址等），输出结构化 JSON。', author: 'Ydsz Team', downloads: '8.3k', category: '文本处理', badge: 'NLP' },
  { id: 'data-clean', name: '数据清洗', description: '自动去重、格式标准化、缺失值处理、异常检测，支持 CSV/JSON/Excel。', author: 'Ydsz Team', downloads: '11.0k', category: '数据', badge: 'Data' },
  { id: 'classify', name: '文本分类', description: '基于自定义标签体系对文本自动分类，支持层级分类、多标签输出。', author: 'Ydsz Team', downloads: '5.6k', category: '文本处理', badge: 'NLP' },
  { id: 'ner', name: '命名实体识别', description: '识别文本中的人名、地名、机构名、时间、金额等实体，支持自定义实体类型。', author: 'Ydsz Team', downloads: '4.2k', category: '文本处理', badge: 'NLP' },
  { id: 'doc-qa', name: '文档问答', description: '上传 PDF/Word/TXT 文档后针对内容提问，给出精确引用和详细解释。', author: 'Ydsz Team', downloads: '15.4k', category: '知识管理', badge: 'RAG' },
  { id: 'kb-rag', name: '知识库 RAG', description: '构建向量知识库，支持文档混合检索、重排序、引用溯源、增量更新。', author: 'Ydsz Team', downloads: '13.8k', category: '知识管理', badge: 'RAG' },
  { id: 'web-search', name: '联网搜索', description: '实时搜索互联网信息，聚合多源结果，附带来源链接和摘要说明。', author: 'Ydsz Team', downloads: '20.2k', category: '工具', badge: 'Tool' },
  { id: 'math-solver', name: '数学解题', description: '分步求解代数、微积分、概率统计等数学问题，附带公式推导和验证。', author: 'Ydsz Team', downloads: '14.6k', category: '知识管理', badge: 'NLP' },
  { id: 'image-gen', name: '图像生成', description: '根据文字描述生成高质量插画、海报、头像，支持多种风格切换。', author: 'Ydsz Team', downloads: '22.1k', category: '创作', badge: 'Gen' },
  { id: 'speech', name: '语音合成', description: '多语种 TTS 语音合成，支持情感语调、语速调节、多发音人选择。', author: 'Ydsz Team', downloads: '8.9k', category: '创作', badge: 'Gen' },
]

/* ═══════════════════════════════════════════
   Data — Plugins (28)
   ═══════════════════════════════════════════ */

const PLUGINS: MarketplaceItem[] = [
  { id: 'arxiv-search', name: 'arXiv 论文查询', description: '搜索和查询 arXiv 学术论文，获取摘要、作者、引用信息。', author: 'Ydsz Team', downloads: '3.2k', category: '工具', badge: 'v0.1.0' },
  { id: 'github-trending', name: 'GitHub 趋势', description: '实时追踪 GitHub 热门开源项目趋势，按语言和时间维度筛选。', author: 'Ydsz Team', downloads: '5.1k', category: '资讯', badge: 'v0.1.0' },
  { id: 'ip-lookup', name: 'IP 查询', description: '查询 IP 地址归属地、ISP 信息、经纬度定位。', author: 'Ydsz Team', downloads: '8.7k', category: '工具', badge: 'v0.1.0' },
  { id: 'qrcode-gen', name: '二维码生成', description: '生成自定义样式二维码，支持颜色、尺寸、Logo 嵌入。', author: 'Ydsz Team', downloads: '11.4k', category: '工具', badge: 'v0.2.2' },
  { id: 'what-to-eat', name: '今天吃什么', description: '智能推荐今日餐食，支持随机选择、口味偏好、食材限制。', author: 'Ydsz Team', downloads: '18.9k', category: '生活', badge: 'v0.1.0' },
  { id: 'tetris', name: '俄罗斯方块', description: '经典俄罗斯方块游戏，支持分数记录、等级提升、排行榜。', author: 'Ydsz Team', downloads: '6.3k', category: '游戏', badge: 'v0.2.2' },
  { id: 'unit-converter', name: '单位换算', description: '长度/重量/温度/面积/体积/速度等数十种单位互转。', author: 'Ydsz Team', downloads: '9.8k', category: '工具', badge: 'v0.1.0' },
  { id: 'bilibili-bangumi', name: '哔哩哔哩番剧', description: '查询 B 站番剧更新、追番列表、新番时间表、热门点评。', author: 'Ydsz Team', downloads: '14.2k', category: '影音', badge: 'v0.2.4' },
  { id: 'weather', name: '天气', description: '全球城市天气查询，支持 7 日预报、空气质量、穿衣建议。', author: 'Ydsz Team', downloads: '22.1k', category: '生活', badge: 'v0.2.2' },
  { id: 'mini-games', name: '小游戏合集', description: '贪吃蛇、2048、数独、扫雷等 10+ 怀旧小游戏合集。', author: 'Ydsz Team', downloads: '7.6k', category: '游戏', badge: 'v0.2.2' },
  { id: 'movie-search', name: '影视搜索', description: '搜索电影/电视剧信息，聚合豆瓣评分、播放平台、预告片。', author: 'Ydsz Team', downloads: '4.5k', category: '影音', badge: 'v0.1.0' },
  { id: 'express-tracker', name: '快递查询', description: '支持主流快递公司物流信息实时追踪、签收提醒。', author: 'Ydsz Team', downloads: '16.8k', category: '生活', badge: 'v0.2.2' },
  { id: 'fortune-draw', name: '抽签运势', description: '每日一签、星座运势、生肖配对、塔罗牌趣味占卜。', author: 'Ydsz Team', downloads: '19.3k', category: '趣味', badge: 'v0.2.2' },
  { id: 'slacking-calendar', name: '摸鱼日历', description: '距离下次放假还有多久？聚合所有假期、调休、节日信息。', author: 'Ydsz Team', downloads: '25.7k', category: '趣味', badge: 'v0.1.0' },
  { id: 'server-monitor', name: '服务器监控', description: 'Linux/Windows 服务器 CPU/内存/磁盘/网络实时监控告警。', author: 'Ydsz Team', downloads: '8.9k', category: '运维', badge: 'v0.2.2' },
  { id: 'daily-english', name: '每日英语', description: '每日一句英文名言，附带翻译、发音、例句和文化背景。', author: 'Ydsz Team', downloads: '12.0k', category: '工具', badge: 'v0.1.0' },
  { id: 'hot-list', name: '热榜汇总', description: '微博/知乎/百度/B站/抖音 多平台热搜榜单聚合浏览。', author: 'Ydsz Team', downloads: '20.4k', category: '资讯', badge: 'v0.2.2' },
  { id: 'pomodoro', name: '番茄钟', description: '番茄工作法计时器，支持自定义时长、统计报表、习惯养成。', author: 'Ydsz Team', downloads: '10.6k', category: '工具', badge: 'v0.2.2' },
  { id: 'short-url', name: '短链接生成', description: '将长链接转为短链接，支持自定义后缀、访问统计、有效期设置。', author: 'Ydsz Team', downloads: '13.2k', category: '工具', badge: 'v0.1.0' },
  { id: 'wikipedia', name: '维基百科', description: '查询维基百科词条摘要、多语言版本、相关词条推荐。', author: 'Ydsz Team', downloads: '7.4k', category: '工具', badge: 'v0.1.0' },
  { id: 'market-quotes', name: '行情查询', description: 'A股/港股/美股/加密货币实时行情、自选股管理、异动提醒。', author: 'Ydsz Team', downloads: '15.1k', category: '财经', badge: 'v0.2.2' },
  { id: 'sticker-gen', name: '表情包生成', description: 'AI 自动生成表情包，热门模板库、自定义文字、GIF 制作。', author: 'Ydsz Team', downloads: '28.6k', category: '趣味', badge: 'v0.1.0' },
  { id: 'live-scores', name: '赛事比分', description: '足球/篮球/电竞等主流赛事实时比分、赛程、积分榜数据。', author: 'Ydsz Team', downloads: '5.9k', category: '资讯', badge: 'v0.1.0' },
  { id: 'fun-encyclopedia', name: '趣味百科', description: '冷知识百科、世界之最、未解之谜、奇闻趣事每日一读。', author: 'Ydsz Team', downloads: '4.1k', category: '趣味', badge: 'v0.1.0' },
  { id: 'color-converter', name: '颜色转换', description: 'HEX/RGB/HSL/CMYK 等颜色格式互转，调色板生成。', author: 'Ydsz Team', downloads: '6.8k', category: '工具', badge: 'v0.1.0' },
  { id: 'calendar', name: '日历日程', description: '查看和管理日历事项，支持农历、节气、节假日标注提醒。', author: 'Ydsz Team', downloads: '11.5k', category: '工具', badge: 'v0.1.0' },
  { id: 'translator-voice', name: '语音翻译', description: '实时语音翻译，支持对话模式、同声传译、文字转写。', author: 'Ydsz Team', downloads: '9.3k', category: '工具', badge: 'v0.1.0' },
  { id: 'currency', name: '汇率换算', description: '全球 150+ 货币实时汇率查询，历史走势图、批量换算。', author: 'Ydsz Team', downloads: '7.8k', category: '财经', badge: 'v0.1.0' },
]

/* ═══════════════════════════════════════════
   Data — Connectors (10)
   ═══════════════════════════════════════════ */

const CONNECTORS: MarketplaceItem[] = [
  { id: 'feishu', name: '飞书', description: '接入飞书群聊/私聊，支持消息收发、卡片交互、文档机器人。', author: 'Ydsz Team', downloads: '15.2k', category: '即时通讯', badge: 'IM' },
  { id: 'dingtalk', name: '钉钉', description: '接入钉钉群机器人，支持工作通知、卡片消息、审批流回调。', author: 'Ydsz Team', downloads: '12.8k', category: '即时通讯', badge: 'IM' },
  { id: 'wecom', name: '企业微信', description: '接入企业微信群机器人/应用消息，支持客户群、通讯录同步。', author: 'Ydsz Team', downloads: '14.5k', category: '即时通讯', badge: 'IM' },
  { id: 'telegram', name: 'Telegram', description: '接入 Telegram 机器人，支持 Inline 按钮、频道推送、文件收发。', author: 'Ydsz Team', downloads: '18.7k', category: '即时通讯', badge: 'IM' },
  { id: 'weibo', name: '微博', description: '微博内容同步，支持自动发布、评论转发、私信收发、热搜订阅。', author: 'Ydsz Team', downloads: '8.3k', category: '社交平台', badge: 'SNS' },
  { id: 'zhihu', name: '知乎', description: '知乎内容同步，支持想法发布、文章管理、私信收发、关注动态。', author: 'Ydsz Team', downloads: '6.7k', category: '社交平台', badge: 'SNS' },
  { id: 'notion', name: 'Notion', description: 'Notion 数据库同步，支持页面读写、数据库查询、块级内容管理。', author: 'Ydsz Team', downloads: '11.4k', category: '生产力工具', badge: 'Tool' },
  { id: 'tencent-doc', name: '腾讯文档', description: '腾讯文档读写协作，支持在线表格、文档内容同步、评论管理。', author: 'Ydsz Team', downloads: '9.1k', category: '生产力工具', badge: 'Tool' },
  { id: 'slack', name: 'Slack', description: '接入 Slack 工作区，支持频道消息、快捷操作、Workflow 集成。', author: 'Ydsz Team', downloads: '7.6k', category: '即时通讯', badge: 'IM' },
  { id: 'discord', name: 'Discord', description: '接入 Discord 服务器，支持消息、Slash Command、Webhook 集成。', author: 'Ydsz Team', downloads: '5.2k', category: '即时通讯', badge: 'IM' },
]

/* ═══════════════════════════════════════════
   Category maps per tab
   ═══════════════════════════════════════════ */

const CATEGORY_MAP: Record<TabKey, readonly string[]> = {
  all: ['全部'],
  experts: ['全部', '金融', '内容创作', '生活', '健康', '学术', '技术', '教育', '医疗健康', '人力行政', '影视媒体', '设计'],
  skills: ['全部', '文本处理', '开发', '数据', '知识管理', '工具', '创作'],
  plugins: ['全部', '工具', '资讯', '生活', '影音', '游戏', '趣味', '运维', '财经'],
  connectors: ['全部', '即时通讯', '社交平台', '生产力工具'],
}

/* ═══════════════════════════════════════════
   Emoji palette (cyclic) + Gradient palette (6 green tones, cyclic)
   ═══════════════════════════════════════════ */

const EMOJI_MAP = ['🧠', '📊', '🎨', '🛠️', '🔍', '📚', '💡', '🌐', '⚡', '🎯']

const GRADIENTS = [
  { base: '#0f2e1a', accent: '#22c55e' },   // emerald green
  { base: '#0f2820', accent: '#16a34a' },   // forest green
  { base: '#1a2e0f', accent: '#84cc16' },   // lime green
  { base: '#0f2e2a', accent: '#0d9488' },   // teal
  { base: '#0f2028', accent: '#0ea5e9' },   // sky blue
  { base: '#1a1a2e', accent: '#8b5cf6' },   // violet
]

/* ═══════════════════════════════════════════
   SVG sub-components
   ═══════════════════════════════════════════ */

/** Author avatar SVG icon */
function AuthorAvatarSvg() {
  return (
    <svg className="w-5 h-5 text-yuanbao-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
      <circle cx="10" cy="10" r="10" fill="currentColor" opacity="0.15" />
      <circle cx="10" cy="7" r="3" fill="currentColor" opacity="0.6" />
      <path d="M4 17c0-3.3 2.7-6 6-6s6 2.7 6 6" fill="currentColor" opacity="0.4" />
    </svg>
  )
}

/** Search icon SVG */
function SearchIcon() {
  return (
    <svg
      className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25"
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

/** Clear button icon */
function ClearIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

/** Empty state illustration */
function EmptyStateSvg() {
  return (
    <svg className="w-28 h-28 mx-auto mb-6 text-yuanbao-500/20" viewBox="0 0 112 112" fill="none">
      <circle cx="56" cy="56" r="52" stroke="currentColor" strokeWidth="2" opacity="0.2" />
      <circle cx="56" cy="56" r="44" fill="currentColor" opacity="0.04" />
      <rect x="36" y="36" width="40" height="40" rx="8" stroke="currentColor" strokeWidth="2" opacity="0.3" />
      <rect x="44" y="44" width="24" height="24" rx="4" fill="currentColor" opacity="0.08" />
      <circle cx="70" cy="68" r="14" stroke="currentColor" strokeWidth="2.5" opacity="0.4" />
      <line x1="80" y1="78" x2="90" y2="88" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
      <circle cx="40" cy="56" r="2" fill="currentColor" opacity="0.15" />
      <circle cx="56" cy="42" r="1.5" fill="currentColor" opacity="0.2" />
      <circle cx="68" cy="52" r="2.5" fill="currentColor" opacity="0.1" />
    </svg>
  )
}

/* ═══════════════════════════════════════════
   Download base URLs per type
   ═══════════════════════════════════════════ */

const DOWNLOAD_URLS: Record<string, string> = {
  experts: 'https://gitee.com/njydsz/ydsz-worker/tree/main/infra/agents/experts/library',
  skills: 'https://gitee.com/njydsz/ydsz-worker/tree/main/skills',
  plugins: 'https://gitee.com/njydsz/ydsz-worker/tree/main/plugins',
  connectors: 'https://gitee.com/njydsz/ydsz-worker/tree/main/connectors',
}

/* ═══════════════════════════════════════════
   Tab config
   ═══════════════════════════════════════════ */

interface TabDef {
  key: TabKey
  labelKey: string
}

const TABS: TabDef[] = [
  { key: 'all', labelKey: 'market.tab.all' },
  { key: 'experts', labelKey: 'market.tab.experts' },
  { key: 'skills', labelKey: 'market.tab.skills' },
  { key: 'plugins', labelKey: 'market.tab.plugins' },
  { key: 'connectors', labelKey: 'market.tab.connectors' },
]

/* ═══════════════════════════════════════════
   Component
   ═══════════════════════════════════════════ */

export default function MarketplacePage() {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<TabKey>('all')
  const [activeCategory, setActiveCategory] = useState<string>('全部')
  const [searchQuery, setSearchQuery] = useState('')

  // Reset category when tab changes
  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab)
    setActiveCategory('全部')
    setSearchQuery('')
  }

  const items = useMemo((): ( MarketplaceItem & { _type: string })[] => {
    const all: (MarketplaceItem & { _type: string })[] = []
    if (activeTab === 'all' || activeTab === 'experts') {
      all.push(...EXPERTS.map((e) => ({ ...e, _type: 'experts' })))
    }
    if (activeTab === 'all' || activeTab === 'skills') {
      all.push(...SKILLS.map((s) => ({ ...s, _type: 'skills' })))
    }
    if (activeTab === 'all' || activeTab === 'plugins') {
      all.push(...PLUGINS.map((p) => ({ ...p, _type: 'plugins' })))
    }
    if (activeTab === 'all' || activeTab === 'connectors') {
      all.push(...CONNECTORS.map((c) => ({ ...c, _type: 'connectors' })))
    }
    return all
  }, [activeTab])

  const totalCount = EXPERTS.length + SKILLS.length + PLUGINS.length + CONNECTORS.length

  const filtered = useMemo(() => {
    let result = items
    if (activeCategory !== '全部') {
      result = result.filter((i) => i.category === activeCategory)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q)
      )
    }
    return result
  }, [items, activeCategory, searchQuery])

  return (
    <div className="py-16 lg:py-24">
      <div className="container-page">
        {/* ═══ Header ═══ */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="section-label">{t('market.hero.badge')}</span>
            <span className="px-2.5 py-0.5 rounded-md bg-yuanbao-500/10 border border-yuanbao-500/15 text-yuanbao-400 text-[11px] font-semibold">
              {totalCount} {t('market.hero.entries')}
            </span>
          </div>
          <h1 className="heading-xl mt-3 mb-2">
            <span className="text-gradient">{t('market.hero.title')}</span>
          </h1>
          <p className="text-white/55 text-base max-w-xl mx-auto mt-3">
            {t('market.hero.subtitle')}
          </p>
        </div>

        {/* ═══ Tab bar ═══ */}
        <div className="flex items-center justify-center mb-7">
          <div className="inline-flex bg-ink-800/30 border border-white/[0.06] rounded-xl p-1 gap-0.5">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`px-5 py-2 rounded-lg text-[13px] font-medium transition-all duration-250 ${
                  activeTab === tab.key
                    ? 'bg-yuanbao-500/12 text-yuanbao-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'
                    : 'text-white/55 hover:text-white/80 hover:bg-white/[0.03]'
                }`}
              >
                {t(tab.labelKey)}
              </button>
            ))}
          </div>
        </div>

        {/* ═══ Filter Row: category pills + search ═══ */}
        <div className="flex flex-col lg:flex-row lg:items-start gap-3 mb-7">
          <div className="flex flex-wrap gap-1.5 flex-1">
            {CATEGORY_MAP[activeTab]?.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`tag-pill text-[12px] px-3 py-1.5 ${
                  activeCategory === cat
                    ? 'tag-pill-active shadow-sm shadow-yuanbao-500/8'
                    : ''
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative lg:w-60">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索..."
              className="w-full px-3 py-2 pl-8 pr-7 rounded-lg bg-ink-800/30 border border-white/[0.07] text-white placeholder-white/25 text-[13px] focus:outline-none focus:border-yuanbao-500/40 focus:ring-2 focus:ring-yuanbao-500/10 transition-all duration-200"
            />
            <SearchIcon />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded text-white/25 hover:text-white/60 hover:bg-white/[0.06] transition-all"
                aria-label="清除搜索"
              >
                <ClearIcon />
              </button>
            )}
          </div>
        </div>

        {/* ═══ Card Grid — Octop 风格横向卡片 ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((item, cardIndex) => {
            const { base, accent } = GRADIENTS[cardIndex % GRADIENTS.length]
            return (
              <div
                key={`${item._type}-${item.id}`}
                className="card-refined group cursor-default"
              >
                {/* Horizontal layout: avatar left, content right */}
                <div className="flex items-start gap-4">
                  {/* Left: circular avatar with gradient + emoji */}
                  <div
                    className="shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-2xl border border-white/[0.08] shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${base} 0%, ${accent} 100%)` }}
                  >
                    <span>{EMOJI_MAP[cardIndex % EMOJI_MAP.length]}</span>
                  </div>

                  {/* Right: name + badges + stats + description + bottom row */}
                  <div className="min-w-0 flex-1">
                    {/* Row 1: name + category badge + version badge */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-white font-semibold text-[15px] leading-snug group-hover:text-yuanbao-300 transition-colors duration-300">
                        {item.name}
                      </h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-yuanbao-500/10 text-yuanbao-400 text-[11px] font-medium leading-none border border-yuanbao-500/15">
                        {item.category}
                      </span>
                      {item.badge && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-white/[0.04] text-white/55 text-[11px] font-medium leading-none border border-white/[0.07]">
                          {item.badge}
                        </span>
                      )}
                    </div>

                    {/* Row 2: stats — downloads + author */}
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="flex items-center gap-1 text-[11px] text-white/40 tabular-nums">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        {item.downloads}
                      </span>
                      <span className="text-white/[0.15] text-[10px]">·</span>
                      <span className="flex items-center gap-1 text-[11px] text-white/35 truncate">
                        <AuthorAvatarSvg />
                        {item.author}
                      </span>
                    </div>

                    {/* Row 3: description (1-2 lines) */}
                    <p className="text-white/50 text-[13px] leading-[1.65] mt-2 line-clamp-2">
                      {item.description}
                    </p>

                    {/* Row 4: divider + detail link + download button */}
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/[0.05]">
                      <Link
                        to={`/market/${item._type}/${item.id}`}
                        className="inline-flex items-center gap-1 text-[12px] text-white/40 hover:text-yuanbao-400 transition-colors duration-250"
                      >
                        详情
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                      <div className="flex-1" />
                      <a
                        href={`${DOWNLOAD_URLS[item._type]}/${item.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-yuanbao-500 text-ink-900 hover:bg-yuanbao-400 transition-all duration-250 shadow-sm hover:shadow-md hover:shadow-yuanbao-500/20"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        {t('market.download')}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* ═══ Empty state ═══ */}
        {filtered.length === 0 && (
          <div className="text-center py-24">
            <EmptyStateSvg />
            <p className="text-base text-white/45 mt-5 mb-1.5">{t('market.empty.title')}</p>
            <p className="text-[13px] text-white/30">{t('market.empty.desc')}</p>
          </div>
        )}

        {/* ═══ Link to sub-pages ═══ */}
        {activeTab === 'all' && (
          <>
            <div className="mt-16">
              <SectionDivider variant="line" />
            </div>
            <div className="text-center mt-10">
              <p className="text-white/50 text-sm mb-6">{t('market.sub_links')}</p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link to="/experts" className="btn-secondary text-sm">
                  {t('market.explore')}
                </Link>
                <Link to="/plugins" className="btn-secondary text-sm">
                  {t('market.plugins_link')}
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
