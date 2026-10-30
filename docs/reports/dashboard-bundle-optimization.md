# Dashboard Frontend Bundle 优化建议

> 分析日期：2026-10-30  
> 基准：`src/ydsz/dashboard/assets/`（Vite 构建产物）

## 1. 现状

当前 dashboard 产物位于 `src/ydsz/dashboard/assets/`，由 `make build-frontend` 从 `dashboard/` 源码编译生成。

观察到的 chunk 分布特征：
- 多个大型独立 chunk：`docx-preview`（Word 预览）、`index.*.js`（Mermaid / Prism / arc / cytoscape / dagre 图表库）
- 每个图表类型单独拆出 chunk（`flowDiagram-*`、`classDiagram-*`、`erDiagram-*` 等约 10 个）
- `chunk-*.js` / `chunk-*.css` 多个通用代码分割产物

## 2. 问题

首屏加载包含了所有 dashboard 路由的代码。实际上管理员功能（cron、connectors、knowledge 配置）与日常聊天功能的使用频率差异很大；大型文档/图表库仅在少数页面使用。

## 3. 建议

### P0 — 路由级别 lazy-load

`dashboard/src/routes/` 中使用 `React.lazy()` + `Suspense` 包裹以下页面：
- Agent 编辑/创建表单（`EditAgentDrawer` — 体积最大的组件之一）
- Knowledge base 文件管理器
- Connectors / OCR / 高级设置页面
- Bridges / ACP / 终端模拟器页面

收益：首屏 JS 体积减少 30-50%（Vite + esbuild tree-shake 后）。

### P1 — 大型库动态 import

以下库仅在特定用户操作时用到，改为按需 import：
- `docx-preview` — 仅在预览 Word 文档时加载
- `pptx-preview`（如后续接入）— 仅在预览 PPT 时加载
- Mermaid — 仅当消息含 ```mermaid 代码块时加载
- Prism / highlight.js — 改 `@shikijs/react` 或缩小 languages 列表

### P1 — Vite manualChunks 优化

在 `dashboard/vite.config.ts` 中显式配置 `manualChunks` 以稳定 chunk hash，
避免无关改动触发 chunk 全体更新：

```ts
manualChunks: {
  'vendor-react': ['react', 'react-dom', 'react-router-dom'],
  'vendor-ui': ['@radix-ui/*'],
  'vendor-codemirror': ['@uiw/react-codemirror', '@codemirror/*'],
},
```

### P2 — Nginx / 反向代理开启 Brotli + long-cache

对 `assets/` 下的带 hash chunk 设置 `Cache-Control: max-age=31536000, immutable`，
对 `index.html` 设置 `no-cache`。Brotli 对文本 chunk 压缩率比 gzip 高 15-20%。

## 4. 验证指标

- Lighthouse Performance score（移动端模拟 4G）目标：≥ 85
- 首屏 JS transfer < 500 KB（gzip 后）
- FCP（First Contentful Paint）< 1.5 s

对比基线（当前产物总大小）：可通过 `npx vite build --reporter=verbose` 获得准确 bundle 体积分布。

## 5. 实施顺序

1. `vite.config.ts` 的 `manualChunks`（低风险）
2. `React.lazy()` 路由拆分（中风险，需测试各页面 mount/unmount）
3. 大型库动态 import（低风险，但需 mock 接口兼容异步加载）
