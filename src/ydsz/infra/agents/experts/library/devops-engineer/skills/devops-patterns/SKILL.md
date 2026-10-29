# DevOps 模式参考手册

## 1. DevOps 成熟度模型（5 层）

| 层级 | 名称 | 特征 | 典型工具 | 关键指标 |
|------|------|------|----------|----------|
| L0 | 手动运维 | SSH 手动改配置、无版本控制 | 无 | 部署耗时天级 |
| L1 | 脚本化 | Bash/Python 脚本、部分自动化 | Ansible, Shell | 部署耗时小时级 |
| L2 | 流水线化 | CI/CD 集成、自动化测试 | Jenkins, GitHub Actions | 部署耗时分钟级 |
| L3 | Git-ops | 声明式基础设施、双端单一来源 | ArgoCD, Terraform | 按需自动部署 |
| L4 | 自愈系统 | 自动扩缩容、自动故障恢复 | K8s HPA, Chaos Mesh | MTTR < 5 min |

### 升级路径建议

```
L0 → L1: 先配置管理（Ansible），再脚本化部署
L1 → L2: 先接入 CI（Lint + Test），再接入 CD（自动化部署）
L2 → L3: 先迁 IaC（Terraform），再迁 Git-ops（ArgoCD）
L3 → L4: 先接入监控告警，再接入自动修复（Operator / KEDA）
```

## 2. Git-ops 三种模式对比

### Push 模式（传统 CI/CD）
```
开发者 → push 代码 → CI 构建 → CI 推送部署到集群
```
- 代表：Jenkins, GitHub Actions（deploy）
- 优点：简单直接、回滚即 revert commit
- 缺点：CI 需集群凭证、安全性低

### Pull 模式（声明式 Git-ops）
```
开发者 → push 代码 → Git 仓库（单一来源）→ Operator 拉取并同步到集群
```
- 代表：ArgoCD, Flux
- 优点：集群凭证不出集群、自动漂移检测、原生回滚
- 缺点：排查问题需理解拉取循环

### 混合模式
```
开发者 → push 构建产物 → 镜像仓库 → ArgoCD 监听镜像更新 → 自动同步
```
- 优点：关注点分离（CI 管构建，CD 管部署）
- 缺点：需镜像标签策略约束、调试链路更长

## 3. GitHub Actions 模板片段

### 多矩阵构建 + 语义版本号

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    strategy:
      matrix:
        python-version: ['3.11', '3.12', '3.13']
        os: [ubuntu-latest, windows-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: ${{ matrix.python-version }}
      - run: pip install -e ".[dev]"
      - run: pytest tests/ -x -q

  build-and-push:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/${{ github.repository }}
          tags: |
            type=semver,pattern={{version}}
            type=sha,prefix=sha-
      - uses: docker/build-push-action@v5
        with:
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### 语义版本号推算（基于 Conventional Commits）

```
feat:         → minor +1 (1.2.3 → 1.3.0)
fix:          → patch +1 (1.2.3 → 1.2.4)
BREAKING:     → major +1 (1.2.3 → 2.0.0)
chore/docs:   → 不触发版本变化
```

### 制品签名（Cosign）

```yaml
      - uses: sigstore/cosign-installer@v3
      - name: Sign container image
        run: |
          cosign sign --yes \
            ghcr.io/${{ github.repository }}@${{ steps.build.outputs.digest }}
```

## 4. SLO 设计模板

### 三种 SLO 类型

| 类型 | SLI 定义 | 公式 | 适用场景 |
|------|----------|------|----------|
| 可用性 SLO | 成功请求比率 | 非 5xx 请求数 / 总请求数 ≥ 99.9% | API 网关、前端 |
| 延迟 SLO | P99 响应时间 | P99 latency ≤ 200ms 的比例 ≥ 95% | 用户端 API |
| 新鲜度 SLO | 数据更新延迟 | 数据从产出到可查的 delay ≤ 5min ≥ 99% | 报表、搜索索引 |

### Error Budget 策略

```
SLO 99.9% → Error Budget = 0.1% = 43.2 min/月

消耗速率:
  - 1x burn rate: 预算 30 天内耗尽（正常）
  - 2x burn rate: 预算 15 天内耗尽 → 需要考虑冻结发布
  - 6x burn rate: 预算 5 天内耗尽 → 立即冻结发布、全力灭火

告警规则:
  - window 1h, burn rate > 14.4x → page on-call（紧急）
  - window 6h, burn rate > 6x → page on-call（高优先级）
  - window 3d, burn rate > 1x → 团队 Slack 提醒（需关注）
```

### SLO 与监控取舍

| 取舍维度 | 精确但贵 | 省钱但粗 |
|----------|----------|----------|
| 数据源 | Backend 应用层 metrics | Load Balancer access logs |
| 采样 | 全量采集 | 1%-10% 采样 |
| 存储 | 原始数据 90 天 | 聚合数据 13 个月 |
| 计算 | 实时流计算 | 离线批计算 |

## 5. K8s 多环境 Helm 配置拆分模式

### 目录结构推荐

```
deploy/
├── charts/
│   └── myapp/
│       ├── Chart.yaml
│       ├── templates/
│       │   ├── deployment.yaml
│       │   ├── service.yaml
│       │   ├── hpa.yaml
│       │   └── ingress.yaml
│       └── values.yaml          # 默认值 + 公共配置
├── environments/
│   ├── dev/
│   │   └── values.yaml          # 环境特定覆盖
│   ├── staging/
│   │   └── values.yaml
│   ├── canary/
│   │   └── values.yaml
│   └── production/
│       └── values.yaml
└── secrets/                     # Sealed Secrets 加密
    ├── dev/
    ├── staging/
    └── production/
```

### 环境差异管理原则

1. **values.yaml 继承**：公共配置在 `charts/myapp/values.yaml`，差异在各环境的 values 覆盖
2. **镜像标签**：`values.yaml` 不写死 tag，由 CI 注入（`--set image.tag=${SHA}`）
3. **副本数差异**：dev/staging=1, production=3+, canary=1-2（按流量比例）
4. **资源限制**：dev 可减半，production 按压测结果 set
5. **敏感配置**：使用 Sealed Secrets 或 External Secrets Operator，不入库明文

### Helm + Kustomize 对比（选型决策）

| 维度 | Helm | Kustomize |
|------|------|-----------|
| 模板能力 | 强（Go template） | 弱（patch overlay） |
| 发布管理 | 原生（helm history/rollback） | 需配合 Git |
| Helm Chart 生态 | 丰富（pg/redis 现成 chart） | 不直接消费 chart |
| 学习曲线 | 中高 | 低 |
| 推荐场景 | 开源组件部署、需版本管理 | 原生 K8s workload、Git-ops |
| 组合使用 | Helm template + Kustomize patch | Overlay Helm output |
