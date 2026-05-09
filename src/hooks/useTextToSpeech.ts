import { useState, useEffect, useCallback, useRef } from 'react'

export interface VoiceOption {
  voice: SpeechSynthesisVoice
  label: string
}

// Modern neural / premium voice patterns — these sound closest to ChatGPT / Alexa
const PREMIUM_PATTERNS = [
  /\bpremium\b/i,
  /\benhanced\b/i,
  /\bneural\b/i,
  /\bnatural\b/i,
  /\bsiri\b/i,
]

// Friendly, warm female voices to prefer (ordered by quality)
const PREFERRED_VOICES = [
  // Apple neural (macOS 13+ / iOS 16+)
  /^siri/i,
  // Google cloud voices (Chrome)
  /^google\b.*\bfemale\b/i,
  /^google\b.*\bus\b/i,
  // Microsoft neural (Edge)
  /^microsoft\b.*\baria\b/i,
  /^microsoft\b.*\bjenny\b/i,
  /^microsoft\b.*\bmichelle\b/i,
  // Apple premium voices
  /\bsamantha\b.*\bpremium\b/i,
  /\bsamantha\b.*\benhanced\b/i,
  // Good fallbacks
  /\bsamantha\b/i,
  /\bkaren\b/i,
  /\bvictoria\b/i,
  /\bfiona\b/i,
  /\btessa\b/i,
]

function voiceScore(v: SpeechSynthesisVoice): number {
  let score = 0
  const name = v.name

  // Cloud / premium voices are almost always higher quality
  if (!v.localService) score += 50

  // Match against premium quality indicators
  for (const pat of PREMIUM_PATTERNS) {
    if (pat.test(name)) { score += 40; break }
  }

  // Match against preferred voice names (earlier = higher score)
  for (let i = 0; i < PREFERRED_VOICES.length; i++) {
    if (PREFERRED_VOICES[i].test(name)) {
      score += 30 - i // earlier in list = higher score
      break
    }
  }

  // Slight bonus for female-sounding names
  if (/female|samantha|karen|victoria|fiona|tessa|jenny|aria|siri|zira|susan|moira/i.test(name)) {
    score += 5
  }

  return score
}

export function useTextToSpeech() {
  const [voices, setVoices] = useState<VoiceOption[]>([])
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('')
  const [speaking, setSpeaking] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Load voices — they load async in some browsers
  useEffect(() => {
    function loadVoices() {
      const allVoices = speechSynthesis.getVoices()
      if (allVoices.length === 0) return

      // Filter to English voices, sort by quality score
      const english = allVoices
        .filter((v) => v.lang.startsWith('en'))
        .map((v) => ({
          voice: v,
          label: v.name.replace(/\(.*\)/, '').trim() + (v.localService ? '' : ' (Cloud)'),
          score: voiceScore(v),
        }))
        .sort((a, b) => b.score - a.score)
        .map(({ voice, label }) => ({ voice, label }))

      setVoices(english)

      // Auto-select the best available voice
      const saved = localStorage.getItem('seed-voice-uri')
      if (saved && english.some((v) => v.voice.voiceURI === saved)) {
        setSelectedVoiceURI(saved)
      } else {
        // First voice is already the best scored
        if (english[0]) setSelectedVoiceURI(english[0].voice.voiceURI)
      }
    }

    loadVoices()
    speechSynthesis.addEventListener('voiceschanged', loadVoices)
    return () => speechSynthesis.removeEventListener('voiceschanged', loadVoices)
  }, [])

  const selectVoice = useCallback((uri: string) => {
    setSelectedVoiceURI(uri)
    localStorage.setItem('seed-voice-uri', uri)
  }, [])

  const speak = useCallback((text: string) => {
    // Stop any current speech
    speechSynthesis.cancel()

    const voice = voices.find((v) => v.voice.voiceURI === selectedVoiceURI)?.voice
    if (!voice) return

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.voice = voice

    // Tune for a warm, conversational tone — closer to Alexa / ChatGPT pacing
    const isCloudVoice = !voice.localService
    utterance.rate = isCloudVoice ? 1.0 : 0.95   // cloud voices handle normal speed well
    utterance.pitch = isCloudVoice ? 1.0 : 1.02   // minimal pitch shift for natural sound

    utterance.onstart = () => setSpeaking(true)
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)

    utteranceRef.current = utterance
    speechSynthesis.speak(utterance)
  }, [voices, selectedVoiceURI])

  const stop = useCallback(() => {
    speechSynthesis.cancel()
    setSpeaking(false)
  }, [])

  return {
    voices,
    selectedVoiceURI,
    selectVoice,
    speak,
    stop,
    speaking,
    available: voices.length > 0,
  }
}
