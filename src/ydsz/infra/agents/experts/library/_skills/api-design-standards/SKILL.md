---
name: api-design-standards
description: "RESTful + GraphQL 设计的工业级规范参考——Richardson 成熟度模型 0-3 级对比、OpenAPI 3.1 必填字段清单、错误码规范、分页/版本/限流/安全策略决策树，从能用到好用的升级路径。"
metadata:
  Ydsz:
    emoji: "📐"
    label:
      zh: "API 设计规范"
      en: "API Design Standards"
    summary:
      zh: "RESTful 与 GraphQL API 设计的工业级规范参考，覆盖成熟度模型到安全策略的全链路。"
      en: "Industrial-grade RESTful & GraphQL API design standards, covering maturity models to security strategy."
---

# API 设计规范

## Richardson 成熟度模型（Level 0-3）

| 层级 | 名称 | 关键特征 | 适用场景 | 局限 |
|------|------|----------|----------|------|
| Level 0 | The Swamp of POX | 单一 HTTP 端点（通常是 POST），用 body 区分操作。RPC over HTTP | 简单内部工具、Soap 迁移过渡期 | 无标准化约束、自描述性差 |
| Level 1 | Resources | 暴露多个资源端点，但只用 GET/POST | CRUD 类业务、快速原型 | 语义利用率低、GET 带副作用 |
| Level 2 | HTTP Verbs | 正确使用 GET/POST/PUT/PATCH/DELETE，状态码按语义返回 | 绝大多数生产服务的主流选择 | 缺乏发现机制 |
| Level 3 | HATEOAS | 响应中嵌入链接描述状态转移（`_links`），客户端自发现 | 超媒体平台、需要强可演进性的系统 | 过度设计、客户端配合成本高 |

**选型建议**：默认 Level 2，内部 API 可 Level 1，仅在对 API 可进化性有强诉求（如多版本长期共存）时考虑 Level 3。

---

## RESTful 资源命名规则

### 命名原则

1. **名词复数**：`/users`、`/orders`，不使用动词（禁止 `/getUsers`）
2. **小写 + 短横线**：`/order-items`，禁止下划线和驼峰
3. **嵌套深度 ≤ 2**：`/users/{id}/orders` 可接受，`/users/{id}/orders/{id}/items/{id}` 需重构
4. **查询参数过滤集合**：`/users?status=active&created_after=2025-01-01`
5. **动作型操作用动词子路径**：`/orders/{id}/cancel`、`/users/{id}/activate`

### HTTP 动词与状态码映射

| 操作 | HTTP 方法 | 成功状态码 | 幂等性 |
|------|-----------|-----------|--------|
| 创建资源 | `POST /resources` | `201 Created` + `Location` 头 | 否 |
| 全量替换 | `PUT /resources/{id}` | `200 OK` 或 `204 No Content` | 是 |
| 局部更新 | `PATCH /resources/{id}` | `200 OK` 或 `204 No Content` | 否* |
| 获取单个 | `GET /resources/{id}` | `200 OK` | 是 |
| 获取集合 | `GET /resources` | `200 OK` | 是 |
| 删除 | `DELETE /resources/{id}` | `204 No Content` | 是 |

> *PATCH 仅在操作本身幂等时幂等（如 `replace field X`），累加操作（如 `add 5 to field X`）不幂等。

---

## OpenAPI 3.1 必填字段清单

```yaml
openapi: "3.1.0"
info:
  title: My API
  version: "1.0.0"
  description: |
    一句话描述 API 职责。
    多行补充认证方式、适用范围、SDK 链接等。
  contact:
    name: API Support
    email: api-support@example.com
  license:
    name: Apache 2.0
    url: https://www.apache.org/licenses/LICENSE-2.0

servers:
  - url: https://api.example.com/v1
    description: Production
  - url: https://staging-api.example.com/v1
    description: Staging

paths:
  /resources:
    get:
      operationId: listResources          # 必须，唯一标识
      summary: 获取资源列表                # 必须，< 120 字符
      description: |                       # 支持 Markdown
        详细说明分页、过滤条件、排序规则。
      tags: [Resources]                    # 必须，决定文档分组
      parameters: []                       # 每个参数需 in/required/schema
      responses:
        "200":
          description: 成功                  # 响应必须有描述，禁止空串
          content:
            application/json:
              schema:                        # 必须有类型定义
                $ref: '#/components/schemas/ResourceList'
        "400":
          $ref: '#/components/responses/BadRequest'

components:
  schemas: {}
  responses:
    BadRequest:
      description: 请求参数错误
      content:
        application/problem+json:
          schema:
            $ref: '#/components/schemas/ProblemDetail'
```

**易遗漏必填项**：每个 `parameter` 的 `required` 标识、每个响应的 `description`、每个 `schema` 的 `type` 或 `$ref`、`servers.url`（否则 SDK 生成器报错）。

---

## 错误码规范

### 推荐方案：RFC 7807 Problem Details

```json
{
  "type": "https://api.example.com/errors/invalid-param",
  "title": "Invalid Parameter",
  "status": 400,
  "detail": "Field 'email' must be a valid email address.",
  "instance": "/v1/users"
}
```

### 业务错误码扩展字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `type` | URI | 错误类型定位符，可跳转至帮助文档 |
| `title` | string | 可读的错误摘要 |
| `status` | number | HTTP 状态码，与 HTTP 层一致 |
| `detail` | string | 针对本次请求的具体原因 |
| `instance` | string | 出错的请求路径或资源标识 |
| `trace_id` | string | 链路追踪 ID，便于排查 |

### 各大厂规范对比

| 方案 | 错误码位置 | 特点 |
|------|-----------|------|
| Google AIP | `code` + `message` + `details` | 明确区分 HTTP 状态码与业务状态码 |
| 阿里云 API | `Code` + `Message` | 风格简单，Code 为字符串枚举 |
| RFC 7807 | `type` + `title` + `detail` | IETF 标准，`type` 链接化可追溯 |
| gRPC Status | `code` (enum) + `message` | 适合内部服务间通信 |

**选型建议**：面向外部或 OpenAPI 文档化的 API 优先采用 RFC 7807；内部 gRPC 服务可沿用 gRPC Status。

---

## 分页策略对比

| 策略 | API 形式 | 优点 | 缺点 | 适用场景 |
|------|----------|------|------|----------|
| Offset | `?page=2&size=20` | 直观、可跳页 | 大数据量时 OFFSET 退化为全表扫描 | 管理后台、小数据集 |
| Cursor | `?cursor=eyJpZCI6MTAwfQ==` | 无跳页偏移问题、深翻页稳定 | 不能跳页、需有序唯一索引 | 无限滚动、Feed 流 |
| Keyset | `?after_id=100&limit=20` | 性能最优、语义简单 | 仅能"下一页"、游标构建复杂 | 排序明确的列表 |

**推荐**：默认 Cursor 分页（编码游标避免枚举攻击）；Offset 仅在管理后台中使用并明示 `max_page_size` 限制。

---

## API 版本管理

三种主流方案对比：

| 方案 | 示例 | 优点 | 缺点 |
|------|------|------|------|
| URL 路径版本 | `/v1/users` | 直观、缓存友好 | URL 资源不再"不变" |
| Header 版本 | `Accept: application/vnd.myapp.v2+json` | URL 纯净 | 调试不直观、需配置网关 |
| 内容协商 | `application/vnd.myapp+json;version=2` | RESTful 理念 | 头部构造复杂 |

**决策树**：

```
是否有外部开发者？
├── 是 → URL Path（最直观，降低联调成本）
└── 否
    └── 是否同时维护 ≥ 3 个活跃版本？
        ├── 是 → Header / Content Negotiation
        └── 否 → URL Path（简单统一）
```

### 版本生命周期约定

- **弃用通知**：至少 1 个主版本周期前通过 `Deprecation` + `Sunset` 响应头声明
- **兼容窗口**：`v1` 发布 `v2` 后，`v1` 保留不少于 6 个月
- **破坏性变更**：必须升级主版本号，子版本和修订版本保持向后兼容

---

## 限流算法

### 令牌桶（Token Bucket）

- **原理**：以固定速率向桶中添加令牌，请求消耗令牌，无令牌则限流
- **特点**：允许突发流量（桶满时可瞬间消耗所有令牌），平均速率可控
- **适用**：需要容忍合理突发的 API、网关层总限流
- **伪代码**：

```
capacity = 100        # 桶容量
refill_rate = 10/秒    # 补充速率
on_request:
    refill_tokens(elapsed_time * refill_rate)
    if tokens >= 1:
        tokens -= 1; allow()
    else:
        reject(429)
```

### 漏桶（Leaky Bucket）

- **原理**：请求以任意速率流入桶，以固定速率流出；桶满则丢弃
- **特点**：绝对平滑输出，无突发容忍
- **适用**：下游处理能力固定、需严格匀速投递的场景
- **响应头约定**：

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1700000000        # Unix 时间戳
Retry-After: 30                      # 429 时提示重试等待秒数
```

---

## API 安全策略

### 认证选型决策树

```
是否需要代表用户执行操作？
├── 是
│   └── 客户端是否有安全存储密钥的能力？
│       ├── 服务端应用 → OAuth 2.0 Client Credentials
│       ├── 单页应用 / 移动端 → OAuth 2.0 + PKCE
│       └── 用户代理 → Authorization Code + PKCE
└── 否
    └── 服务间通信？
        ├── 内网可信环境 → mTLS（双向证书）
        ├── 需细粒度权限 → JWT + Scope 声明
        └── 简单调用方鉴权 → API Key（需轮换机制）
```

### JWT 最佳实践

- **签名算法**：优先 `RS256`（非对称），避免 `HS256` 密钥在多个服务间分发
- **有效期**：access_token ≤ 15 分钟，refresh_token ≤ 7 天（需一次性使用）
- **载荷最小化**：避免在 payload 放过大 claims，控制在 1KB 以内
- **吊销**：维护黑名单（jti 列表）或缩短有效期 + refresh 轮换
- **存储**：SPA 中存 httpOnly Cookie，禁止 localStorage（防 XSS 窃取）

### API Key 轮换方案

1. 新 Key 生成后标记为 `active`，旧 Key 标记为 `grace_period`
2. 宽限期（建议 7 天）内旧 Key 仍可用但触发告警通知
3. 宽限期结束，旧 Key 标记为 `revoked`，调用返回 `401`
4. 维护元数据：`created_at`、`expires_at`、`last_used_at`、所属 Scope

---

## GraphQL vs REST 选型

| 维度 | REST | GraphQL |
|------|------|---------|
| 数据形状 | 服务端定义，可能 Over-fetch | 客户端精确查询 |
| 多资源聚合 | 多次请求或自定义端点 | 单次查询嵌套获取 |
| 缓存 | HTTP 缓存友好（GET + ETag） | 需自定义缓存层（DataLoader / Persisted Queries） |
| 文件上传 | 原生 `multipart/form-data` | 需额外方案（Separate Mutation / Upload scalar） |
| 学习成本 | 较低 | Schema SDL + Resolver 模式需学习 |
| 限流复杂度 | 按路由限流 | 按 Query Depth / Complexity 分析 |
| Schema 文档 | OpenAPI 自动生成 | 内置 Introspection（可关闭） |

**决策树**：

```
是否需要移动端精确控制返回字段？
├── 是 → GraphQL
└── 否
    └── 是否需要强 HTTP 缓存（CDN）？
        ├── 是 → REST
        └── 否
            └── 关联数据是否复杂（> 3 层嵌套）？
                ├── 是 → GraphQL
                └── 否 → REST（默认简单）
```

---

## 使用指南

何时引用本 Skill：

- 设计新 API 时，按资源命名 → HTTP 动词 → 状态码 → 错误码 → 分页 → 版本 → 安全逐项确认
- Review 他人 API 设计时，对照 Richardson 模型判断是否过度/不足设计
- 治理历史 API 时，用版本管理 + 安全策略决策树做升级决策
- 选型 GraphQL vs REST 时，基于数据复杂度、缓存需求、团队能力做判断
