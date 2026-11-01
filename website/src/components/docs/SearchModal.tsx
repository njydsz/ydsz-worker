import { useEffect, useState, useRef } from 'react'

export interface SearchItem {
  id: string
  title: string
  section: string
  sectionGroup: string
}

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
  items: SearchItem[]
  onSelect: (id: string) => void
}

/** 文档搜索弹窗 — Cmd+K 触发 */
export default function SearchModal({ isOpen, onClose, items, onSelect }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // 过滤结果
  const filtered = query.trim()
    ? items.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.section.toLowerCase().includes(query.toLowerCase()) ||
          item.id.toLowerCase().includes(query.toLowerCase())
      )
    : items

  // 重置状态
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // ESC 关闭
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (!isOpen) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, 0))
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        if (filtered[selectedIndex]) {
          onSelect(filtered[selectedIndex].id)
          onClose()
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, filtered, selectedIndex, onSelect, onClose])

  // 滚动选中项到可视区域
  useEffect(() => {
    const el = document.querySelector(`[data-search-index="${selectedIndex}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* 弹窗 */}
      <div className="relative w-full max-w-lg mx-4 bg-ink-800 border border-white/[0.1] rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
        {/* 搜索输入 */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
          <svg className="w-5 h-5 text-yuanbao-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0) }}
            placeholder="搜索文档..."
            className="flex-1 bg-transparent text-white text-base outline-none placeholder:text-white/30"
          />
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.08] text-xs text-white/40 font-mono">
            ESC
          </kbd>
        </div>

        {/* 结果列表 */}
        <div className="max-h-[50vh] overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-white/40">没有找到相关内容</p>
              <p className="text-xs text-white/25 mt-1">试试其他关键词</p>
            </div>
          ) : (
            <ul>
              {filtered.map((item, idx) => (
                <li key={item.id}>
                  <button
                    data-search-index={idx}
                    onClick={() => { onSelect(item.id); onClose() }}
                    className={`w-full text-left px-5 py-3 flex items-start gap-3 transition-colors ${
                      idx === selectedIndex
                        ? 'bg-yuanbao-500/[0.08]'
                        : 'hover:bg-white/[0.03]'
                    }`}
                  >
                    <svg className="w-4 h-4 text-white/25 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white/80 truncate">{item.title}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[11px] text-yuanbao-400/60 font-medium">{item.sectionGroup}</span>
                        <span className="text-[11px] text-white/20">/</span>
                        <span className="text-[11px] text-white/35 truncate">{item.section}</span>
                      </div>
                    </div>
                    {idx === selectedIndex && (
                      <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-[10px] text-white/40 font-mono flex-shrink-0">
                        ↵
                      </kbd>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 底部提示 */}
        <div className="px-5 py-3 border-t border-white/[0.06] flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-[11px] text-white/30">
            <kbd className="px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] font-mono">↑↓</kbd>
            导航
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-white/30">
            <kbd className="px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] font-mono">↵</kbd>
            跳转
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-white/30">
            <kbd className="px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] font-mono">esc</kbd>
            关闭
          </span>
        </div>
      </div>
    </div>
  )
}
