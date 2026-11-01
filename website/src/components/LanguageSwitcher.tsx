import { useLanguage } from '../context/LanguageContext'

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage()

  return (
    <div
      className="flex items-center gap-0.5 p-1 rounded-lg bg-white/[0.04] border border-white/[0.06]"
    >
      <button
        onClick={() => setLocale('zh')}
        className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
          locale === 'zh'
            ? 'bg-white/[0.1] text-white shadow-sm'
            : 'text-white/40 hover:text-white/70'
        }`}
      >
        中
      </button>
      <button
        onClick={() => setLocale('en')}
        className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
          locale === 'en'
            ? 'bg-white/[0.1] text-white shadow-sm'
            : 'text-white/40 hover:text-white/70'
        }`}
      >
        EN
      </button>
    </div>
  )
}
