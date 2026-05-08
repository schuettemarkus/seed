import type { Language } from '@/types'

export const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'English',
  es: 'Espa\u00f1ol',
  zh: '\u4e2d\u6587',
  fr: 'Fran\u00e7ais',
  de: 'Deutsch',
}

// Placeholder i18n — strings are English-only at MVP
// A real i18n system (e.g. i18next) would replace this in Sprint 2
export function t(key: string): string {
  return key
}
