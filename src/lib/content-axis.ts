import type { ContentAxis } from '@/types'

export const CONTENT_AXIS_LABELS: Record<ContentAxis, string> = {
  secular: 'Secular',
  faith_neutral: 'Faith-neutral',
  christian: 'Christian',
  lds: 'Latter-day Saint',
  jewish: 'Jewish',
  other: 'Other / Custom',
}

export const CONTENT_AXIS_DESCRIPTIONS: Record<ContentAxis, string> = {
  secular:
    'Standard scientific consensus. Holidays from a cultural lens. Broad reading canon.',
  faith_neutral:
    'Avoids creation/origin claims either direction. Diverse reading lists. World cultures.',
  christian:
    'Bible-integrated history and reading. Science presents consensus and Christian framings respectfully.',
  lds:
    'Christian framing plus LDS-specific history and Book of Mormon cultural context.',
  jewish:
    'Tanakh-integrated history and reading. Hebrew calendar and holidays. Diaspora history emphasis.',
  other:
    'Parent-supplied notes inform lesson generation.',
}
