---
name: api-standards
description: API 设计规范参考手册——Richardson 成熟度模型 Level 0-3 对比表、OpenAPI 3.1 字段必填清单、RESTful 命名规则、错误码规范、版本控制策略决策树。
metadata:
  Ydsz:
    emoji: "\U0001F4D6"
    label:
      zh: "API 设计规范"
      en: "API Design Standards"
    summary:
      zh: "Richardson 成熟度模型、OpenAPI 3.1 必填字段、命名规则、错误码与版本策略。"
      en: "Richardson maturity model, OpenAPI 3.1 required fields, naming rules, error codes, versioning."
---

# API 设计规范参考手册

## 一、Richardson 成熟度模型（Level 0-3）

| Level | 名称 | 特征 | 判定标准 |
| --- | --- | --- | --- |
| 0 | The Swamp of POX | 单一 POST 端点，所有操作走 body | 只有一个 URL，靠 body 区分操作 |
| 1 | Resources | 资源拆分为独立 URL | 每个实体有独立 endpoint，但仍全用 POST |
| 2 | HTTP Verbs | 正确使用 GET/POST/PUT/PATCH/DELETE | 动词语义精确，状态码匹配 |
| 3 | HATEOAS | 响应含超媒体链接，客户端可自发现 | 返回 `_links` 或 `Link` header，下一步操作自描述 |

> 团队目标是 Level 2 稳定 + Level 3 在建。新接口必须达到 Level 2。

## 二、OpenAPI 3.1 字段必填清单

| 层级 | 必填字段 | 说明 |
| --- | --- | --- |
| 根 | `openapi`, `info`, `paths` | 版本固定 `3.1.0` |
| Info | `title`, `version`, `description` | description 写清楚服务边界 |
| Path | `summary`, `description`, `operationId` | operationId 全局唯一 |
| Operation | `responses`（含至少一个 `2xx`）、`parameters`（如有） | 每个 response 含 `description` |
| Schema | `type`、`example`、`required` 列表 | 所有字段带 `example` |
| 安全 | `securitySchemes`（components 级） | OAuth2 / apiKey / http 三选一 |

## 三、RESTful 命名规则

- **复数名词**：`/users` / `/orders`，禁用动词（不写 `/getUser`）。
- **小写 + 连字符**：`/order-items`，不写 `/orderItems` 或 `/order_items`。
- **嵌套深度 ≤ 3**：`/users/{id}/orders/{id}` 可接受；超过考虑独立资源。
- **查询参数限定动作**：分页 `?page=&size=`，排序 `?sort=field,desc`，过滤 `?status=active`。
- **禁用动词在路径中**：用 HTTP 方法表达动作，不写 `/users/create`。

## 四、错误码规范

### Google 风格（推荐）

```json
{
  "error": {
    "code": 409,
    "message": "Resource already exists",
    "status": "ALREADY_EXISTS",
    "details": [
      {
        "@type": "type.googleapis.com/google.rpc.ErrorInfo",
        "reason": "DUPLICATE_EMAIL",
        "domain": "api.example.com",
        "metadata": { "field": "email" }
      }
    ]
  }
}
```

### Aliyun 风格

```json
{
  "RequestId": "ABCD-1234",
  "Code": "InvalidParameter",
  "Message": "The parameter 'email' is invalid.",
  "HostId": "api.example.com"
}
```

### 通用字段

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `request_id` | 是 | 全局唯一，用于链路追踪 |
| `code` | 是 | 业务错误码（字符串） |
| `message` | 是 | 人读错误信息，可 i18n |
| `details` | 否 | 字段级错误明细 |
| `doc_url` | 否 | 文档链接 |

## 五、版本控制策略决策树

```
是否需要同时维护多版本？
├─ 否 → URI 无版本（`/api/users`），靠 Header 协商
├─ 是，破坏性变更 → URI 版本（`/v1/users` → `/v2/users`）
└─ 是，增量变更 → Header 版本（`Accept: application/vnd.api.v2+json`）
```

| 策略 | 优点 | 缺点 | 适用 |
| --- | --- | --- | --- |
| URI `/v1/` | 直观、缓存友好 | URL 会变 | 破坏性变更 |
| Header `Accept` | URL 不变、细粒度 | 调试不便 | 增量变更 |
| Query `?version=2` | 最临时 | 不推荐生产 | 快速试验 |

## 六、速率限制 Header

响应中必须携带：
- `X-RateLimit-Limit`：窗口内最大请求数
- `X-RateLimit-Remaining`：当前窗口剩余
- `X-RateLimit-Reset`：窗口重置时间（UTC epoch 秒）

限量超限时返回 `429 Too Many Requests` + `Retry-After`。
