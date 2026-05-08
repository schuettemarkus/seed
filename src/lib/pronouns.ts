import type { Gender } from '@/types'

interface PronounSet {
  subject: string
  object: string
  possessive: string
  possessivePronoun: string
  reflexive: string
}

const PRONOUN_MAP: Record<Gender, PronounSet> = {
  he: { subject: 'he', object: 'him', possessive: 'his', possessivePronoun: 'his', reflexive: 'himself' },
  she: { subject: 'she', object: 'her', possessive: 'her', possessivePronoun: 'hers', reflexive: 'herself' },
  they: { subject: 'they', object: 'them', possessive: 'their', possessivePronoun: 'theirs', reflexive: 'themself' },
}

export function getPronouns(gender: Gender): PronounSet {
  return PRONOUN_MAP[gender]
}
