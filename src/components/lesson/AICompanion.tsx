import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Child } from '@/types'

interface Message {
  role: 'child' | 'companion'
  text: string
}

interface Props {
  child: Child
  lessonContext?: string
}

// Build system prompt for the AI companion — used by /api/claude in production
export function buildCompanionSystemPrompt(child: Child, lessonContext?: string): string {
  const pronouns = child.gender === 'they' ? 'they/them' : child.gender === 'he' ? 'he/him' : 'she/her'
  return `You are Seed's AI Learning Companion — a warm, curious, Socratic guide for a ${child.age}-year-old named ${child.name} (pronouns: ${pronouns}).

CORE RULES:
- ALWAYS ask guiding questions — NEVER give direct answers
- Use age-appropriate language for a ${child.age}-year-old
- Be warm, encouraging, and genuinely curious
- Use ${child.language === 'en' ? 'English' : child.language} for responses
- Honor pronouns: ${pronouns}
- Keep responses short (2-3 sentences max for younger kids, 3-4 for older)

SAFETY GUARDRAILS:
- Never collect or ask for personal information (full name, address, school, etc.)
- If the child shares PII, gently redirect: "That's nice! Let's get back to our learning."
- Refuse off-topic questions kindly: "Great question! But let's focus on what we're learning right now."
- No opinions on contested topics — surface multiple perspectives
- No violence, romantic content, scary imagery
- Honor content axis: ${child.content_axis}

SOCRATIC METHOD:
- When asked "what is X?", respond with "What do you already know about X?" or "Where have you seen X before?"
- When they're stuck, offer a gentle hint, not the answer
- Celebrate thinking, not correctness: "I love how you're thinking about that!"
- Connect new ideas to things they already know

${lessonContext ? `CURRENT LESSON CONTEXT:\n${lessonContext}` : ''}`
}

export function AICompanion({ child, lessonContext }: Props) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'companion', text: `Hi ${child.name}! I'm here if you want to talk about what you're learning. Ask me anything!` },
  ])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    const text = input.trim()
    if (!text || thinking) return

    setInput('')
    setMessages((prev) => [...prev, { role: 'child', text }])
    setThinking(true)

    try {
      // In production, this calls /api/claude with the companion system prompt
      // For now, generate a Socratic placeholder response
      const response = await generateCompanionResponse(child, text, lessonContext)
      setMessages((prev) => [...prev, { role: 'companion', text: response }])
    } catch {
      setMessages((prev) => [...prev, { role: 'companion', text: "Hmm, let me think about that... Could you try asking in a different way?" }])
    }

    setThinking(false)
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-sky shadow-lg flex items-center justify-center hover:bg-sky/90 transition-colors touch-target z-50"
          aria-label="Open AI companion"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 w-80 max-w-[calc(100vw-3rem)] h-[28rem] max-h-[calc(100vh-6rem)] bg-surface rounded-2xl shadow-xl border border-border flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-sky/5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-sky" />
              <span className="text-sm font-medium">Learning Companion</span>
            </div>
            <button onClick={() => setOpen(false)} className="touch-target p-1">
              <X className="h-4 w-4 text-muted" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                  msg.role === 'companion'
                    ? 'bg-sky/10 text-foreground self-start rounded-bl-sm'
                    : 'bg-sage/10 text-foreground self-end ml-auto rounded-br-sm',
                )}
              >
                {msg.text}
              </div>
            ))}
            {thinking && (
              <div className="bg-sky/10 rounded-2xl px-3.5 py-2.5 text-sm text-muted self-start rounded-bl-sm max-w-[85%]">
                Thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-border">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend() }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky"
                disabled={thinking}
              />
              <button
                type="submit"
                disabled={!input.trim() || thinking}
                className="h-9 w-9 rounded-lg bg-sky flex items-center justify-center text-white disabled:opacity-50 touch-target"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

// Placeholder Socratic response generator — replaced by /api/claude in production
async function generateCompanionResponse(child: Child, question: string, _lessonContext?: string): Promise<string> {
  // Simulate a brief delay
  await new Promise((r) => setTimeout(r, 600))

  const age = child.age
  const name = child.name

  // Simple Socratic response patterns
  const questionLower = question.toLowerCase()

  if (questionLower.includes('what is') || questionLower.includes('what are')) {
    return age <= 7
      ? `That's a great question, ${name}! What do you think it might be? Have you seen something like it before?`
      : `Interesting question! Before I share what I know, what's your best guess? What clues do you already have?`
  }

  if (questionLower.includes('why')) {
    return age <= 7
      ? `Ooh, "why" is my favorite kind of question! What do you think the reason might be?`
      : `Love that you're asking why — that's how real scientists think! What reasons can you come up with?`
  }

  if (questionLower.includes('how')) {
    return age <= 7
      ? `Let's figure it out together! What's the first step you'd try?`
      : `Great question! Can you break it down into smaller steps? What would you try first?`
  }

  if (questionLower.includes('help') || questionLower.includes('stuck') || questionLower.includes("don't know")) {
    return age <= 7
      ? `That's okay, ${name}! Let's take it one tiny step at a time. What part do you understand so far?`
      : `Being stuck is actually great — it means you're learning something new! Tell me what you've figured out so far, and we'll work from there.`
  }

  return age <= 7
    ? `I love how curious you are, ${name}! Tell me more about what you're thinking.`
    : `That's interesting! What made you think of that? I'd love to hear your reasoning.`
}
