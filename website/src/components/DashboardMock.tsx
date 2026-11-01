/**
 * DashboardMock — 模拟 Ydsz Worker Dashboard 界面的纯视觉组件
 * 用于 Hero / Features 区域的展示，无实际功能
 */
export default function DashboardMock() {
  return (
    <div className="w-full h-full flex rounded-xl overflow-hidden bg-ink-900 border border-white/[0.08] shadow-2xl shadow-yuanbao-500/5">
      {/* ── 左侧栏 ── */}
      <aside className="w-14 sm:w-16 bg-ink-900 border-r border-white/[0.06] flex flex-col items-center py-4 gap-3 flex-shrink-0">
        {/* Logo */}
        <div className="w-8 h-8 rounded-lg bg-yuanbao-500 flex items-center justify-center text-ink-900 font-bold text-sm flex-shrink-0">
          Y
        </div>
        <div className="w-8 h-px bg-white/[0.06] my-1" />
        {/* 导航图标 */}
        {[
          // 对话
          <svg key="chat" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
          // 专家
          <svg key="expert" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
          // 插件
          <svg key="plug" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>,
          // 定时任务
          <svg key="cron" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
          // 设置
          <svg key="gear" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
        ].map((icon, i) => (
          <button
            key={i}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
              i === 0
                ? 'bg-yuanbao-500/15 text-yuanbao-400'
                : 'text-white/30 hover:text-white/60 hover:bg-white/[0.04]'
            }`}
          >
            {icon}
          </button>
        ))}
        {/* 底部占位 */}
        <div className="flex-1" />
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yuanbao-400 to-yuanbao-600 flex items-center justify-center text-[10px] text-ink-900 font-bold">
          U
        </div>
      </aside>

      {/* ── 主区域 ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶部栏 */}
        <div className="h-12 border-b border-white/[0.06] flex items-center px-4 gap-3 flex-shrink-0">
          <span className="text-sm text-white/80 font-medium truncate">新会话</span>
          <span className="text-xs text-white/30">·</span>
          <span className="text-xs text-yuanbao-400">Code Expert</span>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yuanbao-500/10 text-yuanbao-400 text-[10px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-yuanbao-400" />
              在线
            </span>
          </div>
        </div>

        {/* 对话区域 */}
        <div className="flex-1 flex min-h-0">
          {/* 聊天内容 */}
          <div className="flex-1 flex flex-col p-4 gap-4 min-w-0 overflow-hidden">
            {/* 用户消息气泡 */}
            <div className="flex justify-end">
              <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-tr-md bg-yuanbao-500/15 border border-yuanbao-500/20">
                <p className="text-sm text-white/90 leading-relaxed">
                  帮我写一个 Python FastAPI 接口，实现用户注册和 JWT 认证
                </p>
              </div>
            </div>

            {/* AI 回复气泡 */}
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-lg bg-yuanbao-500 flex items-center justify-center text-ink-900 text-xs font-bold flex-shrink-0">
                A
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-medium text-yuanbao-400">Code Expert</span>
                  <span className="text-[10px] text-white/25">刚刚</span>
                </div>
                <div className="code-block divide-y divide-white/[0.04]">
                  <div className="code-line"><span className="code-prompt">$</span><span className="code-cmd">pip install fastapi python-jose[cryptography] passlib[bcrypt]</span></div>
                  <div className="code-line"><span className="code-comment"># main.py</span></div>
                  <div className="code-line"><span className="code-prompt">›</span><span className="code-cmd">from fastapi import FastAPI, Depends, HTTPException</span></div>
                  <div className="code-line"><span className="code-prompt">›</span><span className="code-cmd">from jose import JWTError, jwt</span></div>
                  <div className="code-line"><span className="code-prompt">›</span><span className="code-cmd">from passlib.context import CryptContext</span></div>
                  <div className="code-line pl-8"><span className="code-comment"># ... 安全且高效 ✨</span></div>
                </div>
              </div>
            </div>

            {/* 第二条用户消息 */}
            <div className="flex justify-end">
              <div className="max-w-[70%] px-4 py-2.5 rounded-2xl rounded-tr-md bg-yuanbao-500/10 border border-yuanbao-500/15">
                <p className="text-sm text-white/80 leading-relaxed">
                  能加上密码强度校验吗？
                </p>
              </div>
            </div>

            {/* 正在输入指示 */}
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-lg bg-yuanbao-500/80 flex items-center justify-center text-ink-900 text-xs font-bold flex-shrink-0">
                A
              </div>
              <div className="flex items-center gap-1.5 py-2">
                <span className="w-2 h-2 rounded-full bg-yuanbao-400/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-yuanbao-400/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-yuanbao-400/60 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>

          {/* 右侧文件/代码面板 */}
          <div className="hidden sm:flex w-56 lg:w-64 border-l border-white/[0.06] flex-col flex-shrink-0">
            <div className="px-4 py-3 border-b border-white/[0.06]">
              <span className="text-xs font-medium text-white/50 uppercase tracking-wider">文件面板</span>
            </div>
            <div className="flex-1 p-3 space-y-1 overflow-hidden">
              {[
                { name: 'main.py', active: true },
                { name: 'auth.py', active: false },
                { name: 'models.py', active: false },
                { name: 'schemas.py', active: false },
                { name: 'requirements.txt', active: false },
              ].map((file) => (
                <div
                  key={file.name}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs cursor-default ${
                    file.active
                      ? 'bg-yuanbao-500/10 text-yuanbao-400'
                      : 'text-white/40 hover:bg-white/[0.03]'
                  }`}
                >
                  <svg className="w-3.5 h-3.5 flex-shrink-0 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                  </svg>
                  <span className="truncate">{file.name}</span>
                </div>
              ))}
            </div>
            {/* 底部代码预览 */}
            <div className="border-t border-white/[0.06] p-3">
              <div className="text-[10px] text-white/25 mb-2 uppercase tracking-wider">终端预览</div>
              <div className="bg-ink-900 rounded-lg p-2.5 font-mono text-[10px] leading-relaxed space-y-0.5">
                <div><span className="text-yuanbao-500">$</span> <span className="text-white/60">uv run uvicorn main:app</span></div>
                <div className="text-white/30">INFO: Uvicorn running on <span className="text-yellow-300/70">http://0.0.0.0:8000</span></div>
                <div className="text-yuanbao-400/60">✓ 就绪，等待连接…</div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部输入框 */}
        <div className="p-4 border-t border-white/[0.06] flex-shrink-0">
          <div className="flex items-center gap-3 px-4 py-3 bg-ink-800/60 rounded-xl border border-white/[0.08] focus-within:border-yuanbao-500/40 transition-colors shadow-lg shadow-yuanbao-500/[0.03]">
            <svg className="w-4 h-4 text-white/30 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm text-white/25 flex-1 truncate">输入消息或 / 选择指令…</span>
            <button className="w-7 h-7 rounded-lg bg-yuanbao-500 hover:bg-yuanbao-400 flex items-center justify-center transition-colors flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-ink-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
