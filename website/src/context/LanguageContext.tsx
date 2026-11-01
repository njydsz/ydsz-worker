import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { translations, type Locale } from '../i18n/translations'

interface LanguageContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

const STORAGE_KEY = 'ydsz-locale'

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === 'undefined') return 'zh'
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null
    return stored ?? 'zh'
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, locale)
    document.documentElement.setAttribute('lang', locale)
  }, [locale])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
  }, [])

  const t = useCallback(
    (key: string) => {
      const dict = translations[locale] ?? translations.zh
      const fallback = translations.zh
      return (dict[key] ?? fallback[key] ?? key) as string
    },
    [locale],
  )

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
