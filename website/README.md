# 云顶数字工作台 · 官方网站

Ydsz Worker 产品官网，使用 React + TypeScript + Tailwind CSS 构建。

## 主题色

品牌主色为 **元宝绿**（Yuanbao Green），定义在 `tailwind.config.js` 中：
- Primary: `#22c55E` (yuanbao-500)
- Darkest: `#052E16` (yuanbao-950)
- Lightest: `#F0FDF4` (yuanbao-50)

## 启动

```bash
npm install
npm run dev    # => http://localhost:3000
npm run build  # => dist/
```

## 本地开发命令

| 命令 | 说明 |
|------|------|
| `npm install` | 安装依赖 |
| `npm run dev` | 启动开发服务器（`http://localhost:3000`） |
| `npm run build` | 类型检查 + 生产构建（输出到 `dist/`） |
| `npm run preview` | 本地预览生产构建结果 |
| `npx tsc --noEmit` | 仅类型检查，不输出文件 |

## 部署方式

网站通过 **GitHub Actions** 自动部署到 **GitHub Pages**，配置文件见 `.github/workflows/deploy.yml`。

### 部署流程

- **push 到 `main`**：自动执行构建并部署到 GitHub Pages
- **Pull Request 到 `main`**：仅执行构建（类型检查 + 打包），不部署
- 手动触发：支持在 Actions 页面通过 `workflow_dispatch` 手动运行

### 首次启用

1. 进入仓库 **Settings → Pages**
2. 在 **Build and deployment → Source** 中选择 **GitHub Actions**
3. 之后的推送会自动触发部署

### 构建产物

- 输出目录：`website/dist/`
- 部署使用 `force_orphan: true`，每次部署都会清空 `gh-pages` 历史，保持单一版本

## 环境变量

当前网站为纯静态站点，**无需配置任何环境变量**即可构建和部署。

如后续需要注入运行时配置（如 API 地址），可在 `vite.config.ts` 中通过 `define` 或 `.env` 文件声明，并在 GitHub 仓库 **Settings → Secrets and variables → Actions** 中配置对应的 Secret。

## 页面结构

```
/                    首页（单页应用）
├── #overview        Hero + 概览
├── #features        核心特性 6 卡片
├── #quickstart      安装步骤（4 种方式 Tab 切换）
├── #why             为什么选择
└── #faq             常见问题
```

## 页面区段

- `Navbar`: 固定导航 + 滚动效果
- `Hero`: 主视觉 + 标语 + CTA
- `LogoCloud`: IM 通道图标带
- `ExpertRoles`: 专家角色卡片式切换
- `QuickStart`: 安装代码高亮 + Tab
- `Features`: 核心特性卡片网格
- `WhyChoose`: 为什么选择（带编号卡片 + Stats）
- `FAQ`: 手风琴折叠面板
- `CTA`: 行动召唤横幅
- `Footer`: 链接矩阵 + 社交

## 技术栈

- React 18 + TypeScript
- Vite 6
- Tailwind CSS 3
- 纯静态，无后端依赖
