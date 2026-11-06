/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HERO_SCREENSHOT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
