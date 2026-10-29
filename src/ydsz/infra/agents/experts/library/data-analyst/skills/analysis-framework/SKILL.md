---
name: analysis-framework
description: 数据分析框架参考——5 种分析场景（用户行为/业务指标/A-B测试/异常检测/漏斗转换）对应的标准分析模板、SQL 模板和 Python pandas 代码片段
metadata:
  Ydsz:
    emoji: "\U0001f4ca"
    label:
      zh: "数据分析框架"
      en: "Analysis Framework"
    summary:
      zh: "覆盖 5 种常见分析场景的标准模板、可复用 SQL 和 pandas 代码片段"
      en: "Standard analysis templates with reusable SQL and pandas snippets for 5 common scenarios"
---

# 数据分析框架参考

根据分析场景选择对应模板，按步骤执行分析并填充结果。

## 场景一：用户行为分析

**目标**：理解用户在产品中的行为路径、活跃度分布和留存规律。

### 分析步骤
1.  DAU/WAU/MAU 趋势（按日/周聚合）
2.  用户分层：新用户、活跃用户、回流用户、流失用户的定义和占比
3.  行为漏斗：关键路径的转化率（注册→激活→首单→复购）
4.  留存曲线：次日/7日/30日留存率

### SQL 模板
```sql
-- DAU 趋势
SELECT DATE(event_time) AS dt, COUNT(DISTINCT user_id) AS dau
FROM user_events
WHERE event_time >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY dt ORDER BY dt;

-- 次日留存
SELECT a.dt,
       COUNT(DISTINCT a.user_id) AS day0_users,
       COUNT(DISTINCT b.user_id) AS day1_retained,
       ROUND(COUNT(DISTINCT b.user_id) * 100.0 / COUNT(DISTINCT a.user_id), 2) AS retention_pct
FROM (SELECT DISTINCT user_id, DATE(first_event) AS dt FROM user_events) a
LEFT JOIN user_events b ON a.user_id = b.user_id
  AND DATE(b.event_time) = DATE_ADD(a.dt, INTERVAL 1 DAY)
GROUP BY a.dt ORDER BY a.dt;
```

### pandas 片段
```python
import pandas as np
import pandas as pd

df['event_date'] = pd.to_datetime(df['event_time']).dt.date
dau = df.groupby('event_date')['user_id'].nunique().reset_index(name='dau')
# 滚动 7 日活跃
dau['wau'] = dau.set_index('event_date').rolling(7)['dau'].mean().values
```

---

## 场景二：核心业务指标分析

**目标**：监控 GMV、ARPU、转化率等核心指标的健康度及变化原因。

### 分析步骤
1.  核心指标当期值 + 环比/同比变化率
2.  按维度拆解（渠道/地域/用户群/商品类）定位贡献源
3.  趋势图 + 突变点归因
4.  与目标值/Benchmark 对比

### SQL 模板
```sql
-- GMV 日趋势 + 环比
WITH daily AS (
  SELECT DATE(order_time) AS dt, SUM(amount) AS gmv
  FROM orders WHERE status = 'paid'
  GROUP BY dt
)
SELECT dt, gmv,
       LAG(gmv) OVER (ORDER BY dt) AS prev_gmv,
       ROUND((gmv - LAG(gmv) OVER (ORDER BY dt)) * 100.0
             / NULLIF(LAG(gmv) OVER (ORDER BY dt), 0), 2) AS mom_pct
FROM daily ORDER BY dt;

-- 按渠道拆解
SELECT channel,
       COUNT(DISTINCT user_id) AS users,
       SUM(amount) AS gmv,
       ROUND(SUM(amount) / COUNT(DISTINCT user_id), 2) AS arpu
FROM orders o JOIN users u ON o.user_id = u.user_id
WHERE DATE(o.order_time) BETWEEN '2024-01-01' AND '2024-01-31'
GROUP BY channel ORDER BY gmv DESC;
```

### pandas 片段
```python
daily = df.resample('D', on='order_time')['amount'].sum().reset_index(name='gmv')
daily['mom_pct'] = daily['gmv'].pct_change() * 100
# 突变点：Z-score > 3
daily['zscore'] = (daily['gmv'] - daily['gmv'].mean()) / daily['gmv'].std()
change_points = daily[daily['zscore'].abs() > 3]
```

---

## 场景三：A/B 测试分析

**目标**：科学评估实验组vs对照组的效果差异，避免虚假结论。

### 分析步骤
1.  校验样本量是否满足最小可检测效应（MDE）
2.  检查样本比例 mismatch（SRM 检测，chi-square p > 0.01）
3.  核心指标对比 + 置信区间
4.  子群分析（按用户特征分层看效果异质性）
5.  结论：显著/不显著/继续跑，附统计量

### SQL 模板
```sql
-- 核心指标对比
SELECT group_name,
       COUNT(DISTINCT user_id) AS users,
       SUM(conversion)::FLOAT / COUNT(DISTINCT user_id) AS cvr,
       SUM(revenue) / COUNT(DISTINCT user_id) AS arpu
FROM ab_experiment
WHERE experiment_id = 'exp_xxx'
GROUP BY group_name;
```

### pandas 片段
```python
from scipy import stats

control = df[df['group'] == 'control']['metric']
treatment = df[df['group'] == 'treatment']['metric']
t_stat, p_value = stats.ttest_ind(treatment, control, equal_var=False)
# Cohen's d 效应量
effect_size = (treatment.mean() - control.mean()) / np.sqrt(
    (treatment.std()**2 + control.std()**2) / 2
)
```

---

## 场景四：异常检测

**目标**：自动发现数据中的离群点、异常波动和可疑模式。

### 分析步骤
1.  时序可视化 + 滚动均值/标准差带
2.  Z-score 法：|Z| > 3 → 异常
3.  IQR 法：< Q1 - 1.5*IQR 或 > Q3 + 1.5*IQR → 异常
4.  时序残差法：分解趋势+季节后残差异常
5.  异常点归因（时间、来源、关联事件）

### pandas 片段
```python
# Z-score
df['zscore'] = (df['value'] - df['value'].mean()) / df['value'].std()
df['is_anomaly_z'] = df['zscore'].abs() > 3

# IQR
q1 = df['value'].quantile(0.25)
q3 = df['value'].quantile(0.75)
iqr = q3 - q1
df['is_anomaly_iqr'] = (df['value'] < q1 - 1.5*iqr) | (df['value'] > q3 + 1.5*iqr)

# 时序残差（简单版）
rolling_mean = df['value'].rolling(window=7).mean()
residual = df['value'] - rolling_mean
threshold = 2 * residual.std()
df['is_anomaly_residual'] = residual.abs() > threshold
```

---

## 场景五：漏斗转换分析

**目标**：量化多步骤流程中每一步的转化率和流失率，定位瓶颈。

### 分析步骤
1.  定义漏斗步骤和事件序列
2.  逐步计算转化率（整体 + 按维度拆分）
3.  定位流失最大的环节
4.  分析流失用户画像和流失后的去向
5.  估算修复该环节对整体转化率的影响

### SQL 模板
```sql
-- 漏斗逐步转化
WITH steps AS (
  SELECT user_id,
    MAX(CASE WHEN event = 'page_view' THEN 1 ELSE 0 END) AS step1,
    MAX(CASE WHEN event = 'add_cart' THEN 1 ELSE 0 END) AS step2,
    MAX(CASE WHEN event = 'checkout' THEN 1 ELSE 0 END) AS step3,
    MAX(CASE WHEN event = 'pay_success' THEN 1 ELSE 0 END) AS step4
  FROM user_events
  WHERE event_time BETWEEN '2024-01-01' AND '2024-01-07'
  GROUP BY user_id
)
SELECT
  COUNT(*) AS total_users,
  SUM(step1) AS step1_view,
  SUM(step2) AS step2_cart,
  SUM(step3) AS step3_checkout,
  SUM(step4) AS step4_paid,
  ROUND(SUM(step2)*100.0/NULLIF(SUM(step1),0),2) AS s1_to_s2_pct,
  ROUND(SUM(step3)*100.0/NULLIF(SUM(step2),0),2) AS s2_to_s3_pct,
  ROUND(SUM(step4)*100.0/NULLIF(SUM(step3),0),2) AS s3_to_s4_pct
FROM steps;
```

### pandas 片段
```python
steps = ['page_view', 'add_cart', 'checkout', 'pay_success']
funnel = {}
for step in steps:
    funnel[step] = df[df['event'] == step]['userId'].nunique()
    if i > 0:
        print(f"{steps[i-1]} → {step}: {funnel[step]/funnel[steps[i-1]]*100:.1f}%")
```

---

## 通用分析输出模板

每次分析完成后，按以下结构输出 Markdown 报告：

```markdown
## 核心发现

- [一句话结论1]
- [一句话结论2]
- [一句话结论3]

## 分析过程

### 数据质量

| 检查项 | 结果 |
|--------|------|
| 样本量 | N = xxx |
| 时间范围 | yyyy-mm-dd ~ yyyy-mm-dd |
| 缺失率 | 列A: x%，列B: y% |
| 异常值 | 发现 N 个（详见异常检测结果） |

### 详细分析

[按场景展开，含表格/图表]

## 建议下一步

1. [行动建议1]
2. [行动建议2]
3. [需验证的假设和数据收集方向]
```
