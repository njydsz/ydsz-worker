---
name: doc-standards
description: Comprehensive documentation writing standards — Diátaxis four-quadrant framework, Google Developer Documentation Style Guide rules, API reference template (endpoint/method/request/response/examples/errors), ADR template (status/context/decision/consequences), Release Notes template, and a 12-item readability self-check checklist. Use when writing or reviewing any form of technical documentation.
argument-hint: "<documentation type or text to review>"
---

# /doc-standards

Documentation writing and review standards handbook.

## Usage

```
/doc-standards $ARGUMENTS
```

## What's Inside

### 1. Diátaxis Framework — Four Quadrants

| Quadrant | Purpose | Writing Mode | Question Answered |
|----------|---------|--------------|-------------------|
| **Tutorial** | Lead a newcomer through a hands-on exercise | Learning-oriented | "Can I try it?" |
| **How-to Guide** | Solve a specific real-world problem | Goal-oriented | "How do I …?" |
| **Reference** | Describe the machinery precisely | Information-oriented | "What is …?" |
| **Explanation** | Clarify and illuminate a concept | Understanding-oriented | "Why …?" |

**Rule:** Never mix quadrants. A how-to with too long an explanation → split the explanation into its own page.

### 2. Google Developer Documentation Style — Core Rules

| Rule | Directive |
|------|-----------|
| **Voice** | Use second person ("you"). Address the reader directly. |
| **Tone** | Conversational but professional. Not formal, not chatty. |
| **Active voice** | "The system sends a notification" not "A notification is sent". |
| **Sentence length** | Average ≤ 25 words / sentence. Break anything longer. |
| **Jargon** | Define on first use. Avoid if a simpler word works. |
| **Lists** | Bulleted for unordered, numbered for sequences. |
| **Code comments** | Explain why, not what. Assume the reader can read code. |
| **Tense** | Present tense unless past/future is specifically needed. |

### 3. API Reference Template

```markdown
# [Endpoint Name]

`POST /api/v1/{resource}/{id}`

[Brief one-sentence description of what it does.]

## Request

### Path Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| id | string | yes | ... |

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| ... | ... | ... | ... |

## Response

### Success (200)
```json
{ ... }
```

### Error Codes
| Code | Meaning | Resolution |
|------|---------|------------|
| 400 | Bad Request | Check required fields |
| 404 | Not Found | Verify the resource ID |
| 500 | Server Error | Retry with exponential backoff |
```

### 4. ADR Template

```markdown
# ADR-[number]: [Title]

**Status:** Proposed | Accepted | Deprecated | Superseded
**Date:** YYYY-MM-DD
**Deciders:** [Who needs to sign off]

## Context
[What is the situation? What forces are at play? Key constraints and assumptions.]

## Decision
[What is we're proposing? State clearly and in active voice.]

## Options Considered

### Option A: [Name]
- Complexity: Low / Med / High
- Pros: ...
- Cons: ...

### Option B: [Name]
[same structure]

## Consequences
- What becomes easier: ...
- What becomes harder: ...
- What we must revisit later: ...
```

### 5. Release Notes Template

```markdown
# [Product Name] v[X.Y.Z] — YYYY-MM-DD

## Highlights (3–5 bullets, user-facing value)

## Breaking Changes
| Change | Migration |
|--------|-----------|
| ... | ... steps ... |

## Deprecated
| Feature | Removal Version | Alternative |
|---------|----------------|-------------|
| ... | ... | ... |

## New Features

## Bug Fixes

## Known Issues
```

### 6. Readability Self-Check (12 Items)

| # | Check | Pass |
|---|-------|------|
| 1 | Every paragraph has one clear purpose | ☐ |
| 2 | Average sentence length ≤ 25 words | ☐ |
| 3 | No passive voice (unless actor is unknown) | ☐ |
| 4 | Technical terms defined on first use | ☐ |
| 5 | Numbered lists for sequences, bulleted for items | ☐ |
| 6 | Code blocks have language tags and context | ☐ |
| 7 | No dangling "this" or "it" (antecedent is clear) | ☐ |
| 8 | Headings alone tell the story (table of contents scan) | ☐ |
| 9 | Warning / Note / Info callouts follow visual conventions | ☐ |
| 10 | No duplicate information across pages | ☐ |
| 11 | Links work and link text describes the destination | ☐ |
| 12 | Document passes a 30-second skim test | ☐ |

**Scoring:** 10–12 = Excellent, publish-ready / 7–9 = Good with minor fixes / 4–6 = Needs revision / ≤3 = Rewrite required.

### 7. Callout Conventions

| Type | Color | Prefix | Use When |
|------|-------|--------|----------|
| **Note** | Blue | `> **Note:**` | Supplementary info that's useful but not blocking |
| **Warning** | Red | `> **Warning:**` | Data loss, security, or irreversible action |
| **Tip** | Green | `> **Tip:**` | Shortcut or best-practice recommendation |
| **Info** | Gray | `> **Info:**` | Version requirement, compatibility note |
