---
name: security-review
description: 代码安全 Review 的结构化清单——OWASP Top 10/2023 代码映射 + CWE Top 25 + 按语言分类的检测规则（Python/Go/TS/Java），配合可直接粘贴使用的 Review 提示模板。
metadata:
  Ydsz:
    emoji: "\U0001F512"
    label:
      zh: "安全 Review 清单"
      en: "Security Review Checklist"
    summary:
      zh: "代码安全 Review 的结构化清单，覆盖 OWASP、CWE 和语言特异的检测规则与修复命令。"
      en: "Structured code security review checklist covering OWASP, CWE, and language-specific detection rules."
---

# 安全 Review 清单

结构化的代码安全 Review 框架，适用于 PR Review、预上线审计和定期安全扫描场景。

## 一、OWASP Top 10 / 2023 简明映射

| 编号 | 威胁 | 代码级表现 | 关键检测点 | 修复/防护 |
| --- | --- | --- | --- | --- |
| A01 | Broken Access Control | 未校验资源所有权；mass assignment；强制浏览 | 接口是否校验 `current_user.id == resource.owner_id` | 服务端强制 RBAC + ownership check；禁止暴露内部 ID |
| A02 | Cryptographic Failures | 使用 MD5/SHA1 做密码哈希；TLS 1.0/1.1；硬编码密钥 | 是否使用 Argon2id/bcipher；TLS 最低版本 | Argon2id、TLS 1.3、密钥存入 Vault |
| A03 | Injection | SQL 拼接；XSS 未转义；命令注入 | 是否所有 SQL 走参数化查询 | 参数化查询、CSP、shell 转义白名单 |
| A04 | Insecure Design | 缺乏威胁建模；无速率限制；无限登录尝试 | 设计文档是否覆盖安全场景 | STRIDE 威胁建模；限流；最小权限设计 |
| A05 | Security Misconfiguration | 默认密码未改；暴露调试信息；缺失安全 Header | 响应头是否包含 CSP/HSTS/X-Frame-Options | 移除 debug 模式；加固 Header；基础设施即代码扫描 |
| A06 | Vulnerable Components | 依赖版本未锁定；已知 CVE 未修复 | `package-lock.json` / `requirements.txt` 是否最新 | SBOM 生成；Dependabot/Renovate 自动 PR |
| A07 | Auth Failures | 弱密码算法；JWT 无过期；Session 固定 | JWT 是否校验 exp/iss/aud | bcrypt + salt；JWT 短过期 + refresh；MFA |
| A08 | Data Integrity Failures | 未校验下载包签名；CI/CD 管道可注入 | 依赖是否使用签名验证 | SLSA 框架；cosign 镜像签名；SBOM namespace 锁定 |
| A09 | Logging Failures | 未记录登录/权限变更；日志含敏感信息 | 关键操作是否有审计日志 | 结构化日志；审计日志独立存储 ≥6 个月 |
| A10 | SSRF | 用户可控 URL 直接请求内网；无白名单 | file_get_contents / urllib / fetch 是否校验目标 | URL 白名单；禁用内网 IP 段；DNS rebinding 防护 |

## 二、CWE Top 25 软件脆弱性核心 7 项

| CWE ID | 名称 | 代码特征 | 检测信号 |
| --- | --- | --- | --- |
| CWE-79 | XSS（跨站脚本） | 未转义用户输入直接渲染到 HTML | `innerHTML`、`dangerouslySetInnerHTML`、`{{ . }}` 未过滤 |
| CWE-89 | SQL 注入 | SQL 字符串拼接 | `"SELECT * FROM " + tableName`、`f"WHERE id = {user_input}"` |
| CWE-20 | Input Validation | 未校验外部输入直接使用 | 缺少长度/类型/范围校验；信任客户端数据 |
| CWE-22 | Path Traversal | 用户可控路径未规范化 | `open(os.path.join(base, user_path))`；`../../etc/passwd` |
| CWE-352 | CSRF | 状态变更接口无 token | POST 表单缺 CSRF token；Cookie 未设 SameSite |
| CWE-434 | Unrestricted Upload | 文件上传无类型/大小限制 | 直接使用原始文件名；未检查 magic bytes |
| CWE-502 | Deserialization | 不可信数据直接反序列化 | `pickle.loads(data)`、`yaml.load()` 无校验 |

> 完整 CWE Top 25 列表参考：https://cwe.mitre.org/top25/

## 三、按语言高发漏洞

### Python

| 漏洞 | 危险代码 | 安全替代 |
| --- | --- | --- |
| 反序列化 | `pickle.loads(data)` | `json.loads()` 或 `marshmallow` 校验 |
| SQL 注入 | `cursor.execute(f"SELECT {col}")` | 参数化查询：`execute("...", params)` |
| 命令注入 | `os.system(f"ping {host}")` | `subprocess.run(["ping", host])`，禁止 shell=True |
| 路径穿越 | `open(base + user_input)` | `Path(base).joinpath(user_input).resolve()` 后校验前缀 |
| 硬编码密码 | `DB_PASSWORD = "admin123"` | 环境变量或 Vault |

### Go

| 漏洞 | 危险代码 | 安全替代 |
| --- | --- | --- |
| SQL 注入 | `fmt.Sprintf("SELECT * FROM %s", id)` | `db.Query("SELECT * FROM t WHERE id = ?", id)` |
| 并发竞争 | 未加锁的 map 读写 | `sync.Map` 或 `sync.RWMutex` |
| 资源泄漏 | `resp, _ := http.Get(url)` 未 Close | `defer resp.Body.Close()` |
| Goroutine 泄漏 | 无 timeout 的 channel 操作 | `context.WithTimeout` 控制生命周期 |

### TypeScript / JavaScript

| 漏洞 | 危险代码 | 安全替代 |
| --- | --- | --- |
| XSS | `el.innerHTML = userInput` | `el.textContent = userInput` 或 DOMPurify |
| 原型污染 | `Object.assign(target, untrusted)` | 使用 `JSON.parse` 后做 schema 校验 |
| 依赖漏洞 | 未锁版本 | `npm audit fix`、Dependabd |
| eval 注入 | `eval(userInput)` | 使用 `Function()` 沙箱或 JSON Logic |

### Java

| 漏洞 | 危险代码 | 安全替代 |
| --- | --- | --- |
| 反序列化 | `ois.readObject()` | 使用 JSON 或白名单 ObjectInputStream |
| SpEL 注入 | `parser.parseExpression(userInput)` | `SimpleEvaluationContext` 限制表达式范围 |
| XXE | 默认 SAXParser 解析外部实体 | 禁用 DOCTYPE + external entities |
| SQL 注入 | `"SELECT * FROM " + tb` | `PreparedStatement` + MyBatis `#{}` |

## 四、Review 提示模板（5 段式）

直接向 AI 粘贴以下模板，替换 `{{...}}` 部分即可：

```text
你是一位精通应用安全的高级工程师，请帮我做安全 Review。

【检查范围】
以下是 {{file_or_diff}}，涉及 {{language}} 的 {{module_description}}。

【检查方法】
1. 逐文件扫描：对照 OWASP Top 10 (A01-A10) + CWE Top 25 核心项
2. 重点关注：认证、授权、注入、加密、数据处理、文件操作、输入校验
3. 发现漏洞时给出：文件名、行号、问题描述、风险等级、修复代码

【风险分级】
🔴 Critical — 可直接利用导致数据泄露/系统入侵
🟠 High — 组合利用可造成严重危害
🟡 Medium — 违反安全最佳实践，存在潜在风险
🟢 Low — 安全卫生问题，建议改进

【输出格式】
以 Markdown 表格输出，列：# | 文件 | 行号 | 漏洞类型 | 风险等级 | 问题描述 | 修复建议

【修复要求】
每个 Critical 和 High 项必须附带修复后的代码片段和对应的单元测试或集成测试方案。
```

## 五、快速检测命令

### 静态分析（SAST）

```bash
# Semgrep — 多语言规则库
semgrep --config=p/owasp-top-ten --config=p/cwe-top-25 --json --output=report.json .

# Bandit — Python 专用
bandit -r src/ -f json -o bandit-report.json

# GoSec — Go 专用
gosec -fmt=json -out=gosec-report.json ./...
```

### 依赖扫描

```bash
# Trivy — 全栈扫描（依赖 + 配置 + 镜像）
trivy fs --scanners vuln,secret,config --format json -o trivy-report.json .

# OWASP Dependency-Check
dependency-check --project myapp --scan . --format JSON --out report/

# npm 审计
npm audit --json > npm-audit.json

# pip-audit
pip-audit --format json --output pip-audit.json
```

### 密钥泄露检测

```bash
# Gitleaks — 扫描 git 历史
gitleaks detect --source . --report-format json --report-path gitleaks-report.json

# TruffleHog — 深度扫描
trufflehog git file://. --json --output=trufflehog.json
```

### 容器/镜像安全

```bash
# Trivy 镜像扫描
trivy image --scanners vuln --format json -o image-report.json myapp:latest

# Docker Bench for Security
docker run --rm --net host --pid host --userns host --cap-add audit_control \
  -v /etc:/etc:ro -v /usr/bin/containerd:/usr/bin/containerd:ro \
  -v /usr/bin/runc:/usr/bin/runc:ro -v /usr/lib/systemd:/usr/lib/systemd:ro \
  -v /var/lib:/var/lib:ro -v /var/run/docker.sock:/var/run/docker.sock:ro \
  --label docker_bench_security \
  docker/docker-bench-security
```

## 使用指南

何时引用这份 skill：

- 在 Merge Request / Pull Request 提交前，执行快速安全自检
- 设计 Review prompt 模板时，作为系统化检查项的来源
- 团队制定安全编码规范时，作为语言特异规则的参考库
- 需要快速扫描项目已知漏洞类型时，直接使用上方命令

如何引用：在 Review 任务中附加"按 security-review 清单扫描"并指定语言即可获得结构化发现。
