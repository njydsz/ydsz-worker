---
name: tech-writing
description: "适用于开发者文档的 Diátaxis 写作框架——从教程到参考文档的四象限方法，Google Style Guide 核心规则，API/ADR/Release Notes 三类文档的结构化模板（含可读性评分清单）。"
metadata:
  ydsz:
    emoji: "✍️"
    label: {zh: "技术写作指南", en: "Technical Writing Guide"}
    summary: {zh: "开发者文档的 Diátaxis 框架与结构化模板", en: "Diataxis framework and structured templates for developer documentation"}
---

# 技术写作指南

技术写作的核心目标是**让读者高效获取所需知识**。本指南基于 Diátaxis 四象限框架与 Google Developer Style Guide，提供面向开发者文档的系统化方法论与实用模板。

## Diátaxis 四象限

Diátaxis 将文档分为四个象限，各有不同的目标读者与写作规则：

### 教程（Tutorial）
- **目标**：带领新手从零完成具体任务，建立信心
- **规则**：
  - 以"做"为核心，不是"了解"
  - 步骤必须可复现、可验证
  - 避免解释"为什么"，专注"怎么做"
  - 完成后读者应获得可感知的成果
- **结构**：目标 → 准备工作 → 步骤 1...N → 总结

### How-to Guide（操作指南）
- **目标**：解决特定问题，面向已入门的用户
- **规则**：
  - 以问题命名（"如何配置 SSL"而非"SSL 配置"）
  - 假设读者已具备基础概念
  - 可跳过教程中的基础步骤
  - 提供多种解法并对比优劣
- **标题示例**：《如何在 Docker 中部署 FastAPI 应用》

### Reference（参考文档）
- **目标**：精确描述技术细节，供快速查阅
- **规则**：
  - 结构化、无歧义、可搜索
  - 不解释背景，只陈述事实
  - 保持格式一致性（参数表/返回值/示例）
  - 准确优先于文采

### Explanation（概念解释）
- **目标**：阐明原理、背景与设计思路
- **规则**：
  - 回答"为什么这样做"
  - 提供上下文与历史演变
  - 对比替代方案的优劣
  - 使用类比帮助理解抽象概念

### 四象限判断矩阵

| 读者状态 | 需要学习 | 需要完成工作 |
|---------|---------|-------------|
| **学习为主** | Tutorial | How-to |
| **工作为主** | Explanation | Reference |

## Google Developer Style Guide 核心规则

### 1. 主动语态
- **推荐**：`The API returns a JSON object.`
- **避免**：`A JSON object is returned by the API.`

### 2. 一句话一行
每行只包含一个句子，便于版本控制与翻译。

### 3. 现在时优先
- **推荐**：`This method creates a new instance.`
- **避免**：`This method will create a new instance.`

### 4. 第二人称
- **推荐**：`You can configure the timeout in the settings file.`
- **避免**：`Users can configure...` / `One can configure...`

### 5. 简洁为要
- 一句话不超过 25 词（中文不超过 40 字）
- 删除冗余修饰（"in order to" → "to"）
- 一段只表达一个主题

### 6. 清晰的标题层级
```
# 页面标题（H1，每页唯一）
## 主要章节（H2）
### 细分主题（H3）
#### 慎用（H4）
```

## API 文档参考模板

```markdown
# API 名称

一句话描述 API 的核心功能。

## 请求

### HTTP 方法
`POST /api/v1/resources`

### 认证
Bearer Token，需在请求头携带：`Authorization: Bearer <token>`

### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 资源名称，2-50 字符 |
| type | enum | 否 | 类型：`public`/`private`，默认 `public` |
| metadata | object | 否 | 自定义键值对，最大 16KB |

### 请求示例

```bash
curl -X POST https://api.example.com/v1/resources \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "example", "type": "public"}'
```

### 响应

### HTTP 状态码

| 状态码 | 含义 |
|--------|------|
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 认证失败 |
| 409 | 资源名已存在 |

### 响应示例

```json
{
  "id": "res_abc123",
  "name": "example",
  "type": "public",
  "created_at": "2024-01-15T08:30:00Z"
}
```
```

## ADR 架构决策记录模板

```markdown
# ADR-XXX: {决策标题}

## 状态
{Proposed | Accepted | Deprecated | Superseded by ADR-YYY}

## 背景
描述触发此决策的上下文：
- 面临的技术问题是什么？
- 有哪些约束条件（时间/人力/技术栈）？
- 不做决策会怎样？

## 决策
清晰陈述最终选择方案及其理由。考虑了哪些替代方案？为何否弃？

## 后果
此决策带来的正面与负面后果：
- 正面: ...
- 负面: ...
- 风险: ...（含缓解措施）

## 参考资料
- 相关文档链接
- 讨论 Issue/PR 链接
```

## Release Notes 模板

```markdown
# v{版本号} - {发布日期}

## 重大变更（Breaking Changes）
> 升级前必读，包含兼容性破坏与迁移指南。

- **[BREAKING]** {变更描述}。迁移方法：{具体步骤}

## 新增功能（New Features）
- {功能 1 描述}
- {功能 2 描述}

## 问题修复（Bug Fixes）
- 修复了 {问题描述}（#{issue 编号}）

## 弃用通知（Deprecated）
- **[DEPRECATED]** {API/功能} 将在 v{x.y} 移除，请迁移至 {替代方案}

## 迁移指南
针对 Breaking Changes 的详细升级步骤：
1. 第一步：...
2. 第二步：...
```

## 可读性自检清单（12 项）

| # | 检查项 | 标准 |
|---|--------|------|
| 1 | **句子长度** | 平均不超过 25 词（英文）/ 40 字（中文） |
| 2 | **段落长度** | 单段不超过 5 行 |
| 3 | **被动语态** | 被动句占比 < 20% |
| 4 | **专业术语** | 首次出现时给出定义或链接 |
| 5 | **缩写** | 首次出现写全称（如 HyperText Transfer Protocol (HTTP)） |
| 6 | **代码示例** | 每个关键概念至少配一个示例 |
| 7 | **可运行示例** | 代码可直接复制运行，无隐含依赖 |
| 8 | **图片/图表** | 流程图替代纯文字描述复杂流程 |
| 9 | **导航** | 长文档包含目录与返回顶部链接 |
| 10 | **一致性** | 全文术语、格式、风格统一 |
| 11 | **Flesch 评分** | 英文文档 Flesch Reading Ease ≥ 50（标准水平） |
| 12 | **可搜索性** | 标题包含用户可能搜索的关键词 |

## 文档评审 Checklist

### 内容完整性
- [ ] 目标读者是否明确？
- [ ] 所有前置说明是否齐全？
- [ ] 示例是否可复现？
- [ ] 边界条件与错误处理是否覆盖？

### 结构合理性
- [ ] 标题层级是否不超过 3 级？
- [ ] 信息是否按使用频率排列（最常用内容在前）？
- [ ] 长文档是否拆分（单篇 < 2000 字）？

### 表达清晰度
- [ ] 是否有未解释的术语？
- [ ] 是否存在歧义句？
- [ ] 主动语态占比 > 80%？

### 维护性
- [ ] 版本号与适用范围是否标注？
- [ ] 是否有"最后更新日期"？
- [ ] 删除或过时内容是否移除？

## 使用指南

1. **先选象限**：明确文档属于 Tutorial / How-to / Reference / Explanation 中的哪一类
2. **套用模板**：使用对应模板起草初稿
3. **自检迭代**：用 12 项可读性清单逐项改进
4. **评审收口**：用评审 Checklist 最终把关
5. **持续更新**：配合 Release Notes 同步更新文档
