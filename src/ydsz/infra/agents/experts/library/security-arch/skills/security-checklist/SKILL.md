---
name: security-checklist
description: 安全加固清单——OWASP Top 10/2023 代码映射加检测命令、等保2.0 三级要求条文化对照表、云原生安全（K8s CIS Benchmarks 节选）、密钥管理最佳实践（Vault/轮换/HSM/SOP）。
metadata:
  Ydsz:
    emoji: "\U0001F6E1\uFE0F"
    label:
      zh: "安全加固清单"
      en: "Security Hardening Checklist"
    summary:
      zh: "OWASP 对照、等保2.0 三级、K8s CIS Benchmarks、密钥与凭证管理最佳实践。"
      en: "OWASP mapping, MLPS 2.0 Level 3, K8s CIS Benchmarks, key and secret management best practices."
---

# 安全加固清单

## 一、OWASP Top 10 / 2023 代码映射与检测

| 编号 | 威胁 | 代码级防护 | 检测命令 / 工具 |
| --- | --- | --- |
| A01 | Broken Access Control | RBAC + 服务端校验 ownership；禁用 mass assignment | `grep -r "IsInRole" src/` 或 SAST 工具扫描 |
| A02 | Cryptographic Failures | Argon2id / bcrypt；TLS 1.2+；禁用弱 cipher | `nmap --script ssl-enum-ciphers -p 443 target` |
| A03 | Injection | 参数化查询；输入白名单；ORM 拼接禁用 | `semgrep --config=p/sql-injection` |
| A04 | Insecure Design | 威胁建模左移；最小权限设计 | 设计阶段 STRIDE |
| A05 | Security Misconfiguration | 安全 Header（CSP/HSTS/X-Frame-Options）；默认密码禁用 | `nmap --script http-headers target` |
| A06 | Vulnerable Components | SBOM 生成；依赖漏洞扫描 | `trivy fs --scanners vuln .` |
| A07 | Auth Failures | MFA；JWT 短过期 + refresh；bcrypt | `semgrep --config=p/jwt` |
| A08 | Data Integrity Failures | 签名验证；SBOM namespace 锁定 | `cosign verify` |
| A09 | Logging Failures | 结构化日志；审计 ≥ 6 个月；敏感数据不落地 | 检查日志保留策略 |
| A10 | SSRF | URL 白列表；内网 IP 段禁用 | `semgrep --config=p/ssrf` |

## 二、等保2.0 三级要求条文化对照表

### 安全通信网络

| 要求 | 条款要点 | 落地动作 |
| --- | --- | --- |
| 通信完整性 | 数据传输完整性校验 | TLS 1.2+ + HMAC 签名 |
| 通信保密性 | 敏感数据加密传输 | 全链路 HTTPS，禁止 fallback 到 HTTP |

### 安全区域边界

| 要求 | 条款要点 | 落地动作 |
| --- | --- | --- |
| 边界防护 | 非授权设备/人不能接入 | 网络 ACL + 802.1X |
| 入侵防范 | 检测 / 防止攻击行为 | WAF + IDS/IPS 部署 |
| 恶意代码防范 | 防病毒 / 沙箱 | 文件上传杀毒扫描 |

### 安全计算环境

| 要求 | 条款要点 | 落地动作 |
| --- | --- | --- |
| 身份鉴别 | 双因素鉴别；密码复杂度 | MFA + bcrypt + 最小 8 位 |
| 访问控制 | 三权分立（系统管理员 / 安全保密管理员 / 审计管理员） | 角色拆分，超级 admin 不能兼审计 |
| 安全审计 | 审计记录完整性；≥ 6 个月留存 | 日志只追加，异机备份 |
| 数据完整性 / 保密性 | 校验码 + 加密存储 | HMAC + AES-256-GCM |
| 数据备份恢复 | 异地备份；定期恢复演练 | 3-2-1 备份原则 |

### 安全管理中心

| 要求 | 条款要点 | 落地动作 |
| --- | --- | --- |
| 集中管控 | 对安全组件集中管控 | SIEM / SOC 统一收口 |
| 审计集中分析 | 跨设备关联分析 | 统一日志平台（ELK / Loki） |

### 管理制度 / 管理机构 / 管理人员 / 建设管理 / 运维管理

这 5 类以文档 + 流程为主，技术层面不一一展开。输出合规对照报告时逐条给出"已有 / 缺失 / 建议"。

## 三、云原生安全（K8s CIS Benchmarks 节选）

| 编号 | 控制项 | 检查命令 |
| --- | --- | --- |
| 5.2.1 | 最小权限 Pod Security | `kubectl get pods -A -o jsonpath='{..securityContext}' \| grep privileged` |
| 5.2.2 | 禁止 hostNetwork | `kubectl get pods -A -o yaml \| grep hostNetwork` |
| 5.2.3 | 禁止 hostPID / hostIPC | `kubectl get pods -A -o yaml \| grep -E 'hostPID|hostIPC'` |
| 5.2.4 | 禁止特权容器 | `kubectl get pods -A -o yaml \| grep 'privileged: true'` |
| 5.2.5 | 禁止挂载 hostPath | `kubectl get pods -A -o yaml \| grep hostPath` |
| 5.3.2 | 默认拒绝 NetworkPolicy `kubectl get networkpolicy -A` | |
| 5.4.1 | 镜像拉取策略 IfNotPresent | `kubectl get pods -A -o yaml \| grep imagePullPolicy` |
| 5.7.2 | RBAC 最小权限 | `kubectl get clusterrolebindings -o yaml` |
| 5.7.3 | 禁用 default service account 挂载 | `kubectl get pods -A -o yaml \| grep 'automountServiceAccountToken'` |

## 四、密钥管理最佳实践

### HashiCorp Vault 集成要点

| 控制 | 做法 |
| --- | --- |
| 认证 | AppRole / Kubernetes Auth，不使用 root token |
| 路径隔离 | 按业务线 namespace：`secret/team-alpha/db/` |
| 策略 | 每个服务独立 policy，只读自己路径 |
| 审计 | 启用 Vault audit log，转发到 SIEM |
| 灾备 | Raft 集成，定期快照到异地 |

### 密钥轮换 SOP

| 类型 | 周期 | 方法 |
| --- | --- | --- |
| DB 密码 | 90 天 | 先写入新凭证 → 应用侧双读验证 → 删除旧凭证 |
| API Key | 180 天 | 新旧 key 共存 7 天 → 通知调用方迁移 → 吊销旧 key |
| TLS 证书 | 30 天（自动） | cert-manager 自动续签；人工监控 |
| JWT 签名密钥 | 每月 | 双 active key（kid 识别），旧 key 缓拒 |
| 加密 AES 密钥 | 按需（人员离职立即轮换） | 仅轮换 KEK（Key Encryption Key），DEK 不需要重加密 |

### HSM 集成要点

- 根 key（KEK / 主 key）必须在 HSM 内生成，永不导出。
- HSM 访问走 mTLS + 操作员卡 + PIN。
- 应用调用 HSM 通过 PKCS#11 接口或 Vault Transit 引擎。
- 定期做 drift 检测：对比 HSM 内部 key hash 与注册记录。
