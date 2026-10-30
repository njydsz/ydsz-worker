# 云顶市场（Market）模块 — 详细设计文档

> **版本**: v1.0 | **日期**: 2026-10-29 | **作者**: CatPaw (妙手) | **状态**: 评审中

---

## 目录

- [1. 执行摘要](#1-执行摘要)
- [2. 背景与动机](#2-背景与动机)
- [3. 四种市场的统一概念模型](#3-四种市场的统一概念模型)
- [4. 架构设计](#4-架构设计)
- [5. 后端模块设计](#5-后端模块设计)
- [6. API 接口契约](#6-api-接口契约)
- [7. 数据库设计](#7-数据库设计)
- [8. 前端设计](#8-前端设计)
- [9. 四大市场子系统详细设计](#9-四大市场子系统详细设计)
- [10. 集成策略](#10-集成策略)
- [11. i18n 国际ization](#11-i18n-国际化)
- [12. 安全设计](#12-安全设计)
- [13. 实施计划](#13-实施计划)
- [14. 待确认事项](#14-待确认事项)

---

## 1. 执行摘要

### 1.1 一句话定义

为云顶数字工作台（Ydsz Worker）构建**统一市场模块**，将分散在技能、专家、插件、连接器四个子系统的市场发现与装配能力聚合到单一入口，实现「一个入口，发现一切能力」。

### 1.2 核心数字

| 维度 | 当前状态 | 目标状态 |
|------|---------|---------|
| 市场页面数量 | 4 个（分散） | 1 个统一入口 |
| API 路由前缀 | 5+ 个（/api/agents/.../skills, /api/experts/hub, /api/connectors, /api/admin/plugins...） | 1 个（/api/market/*） |
| 新市场类型扩展 | 需修改 4 处代码 | 注册 1 个 MarketProvider |
| 跨市场搜索 | 不支持 | 支持（聚合四来源） |
| 已安装统一管理 | 不支持 | 支持（/version/status 聚合） |

### 1.3 交付范围

- **后端**：新建 `src/ydsz/infra/market/` 领域模块 + `src/ydsz/api/routers/market.py` 编排层
- **前端**：新建 `dashboard/src/pages/Market/` 统一市场页面
- **数据库**：迁移 `022_market_tables.sql` + `022_market_tables.pg.sql`（3 张新表）
- **配置**：新增 `YDSZ_MARKET_*` 环境变量族
- **i18n**：新增 `market.*` 命名空间中英双语 key

---

## 2. 背景与动机

### 2.1 用户旅程假设（当前状态）

想装配一个 AI 技能的用户流程：

```
1. 想去「技能」入口 → 找到 /skill-packages（需要知道路径）
2. 看到 SkillHub 列表（全量） → 没有插件或专家信息
3. 想装插件 → 需要先退出 → 进入 /admin/plugins → 再搜一遍
4. 想看专家 → 进入 /experts → 又是第三个独立的搜索/列表
5. 想装连接器 → 进入 /connectors → 再回来

用户每次增加认知负担 + 切换成本。
```

### 2.2 设计参考：Qoder Marketplace

Qoder 市场页面（`qoder.com/zh/marketplace`）的核心设计语言：

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]  Marketplace                        [搜索框] [提交]  │
│  ──────────────────────────────────────────────────────────  │
│  [全部]   [Skills]  [Plugins]  [Connectors]                 │
│  ──────────────────────────────────────────────────────────  │
│  [分类▼]  [排序: 热门▼]  [标签筛选]      共 128 项          │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐              │
│  │ Card   │ │ Card   │ │ Card   │ │ Card   │              │
│  │ Icon   │ │ Icon   │ │ Icon   │ │ Icon   │              │
│  │ Name   │ │ Name   │ │ Name   │ │ Name   │              │
│  │ ★4.8   │ │ ★4.5   │ │ ★4.7   │ │ ★4.2   │              │
│  │ [安装] │ │ [安装] │ │ [安装] │ │ [安装] │              │
│  └────────┘ └────────┘ └────────┘ └────────┘              │
│  ← 1 2 3 ... 8 →                                          │
└─────────────────────────────────────────────────────────────┘
```

关键设计要素：**Tab 切换 + 筛选条 + 卡片网格 + 分页 + 提交 CTA**。

### 2.3 设计目标与非目标

**目标**：
- 统一的 4  Tab 市场入口（Skills / Experts / Plugins / Connectors + 「已安装」）
- 单一搜索框跨 4 来源聚合搜索
- 统一的卡片 UI（图标 + 名称 + 作者 + 评分 + 安装量 + 操作按钮）
- 详情 Drawer（右侧滑出，含完整文档/预览/依赖关系/安装配置）
- 我的市场（已安装列表 + 一键更新 + 已发布管理）
- 扩展性（新增市场类型 = 注册 1 个 Provider，不改核心）

**非目标**：
- 不替代旧 agent 级别的 Skills / Connectors 管理页面（那仍然是「我的已装配」视图）
- 不做商业化/支付/许可证
- 不做社区用户评价系统（第一轮仅展示市场数据）

---

## 3. 四种市场的统一概念模型

### 3.1 统一资源模型

在统一市场中，四种业态（技能/专家/插件/连接器）都被建模为 **MarketItem**（市场资源项）：

```
MarketItem = 可发现的 + 可安装的 + 可版本化的 + 可评分的最小单元
```

```
┌──────────────────────────────────────────────────────┐
│                   MarketItem                         │
│  ─────── 核心字段 ───────                            │
│  id: string          # 全局唯一 "type:source_id"     │
│  type: enum          # skill|expert|plugin|connector │
│  source: enum         #ILTIN|skillhub|clawhub|github│
│                                               |local  │
│  identity: string    # 来源侧原始 ID               │
│  name: LocalizedText display name                   │
│  description: LocalizedText                         │
│  icon: URL / emoji / default icon                  │
│  version: semver                                   │
│  author: {name, url?, email?}                      │
│  category: string    # office/knowledge/engineering/ │
│                       design/productivity/...        │
│  tags: string[]                                     │
│  ─────── 市场指标 ───────                            │
│  rating: float|null  # 1-5                          │
│  downloads: int                                     │
│  installed: bool     # 当前用户/实例是否已安装      │
│  installed_ver: string|null                         │
│  has_update: bool                                   │
│  size_bytes: int|null # 安装包大小                  │
│  ─────── 内容预览 ───────                            │
│  readme: html|null   # 长文档                       │
│  screenshots: URL[]  # 截图                         │
│  changelog: html|null                               │
│  user_doc_url: URL|null # 外链详细文档              │
│  source_url: URL|null # GitHub / 源页面             │
│  ─────── 元信息 ───────                               │
│  created_at: datetime                               │
│  updated_at: datetime                               │
│  published_at: datetime|null # 上架时间             │
│  license: string|null                               │
│  metadata: JSONB     # 类型特定扩展字段             │
└──────────────────────────────────────────────────────┘
```

### 3.2 四种类型与 MarketItem 的映射

| 类型 | MarketItem.type | MarketItem.identity | metadata 扩展字段 |
|------|-----------------|---------------------|-------------------|
| 技能 | `skill` | 技能 slug | `slug, package_type, skill_count, platform` |
| 专家 | `expert` | skillset slug / published id | `scene, sub_scene, skill_slugs[], quick_prompts[]` |
| 插件 | `plugin` | 目录名 / 插件 ID | `kind, group, requires[], tools[]` |
| 连接器 | `connector` | connector kind | `auth_kind, mcp_mode, category, phase, credential_fields[]` |

### 3.3 Publisher 模型

```
MarketPublisher = 可被引用、被信任、可被联系的能力创作者

  id: ULID
  name: string             # 显示名
  slug: string             # URL-safe 身份
  domain: string|null      # 公司/组织 website URL
  avatar_url: URL|null
  bio: LocalizedText|null
  item_count: int          # 已发布资源项数量
  followers: int|null      # 关注者数量（延时需求）
  is_verified: bool|null   # 官方认证
  social_links: {twitter?, github?, ...}
  published_items: MarketItem[]  # 通过外键/索引关联
                                     # market_item.publisher_id
```

---

## 4. 架构设计

### 4.1 层级总览

```
┌──────────────────────────────────────────────────────────────────┐
│                    frontend: /market/*                           │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  MarketPage（Tab 框架 + 布局壳）                            │  │
│  │  ├─ SearchBar（全局搜索）                                  │  │
│  │  ├─ Tab: [Skills] [Experts] [Plugins] [Connectors]        │  │
│  │  │            [已安装]                                      │  │
│  │  ├─ FilterBar（分类/排序/标签）                            │  │
│  │  ├─ MarketGrid → MarketCard × N                            │  │
│  │  └─ MarketDetailDrawer（右侧滑出）                         │  │
│  └────────────────────────────────────────────────────────────┘  │
│  dashboard/src/pages/Market/                                     │
├──────────────────────────────────────────────────────────────────┤
│                  API: /api/market/*                              │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  market.py（薄编排层）                                      │  │
│  │  GET  /search             delegates to MarketManager       │  │
│  │  GET  /{type}/list        delegates to {type}Provider      │  │
│  │  GET  /{type}/{id}        delegates to {type}Provider      │  │
│  │  POST /{type}/{id}/install delegates to InstallService     │  │
│  │  GET  /installed          cross-provider 聚合               │  │
│  │  GET  /{type}/categories   delegates to {type}Provider      │  │
│  └────────────────────────────────────────────────────────────┘  │
│  src/ydsz/api/routers/market.py                                  │
├──────────────────────────────────────────────────────────────────┤
│              Domain: infra/market/                               │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  MarketManager（门面）                                      │  │
│  │    .browse(type, ...)     → provider.browse(...)           │  │
│  │    .search(query, types)  → 并行 N provider → 归一排序      │  │
│  │    .detail(type, id)      → provider.detail(...)           │  │
│  │    .install(type, id)     → provider.install(...)          │  │
│  │    .installed(user_id)    → cross-provider 聚合查询          │  │
│  │    .installed_with_updates() → + 异步检查更新                │  │
│  │                                                             │  │
│  │  InstallService（安装编排）                                  │  │
│  │    .execute(type, id, target, opts) → 安装 + 审计日志      │  │
│  │    .rollback(install_id)                                    │  │
│  │    .update(install_id, target_ver)                           │  │
│  │                                                             │  │
│  │  SearchService（聚合搜索）                                   │  │
│  │    .search(query, types, filters) → 并行路由 + 聚合排序     │  │
│  │    .suggest(prefix) → 缓存 hot 搜索词                       │  │
│  │                                                             │  │
│  │  Providers 注册表（策略模式）                                │  │
│  │    "skills"     → SkillsProvider     (infra/skills/*)      │  │
│  │    "experts"    → ExpertsProvider    (infra/agents/*)      │  │
│  │    "plugins"    → PluginsProvider    (infra/agents/plugins) │  │
│  │    "connectors" → ConnectorsProvider (infra/connectors/*)  │  │
│  └────────────────────────────────────────────────────────────┘  │
│  src/ydsz/infra/market/                                          │
├──────────────────────────────────────────────────────────────────┤
│            Data: SQLite (WAL) / PostgreSQL                      │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  market_items           市场项缓存表                        │  │
│  │  market_install_registry  安装注册表                        │  │
│  │  market_search_cache     TTL 搜索缓存                      │  │
│  │  market_install_log      审计日志                           │  │
│  └────────────────────────────────────────────────────────────┘  │
│  src/ydsz/infra/db/migrations/022_market_tables.sql              │
└──────────────────────────────────────────────────────────────────┘
```

### 4.2 依赖方向

遵循 AGENTS.md §5 的铁律：

```
api/routers/market.py
    ↓ calls
infra/market/manager.py
    ↓ calls
infra/market/providers/{type}_provider.py
    ↓ delegates to (wrapping, not modifying)
infra/skills/skillhub_market.py     (技能搜索/下载)
infra/skills/skill_archive.py       (打包/上传)
infra/agents/experts/skillhub_market.py  (专家 Skillset 市场)
infra/agents/experts/market_creation.py  (从 Skillset 创建 Agent)
infra/agents/plugins/manager.py     (插件列表/安装)
infra/connectors/catalog.py         (连接器目录)
infra/connectors/builder.py         (连接器实例化)
infra/db/market_repo.py             (市场模块自己的 repos)
```

**硬约束**：`infra/market/` 不反向依赖 `infra/skills/`、`infra/agents/`、`infra/connectors/` 的内部细节 — 仅通过它们的公开函数调用。若现有函数签名不满足需求，在现有模块中**新增**公开函数，而不是让 market 模块绕过。

### 4.3 新增配置项

```python
# config.py 新增字段

# 市场模块开关
market_enabled: bool = Field(default=False, alias="YDSZ_MARKET_ENABLED")

# 统一市场 SkillHub host（复用现有 SKILLHUB_HOST 但覆盖市场专用）
market_skillhub_host: str | None = Field(default=None, alias="YDSZ_MARKET_SKILLHUB_HOST")

# ClawHub / skills.sh 导入前缀（复用 YDSZ_SKILLS_IMPORT_URL_PREFIXES 但覆盖）
market_import_url_prefixes: list[str] = Field(
    default_factory=list,
    alias="YDSZ_MARKET_IMPORT_URL_PREFIXES",
)

# 搜索缓存 TTL（秒）
market_search_cache_ttl: int = Field(default=300, alias="YDSZ_MARKET_SEARCH_CACHE_TTL")

# 列表缓存 TTL（秒）
market_list_cache_ttl: int = Field(default=600, alias="YDSZ_MARKET_LIST_CACHE_TTL")

# 下架阈值（download_count 低于此值的技能不展示在热门推荐中）
market_hot_threshold: int = Field(default=10, alias="YDSZ_MARKET_HOT_THRESHOLD")

# 是否开启已安装市场项版本检查
market_update_check: bool = Field(default=True, alias="YDSZ_MARKET_UPDATE_CHECK")
```

---

## 5. 后端模块设计

### 5.1 目录结构

```
src/ydsz/infra/market/
├── __init__.py                  # MarketManager + InstallService + SearchService 导出
├── config.py                    # 市场模块配置（从 YdszConfig 读取）
├── models.py                    # MarketItem / MarketDetail / MarketSearchResult / ...
├── constants.py                 # MARKET_TYPES / SOURCE_ENUMS / SORT_ORDERS
├── errors.py                    # MarketErrorCode / MarketError
├── cache.py                     # 搜索缓存管理器（TTL cache + invalidate）
├── install.py                   # InstallService（安装/更新/回滚/审计）
├── search.py                    # SearchService（聚合搜索路由 + 排序）
├── manager.py                   # MarketManager（门面 / Facade）
├── utils.py                     # URL 安全校验 / 归一化 helpers
├── providers/
│   ├── __init__.py              # PROVIDERS 注册表 + get_provider(type)
│   ├── base.py                  # MarketProvider ABC
│   ├── skills_provider.py       # SkillsProvider
│   ├── experts_provider.py      # ExpertsProvider
│   ├── plugins_provider.py      # PluginsProvider
│   └── connectors_provider.py   # ConnectorsProvider
├── repos/
│   ├── __init__.py
├── jobs/
│   │   └── cache_warmer.py      # 后台任务：预热热门搜索缓存
│   └── checks/
│       └── update_checker.py    # 后台任务：扫描已安装项的更新
```

### 5.2 核心类设计

#### 5.2.1 MarketProvider（抽象基类）

```python
# providers/base.py

class MarketProvider(ABC):
    """市场类型提供者抽象协议

    每个市场类型（skills/experts/plugins/connectors）实现此协议。
    MarketManager 通过它理解差异，对上层提供统一视图。
    """

    @property
    @abstractmethod
    def market_type(self) -> str:
        """返回类型标识: "skills" | "experts" | "plugins" | "connectors"."""

    @property
    @abstractmethod
    def display_name(self) -> dict[str, str]:
        """i18n display name. E.g. {"en": "Skills", "zh": "技能"}."""

    @property
    def default_sort(self) -> str:
        """默认排序字段. "relevance" | "downloads" | "rating" | "newest"."""
        return "relevance"

    @property
    def supported_sorts(self) -> list[str]:
        return ["relevance", "downloads", "rating", "newest"]

    @abstractmethod
    async def list_items(
        self,
        *,
        category: str | None,
        sort: str,
        limit: int,
        offset: int,
        current_user_id: int | None,
    ) -> "MarketListResult":
        """分页浏览. installed 字段由 InstallService 填充."""

    @abstractmethod
    async def search(
        self,
        query: str,
        *,
        category: str | None,
        sort: str,
        limit: int,
        offset: int,
        locale: str | None,
    ) -> "MarketListResult":
        """全文搜索 — 返回与 list_items 同结构."""

    @abstractmethod
    async def detail(self, item_id: str, locale: str | None) -> "MarketDetail":
        """详情 — 用于 Drawer."""

    @abstractmethod
    async def install(self, item_id: str, *, target: "InstallTarget", **opts) -> "InstallReceipt":
        """安装到目标. 返回收据（含用于回滚的 snapshot 信息）."""

    @abstractmethod
    async def installed_list(
        self, user_id: str, *, limit: int, offset: int,
    ) -> list["InstalledRef"]:
        """当前用户已安装的该类型资源项."""

    @abstractmethod
    async def check_update(self, installed: "InstalledRef") -> "UpdateInfo | None":
        """检查一个已安装项是否有更新."""

    async def categories(self) -> list["MarketCategory"]:
        """分类列表 — 默认空列表，子类可覆盖."""
        return []

    async def validate_target(self, target: "InstallTarget") -> bool:
        """安装前校验目标合法性."""
        return True
```

#### 5.2.2 MarketManager（门面模式）

```python
# manager.py

class MarketManager:
    """统一市场门面 — 前端 / API 层唯一入口.

    隐藏 provider 注册表、搜索路由、安装编排的复杂性。
    """

    def __init__(
        self,
        providers: dict[str, MarketProvider],
        install_service: InstallService,
        search_service: SearchService,
        config: MarketConfig,
    ):
        self._providers = providers
        self._install = install_service
        self._search = search_service
        self._config = config

    def provider(self, type: str) -> MarketProvider:
        if type not in self._providers:
            raise MarketError(MarketErrorCode.UNSUPPORTED_TYPE, ...)
        return self._providers[type]

    @property
    def available_types(self) -> list[str]:
        return [t for t, p in self._providers.items() if self._is_enabled(t)]

    # ── 浏览 / 搜索 ──────────────────────────────────────

    async def browse(
        self, type: str, *, category, sort, limit, offset, user_id
    ) -> MarketListResult:
        return await self.provider(type).list_items(...)

    async def search(
        self, query: str, types: list[str] | None, *, category, sort, limit, offset, locale,
    ) -> "AggregatedSearchResult":
        """跨 provider 并行搜索 → 归一化结果 → 聚合排序."""
        return await self._search.search(query, types or self.available_types, ...)

    async def detail(self, type: str, item_id: str, locale: str | None) -> MarketDetail:
        return await self.provider(type).detail(item_id, locale)

    # ── 安装 / 更新 ──────────────────────────────────────

    async def install(
        self, type: str, item_id: str, *, target: InstallTarget, user_id: int, **opts,
    ) -> InstallReceipt:
        provider = self.provider(type)
        await provider.validate_target(target)
        return await self._install.execute(
            provider=provider, item_id=item_id,
            target=target, user_id=user_id, **opts,
        )

    async def check_updates(self, type: str, user_id: int) -> list[UpdateInfo]:
        refs = await self.provider(type).installed_list(user_id)
        tasks = [self.provider(type).check_update(r) for r in refs]
        return [u for u in await asyncio.gather(*tasks) if u is not None]

    async def installed_across_types(
        self, user_id: int, *, limit: int, offset: int,
    ) -> "InstalledAcrossResult":
        """跨 provider 聚合用户的已安装列表."""
        tasks = {
            t: p.installed_list(user_id, limit=limit, offset=offset)
            for t, p in self._providers.items()
        }
        results = await asyncio.gather(*tasks.values())
        items = {}
        for t, result in zip(tasks.keys(), results):
            items[t] = result
        return items

    # ── 分类 / 筛选 ──────────────────────────────────────

    async def categories(self, type: str) -> list[MarketCategory]:
        return await self.provider(type).categories()

    # ── 私有辅助 ──────────────────────────────────────────

    def _is_enabled(self, type: str) -> bool:
        if type == "skills":
            return self._config.skills_enabled
        ...
```

#### 5.2.3 InstallService（安装编排）

```python
# install.py

class InstallService:
    """跨provider 的安装编排 — 安装前校验/执行/记录审计日志/回滚."""

    async def execute(
        self,
        *,
        provider: MarketProvider,
        item_id: str,
        target: InstallTarget,
        user_id: int,
        **opts,
    ) -> InstallReceipt:
        # 1. check if already installed (防重复安装/允许强制重装)
        # 2. create InstallSnapshot for rollback
        # 3. provider.install(item_id, target=target, **opts)
        # 4. write market_install_log (action=install, from_ver=null, to_ver=x)
        # 5. invalidate cache
        # 6. return InstallReceipt(item, snapshot_id, logs)

    async def update(self, receipt: InstallReceipt, *, provider, user_id) -> InstallReceipt:
        # 1. read old provider.check_update(installed_ref)
        # 2. provider.install with force=True + update=True
        # 3. write market_install_log (action=update)
        ...

    async def rollback(self, receipt: InstallReceipt, *, provider, user_id) -> None:
        # 1. 调用 provider 或通过 snapshot 回滚
        # 2. write market_install_log (action=rollback)
        ...
```

#### 5.2.4 SearchService（搜索聚合）

```python
# search.py

class SearchService:
    """并行搜索 N 个 provider → 归一化 → 聚合排序 → 缓存."""

    async def search(
        self,
        query: str,
        types: list[str],
        *,
        category: str | None,
        sort: str,
        limit: int,
        offset: int,
        locale: str,
    ) -> AggregatedSearchResult:

        # 1. 查缓存 (cache_key = hash(query+types+category+sort+locale+page))
        cache_key = self._cache_key(query, types, category, sort, locale, offset // limit)
        cached = await self._cache.get(cache_key)
        if cached:
            return AggregatedSearchResult.from_cache(cached)

        # 2. 并行调用 provider.search()
        tasks = {
            t: self._providers[t].search(query, category=category, sort=sort, limit=limit, offset=offset, locale=locale)
            for t in types
        }
        results = await asyncio.gather(*tasks.values(), return_exceptions=True)

        # 3. 归一化 + 聚合排序
        all_items: list[tuple[str, MarketItem]] = []
        per_type_counts: dict[str, int] = {}
        for t, result in zip(tasks.keys(), results):
            if isinstance(result, Exception):
                logger.warning("Provider %s search failed: %s", t, result)
                per_type_counts[t] = 0
                continue
            per_type_counts[t] = result.total
            for item in result.items:
                all_items.append((t, item))

        # 按 sort 聚合排序
        sorted_items = self._aggregate_sort(all_items, sort)

        # 4. 缓存
        agg_result = AggregatedSearchResult(
            items=sorted_items[offset:offset+limit],
            total=sum(per_type_counts.values()),
            per_type=per_type_counts,
            query=query,
            page=offset // limit,
            limit=limit,
        )
        await self._cache.set(cache_key, agg_result, ttl=self._config.search_cache_ttl)
        return agg_result
```

### 5.3 Provider 实现详情

#### 5.3.1 SkillsProvider

封装 `infra/skills/skillhub_market.py` + `skill_archive.py` + `skill_transfer.py`。

```
list_items:
  - if sort == "downloads" → fetch_skillhub_rankings("hot")
  - if sort == "newest"  → fetch_skillhub_rankings("newest")
  - if category         → search_skillhub(q="*", category=category)
  - otherwise           → search_skillhub(q="*", limit=limit)

search:
  - search_skillhub(query, limit=limit) + clawhub search 合并

detail:
  - fetch 单个 SKILL.md + 包元数据 → 组装 MarketDetail
  - 截图: 默认使用 skill 内嵌 screenshot/ 或源仓库 README 图片
  - install:
  - resolve to install_target.agent.slugs or packages
  - if agent → copy_package_skills_to_workspace / install_skillhub_skill
  - if standalone → save to skill_packages

installed_list:
  - 查 skill_packages 表 + agent.config 内已装配的 skill slugs
  - 通过 map 去重

check_update:
  - 读取 source_version_hash vs market.versions[-1].hash
```

#### 5.3.2 ExpertsProvider

封装 `infra/agents/experts/skillhub_market.py` + `market_creation.py` + `published_creation.py`。

```
list_items:
  - 内建 discover_seed_paths() 的 bundled experts
  - if sort == "newest" → browse_skillsets(sort="newest")

search:
  - if query → browse_skillsets(search=query)

detail:
  - bundled: 读 manifest.json + 文件列表
  - skillhub: fetch_skillset_detail(slug)
  - published: + 安装量、评分（published_experts 表）
  - install:
  - bundled: build_create_spec_from_expert + create_agent
  - skillhub: create_agent_from_skillhub_skillset(slug, opts)
  - published: install_published_expert(published_id, opts)

installed_list:
  - agent.runtime_fields['expert_origin'] / creator_bundle 元数据
  - 注：专家安装 → Agent；已安装状态通过 Agent 的 creator 元数据追踪

check_update:
  - 检查 source 版本变化（SKILL.md 内容 hash vs installed snapshot）
```

#### 5.3.3 PluginsProvider

封装 `infra/agents/plugins/manager.py` + `bundled/` 目录扫描。

```
list_items:
  - bundled: Plugin.bundled_plugins (目录内 scan)
  - installed: Plugin.list_installed()
  - 已安装且 bundled → merged source = "ILTIN + installed"

search:
  - 本地内存过滤（插件通常无远程搜索 API）

detail:
  - 解析 plugin.yaml + README.md + UI manifest
  - install:
  - bundled → copy bundled dir to ~/.ydsz-worker/plugins/{id}
  - GitHub URL → git clone + verify + verify plugin.yaml signature
      - URL 白名单 from market_import_url_prefixes
  - notify_plugins_changed()

installed_list:
  - Plugin.list_installed()
  - 补充 bundled status (is bundled or pkg?)

check_update:
  - bundled: 无（跟随系统版本）
  - git: git fetch + compare HEAD vs local HEAD
  - 验证 git sig (if GPG signed)
```

#### 5.3.4 ConnectorsProvider

封装 `infra/connectors/catalog.py` + `builder.py` + `oauth/` 注册。

```
list_items:
  - list_catalog(category=..., auth_kind=...) → catalog_entry_to_dict → MarketItem

search:
  - list_catalog 全量 → 客户端侧过滤（catalog 全量加载通常 <500 条）

detail:
  - catalog entry 详情
  - + 是否已安装（通过检查 connector_instances）
  - + OAuth 授权状态（oauth_ready? configured?）
  - supports_quick_auth → quick_auth_url
  - install (authorize):
  - oauth2 → start_oauth_for_target
  - personal_token / api_key → build_connector_instance
  - has_quick_auth → 直接 POST 到 quick_auth_url

installed_list:
  - connector_instances 表中该用户的记录
  - connector_instances join catalog_entry

check_update:
  - catalog.json version 比较（如 connector 有 version 字段）
```

---

## 6. API 接口契约

### 6.1 路由表

所有路由挂载在 `/api/market/`，遵循 RESTful 范式。权限模型沿用 `current_user` JWT。

```
# ── 聚合搜索 ──────────────────────────────────────────────────────
GET  /api/market/search
     ?query=string        搜索关键词（可选，默认空 = 热门推荐）
     &types=skills,experts 搜索类型过滤（可选，默认全部已启用类型）
     &category=string     分类过滤（可选）
     &sort=relevance      排序: relevance|downloads|rating|newest
     &limit=20            分页大小（可选，默认 20）
     &offset=0            偏移（可选，默认 0）
     &locale=zh|en        语言
     → AggregatedSearchResult

# ── 类型内浏览 / 搜索 ─────────────────────────────────────────────
GET  /api/market/skills
GET  /api/market/experts
GET  /api/market/plugins
GET  /api/market/connectors
     ?query=string
     &category=string
     &sort=string
     &limit=number
     &offset=number
     &group=string        (plugins only: group filter)
     &auth_kind=string     (connectors only: filter by auth_kind)
     → MarketListResult

# ── 详情 ──────────────────────────────────────────────────────────
GET  /api/market/skills/{slug}
GET  /api/market/experts/{slug}
GET  /api/market/plugins/{id}
GET  /api/market/connectors/{kind}
     → MarketDetail

# ── 安装 ──────────────────────────────────────────────────────────
POST /api/market/skills/{slug}/install
     body: { agent_id?: string, package_id?: string, force?: bool }
     → InstallReceipt

POST /api/market/experts/{slug}/install
     body: { name: string, description?: string, model?: string, ...AgentCreateOpts }
     → InstallReceipt { agent_id, market_item }

POST /api/market/plugins/{id}/install
     body: { target_dir?: string, force?: bool }
     → InstallReceipt

POST /api/market/connectors/{kind}/authorize
     body: { credentials?: Record<string,any>, auth_kind: string,
             instance_name?: string, redirect_uri?: string }
     → InstallReceipt | { oauth_url: string }

# ── 更新 ──────────────────────────────────────────────────────────
GET  /api/market/installed                  → InstalledAcrossResult
     ?with_updates=1|0  (是否异步检查更新，默认 0 → 快响应)
     &type=string        (可选类型过滤)

POST /api/market/{type}/{id}/update
     body: { agent_id? } (skill/expert 时需要)
     → InstallReceipt

POST /api/market/{type}/{id}/uninstall
     → { success: bool }

# ── 分类 / 排序 / 筛选元信息 ─────────────────────────────────────
GET  /api/market/skills/categories           → { categories: MarketCategory[] }
GET  /api/market/experts/categories          → { categories: MarketCategory[] }
GET  /api/market/plugins/groups              → { groups: string[] }
GET  /api/market/connectors/categories       → { categories: MarketCategory[] }

# ── 提交上架（Creator Portal） ────────────────────────────────────
POST /api/market/publish
     body: { type: string, identity: string, name: string,
             description: string, agree_terms: bool,
             readme?: string, tags?: string[],
             publisher?: {name, url} }
     → PublishReceipt

# ── 推荐 / 热门 ──────────────────────────────────────────────────
GET  /api/market/featured                    → { items: MarketItem[] }
     ?type=string (optional)
     &limit=number
```

### 6.2 统一响应格式

统一使用 `{ code: 0, data: ..., message: "ok" }` 格式（与现有 YdszWorker API 一致）。

**错误时**：`{ code: ErrorCode, message: "human readable", detail?: {...} }`

### 6.3 响应示例

**GET /api/market/skills?query=gmail&sort=downloads**

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "items": [
      {
        "id": "skill:gmail-manager-2",
        "type": "skill",
        "source": "ILTIN",
        "identity": "gmail-manager-2",
        "name": { "en": "Gmail Manager", "zh": "Gmail 管理器" },
        "description": { "en": "Send, read, label Gmail via natural language" },
        "icon": "https://...svg",
        "version": "1.4.0",
        "author": { "name": "@alice", "url": "https://github.com/alice" },
        "category": "productivity",
        "tags": ["email", "google", "gmail"],
        "rating": 4.6,
        "downloads": 12340,
        "installed": false,
        "installed_ver": null,
        "has_update": false,
        "size_bytes": 24576,
        "updated_at": "2026-10-20T08:00:00Z",
        "metadata": {
          "slug": "gmail-manager-2",
          "package_type": "workspace",
          "skill_count": 1
        }
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20,
    "per_type": { "skills": 1 }
  }
}
```

**GET /api/market/experts/hub/slack-gpt**

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "id": "expert:slack-gpt",
    "type": "expert",
    "source": "skillhub",
    "identity": "slack-gpt",
    "name": { "en": "Slack Community Manager", "zh": "Slack 社区管理专家" },
    "description": { "en": "Expert at managing Slack channels, user groups, and communication" },
    "icon": null,
    "icon_name": "message-circle",
    "color": "#4A154B",
    "version": "1.0.0",
    "author": { "name": "Qoder" },
    "category": "management",
    "tags": ["slack", "community", "chat"],
    "rating": 4.8,
    "downloads": 8500,
    "installed": true,
    "installed_ver": "1.0.0",
    "has_update": false,
    "size_bytes": null,
    "updated_at": "2026-10-15T10:00:00Z",
    "metadata": {
      "scene": "communication",
      "skill_slugs": ["slack-search", "slack-post", "slack-moderation"],
      "quick_prompts": [
        { "title": "Help me moderate the channel" },
        { "title": "Summarize today's discussions" }
      ],
      "task_examples": { "zh": ["总结今天的讨论", "发送通知给全体"], "en": ["Summarize today", "Announce to all"] }
    }
  }
}
```

**GET /api/market/installed?with_updates=1**

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "items": [
      {
        "type": "skill",
        "items": [
          { "slug": "gmail-manager-2", "installed_ver": "1.4.0", "latest_ver": "1.4.0", "has_update": false },
          { "slug": "github-pr-review", "installed_ver": "2.1.0", "latest_ver": "2.2.0", "has_update": true }
        ]
      },
      {
        "type": "expert",
        "items": [...]
      },
      {
        "type": "plugin",
        "items": [...]
      },
      {
        "type": "connector",
        "items": [...]
      }
    ],
    "total": 42
  }
}
```

### 6.4 请求/响应 Schema（Pydantic 模型）

```python
# api/routers/market.py 中定义

class MarketSearchQuery(BaseModel):
    query: str | None = None
    types: list[str] | None = None
    category: str | None = None
    sort: str = "relevance"
    limit: int = Field(20, ge=1, le=100)
    offset: int = Field(0, ge=0)

class InstallBody(BaseModel):
    agent_id: str | None = None
    force: bool = False

class ExpertInstallBody(BaseModel):
    name: str = Field(..., min_length=1, max_length=64)
    description: str | None = Field(None, max_length=200)
    model: str | None = None
    force: bool = False

class ConnectorAuthorizeBody(BaseModel):
    credentials: dict[str, Any] | None = None
    auth_kind: str | None = None
    instance_name: str | None = Field(None, max_length=64)
    redirect_uri: str | None = None

class PublishBody(BaseModel):
    type: str
    identity: str
    name: str = Field(..., min_length=1, max_length=128)
    description: str = Field(..., max_length=500)
    agree_terms: bool
    readme: str | None = None
    tags: list[str] = Field(default_factory=list)
    publisher_name: str | None = None

class MarketInstallLogOut(BaseModel):
    id: int
    action: str
    from_version: str | None
    to_version: str
    created_at: datetime
```

---

## 7. 数据库设计

遵循 AGENTS.md §7 的范式：新增迁移 `022_market_tables.sql` + `022_market_tables.pg.sql`，并在 `test_db_pool.py` 中更新版本断言至 `22`。

### 7.1 market_items 表

统一的本地市场项缓存表。

```sql
-- 022_market_tables.sql

CREATE TABLE IF NOT EXISTS market_items (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    market_id             TEXT UNIQUE NOT NULL,
                          -- 格式: "{type}:{identity}"
                          -- 示例: "skill:gmail-manager-2",
                          --       "expert:slack-gpt",
                          --       "plugin:njydsz-browser",
                          --       "connector:slack"

    item_type             TEXT NOT NULL
                          CHECK (item_type IN ('skill','expert','plugin','connector')),
    source                TEXT NOT NULL DEFAULT 'ILTIN'
                          CHECK (source IN ('ILTIN','skillhub','clawhub','github','community','local')),
    identity              TEXT NOT NULL,        -- 来源侧原始 id

    name                  TEXT NOT NULL,
    description           TEXT NOT NULL DEFAULT '',
    icon_url              TEXT,
    icon_name             TEXT,                 -- lucide icon name fallback
    color                 TEXT,                 -- hex or named color for theming

    version               TEXT NOT NULL DEFAULT '',
    author                TEXT NOT NULL DEFAULT '',
    author_url            TEXT,

    category              TEXT NOT NULL DEFAULT '',
    tags_json             TEXT NOT NULL DEFAULT '[]',

    -- 市场指标
    rating                REAL,
    downloads             INTEGER NOT NULL DEFAULT 0,

    -- 安装关联
    installed             INTEGER NOT NULL DEFAULT 0,  -- 0/1
    installed_version     TEXT,

    -- 元信息
    source_url            TEXT,                 -- GitHub / 源页面
    license               TEXT,
    metadata_json         TEXT NOT NULL DEFAULT '{}',  -- 类型特定扩展

    published_at          TEXT,
    created_at            TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at            TEXT NOT NULL DEFAULT (datetime('now')),
    refreshed_at          TEXT                    -- 上一次从市场刷新信息的时间
);

CREATE INDEX IF NOT EXISTS idx_market_items_type ON market_items(item_type);
CREATE INDEX IF NOT EXISTS idx_market_items_source ON market_items(source);
CREATE INDEX IF NOT EXISTS idx_market_items_category ON market_items(category);
CREATE INDEX IF NOT EXISTS idx_market_items_installed ON market_items(installed);
CREATE INDEX IF NOT EXISTS idx_market_items_updated ON market_items(updated_at);
CREATE INDEX IF NOT EXISTS idx_market_items_published ON market_items(published_at);
```

```sql
-- 022_market_tables.pg.sql (PostgreSQL 版本)

CREATE TABLE IF NOT EXISTS market_items (
    id                    SERIAL PRIMARY KEY,
    market_id             TEXT UNIQUE NOT NULL,
    item_type             TEXT NOT NULL
                          CHECK (item_type IN ('skill','expert','plugin','connector')),
    source                TEXT NOT NULL DEFAULT 'ILTIN',
    identity              TEXT NOT NULL,
    name                  TEXT NOT NULL,
    description           TEXT NOT NULL DEFAULT '',
    icon_url              TEXT,
    icon_name             TEXT,
    color                 TEXT,
    version               TEXT NOT NULL DEFAULT '',
    author                TEXT NOT NULL DEFAULT '',
    author_url            TEXT,
    category              TEXT NOT NULL DEFAULT '',
    tags                  JSONB NOT NULL DEFAULT '[]',
    rating                REAL,
    downloads             INTEGER NOT NULL DEFAULT 0,
    installed             BOOLEAN NOT NULL DEFAULT FALSE,
    installed_version     TEXT,
    source_url            TEXT,
    license               TEXT,
    metadata              JSONB NOT NULL DEFAULT '{}',
    published_at          TIMESTAMPTZ,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    refreshed_at          TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_market_items_type ON market_items USING btree (item_type);
CREATE INDEX IF NOT EXISTS idx_market_items_source ON market_items USING btree (source);
CREATE INDEX IF NOT EXISTS idx_market_items_category ON market_items USING btree (category);
CREATE INDEX IF NOT EXISTS idx_market_items_installed ON market_items USING btree (installed);
CREATE INDEX IF NOT EXISTS idx_market_items_tags ON market_items USING gin (tags);
```

### 7.2 market_install_registry 表

详细的安装注册表 — agent 维度或全局维度记录每个安装实例。

```sql
-- 续 022_market_tables.sql

CREATE TABLE IF NOT EXISTS market_install_registry (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    market_id             TEXT NOT NULL REFERENCES market_items(market_id),
    user_id               INTEGER NOT NULL REFERENCES users(id),

    -- 安装目标
    target_type           TEXT NOT NULL
                          CHECK (target_type IN ('agent','package','plugin_dir','connector_instance')),
    target_id             TEXT NOT NULL,       -- agent_id / package_id / plugin_dir / instance_id

    installed_version     TEXT NOT NULL,
    installed_at          TEXT NOT NULL DEFAULT (datetime('now')),
    install_source        TEXT NOT NULL DEFAULT 'manual',  -- manual | bulk | auto

    -- 回滚支持
    rollback_snapshot     TEXT,                -- JSON 序列化的安装前状态

    created_at            TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at            TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_market_install_registry_market_id ON market_install_registry(market_id);
CREATE INDEX IF NOT EXISTS idx_market_install_registry_user ON market_install_registry(user_id);
CREATE INDEX IF NOT EXISTS idx_market_install_registry_target ON market_install_registry(target_type, target_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_market_install_unique
    ON market_install_registry(market_id, target_type, target_id);
```

### 7.3 market_install_log 表

安装/更新/卸载审计日志。append-only。

```sql
-- 续 022_market_tables.sql

CREATE TABLE IF NOT EXISTS market_install_log (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    market_id             TEXT NOT NULL,
    target_type           TEXT NOT NULL,
    target_id             TEXT,
    user_id               INTEGER NOT NULL REFERENCES users(id),

    action                TEXT NOT NULL
                          CHECK (action IN ('install','update','rollback','uninstall')),
    from_version          TEXT,
    to_version            TEXT,
    snapshot_id           TEXT,                -- 关联 market_install_registry.rollback_snapshot

    -- 错误信息
    error_code            TEXT,
    error_message         TEXT,

    ip_address            TEXT,
    user_agent            TEXT,

    created_at            TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_market_install_log_market_id ON market_install_log(market_id);
CREATE INDEX IF NOT EXISTS idx_market_install_log_user ON market_install_log(user_id);
CREATE INDEX IF NOT EXISTS idx_market_install_log_action ON market_install_log(action);
CREATE INDEX IF NOT EXISTS idx_market_install_log_created ON market_install_log(created_at);
```

### 7.4 market_search_cache 表

搜索结果本地 TTL 缓存。

```sql
-- 续 022_market_tables.sql

CREATE TABLE IF NOT EXISTS market_search_cache (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    cache_key             TEXT UNIQUE NOT NULL,  -- sha256(item_type + query + filters)

    item_type             TEXT,                  -- null = cross-type
    query                 TEXT NOT NULL DEFAULT '',
    category              TEXT,
    sort                  TEXT NOT NULL DEFAULT 'relevance',
    locale                TEXT NOT NULL DEFAULT 'zh',

    results_json          TEXT NOT NULL,          -- 序列化的 MarketItem[]（仅 id + type + identity）
    total                 INTEGER NOT NULL DEFAULT 0,
    per_type_json         TEXT,                   -- {type: count} 统计

    expires_at            TEXT NOT NULL,
    created_at            TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_market_search_cache_expires ON market_search_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_market_search_cache_key ON market_search_cache(cache_key);
```

### 7.5 market_publishers 表（延时 — Phase 3）

```sql
-- 续 022_market_tables.sql (Phase 3 追加)

CREATE TABLE IF NOT EXISTS market_publishers (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    slug                  TEXT UNIQUE NOT NULL,
    name                  TEXT NOT NULL,
    domain                TEXT,
    avatar_url            TEXT,
    bio_json              TEXT,                   -- {zh, en}
    is_verified           INTEGER NOT NULL DEFAULT 0,
    public_contact        TEXT,
    created_at            TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at            TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### 7.6 与现有表的关联（软关联，不建 FK）

| market_items.market_id | 现有表 | 字段映射 |
|------------------------|--------|----------|
| `skill:{slug}` | `skill_packages` | `skill_packages.slug` |
| `expert:{skillset_slug}` | `published_experts` | `published_experts.slug` |
| `expert:{bundled_id}` | `bundled/` 专家文件系统 | 目录名 |
| `plugin:{dir_name}` | 文件系统 `~/.ydsz-worker/plugins/{dir}` | 目录名 |
| `connector:{kind}` | `connector_instances` + `catalog.json` | connector kind |

通过 `market_id` 前缀 + 应用侧 JOIN 实现软关联；缓存项缺失时实时从来源刷新。

---

## 8. 前端设计

### 8.1 路由与导航

```
前台路由: /market (lazy-loaded)
侧边栏入口: 新增 "Market" icon-shopping-bag / store icon (Lucide store icon)
```

路由注册在 `dashboard/src/routes/index.tsx` 中：

```tsx
{ path: "/market", element: <MarketPage /> },
{ path: "/market/:type", element: <MarketPage /> },     // deep link to tab
{ path: "/market/:type/:id", element: <MarketPage /> }, // deep link to drawer
```

### 8.2 页面结构总览

```
┌──────────────────────────────────────────────────────────────────┐
│  MarketPage                                                      │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Header: [Market icon] 技能市场 & 能力交易                  │  │
│  │          [搜索框 — 输入搜索，↑↓ 选择，Enter 触发]          │  │
│  │          [+] 提交到社区市场 (CTA)                           │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │  Tabs: [Skills] [Experts] [Plugins] [Connectors]          │  │
│  │        [已安装]                                             │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │  FilterBar: [分类▼] [排序: 热门▼] [共 123 项]              │  │
│  │             [标签 cloud]                                    │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │                                                            │  │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐           │  │
│  │  │            │ │            │ │            │           │  │
│  │  │  Card      │ │  Card      │ │  Card      │           │  │
│  │  │ (通用)     │ │            │ │            │           │  │
│  │  │            │ │            │ │            │           │  │
│  │  └────────────┘ └────────────┘ └────────────┘           │  │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐           │  │
│  │  │  Card      │ │  Card      │ │  Card      │           │  │
│  │  └────────────┘ └────────────┘ └────────────┘           │  │
│  │                                                            │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │  Footer: <Prev 1 2 3 ... 12 Next>  /  Infinite scroll      │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─────────────────────────────────────┐                         │
│  │  MarketDetailDrawer (右侧滑出)      │                         │
│  │  [Icon]  Name                       │                         │
│  │  ★4.8 · 12.3k installs · @author   │                         │
│  │  ───────────────────────────────── │                         │
│  │  [简介] [版本] [依赖] [文档]        │                         │
│  │  (Tab content)                      │                         │
│  │  ───────────────────────────────── │                         │
│  │  [安装/更新/配置]    [链接源]       │                         │
│  └─────────────────────────────────────┘                         │
└──────────────────────────────────────────────────────────────────┘
```

### 8.3 卡片设计

```
┌──────────────────────────┐
│ ┌──────┐                 │
│ │      │ Name            │
│ │ Icon │ @author         │
│ │      │                 │
│ └──────┘ ★4.8  12.3k     │
│ ──────────────────────── │
│ 简单描述最多两行...       │
│ ──────────────────────── │
│ [tag] [tag] [tag]        │
│ ──────────────────────── │
│ [已安装] [更新] [安装]   │
└──────────────────────────┘

尺寸: 240-280px 宽, 自适应高度
Hovered: 阴影加深 + 轻微 scale(1.02)
```

### 8.4 详情 Drawer 内容

**通用 Tab**：
- **简介 Tab**: readme / user_doc_url iframe / source_url 链接
- **版本历史 Tab**: changelog + 版本时间线 (Timeline)
- **依赖 Tab**: dependencies 列表（任何其他市场项 -> 可点击跳转）
- **文档 Tab**: 详情（技能 → SKILL.md; 专家 → SOUL.md + quick prompts; 插件 → plugin.yaml + tools; 连接器 → OAuth guide）

### 8.5 搜索框行为

```
Input: 实时搜索 (debounced 300ms)
  → loading skeleton
  → 结果按类型聚合显示
  → ↑/↓ 键盘导航 (phase 2)
  → Esc 清空
  → Enter 触发搜索
  → 空输入 → 显示 featured/hot
```

### 8.6 「已安装」Tab 内容

```
┌──────────────────────────────────────────────────────────┐
│  [分类: 全部▼] [可更新: 3]  [批量检查更新]                │
│  ──────────────────────────────────────────────────────  │
│  ☑ 技能 4 项 — 1 项可更新                                │
│    ┌── Gmail Manager    v1.3 → v1.4  [更新] [配置] ──┐  │
│    ┌── GitHub PR Review v2.1 → v2.2  [更新] [配置] ──┘  │
│  ☑ 专家 2 项                                            │
│    ┌── Slack Community Manager v1.0  [配置] ─────────┐  │
│  ☑ 插件 3 项 — bundled 不可更新                        │
│  ☑ 连接器 1 项                                          │
│    ┌── Slack (OAuth)  ✅ 已连接  [重新授权] [断开] ──┐  │
└──────────────────────────────────────────────────────────┘
```

### 8.7 安装流程

不同市场类型的安装 UI：

| 类型 | 安装 UI | 备注 |
|------|---------|------|
| 技能 | [安装] → Modal 选 agent → 安装进度 → 成功 | 支持批量：多选 agent + 一键安装 |
| 专家 | [创建] → Modal 填写 name/description/model → 创建进度 → 跳转到新 agent | |
| 插件 | [安装] → 确认 → 安装进度 → 成功 | bundled: copy dir; git: clone |
| 连接器 | [连接] → 分支: OAuth 跳转 OR 配置表单 → 保存 | 复用现有 Connectors authorization 流程 |

### 8.8 「提交到社区市场」流程（Phase 3)

```
[+ 提交到社区市场]
  → Modal
    ○ 提交新技能     → 打包本地 skill dir + 填元信息
    ○ 提交新专家     → 打包当前 agent + manifest
    ○ 提交新插件     → 打包本地 plugin dir + 填元信息
    ○ 提交新连接器   → catalog entry JSON + 填元信息
  → 同意社区条款
  → POST /api/market/publish
  → 提交成功！等待审核（展示审核追踪链接）
```

### 8.9 文件结构

```
dashboard/src/pages/Market/
├── index.tsx                       # MarketPage 主页面
├── index.module.less               # 页面样式 (CSS modules)
├── README.md                       # 页面功能说明
│
├── router.ts                       # Tab → 组件映射 + deep link 路由
│
├── hooks/
│   ├── useMarketSearch.ts          # 防抖搜索 hook
│   ├── useMarketList.ts            # 列表加载/分页 hook
│   ├── useMarketDetail.ts          # 详情加载 hook
│   ├── useMarketInstall.ts         # 安装/更新/卸载操作
│   ├── useInstalledTab.ts          # 已安装 Tab 数据加载
│   └── useMarketCategories.ts      # 分类/筛选元信息
│
├── components/
│   ├── MarketHeader.tsx            # 标题 + 搜索框 + CTA
│   ├── MarketSearchBar.tsx         # 搜索框 (debounced input)
│   ├── MarketTabs.tsx              # Tab 栏 (5 个 Tab)
│   ├── MarketFilterBar.tsx         # 分类/排序/标签筛选条
│   ├── MarketCard.tsx              # 通用市场卡片
│   ├── MarketCardGrid.tsx          # 卡片网格 + 空/加载态
│   ├── MarketDetailDrawer.tsx      # 右侧详情 Drawer
│   ├── MarketDetailTabs.tsx        # Drawer 内的 Tab
│   ├── MarketInstallButton.tsx     # 安装按钮 (适配 4 类型)
│   ├── MarketPagination.tsx        # 分页组件
│   └── type-meta.ts                # 四种类型元数据 (默认图标/颜色/空态)
│
├── tabs/
│   ├── SkillsTab.tsx               # 技能 Tab |
│   ├── ExpertsTab.tsx              # 专家 Tab | — 各 Tab 是列表 + 类型专属行为
│   ├── PluginsTab.tsx              # 插件 Tab |
│   ├── ConnectorsTab.tsx           # 连接器 Tab |
│   └── InstalledTab.tsx            # 已安装 Tab
│
├── components-skills/              # 技能专属子组件
│   ├── SkillInstallModal.tsx       # 选 agent 安装 Modal
│   └── SkillContentPreview.tsx     # SKILL.md 预览
│
├── components-experts/             # 专家专属子组件
│   ├── ExpertCreateModal.tsx       # 创建 Agent 的表单 Modal
│   └── ExpertContentPreview.tsx    # SOUL.md + quick prompts 预览
│
├── components-plugins/             # 插件专属子组件
│   ├── PluginInstallButton.tsx     # 安装 + 状态展示
│   └── PluginToolsPreview.tsx      # tools 列表
│
├── components-connectors/          # 连接器专属子组件
│   ├── ConnectorAuthorizeModal.tsx # OAuth 跳转 / Token 配置表单
│   └── ConnectorStatusBadge.tsx    # 已连接/待配置/过期
│
└── publish/                        # 提交上架 (Phase 3)
    ├── PublishModal.tsx
    ├── PublishForm.tsx
    └── PublishSkillTab.tsx
```

### 8.10 新增 API 客户端模块

```
dashboard/src/api/modules/
├── market.ts                       # 新增：统一市场 API
│   ├── marketSearch(query, filters) → Promise<AggregatedSearchResult>
│   ├── marketList(type, filters) → Promise<MarketListResult>
│   ├── marketDetail(type, id) → Promise<MarketDetail>
│   ├── marketInstall(type, id, opts) → Promise<InstallReceipt>
│   ├── marketUpdate(type, id) → Promise<InstallReceipt>
│   ├── marketUninstall(type, id) → Promise<void>
│   ├── marketCategories(type) → Promise<Category[]>
│   ├── marketInstalled(opts) → Promise<InstalledAcrossResult>
│   ├── marketPublish(payload) → Promise<PublishReceipt>
│   └── marketFeatured(type?, limit) → Promise<MarketItem[]>
```

### 8.11 组件状态管理

不引入额外状态管理库（不加重架构）。组件间通信：
- **全局热数据**：React Query (useQuery/useMutation) — 已有项目使用模式
- **分页/搜索条件**：URL query string (useSearchParams)
- Tab 激活、Drawer 打开：组件自身 state
- 跨 Tab 安装状态：React Query cache invalidation 通知其他 Tab refetch

### 8.12 与现有页面的关系

| 现有页面 | 本方案操作 | 最终结果 |
|---------|-----------|---------|
| `/experts/` (ExpertsPage) | 保留，不改动 | 继续作为独立的专家全功能页面 |
| `/connectors/` (ConnectorsPage) | 保留，不改动 | 继续作为独立的连接器管理页面 |
| `/skill-packages/` (SkillPackagesPage) | 保留，不改动 | Agent 内 Skillset 管理 |
| `/personalization/skills` (Agent 内 Skills) | 保留，不改动 | Agent 级别 CRUD |
| `/admin/plugins/` | 保留 + 与 Market 互通安装状态 | 管理员视角的插件管理 |
| — | **新建** `/market` | 统一市场发现与装配入口 |

核心原则：**Market 是「发现+安装」页面，不替代「管理已安装」页面**。

---

## 9. 四大市场子系统详细设计

### 9.1 技能市场（Skills）

#### 数据源

| 来源 | API/函数 | 说明 |
|------|---------|------|
| ILTIN SkillHub | `search_skillhub(query)` + `fetch_skillhub_rankings()` | 主来源 |
| ClawHub | `search_hub_skills(query)` | 补充来源 |
| GitHub | `resolve_bundle_from_url()` | 通过 URL 导入 |
| 本地 | `SkillPackageStore.list_packages()` | 已安装入口 |

#### 列表项字段映射

```
market_item.skill = {
  slug: identity,
  name: item.name,
  description: item.description,
  icon: item.icon_url,
  version: item.version,
  author: item.author,
  category: item.category || fallback("其他"),
  tags: item.tags,
  downloads: item.downloads,
  installed: installed,
  has_update: has_update,
  size_bytes: item.size_bytes || null,
  source_url: `https://skillhub.qoder.com/packages/${slug}`,
  metadata: { package_type, skill_count }
}
```

#### 安装流程

```
[安装] → Modal:
  1. 选择安装目标:
     ○ 安装到 Agent: <Agent Selector>
     ○ 安装为 Package: [auto-suggest name from slug]
  2. [确认] → POST /api/market/skills/{slug}/install
     body: { agent_id } or { package_id }
  3. 安装中: Progress bar (下载 + 解压 + 校验)
  4. 安装成功: Toast + 跳转 agent 技能页
```

#### 更新检查

```
每次打开 Tab 或 Installed Tab 时:
1. 读取本地已安装技能 (skill_packages + agent slugs)
2. GET /api/market/skills?slugs=a,b,c (批量)
3. 对比 installed_ver vs latest version
4. 在卡片上显示 "更新" badge
```

### 9.2 专家市场（Experts）

#### 数据源

| 来源 | API/函数 | 说明 |
|------|---------|------|
| 内建 bundled | `discover_seed_paths()` + `CatalogImporter` | agents/experts/bundled/ |
| SkillHub Skillset | `browse_skillsets()` / `fetch_skillset_detail()` | 远程 Skillset 市场 |
| 已发布(Published) | `PublishedExpert` 表 + `MarketExpert` 模型 | published_experts 表 |

#### 列表项字段映射

```
market_item.expert = {
  slug: identity,
  name: item.name,
  description: item.description,
  icon: item.icon_url,
  icon_name: item.icon_name,
  color: item.color,
  version: "1.0.0",  # experts 通常无多版本
  author: item.author,
  category: item.scene || item.category,
  tags: [item.scene, item.sub_scene].filter(Boolean),
  downloads: item.downloads || 0,
  installed: installed,  # agent.creator_bundle === slug
  metadata: {
    scene: item.scene,
    sub_scene: item.sub_scene,
    skill_slugs: item.skill_slugs,
    skill_count: item.skill_count,
    quick_prompts: item.quick_prompts
  }
}
```

#### 安装流程

```
[创建 Agent] → Modal:
  1. 填写 Agent 信息:
     Name: [prefilled from expert.name]
     Description: [prefilled from expert.description]
     Model: [default from config]
  2. [创建] → POST /api/market/experts/{slug}/install
     body: { name, description, model }
  3. 创建中: Progress bar (下载 Skillset + 创建 Agent 记录 + 写入 workspace)
  4. 成功: Toast + 跳转到 /chat/{new_agent_id}
```

#### Drawer 特殊内容

- 专家详情 Drawer 展示 SOUL.md 预览 + quick prompts + task examples
- 底部展示 skill_count 及 skills 列表（链接到 skills tab 详情）

### 9.3 插件市场（Plugins）

#### 数据源

| 来源 | API/函数 | 说明 |
|------|---------|------|
| 内建 bundled | `Plugin.bundled_plugins` (目录扫描) | infra/agents/plugins/bundled/ |
| Git 远程 | 暂未实现（Phase 2） | 通过 `market_import_url_prefixes` 配置 |
| 本地已安装 | `Plugin.list_installed()` | 读取 ~/.ydsz-worker/plugins/ |

#### 列表项字段映射

```
market_item.plugin = {
  id: identity,
  name: localized(item.name || item.id),
  description: localized(item.description),
  icon: item.icon_url || null,
  icon_name: item.icon_name || "puzzle",
  version: item.version || "bundled",
  author: "ILTIN" | item.author,
  category: item.group || "other",  # group 作为 category
  tags: [item.kind, item.group].filter(Boolean),
  installed: installed,
  has_update: false（bundled 跟随版本） || git installed 时检查
  metadata: {
    kind: item.kind,
    group: item.group,
    requires: item.requires,
    tools: item.tools (tool names + descriptions)
  }
}
```

#### 安装流程

```
bundled [安装]:
  [安装] → confirm dialog → POST /api/market/plugins/{id}/install
  → copy bundled dir to ~/.ydsz-worker/plugins/{id}
  → notify_plugins_changed() (事件总线)
  → Toast 成功

Git [安装] (Phase 2):
  [安装] → Modal 确认 URL → POST install { url }
  → backend: git clone + plugin.yaml 校验 + sig verify
  → notify_plugins_changed()
  → Toast 成功
```

#### 分组过滤

沿用现有 `PLUGIN_GROUP_ORDER` + `isKnownPluginGroup()` 逻辑。

### 9.4 连接器市场（Connectors）

#### 数据源

| 来源 | API/函数 | 说明 |
|------|---------|------|
| catalog.json 内置 | `list_catalog(category, auth_kind)` | infra/connectors/catalog.py |
| OAuth 动态注册 | `oauth_registry` | 运行时 OAuth provider 注册 |
| 自定义 custom_mcp | `CUSTOM_MCP_KIND` | 已安装 custom MCP |
| 已安装 instances | `ConnectorService` + `connector_instances` 表 | 判断 installed 状态 |

#### 列表项字段映射

```
market_item.connector = {
  kind: identity,
  name: localized(catalog.name),
  description: localized(catalog.description),
  icon: catalog.icon,        # URL or lucide icon name
  color: catalog.color,
  auth_kind: catalog.auth_kind,
  doc_url: catalog.doc_url,
  version: "1.0.0",  # connectors 通常无版本概念
  author: "ILTIN" | catalog.author,
  category: catalog.category,
  tags: [catalog.category, catalog.auth_kind, catalog.mcp_mode].filter(Boolean),
  installed: installed_count > 0,
  installed_ver: n/a,
  has_update: false,  # catalog 不频繁变更；仅当 catalog.json 更新时
  source_url: catalog.source_url || null,
  metadata: {
    auth_kind: catalog.auth_kind,
    mcp_mode: catalog.mcp_mode,
    phase: catalog.phase,       # available | coming_soon
    supports_quick_auth: catalog.supports_quick_auth,
    oauth_mode: catalog.oauth_mode,
    credential_fields: catalog.credential_fields,
    quick_auth_url: catalog.quick_auth_url
  }
}
```

#### 安装（授权）流程

```
[连接] → 分支判断:

Branch 1: OAuth2 (with quick_auth):
  [连接] → POST /api/market/connectors/{kind}/authorize
  → 返回 { oauth_url }
  → 前端 window.open(oauth_url) 或在 Modal 中嵌入 iframe
  → OAuth callback → 后端 exchange → 返回 success
  → Toast + 更新 installed 状态

Branch 2: OAuth2 (without quick_auth):
  [连接] → Modal/侧栏:
    - 输入 client_id, client_secret (or use pre-registered)
    - [连接] → POST authorize → redirect
    - OAuth callback → exchange

Branch 3: personal_token / api_key / api_token:
  [连接] → Modal:
    - 表单: token / key 输入
    - instance_name (prefill: catalog.name)
    - [保存] → POST authorize { credentials, auth_kind, instance_name }
    - 后端: validate → build_connector_instance → save
    - Toast success

Branch 4: custom_fields:
  [配置] → Modal 动态渲染 credential_fields
    - 每个 field → text/password/url/tags 输入
    - [保存]
```

#### Drawer 特殊内容

- 显示 connection guide（guide_url iframe 或 Markdown）
- 当已安装时：显示已连接实例列表（name、过期时间、重授权按钮）
- 当 auth_kind=oauth2 且 OAuth 预注册：显示 quick auth 按钮

---

## 10. 集成策略

### 10.1 后端集成步骤

1. **创建 `infra/market/` 骨架**：providers/ + repos/ + 基础模型 + MarketManager
2. **实现 SkillsProvider**：包装 `skillhub_market.py` + `skill_archive.py`
3. **实现 ExpertsProvider**：包装 `skillhub_market.py` (agents侧) + `market_creation.py`
4. **实现 PluginsProvider**：包装 `PluginManager.bundled_plugins` + `Plugin.list_installed()`
5. **实现 ConnectorsProvider**：包装 `list_catalog()` + `ConnectorService` 查询
6. **实现 MarketManager + InstallService + SearchService**
7. **创建 `api/routers/market.py`**：薄编排层，调用 MarketManager
8. **注册路由**：在 `api/app.py` 中 `include_router(market.router, prefix="/api/market", tags=["market"])`
9. **创建 DB 迁移**：`022_market_tables.sql` + `.pg.sql`
10. **创建 Repos**：`MarketItemRepo` + `MarketInstallRepo` + `MarketSearchCacheRepo`
11. **i18n 字符串**：在 `en.json` + `zh.json` 中新增 `market.*`
12. **环境变量**：在 `config.py` 中新增 `YDSZ_MARKET_*` 字段

### 10.2 前端集成步骤

1. **创建 `dashboard/src/pages/Market/` 骨架**
2. **新增路由**：在 `routes/index.tsx` 中注册 `/market`
3. **新增侧边栏入口**：在 `layouts/` 侧边栏配置中新增 market 图标入口
4. **实现核心组件**：
   - MarketPage + MarketSearchBar + MarketTabs + MarketFilterBar
   - MarketCard + MarketCardGrid + MarketDetailDrawer
5. **实现 hooks**：useMarketList/useMarketDetail/useMarketInstall + React Query
6. **实现类型 Tab**：SkillsTab → ExpertsTab → PluginsTab → ConnectorsTab
7. **实现 InstalledTab**：跨 provider 聚合
8. **集成 i18n**：在 `locales/en.json` + `zh.json` 中新增 `market.*`
9. **对接 API**：新建 `dashboard/src/api/modules/market.ts`

### 10.3 关键复用点

| 现有模块 | 市场模块复用方式 |
|---------|----------------|
| `infra/skills/skillhub_market.py` 的 search/browse/download | SkillsProvider 直接包装调用 |
| `infra/skills/skill_archive.py` 的 build_skill_zip | SkillsProvider 提交上架时使用 |
| `infra/agents/experts/skillhub_market.py` 的 Skillset browse/detail | ExpertsProvider 包装调用 |
| `infra/agents/experts/market_creation.py` 的 create_agent_from_skillhub | ExpertsProvider.install |
| `infra/agents/experts/published_creation.py` 的 install_published/publish_agent | ExpertsProvider.install + InstallService 中 publish 流程 |
| `infra/agents/plugins/Plugin.bundled_plugins` | PluginsProvider.list_items 扫描 bundled |
| `infra/agents/plugins/Plugin.install` / `Plugin.uninstall` | PluginsProvider.install |
| `infra/connectors/catalog.py` 的 list_catalog | ConnectorsProvider.list_items |
| `infra/connectors/builder.py` 的 build_connector_instance | ConnectorsProvider.install |
| `infra/connectors/oauth/` 全套 OAuth 流程 | ConnectorsProvider.authorize (Phase 1 复用现有 connectors API) |
| 前端 `pluginsApi.listMarket()` | 数据源 → PluginsProvider.list_items 后端化 |
| 前端 `expertMarketApi.listHub()` | 数据源 → ExpertsProvider.list_items 后端化 |
| 前端 `connectorsApi.listCatalog()` | 数据源 → ConnectorsProvider.list_items 后端化 |
| React Query 数据加载 hooks | 统一 useMarketList / useMarketDetail 模式 |
| ydsz-ui 组件库 | 用 ydsz-ui YdCard/YdDrawer/YdButton/Y等组件落地 UI |

---

## 11. i18n 国际化

### 11.1 新增 i18n key

```jsonc
// src/ydsz/i18n/en.json
"market": {
  "title": "Marketplace",
  "title_subtitle": "Discover & install Skills, Experts, Plugins, Connectors",
  "search": {
    "placeholder": "Search the marketplace...",
    "noResults": "No results found for \"{query}\"",
    "noResultsHint": "Try different keywords or browse categories",
    "clear": "Clear",
    "filters": "Filters"
  },
  "tabs": {
    "skills": "Skills",
    "experts": "Experts",
    "plugins": "Plugins",
    "connectors": "Connectors",
    "installed": "Installed"
  },
  "filters": {
    "category": "Category",
    "allCategory": "All",
    "sort": "Sort",
    "sortRelevance": "Relevance",
    "sortDownloads": "Most Installed",
    "sortRating": "Top Rated",
    "sortNewest": "Latest",
    "group": "Group",
    "authKind": "Auth Type",
    "count": "{count} items"
  },
  "card": {
    "byAuthor": "by {name}",
    "downloads": "{count} installs",
    "rating": "{score} rating",
    "installed": "Installed",
    "updateAvailable": "Update available",
    "comingSoon": "Coming soon",
    "configure": "Configure"
  },
  "actions": {
    "install": "Install",
    "installing": "Installing...",
    "update": "Update",
    "updating": "Updating...",
    "submit": "Submit to Marketplace",
    "connect": "Connect",
    "disconnect": "Disconnect",
    "configure": "Configure",
    "retry": "Retry",
    "viewSource": "View Source"
  },
  "install": {
    "selectAgent": "Choose Agent",
    "selectPackage": "Install as Package",
    "chooseTarget": "Select where to install:",
    "nameLabel": "Agent Name",
    "namePlaceholder": "Enter a name...",
    "descLabel": "Description",
    "modelLabel": "Model",
    ...
  },
  "installed": {
    "title": "My Installed",
    "updatesAvailable": "{count} update(s) available",
    "checkUpdates": "Check for updates",
    ...
  },
  "empty": {
    "noInstalled": "You haven't installed anything yet",
    "noInstalledHint": "Browse the marketplace to discover capabilities",
    "noMatchingInstalled": "No installed items match your filter"
  }
}

// dashboard/src/locales/en.json (前端同步)
"market": { ... } // 同结构
```

### 11.2 LocalizedText 处理

统一的多语言文本使用 `{"zh": "...", "en": "..."}` 模式（沿用现有 `LocalizedText` 类型约定）。当只有一种语言时，提供 `{"en": "..."}` 即可。

---

## 12. 安全设计

### 12.1 防范的攻击向量

| 威胁 | 缓解措施 |
|------|----------|
| 市场 ZIP 包含路径遍历文件和二进制执行 | 复用 `skill_archive.py` 现有安全校验：zip path traversal check + 压缩比限制 + 文件类型白名单 |
| 远程代码执行 (RCE) | 所有插件/技能在 agent sandbox 中执行；安装到 `~/.ydsz-worker/plugins/` 的代码不直接执行 |
| URL source 白名单绕过 | `market_import_url_prefixes` 环境变量严格校验 URL 前缀；仅允许 HTTPS |
| OAuth CSRF 攻击 | 沿用现有 PKCE + state 参数机制 |
| 下载量 / 评分伪造 | 数据源信任 SkillHub 签名；本模块本地统计仅参考 |
| SSRF (服务端请求伪造) | 在 `utils.validate_url()` 中校验 URL 为非内网 IP + 匹配白名单 |

### 12.2 权限控制

| 操作 | 权限要求 |
|------|---------|
| 浏览市场 | 任意登录用户 |
| 安装技能到 Agent | Agent owner 或 admin |
| 安装为 Package | 任意登录用户 |
| 安装插件 | admin (插件影响所有 agents) |
| 配置 Connector | owner 或 admin (connector 有独立的 shared 概念) |
| 发布上架 | 需 `accept_terms`；提交后进入 admin review 流程 |
| admin 审核发布 | admin 角色 |

### 12.3 内容审核

提交的 Publish 内容：
1. 用户确认 `agree_terms: true`
2. 后端创建 `market_items` 记录，`review_status: "pending"`
3. admin 在 `/admin/market` 后台审核（Phase 3 新增 admin 页面）
4. 审核通过 → `review_status: "approved"` → 出现在市场列表
5. 审核拒绝 → `review_status: "rejected"` → 通知提交者

---

## 13. 实施计划

### Phase 1: MVP (4-6 周)

**目标**: 上线统一市场入口 + Skills + Experts + Plugins + Connectors 四 Tab 浏览/搜索/安装。

| 周 | 任务 | 交付物 |
|----|------|--------|
| W1 | DB 迁移 + `infra/market/` 骨架 + MarketManager + InstallService | 单元测试骨架 |
| W2 | SkillsProvider + ExpertsProvider + `api/routers/market.py` | `/api/market/skills/*` + `/api/market/experts/*` 可用 |
| W3 | PluginsProvider + ConnectorsProvider + InstallService 完善 | 全部 Providers + 路由可用 |
| W4 | SearchService + 缓存 + MarketManager 跨 provider 搜索 | `/api/market/search` 可用 |
| W5 | 前端 MarketPage + 搜索/Tab/卡片/筛选 | 前端 MVP 可见可点 |
| W6 | 前端 Drawer + 安装流程 + InstalledTab + i18n | MVP 闭环 |

### Phase 2: 打磨 (3-4 周)

- 提交上架（Publish）流程
- 已安装状态的后台版本检查（UpdateChecker 定时任务）
- 跨市场高级筛选（按 author/license/平台）
- 错误状态/离线状态 UI
- 搜索防抖 + 缓存命中率提升
- 安装进度条流式展示（SSE）

### Phase 3: 创作者平台 (4+ 周)

- Publisher 个人主页
- 评价/评分系统
- admin 审核后台
- 推荐算法（个性化推荐）
- 数据分析（安装量趋势统计）

### 测试策略

| 类型 | 文件 | 覆盖内容 |
|------|------|---------|
| 单元测试 | `tests/unit/market/test_providers.py` | 每个 Provider 的 list/search/detail 方法 |
| 单元测试 | `tests/unit/market/test_search.py` | SearchService 聚合排序 |
| 单元测试 | `tests/unit/market/test_install.py` | InstallService + rollback |
| 集成测试 | `tests/integration/market/test_market_api.py` | 全链路 API 测试 |
| 前端测试 | `pages/Market/__tests__/*` | 关键组件渲染 + 用户交互 |

---

## 14. 待确认事项

### 14.1 产品方向

1. **范围**: 是否以 Phase 1 MVP 范围（4 Tab + 统一搜索 + 安装）一期上线？
2. **UI 融合**: Market 页面是完全新建？还是改造现有 `Experts/` + `SkillPackages/` + `Admin/Plugins/` 页面嵌入 Tab？倾向完全新建（保持旧页面兼容性）。
3. **Plugin 远程市场**: ILTIN 是否有 Plugin 目录 API？若不够用，bundled-only 是否满足需求？
4. **Connector 分开视图**: Connector 是否需要独立的「市场浏览」和「实例管理」两个视图？还是合并？倾向于保留现有 `/connectors` 独立管理页。
5. **Publish 流程**: 第一轮是否需要上架功能？还是预留 API 但先不上架 admin UI？建议第一轮预留 API。
6. **评分来源**: rating 和 downloads 数据来自 SkillHub，还是仅 ILTIN 能提供？若 ILTIN 无此数据则 Phase 1 隐藏 rating。
7. **侧边栏新入口**: 是否在侧边栏新增顶级入口（位置在哪？建议放在 Expert 上方）？确认。

### 14.2 技术选点

8. **ORM/SQL**: 市场模块的项目表是否沿用现有 SQLite/PG 共享数据库，还是独立 SQLite？建议共享。
9. **前端状态管理**: 继续使用 React Query + URL query string，还是引入 Zustand？建议继续 React Query。
10. **搜索防抖**: 搜索延迟取 300ms（与现有前端习惯一致），确认。
11. **卡片尺寸**: 240-240px 固定宽 + 高度自适应 还是 280px 全固定？建议 240px 宽 + 固定高度 260px。
12. **API 版本**: `/api/market/*` 是否需要 v1 前缀？建议不加（现有 API 无版本前缀传统）。

### 14.3 风险与权衡

13. **SkillHub API 稳定性**: 依赖外部 SkillHub HTTP 端点；若 ILTIN 变更 API 则 Provider 需适配。在 SkillsProvider 中集中适配。
14. **Connector 安装状态**: connector 实例与 agent 是多对多关系，installed 判断逻辑较复杂，建议以「用户是否有该 kind 的活跃实例」为准。
15. **Plugin bundled 的 UUID/path**: bundled 插件更新跟随系统版本，应标记为不可更新。

---

## 附录 A: Qoder Marketplace 设计参考

市场页面（qoder.com/zh/marketplace）截图结构分析：

```
┌─────────────────────────────────────────────────┐
│ [Logo]  Marketplace             [搜索框] [发布] │
│ ─────────────────────────────────────────────── │
│ [全部]  [Skills]  [Plugins]  [Connectors]      │
│ ─────────────────────────────────────────────── │
│ [分类▼] [排序▼]                   共 N 项       │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          │
│ │      │ │      │ │      │ │      │          │
│ │ Name │ │ Name │ │ Name │ │ Name │          │
│ │ ★4.8 │ │ ★4.5 │ │ ★4.7 │ │ ★4.2 │          │
│ │ [安装]│ │ [安装]│ │ [安装]│ │ [安装]│          │
│ └──────┘ └──────┘ └──────┘ └──────┘          │
│ ← 1 2 3 ... 8 →                               │
└─────────────────────────────────────────────────┘
```

设计要素提取：
- **3 个内容 Tab**: Skills / Plugins / Connectors（云顶额外增加 Experts）
- **顶部筛选条**: 分类 dropdown + 排序 dropdown
- **卡片网格**: icon + name + rating + install button + author
- **分页**: 底部或无限滚动
- **顶部 CTA**: 「发布到社区」按钮
- **扁平配色**: 无重色背景，白色 + 灰边框卡片
- **搜索框**: 顶部全局搜索带放大镜 icon

云顶将在此基础上增加：
- 第 4 个 Expert 专家 Tab + 第 5 个「已安装」Tab
- 详情 Drawer（Qoder 点击 card 似乎是跳新页面）
- 安装 Qoder 更重的环境配置能力（agent 选择、OAuth 等）

---

## 附录 B: 现有系统市场能力索引

### B.1 后端模块

| 文件 | 核心类/函数 | 用途 |
|------|-----------|------|
| `infra/skills/install.py` | `install_skillhub_skill()` / `import_local_skill()` | 技能安装到 workspace |
| `infra/skills/skill_archive.py` | `build_skill_zip()` / `build_skills_zip()` | 打包技能为 ZIP 归档 |
| `infra/skills/skill_packages.py` | `resolve_skill_package()` / `validate_skill_slug()` | 包解析/校验 |
| `infra/skills/skill_transfer.py` | `copy_package_skills_to_workspace()` | 包 → workspace 转移 |
| `infra/skills/skillhub_market.py` | `search_skillhub()` + `fetch_skillhub_rankings()` + `download_skillhub_package()` | SkillHub HTTP 市场 |
| `infra/skills/skills_hub.py` | `resolve_bundle_from_url()` / `search_hub_skills()` | URL/clawhub 导入 |
| `infra/skills/skillhub_common.py` | `DEFAULT_SKILLHUB_HOST` + 限制常量 | 共享配置 |
| `infra/skills/skill_package_from_skillhub.py` | `fetch_skillhub_package_for_workspace()` | SkillHub 下载到 workspace |
| `infra/agents/experts/catalog.py` | `discover_experts()` / `build_create_spec_from_expert()` | 专家目录浏览 |
| `infra/agents/experts/publish.py` | `publish_expert()` | 专家发布 |
| `infra/agents/experts/skillhub_market.py` | `install_skillset_template()` / `fetch_skillset_detail()` | SkillHub Skillset 市场 |
| `infra/agents/experts/market_creation.py` | `create_agent_from_skillhub_skillset()` | 从 Skillset 创建 Agent |
| `infra/agents/experts/published_creation.py` | `install_published_expert()` / `publish_agent_expert()` / `refresh_published_expert()` | 已发布专家 PUBLISH 周期 |
| `infra/agents/experts/manifest_generator.py` | `build_skillhub_agent_manifest_bytes()` | manifest 生成 |
| `infra/agents/plugins/manager.py` | `Plugin.bundled_plugins` / `Plugin.manifest_load` / `Plugin.list_installed` | 插件目录管理 |
| `infra/connectors/catalog.py` | `list_catalog()` + `catalog_entry_to_dict()` + `get_catalog_entry()` | 连接器目录 |
| `infra/connectors/builder.py` | `build_connector_instance()` | 连接器实例构建 |
| `infra/connectors/oauth/pkce.py` | PKCE 代码生成/校验 | OAuth PKCE |
| `infra/connectors/oauth/registry.py` | OAuth 注册表 | OAuth 注册 |
| `infra/connectors/oauth/builtin.py` | 内置 OAuth 提供者 | 内置 OAuth |
| `infra/db/repos/skill_packages.py` | `SkillPackageRepo` | 技能包表 CRUD |
| `infra/db/repos/published_experts.py` | `PublishedExpertRepo` | 已发布专家表 CRUD |
| `infra/db/repos/connector_instances.py` | `ConnectorInstanceRepo` | 连接器实例表 CRUD |

### B.2 前端模块

| 文件 | 说明 |
|------|------|
| `api/modules/plugins.ts` | InstalledPlugin / AgentPluginTool 类型 + `pluginsApi.listMarket()` |
| `api/modules/expertMarket.ts` | MarketExpert 类型 + `expertMarketApi.listHub()` / `.detailHub()` |
| `api/modules/connectors.ts` | ConnectorCatalogEntry 类型 + `connectorsApi.listCatalog()` |
| `api/modules/skillPackages.ts` | `skillPackagesApi.list()` / `.install()` |
| `api/modules/publishedExperts.ts` | PublishedExperts API |
| `pages/Admin/Plugins/PluginMarketPanel.tsx` | 现有插件市场面板 (Ant Design) |
| `pages/Admin/Plugins/PluginIconView.tsx` | 插件图标渲染 |
| `pages/Admin/Plugins/PluginCardMeta.tsx` | 插件 meta 信息 |
| `pages/Experts/ExpertMarketTab.tsx` | 现有 Expert SkillHub 市场 tab |
| `pages/Agent/Connectors/` | Agent 级别连接器管理 |
| `pages/Agent/Skills/` | Agent 级别技能管理 |
| `pages/SkillPackages/` | 技能包管理（含 Skillset 从 Hub 创建） |
| `components/Skeleton.tsx` | CardSkeleton 加载占位 |

---

> **Document Version History**
>
> | v1.0 | 2026-10-29 | 首版 — 综合架构 + API + DB + 前端详细设计 |
