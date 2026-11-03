import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'

interface ChangeItem {
  text: string
}

interface ChangeGroup {
  labelKey: string
  icon: string
  color: string
  items: ChangeItem[]
}

interface VersionEntry {
  version: string
  codename: string
  date: string
  summary: string
  groups: ChangeGroup[]
}

const VERSIONS: VersionEntry[] = [
  {
    version: 'v2.4.0',
    codename: 'Azure',
    date: '2026-10-25',
    summary: '官方网站上线、多页面路由支持、安装脚本修正与启动器优化。',
    groups: [
      {
        labelKey: 'cl.new',
        icon: '✨',
        color: 'yuanbao',
        items: [
          { text: '官方文档网站：独立的 Vite + React 多页 SPA，含专家市场、插件市场、贡献季、更新日志' },
          { text: '多页面路由支持：React Router + 嵌套 Layout，共享 Navbar/Footer/背景装饰' },
          { text: '安装脚本修正：增强跨平台兼容性与错误提示' },
        ],
      },
      {
        labelKey: 'cl.change',
        icon: '🔄',
        color: 'blue',
        items: [
          { text: '前端构建配置优化：Tailwind 自定义主题 + 卡片发光动效' },
          { text: '项目目录结构重组：website 独立模块 + 统一资源路径' },
          { text: 'ydsz-worker run CLI 启动器稳定性改进' },
        ],
      },
      {
        labelKey: 'cl.fix',
        icon: '🐛',
        color: 'red',
        items: [
          { text: '修复 Windows 环境下 npm 脚本无法正确执行的问题' },
          { text: '修复 Tailwind 暗色模式部分配色变量未生效的 bug' },
          { text: '修复 Dashboard 暗色光标不可见问题' },
        ],
      },
      {
        labelKey: 'cl.security',
        icon: '🔒',
        color: 'amber',
        items: [
          { text: '更新依赖版本，修补已知安全漏洞' },
          { text: '强化 Content-Security-Policy 配置' },
        ],
      },
    ],
  },
  {
    version: 'v2.3.2',
    codename: 'Verdant',
    date: '2026-09-30',
    summary: '多页面视觉精致化、专家插件市场、全局动效升级。',
    groups: [
      {
        labelKey: 'cl.new',
        icon: '✨',
        color: 'yuanbao',
        items: [
          { text: '专家市场页面：筛选 + 搜索 + 22 名专家卡片展示' },
          { text: '插件市场页面：筛选 + 搜索 + 25 款插件卡片展示' },
          { text: 'card-glow 组件类：hover 发光 + 浮动效果' },
        ],
      },
      {
        labelKey: 'cl.change',
        icon: '🔄',
        color: 'blue',
        items: [
          { text: '全局 CSS 增强：渐变光晕、模糊装饰、mask-fade 工具类' },
          { text: '统一下载链接指向 GitHub 官方仓库' },
          { text: 'Hero 区块视觉重设计：大标题渐变、底部透明度遮罩优化' },
        ],
      },
      {
        labelKey: 'cl.fix',
        icon: '🐛',
        color: 'red',
        items: [
          { text: '修复专家卡片在响应式布局下错位的问题' },
          { text: '修复搜索框输入无法正确触发 useState 更新的问题' },
        ],
      },
    ],
  },
  {
    version: 'v2.3.1',
    codename: 'Canopy',
    date: '2026-09-15',
    summary: '独立 website 模块拆分、基础路由架构、单页应用升级。',
    groups: [
      {
        labelKey: 'cl.new',
        icon: '✨',
        color: 'yuanbao',
        items: [
          { text: 'website/ 独立前端模块：React 18 + TypeScript + Vite 基础配置' },
          { text: '基础路由架构：BrowserRouter + 嵌套 Layout + 页面懒加载' },
          { text: '通用 UI 组件库：Navbar, Footer, BackgroundDecorations, Layout' },
        ],
      },
      {
        labelKey: 'cl.change',
        icon: '🔄',
        color: 'blue',
        items: [
          { text: 'Tailwind 配置扩展：自定义 yuanbao/ink 调色板 + 字体内嵌' },
          { text: 'Git 仓库结构整合：website 自包含 + 资源一体化' },
        ],
      },
      {
        labelKey: 'cl.fix',
        icon: '🐛',
        color: 'red',
        items: [
          { text: '修复开发与生产构建产物路径不一致问题' },
          { text: '修复 Navbar 滚动状态检测在 Safari 浏览器下的背景错位' },
        ],
      },
    ],
  },
  {
    version: 'v2.3.0',
    codename: 'Bloom',
    date: '2026-09-01',
    summary: '专家市场与插件市场正式上线，生态体系初步成型。',
    groups: [
      {
        labelKey: 'cl.new',
        icon: '✨',
        color: 'yuanbao',
        items: [
          { text: '专家市场：内置 22 名专家一键安装，支持搜索、筛选、详情预览' },
          { text: '插件市场：25 款插件上架，覆盖浏览器、文件处理、API 集成等场景' },
          { text: 'SkillHub 集成：与 SkillHub 市场打通，支持在线安装与更新' },
        ],
      },
      {
        labelKey: 'cl.change',
        icon: '🔄',
        color: 'blue',
        items: [
          { text: '专家安装流程重构：从 CLI 命令行升级为 Dashboard 一键安装' },
          { text: '插件依赖解析优化：自动处理版本冲突与依赖链' },
        ],
      },
      {
        labelKey: 'cl.fix',
        icon: '🐛',
        color: 'red',
        items: [
          { text: '修复专家安装后未正确注册到 Agent 的问题' },
          { text: '修复插件市场列表分页加载时重复请求的 bug' },
          { text: '修复 SkillHub 客户端在离线环境下的超时处理' },
        ],
      },
      {
        labelKey: 'cl.security',
        icon: '🔒',
        color: 'amber',
        items: [
          { text: '插件沙箱隔离增强：限制文件系统访问范围' },
          { text: '专家包签名验证：防止篡改后的专家包被执行' },
        ],
      },
    ],
  },
  {
    version: 'v2.2.0',
    codename: 'Aurora',
    date: '2026-08-15',
    summary: '多 Agent 协作能力上线，AgentTeams 支持复杂任务编排。',
    groups: [
      {
        labelKey: 'cl.new',
        icon: '✨',
        color: 'yuanbao',
        items: [
          { text: 'AgentTeams：多 Agent 协作框架，支持主从、对等、流水线三种模式' },
          { text: '团队协作任务编排：可视化拖拽定义 Agent 间消息流' },
          { text: 'Agent 间消息总线：低延迟内部通信，支持广播与定向发送' },
        ],
      },
      {
        labelKey: 'cl.change',
        icon: '🔄',
        color: 'blue',
        items: [
          { text: 'Agent 生命周期管理重构：统一启动/停止/重载入口' },
          { text: '任务分配算法优化：基于 Agent 负载与专长的智能调度' },
        ],
      },
      {
        labelKey: 'cl.fix',
        icon: '🐛',
        color: 'red',
        items: [
          { text: '修复多 Agent 场景下消息路由偶发丢失的问题' },
          { text: '修复 AgentTeams 中 Agent 异常退出后团队卡死的问题' },
          { text: '修复协作模式下上下文窗口溢出的问题' },
        ],
      },
      {
        labelKey: 'cl.security',
        icon: '🔒',
        color: 'amber',
        items: [
          { text: 'Agent 间通信鉴权：防止未授权 Agent 接入团队' },
        ],
      },
    ],
  },
  {
    version: 'v2.1.0',
    codename: 'Atlas',
    date: '2026-07-20',
    summary: '知识库 RAG 能力与连接器生态体系发布。',
    groups: [
      {
        labelKey: 'cl.new',
        icon: '✨',
        color: 'yuanbao',
        items: [
          { text: '知识库 RAG：文档上传 + 向量化 + 语义检索 + 引用溯源' },
          { text: '连接器生态：OAuth 注册中心 + MCP Gateway + 凭证加密存储' },
          { text: '连接器目录：内置 30+ 预置连接器（GitHub、Notion、Slack 等）' },
        ],
      },
      {
        labelKey: 'cl.change',
        icon: '🔄',
        color: 'blue',
        items: [
          { text: '向量引擎切换为混合检索（BM25 + Dense）提升召回率' },
          { text: '知识库分片策略优化：支持自定义 chunk size 与 overlap' },
        ],
      },
      {
        labelKey: 'cl.fix',
        icon: '🐛',
        color: 'red',
        items: [
          { text: '修复知识库文档删除后向量未同步清理的问题' },
          { text: '修复连接器 OAuth 回调在 HTTPS 环境下的重定向问题' },
          { text: '修复 MCP Gateway 长连接断开后未自动重连的问题' },
        ],
      },
      {
        labelKey: 'cl.security',
        icon: '🔒',
        color: 'amber',
        items: [
          { text: '连接器凭证加密升级：AES-256-GCM 替换原有加密方案' },
          { text: 'OAuth state 参数增强校验，防止 CSRF 攻击' },
        ],
      },
    ],
  },
  {
    version: 'v2.0.0',
    codename: 'Nova',
    date: '2026-06-01',
    summary: '2.0 大版本：全新架构、全新 UI、全面重构。',
    groups: [
      {
        labelKey: 'cl.new',
        icon: '✨',
        color: 'yuanbao',
        items: [
          { text: '全新架构：FastAPI + LangGraph + 内置 IM Gateway，去除外部队列依赖' },
          { text: '全新 Dashboard UI：React 18 + TypeScript + Vite + Tailwind CSS' },
          { text: 'Click CLI：ydsz-worker 命令行工具，覆盖用户/Agent/模型/定时任务管理' },
          { text: '多数据库支持：SQLite（默认）与 PostgreSQL 双引擎' },
        ],
      },
      {
        labelKey: 'cl.change',
        icon: '🔄',
        color: 'blue',
        items: [
          { text: 'Python 包管理从 pip 迁移至 uv，安装速度提升 10x' },
          { text: 'API 文档 UI 从 Swagger 切换为 Scalar' },
          { text: '配置系统重构：环境变量 + config.json 统一入口' },
        ],
      },
      {
        labelKey: 'cl.fix',
        icon: '🐛',
        color: 'red',
        items: [
          { text: '修复旧版消息流在并发场景下的竞态条件' },
          { text: '修复 Agent 启动时端口冲突检测不准确的问题' },
          { text: '修复 Dashboard 在低分辨率屏幕下的布局溢出' },
        ],
      },
      {
        labelKey: 'cl.security',
        icon: '🔒',
        color: 'amber',
        items: [
          { text: 'JWT 认证体系全面审计与加固' },
          { text: 'SQL 注入防护：所有查询参数化，repos 层统一校验' },
        ],
      },
    ],
  },
  {
    version: 'v1.9.0',
    codename: 'Mistral',
    date: '2026-04-15',
    summary: '定时任务调度与浏览器自动化能力上线。',
    groups: [
      {
        labelKey: 'cl.new',
        icon: '✨',
        color: 'yuanbao',
        items: [
          { text: '定时任务：Cron 表达式调度 + 可视化配置 + 执行历史追踪' },
          { text: '浏览器自动化：Playwright 集成，支持网页抓取、表单填写、截图' },
          { text: 'Agent 工具钩子：定时任务可触发 Agent 自定义工具链' },
        ],
      },
      {
        labelKey: 'cl.change',
        icon: '🔄',
        color: 'blue',
        items: [
          { text: '调度引擎从 APScheduler 迁移至自研轻量调度器' },
          { text: '浏览器会话管理优化：支持多标签页并发与持久化' },
        ],
      },
      {
        labelKey: 'cl.fix',
        icon: '🐛',
        color: 'red',
        items: [
          { text: '修复定时任务在服务器重启后丢失的问题' },
          { text: '修复浏览器自动化在 Windows 下的 WebDriver 兼容性问题' },
          { text: '修复 Cron 时区计算在夏令时切换时的偏差' },
        ],
      },
      {
        labelKey: 'cl.security',
        icon: '🔒',
        color: 'amber',
        items: [
          { text: '浏览器沙箱隔离：限制网络访问与文件系统读写范围' },
        ],
      },
    ],
  },
  {
    version: 'v1.8.0',
    codename: 'Lumen',
    date: '2026-03-01',
    summary: '桌面客户端发布，支持远程桌面与本地 Agent 管理。',
    groups: [
      {
        labelKey: 'cl.new',
        icon: '✨',
        color: 'yuanbao',
        items: [
          { text: '桌面客户端：Electron 封装，支持 Windows / macOS / Linux' },
          { text: '远程桌面：WebRTC 点对点连接，低延迟远程操控 Agent 工作区' },
          { text: '本地 Agent 管理：桌面端一键启动/停止/监控 Agent 运行状态' },
        ],
      },
      {
        labelKey: 'cl.change',
        icon: '🔄',
        color: 'blue',
        items: [
          { text: '桌面端与后端通信从 REST 迁移至 WebSocket 长连接' },
          { text: '安装包签名与自动更新机制集成' },
        ],
      },
      {
        labelKey: 'cl.fix',
        icon: '🐛',
        color: 'red',
        items: [
          { text: '修复桌面端在 macOS 下的菜单栏图标不显示问题' },
          { text: '修复远程桌面在弱网环境下的画面卡顿' },
          { text: '修复客户端自动更新在代理网络下失败的问题' },
        ],
      },
      {
        labelKey: 'cl.security',
        icon: '🔒',
        color: 'amber',
        items: [
          { text: '远程桌面连接鉴权：一次性令牌 + 过期自动失效' },
          { text: '桌面端本地存储加密：保护 Agent 配置与凭证' },
        ],
      },
    ],
  },
  {
    version: 'v1.7.0',
    codename: 'Kite',
    date: '2026-01-15',
    summary: 'IM 通道全覆盖与 ACP 协议支持。',
    groups: [
      {
        labelKey: 'cl.new',
        icon: '✨',
        color: 'yuanbao',
        items: [
          { text: 'IM 通道全覆盖：企业微信、钉钉、飞书、Telegram、Slack 统一接入' },
          { text: 'ACP 协议：Agent Communication Protocol，支持跨实例 Agent 互操作' },
          { text: 'Slash 命令体系：/dispatcher 路由 + 可扩展 handlers' },
        ],
      },
      {
        labelKey: 'cl.change',
        icon: '🔄',
        color: 'blue',
        items: [
          { text: 'Gateway 架构重构：统一 ingress 接口，插件化 channel adapter' },
          { text: '消息处理管线优化：流式输出 + 打字机效果' },
        ],
      },
      {
        labelKey: 'cl.fix',
        icon: '🐛',
        color: 'red',
        items: [
          { text: '修复飞书机器人消息去重逻辑在并发下的误判' },
          { text: '修复 Telegram 长消息被截断的问题' },
          { text: '修复 Slack Block Kit 消息渲染在暗色主题下的对比度问题' },
        ],
      },
      {
        labelKey: 'cl.security',
        icon: '🔒',
        color: 'amber',
        items: [
          { text: 'Webhook 签名验证增强：所有 IM 通道强制校验请求来源' },
          { text: 'ACP 协议通信加密：TLS 1.3 + 双向证书认证' },
        ],
      },
    ],
  },
  {
    version: 'v1.6.0',
    codename: 'Iris',
    date: '2025-12-01',
    summary: '多用户系统与 JWT 认证体系上线。',
    groups: [
      {
        labelKey: 'cl.new',
        icon: '✨',
        color: 'yuanbao',
        items: [
          { text: '多用户系统：用户注册/登录/角色管理（管理员/普通用户）' },
          { text: 'JWT 认证：访问令牌 + 刷新令牌，支持 Token 自动续期' },
          { text: '权限隔离：Agent 归属校验 + 资源级访问控制' },
        ],
      },
      {
        labelKey: 'cl.change',
        icon: '🔄',
        color: 'blue',
        items: [
          { text: '密码哈希算法从 SHA-256 升级至 bcrypt' },
          { text: '会话管理从服务端 Session 迁移至无状态 JWT' },
        ],
      },
      {
        labelKey: 'cl.fix',
        icon: '🐛',
        color: 'red',
        items: [
          { text: '修复并发登录时会话冲突的问题' },
          { text: '修复 JWT 刷新令牌在过期边缘情况下的竞态条件' },
          { text: '修复用户删除后关联 Agent 未级联清理的问题' },
        ],
      },
      {
        labelKey: 'cl.security',
        icon: '🔒',
        color: 'amber',
        items: [
          { text: '登录失败限流：5 次失败后锁定 15 分钟' },
          { text: '敏感操作审计日志：记录所有权限变更与配置修改' },
        ],
      },
    ],
  },
  {
    version: 'v1.5.0',
    codename: 'Harbor',
    date: '2025-10-15',
    summary: '专家系统与 MBTI 人格引擎发布。',
    groups: [
      {
        labelKey: 'cl.new',
        icon: '✨',
        color: 'yuanbao',
        items: [
          { text: '专家系统：可安装/卸载的专家包，含技能、子代理、工作流定义' },
          { text: 'MBTI 人格引擎：16 型人格配置，影响 Agent 沟通风格与决策偏好' },
          { text: '专家 CLI 管理：ydsz-worker expert install/list/delete' },
        ],
      },
      {
        labelKey: 'cl.change',
        icon: '🔄',
        color: 'blue',
        items: [
          { text: 'Agent 配置 schema 扩展：新增 persona、expert、mbti 字段' },
          { text: '系统提示词模板引擎重构：支持多语言与动态变量插值' },
        ],
      },
      {
        labelKey: 'cl.fix',
        icon: '🐛',
        color: 'red',
        items: [
          { text: '修复专家包安装时依赖解析顺序错误的问题' },
          { text: '修复 MBTI 人格切换后 Agent 行为未即时生效的问题' },
          { text: '修复专家 CLI 在 Windows 下的路径分隔符问题' },
        ],
      },
      {
        labelKey: 'cl.security',
        icon: '🔒',
        color: 'amber',
        items: [
          { text: '专家包来源校验：仅允许已签名或内置源安装' },
        ],
      },
    ],
  },
  {
    version: 'v1.0.0',
    codename: 'Genesis',
    date: '2025-08-01',
    summary: '首个正式版发布，奠定 Ydsz Worker 基础能力。',
    groups: [
      {
        labelKey: 'cl.new',
        icon: '✨',
        color: 'yuanbao',
        items: [
          { text: '核心 Agent 运行时：基于 LangGraph 的 ReAct 循环 + 工具调用' },
          { text: '基础 Dashboard：Agent 管理、对话界面、模型配置、用量统计' },
          { text: '多模型提供商：OpenAI / Anthropic / Ollama / Azure OpenAI 统一接入' },
          { text: 'Agent 工作区：文件系统沙箱 + 读写 API + 会话持久化' },
        ],
      },
      {
        labelKey: 'cl.change',
        icon: '🔄',
        color: 'blue',
        items: [
          { text: '项目结构确立：infra / api / cli / dashboard 分层架构' },
          { text: 'Python 3.12+ 基线：类型提示 + asyncio 异步运行时' },
        ],
      },
      {
        labelKey: 'cl.fix',
        icon: '🐛',
        color: 'red',
        items: [
          { text: '修复 Agent 工具调用在异常输入下的崩溃问题' },
          { text: '修复 Dashboard 对话列表在大量消息时的渲染性能问题' },
          { text: '修复 Ollama 本地模型连接超时未正确处理的问题' },
        ],
      },
      {
        labelKey: 'cl.security',
        icon: '🔒',
        color: 'amber',
        items: [
          { text: 'API Key 加密存储：系统密钥环集成' },
          { text: '工作区路径逃逸防护：阻止 Agent 访问工作区外文件' },
        ],
      },
    ],
  },
  {
    version: 'Unreleased',
    codename: '开发中',
    date: '—',
    summary: '正在开发中的功能与修复，将在下一个版本发布。',
    groups: [
      {
        labelKey: 'cl.new',
        icon: '✨',
        color: 'yuanbao',
        items: [
          { text: 'Agent 记忆系统：长期记忆存储 + 语义检索 + 自动摘要' },
          { text: '多模态输入：图片理解 + 语音转文字 + 文件解析' },
        ],
      },
      {
        labelKey: 'cl.change',
        icon: '🔄',
        color: 'blue',
        items: [
          { text: 'Streaming API 重构：统一 SSE 事件格式，提升前端消费效率' },
          { text: '配置热重载：无需重启即可生效 Agent 与模型配置变更' },
        ],
      },
      {
        labelKey: 'cl.fix',
        icon: '🐛',
        color: 'red',
        items: [
          { text: '修复 Agent 在高并发下工具调用顺序不确定的问题' },
          { text: '修复 Dashboard 在移动端 Safari 下的触摸滚动冲突' },
        ],
      },
    ],
  },
]

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; badge: string; dot: string }> = {
  yuanbao: {
    bg: 'bg-yuanbao-500/10',
    border: 'border-yuanbao-500/20',
    text: 'text-yuanbao-400',
    badge: 'bg-yuanbao-500/10 text-yuanbao-400 border-yuanbao-500/20',
    dot: 'bg-yuanbao-400',
  },
  blue: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    text: 'text-blue-400',
    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    dot: 'bg-blue-400',
  },
  red: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    text: 'text-red-400',
    badge: 'bg-red-500/10 text-red-400 border-red-500/20',
    dot: 'bg-red-400',
  },
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    text: 'text-amber-400',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    dot: 'bg-amber-400',
  },
}

export default function ChangelogPage() {
  const { t } = useLanguage()
  const [activeVersion, setActiveVersion] = useState<string>(VERSIONS[0].version)

  const current = VERSIONS.find((v) => v.version === activeVersion) ?? VERSIONS[0]
  const currentIdx = VERSIONS.findIndex((v) => v.version === activeVersion)

  return (
    <div className="py-16 lg:py-24">
      <div className="container-page">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="section-label mb-4">{t('cl.title')}</span>
          <h1 className="heading-xl mt-4 mb-3">
            <span className="text-gradient">Changelog</span>
          </h1>
          <p className="text-white/60 text-lg">
            {t('cl.subtitle')}
          </p>
        </div>

        {/* Content Layout: Left Nav + Right Details */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Version List (1/4 sticky) */}
          <aside className="lg:w-1/4 shrink-0">
            <div className="lg:sticky lg:top-24">
              <h2 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-4 px-1">
                {t('cl.version_list')}
              </h2>
              <nav className="space-y-2">
                {VERSIONS.map((v) => (
                  <button
                    key={v.version}
                    onClick={() => setActiveVersion(v.version)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 border group ${
                      activeVersion === v.version
                        ? 'bg-yuanbao-500/10 border-yuanbao-500/30'
                        : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.1]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full transition-colors ${
                            activeVersion === v.version ? 'bg-yuanbao-400' : 'bg-white/20 group-hover:bg-white/40'
                          }`}
                        />
                        <span
                          className={`font-mono font-semibold text-sm transition-colors ${
                            activeVersion === v.version ? 'text-yuanbao-400' : 'text-white/70 group-hover:text-white'
                          }`}
                        >
                          {v.version}
                        </span>
                      </div>
                      <span className="text-xs text-white/40">{v.date}</span>
                    </div>
                    <div
                      className={`text-xs mt-0.5 ml-4 transition-colors ${
                        activeVersion === v.version ? 'text-white/50' : 'text-white/30 group-hover:text-white/50'
                      }`}
                    >
                      {v.codename} · {v.groups.reduce((n, g) => n + g.items.length, 0)} {t('cl.changes_count')}
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Right Content - Version Details (3/4) */}
          <div className="lg:w-3/4 min-w-0">
            <div className="card-glass p-8 relative overflow-hidden">
              {/* Background decoration */}
              <svg className="absolute -top-8 -right-8 w-40 h-40 opacity-5" viewBox="0 0 160 160" fill="none">
                <circle cx="80" cy="80" r="80" fill="#22c55e" />
                <circle cx="100" cy="60" r="40" fill="#4ade80" opacity="0.5" />
              </svg>

              {/* Version Header */}
              <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-white">{current.version}</h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-yuanbao-500/10 border border-yuanbao-500/20 text-yuanbao-400 text-xs font-medium">
                      代号：{current.codename}
                    </span>
                    <span className="text-xs text-white/30 font-mono">{current.date}</span>
                  </div>
                  <p className="text-white/60 text-sm">{current.summary}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-white/30">v{currentIdx + 1}/{VERSIONS.length}</span>
                  <a
                    href="https://gitee.com/njydsz/ydsz-worker/releases"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary text-sm !px-4 !py-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    全部 Release
                  </a>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-white/[0.06] pt-6 space-y-8">
                {current.groups.map((group) => {
                  const colors = COLOR_MAP[group.color] ?? COLOR_MAP.yuanbao
                  return (
                    <div key={group.labelKey}>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-lg">{group.icon}</span>
                        <h3 className={`font-semibold ${colors.text}`}>{t(group.labelKey)}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs border ${colors.badge}`}>
                          {group.items.length}
                        </span>
                      </div>
                      <ul className="space-y-3">
                        {group.items.map((item, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-3 text-white/70 text-sm leading-relaxed"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${colors.dot}`} />
                            {item.text}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Version Navigation */}
            <div className="flex items-center justify-between mt-6">
              {currentIdx > 0 ? (
                <button
                  onClick={() => setActiveVersion(VERSIONS[currentIdx - 1].version)}
                  className="btn-ghost"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="text-sm">{VERSIONS[currentIdx - 1].version}</span>
                </button>
              ) : <div />}
              {currentIdx < VERSIONS.length - 1 ? (
                <button
                  onClick={() => setActiveVersion(VERSIONS[currentIdx + 1].version)}
                  className="btn-ghost"
                >
                  <span className="text-sm">{VERSIONS[currentIdx + 1].version}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : <div />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
