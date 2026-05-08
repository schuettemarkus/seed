import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useChild } from '@/hooks/useChild'
import { supabase } from '@/lib/supabase'
import { buildConsentRecord } from '@/lib/coppa'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { CONTENT_AXIS_LABELS, CONTENT_AXIS_DESCRIPTIONS } from '@/lib/content-axis'
import { ACCOMMODATION_LABELS, ACCOMMODATION_DESCRIPTIONS, DEFAULT_ACCOMMODATIONS } from '@/lib/accommodations'
import { LANGUAGE_LABELS } from '@/lib/i18n'
import type { Gender, Language, Subject, PedagogyLean, ContentAxis, Accommodations } from '@/types'

const STEPS = ['Name', 'Age', 'Pronouns', 'Language', 'Subjects', 'Pedagogy', 'Content', 'Accommodations'] as const

const SUBJECT_OPTIONS: { value: Subject; label: string }[] = [
  { value: 'math', label: 'Math' },
  { value: 'language_arts', label: 'Language Arts' },
  { value: 'science', label: 'Science' },
  { value: 'social_studies', label: 'Social Studies' },
]

const PEDAGOGY_OPTIONS: { value: PedagogyLean; label: string; desc: string }[] = [
  { value: 'calm', label: 'Calm & Nature-based', desc: 'Charlotte Mason / Waldorf' },
  { value: 'structured', label: 'Structured & Rigorous', desc: 'Classical / Singapore' },
  { value: 'child_led', label: 'Child-led & Project-based', desc: 'Montessori / Reggio' },
  { value: 'balanced', label: 'Balanced Blend', desc: 'A little of everything (default)' },
]

const AVATAR_COLORS = ['#87A878', '#7A9CC6', '#C97C5D', '#B8A9C9', '#D4A574', '#6BA3A0', '#C4A882', '#A8B5A2']

export function ChildSetup() {
  const navigate = useNavigate()
  const { childId } = useParams()
  const { user } = useAuth()
  const { child: existingChild } = useChild(childId)
  const isEdit = !!childId

  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [age, setAge] = useState(7)
  const [gender, setGender] = useState<Gender>('they')
  const [language, setLanguage] = useState<Language>('en')
  const [subjects, setSubjects] = useState<Subject[]>(['math', 'language_arts', 'science', 'social_studies'])
  const [pedagogyLean, setPedagogyLean] = useState<PedagogyLean>('balanced')
  const [contentAxis, setContentAxis] = useState<ContentAxis>('faith_neutral')
  const [contentAxisNotes, setContentAxisNotes] = useState('')
  const [accommodations, setAccommodations] = useState<Accommodations>({ ...DEFAULT_ACCOMMODATIONS })
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Populate from existing child on edit
  useState(() => {
    if (existingChild) {
      setName(existingChild.name)
      setAge(existingChild.age)
      setGender(existingChild.gender)
      setLanguage(existingChild.language)
      setSubjects(existingChild.subjects)
      setPedagogyLean(existingChild.pedagogy_lean)
      setContentAxis(existingChild.content_axis)
      setContentAxisNotes(existingChild.content_axis_notes ?? '')
      setAccommodations(existingChild.accommodations)
      setAvatarColor(existingChild.avatar_color)
    }
  })

  function toggleSubject(s: Subject) {
    setSubjects((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    )
  }

  function toggleAccommodation(key: keyof Accommodations) {
    setAccommodations((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  async function handleSave() {
    if (!user) return
    setLoading(true)
    setError(null)

    const childData = {
      parent_id: user.id,
      name,
      age,
      gender,
      language,
      subjects,
      pedagogy_lean: pedagogyLean,
      content_axis: contentAxis,
      content_axis_notes: contentAxis === 'other' ? contentAxisNotes : null,
      accommodations,
      avatar_color: avatarColor,
    }

    if (isEdit && childId) {
      const { error: err } = await supabase
        .from('children')
        .update(childData)
        .eq('id', childId)
      if (err) { setError(err.message); setLoading(false); return }
    } else {
      const { data: newChild, error: err } = await supabase
        .from('children')
        .insert(childData)
        .select()
        .single()
      if (err || !newChild) { setError(err?.message ?? 'Failed to create child'); setLoading(false); return }

      // Log COPPA consent for this child
      await supabase.from('parental_consents').insert(
        buildConsentRecord(user.id, newChild.id),
      )
    }

    setLoading(false)
    navigate('/home')
  }

  const canNext = () => {
    if (step === 0) return name.trim().length > 0
    if (step === 4) return subjects.length > 0
    return true
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center gap-1 mb-6 px-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-sage' : 'bg-border'
              }`}
            />
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {isEdit ? `Edit ${existingChild?.name ?? 'child'}` : 'Add a child'}
            </CardTitle>
            <CardDescription>
              Step {step + 1} of {STEPS.length}: {STEPS[step]}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 0: Name */}
            {step === 0 && (
              <div className="space-y-4">
                <label className="text-sm font-medium">Child's first name</label>
                <Input
                  placeholder="First name only"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium">Pick a color</label>
                  <div className="flex gap-2">
                    {AVATAR_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setAvatarColor(color)}
                        className={`h-8 w-8 rounded-full transition-all ${
                          avatarColor === color ? 'ring-2 ring-offset-2 ring-sage scale-110' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Age */}
            {step === 1 && (
              <div className="space-y-4">
                <label className="text-sm font-medium">Age</label>
                <p className="text-xs text-muted">This determines lesson length, content depth, and pacing.</p>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 9 }, (_, i) => i + 5).map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAge(a)}
                      className={`h-12 w-12 rounded-lg border text-sm font-medium transition-colors ${
                        age === a
                          ? 'border-sage bg-sage/10 text-foreground'
                          : 'border-border bg-surface text-muted hover:border-sage/50'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Gender/Pronouns */}
            {step === 2 && (
              <div className="space-y-4">
                <label className="text-sm font-medium">Pronouns</label>
                <p className="text-xs text-muted">Used by the AI companion and in lesson framing.</p>
                <div className="grid grid-cols-3 gap-3">
                  {([['he', 'He / Him'], ['she', 'She / Her'], ['they', 'They / Them']] as const).map(([val, label]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setGender(val)}
                      className={`rounded-lg border px-4 py-3 text-sm transition-colors ${
                        gender === val
                          ? 'border-sage bg-sage/10 text-foreground'
                          : 'border-border bg-surface text-muted hover:border-sage/50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Language */}
            {step === 3 && (
              <div className="space-y-4">
                <label className="text-sm font-medium">Learning language</label>
                <p className="text-xs text-muted">Lesson UI and AI companion will use this language.</p>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(LANGUAGE_LABELS) as [Language, string][]).map(([val, label]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setLanguage(val)}
                      className={`rounded-lg border px-4 py-3 text-sm transition-colors ${
                        language === val
                          ? 'border-sage bg-sage/10 text-foreground'
                          : 'border-border bg-surface text-muted hover:border-sage/50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Subjects */}
            {step === 4 && (
              <div className="space-y-4">
                <label className="text-sm font-medium">Subjects</label>
                <p className="text-xs text-muted">Select at least one. All are on by default.</p>
                <div className="grid grid-cols-2 gap-2">
                  {SUBJECT_OPTIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => toggleSubject(value)}
                      className={`rounded-lg border px-4 py-3 text-sm transition-colors ${
                        subjects.includes(value)
                          ? 'border-sage bg-sage/10 text-foreground'
                          : 'border-border bg-surface text-muted hover:border-sage/50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Pedagogy Lean */}
            {step === 5 && (
              <div className="space-y-4">
                <label className="text-sm font-medium">Teaching style preference</label>
                <div className="grid gap-2">
                  {PEDAGOGY_OPTIONS.map(({ value, label, desc }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setPedagogyLean(value)}
                      className={`rounded-lg border px-4 py-3 text-left transition-colors ${
                        pedagogyLean === value
                          ? 'border-sage bg-sage/10'
                          : 'border-border bg-surface hover:border-sage/50'
                      }`}
                    >
                      <div className="text-sm font-medium">{label}</div>
                      <div className="text-xs text-muted">{desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 6: Content Axis */}
            {step === 6 && (
              <div className="space-y-4">
                <label className="text-sm font-medium">Content approach</label>
                <p className="text-xs text-muted">Shapes how history, science origins, and reading lists are framed.</p>
                <div className="grid gap-2">
                  {(Object.entries(CONTENT_AXIS_LABELS) as [ContentAxis, string][]).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setContentAxis(value)}
                      className={`rounded-lg border px-4 py-3 text-left transition-colors ${
                        contentAxis === value
                          ? 'border-sage bg-sage/10'
                          : 'border-border bg-surface hover:border-sage/50'
                      }`}
                    >
                      <div className="text-sm font-medium">{label}</div>
                      <div className="text-xs text-muted">{CONTENT_AXIS_DESCRIPTIONS[value]}</div>
                    </button>
                  ))}
                </div>
                {contentAxis === 'other' && (
                  <div className="space-y-2 mt-3">
                    <label className="text-sm font-medium">Notes for lesson generation</label>
                    <textarea
                      className="flex w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage min-h-[80px]"
                      placeholder="Tell us about your family's values and what you'd like reflected in lessons..."
                      value={contentAxisNotes}
                      onChange={(e) => setContentAxisNotes(e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 7: Accommodations */}
            {step === 7 && (
              <div className="space-y-4">
                <label className="text-sm font-medium">Accommodations</label>
                <p className="text-xs text-muted">All off by default. Toggle any that apply — you can change these anytime.</p>
                <div className="grid gap-2">
                  {(Object.keys(ACCOMMODATION_LABELS) as (keyof Accommodations)[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleAccommodation(key)}
                      className={`rounded-lg border px-4 py-3 text-left transition-colors ${
                        accommodations[key]
                          ? 'border-sage bg-sage/10'
                          : 'border-border bg-surface hover:border-sage/50'
                      }`}
                    >
                      <div className="text-sm font-medium">{ACCOMMODATION_LABELS[key]}</div>
                      <div className="text-xs text-muted">{ACCOMMODATION_DESCRIPTIONS[key]}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && <p className="text-sm text-terracotta">{error}</p>}

            <div className="flex gap-3 pt-2">
              {step > 0 && (
                <Button variant="secondary" onClick={() => setStep(step - 1)}>
                  Back
                </Button>
              )}
              {step < STEPS.length - 1 ? (
                <Button className="flex-1" disabled={!canNext()} onClick={() => setStep(step + 1)}>
                  Next
                </Button>
              ) : (
                <Button className="flex-1" disabled={loading || !canNext()} onClick={handleSave}>
                  {loading ? 'Saving...' : isEdit ? 'Save changes' : 'Create learning path'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
