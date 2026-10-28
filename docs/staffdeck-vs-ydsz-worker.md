# StaffDeck 与 Ydsz Worker 产品、架构对比分析

- 分析日期：2026-10-28
- StaffDeck 基线：`main@fcc28c003ef188e6d0a11596d44fdfb3723b275b`（2026-10-24）
- Ydsz Worker 基线：`HEAD@a14f38d5d34999b9a85b0f9eb1dd8f9adb5d2fa4`（2026-10-26），并结合调研时的本地工作区源码
- 分析方式：源码、接口、数据模型、前端入口、权限与异常恢复路径的静态核查
- 范围限制：未执行同模型、同语料、同负载的运行效果或性能基准测试；不对“更准确”“更快”下结论

## 一、先给结论

StaffDeck 最值得我们借鉴的，不是“数字员工”这个包装，而是把 Agent 能力进一步做成“可交付、可管理、可迭代的业务资产”。

从当前代码看，两者的重心不同：

- ydsz-worker：以 Agent 为中心的企业智能工作平台。优势是能力覆盖面广，渠道、连接器、浏览器、工作区、模型配置、记忆、人格、主动服务及部署基础较完整。
- StaffDeck：以岗位、流程和任务为中心的数字员工运营平台。优势是 SOP 结构化、能力版本管理、任务运行持久化、人工转接、反馈改进和外部业务调用之间的关联更紧密。

建议：

> 保留 YDSZ 的运行底座和能力生态，借鉴 StaffDeck 的流程资产、运行控制和员工运营模型。不要整体换架构，也不要照着竞品逐项补菜单。

---

## 二、总体功能对照

| 维度 | StaffDeck | ydsz-worker | 判断 |
|---|---|---|---|
| 核心产品对象 | 员工、SOP、任务、能力资源、反馈改进 | Agent、会话、专家、团队、工作区、连接器 | 员工运营导向与智能工作平台导向的区别 |
| 员工配置 | 岗位、部门、风格、能力绑定、广场发布 | 模板、系统提示、MBTI、模型、技能、知识、工具、工作区 | YDSZ 配置自由度更高；StaffDeck 业务表达更集中 |
| 技能体系 | 通用技能与结构化 SOP 分开 | 主要通过技能包、提示词、工具和子 Agent 组织能力 | SOP 是最明显的差异 |
| 流程版本 | 快照、员工分支、同步、回滚、运行版本固定 | 有技能资产管理，但未见同等级 SOP 生命周期 | 值得借鉴 |
| 知识检索 | 文档结构导航、概念/分桶/章节路由、词项评分 | 解析/OCR、分块、embedding、余弦召回 | 路线不同，不能简单判断谁更先进 |
| 长期记忆 | profile/preference/fact 等结构化条目 | Atom、Entity、Episode、候选审核、纠正与多源召回 | YDSZ 记忆体系更丰富 |
| 多 Agent | 任务拆解、竞标、执行、验收、返工、黑板 | 主持人 Agent、异步派工、成员结果回流、子 Agent | StaffDeck 更偏项目任务管理 |
| 人机协作 | 流程人工节点、处理人、上下文转接、回答后恢复 | 工具审批、编辑参数、拒绝、回答、团队审批续跑 | 两者是互补能力，不是简单替代 |
| 自动化 | 持久化定时 Run、错过触发策略、并发策略、SOP 版本选择 | cron/interval/date、立即执行、邮件触发、主动关怀 | StaffDeck 偏作业治理；YDSZ 偏触发与主动服务 |
| IM | 多员工路由、身份合并、持久化投递与恢复 | 渠道覆盖更广、独立 Gateway、插件渠道 | 数量与运行可靠性要分别比较 |
| 外部调用 | 员工/账号密钥、scope、幂等 Run、SSE、Webhook、产物 | HTTP API、认证 Agent MCP、轨迹流 | StaffDeck 的业务集成契约更系统 |
| 企业身份 | 本地角色、资源权限、外部权限中心适配点 | 本地用户、角色模板、OIDC、LDAP、企业 OAuth | YDSZ 开箱身份接入更丰富 |
| 部署基础 | FastAPI + SQLModel，生产迁移主要围绕 SQLite | 单 wheel、SQLite/PostgreSQL、桌面、容器、TLS 等 | YDSZ 部署基础更全面；两者都不能直接视为多副本 HA |

---

## 三、逐项深入比较

### 1. 数字员工：StaffDeck 更擅长“岗位化表达”，但不是完整组织人事模型

#### StaffDeck 实际做了什么

员工不仅有名称和提示词，还能表达岗位、部门、工作风格、专长，并绑定 SOP、通用技能、知识库、工具。这些信息会进入运行身份提示，不只是前端展示。员工还可以发布到广场，被其他账号选择或复制。

需要纠正宣传语带来的误解：

- 核心模型仍然是 `AgentProfile`。
- 岗位等大量属性放在 `metadata_json` 中。
- 没有独立的 HR 工号业务字段，不能把系统生成的 Agent ID 理解为企业员工编号。
- 工作记录也不等于绩效、岗位资格认证或完整组织管理系统。

证据：[backend/app/db/models.py:728](file:///D:/Code/open/StaffDeck/backend/app/db/models.py#L728)。

#### YDSZ 已经有什么

YDSZ 的 Agent 配置更丰富：模板、系统提示、模型、采样参数、技能、知识库、MCP、欢迎语、MBTI，以及真正的启动、停止、重载和工作区初始化。

证据：[src/ydsz/api/routers/agents.py:43](file:///D:/Code/open/ydsz-worker/src/ydsz/api/routers/agents.py#L43)。

#### 对我们的参考意义

不要把“新增岗位、工号、部门三个字段”当作数字员工升级。

更值得增加的是业务能力契约：

| 应表达的内容 | 作用 |
|---|---|
| 这个员工负责什么 | 明确服务范围 |
| 不负责什么 | 限制越界执行 |
| 需要哪些输入 | 避免反复追问 |
| 交付什么产物 | 建立验收口径 |
| 何时必须找人 | 定义责任边界 |
| 使用哪个流程版本 | 保证可追溯 |

例如“财务助手”只是身份；“根据费用制度检查报销材料，输出缺项清单，未经财务确认不得提交”才是可运营的岗位能力。

YDSZ 应保留人格配置，但在其上增加岗位责任与交付标准，而不是让 MBTI 承担岗位建模。

---

### 2. SOP：这是最值得借鉴的核心能力，但价值不在画布

#### StaffDeck 的 SOP 不是一份更长的提示词

其 `SkillCard` 有明确结构：起始节点、终止节点、节点与边、条件和优先级、待收集信息与槽位、允许动作、节点可用的技能/工具/知识库、重试与中断策略、子 SOP、人工节点及处理人。系统还会校验节点引用、入口和终点、必需能力是否属于已选择能力等。

证据：[backend/app/skills/skill_schema.py:11](file:///D:/Code/open/StaffDeck/backend/app/skills/skill_schema.py#L11)。

#### 与 YDSZ 技能的本质区别

YDSZ 当前技能主要以技能包和技能说明组织能力，运行时结合工具、子 Agent 和上下文自主执行。这种方式适合开放式研究、内容创作、编程和临时办公任务。

但对必须遵守业务顺序的工作，仅靠提示词通常不足以表达和维护：哪一步已经完成、缺哪个业务字段、当前允许调用哪些工具、能否跳过审核、暂停后从哪里恢复。

> 技能说明回答“应该怎么做”，SOP 实例还要回答“现在做到哪里、下一步允许做什么”。

#### 最值得借鉴的是运行快照

StaffDeck 会为 SOP TaskFrame 固定执行定义和能力授权快照：第一次运行保存定义；后续继续使用该版本；检查快照身份；检查所需资源是否仍然绑定；资源被解绑时拒绝继续。

证据：[backend/src/staffdeck_harness/composition/pins.py:12](file:///D:/Code/open/StaffDeck/backend/src/staffdeck_harness/composition/pins.py#L12)。

这里体现了一个很好的原则：

> 业务定义固定，不等于权限永久有效。流程执行应保持版本稳定，但权限撤销应及时生效。

#### 不应照搬的部分

StaffDeck 的路由和步骤结果仍涉及模型规划。图结构提供约束，不等于确定性业务执行，更不等于零错误。

YDSZ 若做 SOP，应进一步区分：

- 代码判断：金额阈值、必填字段、权限、状态转换。
- 模型判断：材料理解、文本归类、方案生成。
- 人工判断：重要审批、模糊例外、结果确认。

不能把“金额超过 5 万必须审核”继续交给模型自由解释。

---

### 3. 能力资产：StaffDeck 比“复制一个模板”走得更远

StaffDeck 把 SOP 当成可演进资产：保存版本快照；员工持有独立分支；可以同步主干；可以将改进提升回主干；可以回滚；开放 API 另有草稿、校验、发布与 ETag 并发控制。

证据：[backend/app/agents/branching.py:545](file:///D:/Code/open/StaffDeck/backend/app/agents/branching.py#L545)、[backend/app/public_api/sops.py:89](file:///D:/Code/open/StaffDeck/backend/app/public_api/sops.py#L89)。

YDSZ 已有专家、模板、技能包和插件，不是没有资产复用。差距主要在复用之后的治理：

- 原模板更新后，哪些员工应该更新？
- 员工自己的修改怎么保留？
- 哪次改动导致任务退化？
- 运行中的任务使用哪个版本？

建议 YDSZ 先做简单、清晰的资产生命周期：

`草稿 → 验证 → 发布 → 员工绑定 → 运行固定版本 → 回滚`

不必第一版就做复杂分支合并。

特别要避免：

- 员工绑定“最新版本”，结果运行中被静默升级。
- 复制模板之后失去来源关系，无法判断是否落后或存在安全更新。

StaffDeck 内部 UI 和开放 API 的发布规则并非完全统一，这提醒我们：同一资产的发布规则必须由领域服务统一执行，不能由各入口分别决定。

---

### 4. 知识库：应该借鉴“结构与证据”，不是替换成它的检索算法

#### StaffDeck 的实际路线

知识处理会构建文档、章节、分桶、证据片段和概念等结构。检索不只是直接找若干文本块，而是逐层缩小范围：

`概念/文档 → 分桶 → 章节 → 片段 → 邻近证据`

词汇预选后可由模型进一步路由，片段评分考虑标题、路径、摘要和正文。

证据：[backend/app/knowledge/service.py:600](file:///D:/Code/open/StaffDeck/backend/app/knowledge/service.py#L600)。

但底层不是成熟向量检索或 BM25，而是自研词项、中文 n-gram、短语和字段加权评分。

证据：[backend/app/knowledge/service.py:2414](file:///D:/Code/open/StaffDeck/backend/app/knowledge/service.py#L2414)。

#### YDSZ 的实际路线

YDSZ 已有文档解析、OCR、分块、embedding 和引用；当前知识索引是每库一个 SQLite sidecar，搜索时读取全部 chunk，在进程内计算余弦相似度再排序。

证据：[src/ydsz/infra/knowledge/index.py:26](file:///D:/Code/open/ydsz-worker/src/ydsz/infra/knowledge/index.py#L26)、[同文件:98](file:///D:/Code/open/ydsz-worker/src/ydsz/infra/knowledge/index.py#L98)。

因此：

- 不能说 YDSZ 没有 RAG。
- 不能说 StaffDeck 因为有“知识结构”就一定更准确。
- YDSZ 主数据库支持 PostgreSQL，不代表知识检索已经使用 pgvector。
- 两者在大规模语料下都需要进一步验证。

#### 应该吸收什么

以“差旅报销标准”为例，用户真正需要的不是一个相似文本块，而是：来自哪份制度、制度何时生效、属于哪个章节、是否适用于当前员工、是否存在例外条款、引用能否定位回原文。

建议 YDSZ 在现有向量能力上补：

1. 文档、章节、页码与版本元数据。
2. 结构导航与邻段补全。
3. 关键词与向量混合召回。
4. 检索调试视图。
5. 基于真实业务问题的离线评测。

不要用 StaffDeck 的词项算法替换现有 embedding；要借鉴它如何组织与解释证据。

---

### 5. 运行可靠性：StaffDeck 的重要优势在控制面，不是多一个日志页

这是两者最重要的架构差异之一。

#### YDSZ 已有的基础不能忽略

YDSZ 已有 LangGraph checkpoint、持久化 trajectory、工具和模型执行指标、轨迹导出，以及支持 `Last-Event-ID` 的 SSE 续传。

证据：[src/ydsz/api/routers/chat/trajectory.py:326](file:///D:/Code/open/ydsz-worker/src/ydsz/api/routers/chat/trajectory.py#L326)。

所以，“给 YDSZ 增加 Trace、增加 SSE”不是准确建议。

目前主要不足是：聊天、Cron、团队派工等入口尚未形成统一的持久化业务 Run 生命周期。Cron 当前执行后更新最后一次状态并写审计；团队运行中的部分锁和跟踪状态在进程内。

证据：[src/ydsz/infra/cron/job.py:78](file:///D:/Code/open/ydsz-worker/src/ydsz/infra/cron/job.py#L78)、[src/ydsz/infra/agents/teams/jobs.py:8](file:///D:/Code/open/ydsz-worker/src/ydsz/infra/agents/teams/jobs.py#L8)。

#### StaffDeck 多做了什么

它将 Turn、TaskFrame、Run、Invocation、Session lease 等持久化，并通过租约和版本控制处理执行归属。

更重要的是，它没有把“崩溃恢复”简单理解为“自动重试”：孤儿 Run 标记为 abandoned；保留步骤、槽位和 checkpoint；将结果标为未知；允许后续继续领取流程；不盲目重放已经消失的那次执行。

证据：[backend/app/core/harness_recovery.py:52](file:///D:/Code/open/StaffDeck/backend/app/core/harness_recovery.py#L52)。

#### 对我们的意义

企业任务的关键问题不是“聊天记录还在不在”，而是：

> 系统在提交订单后、收到响应前崩溃，重启后到底应该重试、查询订单状态，还是交给人处理？

这不是 checkpoint 单独能解决的。

建议 YDSZ 统一管理：

- Run：一次业务执行。
- Attempt：执行尝试。
- Step：流程步骤。
- Invocation：外部动作及其结果。
- 等待人工、取消、中断、结果未知等状态。

先统一语义，不必照抄 StaffDeck 的全部表结构，更不必立即引入外部分布式队列。

---

### 6. 人机协作：YDSZ 的“动作审批”与 StaffDeck 的“业务转接”应组合

#### YDSZ 的强项

当前支持 approve、edit、reject、respond，也支持线程级策略和团队成员审批续跑。

证据：[src/ydsz/api/routers/chat/models.py:204](file:///D:/Code/open/ydsz-worker/src/ydsz/api/routers/chat/models.py#L204)。

它主要回答：Agent 想执行这个动作，人是否允许？参数需要修改吗？

#### StaffDeck 的强项

SOP 人工节点可以带处理人、问题、上下文和恢复载荷；人回答后恢复原流程。

证据：[backend/app/core/human_handoff_service.py:51](file:///D:/Code/open/StaffDeck/backend/app/core/human_handoff_service.py#L51)。

它主要回答：流程走到这里，必须由哪位业务人员作出判断？回答后应该继续哪一步？

两者不能混为一谈。工具执行前点“允许”，不等于财务审批；流程里问一个人，也不等于完整的工具安全策略。

#### YDSZ 应怎样吸收

保留现有 HITL，增加业务人工任务层：处理人、所属 Run/Step、待回答问题或待审核产物、截止时间、决策记录、恢复入口。其状态再映射到现有 Harness 恢复能力。

不要另起一套与 HITL 不相通的“审批系统”。

---

### 7. 多 Agent：最值得借鉴的是验收返工，不是竞标血条

#### YDSZ 当前形态

团队本身是主持人 Agent，通过异步派工调用成员，结果回流团队对话；另外有工作区子 Agent。这适合研究、讨论、并行分工，用户能在同一对话中推进工作。

#### StaffDeck 当前形态

它更接近项目任务系统：

`领导拆解 → 候选/指派 → 成员执行 → 报告 → 验收 → 通过/返工/升级`

还有任务依赖、成员独立会话、竞标与反驳、黑板、唤醒事件及租约恢复。

证据：[backend/app/teams/wakeup.py:66](file:///D:/Code/open/StaffDeck/backend/app/teams/wakeup.py#L66)。

#### 价值排序

| 机制 | 对 YDSZ 的价值 | 建议 |
|---|---|---|
| 明确任务、产物与验收标准 | 高 | 优先吸收 |
| 通过、返工、升级的闭环 | 高 | 优先吸收 |
| 任务依赖和持久化状态 | 高 | 与统一 Run 一起建设 |
| 带来源的共享黑板 | 中高 | 在多人多任务场景验证 |
| 多轮竞标与反驳 | 场景依赖 | 后置 |
| HP 血条等展示 | 较低 | 不作为核心能力 |

竞标不必然提高质量。它会增加模型调用、时延和裁决复杂度。对明确的岗位分工，直接指派可能更好。

应先把“成员说做完了”升级为“产物经过验收”，而不是先把派工过程做得像比赛。

---

### 8. 记忆与成长：YDSZ 更强的记忆底座，可以承接 StaffDeck 的反馈闭环

#### 长期记忆

StaffDeck 主要抽取 profile、preference、fact 等条目，按用户和员工范围使用。YDSZ 的记忆体系包含 Atom、Entity、Episode、候选审核、纠正、废弃，以及多源查询和召回，结构更丰富。

证据：[memory/src/ydsz_memory/service.py:87](file:///D:/Code/open/ydsz-worker/memory/src/ydsz_memory/service.py#L87)。

不应为了对标重新建设一个更简单的“员工记忆模块”。

#### StaffDeck 更值得借鉴的是反馈如何改变能力

演进流程为：反馈证据 → 归因 → 生成 SOP/技能候选 → 校验 → 人工批准 → 更新或回滚。但当前评估明确是 `static_v1`，代码注明尚未接入基线与候选 Harness 回放。

证据：[backend/app/evolution/service.py:96](file:///D:/Code/open/StaffDeck/backend/app/evolution/service.py#L96)。

因此它具备“改进流程”，但不能证明候选版本确实更好。

我们应做得更进一步：把反馈分成至少四类——知识缺失或过期、流程错误、工具失败、输出不符合验收标准；然后让候选版本接受真实失败案例和回归案例的对照评测，再人工发布。

记住一条用户反馈，不等于完成能力改进；生成一份新提示词，也不等于效果提升。

---

### 9. IM：YDSZ 应继续保持渠道广度，重点补投递治理

YDSZ 的渠道覆盖更广，包括飞书、钉钉、企微、微信、QQ、Telegram、Discord、MQTT 等，并有独立 Gateway 和插件机制。

StaffDeck 的突出点不是渠道数量，而是一个 Bot 挂多个员工、意图路由、手动切换保护、SOP 运行时提高切换门槛、人工转接期间保持路由粘性、一次性绑定码关联已有账号、入站去重与出站持久化。

最值得关注的是发送结果未知的处理：对超过发送租约、无法确认远端结果的回复，StaffDeck 标记 `remote_state_unknown`，而不是盲目重发。

证据：[backend/app/channels/service_outbox.py:706](file:///D:/Code/open/StaffDeck/backend/app/channels/service_outbox.py#L706)。

这比“失败就重试三次”更接近真实业务可靠性。但它也不是端到端 exactly-once。远端渠道没有可验证的幂等回执时，平台无法凭空保证绝不重发、绝不漏发。

建议优先把投递过程从 Agent 执行结果中分离：内容是否已生成、投递是否已排队、渠道是否已确认、失败是否可重试、结果是否未知。多员工自动路由可以随后做，但应先验证误路由率。对于有副作用的员工，必要时应要求用户确认切换，而不是只依赖模型置信分。

---

### 10. 开放 API：StaffDeck 更接近“员工即服务”

YDSZ 并不是封闭系统，已经能通过认证 MCP 向外暴露 Agent。

证据：[src/ydsz/api/routers/agent_mcp.py:33](file:///D:/Code/open/ydsz-worker/src/ydsz/api/routers/agent_mcp.py#L33)。

StaffDeck 的优势在于把对外调用组织成完整契约：账号级与员工级密钥、scope、密钥摘要保存、每次请求重新计算可访问员工、延迟执行时重新验证授权、幂等创建、同请求 SSE 与异步 Job、状态查询、取消、产物下载、Webhook、部分资源的 ETag 并发控制。

证据：[backend/app/public_api/auth.py:45](file:///D:/Code/open/StaffDeck/backend/app/public_api/auth.py#L45)、[docs/open-api-v1.md:80](file:///D:/Code/open/StaffDeck/docs/open-api-v1.md#L80)。

尤其值得借鉴：

> 一个任务排队时有权限，不代表稍后真正执行时仍有权限。

对企业系统而言，真正关心的是：这张合同的审查任务提交了吗？重复请求会不会重复执行？多久完成？产物在哪？权限撤销后还能不能跑？这些需求不能只靠聊天接口或 MCP 工具列表解决。

建议未来明确分工：

- MCP：面向其他 Agent、IDE 和工具客户端。
- 业务 Run API：面向 ERP、OA、CRM 等服务端系统。

两种入口应共用同一执行与权限层，而不是各自实现任务调度。

---

### 11. 定时任务和主动服务：应合并运营视图，而不是合并语义

YDSZ 的触发形态更丰富：cron、interval、date、即时执行、邮件触发，还有基于记忆和活跃时段的主动关怀。

StaffDeck 更强调定时任务运行治理：持久化执行记录、并发禁止策略、错过触发后的 coalesce/skip、独立 Session、SOP 使用 latest 或 pinned 版本。

证据：[backend/app/scheduled_tasks/service.py:311](file:///D:/Code/open/StaffDeck/backend/app/scheduled_tasks/service.py#L311)。

建议保留 YDSZ 的两类能力：

- 业务自动化：有明确输入、输出、失败责任。
- 主动服务：有频控、偏好、免打扰和用户体验约束。

它们可以共用运行台账，但不要把主动关怀当成普通 Cron，也不要把业务任务仅做成“定时发一段提示词”。

---

### 12. 权限与部署：StaffDeck 不能当作完整企业架构答案

#### YDSZ 的现有优势

YDSZ 已有本地账号、角色模板、模块权限、配额，以及 OIDC、LDAP、企业 OAuth 等接入。但身份接入不等于组织授权：能通过 LDAP 登录，不代表部门 ACL 已经建立；管理员/创建者/全局共享，不等于细粒度用户组授权；首次开通时映射管理组，不等于持续同步组织变动。

证据：[src/ydsz/api/routers/auth_ldap.py:70](file:///D:/Code/open/ydsz-worker/src/ydsz/api/routers/auth_ldap.py#L70)。

StaffDeck 本地角色同样主要是 admin/member，再叠加创建者、发布状态和资源权限；虽然有外部权限中心适配点，也不能据此认为开箱具备完整组织模型。

#### 架构与部署

- StaffDeck 当前 Harness v3 采用 Python 控制层加 Node 执行子进程，能力经 MCP 代理，并通过模型网关隔离供应商密钥。
- YDSZ 已有独立 harness、gateway、browser、memory 组件，没必要为了对标引入第二套执行引擎。
- StaffDeck 生产迁移和渠道进程协调仍有 SQLite、单实例方面的约束。
- YDSZ 虽支持 PostgreSQL，但部分运行态和本地知识索引仍然限制多副本部署。

两者都不能因为“有数据库、有租约、有多个进程”，就被认定为完整的分布式高可用平台。

另外，StaffDeck 的脚本沙盒默认关闭，Windows 存在无可用后端时的降级路径，不能把“支持沙盒”理解为“默认强隔离”。

证据：[backend/app/harness/sandbox.py:41](file:///D:/Code/open/StaffDeck/backend/app/harness/sandbox.py#L41)。

---

## 四、产品层面，YDSZ 最应该改变什么

### 1. 从“配置能力”转向“选择工作”

YDSZ 当前信息架构给技术用户的自由度很高，但业务用户面对模型、技能、工具、插件、子 Agent、记忆等概念，仍需要自己把能力拼起来。StaffDeck 的员工域把岗位、SOP、知识、工具、任务和记录放在较统一的语境中。

证据：[StaffDeck 侧栏信息架构](file:///D:/Code/open/StaffDeck/frontend-enterprise/src/components/AppSidebar.tsx#L66)、[YDSZ 个性化配置入口](file:///D:/Code/open/ydsz-worker/dashboard/src/pages/Agent/Personalization/index.tsx#L42)。

建议 YDSZ 增加一层业务入口，而不是替换现有配置页：

| 业务用户入口 | 对应底层能力 |
|---|---|
| 这个员工能做哪些工作 | 技能、SOP、工具组合 |
| 开始一项工作 | 创建 Run |
| 当前等我处理什么 | 人工任务 |
| 工作交付了吗 | 产物与验收 |
| 为什么失败 | 执行轨迹与错误分类 |
| 如何改进 | 反馈、候选版本、评测 |

这比简单改名“Agent → 数字员工”有价值。

### 2. 建立工作结果视图，而不只展示对话

建议逐渐形成三种互相关联、但不混为一体的视图：

- 会话视图：沟通与澄清。
- 任务视图：状态、责任人、期限、产物、验收。
- 配置视图：模型、技能、权限、工作区。

一个任务可以跨多轮会话，一个会话也可以产生多个任务。把二者强行等同，会限制后续运营能力。

### 3. 运营指标从 Token 转向交付

在现有耗时和 Token 指标上，补充：

- 首次验收通过率；
- 人工介入率；
- 返工率；
- 超时与结果未知率；
- 单次验收通过的成本；
- 失败原因分布；
- 不同能力版本的效果变化。

这些指标先定义口径，再采集。不能用消息量或任务“完成”次数替代业务价值。

---

## 五、建议的 P0 / P1 / P2 路线

这里的优先级是建设顺序，不是说当前系统存在对应等级的漏洞；前提是 YDSZ 下一阶段要承接可重复的企业业务流程。

### P0：统一运行语义，并用一个真实 SOP 验证

| 建设项 | 最小范围 | 验收标准 |
|---|---|---|
| 统一业务 Run | 关联现有 thread、trajectory、checkpoint；记录来源和运行状态 | 能从一次请求追到任务、步骤、工具调用与产物 |
| 幂等和异常恢复 | 区分安全重试、需查询、需人工处理 | 重复提交不重复创建业务任务；结果未知的外部动作不盲重试 |
| 最小 SOP 执行 | 顺序、条件、信息收集、人工节点、结束节点 | 缺必填项不能越过；人工等待可恢复 |
| 固定版本和撤权 | 运行快照、当前权限复核 | 发布新版本不改变在途实例；解绑资源后旧实例不能继续调用 |

建议试点：报销材料预审，而不是自动付款。它能覆盖文档理解、制度检索、字段收集、规则分支、人工复核和产物交付，同时避免第一期就处理不可逆财务动作。

第一期不做复杂画布、不做竞标、不做自动自进化。

### P1：形成可交付、可集成、可运营的闭环

| 建设项 | 重点 | 验收标准 |
|---|---|---|
| 员工级业务 API | 身份、scope、Run、取消、产物 | 无法调用未授权员工；排队后撤权仍生效 |
| 任务与人工收件箱 | 待处理、待验收、失败、超时 | 业务人员不翻聊天记录也能找到责任事项 |
| 能力发布管理 | 草稿、验证、发布、来源、回滚 | 版本变更有依据，回滚可验证 |
| 知识结构与调试 | 文档/章节/引用、召回解释 | 能解释为什么选中或漏掉某份制度 |
| 渠道投递台账 | outbox、回执、失败分类 | 生成成功与投递成功能分别追踪 |

### P2：有实际数据后再做增强

- 多 Agent 验收与返工增强。
- 团队黑板和知识沉淀。
- 反馈驱动的候选版本生成。
- 基线/候选回放评测。
- 部门与用户组资源 ACL。
- 更大规模知识索引。
- 多副本运行协调。
- 对确有收益的任务引入竞标。

其中，部门 ACL 若已是客户准入条件，就应提前到 P0/P1，不能机械按此顺序等待。

---

## 六、架构上怎么吸收，才能不把 YDSZ 做复杂

建议坚持四个边界：

1. 新 Run 层负责业务执行状态，不重复保存全部聊天历史。现有 thread、trajectory、checkpoint 继续各司其职，以关联关系连接。
2. SOP 负责业务约束，不再创建第二套通用 Agent Loop。每一步复用现有 Harness；顺序、权限、必填项和人工节点由流程层约束。
3. 开放 API、聊天、Cron、团队入口调用同一领域服务。不允许每个入口各自定义取消、重试、权限撤销规则。
4. 先补单实例可靠性，再谈分布式。先解决重启后能识别什么在运行、什么结果未知、什么能恢复，再考虑多副本抢占与共享状态。

StaffDeck 的启发是“该有哪些业务语义”，不是“必须采用它的 Python + Node、SQLModel 或全部数据表”。

---

## 七、明确不建议照搬的内容

1. 不照搬竞标与 HP 展示。先证明它比直接指派提高验收率，且收益覆盖时延与成本。
2. 不替换 YDSZ 的记忆体系。现有结构更丰富，应补反馈到能力版本的闭环。
3. 不把自研词项检索当成升级版 RAG。借鉴文档结构和引用组织，检索算法通过评测选择。
4. 不把静态校验包装成自动成长。没有基线回放，就不能证明质量提高。
5. 不把默认关闭或会降级的沙盒当成安全保证。
6. 不复制 StaffDeck 已收窄的员工模型选择策略。它当前员工独立模型绑定已退役，走租户默认模型；YDSZ 的按 Agent、按轮次选择能力有自己的价值。证据：[backend/app/api/agents.py:865](file:///D:/Code/open/StaffDeck/backend/app/api/agents.py#L865)。
7. 不直接混入 AGPL 代码而忽略许可。YDSZ 使用 MIT（[LICENSE:1](file:///D:/Code/open/ydsz-worker/LICENSE#L1)），StaffDeck 使用 AGPL-3.0，包含网络交互源码提供条款（[LICENSE:540](file:///D:/Code/open/StaffDeck/LICENSE#L540)）。功能思想和独立实现可以研究；直接移植代码或形成派生作品，应先进行许可证与商业模式评估。

---

## 八、最终判断

YDSZ 的优势是“能力丰富、接入广、可扩展”，StaffDeck 给我们的关键启发是“让能力形成稳定交付，并把交付结果反哺能力资产”。

如果只选三件事投入，建议依次做：

1. 统一业务 Run；
2. 最小可版本化 SOP；
3. 任务验收与反馈闭环。

这比继续扩充一批 Agent 配置项，更接近企业真正愿意持续使用的数字员工平台。

## Sources

- [OpenBMB/StaffDeck 官方源码仓库](https://github.com/OpenBMB/StaffDeck)
- [StaffDeck 中文说明](https://github.com/OpenBMB/StaffDeck/blob/main/README.zh.md)
