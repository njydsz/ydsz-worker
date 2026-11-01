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
