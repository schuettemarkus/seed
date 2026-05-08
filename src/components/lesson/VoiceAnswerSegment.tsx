import { useState, useRef } from 'react'
import { Mic, Square, RotateCcw } from 'lucide-react'

interface Props {
  prompt: string
  onAnswer: (audioBlob: Blob, transcript?: string) => void
}

export function VoiceAnswerSegment({ prompt, onAnswer }: Props) {
  const [recording, setRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [transcript, setTranscript] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      mediaRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioUrl(URL.createObjectURL(blob))

        // Web Speech API transcription is not directly supported from blobs
        // Transcript remains optional — voice recording is the primary artifact

        stream.getTracks().forEach((t) => t.stop())
      }

      recorder.start()
      setRecording(true)
      setAudioUrl(null)
      setTranscript(null)
      setSubmitted(false)
    } catch {
      // Microphone not available — show fallback
      setTranscript('(Microphone not available — try typing your answer instead)')
    }
  }

  function stopRecording() {
    mediaRef.current?.stop()
    setRecording(false)
  }

  function reset() {
    setAudioUrl(null)
    setTranscript(null)
    setSubmitted(false)
  }

  function submit() {
    if (!chunksRef.current.length) return
    const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
    onAnswer(blob, transcript ?? undefined)
    setSubmitted(true)
  }

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-sage">{prompt}</p>

      <div className="flex flex-col items-center py-6">
        {!recording && !audioUrl && (
          <button
            onClick={startRecording}
            className="h-20 w-20 rounded-full bg-sage/10 border-2 border-sage flex items-center justify-center hover:bg-sage/20 transition-colors touch-target"
          >
            <Mic className="h-8 w-8 text-sage" />
          </button>
        )}

        {recording && (
          <button
            onClick={stopRecording}
            className="h-20 w-20 rounded-full bg-terracotta/10 border-2 border-terracotta flex items-center justify-center animate-pulse touch-target"
          >
            <Square className="h-6 w-6 text-terracotta" />
          </button>
        )}

        {audioUrl && !submitted && (
          <div className="space-y-4 w-full max-w-sm">
            <audio src={audioUrl} controls className="w-full" />
            {transcript && (
              <p className="text-sm text-muted italic text-center">"{transcript}"</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={reset}
                className="flex-1 rounded-lg border border-border py-3 text-sm font-medium hover:bg-background transition-colors touch-target flex items-center justify-center gap-2"
              >
                <RotateCcw className="h-4 w-4" /> Try again
              </button>
              <button
                onClick={submit}
                className="flex-1 rounded-lg bg-sage py-3 text-sm font-medium text-white hover:bg-sage-dark transition-colors touch-target"
              >
                Submit answer
              </button>
            </div>
          </div>
        )}

        {submitted && (
          <div className="rounded-lg bg-sage/10 p-4 text-sm text-sage-dark font-medium text-center">
            Answer recorded! Great job sharing your thinking.
          </div>
        )}

        <p className="text-xs text-muted mt-3">
          {recording ? 'Listening... tap the button when you\'re done.' : !audioUrl ? 'Tap the microphone and say your answer out loud.' : ''}
        </p>
      </div>
    </div>
  )
}
