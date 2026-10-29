# WorkBuddy 连接器生态对照与移植记录

日期：2026-10-29 ｜ 范围：P0 连接器目录扩充（专家/技能移植见后续 P1/P2）

## 1. 背景与方法

目标：把 WorkBuddy「专家·技能·连接器」市场中的**连接器**资产对照翻译进
`src/ydsz/infra/connectors/catalog.json`，补齐 ydsz Worker 的目录覆盖面。

方法（全部实测，不采信二手清单）：

1. 通过 WorkBuddy 连接器市场检索接口按 5 个维度枚举候选（协作办公 / 研发项目 /
   知识文档 / 金融法律 / 效率生活 / 海外工具），去重后得 40+ 个连接器条目；
2. 对拟补录条目逐个核验**公开 MCP 端点 / 官方地址**（WebSearch + 官方文档）；
3. 只有端点核验通过且能被现有 builder 管线接线的条目标记 `available`；
   地址可核验但接线未做的标记 `coming_soon`（前端 `ConnectorCard` 会置灰禁用，
   见 `dashboard/src/pages/Agent/Connectors/ConnectorCard.tsx:20`）；
   无公开端点或与产品定位偏离的条目不进 catalog，仅在本表登记。

## 2. 接线机制（源码事实）

`builder.py::_build_remote_spec` 的扩展性分三档：

| 路径 | 条件 | 新增成本 |
|------|------|----------|
| 通用 OAuth DCR | `auth_kind=oauth2` + `oauth_issuer` + `mcp_url`（`catalog.py::is_mcp_oauth_remote`） | **纯元数据** |
| 硬编码分支 | `api_key` / `personal_token` 类 remote | 每个 kind 一小段 builder 分支 |
| gateway / stdio | Python 适配器 / 子进程 | 需适配器代码 |

用户自定义 MCP（`custom_mcp.py`，支持 streamable_http/stdio + 自定义 Header）
不依赖 catalog，任何端点今天即可手工接入。

## 3. 对照总表

图例：✅ 已有 ｜ 🆕 本次新增（available） ｜ ⏳ 本次新增（coming_soon） ｜ ❌ 不纳入

| WorkBuddy 连接器 | ydsz kind | 状态 | 说明 |
|------------------|-----------|------|------|
| 腾讯文档 | `tencent-docs` | ✅ | 端点同为 docs.qq.com MCP |
| 企业微信 | `wecom-cli` | ✅ | |
| 企查查 | `qcc` | ✅ | oauth2/internal，另有 `connectors-qcc.md` 专篇 |
| 天眼查 | `tyc-mcp` | 🆕 | 端点已核验：`https://mcp.tianyancha.com/v1`（Authorization 头传 API Key） |
| 邓白氏查全球 | — | ❌ | 外资商业数据，公开 MCP 端点未核验到 |
| GitHub | `github` | ✅ | |
| 华宇元典法律数据 | `yuandian` | ✅ | |
| 微盛企微管家 SCRM | — | ❌ | 垂类 SCRM 商业插件，无公开标准 MCP 端点 |
| 恒生聚源 MCP | — | ❌ | 金融数据商业服务，端点/鉴权依赖商务开通 |
| 启信慧眼 | — | ❌ | 同上，官网/端点待核验 |
| 腾讯自选股 | — | ❌ | 与 `westock` 生态绑定，端点待核验 |
| QQ 邮箱 | `qq-mail` | ✅ | |
| 乐享知识库 | `tencent-lexiang` | ✅ | |
| 飞书 | `feishu-cli` | ✅ | |
| 钉钉 | `dingtalk-cli` | ✅ | |
| 腾讯问卷 | `tencent-survey` | ⏳ | 官方地址 wj.qq.com；接线待做（logo 资源本次已接入映射） |
| TAPD | `tapd` | ⏳ | 官方帮助文档已给出 MCP 接入方式（`mcp-server-tapd`，uvx/stdio），接线待做 |
| ima 知识管家 | `tencent-ima` | ✅ | |
| 腾讯金融科技 NeoData | — | ❌ | 金融数据服务，端点待核验 |
| 金山文档 \| WPS | `kdocs` | 🆕 | 端点已核验：`https://mcp-center.wps.cn/skill_hub/mcp`（Authorization: Bearer） |
| 通达信 | — | ❌ | 金融行情垂类，端点待核验 |
| 北大法宝 | `pkulaw` | ⏳ | 官方地址 pkulaw.com；接线待做 |
| Tushare | `tushare` | ⏳ | 官方地址 tushare.pro；接线待做 |
| OpenBoost 跨境数据 | — | ❌ | 跨境电商垂类商业插件 |
| 同程程心 | — | ❌ | 出行垂类，与现有 `ctrip-wendao` / `meituan-travel` 场景重叠 |
| 东方财富妙想 MCP | — | ❌ | 金融垂类，端点待核验 |
| Picset AI 电商设计 | — | ❌ | 电商设计商业插件（自带充值面板），非标准 MCP 分发 |
| 可灵 AI | — | ❌ | AI 创作商业插件，属 WorkBuddy 生成类生态（对应其内置 ImageGen/VideoGen），ydsz 走自有模型管线 |
| 同花顺 iFinD | — | ❌ | 金融终端商业数据，端点待核验 |
| Flova AI | — | ❌ | AI 视频创作商业插件 |
| Notion | `notion` | ✅ | |
| 智客 AI 对公营销 | — | ❌ | 垂类营销商业插件 |
| SalesTouch | — | ❌ | 垂类销售管理商业插件 |
| TikTok for Business | — | ❌ | 海外广告平台，合规与账号体系另议 |
| AE 互联 | — | ❌ | 聚合型转售网关，非一手数据源 |
| 达秘 TikTok 建联 | — | ❌ | 跨境电商垂类商业插件 |
| TourMind 酒店预订 | — | ❌ | 出行垂类，端点待核验 |
| CreatOK | — | ❌ | TikTok 内容创作商业插件 |
| RestoSuite 商户助手 | — | ❌ | 餐饮 SaaS 垂类 |
| 中基惠通 | — | ❌ | 外贸垂类 |
| 腾讯会议（tmeet） | `tencent-meeting` | ✅ | |
| Agent Mail | `agently-cli` | ✅ | |

**反向对照（ydsz 独有，WorkBuddy 检索未见同类条目）**：`tencent-news`、
`wechat-reading`、`tencent-weiyun`、`qq-music`、`fliggy`、`baidu-map`、
`ctrip-wendao`、`meituan-travel`、`didi`、`youdao-note`、`openalex`、
`obsidian-cli`、`weknora`、`yuque-mcp`、`tencent-ardot`、`notion-deep`、
`google-workspace`、`microsoft-365`、`google-calendar`、`google-sheets`、
`slack`、`jira`、`figma`、`zapier`、`rss-feed`、`linear` 等 —— ydsz 目录
（47 条，本次后）覆盖面不弱于 WorkBuddy 市场，缺口集中在金融数据垂类。

## 4. 本次变更明细

| 文件 | 变更 |
|------|------|
| `src/ydsz/infra/connectors/catalog.json` | 新增 6 条：`tyc-mcp`、`kdocs`（available），`tapd`、`tencent-survey`、`pkulaw`、`tushare`（coming_soon）；并把 `weknora`、`dify` 移回数组末位（测试锁定的顺序约定，见下） |
| `src/ydsz/infra/connectors/builder.py` | `_build_remote_spec` 新增 `tyc-mcp`、`kdocs` 两条硬编码端点分支（含 `_mcp_http_headers()`） |
| `dashboard/src/assets/connectors/index.ts` | 注册既有资产 `tencent-survey.png` 到 `CONNECTOR_LOGOS` |
| `docs/connectors.md` | 目录表与 catalog.json 全量对齐（补此前欠账的 12 行 + 本次 6 行，`weknora`/`dify` 行随序移到表尾） |
| `tests/integration/test_connectors_api.py` | 修 stale 断言：`figma` 自 `22eeb14e` 起就在 catalog 中，`not in` → `in`；`available` 清单补 `tyc-mcp`、`kdocs` |
| `tests/unit/test_connectors.py` | `test_every_catalog_entry_has_category` 的分类白名单改为 `get_args(ConnectorCategory)`，消除与 `catalog.py` 枚举的漂移 |

存量红灯说明（修复前 4 个失败均在 HEAD 上已复现，取证：`git show HEAD:...catalog.json` 显示 figma 已在目录、dify 仅第 28/41 位）：

- `test_catalog`（figma 断言）：断言写于 figma 引入之前，`22eeb14e` 加条目时未同步测试；
- `test_catalog_weknora_dify_last` / `test_obsidian_cli_catalog_and_credentials`
  （`kinds[-2:] == ["weknora","dify"]`）：`22eeb14e` 批次把 google-workspace…linear
  直接追加到 dify 之后破坏了该约定。本次以**恢复约定**（weknora/dify 移到末位）
  而非放水断言的方式修复；
- `test_every_catalog_entry_has_category`：白名单缺 `development`/`collaboration`/
  `project`/`design`/`automation`，对 `github` 等旧条目即已失败。

端点证据：

- 天眼查：`https://mcp.tianyancha.com/v1`，`Authorization: <API_KEY>`，
  来源 tyc-tech/tyc-banking-plugin MCP_CONFIGURATION.md（2026-10-29 核验）；
- 金山文档：`https://mcp-center.wps.cn/skill_hub/mcp`，`Authorization: Bearer <token>`，
  来源 WPS 官方社区 bbs.wps.cn/topic/85760（2026-10-29 核验）。

验证记录（2026-10-29）：

```
uv run pytest tests -k "connector or catalog or builder" -q
→ 464 passed, 16 skipped   （修复前 4 failed, 460 passed）
```

外加冒烟：`list_catalog()` 47 条、kind 无重复；`_build_remote_spec` 对
`tyc-mcp`/`kdocs` 输出 url + 认证头符合预期。

## 5. 后续（P1 起点）

1. `tapd`：官方帮助文档已给 `mcp-server-tapd`（uvx/stdio）接入方式，可仿
   `yuque-mcp` 加 stdio 分支转 available；
2. `tencent-survey` / `pkulaw` / `tushare`：拿到官方 MCP 端点或商务授权后补
   builder 分支并转 available；
3. 金融垂类（NeoData / iFinD / 通达信 / 恒生聚源等）：如需成建制接入，建议在
   `professional` 分类下做一轮商务侧端点收集，再批量接线；
4. 新增条目缺 logo 资产时前端回退通用图标（`ConnectorLogo` 的 fallback），可按需
   补 `dashboard/src/assets/connectors/*.png`。
