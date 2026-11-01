import { useEffect } from 'react'

export default function DocsRedirect() {
  useEffect(() => {
    window.location.href = 'https://gitee.com/njydsz/ydsz-worker/blob/main/docs'
  }, [])

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <p className="text-white/60 text-lg mb-4">正在跳转到文档站...</p>
        <a
          href="https://gitee.com/njydsz/ydsz-worker/blob/main/docs"
          className="text-yuanbao-400 hover:text-yuanbao-300 underline underline-offset-4"
        >
          如果没有自动跳转，请点击这里
        </a>
      </div>
    </div>
  )
}
