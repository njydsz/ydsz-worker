---
name: sql-patterns
description: SQL 查询优化的实战参考手册——从慢查询定位到执行计划解读，覆盖索引设计/反范式化/分页优化/锁与事务/分区策略；按场景给出具体改写模板。
metadata:
  Ydsz:
    emoji: "🗃️"
    label:
      zh: "SQL 优化模式"
      en: "SQL Tuning Patterns"
    summary:
      zh: "从慢查询定位到索引设计的 SQL 实战优化指南，含改写模板与反模式清单。"
      en: "Practical SQL optimization guide: slow query diagnosis, index design, rewrite patterns, and anti-patterns."
---

# SQL 优化模式

SQL 优化不是一次性工作，而是一个持续的"定位 → 改写 → 验证"循环。本手册按诊断流组织，帮助你在生产环境中系统性解决慢查询问题。

## 一、慢查询 5 步定位流程

### Step 1：开启慢日志

```sql
-- MySQL
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;        -- 秒，设为 0 可抓取全量（慎用）
SET GLOBAL log_queries_not_using_indexes = 'ON';

-- PostgreSQL
ALTER SYSTEM SET log_min_duration_statement = 1000;  -- ms
```

**验证项**：确认 `/var/log/mysql/slow.log` 或 `pg_log` 开始记录，检查慢日志保留轮转配置。

### Step 2：定位 SQL

从慢日志聚合出"总耗时 × 出现次数"的 TOP N 语句。工具推荐：

- `pt-query-digest`（MySQL）
- `pg_stat_statements`（PostgreSQL）

关注：**平均耗时 × 执行次数** 才是真实影响面，而非单次最慢的那条。

### Step 3：EXPLAIN 解读

```sql
EXPLAIN ANALYZE SELECT ...   -- PostgreSQL（实际执行）
EXPLAIN FORMAT=JSON SELECT ...  -- MySQL 5.6+
```

关键字段信号：

| 字段 | 优 | 劣 | 行动 |
| --- | --- | --- | --- |
| `type` | `system / const / eq_ref / ref / range` | `ALL` (全表扫描) 或 `index` (全索引扫描) | 检查 WHERE / JOIN 条件是否需要索引 |
| `key` | 命中预期索引 | `NULL` | 创建或修正索引 |
| `rows` | 估算行数小 | 远大于实际返回行 | 统计信息过时或索引选择性差 |
| `Extra` | `Using index` (覆盖索引) | `Using filesort` / `Using temporary` | ORDER BY / GROUP BY 需要复合索引或改写 |

### Step 4：改写与索引

基于 EXPLAIN 结果选择下文"改写模板"或"索引设计"方案，单条逐一处理。

### Step 5：验证

改完后对比：执行时间、扫描行数、锁持有时间。**必须**在同类数据集上 A/B 对比。

## 二、索引设计核心

### B+ 树原理

数据库索引本质是有序 B+ 树，数据只在叶子节点，内节点只存路由。这意味着：

- **最左前缀**：复合索引 `(a, b, c)` 支持 `(a)`、`(a,b)`、`(a,b,c)` 查询，不支持 `(b,c)`。
- **排序友好**：`WHERE a=1 ORDER BY b` 用 `(a,b)` 索引可避免 filesort。
- **选择性**：`COUNT(DISTINCT col) / COUNT(*)` 越高越适合建索引，低选择性列（如性别）单独建索引收益低。

### 覆盖索引

当索引包含查询所需全部字段时，引擎无需回表（Index Only Scan）。改写技巧：

```sql
-- Before: 需要回表取 name
SELECT name FROM users WHERE age > 30;

-- After: 建立覆盖索引
CREATE INDEX idx_age_name ON users(age, name);
-- Extra 变为 "Using index"
```

### 索引下推（ICP / Index Condition Pushdown）

MySQL 5.6+ 和 PostgreSQL 均支持：在索引遍历时提前应用 WHERE 条件，减少回表次数。检查 EXPLAIN 中是否出现 `Using index condition`。

## 三、10 个反模式及改写

### 1. SELECT *

```sql
-- Before
SELECT * FROM orders WHERE user_id = 123;

-- After
SELECT id, status, created_at FROM orders WHERE user_id = 123;
```
**收益**：减少 I/O、覆盖索引可命中、网络传输更少。

### 2. 隐式类型转换

```sql
-- Before: phone 是 VARCHAR，传入数字导致全表扫描
SELECT * FROM users WHERE phone = 13800138000;

-- After
SELECT * FROM users WHERE phone = '13800138000';
```

**原理**：比较时 VARCHAR 列被转为 INT，索引失效。同理：日期字符串要显式 `DATE()`、避免列上套函数。

### 3. 索引列套函数

```sql
-- Before
SELECT * FROM orders WHERE YEAR(created_at) = 2024;

-- After
SELECT * FROM orders
WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01';
```

### 4. 深分页

```sql
-- Before: 扫描并丢弃前 1000000 行
SELECT id, name FROM users ORDER BY id LIMIT 10 OFFSET 1000000;

-- After: 游标分页，O(1) 定位
SELECT id, name FROM users WHERE id > 1000000 ORDER BY id LIMIT 10;
```

### 5. IN 大列表

```sql
-- Before: IN 列表过长（>1000）可能导致优化器放弃索引
SELECT * FROM products WHERE category_id IN (...500个...);

-- After: 改写为 JOIN 临时表或分批查询
SELECT p.* FROM products p
JOIN tmp_category_filter f ON p.category_id = f.id;
```

### 6. N+1 查询

```python
# Before: ORM 循环触发 N+1
for order in orders:
    print(order.user.name)   # 每条 order 再发 1 次查询

# After: 用 JOIN 或 preload 一次拉取
# SQL
SELECT o.*, u.name FROM orders o JOIN users u ON o.user_id = u.id;
```

### 7. JOIN 无索引

```sql
-- 确保 JOIN 两侧连接键都有索引
CREATE INDEX idx_order_user ON orders(user_id);
CREATE INDEX idx_user_id ON users(id);   -- 主键通常已有
```

### 8. OR 改写为 UNION ALL

```sql
-- Before: OR 跨列常致全表扫描
SELECT * FROM logs WHERE user_id = 100 OR operator_id = 100;

-- After: UNION ALL 使每一分支各用各的索引
SELECT * FROM logs WHERE user_id = 100
UNION ALL
SELECT * FROM logs WHERE operator_id = 100 AND user_id != 100;
```

### 9. 子查询改写为 JOIN

```sql
-- Before: 关联子查询每行都执行
SELECT * FROM orders o
WHERE o.amount > (SELECT AVG(amount) FROM orders WHERE category = o.category);

-- After
SELECT o.*
FROM orders o
JOIN (SELECT category, AVG(amount) AS avg_amount FROM orders GROUP BY category) c
  ON o.category = c.category
WHERE o.amount > c.avg_amount;
```

### 10. ORDER BY RAND()

```sql
-- Before: 全表排序，O(n log n)
SELECT * FROM products ORDER BY RAND() LIMIT 10;

-- After: 主键范围 + 随机偏移
SELECT * FROM products
WHERE id >= (SELECT FLOOR(RAND() * (SELECT MAX(id) FROM products)))
LIMIT 10;
```

## 四、改写模板速查

### 大分页游标化

```
BEFORE:  LIMIT page_size OFFSET (page-1)*page_size
AFTER:   WHERE pk > last_pk ORDER BY pk LIMIT page_size
适用: 顺序翻页、数据导出
不适用: 随机跳页（需接受约束或使用 keyset + 页面缓存）
```

### LIMIT 延迟 JOIN

```sql
-- Before: 子查询全列回表
SELECT * FROM orders WHERE user_id = 1 ORDER BY created_at DESC LIMIT 10;

-- After: 延迟回表，仅对主键 JOIN
SELECT o.* FROM (
  SELECT id FROM orders WHERE user_id = 1
  ORDER BY created_at DESC LIMIT 10
) t JOIN orders o ON t.id = o.id;
```

### IN → EXISTS

```sql
-- IN 对大结果集可能写入临时表
SELECT * FROM orders WHERE user_id IN (SELECT id FROM vip_users);

-- EXISTS 通常是半连接（semi-join），遇匹配即停
SELECT * FROM orders o
WHERE EXISTS (SELECT 1 FROM vip_users v WHERE v.id = o.user_id);
```

## 五、锁与事务

### 行锁与间隙锁（InnoDB）

- **记录锁（Record Lock）**：精确命中唯一索引行。
- **间隙锁（Gap Lock）**：RR 级别下，范围查询在不存在的数据上也会加锁，防止幻读。
- **Next-Key Lock**：Record + Gap 组合，覆盖左开右闭区间。

**排查死锁**：`SHOW ENGINE INNODB STATUS` 查看 `LATEST DETECTED DEADLOCK` 段；PostgreSQL 锁等待在 `pg_locks` 视图查看。

### 隔离级别选择

| 级别 | 脏读 | 不可重复读 | 幻读 | 性能 |
| --- | --- | --- | --- | --- |
| READ UNCOMMITTED | ✓ | ✓ | ✓ | 最高 |
| READ COMMITTED | ✗ | ✓ | ✓ | 高 |
| REPEATABLE READ | ✗ | ✗ | ✗（InnoDB 基本避免） | 中 |
| SERIALIZABLE | ✗ | ✗ | ✗ | 低 |

**建议**：多数 OLTP 用 RC 或 RR，金融强一致场景用 SERIALIZABLE 或乐观锁 + 重试。

### 避免长事务

长事务持有锁、膨胀 undo log、影响 vacuum/pg_wal 清理。原则：不在事务内调外部服务、批量拆批（1-5k/批）、设置 `idle_in_transaction_session_timeout`。

## 六、分区策略

| 策略 | 语法示例 | 适用 | 不适用 |
| --- | --- | --- | --- |
| RANGE | `PARTITION BY RANGE (created_at)` | 时间序列归档、清理 | 随机主键查询 |
| HASH | `PARTITION BY HASH(id) PARTITIONS 16` | 均匀打散热点 | 范围查询走全分区 |
| LIST | `PARTITION BY LIST (region)` | 枚举离散值 | 值分布变化频繁 |

**原则**：没有查询条件中包含分区键 → 优化器无法裁剪分区，退化为全表扫描且成本更高。

## 使用指南

当用户提出"这条 SQL 太慢了"、"索引怎么加"、"事务死锁怎么排查"或类似数据层性能问题时，按本 Skill 的"慢查询 5 步定位流程"推进。重点是用 EXPLAIN 数据说话而非凭直觉猜测索引。遇到具体反模式时直接套用改写模板，改完后务必要求 A/B 验证。
