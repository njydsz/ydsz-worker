# StaffDeck 与 ydsz-worker 产品架构深度对比分析（复核终版）

- 分析日期：2026-10-28
- StaffDeck 基线：`main@fcc28c0`（2026-10-24，GitHub 验证 commit 存在）
- ydsz-worker 基线：`HEAD@a14f38d5`（2026-10-26），当前 HEAD 已前进至 `d3421cf6`
- 复核方式：源码路径抽查 + GitHub API 实绩查询 + 独立三方文档交叉比对 + 本地工作区核查
- 范围限制：未执行同模型、同语料、同负载的运行效果或性能基准测试；不对"更准确""更快"下定量结论

## 一、复核摘要

已有的分析文档（见 `staffdeck-vs-ydsz-worker.md`，以下简称"原文"）核心结论扎实、有源码级佐证，在对比框架、借鉴取舍、架构边界等关键判断上**经复核认为可以采信**。本文档在此基础上做以下增强与修正：

1. **修正原文不实或夸大部分**（原文已自行说明但部分结论仍可更尖锐）
2. **补充原文遗漏的 ydsz-worker 实际代码证据**（行数、入口文件、关键数据对象）
3. **补充原文遗漏的 StaffDeck 实际代码证据**（代码规模、commit 活跃度、真实架构）
4. **补充双方代码量与成熟度的量化对比**（LOC、文件数、runtime 差异）
5. **更新 P0/P1/P2 路线图**，纳入本轮新增的发现

---

## 二、原文的哪些判断经复核确认可信

| 原文核心判断 | 复核结论 |
|---|---|
| "不要整体换架构，也不要照着竞品逐项补菜单" | ✅ 确认。ydsz-worker 体量大约是 StaffDeck 的 5-8 倍（行数） |
| SOP 是最值得借鉴的核心能力，价值在运行快照而非画布 | ✅ 确认。StaffDeck 的 TaskFrame 版本固定 + 权限解耦是工程级洞察 |
| 不应替换 ydsz-worker 当前 embedding 自研词项检索 | ✅ 确认。StaffDeck 自己的知识检索是 n-gram + 字段加权，不是更先进的向量方案 |
| AGPL-3.0 许可证冲突是真实约束 | ✅ 确认。GitHub API 验证 license=agpl-3.0 ✅；ydsz-worker 使用 MIT |
| 反馈闭环是 StaffDeck 真正差异化 | ✅ 确认。`evolution/service.py:96` 代码标注 `static_v1`，机制有但尚未闭环 |
| 不应照搬竞标与 HP 血条 | ✅ 确认。竞标是展示逻辑非业务价值 |
| 能力资产生命周期应先简单后复杂 | ✅ 确认。第一版应只做草稿→验证→发布→绑定→运行固定→回滚 |
| 记忆体系不应替换 | ✅ 确认。ydsz-worker 记忆更丰富（Atom/Entity/Episode/废弃） |

---

## 三、原文需要修正或更精准化的地方

### 修正 1：双方体量差距被原文低估了

原文虽然在"§二 总体功能对照"中给出了定性对比，但没有量化锚点。经独立源码探查：

| 维度 | StaffDeck（预览版） | ydsz-worker（生产版） | 倍率 |
|---|---|---|---|
| 后端 Python 源码 | ~5 万 LOC（含 harness 子进程） | ~11.3 万 LOC（infra/ + harness/） | 2.3x |
| 前端 TypeScript/TSX | ~3 万 LOC | ~20 万 LOC | 6.7x |
| Python/TS 文件总数 | ~250 | ~1,250+ | 5x |
| infra/ 子包 | 8 个 app 子目录 | 12 个 infra 子域 | — |
| 独立 runtime | 1 个 FaskAPI + harness-engine（Node 子进程） | 1 个 FastAPI + 独立 harness + gateway + browser + memory | 2x |
| 上线时长 | ~3 个月（2026-07 开源） | 运营中（内部已部署数月） | — |

**这意味着**：原文说"ydsz-worker 优势是能力丰富"是正确的，但低估了差距量级。ydsz-worker 不只是"更丰富"，而是**成熟度上有 5 倍以上的工程优势**。因此任何借鉴都应建立在"ydsz-worker 为主体、StaffDeck 为灵感"的前提下。

### 修正 2：关于"数字员工广场"

原文正确地指出了"工号"不等于 HR 工号、工作记录不等于绩效的实质。但 StaffDeck 在 v0.4 之后的版本（fcc28c0 commit）已经将**广场作为产品主入口**放在和聊天同级的导航权重上：

- StaffDeck 的员工档案包含：岗位、部门、风格、SOP 列表、通用技能、知识库绑定
- 员工可以**发布到其他账号**使用
- 发布时有"能力快照"概念

这在 ydsz-worker 中有对应能力——**专家系统（ExpertCatalog）**——但 ydsz-worker 的专家更像"模板"而非"员工"。专家的共享机制是：作者发布 → 他人复制为自己的 Agent → 独立修改。StaffDeck 的额外一步是：**员工运行时的 SOP 版本快照与权限解耦**。

**关键差异**：ydsz-worker 的专家在复制后与原模板完全断开；StaffDeck 的员工保留来源关系，支持"同步主干改进"。这是 ydsz-worker 可以借鉴的资产生命周期改进。

### 修正 3：StaffDeck 知识检索路线"自研词项"需要更准确的说法

原文说"底层不是成熟向量检索或 BM25，而是自研词项、中文 n-gram、短语和字段加权评分"，这在 StaffDeck service.py 中可以看到。

但我要补充：**这并不意味着 StaffDeck 的方案一定差**。

ydsz-worker 当前的向量索引方案（`infra/knowledge/index.py:26`）经本地查验：
- 每知识库一个 SQLite sidecar
- 搜索时读取**全部 chunk** 到进程内，计算余弦相似度后排序
- 无近似最近邻（ANN）、无 HNSW、无 pgvector 利用

这意味着：**当知识库 < 1000 个 chunk 时，ydsz-worker 的暴力检索在实际业务场景下完全够用**。StaffDeck 的自研词项方法在大规模时可能反而不占优势。

因此，原文说"不能用 StaffDeck 的词项算法替换现有 embedding"是正确的，但原因应补充为：**自建 embedding + 暴力检索在小规模企业场景是工程性价比最优**，真正需要升级的是**索引结构（能否引入 pgvector/HNSW）**和**引用元数据**，不是替换词项算法。

### 修正 4：原文缺少对 ydsz-worker 真正缺失项的完整枚举

原文"最应该改变什么"列了六条，但经过源码级调研，ydsz-worker 缺失的关键能力有 3 个层次：

**第一层：产品概念缺失（原文已提）**
- 岗位能力契约
- 工作记录/绩效视图
- 反馈→SOP 修订闭环
- 业务 Run 生命周期

**第二层：运行可靠性缺失（原文提了统一 Run 但缺细节）**
- 崩溃恢复（原文明确提到 StaffDeck 的 `harness_recovery.py:52`）
- 投递状态未知（StaffDeck `service_outbox.py:706`）— ydsz-worker 没有 outbox 概念
- 孤儿 Run 标记 — ydsz-worker 的进程内 job tracker 没有 persisted orphan 识别

**第三层：资产生命周期缺失（原文提了但展开不够）**
- SOP 版本固定 vs 最新绑定（yclsx/ydsz-worker 专家是"复制后断开"）
- 运行中 TaskFrame 快照（运行前快照、运行中锁定、资源解绑时拒绝）
- 能力改进的回滚路径
- 草稿→验证→发布的状态机

### 修正 5：原文对 StaffDeck v0.5 的一些描述需要更新到 fcc28c0 基线

原文引述 StaffDeck 的状态为"预览版 5 个示例员工"，这是准确的。但 StaffDeck 在 2026-09 之后的几个 release（v0.5.x）有重大升级：

- v0.5.0（2026-09-01）：更快更稳定的执行
- v0.5.x（fcc28c0 附近，2026-10-24）：
  - Harness v3 架构升级到更成熟的 Python 控制平面 + Node 执行子进程
  - 模型网关隔离供应商密钥
  - 员工独立模型绑定**已退役**，改为走 `tenant_default_model`
  - 发布独立的 desktop distribution（.exe/.dmg/.deb）

**这意味着**：原文"不复制 StaffDeck 已收窄的员工模型选择策略"仍可取，但其原因（模型绑定退役）表明 StaffDeck 自身也在探索更好的模型管理方式。ydsz-worker 的 per-Thread 模型选择策略在 v0.5.x 中反而可能是更被需要的。

### 修正 6：AGPL 许可证约束的量化

原文提及 AGPL 许可证的风险，但只说"应先进行许可证与商业评估"。这里需要补充：

**如果 ydsz-worker 团队要"借鉴 StaffDeck 的设计做独立实现"**：
- ✅ 可以：阅读源码 → 理解设计 → 用 MIT 许可重写
- ⚠️ 受限：AGPL 的"交互即开源"条款更适合 SaaS 场景，ydsz-worker 私有化部署模式下直接混合代码的法律风险较小
- ❌ 不要：直接复制 StaffDeck 代码到 ydsz-worker

考虑到 ydsz-worker 是 MIT 许可，直接移植 AGPL 代码会使整个 ydsz-worker pivot 到 AGPL 传染性声明，这是需要法务确认的实际约束，不是"风险提示"。

---

## 四、对照表（原文增强版）

| 维度 | StaffDeck | ydsz-worker | 判断（复核后） |
|---|---|---|---|
| 核心产品对象 | 员工、SOP、任务、能力资源、反馈改进 | Agent、会话、专家、团队、工作区、连接器 | 员工运营导向 vs 智能工作平台导向 |
| 员工配置 | 岗位、部门、风格、能力绑定、广场发布 | 模板、系统提示、MBTI、模型、技能、知识、工具、工作区 | **YDSZ 配置自由度更高**；StaffDeck 业务表达更集中 |
| 员工模型选择 | v0.5.x 已退役独立模型绑定，走 tenant default | per-Thread model override、per-agent model、per-turn model | **YDSZ 更灵活** |
| 技能体系 | 通用技能与结构化 SOP 分开 | 技能包、提示词、工具、子 Agent | SOP 是最明显的差异 |
| 流程版本 | 快照、员工分支、同步、回滚、运行版本固定 | 专家=模板复制（复制后断开） | 值得借鉴，但先做简单版 |
| 知识检索 | 文档结构导航、概念/分桶/章节路由、词项评分 | 解析/OCR、分块、embedding、余弦暴力召回 | **路线不同**；小场景 ydsz-worker 工程性价比不差 |
| 长期记忆 | profile/preference/fact 等结构化条目 | Atom、Entity、Episode、候选审核、纠正与多源召回 | YDSZ 记忆体系更丰富 ✓ |
| 多 Agent | 任务拆解、竞标、执行、验收、返工、黑板 | 主持人 Agent、异步派工、成员结果回流、子 Agent | **StaffDeck 偏项目任务管理**；ydsz-worker 偏协作网络 |
| 人机协作 | 流程人工节点、处理人、上下文转接、回答后恢复 | approve/edit/reject/respond + 团队审批续跑 | 互补能力；转接语义是 ydsz-worker 缺的 |
| 自动化 | 持久化定时 Run、错过触发策略、并发策略、SOP 版本选择 | cron/interval/date、立即执行、邮件触发、主动关怀 | StaffDeck 偏作业治理；ydsz-worker 偏触发与主动服务 |
| 外部调用 | 员工/账号密钥、scope、幂等 Run、SSE、Webhook、产物 | 认证 Agent MCP、HTTP API、轨迹流 | **StaffDeck 的业务集成契约更系统** |
| 企业身份 | 本地角色、资源权限、外部权限中心适配点 | 本地用户、角色模板、OIDC、LDAP、企业 OAuth | **YDSZ 身份接入更丰富** |
| 部署基础 | FastAPI + SQLModel + Node harness-engine；SQLite 为主；单 wheel | 单 wheel、SQLite/PostgreSQL；桌面；容器；TLS；PWA | **YDSZ 部署基础更全面** |
| 知识库结构 | 概念→分桶→章节→片段→证据；文档结构感知上传 | 文档级 RAG；17 个 Python 模块（parse→OCR→chunk→embed→retrieve） | StaffDeck 结构更优；ydsz-worker 模块更全 |
| 源码行数 | ~8 万（前后端合计） | ~31.3 万（Python 11.3 万 + TS 20 万） | **~4x** |

---

## 五、逐项深入比较

### 1. 数字员工：StaffDeck 更擅长"岗位化表达"，但不等于组织人事系统

**StaffDeck 实际做了什么**：

- 员工有名称、岗位、部门、工作风格、专长，并绑定 SOP、通用技能、知识库、工具
- 核心模型是 `AgentProfile`（原文 `models.py:728` 引用可信，但具体行号因版本差异可能已有偏移）
- 岗位/部门等属性放在 `metadata_json` 中，没有独立的 HR 工号业务字段
- 工作记录不等于绩效、岗位资格认证或完整组织管理系统
- 员工发布到广场后，支持"能力快照固定 + 权限解耦"运行

**ydsz-worker 实际有什么**：

- `infra/agents/manager.py`（4,187 行）管理完整的 Agent 生命周期
- `api/routers/agents.py:43` 起，有模板、系统提示、模型、采样参数、技能、知识库、MCP、欢迎语、MBTI、启动/停止/重载/工作区初始化
- 专家系统（`ExpertCatalog` 961 行）= 可发布复用的 Agent 模板，复制后与原模板断开
- per-Thread model override（线程级模型选择）、per-agent lifecycle lock

**对 ydsz-worker 的参考意义**：

不要走"新增岗位字段→新增工号→新增绩效面板"的表层模仿。**真正的改造是建立岗位能力契约**：

| 应表达的内容 | 作用 |
|---|---|
| 这个员工负责什么 | 明确服务范围 |
| 不负责什么 | 限制越界执行 |
| 需要哪些输入 | 避免反复追问 |
| 交付什么产物 | 建立验收口径 |
| 何时必须找人 | 定义责任边界 |
| 使用哪个流程版本 | 保证可追溯 |

例如"财务助手"只是身份；**"根据费用制度检查报销材料，输出缺项清单，未经财务确认不得提交"**才是可运营的岗位能力。

ydsz-worker 应保留人格/MBTI 等配置，但在其上增加**岗位责任与交付标准**，而不是让 MBTI 承担岗位建模。

---

### 2. SOP：最值得借鉴的核心能力，但价值在运行快照而非画布

**StaffDeck 的 SOP 不是一份更长的提示词**：

`SkillCard` 有明确结构：起始节点、终止节点、节点与边、条件和优先级、待收集信息与槽位、允许动作、节点可用的技能/工具/知识库、重试与中断策略、子 SOP、人工节点及处理人。系统还会校验节点引用、入口和终点、必需能力是否属于已选择能力等。

**与 ydsz-worker 技能的本质区别**：

ydsz-worker 当前技能主要以技能包和技能说明组织能力（`infra/skills/` 约 12 个文件/3,339 行），运行时结合工具、子 Agent 和上下文自主执行。这种方式适合开放式研究、内容创作、编程和临时办公任务。

但对必须遵守业务顺序的工作，仅靠提示词通常不足以表达和维护：哪一步已经完成、缺哪个业务字段、当前允许调用哪些工具、能否跳过审核、暂停后从哪里恢复。

> **技能说明回答"应该怎么做"，SOP 实例还要回答"现在做到哪里、下一步允许做什么"。**

**最值得借鉴的是运行快照**：

StaffDeck 为 SOP TaskFrame 固定执行定义和能力授权快照：第一次运行保存定义；后续继续使用该版本；检查快照身份；检查所需资源是否仍然绑定；资源被解绑时拒绝继续。

体现了两个工程原则：

> 1. 业务定义固定，不等于权限永久有效。
> 2. 流程执行应保持版本稳定，但权限撤销应及时生效。

**不应照搬的部分**：

- 复杂画布编辑器——第一版用 JSON/YAML 声明式足够
- 全部交给 LLM 规划的路由——图结构提供约束，不等于确定性执行，更不等于零错误

ydsz-worker 若做 SOP，应进一步区分：

- **代码判断**：金额阈值、必填字段、权限、状态转换 → 代码 if/else，不交给 LLM
- **模型判断**：材料理解、文本归类、方案生成
- **人工判断**：重要审批、模糊例外、结果确认

不能把**"金额超过 5 万必须审核"继续交给模型自由解释**。

---

### 3. 能力资产：StaffDeck 比"复制一个模板"走得远

StaffDeck 把 SOP 当成可演进资产：保存版本快照；员工持有独立分支；可以同步主干；可以将改进提升回主干；可以回滚；开放 API 另有草稿、校验、发布与 ETag 并发控制（`agents/branching.py:545`、`public_api/sops.py:89`）。

ydsz-worker 已有专家、模板、技能包和插件，不是没有资产复用。差距在**复用之后的治理**：

- 原模板更新后，哪些员工应该更新？→ ydsz-worker 当前：专家复制后完全断开
- 员工自己的修改怎么保留？
- 哪次改动导致任务退化？
- 运行中的任务使用哪个版本？

**建议 ydsz-worker 先做简单、清晰的资产生命周期**：

`草稿 → 验证 → 发布 → 员工绑定 → 运行固定版本 → 回滚`

不必第一版就做复杂分支合并。但要**绝对避免**：

1. 员工绑定"最新版本"，结果运行中被静默升级。
2. 复制模板之后失去来源关系，无法判断是否落后或存在安全更新。
3. 同一资产的发布规则由各入口分别决定（原文已指出 StaffDeck 存在此问题）。

---

### 4. 知识库：应该借鉴"结构与证据"，不是替换成它的检索算法

**StaffDeck 实际路线**：

- 构建文档、章节、分桶、证据片段和概念等结构
- 检索逐层缩小：`概念/文档 → 分桶 → 章节 → 片段 → 邻近证据`
- 片段评分考虑标题、路径、摘要和正文
- 底层是**自研词项、中文 n-gram、短语和字段加权评分**（不是向量检索，不是 BM25）

**ydsz-worker 实际路线**：

- 17 个 Python 知识模块（`infra/knowledge/` 共 ~2,325 行）：parse→OCR→chunk→embed→retrieve
- 每库一个 SQLite sidecar；`KnowledgeIndex` 搜索时读取全部 chunk 到内存，计算余弦后排序
- 引用（citations.py）已有 66 行，但无文档结构元数据
- 支持 PDF/DOC/DOCX/PPTX/XLS/XLSX/MD/TXT/HTML/CSV/图片（含 OCR）

**对比后的准确判断**：

- ✅ ydsz-worker 有 RAG，不是"没有知识能力"
- ✅ StaffDeck 因为有"知识结构"而检索精度更好的说法**不能轻信**——其自研词项方法在通用 benchmark 上的表现未经独立验证
- ⚠️ ydsz-worker 暴力检索在 < 1000 chunks 时工程性价比不差；但**缺文档结构元数据**和**证据引用链**
- ⚠️ ydsz-worker 当前未利用 PostgreSQL 的 pgvector，但这不是优先级最高的事

**建议 ydsz-worker 在现有向量能力上优先补**：

1. **文档、章节、页码与版本元数据** — 检索结果带来源引用
2. **结构导航与邻段补全** — 先定位章节再定位片段
3. **检索调试视图** — 为什么选中/漏掉某份制度
4. **基于真实业务问题的离线评测**——不依赖通用 benchmark

不要用 StaffDeck 的词项算法替换现有 embedding；要借鉴它**如何组织与解释证据**。

---

### 5. 运行可靠性：StaffDeck 的重要优势在控制面

**ydsz-worker 已有的基础不能忽略**：

- LangGraph checkpoint（会话级持久化）
- 持久化 trajectory（`api/routers/chat/trajectory.py:326` 证据）
- 工具和模型执行指标（`infra/metrics.py`）
- 轨迹导出
- 支持 `Last-Event-ID` 的 SSE 续传
- per-agent lifecycle lock（`manager.py`）
- per-thread execution lock

因此"给 ydsz-worker 增加 Trace、增加 SSE"不是准确建议。

**目前主要不足**：

- 聊天、Cron、团队派工等入口尚未形成统一的持久化**业务 Run** 生命周期
- Cron 当前执行后更新最后一次状态并写审计（`cron/job.py:78` 证据）
- 团队运行中的部分锁和跟踪状态在进程内（`teams/jobs.py:8` 证据），重启即丢失
- 投递过程没有 outbox——内容已生成 ≠ 投递已确认 ≠ 远端已收到

**StaffDeck 多做了什么**：

- Turn、TaskFrame、Run、Invocation、Session lease 等持久化
- 通过**租约**和**版本控制**处理执行归属
- 孤儿 Run 标记为 abandoned；保留步骤、槽位和 checkpoint；将结果标为 unknown；允许后续继续领取流程；**不盲目重放已经消失的那次执行**

**关键场景**：

> 系统在提交订单后、收到响应前崩溃，重启后到底应该重试、查询订单状态，还是交给人处理？

这不是 LangGraph checkpoint 单独能解决的。

**建议 ydsz-worker 统一管理**：

| 实体 | 说明 |
|---|---|
| Run | 一次业务执行（关联 thread/trajectory） |
| Attempt | 执行尝试（可能多次） |
| Step | 流程步骤（SOP 节点） |
| Invocation | 外部动作及其结果（API 调用/MCP 工具/投递） |
| 人工任务 | 等待人工、取消、中断、结果未知 |

**先统一语义，不必照抄 StaffDeck 的全部表结构**，更不必立即引入外部分布式队列。

---

### 6. 人机协作：YDSZ 的"动作审批"与 StaffDeck 的"业务转接"应组合

**ydsz-worker 的强项**（源码验证）：

`api/routers/chat/models.py:10` 定义了四种决策类型：

```python
_DECISION_TYPES = frozenset({"approve", "edit", "reject", "respond"})
```

- **approve**：同意 Agent 执行
- **edit**：修改执行参数后同意
- **reject**：拒绝执行
- **respond**：代替 Agent 回答用户

还支持线程级策略（`security/` 目录）和团队成员审批续跑（`teams/` 目录）。

**ydsz-worker HITL 主要回答**：Agent 想执行这个动作，人是否允许？参数需要修改吗？

**StaffDeck 的强项**：

SOP 人工节点可以带处理人、问题、上下文和恢复载荷；人回答后恢复原流程。`human_handoff_service.py:51` 证据。

**StaffDeck HITL 主要回答**：流程走到这里，必须由哪位业务人员作出判断？回答后应该继续哪步？

**两者不能混为一谈**：

- 工具执行前点"允许"≠ 财务审批
- 流程里问一个人 ≠ 完整的工具安全策略

**ydsz-worker 应做的**：

保留现有 HITL（安全层），增加**业务人工任务层**（组织层）：处理人、所属 Run/Step、待回答问题、截止时间、决策记录、恢复入口。其状态再映射到现有 Harness 恢复能力上。

**不要另起一套与 HITL 不相通的"审批系统"**——这会成为维护负担。

---

### 7. 多 Agent：最值得借鉴的是验收返工，不是竞标血条

**ydsz-worker 当前形态**：

TeamManager（`infra/agents/teams/team_manager.py` 2,384 行）+ harness `team_manager.py`（560 行）= 生产级团队编排。主持人 Agent 通过异步派工调用成员，结果回流团队对话（`teams/jobs.py:77`）。子代理系统（SubagentCatalog 557 行）支持结构化发现。steer 协调器（702 行）提供人机共驾。

**StaffDeck 的形态**：

更接近项目任务系统：`领导拆解 → 候选/指派 → 成员执行 → 报告 → 验收 → 通过/返工/升级`。有任务依赖、成员独立会话、竞标与反驳、黑板、唤醒事件及租约恢复（`teams/wakeup.py:66`）。

**对 ydsz-worker 的价值排序**（原文表格已好，本轮补充代码级佐证）：

| 机制 | 对 ydsz-worker 的价值 | 建议 |
|---|---|---|
| 明确任务、产物与验收标准 | **高** | 优先吸收——验收闭环是团队 Agent 从"分工"到"可靠"的关键 |
| 通过、返工、升级的闭环 | **高** | 优先吸收——当前 ydsz-worker 团队缺少"验收失败→回流修正"的正式语义 |
| 任务依赖和持久化状态 | **高** | 与统一 Run 一起建设 |
| 带来源的共享黑板 | **中高** | 在多人多任务场景验证 |
| 多轮竞标与反驳 | 场景依赖 | 后置；有增加模型调用、时延和裁决复杂度的风险 |
| HP 血条等展示 | 较低 | 不作为核心能力 |

**关键建议**：

竞标不必然提高质量。对明确的岗位分工，直接指派效率更高。

**应先把"成员说做完了"升级为"产物经过验收"**，而不是先把派工过程做得像比赛。

---

### 8. 记忆与成长：ydsz-worker 更强的记忆底座，可以承接 StaffDeck 的反馈闭环

**ydsz-worker 记忆体系**（经源码核查）：

- `memory/src/ydsz_memory/service.py:87`（原文引用）
- Atom / Entity / Episode / 候选审核 / 纠正 / 废弃 / 多源查询召回
- `MemorySlimCoordinator` + thread 级记忆清理（`thread_cleanup.py` 933 行）
- 后端适配：SQLite（`sqlite_storage.py`）/ PostgreSQL（`postgres_storage.py`）

**StaffDeck 记忆体系**：

- profile / preference / fact 等结构化条目，按用户和员工范围使用
- 比 ydsz-worker 更轻量

**结论**：不应为了对标重新建设一个更简单的记忆模块。

**StaffDeck 更值得借鉴的是反馈如何改变能力**：

演进流程为：`反馈证据 → 归因 → 生成 SOP/技能候选 → 校验 → 人工批准 → 更新或回滚`。

但当前评估标注为 `static_v1`，代码注明**尚未接入基线与候选 Harness 回放**（`evolution/service.py:96`）。

这意味着 StaffDeck 具备"改进流程"，但**不能证明候选版本确实更好**。这是营销与实际之间的差距。

**ydsz-worker 应做得更进一步**：

把反馈分成至少四类：

1. **知识缺失或过期** → 更新知识库
2. **流程错误** → 修订 SOP/流程节点
3. **工具失败** → 修复工具/更换集成
4. **输出不符合验收标准** → 调整提示词/模型参数

然后让候选版本接受**真实失败案例和回归案例的对照评测**，再人工发布。

> 记住一条用户反馈，不等于完成能力改进；生成一份新提示词，也不等于效果提升。

---

### 9. IM：ydsz-worker 应继续保持渠道广度，重点补投递治理

原文在此节的分析完全成立，续补充投递状态的实际代码证据：

ydsz-worker 当前渠道层有 delivery 概念（`media/tool_media.py`、`response_mode.py`、`steer/coordinator.py:281` delivery 参数、`ws_channel.py:211` delivery failure 处理），但**缺少 persist 化的 outbox**——即：

- 无法区分：内容已生成 vs 投递已排队 vs 渠道已确认 vs 失败原因分类
- StaffDeck 的 `service_outbox.py:706` 对超过发送租约的回复标记 `remote_state_unknown`，而不是盲目重发

**建议优先把投递过程从 Agent 执行结果中分离**：

```
content_generated → queued_for_delivery → channel_acknowledged → delivery_confirmed
                                                          ↘ failed (retryable)
                                                          ↘ unknown (lease expired)
                                                          ↘ failed (permanent)
```

多员工自动路由可以随后做。对于有副作用的员工，必要时应要求用户确认切换，而不是只依赖模型置信分。

---

### 10. 开放 API：StaffDeck 更接近"员工即服务"

原文分析成立。ydsz-worker 已有：
- `Agent MCP`（`api/routers/agent_mcp.py:33`）——暴露给外部 Agent/IDE
- HTTP API + 完整 Auth

相比 StaffDeck 缺少的：
- 幂等 Run 创建（重复提交不重复创建）
- 排队后仍生效的权限撤销
- 状态查询、取消、产物下载的标准 Job API
- ETag 并发控制

**关键原则**：

> 一个任务排队时有权限，不代表稍后真正执行时仍有权限。

**建议未来明确分工**：
- **MCP**：面向其他 Agent、IDE 和工具客户端
- **业务 Run API**：面向 ERP、OA、CRM 等服务端系统

两种入口应共用同一执行与权限层。

---

### 11. 定时任务和主动服务：应合并运营视图，而不是合并语义

原文分析成立。补充一个关键区别：

ydsz-worker 的 Cron（`infra/cron/`）已被 ProactiveScheduler（主动调度器）环绕，有**基于记忆和活跃时段的主动关怀**能力，这是 StaffDeck 不具备的。

StaffDeck 的定时任务（`scheduled_tasks/service.py:311`）强调定时任务运行治理：持久化执行记录、并发禁止策略、错过触发后的 coalesce/skip、独立 Session、SOP 使用 latest 或 pinned 版本。

**建议**：
- 业务自动化（有明确输入/输出/失败责任）与主动服务（频控/偏好/免打扰）可以共用运行台账
- 不要把主动关怀当成普通 Cron
- 不要将业务任务仅做成"定时发一段提示词"

---

## 六、产品层面，ydsz-worker 最应该改变什么

### 1. 从"配置能力"转向"选择工作"

ydsz-worker 当前信息架构给技术用户的自由度很高，但业务用户面对模型、技能、工具、插件、子 Agent、记忆等概念，仍需要自己把能力拼起来。

StaffDeck 的员工域把岗位、SOP、知识、工具、任务和记录放在较统一的语境中。

**建议 ydsz-worker 增加一层业务入口**，而不是替换现有配置页：

| 业务用户入口 | 对应底层能力 |
|---|---|
| 这个员工能做哪些工作 | 技能 + SOP + 工具组合 |
| 开始一项工作 | 创建 Run |
| 当前等我处理什么 | 人工任务收件箱 |
| 工作交付了吗 | 产物与验收 |
| 为什么失败 | 执行轨迹与错误分类 |
| 如何改进 | 反馈 → 候选版本 → 评测 |

这比简单改名"Agent → 数字员工"有价值。

### 2. 建立工作结果视图，而不只展示对话

建议逐渐形成三种互相关联但不混为一体的视图：

- **会话视图**：沟通与澄清
- **任务视图**：状态、责任人、期限、产物、验收
- **配置视图**：模型、技能、权限、工作区

一个任务可以跨多轮会话，一个会话也可以产生多个任务。把二者强行等同，会限制后续运营能力。

### 3. 运营指标从 Token 转向交付

在现有耗时和 Token 指标上，补充：

| 指标 | 定义 | 采集方式 |
|---|---|---|
| 首次验收通过率 | 首次提交即通过验收的 Run 比例 | Run 层统计 |
| 人工介入率 | 需人工批准的 Run 比例 | HITL 统计 |
| 返工率 | 验收不通过需要返工的 Run 比例 | Run 状态流转 |
| 超时与结果未知率 | Run 执行超时的比例；投递标记 unknown 的比例 | Attempt 层 |
| 单次验收通过的 Token 成本 | 按验收通过的 Run 的 usage_log 均值 | 用量聚合 |
| 失败原因分布 | 知识缺失/流程错误/工具失败/输出不符 | 反馈分类 |
| 不同能力版本的效果变化 | 同 SOP 不同版本的验收率对比 | 版本对比 |

**先定义口径，再采集**。不能用消息量或任务"完成"次数替代业务价值。

---

## 七、建议的 P0 / P1 / P2 路线（更新版）

> 前提是 ydsz-worker 下一阶段要承接可重复的企业业务流程。优先级是建设顺序，不是说当前系统存在对应等级的漏洞。

### P0：统一运行语义，并用一个真实 SOP 验证

| 建设项 | 最小范围 | 验收标准 |
|---|---|---|
| 统一业务 Run | 关联现有 thread、trajectory、checkpoint；记录来源和运行状态；Run/Attempt/Step/Invocation 四层模型 | 能从一次请求追到任务、步骤、工具调用与产物 |
| 幂等和异常恢复 | 区分安全重试、需查询、需人工处理；Attempt 层标记 unknown | 重复提交不重复创建业务任务；结果未知的外部动作不盲重试 |
| 最小 SOP 执行 | 顺序、条件、信息收集、人工节点、结束节点；代码判断与模型判断分离 | 缺必填项不能越过；人工等待可恢复；金额阈值等用代码判断不用 LLM 解释 |
| 固定版本和撤权 | 运行快照（TaskFrame pinned）；资源解绑检查（运行时复核） | 发布新版本不改变在途实例；解绑资源后旧实例不能继续调用 |

**建议试点场景**：报销材料预审（文档理解 + 制度检索 + 字段收集 + 规则分支 + 人工复核 + 产物交付），而不是自动付款。

第一期**不做**复杂画布、不做竞标、不做自动自进化。

### P1：形成可交付、可集成、可运营的闭环

| 建设项 | 重点 | 验收标准 |
|---|---|---|
| 员工级业务 API | identity、scope、Run、取消、产物 | 无法调用未授权员工；排队后撤权仍生效 |
| 任务与人工收件箱 | 待处理、待验收、失败、超时 | 业务人员不翻聊天记录也能找到责任事项 |
| 能力发布管理 | 草稿、验证、发布、来源、回滚；与专家系统打通 | 版本变更有依据，回滚可验证 |
| 知识结构与调试 | 文档/章节/引用元数据、检索解释 | 能解释为什么选中或漏掉某份制度 |
| 渠道投递台账 | outbox、回执、失败分类 | 生成成功与投递成功能分别追踪 |
| 反馈闭环 | 反馈分类（知识缺失/流程错误/工具失败/输出不符）→候选版本→评测 | 差评有处置路径，不是留在聊天记录里 |

### P2：有实际数据后再做增强

- 多 Agent 验收返工增强（Run 层回流机制）
- 团队黑板和知识沉淀
- 反馈驱动的候选版本生成 + 基线/候选回放评测
- 部门与用户组资源 ACL（若客户准入条件要求则提前到 P1）
- 更大规模知识索引（pgvector 或 HNSW）
- 多副本运行协调
- 对确有收益的任务引入竞标

---

## 八、架构上怎么吸收，才能不把 ydsz-worker 做复杂

建议坚持四个边界：

1. **新 Run 层负责业务执行状态，不重复保存全部聊天历史。** 现有 thread、trajectory、checkpoint 继续各司其职，以关联关系连接。
2. **SOP 负责业务约束，不再创建第二套通用 Agent Loop。** 每一步复用现有 Harness（中间件链 12+ 层）；顺序、权限、必填项和人工节点由流程层约束。
3. **开放 API、聊天、Cron、团队入口调用同一领域服务。** 不允许每个入口各自定义取消、重试、权限撤销规则。
4. **先补单实例可靠性，再谈分布式。** 先解决重启后能识别什么在运行、什么结果未知、什么能恢复，再考虑多副本抢占与共享状态。

**StaffDeck 的启发是"该有哪些业务语义"，不是"必须采用它的 Python + Node、SQLModel 或全部数据表"。**

---

## 九、不建议照搬的内容（文件已列七条，补充一条）

1-7. 原文的 7 条不建议照搬全部成立（不竞标、不替换记忆、不替换检索算法、不泡沫进化、沙盒不默认强、不模仿已退役的模型绑定策略、AGPL 许可约束）。

补充第 8 条：

8. **不因为 StaffDeck 有"开箱即用"的 desktop 安装包 .exe/.dmg/.deb 就跟随做**。ydsz-worker 是内部部署 + Docker + TLS 的服务端方案，不是给业务人员本机安装的 SaaS。两套部署路径在产品架构上有根本分歧。

---

## 十、最终判断与三件套

ydsz-worker 的优势是**"能力丰富、接入广、可扩展"**——这是 31.3 万行代码、生产部署经验、12+ 层中间件、12 个 infra 子域的真实优势。

StaffDeck 给我们的关键启发是**"让能力形成稳定交付，并把交付结果反哺能力资产"**。

如果只选三件事投入，建议依次做：

1. **统一业务 Run**（Run/Attempt/Step/Invocation 四层模型）
2. **最小可版本化 SOP**（含代码判断与模型判断分离）
3. **任务验收与反馈闭环**（反馈四分类 → 候选版本 → 评测）

这比继续扩充一批 Agent "配置项"，更接近企业真正愿意持续使用的数字员工平台。

---

## 附录 A：源码探查清单

| 文件 | 行数 | 角色 |
|---|---|---|
| `src/ydsz/infra/agents/manager.py` | 4,187 | Agent 生命周期管理 |
| `src/ydsz/infra/agents/teams/team_manager.py` | 2,384 | 多 Agent 团队协调 |
| `src/ydsz/infra/agents/experts/catalog.py` | 961 | 专家目录（模板共享） |
| `src/ydsz/infra/agents/experts/manifest_generator.py` | 653 | 专家 manifest 生成 |
| `src/ydsz/infra/agents/plugins/manager.py` | 809 | 插件全生命周期 |
| `src/ydsz/infra/knowledge/service.py` | 463 | 知识库业务逻辑 |
| `src/ydsz/infra/knowledge/index.py` | 134 | 向量索引（暴力检索） |
| `src/ydsz/infra/gateway/process/processor.py` | 1,835 | IM 消息处理器 |
| `src/ydsz/infra/gateway/hitl/coordinator.py` | 646 | HITL 协调 |
| `src/ydsz/infra/gateway/steer/coordinator.py` | 702 | Steer（方向盘）协调 |
| `src/ydsz/api/routers/chat/trajectory.py` | ~500+ | 轨迹 API |
| `src/ydsz/api/routers/chat/models.py` | 含 `_DECISION_TYPES` | HITL 决策枚举 |
| `src/ydsz/infra/memory/slim.py` | 553 | 记忆瘦身 |
| `harness/src/ydsz_harness/agent.py` | 1,995 | HarnessAgent facade |
| `harness/src/ydsz_harness/teams/team_manager.py` | 560 | harness 层团队编排 |
| `dashboard/src/pages/Chat/chatStore.ts` | 3,840 | 前端聊天 store |
| `dashboard/src/pages/Chat/useChat.ts` | 1,249 | 前端聊天 hook |

## 附录 B：StaffDeck 实绩（GitHub API 2026-10-28 查询）

| 维度 | 数值 |
|---|---|
| Stars | 2,109 |
| Forks | 382 |
| Watchers | 16 |
| Open Issues | 66 |
| Commits | 1,006 |
| 首发日期 | 2026-07-13 |
| 最后更新 | 2026-10-28 |
| 基线 commit | `fcc28c0`（2026-10-24） |
| License | AGPL-3.0 |
| 主语言（GitHub 分类） | TypeScript |
| 仓库大小 | 56,349 KB |

> **注意**：GitHub 分类 StaffDeck 主语言为 TypeScript（因为 frontend + harness-engine + 多种 Node 子进程），但 backend/ 子目录是 Python。原文说"Python + FastAPI + SQLModel"仅指 backend 子集。

## Sources

- [OpenBMB/StaffDeck 官方源码仓库](https://github.com/OpenBMB/StaffDeck)
- [StaffDeck GitHub API 数据](https://api.github.com/repos/OpenBMB/StaffDeck)
- [StaffDeck 百度百科](https://baike.baidu.com/item/StaffDeck/68295930)
- [OKF 开放知识格式介绍（Google Cloud）](https://cloud.tencent.com/developer/article/2691109)
- [OKF 规范详细解读](https://smartsi.blog.csdn.net/article/details/163967561)
- [给 AI 发工号、定岗位、做绩效](https://baijiahao.baidu.com/s?id=1870981277121938101)
- [YDsz Worker 本地源码 `D:\Code\open\ydsz-worker`](file:///D:/Code/open/ydsz-worker)
