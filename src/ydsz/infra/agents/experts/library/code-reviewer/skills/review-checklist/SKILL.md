---
name: review-checklist
description: 代码评审检查清单——按 P0/P1/P2/P3 分级的问题清单，包含 OWASP Top 10 代码映射、Python/Go/TS 常见反模式速查表和测试最佳实践检查项
metadata:
  Ydsz:
    emoji: "\U0001f4cb"
    label:
      zh: "代码评审清单"
      en: "Code Review Checklist"
    summary:
      zh: "按严重等级组织的代码评审检查清单，覆盖安全、性能、可读性、测试、架构和规范六大维度"
      en: "Severity-graded code review checklist covering security, performance, readability, testing, architecture and conventions"
---

# 代码评审检查清单

每次 review 时按以下维度逐项勾选，每个发现标注严重等级（P0-P3）。

## P0 — 立即阻塞合入

### 安全
- [ ] SQL 拼接（非参数化查询）→ 注入风险
- [ ] 命令拼接 / `os.system()` / `eval()` 用户输入 → RCE
- [ ] 密钥、token、密码硬编码在源码中
- [ ] 未校验的用户输入直接输出到 HTML/JS → XSS
- [ ] CORS 配置 `Access-Control-Allow-Origin: *` 且允许 credentials
- [ ] JWT 未校验签名/过期时间、使用弱算法（HS256 + 短密钥）
- [ ] 路径拼接未做目录穿越防护（`../../etc/passwd`）
- [ ] 反序列化用户输入（pickle/yaml.load/msgpack）

### 性能
- [ ] 循环内执行 DB/HTTP 请求（N+1 查询）
- [ ] 无界goroutine/coroutine 启动 → 资源耗尽
- [ ] 未关闭的连接/文件句柄/响应体 → 连接泄漏

### 正确性
- [ ] 竞态条件未加锁或未使用原子操作
- [ ] 关键路径缺少错误处理（吞掉异常导致静默失败）
- [ ] 财务/订单金额使用浮点数运算

---

## P1 — 本迭代必须修复

### 安全
- [ ] 密码使用 MD5/SHA1 哈希（应使用 bcrypt/argon2/scrypt）
- [ ] Cookie 未设置 HttpOnly / Secure / SameSite
- [ ] 日志中打印敏感信息（密码、token、PII）

### 性能
- [ ] 全表扫描无索引 / 缺少 WHERE 条件的查询
- [ ] O(n²) 嵌套循环处理大数据集
- [ ] 缺少缓存的热点读取（同一查询 1 秒内执行数十次）

### 可读性
- [ ] 函数超过 80 行且未做拆分
- [ ] 变量名是单个字母（循环计数器除外）或无意义缩写

### 测试
- [ ] 新增核心逻辑完全没有单元测试
- [ ] 测试只验证 happy path，异常分支覆盖为零

---

## P2 — 下个迭代处理

### 可读性
- [ ] 注释与实现不一致（过期注释）
- [ ] 重复代码块 ≥ 3 处，应抽取公共函数
- [ ] 魔法数字/字符串未提取为常量

### 架构
- [ ] 新增代码违反模块边界（直接跨层调用）
- [ ] 接口/函数签名不一致（同类型参数在不同函数中位置不同）

### 测试
- [ ] 测试用例名不描述行为（`test1`、`test_func2`）
- [ ] 测试断言恒为 `true` / 空 assert

---

## P3 — 建议优化

### 规范
- [ ] 违反 lint 规则（未使用的变量、import、不合规的命名）
- [ ] 格式化不一致（缩进混用、行尾空格）
- [ ] commit 信息不符合 Conventional Commits 规范

### 文档
- [ ] 公开 API 缺少 docstring / JSDoc / godoc
- [ ] 复杂算法缺少"为什么这样做"的设计注释

---

## OWASP Top 10 代码映射速查

| OWASP 风险 | 代码特征 | 检测方式 |
|---|---|---|
| A01: 权限控制失效 | 接口无鉴权装饰器/中间件、通过 hidden field 传权限 | 检查路由处理函数的装饰器链 |
| A02: 加密失败 | 使用 MD5/SHA1、自实现加密算法、ECB 模式 | 搜索加密函数调用 |
| A03: 注入 | 字符串拼接 SQL/命令/LDAP/HQL | 搜索字符串拼接 + 数据库调用 |
| A04: 不安全设计 | 缺少限流/熔断/幂等设计 | 检查核心接口的防护层 |
| A05: 安全配置错误 | 默认凭证、CORS 通配符、调试模式上线 | 检查配置文件和启动参数 |
| A06: 脆弱组件 | 依赖已知 CVE 版本 | 检查 lock 文件版本号 |
| A07: 认证失败 | 弱密码策略、无暴力破解防护 | 检查认证中间件 |
| A08: 数据完整性 | 未签名的 JWT/Cookie、未校验的更新 | 检查序列化/签名逻辑 |
| A09: 日志不足 | 安全事件无审计日志 | 检查认证/授权点的日志输出 |
| A10: SSRF | URL 参数直接发起请求且无白名单 | 检查 HTTP 客户端调用的 URL 来源 |

---

## 语言常见反模式速查

### Python
- `except:` 裸异常 → 捕获所有异常包括 `KeyboardInterrupt`
- 可变默认参数 `def f(x, lst=[])` → 共享状态
- `subprocess.call(shell=True)` → 命令注入
- `yaml.load()` 不带 `Loader=SafeLoader` → 反序列化漏洞
- 线程间共享可变状态无锁

### Go
- goroutine 泄漏（无退出机制）
- `defer` 在循环中关闭资源（性能问题）
- 忽略 `error` 返回值
- 值 receiver vs pointer receiver 不一致
- `string(b)` 在循环中反复转换 byte 切片

### TypeScript
- `any` 类型绕过类型检查
- Promise 链缺少 `.catch()` → 未捕获 rejection
- `==` 而非 `===` 比较
- 非空断言 `!` 过度使用导致运行时 undefined
- useEffect 依赖数组遗漏依赖

---

## 测试最佳实践检查

- [ ] 每个公开函数至少有 1 个正向测试 + 1 个异常路径测试
- [ ] 边界条件：空输入、零值、最大值、并发场景
- [ ] Mock 外部依赖（DB/HTTP/文件系统），不依赖外部环境
- [ ] 测试名称描述行为：`should_return_error_when_user_not_found`
- [ ] 断言验证业务逻辑，而非实现细节
- [ ] 测试运行时间合理（单测 < 1s）
- [ ] 覆盖率：核心逻辑分支覆盖 ≥ 80%，但不盲目追求数字
