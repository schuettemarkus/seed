import { useState } from 'react'
import { Volume2, VolumeX, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { VoiceOption } from '@/hooks/useTextToSpeech'

interface Props {
  speaking: boolean
  available: boolean
  voices: VoiceOption[]
  selectedVoiceURI: string
  onPlay: () => void
  onStop: () => void
  onSelectVoice: (uri: string) => void
}

export function VoicePlayback({
  speaking,
  available,
  voices,
  selectedVoiceURI,
  onPlay,
  onStop,
  onSelectVoice,
}: Props) {
  const [showPicker, setShowPicker] = useState(false)

  if (!available) return null

  return (
    <div className="relative">
      <div className="flex items-center gap-1">
        {/* Play/Stop button */}
        <button
          onClick={speaking ? onStop : onPlay}
          className={cn(
            'h-9 px-3 rounded-xl flex items-center gap-2 text-xs font-medium transition-all duration-200 touch-target',
            speaking
              ? 'bg-sage text-white shadow-sm shadow-sage/20'
              : 'bg-sage/[0.08] text-sage hover:bg-sage/[0.15]',
          )}
        >
          {speaking ? (
            <><VolumeX className="h-3.5 w-3.5" /> Stop</>
          ) : (
            <><Volume2 className="h-3.5 w-3.5" /> Read aloud</>
          )}
        </button>

        {/* Voice picker toggle */}
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="h-9 px-2 rounded-xl bg-sage/[0.08] text-sage hover:bg-sage/[0.15] transition-colors flex items-center gap-1 text-[10px] touch-target"
          title="Change voice"
        >
          <ChevronDown className={cn('h-3 w-3 transition-transform', showPicker && 'rotate-180')} />
        </button>
      </div>

      {/* Voice picker dropdown */}
      {showPicker && (
        <div className="absolute top-11 right-0 z-50 w-64 max-h-48 overflow-y-auto rounded-xl border border-border bg-surface-solid backdrop-blur-xl shadow-lg p-1.5">
          {voices.map((v) => (
            <button
              key={v.voice.voiceURI}
              onClick={() => {
                onSelectVoice(v.voice.voiceURI)
                setShowPicker(false)
              }}
              className={cn(
                'w-full text-left px-3 py-2 rounded-lg text-xs transition-colors',
                v.voice.voiceURI === selectedVoiceURI
                  ? 'bg-sage/10 text-sage font-medium'
                  : 'text-foreground hover:bg-black/[0.04]',
              )}
            >
              {v.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
