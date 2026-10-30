# 专家包结构模板（ydsz 自有规范）

日期：2026-10-29 ｜ 范围：P2 专家体系对齐
（连接器对照见 [connectors-workbuddy-parity.md](connectors-workbuddy-parity.md)，
技能移植见 [skill-porting-tool-map.md](skill-porting-tool-map.md)）

## 1. 定位

参考业界专家包的结构方法论（`<role>` 能力定义 / `<workflow>` 分阶段流程 /
anti-patterns 反模式 / references 参考库），沉淀 ydsz Worker 自有专家包模板。
**结构方法论可借鉴，文本内容必须原创**——不得整包复制任何外部产品的专家正文。

包位置：`src/ydsz/infra/agents/experts/library/<id>/`（bundled 静态数据，
`catalog.py` 自动扫描发现，无需注册代码）。

## 2. 包结构

```
library/<id>/
├── manifest.json          # 展示与调度元数据（必须）
├── SOUL.md                # 专家人格与工作法（必须，prompt_files 指向它）
└── skills/<skill>/SKILL.md  # 可选：专家专属技能，同步进工作区
```

## 3. 方法论 → ydsz 格式映射

| 方法论模块 | 业界专家包常见形式 | ydsz 落点 | 要求 |
|-----------|-------------------|----------|------|
| 角色定义 | `<role>` 段 | `SOUL.md` 开篇 + 「你的核心能力」 | 一句话定位 + 4~6 条编号能力 |
| 工作流 | `<workflow>` Phase 1..N | `SOUL.md` 「工作流程」Phase 1..N | 每 Phase 含编号步骤；Phase 1 必须是理解/对齐，最后 Phase 必须产出交付物 |
| 反模式 | anti-patterns 段 | `SOUL.md` 「反模式（出现即为失误）」 | 5~7 条，写成可判定的失误行为，不写空泛告诫 |
| 参考库 | `references/*.md` | `skills/<skill>/SKILL.md` 或包内 md | 数据性参考放技能内；确需独立参考文件时放包根并在 SOUL.md 尾部列出 |
| 行为约束 | （各家不同） | `SOUL.md` 「行为准则」 | 5~7 条，含"不做什么"（如不编造数据） |
| 触发/快捷入口 | quick prompts | `manifest.json` `quick_prompts` | 2~4 个，每个含可直接发送的 prompt 模板 |

## 4. manifest.json 骨架

字段与 `library/code-reviewer/manifest.json` 同构（唯一权威样例）：

```json
{
  "id": "<kebab-case，与目录名一致>",
  "label": { "zh": "中文名", "en": "English Name" },
  "description": { "zh": "…（40~80 字，写能力+适用场景）", "en": "…" },
  "welcome_message": { "zh": "…（一句话引导用户提供输入）", "en": "…" },
  "icon_name": "<lucide 风格图标名>",
  "color": "#RRGGBB",
  "prompt_files": ["SOUL.md"],
  "quick_prompts": [
    {
      "title": { "zh": "…", "en": "…" },
      "description": { "zh": "…", "en": "…" },
      "prompt": { "zh": "含 [占位符] 的完整模板", "en": "…" },
      "color": "#RRGGBB",
      "icon_name": "..."
    }
  ],
  "task_examples": {
    "zh": ["含「HH:MM」定时样例 2~3 条"],
    "en": ["…"]
  }
}
```

约束：`id` 唯一且等于目录名；中英双语字段全部必填；`quick_prompts` 的
`prompt` 必须是用户可直接发送的完整模板（含 `[占位符]`），不是功能描述。

## 5. SOUL.md 骨架

```markdown
# <中文名> · SOUL

你是 **<中文名>（<English Name>）**，<一句话定位>。<职责句>。

## 你的核心能力
1. **<能力名>**：<量化描述>。   （4~6 条）

## 行为准则
- **<原则名>**：<可判定的行为约束>。   （5~7 条，至少 2 条"不做什么"）

## 工作流程
### Phase 1 — <对齐类>
1. …
### Phase 2 — <分析类>
### Phase 3 — <建模/方案类>
### Phase 4 — <交付类>
（每 Phase 2~4 个编号步骤；Phase 间有明确的输入输出衔接）

## 反模式（出现即为失误）
- **<反模式名>**：<可判定的失误行为>。   （5~7 条）

## 可用技能
- `skills/<skill>/SKILL.md` — <用途>（<何时先读它>）。
```

## 6. 检查清单（交付前自查）

1. `manifest.json` 通过 `ExpertCatalog.list_summaries()` 扫描可见；
2. `id` == 目录名；`prompt_files` 指向的文件存在；
3. SOUL.md 四大段齐备（核心能力 / 行为准则 / 工作流程 / 反模式）；
4. 工作流程 Phase 1 是"理解/对齐"，末 Phase 是"交付"；
5. 反模式条条可判定（读完能回答"这条犯了没"）；
6. quick_prompts 模板含占位符且可直接发送；
7. 全文原创（含 skills/ 与参考文件），无外部产品正文复制。

## 7. 示例

本规范的完整示例：`library/supply-chain-expert/`（供应链物流专家）——
`manifest.json` + `SOUL.md`（含 Phase 化工作流与反模式段）+
`skills/transport-cost-analysis/SKILL.md`。
