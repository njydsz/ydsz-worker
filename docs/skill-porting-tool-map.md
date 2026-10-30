# 技能移植工具映射表（WorkBuddy → ydsz Worker）

日期：2026-10-29 ｜ 范围：P1 技能移植适配层
（连接器对照见 [connectors-workbuddy-parity.md](connectors-workbuddy-parity.md)）

## 1. 定位

把 WorkBuddy 生态的 SKILL.md 技能包移植为 ydsz Worker 插件
（`plugin.yaml` + `skills/<name>/SKILL.md`）时，正文中的**工具调用名**必须按下表
改写。技能格式本身同构（YAML frontmatter + Markdown 正文），差异集中在工具面。

**版权红线**：本表只解决"技术移植"。技能正文（含 references 参考库）不得整包
复制 WorkBuddy 内置内容——结构可借鉴，文本须重写为自有内容。

## 2. 格式差异速览

| 维度 | WorkBuddy | ydsz Worker | 移植动作 |
|------|-----------|-------------|----------|
| 打包 | 技能目录（SKILL.md + 附属脚本） | 插件：`plugin.yaml` + `main.py` + `skills/<name>/SKILL.md` | 补插件壳（`kind: skill`，`ctx.skills("skills")`） |
| frontmatter | `name`/`description`/`display_name_zh`/`display_name_en`/`version` | `name`/`description`（`metadata.ydsz.emoji` 可选） | `display_name_*` 无消费方可保留可删 |
| 技能加载 | 显式 `Skill` 工具按需加载 | Agent 启动时同步到工作区 `skills/`，skill_filter 管控 | 删除 SKILL.md 中"调用 Skill 工具加载"步骤 |
| 子代理 | `Agent(subagent_type=…)` 指定运行时子代理 | `ask_agent` / `task`（团队调度） | 编排段重写；无对应子代理类型时改为单代理流程 |
| MCP 工具名 | `mcp__<server>__<tool>` | `<server>_<tool>`（`tool_name_prefix=True`） | 全文替换命名模式 |

## 3. 工具名映射表

### 3.1 文件与终端

| WorkBuddy | ydsz | 说明 |
|-----------|------|------|
| `Read` | `read_file` | |
| `Write` | `write_file` | |
| `Edit` | `edit_file` | |
| （`append`） | `append_file` | |
| `Bash` / `PowerShell` | `execute` | |
| `Glob` | `glob` | |
| `Grep` | `grep` | |
| `ls`（shell） | `ls` | ydsz 是独立工具 |

### 3.2 Web 与媒体

| WorkBuddy | ydsz | 说明 |
|-----------|------|------|
| `WebSearch` | `tavily_search` / `brave_search` / `google_search` / `kimi_search` / `searchfree_search` | ydsz 按 provider 拆分，按部署配置选用 |
| `WebFetch` | `web_fetch` | |
| `ImageGen` | `generate_image` | |
| `VideoGen` | `generate_video` | |
| `AudioTranscribe` | —（无原生） | 走 MCP/自定义插件补齐 |
| `show_widget` | —（无内联 widget） | 降级为文本/表格输出 |
| `present_files` | `send_file_to_user` | 仅文件交付，无预览卡片 |

### 3.3 编排与记忆

| WorkBuddy | ydsz | 说明 |
|-----------|------|------|
| `ToolSearch` + `DeferExecuteTool` | `tool_search` | 只有检索；延迟执行语义无对应，直调即可 |
| `TaskCreate`/`TaskGet`/`TaskUpdate`/`TaskList` | `write_todos`（清单） + `task`（派发） | 语义不同：ydsz 的 `task` 是子代理调度，不是看板 |
| `Agent`（子代理） | `ask_agent` / `agent_list` | 团队宿主调度用 |
| `SendMessage` | `ask_agent` | 团队内消息 |
| `Skill` | —（机制不同） | ydsz 自动同步 SKILL.md，无需显式加载 |
| `AskUserQuestion` | `ask_user_question` | |
| `conversation_search` | `memory_search` / `memory_get` | 近似 |
| `knowledge_search` | 连接器工具（如 `tencent-lexiang_*`、`yuque-mcp_*`、`notion_*`） | 按已接入连接器选择 |
| `LibraryUpload` | —（无直接对应） | 走网盘/知识库连接器 |
| `automation_update` | `infra/cron` 子系统 | 技能内不暴露为工具，改由产品侧配置定时任务 |
| `current_time` | `current_time` | 同名 |
| `browser_use` / 截屏 | `browser_use` / `desktop_screenshot` | 同名 |

### 3.4 MCP 与平台内置

| WorkBuddy | ydsz | 说明 |
|-----------|------|------|
| `mcp__<server>__<tool>` | `<server>_<tool>` | 例：`mcp__tencent-docs__manage.search_file` → `tencent-docs_manage.search_file` |
| `mcp__sheetagent__*`、`mcp__weixinpay__*`、`mcp__genie-baas__*` 等平台内置 | —（无对应） | 平台私有能力，移植时删除或改为自研工具/连接器 |
| 连接器类 `list_installed_plugins` 等宿主工具 | 连接器由 Dashboard 配置，不进技能工具面 | 技能只消费 MCP 工具本身 |

## 4. SKILL.md 改写清单（移植 checklist）

1. frontmatter：保留 `name`/`description`；补 `metadata.ydsz.emoji`（可选）；
2. 正文工具名按 §3 全量替换（正则：`mcp__([a-z0-9-]+)__` → `\1_`）；
3. 删除"通过 Skill 工具加载下游技能"类步骤 → 改为直接 `read_file` 相对路径
   `skills/<下游>/SKILL.md`（若同插件内多技能）；
4. `Agent(subagent_type=…)` / `DeferExecuteTool` 编排段重写为线性流程或
   `ask_agent` 调度；
5. 生成类能力（图片/视频）改 `generate_image`/`generate_video`；
6. 交付动作（present_files/show_widget）降级为 `send_file_to_user` + 文本；
7. **正文整体重写为自有内容**（版权），结构与方法论可借鉴。

## 5. 试转验证

本次按上述规则试转 3 个**原创内容**纯提示词类技能（见 `plugins/`）：

| 插件 | 技能 | 验证点 |
|------|------|--------|
| `meeting-minutes-skill` | `meeting-minutes` | 多格式纪要结构化，纯提示词 |
| `code-review-skill` | `code-review` | 评审清单工作流，纯提示词 |
| `weekly-report-skill` | `weekly-report` | 周报生成模板，纯提示词 |

验证命令（与 `plugins/README_CN.md` 快速校验一致）：

```bash
uv run python - <<'PY'
from pathlib import Path
from ydsz_harness.plugins import PluginRegistry, load_plugin_dir
for name in ("meeting-minutes-skill", "code-review-skill", "weekly-report-skill"):
    PluginRegistry.reset()
    p = load_plugin_dir(Path("plugins") / name, install_deps=False)
    print(p.manifest.id, p.manifest.kind, f"skills={p.skills_dir}")
PY
```

预期：三个插件 `kind=skill`，`skills=` 非空。本地安装走
`ydsz plugin install ./plugins/<name> --force`。

实测结果（2026-10-29）：

```
meeting-minutes-skill skill skills_dir=…\plugins\meeting-minutes-skill\skills
code-review-skill    skill skills_dir=…\plugins\code-review-skill\skills
weekly-report-skill  skill skills_dir=…\plugins\weekly-report-skill\skills
PLUGIN LOAD OK

ydsz-worker plugin install × 3 → Installed plugin <id> v0.1.0
ydsz-worker plugin list → 3 × (skill) [not loaded]   # 服务未运行时的预期状态
```

`[not loaded]` 为服务未运行时的常态（安装提示要求 POST /api/plugins/reload 或
重启服务后转为 loaded）；技能落工作区发生在 Agent 启动同步环节。
