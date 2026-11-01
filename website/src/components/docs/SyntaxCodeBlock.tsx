import { useState, useCallback } from 'react'

interface SyntaxCodeBlockProps {
  code: string
  language?: string
  title?: string
  showLineNumbers?: boolean
}

/** 简易语法高亮 — 支持 bash/powershell/yaml/python */
function highlightLine(line: string, lang: string): string {
  let result = escapeHtml(line)

  // 注释
  if (lang === 'bash' || lang === 'python' || lang === 'yaml') {
    result = result.replace(/(#.*)$/gm, '<span class="token-comment">$1</span>')
  }

  // 字符串
  result = result.replace(/(&quot;|&#x27;|")(?:[^"\\]|\\.)*?(?:"|&quot;)|('(?:[^'\\]|\\.)*?')/g, (match) => {
    return `<span class="token-string">${match}</span>`
  })

  // bash/powershell 关键字
  if (lang === 'bash' || lang === 'powershell') {
    const keywords = ['pip', 'python', 'python3', 'docker', 'curl', 'uv', 'nohup', 'echo', 'export', 'set', 'mkdir', 'cd', 'sudo']
    for (const kw of keywords) {
      const regex = new RegExp(`\\b(${kw})\\b`, 'g')
      result = result.replace(regex, '<span class="token-keyword">$1</span>')
    }
  }

  if (lang === 'python') {
    const pyKeywords = ['from', 'import', 'def', 'class', 'return', 'if', 'else', 'for', 'in', 'not', 'and', 'or']
    for (const kw of pyKeywords) {
      const regex = new RegExp(`\\b(${kw})\\b`, 'g')
      result = result.replace(regex, '<span class="token-keyword">$1</span>')
    }
  }

  // yaml 键
  if (lang === 'yaml') {
    result = result.replace(/^(\s*)([\w_-]+)(:)/gm, '$1<span class="token-attr">$2</span>$3')
  }

  return result
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/** 精致代码块 — 语法高亮 + 行号 + 复制按钮 */
export default function SyntaxCodeBlock({
  code,
  language = 'bash',
  title,
  showLineNumbers = false,
}: SyntaxCodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const lines = code.split('\n').filter((l, i, arr) => !(i === arr.length - 1 && l.trim() === ''))

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = code
      ta.style.cssText = 'position:fixed;opacity:0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [code])

  return (
    <div className="rounded-xl overflow-hidden border border-white/[0.08] my-5 shadow-lg shadow-black/20">
      {/* 标题栏 */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-ink-800 border-b border-white/[0.06]">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex gap-1.5 flex-shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
          </div>
          {title && (
            <span className="text-xs text-white/40 font-mono truncate">{title}</span>
          )}
          {language && (
            <span className="text-[10px] text-yuanbao-400/50 font-mono uppercase bg-yuanbao-500/8 px-1.5 py-0.5 rounded">
              {language}
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200 flex-shrink-0 ${
            copied
              ? 'text-yuanbao-400 bg-yuanbao-500/10'
              : 'text-white/40 hover:text-white/70 hover:bg-white/[0.06]'
          }`}
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>已复制</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                <path d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>复制</span>
            </>
          )}
        </button>
      </div>

      {/* 代码区 */}
      <div className="bg-ink-900/80 overflow-x-auto">
        <pre className="p-4 text-[13px] leading-[1.7]">
          <code>
            {lines.map((line, i) => (
              <div key={i} className="code-line-row flex hover:bg-white/[0.02] transition-colors">
                {showLineNumbers && (
                  <span className="code-line-number inline-block w-8 text-right mr-4 text-white/20 select-none flex-shrink-0">
                    {i + 1}
                  </span>
                )}
                <span
                  className="text-white/75 flex-1 min-w-0"
                  dangerouslySetInnerHTML={{ __html: highlightLine(line, language) || '&nbsp;' }}
                />
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  )
}
