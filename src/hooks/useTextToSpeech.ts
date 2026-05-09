import { useState, useEffect, useCallback, useRef } from 'react'

export interface VoiceOption {
  voice: SpeechSynthesisVoice
  label: string
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

      // Filter to English voices, prefer high-quality ones
      const english = allVoices
        .filter((v) => v.lang.startsWith('en'))
        .map((v) => ({
          voice: v,
          label: v.name.replace(/\(.*\)/, '').trim() + (v.localService ? '' : ' (Online)'),
        }))
        .sort((a, b) => {
          // Prefer female voices first
          const aFemale = /female|samantha|karen|victoria|zira|susan|fiona|moira|tessa/i.test(a.voice.name)
          const bFemale = /female|samantha|karen|victoria|zira|susan|fiona|moira|tessa/i.test(b.voice.name)
          if (aFemale && !bFemale) return -1
          if (!aFemale && bFemale) return 1
          // Then prefer online/premium voices
          if (!a.voice.localService && b.voice.localService) return -1
          if (a.voice.localService && !b.voice.localService) return 1
          return a.voice.name.localeCompare(b.voice.name)
        })

      setVoices(english)

      // Auto-select a friendly female voice
      const saved = localStorage.getItem('seed-voice-uri')
      if (saved && english.some((v) => v.voice.voiceURI === saved)) {
        setSelectedVoiceURI(saved)
      } else {
        // Find best default: Samantha, Karen, or first female-sounding voice
        const preferred = english.find((v) =>
          /samantha|karen|victoria|fiona|tessa/i.test(v.voice.name),
        ) ?? english[0]
        if (preferred) setSelectedVoiceURI(preferred.voice.voiceURI)
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
    utterance.rate = 0.92
    utterance.pitch = 1.05
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
