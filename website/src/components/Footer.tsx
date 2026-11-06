import { Link } from 'react-router-dom'

const FOOTER_LINKS = {
  产品: [
    { label: '概览', href: '/' },
    { label: '市场生态', href: '/marketplace' },
    { label: '更新日志', href: '/changelog' },
    { label: '产品文档', href: '/docs' },
  ],
  资源: [
    { label: '产品文档', href: '/docs' },
    { label: 'API 参考', href: 'https://github.com/ydsz-buddy/ydsz-worker/blob/main/docs/api.md' },
    { label: '架构设计', href: 'https://github.com/ydsz-buddy/ydsz-worker/blob/main/docs/architecture.md' },
    { label: '示例项目', href: 'https://github.com/ydsz-buddy/ydsz-worker/tree/main/examples' },
  ],
  社区: [
    { label: 'GitHub', href: 'https://github.com/ydsz-buddy/ydsz-worker' },
    { label: '问题反馈', href: 'https://github.com/ydsz-buddy/ydsz-worker/issues' },
    { label: '贡献指南', href: 'https://github.com/ydsz-buddy/ydsz-worker/blob/main/CONTRIBUTING.md' },
    { label: '贡献季', href: '/contribute' },
  ],
  'IM 通道': [
    { label: '飞书', href: '#' },
    { label: '钉钉', href: '#' },
    { label: '企业微信', href: '#' },
    { label: 'Telegram', href: '#' },
  ],
}

const SOCIAL_LINKS = [
  {
    label: 'GitHub',
    href: 'https://github.com/ydsz-buddy/ydsz-worker',
    icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>,
  },
  {
    label: '微信',
    href: '#',
    icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18z" /></svg>,
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] pt-16 pb-8 mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <img src="/logo-appicon.png" alt="Ydsz Worker" className="h-7 w-7 rounded-lg" />
              <span className="text-base font-bold text-white">云顶数字工作台</span>
            </Link>
            <p className="text-sm text-white/40 leading-relaxed mb-4">
              会思考，能干活，<br />
              陪企业成长的智能伙伴。
            </p>
            <div className="flex gap-2">
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/50 hover:text-white hover:border-yuanbao-500/30 transition-all"
                  title={link.label}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link groups */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-white/70 mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('#')
                      ? <span className="text-sm text-white/40">{link.label}</span>
                      : link.href.startsWith('/')
                        ? (
                          <Link
                            to={link.href}
                            className="text-sm text-white/40 hover:text-yuanbao-400 transition-colors"
                          >
                            {link.label}
                          </Link>
                        )
                        : (
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-white/40 hover:text-yuanbao-400 transition-colors"
                          >
                            {link.label}
                          </a>
                        )
                    }
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            Copyleft &copy; {new Date().getFullYear()} 南京云顶数字科技有限公司. MIT License.
          </p>
          <p className="text-xs text-white/20">
            Built with ❤️ for the open-source community
          </p>
        </div>
      </div>
    </footer>
  )
}
