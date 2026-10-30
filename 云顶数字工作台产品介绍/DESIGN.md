# DESIGN.md — 云顶数字工作台（Ydsz Worker）对外产品介绍

## 需求对齐

| 维度 | 答案 |
|---|---|
| 主题 | 云顶数字工作台（Ydsz Worker）产品对外介绍 |
| 目标 | 让企业客户 / IT 决策者在 15 分钟内理解"这是什么、能解决什么、为什么可控可信、怎么开始" |
| 受众 | 企业客户 IT 负责人、数字化决策者、安全合规岗；技术可信但不需代码级细节 |
| 场合 | 对外商务交流、官网/展厅材料、售前初次沟通 |
| 页数 | 38 页（5 章 + 封面/目录/结尾） |
| 调性 | 专业、克制、证据驱动；每个卖点都能落到代码事实，不堆形容词 |
| 语言 | 简体中文（专有名词保留英文） |

---

## 一、画布与安全区

- 画布：1280 × 720
- padding：上下 60 / 左右 60（硬下限）
- 内容区：1160 × 600
- 页尾条：y = 670 顶边，高度 ≤ 30，底部不超 y = 700；左右 ≥ 60 / ≤ 1220
- 封面 / 目录 / 章节扉页 / 结尾页：**不加页尾**

## 二、配色方案（科技蓝，单套全篇）

| 槽位 | Hex | 用途 |
|---|---|---|
| 主色 Primary | `#2563EB` | 强调卡底、图标块、箭头与关键图形、编号 |
| 深色（仅文字） | `#1E293B` | 主标题、小标题、正文深色文字——**中性深灰，不再使用深藏青** |
| 辅色 Cyan | `#0891B2` | 第二序列标签、次强调卡、线路 |
| 强调色 Amber | `#F59E0B` | 锚点数字、分隔条、CTA |
| 底色 | `#FFFFFF` | 主背景 |
| 浅底 Neutral | `#F4F6FB` | 章节扉页底、结论条 |
| 卡片浅底（首选） | `#F8FAFC` / `#E8EEFB` / `#E6F7F9` / `#FFF7E9` | 普通卡 / 蓝系卡 / 青系卡 / 琥珀系卡 |
| 强调卡底 | `#D6E4F9` / `#D5EEF3` | 需要突出但仍保持浅色的卡片 |
| 禁止 | 大面积 `#2563EB` / `#0891B2` 实心填充 | 见下方「卡片底色纪律」 |
| 分割线与边框 | `#E2E8F0` / `#C7D6F5` | 1px 细线 / 浅蓝卡片边框 |
| 正文色 | `#475569` / `#334155` | 卡片正文、说明文字 |
| 弱化色 | `#64748B` / `#94A3B8` | 脚注、辅助说明 |
| 蓝底上的正文 | `#E0E9F9` / `#EEF3FD` | 仅用于主色块内的次级文字 |

**卡片底色纪律（硬性）**：卡片类容器一律使用浅色底，**不得用主色/辅色做大面积实心填充**——浅色页里压一块饱和实心色块会显得很重。主色 `#2563EB` 与辅色 `#0891B2` 只允许出现在小面积元素上：4px 强调竖条、44×4 或 72×6 短横条、≤20px 的圆点与节点、箭头与图标、SVG 图形。

**浅色基调（硬性）**：全篇不使用深色满版背景。页面底色只能是 `#FFFFFF` 或 `#F4F6FB`，封面/结尾页允许极浅渐变（`#FFFFFF → #F4F6FB → #E4ECF9`）。需要强调时用**品牌蓝 `#1D4ED8` 色块承载白字**，而不是把整页压暗。

**面积纪律**：主色 ≤ 60% / 辅色 ≤ 30% / 强调 ≤ 10%；Hero 页强调可到 15–20%。
**禁 boxShadow**；层次靠底色 + 1px 线 + 留白。
**深色大块每页 ≤ 1**。

## 三、字体系统

- 中文：`Microsoft YaHei`
- 西文 / 数字：`Helvetica`
- 同一句话内数字跟随该句字体；仅锚点数字允许放大字号

| 层级 | 字号 | 字重 |
|---|---|---|
| 封面主标 | 66 | Bold |
| 章节大字 | 64 | Bold |
| 巨型锚点数字 | 72–112 | Bold |
| 页面主标题 | 34 | Bold |
| 卡片小标 | 24 | 600 |
| 正文 | 18 / 20 | Regular |
| 脚注 / 页码 | 14 | Regular |

一页「字体+字号+字重」组合 ≤ 4 种；行高：正文 1.5、小标 1.3、主标 1.2、脚注 1.4。

## 四、视觉母题（全篇复用）

1. **页眉编号条**：内容页左上角 14px 弱化色「章节号 · 页标题英文」，右上角同一行放主色细短线（40px × 3px，圆角）
2. **主标题下 1px 贯通细线**：线宽 = 内容区全宽 1160，颜色 `#E2E8F0`，紧贴主标题基线下方 14px
3. **底部结论条**：内容区底部一条 `#F4F6FB` 浅底横条（圆角 8），左端 4px 主色竖条，内写一句本页 takeaway
4. **L3 角标**：页尾左端 24×24 主色徽标（全篇位置固定）

## 五、配图清单

| 文件 | 等级 | 方式 | 内容 | 使用页 |
|---|---|---|---|---|
| `cover-bg.png` | L1 | ImageGen | 抽象的深蓝数据流 / 星云状节点网络，科技感、干净、留出左侧文字区 | P1 |
| `hero-map.png` | L1 | ImageGen | 深色底抽象"平台枢纽"光束汇聚图 | P8 |
| `shield.png` | L1 | ImageGen | 深色抽象护盾 / 层级安全环 | P19 |
| `interop.png` | L1 | ImageGen | 抽象协议互联：中心节点与多方向 protocol 连线 | P27 |
| `foundation.png` | L1 | ImageGen | 抽象工程底座：几何堆叠 + 光带 | P37 |
| `ending.png` | L1 | ImageGen | 收尾感：深蓝渐变 + 光点延伸 | P38 |
| 其余页面 | L1/L2 | 内联 SVG | 架构图、流程图、矩阵、漏斗、时间轴、对比图 | P9–P36 |

SVG 允许用于：流程图、时间轴、矩阵、漏斗、架构图、关系网络、巨型数字、趋势箭头、进度环、背景网格。
**ImageGen 风格统一**：深色抽象 3D 渲染、蓝青主光、留白干净、无文字、无 Logo。

> **落地说明（实际执行）**：全篇图形改用「结构化容器 Box + 无文字 SVG 图形」实现，未调用生图模型。原因：本 deck 的 L1 全部为架构图 / 能力地图 / 流程链 / 矩阵 / 阶梯等结构化图形，按配图规则本就允许 SVG；同时避免 SVG 内中文 `<text>` 的字体渲染风险，也避免额外生图开销。

---

## 六、逐页字段表

### P1 · 封面
- `type`: cover ｜ `role`: hero ｜ `rhythm`: peak
- `layout`: 满版图 + 左侧深色渐变蒙层
- `visual`: L1 `cover-bg.png` 全幅铺底
- `visual_role`: anchor
- `density`: 字数约 60 / 图片 1 / 留白约 45%
- `anti_pattern`: 封面禁止出现任何数据指标或数据说明；禁止多段正文；禁止标题超过 2 行
- `description`: 主标「云顶数字工作台 Ydsz Worker」；副标「会思考，会干活，陪企业成长的智能伙伴」；说明层「自托管企业级 AI 助手平台 · 产品白皮书」；信息层放置日期与版本 v26.10.20。不超过 4 层信息。

### P2 · 目录
- `type`: catalog ｜ `role`: supporting ｜ `rhythm`: valley
- `layout`: 左右不对称杂志式
- `visual`: L3 角标
- `visual_role`: atmosphere
- `density`: 字数约 80 / 图片 0 / 留白约 50%
- `anti_pattern`: 禁止统计装饰块（"N 个章节"）、禁止"阅读顺序"复述条、禁止"全篇主线"预告行
- `description`: 左 1/3 大字「目录 CONTENTS」；右 2/3 竖排五章清单，编号 + 章节名 + 起始页码三列对齐：01 认识云顶 P3 / 02 能力全景 P8 / 03 安全与治理 P18 / 04 连接与集成 P24 / 05 落地与保障 P29。

### P3 · 章节 01 扉页
- `type`: section ｜ `role`: transition ｜ `rhythm`: transition
- `layout`: 章节大字（超大编号 + 章节名 + 一行说明）
- `visual`: 无
- `visual_role`: atmosphere
- `density`: 字数约 40 / 图片 0 / 留白约 55%
- `anti_pattern`: 禁止导语段落、禁止"看点一二三"、禁止配图铺满
- `description`: 超大编号「01」+ 章节名「认识云顶」，一行说明「企业级 AI 助手平台的定位与价值主张」。视觉要素 ≤ 3 个。

### P4 · 企业 AI 落地的三道断层
- `type`: content ｜ `role`: hero ｜ `rhythm`: peak
- `layout`: 巨型数字 + 洞察（三断层横向断裂带图示）
- `visual`: L1 自绘 SVG「三段断裂的管道」，`#12275A` 底
- `visual_role`: anchor
- `density`: 字数约 200 / 图形 1 / 留白约 25%
- `anti_pattern`: 禁止三张等宽并列卡片；禁止把结论藏在下方的正文中；禁止用形容词代替事实
- `description`: 提出三道断层——① 数据断层：企业真实知识在文档/IM/系统里，通用模型看不到；② 工具断层：模型只会说不会做，拿不到权限和外部系统；③ 管控断层：越能干越不敢放出去用。每条给一句企业侧影响。结论条：绝大多数 AI 试点停在演示阶段，卡点不在模型能力，而在数据、工具与管控三道断层。

### P5 · 产品定位：什么是云顶数字工作台
- `type`: content ｜ `role`: supporting ｜ `rhythm`: valley
- `layout`: 左图右文（6:4）
- `visual`: L2 自绘 SVG 单进程拓扑图（左侧），右侧定义三段
- `visual_role`: evidence
- `density`: 字数约 260 / 图形 1 / 留白约 20%
- `anti_pattern`: 禁止 50:50 等分；禁止只写一串功能名词
- `description`: 一句话定义：开源、自托管的多用户多智能体 AI 助手平台，一个 Python wheel 同时交付 Web 控制台、CLI、IM 通道与定时任务。右文三段：形态（单进程 / 无外部队列 / 一条命令启动）、地位（基于 Octop 开源生态，MIT 许可）、边界（不是聊天机器人，是可以带权限做事的数字伙伴）。结论条：既是 AI 的入口，也是企业把它接进业务流程的控制面。

### P6 · 核心价值主张：会思考 · 会干活 · 陪企业成长
- `type`: content ｜ `role`: supporting ｜ `rhythm`: valley
- `layout`: 三栏非均分（5:3:2 节奏，主栏"会干活"放大）
- `visual`: L2 SVG 三支柱递进图形
- `visual_role`: evidence
- `density`: 字数约 250 / 图形 1 / 留白约 22%
- `anti_pattern`: 禁止等宽三栏；禁止三栏字数平均
- `description`: 会思考——RAG 知识库 + 三层长期记忆（Atom / Entity / Episode），回答锚定私有数据；会干活——文件、Shell、浏览器、代码执行、定时任务，q;；陪企业成长——技能自沉淀、专家配置随业务积累增值。每栏 2 条事实依据 + 一句判断。结论条：三者闭环——理解上下文、能动手、并且越用越值钱。

### P7 · 一句话的产品边界
- `type`: content ｜ `role`: hero ｜ `rhythm`: peak
- `layout`: 一句独白 + 底部三个-anchor 数字带
- `visual`: 巨型宣言文字（非图片）
- `visual_role`: anchor
- `density`: 字数约 90 / 数字 3 / 留白约 40%
- `anti_pattern`: 禁止把宣言排成常规标题+正文；禁止四个以上数字平铺
- `description`: 大字宣言「对话即操作，配置即能力，数据不留外人呐」精简为「对话即操作，配置即能力，数据不留内网」；下方三个锚点数字：339,921 行自研代码 / 832 个测试文件 / MIT 开源许可，各带一句判断（工程体量 = 可持续演进的保证）。

### P8 · 章节 02 扉页
- `type`: section ｜ `role`: transition ｜ `rhythm`: transition
- `layout`: 章节大字（与 P3 同版式）
- `visual`: 无 ｜ `visual_role`: atmosphere
- `density`: 字数约 40 / 图片 0 / 留白约 55%
- `anti_pattern`: 同 P3；不得更换版式
- `description`: 编号「02」+「能力全景」，一行说明「从会说做到的能力链路」。

### P9 · 产品全景能力地图
- `type`: content ｜ `role`: hero ｜ `rhythm`: peak
- `layout`: 全幅深色底 + 分层能力图（核心 → 能力层 → 载体层）
- `visual`: L1 `hero-map.png` 深色底 + 上层自绘 SVG 分层结构
- `visual_role`: anchor
- `density`: 字数约 240 / 图片 1 + 图形 1 / 留白约 20%
- `anti_pattern`: 禁止做成 9 宫格卡片墙；禁止各层同色
- `description`: 三层结构：底层「运行时」（LangGraph Agent 运行时 + Checkpoint + 记忆引擎）、中层「能力层」（专家/团队、知识库 RAG、长期记忆、技能插件、工具与执行、Connector）、顶层「载体层」（Web 控制台、CLI、IM 通道、定时任务、ACP/MCP）。结论条：一套底座，把"理解—决策—执行—沉淀"串成闭环，而不是各自独立的玩具。

### P10 · 多用户 · 多 Agent 协作中枢
- `type`: content ｜ `role`: supporting ｜ `rhythm`: valley
- `layout`: 左标题色块 + 右内容
- `visual`: L2 SVG 用户-Agent-工作区隔离关系图
- `visual_role`: evidence
- `density`: 字数约 280 / 图形 1 / 留白约 20%
- `anti_pattern`: 禁止四张卡片横排；禁止只写"支持多用户"四个字
- `description`: 一个实例服务多人：JWT 行级隔离 agents.user_id、每用户独立工作区；每位用户可创建多个专家，各自独立供应商、通道、定时任务；337 行 row-level 权限目录 + 角色模板。结论条：一人运维，全公司共用，互不串数据。

### P11 · 专家库：33 个开箱即用的岗位角色
- `type`: content ｜ `role`: supporting ｜ `rhythm`: valley
- `layout`: 卡片组 + 底部结论条（卡片不等宽，4 张 5:4:4:3）
- `visual`: L2 SVG 专家卡片格（区别于共 33 个）
- `visual_role`: evidence
- `density`: 字数约 250 / 图形 1 / 留白约 20%
- `anti_pattern`: 禁止把所有专家名罗列成名单；禁止图标堆砌
- `description`: 内置 33 个专家模板（code-reviewer、data-analyst、devops-engineer、security-arch、legal-assistant、hr-recruiter 等），16 种 MBTI 人格可选；支持作者发布→他人复用→独立修改；另有 16 个职能域的专职子 Agent 定义。结论条：角色不是提示词彩妆，而是可发布、可复用、可治理的资产。

### P12 · AgentTeams：多智能体协同
- `type`: content ｜ `role`: supporting ｜ `rhythm`: valley
- `layout`: 流程链（横向 4 阶段 + 输出条）
- `visual`: L1 自绘 SVG 流程链（协调者 → 拆解 → 派工 → 回流 → 汇总）
- `visual_role`: anchor
- `density`: 字数约 240 / 图形 1 / 留白约 25%
- `anti_pattern`: 禁止把多智能体写成五个名词；流程链必须带方向箭头与阶段输出
- `description`: 协调者拆解多步骤任务 → 异步派发给成员专家 → 结果回流到父线程 → 汇总输出；基于 InboxManager + GlobalProcessor 邮箱队列，TeamProcessor 协议保证回复落回父线程检查点。结论条：复杂任务不再靠一个人写提示词，而是交给协调者调动多位专家。

### P13 · 长期记忆：会积累的理解力
- `type`: content ｜ `role`: supporting ｜ `rhythm`: valley
- `layout`: 对比式（左：单次对话 LLM / 右：三层记忆体系），中间竖线分隔
- `visual`: L2 SVG 三层金字塔（Atom / Entity / Episode）+ 召回管线
- `visual_role`: evidence
- `density`: 字数约 260 / 图形 1 / 留白约 20%
- `anti_pattern`: 禁止左右两区内容量悬殊过大；对比必须落到具体机制而不只是"有/没有"
- `description`: Atom（原子事实）/ Entity（实体画像）/ Episode（情节经历）三层模型；抽取→提升→消解→ Consolidate 生命周期；召回为带路由/重排/多样性/预算/抑制的多阶段管线，可选 FTS 全文与 Chroma / Qdrant 向量。结论条：换个会话还记得你所在的组织和上一次的结论——这才是"落下"的记忆。

### P14 · 知识库 RAG：答案带着出处
- `type`: content ｜ `role`: supporting ｜ `rhythm`: valley
- `layout`: 流程链变体（解析 → OCR → 分块 → Embedding → 索引 → 检索 → 引用）
- `visual`: L1 自绘 SVG 七段链路图，标注每步参数
- `visual_role`: anchor
- `density`: 字数约 280 / 图形 1 / 留白约 22%
- `anti_pattern`: 禁止只写"支持知识库"；必须写出参数级事实；右侧不得留大片空白
- `description`: 支持 md/txt/pdf/docx/pptx/xlsx/html/csv 及图片 OCR（本地 rapidocr 或远程视觉模型）；默认分块 800 字符 / 重叠 120；Embedding 可选本地 ONNX 或远程 OpenAI 兼容端点；每库一份 SQLite 向量索引；检索 Top-K=8、上下文预算 6000 字符，多库并行后全局重排；答案自动带引用溯源标记。诚实边界：当前为纯向量余弦检索，非混合检索。结论条：数据不出内网地完成检索，且每个答案都能给出来源。

### P15 · 技能与插件生态
- `type`: content ｜ `role`: supporting ｜ `rhythm`: valley
- `layout`: 三栏非均分（技能 / 子 Agent / 插件，另有底部 SkillHub 条）
- `visual`: L2 SVG 技能包安装→启用→调用 小链路
- `visual_role`: evidence
- `density`: 字数约 250 / 图形 1 / 留白约 22%
- `anti_pattern`: 禁止三栏等宽；禁止只堆三个数字
- `description`: 内置 23 个双语技能包（plan、powerpoint、nano-pdf、ocr-and-documents、jupyter-live-kernel、systematic-debugging 等）；37 个内置插件；来自 SkillHub 在线市场的安装/归档/传输；第三方插件按需要一键启用；技能供应链扫描策略可选 off / warn / block。结论条：能力不是一次性交付，而是可持续安装的生态。

### P16 · 执行力：从"会说"到"会做"
- `type`: content ｜ `role`: hero ｜ `rhythm`: peak
- `layout`: 巨型数字 + 洞察 + 工具清单带
- `visual`: L1 巨型数字锚点（工具数量），底部工具清单
- `visual_role`: anchor
- `density`: 字数约 230 / 图形 1 / 留白约 25%
- `anti_pattern`: Hero 页禁止等宽卡片横排；禁止把核心数字塞进角落
- `description`: 锚点：可执行文件与 Shell 操作的基础工具（ls / read_file / write_file / edit_file / glob / grep / execute）+ search_knowledge + memory 三件套 + 5 个搜索后端 + 媒体生成 + ask_user_question + 屏幕截图 + 文件交付 + 定时任务工具组。06 类不可禁用基础工具确保底线能力。结论条：工具不是装饰——写文件、跑命令、开浏览器、生成图片，都是真实发生的动作。

### P17 · 远程执行：终端 / 浏览器 / 桌面 / 移动
- `type`: content ｜ `role`: supporting ｜ `rhythm`: valley
- `layout`: 2×2 矩阵（四象限，每个象限一个执行载体 + 一句场景）
- `visual`: L2 SVG 2×2 矩阵，象限内各一个功能语义图标
- `visual_role`: evidence
- `density`: 字数约 240 / 图形 1 / 留白约 22%
- `anti_pattern`: 禁止做成四张同尺寸图片；图标只限有明确功能语义的（terminal / globe / desktop / mobile）
- `description`: 终端 AI+（浏览器内 xterm 交互式 Shell，AI 辅助执行命令与排障）；浏览器 AI+（基于 Chromium 的无头会话，网页自动化、截图、操作录制并生成技能）；远程桌面（控制台内实时看屏与键鼠注入，跨 Linux/Windows/macOS）；移动端与远程安卓（adb 设备控制、UI 树、手势）。结论条：不只操作文件，还能操作"机器本身"——这是自托管相较云端 API 的本质优势。

### P18 · 人工在环：可控的执行边界
- `type`: content ｜ `role`: supporting ｜ `rhythm`: valley
- `layout`: 横向时间轴（执行前 → 触发 → 决策 → 继续）
- `visual`: L1 自绘 SVG 时间轴 + 四种决策分支
- `visual_role`: anchor
- `density`: 字数约 240 / 图形 1 / 留白约 25%
- `anti_pattern`: 禁止把四种决策写成四个并列卡片；时间轴必须体现"暂停-恢复"语义
- `description`: 高风险工具（bash / execute / write_file / edit_file / delete）默认触发人工审批；四种决策 approve / edit / reject / respond；会话级粘性放行 ask / allow_all / allow_tools；Web、IM、CLI 同一套审批（IM 侧也有审批卡）。结论条：AI 能自己干活，但每一次越界动作都可以被人叫停、修改或追问。

### P19 · 章节 03 扉页
- `type`: section ｜ `role`: transition ｜ `rhythm`: transition
- `layout`: 章节大字（同版式）
- `visual`: 无 ｜ `visual_role`: atmosphere
- `density`: 字数约 40 / 图片 0 / 留白约 55%
- `anti_pattern`: 同 P3
- `description`: 编号「03」+「安全与治理」，一行说明「能把 AI 放出去用，靠的是可验证的边界」。

### P20 · 纵深安全总览
- `type`: content ｜ `role`: hero ｜ `rhythm`: peak
- `layout`: 全幅深色底 + 五层同心防环图
- `visual`: L1 `shield.png` 深底 + 上层 SVG 五层环（身份 / 命令 / 文件 / 数据 / 审计）
- `visual_role`: anchor
- `density`: 字数约 230 / 图片 1 + 图形 1 / 留白约 20%
- `anti_pattern`: 禁止把五层做成五张卡片；层数分色必须可辨但不彩虹
- `description`: 五层防线：认证与授权 → 命令守卫 → 文件系统沙箱 → 数据脱敏/SSRF → 审计留痕。每环一行机制 + 一句客户侧含义。结论条：不是宣称"我们很安全"，而是五层可打开、可配置、可审计的具体机制。

### P21 · 命令防护与文件系统沙箱
- `type`: content ｜ `role`: supporting ｜ `rhythm`: valley
- `layout`: 左标题色块 + 右内容（右侧长 KPI + 规则明细）
- `visual`: L2 SVG 规则命中流程（命令 → 引擎 → block/warn/审批）
- `visual_role`: evidence
- `density`: 字数约 280 / 图形 1 / 留白约 20%
- `anti_pattern`: 禁止左右各占一半等宽；右侧列表必须有容器包裹，不能做裸表
- `description`: 20 条内建危险命令规则（CRITICAL 7 / HIGH 13，覆盖代码执行、资源滥用、命令注入、提权、敏感文件、网络滥用）；ToolGuard 三种模式 block / warn / require_approval；YAML 规则可自定义并热加载，可一键恢复内置；文件系统 allow/deny 规则（operations × paths，首个匹配生效），默认拦 /etc、/root、.env、id_rsa、~/.aws。结论条：危险动作在执行前就被规则拦下，而不是事后追责。

### P22 · 数据与隐私保护
- `type`: content ｜ `role`: supporting ｜ `rhythm`: valley
- `layout`: 对比式（云端 SaaS / 自托管），中间竖线
- `visual`: L2 SVG 数据流示意（本地闭环 vs 外部传输）
- `visual_role`: evidence
- `density`: 字数约 250 / 图形 1 / 留白约 20%
- `anti_pattern`: 禁止只写"数据不出内网"的口号；每侧至少 3 条可核验机制
- `description`: PII 脱敏四种策略 block / redact / mask / hash，作用于 input / output / tool_results 三个面；SSRF 出站防护；bubblewrap 沙箱 shell；本地 Embedding（ONNX）与本地 Ollama 推理可选；配置、对话、工作区、凭证均在 `~/.ydsz-worker/`。结论条：模型可以换，云可以不连——数据主权的开关在企业自己手上。

### P23 · 身份与权限体系
- `type`: content ｜ `role`: supporting ｜ `rhythm`: valley
- `layout`: 流程链（登录方式 → 令牌 → 权限判定 → 资源所有权）
- `visual`: L1 自绘 SVG 四段链 + 每段落点
- `visual_role`: anchor
- `density`: 字数约 260 / 图形 1 / 留白约 22%
- `anti_pattern`: 禁止四个并列方框；链必须体现从左到右的判定顺序
- `description`: 登录：密码（argon2）/ LDAP / SSO-OIDC（钉钉、飞书、企业微信、通用 OIDC）/ 邀请码 / 验证码；JWT 全站强制校验 + 空闲会话踢出；模块级权限目录 + 角色模板 + 行级 `user_id` 隔离 + 资源所有权策略；管理端 /api/admin 可跨用户运维。诚实边界：未实现 SAML 与租户级模型。结论条：接进企业现有身份体系，而不用再建一套账号。

### P24 · 审计与备份
- `type`: content ｜ `role`: supporting ｜ `rhythm`: valley
- `layout`: 上图下文（上：轨迹账本链路图，下：三点+结论）
- `visual`: L2 SVG 轨迹账本：工具调用 → 事件落库 → LEDGER/时间轴/指标
- `visual_role`: evidence
- `density`: 字数约 240 / 图形 1 / 留白约 22%
- `anti_pattern`: 禁止上文下图都是卡片；下图必须落在三个具体能力上
- `description`: 每一次工具调用记入轨迹账本（trajectory ledger），可按会话查看 LEDGER、时间轴、调用明细与指标；自动备份支持 SQLite 转储、PostgreSQL pg_dump、工作区归档，并可挂到 cron 周期执行；跨版本升级前可 `backup` 一键导出。结论条：出问题能回放每一次调用，出问题之前能提前备份。

### P25 · 章节 04 扉页
- `type`: section ｜ `role`: transition ｜ `rhythm`: transition
- `layout`: 章节大字（同版式）
- `visual`: 无 ｜ `visual_role`: atmosphere
- `density`: 字数约 40 / 图片 0 / 留白约 55%
- `anti_pattern`: 同 P3
- `description`: 编号「04」+「连接与集成」，一行说明「不是新孤岛，而是接进既有系统」。

### P26 · 41 个企业系统连接器
- `type`: content ｜ `role`: hero ｜ `rhythm`: peak
- `layout`: 巨型数字 41 + 分类分布图 + 结论条
- `visual`: L1 巨型数字 + L2 SVG 分类分布（办公/知识/效率/出行/媒体/专业/项目/开发）
- `visual_role`: anchor
- `density`: 字数约 230 / 图形 1 / 留白约 22%
- `anti_pattern`: 禁止把 41 个名字全部罗列；禁止数字与分布图同等大小
- `description`: 锚点 41 个连接器，覆盖腾讯文档 / 腾讯会议 / 腾讯微云 / 腾讯 IMA / 乐享、Notion、语雀、Obsidian、Google Workspace、Microsoft 365、滴答清单、钉钉 / 飞书 / 企业微信 CLI、Jira / Linear、GitHub、Slack、Figma、Zapier、RSS 等；8 类认证方式（api_key 15 / oauth2 11 / personal_token 6 等）；16 个走 MCP 网关、13 个内建、11 个远程。结论条：办公协作、知识沉淀、项目推进的主流工具接入已跳过自研阶段。

### P27 · 10 个 IM 通道
- `type`: content ｜ `role`: supporting ｜ `rhythm`: valley
- `layout`: 左图右文（6:4）
- `visual`: L2 SVG 通道扇形 / 列表带
- `visual_role`: evidence
- `density`: 字数约 240 / 图形 1 / 留白约 20%
- `anti_pattern`: 禁止做成图标墙；右文必须给场景而非名单
- `description`: 飞书、钉钉、企业微信、微信、QQ、Telegram、Discord、腾讯元宝、小艺、MQTT（IoT）共 10 种；支持扫码绑定与机器人自助创建；Web、CLI、IM、定时任务共用同一条消息处理链路。诚实边界：未提供 WhatsApp / Teams 通道。结论条：员工不需要学新工具——在已经在用的聊天框里直接派 AI 干活。

### P28 · ACP + MCP 双向开放
- `type`: content ｜ `role`: hero ｜ `rhythm`: peak
- `layout`: 全幅深色底 + 中心枢纽图（入站/出站双向箭头）
- `visual`: L1 `interop.png` 深底 + 上层 SVG 双向协议枢纽
- `visual_role`: anchor
- `density`: 字数约 230 / 图片 1 + 图形 1 / 留白约 20%
- `anti_pattern`: 禁止把四个方向画成对称十字；必须区分"我们调用外部"与"外部调用我们"
- `description`: 入站：外部 IDE / 终端 AI（Zed、OpenCode 等）通过 ACP 使用本机 Agent（`ydsz-worker acp`）；出站：把任务委派给 OpenCode / CodeBuddy / Claude Code / Codex；MCP 出站网关 + MCP 入站服务（把专家暴露成 MCP 工具）＋ 内部 MCP 会话端点。结论条：既是对等协作者，也是被调用的服务——不会把你锁进单一工具链。

### P29 · 模型自由：不被供应商锁定
- `type`: content ｜ `role`: supporting ｜ `rhythm`: valley
- `layout`: 三栏非均分（数量 / 覆盖 / 本地）
- `visual`: L2 SVG 供应商轮辐图
- `visual_role`: evidence
- `density`: 字数约 250 / 图形 1 / 留白约 22%
- `anti_pattern`: 禁止等宽三栏；禁止把厂商名做成 Logo 墙
- `description`: 40 个供应商模板、390 个内置模型；37/40 为 OpenAI 兼容协议（任何兼容端点即可接入），3 个 Anthropic；覆盖 OpenAI、Anthropic、Gemini、Groq、DeepSeek、DashScope（含国际/美国站）、智谱、Moonshot、MiniMax、火山引擎、硅基流动、ModelScope；Ollama 本地模型管理与本地 ONNX Embedding；per-thread / per-agent / per-turn 模型切换，含 failover 与 token 配额中间件。结论条：换模型是配置项，不是重构项目。

### P30 · 章节 05 扉页
- `type`: section ｜ `role`: transition ｜ `rhythm`: transition
- `layout`: 章节大字（同版式）
- `visual`: 无 ｜ `visual_role`: atmosphere
- `density`: 字数约 40 / 图片 0 / 留白约 55%
- `anti_pattern`: 同 P3
- `description`: 编号「05」+「落地与保障」，一行说明「从一条命令开始，到全公司热运行」。

### P31 · 数据主权：存储与控制面
- `type`: content ｜ `role`: supporting ｜ `rhythm`: valley
- `layout`: 对比式 / 分层图（控制面 vs 工作区数据面）
- `visual`: L1 自绘 SVG 双层：控制面 SQLite/PG + 数据面 8 种工作区后端
- `visual_role`: anchor
- `density`: 字数约 260 / 图形 1 / 留白约 20%
- `anti_pattern`: 禁止左右等量；禁止把 8 种后端排成 4×2 网格
- `description`: 控制面：SQLite WAL 起步，可平滑切 PostgreSQL，21 个版本化迁移（SQLite / PG 双方言各 42 份脚本）；数据面与 Agent 文件分离：本地磁盘、Docker 沙箱、OpenSandbox、PostgreSQL、腾讯云 COS、阿里云 OSS、华为云 OBS、通用 S3。结论条：从单机试点到集群化部署，不需要换产品。

### P32 · 五种部署形态
- `type`: content ｜ `role`: supporting ｜ `rhythm`: valley
- `layout`: 横向时间轴 / 阶梯（一条命令 → Docker → 系统服务 → 桌面客户端 → NAS）
- `visual`: L2 SVG 阶梯 + 命令行片段
- `visual_role`: evidence
- `density`: 字数约 250 / 图形 1 / 留白约 22%
- `anti_pattern`: 禁止五张并列卡片；必须体现从轻到重的递进
- `description`: 一键脚本安装（Linux/macOS/Windows PowerShell，自动创建隔离 Python 3.12 环境）；Docker Compose（含国内镜像 Compose 与 PostgreSQL Compose）；systemd / launchd / Windows 服务；桌面客户端 Win/macOS/Linux + 飞牛 FnOS 原生包；Web 控制台支持 PWA 安装与移动端。内建 ACME TLS 与自更新。结论条：无论是一台笔记本还是一台 NAS，都能跑——上线路径不依赖云厂商。

### P33 · Web 控制台与使用体验
- `type`: content ｜ `role`: supporting ｜ `rhythm`: valley
- `layout`: 左图右文（7:3，左为 SVG 控制台结构图）
- `visual`: L2 SVG 控制台分区结构（导航分组 + 对话区能力条）
- `visual_role`: evidence
- `density`: 字数约 260 / 图形 1 / 留白约 20%
- `anti_pattern`: 禁止 50:50；禁止把 20 个页面名平铺成清单
- `description`: 前端 React 18.3 + TypeScript 5.8 + Vite 6.4 + Ant Design 5.29，1,033 个源文件 / 200,684 行 / 267 个测试文件；4 个导航分区约 20 个一级页面（对话、专家、定时任务、Token 用量、技能/子智能体/工具/插件/MBTI/记忆/通道、连接器、知识库、工作台、远程桌面、ACP、用户、模型、存储、安全、高级设置）；对话基于 WebSocket 双向流式，支持 12 类消息帧、随时停止、中途干预、引用溯源面板、轨迹检视；明暗主题、中英双语、PWA、移动端适配。结论条：交付的不是演示 Demo，而是经过完整工程化打磨的操作界面。

### P34 · 场景一：智能客服与客户响应
- `type`: content ｜ `role`: supporting ｜ `rhythm`: valley
- `layout`: 流程链（用户提问 → IM 通道 → 知识库检索 → 带引用作答 → 升级转人工）
- `visual`: L1 自绘 SVG 端到端流程 + 三个收益读数
- `visual_role`: anchor
- `density`: 字数约 240 / 图形 1 / 留白约 22%
- `anti_pattern`: 禁止把收益写成"降本增效"四字成语；每个收益必须能量化或可核验
- `description`: 把 IM 通道（企业微信 / 飞书 / 钉钉）接上知识库：客户问题进同一条消息管线，检索私有文档后带引用出处作答；不知道就 `ask_user_question` 反问或升级人工；对话沉淀进长期记忆，下一次不用重讲背景。结论条：答复有出处、背景记得住，客服不用在十个系统间来回切。

### P35 · 场景二：研发提效
- `type`: content ｜ `role`: supporting ｜ `rhythm`: valley
- `layout`: 对比式（传统 Copilot 单点补全 / 本平台可控执行）
- `visual`: L2 SVG 双向 ACP 示意
- `visual_role`: evidence
- `density`: 字数约 250 / 图形 1 / 留白约 20%
- `anti_pattern`: 禁止两侧都写"快"；区别必须具体到权限与边界
- `description`: 在 IDE 里直接调用本机 Agent（ACP 入站），或把复杂任务委派给 OpenCode / CodeBuddy / Claude Code / Codex（ACP 出站）；读写文件、跑 Shell、开浏览器验证都在带 HITL 审批与命令守卫的边界内进行；每一次命令进轨迹账本。结论条：不是给开发者一个更会说爱的输入框，而是给团队一个受管控的执行者。

### P36 · 场景三：自动化运营 / 知识办公
- `type`: content ｜ `role`: supporting ｜ `rhythm`: valley
- `layout`: 2×3 情景网格（六格：日报周报 / 数据看板 / 网页操作 / 主动关怀 / 知识沉淀 / 远程运维）
- `visual`: L2 SVG 六格卡片（每格一个功能语义图标 + 一行说明）
- `visual_role`: evidence
- `density`: 字数约 250 / 图形 1 / 留白约 22%
- `anti_pattern`: 禁止六格等大且都两字标题；每格必须有具体触发方式或产出物
- `description`: 定时任务（cron/interval/date/邮件触发/主动关怀）推送日报周报与数据看板；浏览器 AI+ 做网页操作录制并生成可复用技能；知识库做团队文档检索与经验沉淀；终端 AI+ / 远程桌面 / 远程浏览器做远程运维；语音输入输出降低使用门槛。结论条：重复的事交给定时任务，重复的操作录成技能——人力回到需要判断的地方。

### P37 · 工程底座与开源承诺
- `type`: content ｜ `role`: hero ｜ `rhythm`: peak
- `layout`: 巨型数字 + 洞察 + 底部承诺条
- `visual`: L1 `foundation.png` 深底 + 三个锚点数字
- `visual_role`: anchor
- `density`: 字数约 220 / 图片 1 + 数字 3 / 留白约 25%
- `anti_pattern`: 禁止把三个数字排成等宽一行；必须有判断句而非只是数字
- `description`: 锚点：339,921 行 Python 自研代码（主包 161,372 + harness 75,755 + memory 59,051 + gateway 29,092 + browser 14,651）；832 个测试文件；MIT 开源许可。说明上层与 Octop 开源生态的版本同步承诺（harness / gateway / memory / browser 子组件随上游正式版对齐），以及 pytest + ruff + mypy 的质量门槛。结论条：可审计的代码体量 + 明确的开源协议 = 长期可用的确定性。

### P38 · 结尾页：从这里开始
- `type`: ending ｜ `role`: hero ｜ `rhythm`: peak
- `layout`: 满版图 + 渐变蒙层收尾
- `visual`: L1 `ending.png`
- `visual_role`: anchor
- `density`: 字数约 60 / 图片 1 / 留白约 50%
- `anti_pattern`: 禁止只写"谢谢"；禁止塞数据表与脚注；禁止整页淡色无焦点
- `description`: 大字「从一条命令开始」，下方三行行动路径：`ydsz-worker init` → `ydsz-worker run` → 打开 http://127.0.0.1:8088。

---

## 七、节奏与版式自检预算

| 章节 | 页数 | Hero 页 | Supporting 页 |
|---|---|---|---|
| 封面 / 目录 | 2 | P1 | P2 |
| 01 认识云顶 | 5（含扉页） | P4、P7 | P5、P6 |
| 02 能力全景 | 10（含扉页） | P9、P12、P14、P16、P18 | P10、P11、P13、P15、P17 |
| 03 安全与治理 | 6（含扉页） | P20 | P21、P22、P23、P24 |
| 04 连接与集成 | 5（含扉页） | P26、P28 | P27、P29 |
| 05 落地与保障 | 9（含扉页） | P31、P37 | P32、P33、P34、P35、P36 |
| 结尾 | 1 | P38 | — |

- Hero 页共 11/38 ≈ 29%，符合 20–30% 区间
- Hero 之间均以 Supporting 页隔开，无相邻 Hero
- 相邻页版式强制不同：已逐页指定 layout，无连续重复
- 对称性：仅 P2、P20 为对称/近对称，远低于"全篇最多 2 页对称"上限之下（其余全为非对称）

---

## 六·补 补充页面（第二轮：补收尾，总页数 38 → 41）

| 页 | 标题 | 版式 | 要点 |
|---|---|---|---|
| P38 | 路线图：已经做到的、正在做的、打算做的 | 三段状态行（已完成 / 进行中 / 规划中）+ 底部诚实说明 | 内容取自 README「规划」章节；明确"规划项不承诺时间" |
| P39 | 三条路径：从一台机器到全公司共用 | 三栏卡（374 / 354 / 374） | 自助验证 / 团队部署 / 规模推广；结论：三路径共用同一份配置与数据 |
| P40 | 今天就跑起来：四个入口与一个二维码 | 名片式（左条目 + 右二维码卡） | 开源仓库、PyPI、桌面客户端 Releases、文档；二维码指向已验证可访问的 GitHub 仓库 |
| P41 | 从一条命令开始（结尾页） | 满版浅渐变 + 三步行动路径 | 原 P38 结尾页顺延 |

**注意**：P2 目录页的章节起始页码不受影响（05 落地与保障仍为 P29），无需改动。

