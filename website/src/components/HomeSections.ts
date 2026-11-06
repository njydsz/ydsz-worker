/**
 * 首页 section 元数据 —— 供 SectionReveal / 浮动目录 / Hero 截图占位共用。
 * 顺序即页面顺序；`id` 必须与各 <section id> 一致。
 */
export interface HomeSectionMeta {
  id: string
  labelKey: string
}

export const HOME_SECTIONS: HomeSectionMeta[] = [
  { id: 'overview', labelKey: 'home.toc.overview' },
  { id: 'channels', labelKey: 'home.toc.channels' },
  { id: 'experts', labelKey: 'home.toc.experts' },
  { id: 'quickstart', labelKey: 'home.toc.quickstart' },
  { id: 'why', labelKey: 'home.toc.why' },
  { id: 'desktop-pet', labelKey: 'home.toc.desktop_pet' },
  { id: 'faq', labelKey: 'home.toc.faq' },
  { id: 'cta', labelKey: 'home.toc.cta' },
]
