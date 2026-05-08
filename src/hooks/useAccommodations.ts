import { useMemo } from 'react'
import type { Accommodations } from '@/types'

export function useAccommodations(accommodations: Accommodations | undefined) {
  const classes = useMemo(() => {
    if (!accommodations) return ''
    const list: string[] = []
    if (accommodations.dyslexia_font) list.push('dyslexia-font')
    if (accommodations.reduced_motion) list.push('reduced-motion')
    if (accommodations.larger_text) list.push('larger-text')
    return list.join(' ')
  }, [accommodations])

  return {
    classes,
    dyslexiaFont: accommodations?.dyslexia_font ?? false,
    reducedMotion: accommodations?.reduced_motion ?? false,
    extendedTime: accommodations?.extended_time ?? false,
    largerText: accommodations?.larger_text ?? false,
    shorterBlocks: accommodations?.shorter_blocks ?? false,
    fasterPacing: accommodations?.faster_pacing ?? false,
  }
}
