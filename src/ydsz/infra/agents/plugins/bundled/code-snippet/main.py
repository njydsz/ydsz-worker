"""Quick-access codebase of common code snippets."""

from __future__ import annotations

import json
import re
from typing import Any

from ydsz_harness.plugins import PluginContext


def _payload(data: dict[str, Any], text: str) -> str:
    return json.dumps(
        {"ydsz_ui": {"renderer": "code_snippet", "version": 1}, "data": data, "text": text},
        ensure_ascii=False,
    )


# ---------------------------------------------------------------------------
# Snippet database
# ---------------------------------------------------------------------------

_SNIPPETS: dict[str, list[dict[str, str]]] = {
    "python": [
        {
            "title": "读取文件",
            "code": 'with open("file.txt", "r", encoding="utf-8") as f:\n    content = f.read()',
            "tags": ["file", "read", "io"],
        },
        {
            "title": "写入文件",
            "code": 'with open("file.txt", "w", encoding="utf-8") as f:\n    f.write("Hello, World!")',
            "tags": ["file", "write", "io"],
        },
        {
            "title": "HTTP 请求 (requests)",
            "code": 'import requests\n\nresp = requests.get("https://api.example.com/data", timeout=10)\nresp.raise_for_status()\ndata = resp.json()',
            "tags": ["http", "request", "api"],
        },
        {
            "title": "异步 HTTP (httpx)",
            "code": 'import httpx\n\nasync with httpx.AsyncClient() as client:\n    resp = await client.get("https://api.example.com/data")\n    data = resp.json()',
            "tags": ["http", "async", "api"],
        },
        {
            "title": "环境变量",
            "code": 'import os\n\nvalue = os.environ.get("MY_VAR", "default")',
            "tags": ["env", "config"],
        },
        {
            "title": "正则匹配",
            "code": 'import re\n\npattern = r"\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b"\nmatches = re.findall(pattern, text)',
            "tags": ["regex", "string", "pattern"],
        },
        {
            "title": "JSON 读写",
            "code": 'import json\n\n# 写入\nwith open("data.json", "w") as f:\n    json.dump(obj, f, indent=2, ensure_ascii=False)\n\n# 读取\nwith open("data.json") as f:\n    obj = json.load(f)',
            "tags": ["json", "file", "serialize"],
        },
        {
            "title": " Dataclass 定义",
            "code": 'from dataclasses import dataclass, field\n\n@dataclass\nclass User:\n    name: str\n    age: int = 0\n    tags: list[str] = field(default_factory=list)',
            "tags": ["dataclass", "class", "model"],
        },
    ],
    "javascript": [
        {
            "title": "Fetch JSON",
            "code": 'const resp = await fetch("/api/data", {\n  headers: { "Content-Type": "application/json" },\n});\nconst data = await resp.json();',
            "tags": ["http", "fetch", "async"],
        },
        {
            "title": "防抖函数",
            "code": "function debounce(fn, delay = 300) {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), delay);\n  };\n}",
            "tags": ["debounce", "utility", "timer"],
        },
        {
            "title": "深拷贝",
            "code": "const deepClone = (obj) => {\n  if (obj === null || typeof obj !== 'object') return obj;\n  if (Array.isArray(obj)) return obj.map(deepClone);\n  return Object.fromEntries(\n    Object.entries(obj).map(([k, v]) => [k, deepClone(v)])\n  );\n};",
            "tags": ["clone", "object", "utility"],
        },
        {
            "title": "LocalStorage 封装",
            "code": "const storage = {\n  get(key) {\n    try { return JSON.parse(localStorage.getItem(key)); }\n    catch { return null; }\n  },\n  set(key, val) { localStorage.setItem(key, JSON.stringify(val)); },\n  remove(key) { localStorage.removeItem(key); },\n};",
            "tags": ["storage", "localstorage", "browser"],
        },
        {
            "title": "日期格式化",
            "code": 'function formatDate(date, fmt = "YYYY-MM-DD") {\n  const d = new Date(date);\n  const pad = (n) => String(n).padStart(2, "0");\n  return fmt\n    .replace("YYYY", d.getFullYear())\n    .replace("MM", pad(d.getMonth() + 1))\n    .replace("DD", pad(d.getDate()));\n}',
            "tags": ["date", "format", "utility"],
        },
    ],
    "shell": [
        {
            "title": "遍历文件",
            "code": 'for f in *.txt; do\n  echo "Processing $f"\ndone',
            "tags": ["loop", "file", "batch"],
        },
        {
            "title": "检查进程",
            "code": 'if pgrep -f "myapp" > /dev/null; then\n  echo "Running"\nelse\n  echo "Not running"\nfi',
            "tags": ["process", "check", "daemon"],
        },
        {
            "title": "端口占用检查",
            "code": "lsof -i :8080\n# 或\nnetstat -tlnp | grep 8080",
            "tags": ["port", "network", "debug"],
        },
        {
            "title": "文件大小排序",
            "code": "du -sh * | sort -rh | head -20",
            "tags": ["disk", "sort", "space"],
        },
        {
            "title": "日志实时监控",
            "code": "tail -f /var/log/app/error.log | grep --line-buffered 'ERROR'",
            "tags": ["log", "monitor", "tail"],
        },
    ],
    "git": [
        {
            "title": "撤销上次提交",
            "code": "git reset --soft HEAD~1\n# 保留改动，撤销 commit",
            "tags": ["reset", "undo", "commit"],
        },
        {
            "title": "交互式 rebase",
            "code": "git rebase -i HEAD~3\n# pick / squash / reword / drop",
            "tags": ["rebase", "history", "cleanup"],
        },
        {
            "title": "暂存当前改动",
            "code": "git stash push -m \"wip: feature xyz\"\n# 恢复\ngit stash pop",
            "tags": ["stash", "save", "branch"],
        },
        {
            "title": "查看某文件历史",
            "code": 'git log --oneline -- path/to/file\ngit show HEAD~2:path/to/file',
            "tags": ["log", "history", "file"],
        },
        {
            "title": "Cherry-pick 提交",
            "code": "git cherry-pick abc1234",
            "tags": ["cherry-pick", "branch"],
        },
    ],
    "sql": [
        {
            "title": "查询与分页",
            "code": "SELECT id, name, created_at\nFROM users\nWHERE status = 'active'\nORDER BY created_at DESC\nLIMIT 20 OFFSET 0;",
            "tags": ["select", "paginate", "query"],
        },
        {
            "title": "分组聚合",
            "code": "SELECT department, COUNT(*) AS total, AVG(salary) AS avg_sal\nFROM employees\nGROUP BY department\nHAVING COUNT(*) > 5\nORDER BY total DESC;",
            "tags": ["group", "aggregate", "stats"],
        },
        {
            "title": "插入或更新 (UPSERT)",
            "code": "-- PostgreSQL\nINSERT INTO users (id, name, email)\nVALUES (1, 'Alice', 'alice@example.com')\nON CONFLICT (id) DO UPDATE\n  SET name = EXCLUDED.name, email = EXCLUDED.email;",
            "tags": ["upsert", "insert", "update"],
        },
        {
            "title": "窗口函数排名",
            "code": "SELECT name, department, salary,\n       RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS dept_rank\nFROM employees;",
            "tags": ["window", "rank", "analytics"],
        },
    ],
    "docker": [
        {
            "title": "构建与运行",
            "code": "docker build -t myapp:latest .\ndocker run -d --name myapp -p 8080:8080 myapp:latest",
            "tags": ["build", "run", "container"],
        },
        {
            "title": "查看日志",
            "code": "docker logs -f --tail 100 myapp",
            "tags": ["log", "debug"],
        },
        {
            "title": "清理资源",
            "code": "docker system prune -af\n# 清理无用镜像、容器、网络、build cache",
            "tags": ["cleanup", "prune", "disk"],
        },
        {
            "title": "Dockerfile 多阶段构建",
            "code": "FROM node:20-alpine AS build\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --production\nCOPY . .\nRUN npm run build\n\nFROM nginx:alpine\nCOPY --from=build /app/dist /usr/share/nginx/html",
            "tags": ["dockerfile", "multi-stage", "nginx"],
        },
    ],
    "react": [
        {
            "title": "useState 计数器",
            "code": "const [count, setCount] = useState(0);\nconst increment = () => setCount((c) => c + 1);",
            "tags": ["state", "counter", "hooks"],
        },
        {
            "title": "useEffect 请求数据",
            "code": "useEffect(() => {\n  let cancelled = false;\n  fetchData().then((data) => {\n    if (!cancelled) setData(data);\n  });\n  return () => { cancelled = true; };\n}, [id]);",
            "tags": ["effect", "fetch", "hooks"],
        },
        {
            "title": "自定义 Hook — useDebounce",
            "code": "function useDebounce(value, delay = 300) {\n  const [debounced, setDebounced] = useState(value);\n  useEffect(() => {\n    const timer = setTimeout(() => setDebounced(value), delay);\n    return () => clearTimeout(timer);\n  }, [value, delay]);\n  return debounced;\n}",
            "tags": ["debounce", "hook", "custom"],
        },
        {
            "title": "Context Provider",
            "code": "const ThemeContext = createContext('light');\n\nexport function ThemeProvider({ children }) {\n  const [theme, setTheme] = useState('light');\n  return (\n    <ThemeContext.Provider value={{ theme, setTheme }}>\n      {children}\n    </ThemeContext.Provider>\n  );\n}",
            "tags": ["context", "provider", "theme"],
        },
    ],
}

_SUPPORTED = list(_SNIPPETS.keys())


async def search_snippets(language: str, keyword: str = "") -> str:
    """搜索代码片段。

    language 可选 python/javascript/shell/git/sql/docker/react，
    keyword 为功能关键词如 "read file"。返回匹配的 snippet 列表。
    """
    lang = (language or "").strip().lower()
    if lang not in _SUPPORTED:
        supported = "、".join(_SUPPORTED)
        return _payload(
            {
                "error": "unsupported_language",
                "language": lang,
                "supported": _SUPPORTED,
                "keyword": keyword,
                "snippets": [],
            },
            f"暂不支持语言「{lang}」。支持的语言：{supported}。",
        )

    kw = (keyword or "").strip().lower()
    pool = _SNIPPETS[lang]

    if not kw:
        matched = pool
    else:
        matched = []
        for snip in pool:
            haystack = f"{snip['title']} {snip['code']} {' '.join(snip['tags'])}".lower()
            if kw in haystack or any(kw in tag for tag in snip["tags"]):
                matched.append(snip)

    snip_text = "、".join(s["title"] for s in matched[:5])
    suffix = f"（前 5 项：{snip_text}）" if snip_text else "（无匹配结果）"
    return _payload(
        {
            "language": lang,
            "keyword": keyword,
            "snippets": matched,
        },
        f"在 {lang} 中找到 {len(matched)} 条匹配片段{suffix}。",
    )


def setup(ctx: PluginContext) -> None:
    ctx.tool(
        "search_snippets",
        search_snippets,
        description="按语言和关键词搜索代码片段，可选语言：python/javascript/shell/git/sql/docker/react。",
    )
