# 市场模块（Market）功能设计文档

> 版本: v0.1 (草案) | 日期: 2026-10-29 | 状态: 待评审

## 1. 模块定位与目标

### 1.1 背景

当前项目的四种市场能力分散在多个模块中：

| 能力 | 后端位置 | 前端位置 | 市场来源 |
|------|----------|----------|----------|
| 技能 (Skills) | `infra/skills/` + `api/routers/skills.py` | `pages/Agent/Skills/` + `pages/SkillPackages/` | ILTIN SkillHub + ClawHub + GitHub |
| 专家 (Experts) | `infra/agents/experts/` + `api/routers/experts.py` | `pages/Experts/` | ILTIN SkillHub Skillset Market |
| 插件 (Plugins) | `infra/agents/plugins/` + `api/routers/admin.py` | `pages/Admin/Plugins/` | 内建 bundled + 社区 |
| 连接器 (Connectors) | `infra/connectors/` + `api/routers/connectors.py` | `pages/Agent/Connectors/` | catalog.json 内置 + OAuth 动态 |

**核心问题**：四种市场各自为政，缺乏统一的市场体验——搜索/浏览/安装/更新/评价流程碎片化，用户需要在多个页面间跳转才能完成一个完整的能力装配。

### 1.2 设计目标

1. **统一市场入口**：一个 `/market` 路由页面 + `/api/market/*` 路由前缀，聚合四种市场的浏览、搜索、安装体验
2. **复用现有能力**：下游对接现有的 SkillHub/ClawHub 客户端、catalog 解析器、插件装配器；不重写已有逻辑，仅做编排层
3. **可扩展架构**：新增市场类型（如 Sub-Agent 市场、模板市场）只需注册一个 `MarketProvider`，不改核心框架
4. **前后端对齐**：参考 Qoder 市场设计语言的 Tab 分片 + 卡片流 + 详情抽屉范式，用 ydsz-ui 组件落地

### 1.3 非目标（Out of Scope）

- 不替代现有 Agent 级别 Skills/Connectors/Plugins 管理页面（`/personalization/skills` 等保留为「我的已安装」视图）
- 不做商业化/支付/许可证系统（本期仅做免费市场）
- 不做跨实例 P2P 分享（本期仅对接外部 HTTP 市场源）

---

## 2. 架构设计

### 2.1 模块边界

遵循 AGENTS.md §5 的层级规则：

```
dashboard/src/pages/Market/      ← 新增前端页面
    ↓ HTTP
api/routers/market.py            ← 新增路由层（薄，编排 → infra/）
    ↓
infra/market/                    ← 新增领域模块
    infra/market/manager.py      ← MarketManager（聚合入口）
    infra/market/providers/      ← 各类型市场 Provider 抽象 + 实现
        base.py                  ← MarketProvider ABC
        skills_provider.py       ← 封装 infra/skills/skillhub_market.py
        experts_provider.py      ← 封装 infra/agents/experts/skillhub_market.py
        plugins_provider.py      ← 封装 infra/agents/plugins/ + 远程目录
        connectors_provider.py   ← 封装 infra/connectors/catalog.py + 远程目录
    infra/market/models.py       ← 共享数据模型
    infra/market/search.py       ← 跨类型聚合搜索
    infra/market/install.py      ← 统一安装编排
```

**依赖方向**：`infra/market/` → 已有的 `infra/skills/`、`infra/agents/experts/`、`infra/agents/plugins/`、`infra/connectors/`。`infra/market/` 是更高层的编排层，不反向依赖。

### 2.2 与现有模块的关系

```
┌─────────────────────────────────────────────────────────────────┐
│                        Market Module (新)                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              infra/market/  (编排层)                       │   │
│  │  MarketManager.browse() / .search() / .install()         │   │
│  └──────────────────────────────────────────────────────────┘   │
│       ↓ calls          ↓ calls          ↓ calls         ↓ calls │
│  ┌──────────┐   ┌─────────────┐   ┌──────────┐   ┌──────────┐ │
│  │infra/    │   │infra/agents/│   │infra/    │   │infra/    │ │
│  │skills/   │   │experts/     │   │plugins/  │   │connectors/│ │
│  │(SkillHub │   │(SkillHub    │   │(bundled/ │   │(catalog. │ │
│  │ client)  │   │ skillset)   │   │ remote)  │   │ json)    │ │
│  └──────────┘   └─────────────┘   └──────────┘   └──────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. 四大市场子系统

### 3.1 技能市场（Skills Market）

**对接现有能力**：`infra/skills/skillhub_market.py`（ILTIN SkillHub HTTP 客户端）+ `infra/skills/skills_hub.py`（ClawHub / skills.sh / GitHub 导入）

| 功能 | 描述 | 现有实现 |
|------|------|----------|
| 浏览 | 按分类/标签浏览 SkillHub 技能 | `fetch_skillhub_rankings()` hot/featured/newest/recommended/trending |
| 搜索 | 全文搜索 SkillHub + 本地已安装 | `search_skillhub()` + `search_hub_skills()` |
| 详情卡片 | 名称/描述/版本/作者/安装量/评分 | 需新增聚合视图 |
| 一键安装 | 下载 ZIP → 校验 → 写入 agent workspace skills/ | `resolve_bundle_from_url()` + `bundle_to_uploads()` |
| 批量安装 | 多选技能批量装配 | 需新增编排 |
| 版本管理 | 检查更新/回滚 | 需新增（记录 installed_version vs latest） |
| 提交上架 | 将本地技能打包提交到 SkillHub | 需新增（接 SkillHub Publish API） |

### 3.2 专家市场（Experts Market）

**对接现有能力**：`infra/agents/experts/skillhub_market.py`（SkillHub Skillset 装配）+ `infra/agents/experts/market_creation.py`（从 skillset 创建 Agent）

| 功能 | 描述 | 现有实现 |
|------|------|----------|
| 场景分类浏览 | 按场景（office/engineering/design/…）过滤 SkillHub Skillset | `discover_skillset_pages()` + `list_skillset_entries()` |
| 专家详情 | manifest.json + SOUL.md + skills + quick prompts | `fetch_skillset_detail()` |
| 一键创建 Agent | 选择 Skillset → 从模板创建 Agent | `create_agent_from_skillhub_skillset()` |
| 导入现有 Agent | 将本地已有 Agent 打包为 Expert 模板 | 已有 `infra/agents/experts/composer_files.py` |
| 提交上架 | 将本地 Expert 发布到市场 | 需新增（接 SkillHub/ILTIN Publish API） |

### 3.3 插件市场（Plugins Market）

**对接现有能力**：`infra/agents/plugins/`（内建 bundled 插件 + 远程 probe）

| 功能 | 描述 | 现有实现 |
|------|------|----------|
| 浏览 | 列出内建 bundled + 远程社区插件 | `pluginsApi.listMarket()`（已有前端 API） |
| 分类/分组 | 按 pluginGroups 过滤 | `PLUGIN_GROUP_ORDER` + `isKnownPluginGroup()` |
| 安装 | 复制到 `~/.ydsz-worker/plugins/` | `PluginMarketPanel` 已有安装逻辑 |
| 版本更新 | 检查 bundled 更新 | 需新增 |
| 详情/文档 | plugin.yaml + README.md | 已有 PluginIconView/PluginCardMeta |
| 提交上架 | 将本地插件提交到社区市场 | 需新增 |

### 3.4 连接器市场（Connectors Market）

**对接现有能力**：`infra/connectors/catalog.json`（内置预设）+ `infra/connectors/oauth/`（OAuth 动态注册）

| 功能 | 描述 | 现有实现 |
|------|------|----------|
| 分类浏览 | 按 category (office/knowledge/travel/…) 过滤 catalog | `list_catalog()` + `catalog_entry_to_dict()` |
| 搜索 | 全文搜索 connector 名称/描述 | 需新增前端过滤 |
| 一键配置 | OAuth2/Personal Token/API Key 等鉴权引导安装 | `api/routers/connectors.py` 已有 CRUD |
| 连接状态 | 已连接/待配置/过期需续期 | `ConnectorInstanceCard` 已有状态显示 |
| 远程连接器市场 | 从 ILTIN 社区获取第三方 connector 定义 | 需新增 |
| 提交上架 | 将自定义 connector 发布到社区 | 需新增 |

---

## 4. API 设计

### 4.1 路由表

遵循 RESTful 范式，所有路由挂载在 `/api/market/` 前缀下：

```
# ── 聚合搜索 ──────────────────────────────────────────────────
GET  /api/market/search?q=&type=&category=&page=&limit=
     → 跨 MarketProvider 的聚合搜索结果

# ── 技能市场 ──────────────────────────────────────────────────
GET  /api/market/skills                  → 列表（支持 ?q=&category=&ranking=hot|featured|newest）
GET  /api/market/skills/{slug}           → 详情（含安装量/版本/内容预览）
POST /api/market/skills/{slug}/install  → 安装到指定 agent ?agent_id=
GET  /api/market/skills/rankings         → 排行榜（hot/featured/newest/recommended/trending/paid）

# ── 专家市场 ──────────────────────────────────────────────────
GET  /api/market/experts                 → 列表（支持 ?q=&scene=&category=）
GET  /api/market/experts/{slug}          → 详情（manifest + 预览文件列表）
POST /api/market/experts/{slug}/install  → 从专家模板创建 Agent（?name=&description=）

# ── 插件市场 ──────────────────────────────────────────────────
GET  /api/market/plugins                 → 列表（支持 ?q=&group=）
GET  /api/market/plugins/{id}            → 详情
POST /api/market/plugins/{id}/install    → 安装插件到本地

# ── 连接器市场 ─────────────────────────────────────────────────
GET  /api/market/connectors             → 列表（支持 ?q=&category=&auth_kind=）
GET  /api/market/connectors/{kind}      → 详情（含 OAuth 状态）
POST /api/market/connectors/{kind}/authorize  → 启动 OAuth 或配置 Token
DELETE /api/market/connectors/{kind}/instances/{id} → 断开/删除实例

# ── 我的市场（统一视图） ───────────────────────────────────────
GET  /api/market/installed              → 当前用户已安装的全部市场项（含版本/更新状态）
GET  /api/market/published              → 当前用户已发布的市场项
POST /api/market/publish                → 提交本地资产（技能/专家/插件/连接器）到市场
```

### 4.2 共享响应模型

```python
# infra/market/models.py

class MarketItem(BaseModel):
    """跨类型的统一市场条目"""

    id: str                          # slug / kind / id
    type: MarketItemType             # "skill" | "expert" | "plugin" | "connector"
    name: str
    description: str
    version: str
    author: str
    icon_url: str | None
    category: str
    tags: list[str]
    installed: bool                  # 当前用户是否已安装
    installed_version: str | None
    has_update: bool                 # installed 且新版本可用
    rating: float | None             # 评分 1-5
    download_count: int              # 安装量
    source: MarketSource             # "ILTIN" / "skillhub" / "clawhub" / "community" / "local"
    source_url: str | None           # 原始来源 URL
    created_at: str | None
    updated_at: str | None


class MarketDetail(MarketItem):
    """详情 = 条目 + 扩展信息"""

    readme: str | None               # 长文档/说明
    screenshots: list[str]           # 截图 URL 列表
    changelog: str | None
    dependencies: list[str]          # 依赖的其他市场项
    quick_prompts: list[str] | None  # 专家的 quick prompts
    metadata: dict[str, Any]         # 类型特定的扩展数据


class MarketSearchResult(BaseModel):
    items: list[MarketItem]
    total: int
    page: int
    limit: int
    facets: dict[str, list[str]]     # 聚合维度（category/tag/auth_kind）
```

### 4.3 Provider 抽象接口

```python
# infra/market/providers/base.py

class MarketProvider(ABC):
    """市场类型提供者的统一抽象"""

    @property
    @abstractmethod
    def market_type(self) -> MarketItemType:
        ...

    @abstractmethod
    async def browse(self, *, category: str | None, limit: int, offset: int) -> list[MarketItem]:
        """分页浏览默认排序"""
        ...

    @abstractmethod
    async def search(self, query: str, *, filters: dict[str, str] | None, limit: int) -> list[MarketItem]:
        """全文搜索"""
        ...

    @abstractmethod
    async def detail(self, item_id: str) -> MarketDetail:
        """详情"""
        ...

    @abstractmethod
    async def install(self, item_id: str, *, target: InstallTarget, **kwargs) -> InstallResult:
        """安装到目标（agent workspace / plugins dir / catalog config）"""
        ...

    @abstractmethod
    async def check_updates(self, installed: list[InstalledRef]) -> list[UpdateInfo]:
        """批量检查已安装项是否有更新"""
        ...
```

---

## 5. 数据库设计

遵循 AGENTS.md §7 的资源表范式。新增迁移 `022_market_tables.sql` + `022_market_tables.pg.sql`。

### 5.1 market_items 表

统一的本地市场项缓存/注册表：

```sql
CREATE TABLE IF NOT EXISTS market_items (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    market_id       TEXT UNIQUE NOT NULL,
                   -- 类型前缀 + 来源 id: "skill:slug", "expert:slug", "plugin:id", "connector:kind"
    item_type       TEXT NOT NULL,   -- skill / expert / plugin / connector
    source          TEXT NOT NULL DEFAULT 'ILTIN',
                   -- ILTIN / skillhub / clawhub / community / local
    name            TEXT NOT NULL,
    description     TEXT NOT NULL DEFAULT '',
    version         TEXT NOT NULL DEFAULT '',
    author          TEXT NOT NULL DEFAULT '',
    icon_url        TEXT,
    category        TEXT NOT NULL DEFAULT '',
    tags_json       TEXT NOT NULL DEFAULT '[]',    -- JSON array
    metadata_json   TEXT NOT NULL DEFAULT '{}',   -- 类型特定扩展
    installed       INTEGER NOT NULL DEFAULT 0,   -- 是否已安装
    installed_version TEXT,
    source_url      TEXT,
    downloaded_at   TEXT,
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### 5.2 market_install_log 表

安装/更新审计日志：

```sql
CREATE TABLE IF NOT EXISTS market_install_log (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    market_id       TEXT NOT NULL,
    user_id         INTEGER NOT NULL REFERENCES users(id),
    action          TEXT NOT NULL,               -- install / update / uninstall
    from_version    TEXT,
    to_version      TEXT,
    target_id       TEXT,                       -- agent_id 或插件目录名
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### 5.3 market_search_cache 表

搜索结果本地缓存（减少外部 API 调用）：

```sql
CREATE TABLE IF NOT EXISTS market_search_cache (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    cache_key       TEXT UNIQUE NOT NULL,       -- hash(item_type + query + filters)
    item_type       TEXT NOT NULL,
    results_json    TEXT NOT NULL,              -- MarketItem[] 序列化
    total           INTEGER NOT NULL DEFAULT 0,
    expires_at      TEXT NOT NULL,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### 5.4 与现有表的关联

| 现有表 | 关联方式 |
|--------|----------|
| `skill_packages` | `market_items.market_id = "skill:" \|\| skill_packages.slug`（逻辑关联，不建 FK，允许离线未缓存） |
| `published_experts` | `market_items.market_id = "expert:" \|\| published_experts.expert_id` |
| `plugins` (文件系统) | `market_items.market_id = "plugin:" \|\| plugin_dirname` |
| `connector_instances` | `market_items.market_id = "connector:" \|\| connector_kind` |

---

## 6. 前端设计

### 6.1 路由与布局

```
/market                        → MarketPage（默认 Tab: Skills）
/market?tab=skills             → SkillsTab
/market?tab=experts            → ExpertsTab
/market?tab=plugins            → PluginsTab
/market?tab=connectors         → ConnectorsTab
/market/installed              → Installed Tab（我的已安装）
```

### 6.2 页面结构

参考 Qoder 市场设计语言（Tab 分片 + 卡片流 + 详情抽屉）：

```
┌──────────────────────────────────────────────────────────────────┐
│  MarketPage                                                      │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Header: [搜索框]                    [+ 提交到市场]          │ │
│  ├─────────────────────────────────────────────────────────────┤ │
│  │  Tabs: [Skills] [Experts] [Plugins] [Connectors] [已安装]    │ │
│  ├─────────────────────────────────────────────────────────────┤ │
│  │  Filters: [分类下拉 ▼] [排序: 热门 ▼] [标签筛选]             │ │
│  ├─────────────────────────────────────────────────────────────┤ │
│  │                                                              │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │ │
│  │  │ Card     │  │ Card     │  │ Card     │  │ Card     │    │ │
│  │  │ ┌──────┐ │  │ ┌──────┐ │  │ ┌──────┐ │  │ ┌──────┐ │    │ │
│  │  │ │ Icon │ │  │ │ Icon │ │  │ │ Icon │ │  │ │ Icon │ │    │ │
│  │  │ └──────┘ │  │ └──────┘ │  │ └──────┘ │  │ └──────┘ │    │ │
│  │  │ Name     │  │ Name     │  │ Name     │  │ Name     │    │ │
│  │  │ Desc...  │  │ Desc...  │  │ Desc...  │  │ Desc...  │    │ │
│  │  │ [Install]│  │ [Install]│  │ [Install]│  │ [Inst..] │    │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │ │
│  │                                                              │ │
│  └─────────────────────────────────────────────────────────────┘ │
│  Pagination / Infinite Scroll                                    │
└──────────────────────────────────────────────────────────────────┘
```

### 6.3 详情抽屉

点击卡片 → 右侧 Drawer 展开详情：

- 顶部：图标 + 名称 + 评分 + 安装量 + 作者
- Tab: [简介] [版本历史] [依赖] [评价]
- 底部：[安装/更新/已安装] 按钮 + 链接到源页面
- 连接器特殊：若 requires OAuth，显示 [授权连接] 按钮 + OAuth 流程

### 6.4 文件结构

```
dashboard/src/pages/Market/
  ├── index.tsx                  ← MarketPage 主框架（搜索栏 + Tabs + 路由）
  ├── index.module.less
  ├── router.ts                  ← Tab → 组件映射
  ├── hooks/
  │   ├── useMarketList.ts       ← 列表数据加载 hook（分页/搜索/缓存）
  │   ├── useMarketDetail.ts     ← 详情数据加载
  │   └── useMarketInstall.ts    ← 安装/卸载操作 hook
  ├── components/
  │   ├── MarketHeader.tsx       ← 搜索栏 + 提交按钮
  │   ├── MarketTabs.tsx         ← Tab 栏
  │   ├── MarketFilters.tsx      ← 分类/排序/标签筛选
  │   ├── MarketCard.tsx         ← 通用市场卡片（适配四种类型）
  │   ├── MarketGrid.tsx         ← 卡片网格 + 空状态/加载态
  │   ├── MarketDetailDrawer.tsx ← 详情抽屉
  │   └── Pagination.tsx         ← 分页
  ├── tabs/
  │   ├── SkillsTab.tsx          ← Skills 专属逻辑 + 集成现有 SkillHubTab
  │   ├── ExpertsTab.tsx         ← Experts 专属逻辑 + 集成现有 ExpertMarketTab
  │   ├── PluginsTab.tsx         ← Plugins 专属逻辑 + 集成现有 PluginMarketPanel
  │   └── ConnectorsTab.tsx      ← Connectors 专属逻辑
  └── installed/
      └── InstalledTab.tsx        ← 我的已安装列表（聚合四种类型）
```

### 6.5 与现有页面的关系

| 现有页面 | 关系 |
|----------|------|
| `pages/Agent/Skills/` | 保留为当前 agent 的 Skill 实例管理（增删改/启停）；Market 页面负责「发现+安装」 |
| `pages/SkillPackages/` | 可逐步合并进 Market SkillsTab |
| `pages/Experts/` | Market ExpertsTab 复用 ExpertMarketTab 的 Skillset 展示逻辑 |
| `pages/Admin/Plugins/` | Market PluginsTab 复用 PluginMarketPanel 的安装逻辑 |
| `pages/Agent/Connectors/` | 保留为连接器实例管理；Market 页面负责「发现+配置」 |

---

## 7. 集成与迁移

### 7.1 后端集成点

| 现有模块 | 集成方式 |
|----------|----------|
| `infra/skills/skillhub_market.py` | `SkillsProvider` 封装 `search_skillhub()` + `fetch_skillhub_rankings()` + `download_skillhub_package()` |
| `infra/skills/skills_hub.py` | `SkillsProvider` 包装 `resolve_bundle_from_url()` 用于 URL 导入 |
| `infra/agents/experts/skillhub_market.py` | `ExpertsProvider` 封装 Skillset 列表/详情获取 |
| `infra/agents/experts/market_creation.py` | `ExpertsProvider.install()` 调用 `create_agent_from_skillhub_skillset()` |
| `infra/agents/plugins/` | `PluginsProvider` 封装 bundled 列表 + 远程插件列表 |
| `infra/connectors/catalog.py` | `ConnectorsProvider` 封装 `list_catalog()` + entry 解析 |
| `api/deps.py` | `GET /api/market/*` 沿用 `current_user` + JWT 鉴权 |

### 7.2 前端集成点

| 现有模块 | 集成方式 |
|----------|----------|
| `dashboard/src/api/modules/plugins.ts` | 扩展 `pluginsApi` 或新建 `marketApi` |
| `dashboard/src/api/modules/skills.ts` | 扩展 `skillsApi` 的 market 搜索方法 |
| `dashboard/src/components/Skeleton.tsx` | 复用 `CardSkeleton` 加载占位 |
| `dashboard/src/utils/apiError.ts` | 复用 `apiErrorMessage` |
| `dashboard/src/hooks/` | 复用 `useServerTimezone` 等通用 hook |

### 7.3 渐进式迁移策略

**Phase 1 — MVP（本期建议）**：
- 新增 `infra/market/` + `api/routers/market.py` + `dashboard/src/pages/Market/`
- 实现 SkillsTab（对接 SkillHub 浏览/搜索/安装）和 PluginsTab（对接 bundled + 远程插件）
- 统一搜索框 + Tab 框架 + 卡片网格组件

**Phase 2 — 完善**：
- 增加 ExpertsTab（Skillset 市场）和 ConnectorsTab（Connector 浏览/配置）
- 增加 `InstalledTab`（我的已安装 + 更新检查）
- 搜索结果缓存（`market_search_cache` 表）

**Phase 3 — 发布**：
- 实现「提交上架」功能（Publish 流程）
- 评价/评分系统
- 个性化推荐

---

## 8. i18n 考量

遵循 AGENTS.md §7 i18n 章节：

```
src/ydsz/i18n/en.json →
  "market": {
    "title": "Marketplace",
    "tabs": { "skills": "Skills", "experts": "Experts",
              "plugins": "Plugins", "connectors": "Connectors", "installed": "Installed" },
    "search": { "placeholder": "Search the marketplace...", "noResults": "No results found" },
    "actions": { "install": "Install", "update": "Update",
                "installed": "Installed", "submit": "Submit to Market" },
    "filters": { "category": "Category", "sort": "Sort by", "all": "All" }
  }

src/ydsz/i18n/zh.json → 对应中文翻译
dashboard/src/locales/en.json + zh.json → 前端同步
```

---

## 9. 安全考量

- **市场来源白名单**：沿用现有 `SUPPORTED_URL_PREFIXES` + `YDSZ_SKILLS_IMPORT_URL_PREFIXES` 机制
- **ZIP 安全校验**：沿用 `parse_skillhub_package()` 的路径遍历检查 + 压缩比限制
- **沙箱执行**：市场安装的插件/技能在 agent 沙箱中执行，遵循现有的 `sandbox_scope` 配置
- **OAuth State 防 CSRF**：沿用 `infra/connectors/oauth/pkce.py` 的 PKCE 流程
- **内容审核**：提交上架需管理员审核（`market_items` 表可选加 `review_status` 字段）

---

## 10. 待确认事项（Design Review）

在开始实现前，需要确认以下几点：

1. **范围**：本期是否只做 Phase 1 MVP（Skills + Plugins）？还是四市场同时开工？
2. **UI 融合**：Market 页面是完全新建，还是改造现有 `Experts/` + `SkillPackages/` + `Admin/Plugins/` 页面嵌入？
3. **Plugin 市场后端**：当前 `pluginsApi.listMarket()` 的数据源是什么？是否有远程 Plugin 目录 API？
4. **Connector 浏览体验**：Connector 是否需要独立的「市场浏览」和「实例管理」两个视图？
5. **Published 表复用**：`published_experts` 表是给专家发布专用的，市场模块是复用还是新建通用 publish 表？
6. **搜索缓存策略**：SkillHub 搜索结果缓存时间建议？排行榜建议缓存 5-15 分钟。
7. **是否引入 Plugin 远程社区市场 API**：如 ILTIN 是否有 Plugin 远程目录？如无，bundled-only 是否够用？

---

## 附录 A：现有市场能力一览表

### A.1 后端

| 模块 | 文件 | 核心 API |
|------|------|----------|
| 技能安装 | `infra/skills/install.py` | `install_skillhub_skill()`、`import_local_skill()` |
| 技能包 | `infra/skills/skill_packages.py` | `resolve_skill_package()`、`validate_skill_slug()` |
| 技能归档 | `infra/skills/skill_archive.py` | `build_skill_zip()`、`build_skills_zip()` |
| 技能转移 | `infra/skills/skill_transfer.py` | `copy_workspace_skill_to_workspace()`、`copy_package_skills_to_workspace()` |
| SkillHub 市场 | `infra/skills/skillhub_market.py` | `search_skillhub()`、`download_skillhub_package()`、`fetch_skillhub_rankings()` |
| Hub 集成 | `infra/skills/skills_hub.py` | `resolve_bundle_from_url()`、`search_hub_skills()` |
| SkillHub 通用 | `infra/skills/skillhub_common.py` | `DEFAULT_SKILLHUB_HOST`、限制常量 |
| SkillHub → 包 | `infra/skills/skill_package_from_skillhub.py` | `fetch_skillhub_package_for_workspace()` |
| 专家目录 | `infra/agents/experts/catalog.py` | `discover_experts()`、`build_create_spec_from_expert()` |
| 专家发布 | `infra/agents/experts/publish.py` | `publish_expert()` |
| 专家 SkillHub 市场 | `infra/agents/experts/skillhub_market.py` | `install_skillset_template()`、`fetch_skillset_detail()` |
| 专家市场创建 | `infra/agents/experts/market_creation.py` | `create_agent_from_skillhub_skillset()` |
| 专家清单生成 | `infra/agents/experts/manifest_generator.py` | `build_skillhub_agent_manifest_bytes()` |
| 插件目录 | `infra/agents/plugins/bundled/*.yaml` | 内建插件定义 |
| 连接器目录 | `infra/connectors/catalog.json` | 内置 connector 预设 |
| 连接器 OAuth | `infra/connectors/oauth/` | `pkce.py`、`registry.py`、`builtin.py`、`mcp.py` |
| 连接器注册 | `infra/connectors/builder.py` | `build_connector_instance()` |

### A.2 前端

| 页面 | 文件 | 功能 |
|------|------|------|
| Agent 技能 | `pages/Agent/Skills/` | 当前 agent 技能 CRUD + Hub 导入 |
| 技能包 | `pages/SkillPackages/` | 技能包管理 + Skillset 从 Hub 创建 |
| 专家 | `pages/Experts/` | 专家模板 + SkillHub Skillset 市场 tab |
| 连接器 | `pages/Agent/Connectors/` | 连接器实例 CRUD |
| Admin 插件 | `pages/Admin/Plugins/` | 插件市场 + 已安装管理 |
