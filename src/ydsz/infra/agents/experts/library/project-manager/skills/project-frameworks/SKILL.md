---
name: project-frameworks
description: Reference handbook for project prioritization and planning frameworks — MoSCoW / RICE / WSJF comparison, WBS templates, risk register (5×5 matrix), stakeholder mapping (power×interest), and sprint retrospective 4L framework. Use when the user needs to prioritize features, decompose work, assess risks, map stakeholders, or run a retrospective.
argument-hint: "<prioritization target or retrospective data>"
---

# /project-frameworks

Reference handbook for prioritization and planning frameworks.

## Usage

```
/project-frameworks $ARGUMENTS
```

## What's Inside

### 1. Prioritization Frameworks

| Framework | Formula | Best For |
|-----------|---------|----------|
| **MoSCoW** | Must / Should / Could / Won't | Quick stakeholder alignment on scope |
| **RICE** | (Reach × Impact × Confidence) / Effort | Quantitative feature scoring |
| **WSJF** | Cost of Delay / Job Size | Economically optimal sequencing in SAFe |
| **Kano** | Must-be / Performance / Delighters | Customer-satisfaction-driven classification |

### 2. WBS Decomposition Template

```
3-Level Rule (8/80 Rule):
├── L1: Project Phase or Epic
│   ├── L2: Deliverable or Feature
│   │   └── L3: Work Package (8h–80h)
│   │       └── Tasks (trackable daily)
```

Rules:
- L3 tasks must be between **8 and 80 hours**.
- Each L3 package must have a **single owner** and a **verifiable output**.
- If a package can't be decomposed to 8–80h, the boundary is wrong.

### 3. Risk Register Template

| ID | Risk Description | Category | Probability (1-5) | Impact (1-5) | Score (P×I) | Mitigation | Owner | Status |
|----|-----------------|----------|-------------------|--------------|-------------|------------|-------|--------|
| R1 | ... | Technical / External / Organizational / Project | 1–5 | 1–5 | 1–25 | ... | ... | Open / Monitoring / Closed |

**5×5 Probability × Impact Matrix:**

| | I=1 Negligible | I=2 Minor | I=3 Moderate | I=4 Major | I=5 Severe |
|---|---|---|---|---|---|
| **P=5 Almost Certain** | Medium | High | High | Critical | Critical |
| **P=4 Likely** | Low | Medium | High | High | Critical |
| **P=3 Possible** | Low | Medium | Medium | High | High |
| **P=2 Unlikely** | Low | Low | Medium | Medium | High |
| **P=1 Rare** | Low | Low | Low | Medium | Medium |

Score color zones: **1–4 Green** (accept/monitor) / **5–9 Yellow** (active mitigation) / **10–25 Red** (escalate + contingency plan).

### 4. Stakeholder Mapping (Power × Interest Grid)

| | Low Interest | High Interest |
|---|---|---|
| **High Power** | Keep Satisfied | **Manage Closely** |
| **Low Power** | Monitor | Keep Informed |

For each stakeholder: list their **goal**, **current stance** (Champion / Supporter / Neutral / Blocker / Unknown), **influence level**, and **communication preference**.

### 5. Sprint Retrospective — 4L Framework

| | Prompt | Time |
|---|---|---|
| **Liked** | What went well? What should we keep? | 5 min |
| **Learned** | What new things did we discover? | 5 min |
| **Lacked** | What was missing (tools / info / time)? | 5 min |
| **Longed For** | What would make the next sprint dramatically better? | 5 min |

Output format: table of items per quadrant + top-voted actions (owner + deadline).

### 6. Communication Plan Template

| Audience | Channel | Frequency | Content | Owner | Escalation Trigger |
|----------|---------|-----------|---------|-------|--------------------|
| Steering Committee | Bi-weekly report | Every 2 weeks | RAG status, top 3 risks, decisions needed | PM | Any Red risk |
| Dev team | Daily standup | Daily | Blockers, today's focus | Scrum Master | Unresolved blockers > 4h |
| Stakeholders | Email summary | Weekly | Milestone progress, upcoming landmarks | PM | >10% schedule variance |
