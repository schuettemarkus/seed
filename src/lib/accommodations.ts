import type { Accommodations } from '@/types'

export const DEFAULT_ACCOMMODATIONS: Accommodations = {
  dyslexia_font: false,
  reduced_motion: false,
  extended_time: false,
  larger_text: false,
  shorter_blocks: false,
  faster_pacing: false,
}

export const ACCOMMODATION_LABELS: Record<keyof Accommodations, string> = {
  dyslexia_font: 'Dyslexia-friendly font',
  reduced_motion: 'Reduced motion',
  extended_time: 'Extended time',
  larger_text: 'Larger text',
  shorter_blocks: 'Shorter blocks (ADHD)',
  faster_pacing: 'Faster pacing (gifted)',
}

export const ACCOMMODATION_DESCRIPTIONS: Record<keyof Accommodations, string> = {
  dyslexia_font: 'Uses OpenDyslexic font for all lesson body text',
  reduced_motion: 'Disables all animations beyond simple fades',
  extended_time: 'Adds 50% more time to any timed exercise',
  larger_text: 'Increases body text by 2 sizes',
  shorter_blocks: 'Reduces lesson length by 30%',
  faster_pacing: 'Skips intro recaps, surfaces challenge variants',
}
