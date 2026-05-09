import type { Child, Subject, Lesson } from '@/types'
import { getAttentionConfig } from './attention-spans'

// Concept maps per subject — spiral curriculum progression
// Concept maps per subject — spiral curriculum progression
// Modern concepts (AI, coding, data, digital literacy, STEM engineering) are woven
// into every subject at age-appropriate levels so kids grow up fluent in the tools
// and ideas shaping their world.
const CONCEPT_MAPS: Record<Subject, string[][]> = {
  math: [
    // Grades K-1 (ages 5-6) — number sense + intro to logical/algorithmic thinking
    ['counting-to-20', 'number-bonds-to-10', 'addition-within-10', 'subtraction-within-10', 'shapes-2d', 'patterns-and-sequences', 'comparing-numbers', 'measurement-length', 'sorting-and-classifying', 'intro-to-algorithms-everyday-steps'],
    // Grades 2-3 (ages 7-8) — operations + data literacy + block coding logic
    ['place-value-hundreds', 'addition-regrouping', 'subtraction-regrouping', 'multiplication-intro', 'fractions-halves-quarters', 'bar-models', 'time-clocks', 'money', 'data-collection-and-charts', 'coding-logic-loops-conditionals'],
    // Grades 4-5 (ages 9-10) — advanced ops + statistics + intro programming
    ['multi-digit-multiplication', 'long-division', 'fractions-operations', 'decimals', 'area-perimeter', 'bar-model-advanced', 'ratios-intro', 'data-graphs-and-statistics', 'spreadsheet-thinking', 'intro-programming-variables-functions'],
    // Grades 6-8 (ages 11-13) — algebra + data science + AI/ML foundations
    ['integers', 'ratios-proportions', 'expressions-equations', 'geometry-angles', 'statistics-probability', 'coordinate-plane', 'variation-theory', 'problem-solving-heuristics', 'data-science-intro', 'ai-ml-how-models-learn'],
  ],
  language_arts: [
    // Ages 5-6 — phonics + storytelling + digital communication basics
    ['letter-sounds', 'cvc-words', 'sight-words', 'narration-oral', 'copywork-letters', 'living-books-read-aloud', 'phonemic-awareness', 'simple-sentences', 'storytelling-with-pictures'],
    // Ages 7-8 — fluency + writing + intro digital literacy
    ['reading-fluency', 'narration-written', 'copywork-passages', 'grammar-nouns-verbs', 'living-books-chapter', 'spelling-patterns', 'paragraph-writing', 'poetry-intro', 'digital-literacy-safe-communication', 'evaluating-information-sources'],
    // Ages 9-10 — comprehension + research + media literacy
    ['reading-comprehension', 'essay-structure', 'grammar-clauses', 'creative-writing', 'living-books-analysis', 'research-skills', 'rhetoric-intro', 'literary-elements', 'media-literacy-identifying-bias', 'ai-generated-vs-human-writing'],
    // Ages 11-13 — analysis + persuasion + digital ethics
    ['analytical-writing', 'persuasive-essay', 'rhetoric-advanced', 'literary-criticism', 'research-paper', 'grammar-style', 'debate-logic', 'classical-sources', 'digital-ethics-and-ai-in-media', 'prompt-engineering-clear-communication'],
  ],
  science: [
    // Ages 5-6 — observation + nature + intro engineering
    ['seasons-weather', 'five-senses', 'plants-growing', 'animals-habitats', 'water-cycle-simple', 'magnets-intro', 'earth-sky', 'healthy-body', 'stem-building-and-testing', 'how-robots-help-people'],
    // Ages 7-8 — systems + experiments + simple machines + tech
    ['ecosystems', 'states-of-matter', 'simple-machines', 'life-cycles', 'rocks-minerals', 'sound-light', 'nutrition', 'weather-patterns', 'engineering-design-process', 'how-computers-think-binary-intro'],
    // Ages 9-10 — deeper systems + energy + space + coding for science
    ['cells-organisms', 'force-motion', 'energy-forms', 'earth-layers', 'solar-system', 'chemical-reactions-intro', 'adaptation-evolution', 'scientific-method', 'sensors-and-data-collection', 'coding-for-science-simulations'],
    // Ages 11-13 — advanced science + AI in science + engineering challenges
    ['genetics-intro', 'periodic-table', 'electricity-circuits', 'plate-tectonics', 'astronomy-deep', 'ecology-systems', 'physics-laws', 'engineering-design-challenges', 'ai-in-scientific-discovery', 'climate-tech-and-sustainability'],
  ],
  social_studies: [
    // Ages 5-6 — community + responsibility + technology helpers
    ['my-family-community', 'maps-intro', 'helpers-in-community', 'holidays-cultures', 'rules-responsibilities', 'needs-wants', 'neighborhoods', 'timeline-personal', 'technology-in-our-lives'],
    // Ages 7-8 — geography + civics + how technology shapes society
    ['world-geography', 'ancient-civilizations-intro', 'government-basics', 'economics-intro', 'cultural-traditions', 'us-regions', 'timelines-history', 'citizenship', 'inventions-that-changed-the-world', 'internet-and-global-connection'],
    // Ages 9-10 — history + economics + digital citizenship
    ['ancient-greece-rome', 'medieval-world', 'age-of-exploration', 'us-founding', 'world-cultures-deep', 'economics-trade', 'geography-physical', 'civic-participation', 'digital-citizenship-and-privacy', 'entrepreneurship-and-innovation'],
    // Ages 11-13 — modern world + AI ethics + computational thinking
    ['world-history-modern', 'us-constitution-deep', 'global-economics', 'human-rights', 'critical-thinking-sources', 'geopolitics', 'computational-thinking', 'ib-inquiry-projects', 'ai-ethics-and-society', 'future-of-work-and-technology'],
  ],
}

const PEDAGOGY_SOURCES: Record<Subject, string> = {
  math: 'Singapore Math + Shanghai variation theory',
  language_arts: 'Charlotte Mason living books + Classical Trivium',
  science: 'Finnish phenomenon-based + Japanese lesson study',
  social_studies: 'Estonian computational thinking + IB inquiry',
}

function getAgeGroup(age: number): number {
  if (age <= 6) return 0
  if (age <= 8) return 1
  if (age <= 10) return 2
  return 3
}

export function getConceptsForChild(child: Child, subject: Subject): string[] {
  const group = getAgeGroup(child.age)
  return CONCEPT_MAPS[subject][group] ?? CONCEPT_MAPS[subject][0]
}

export function getNextConcepts(
  child: Child,
  subject: Subject,
  completedConcepts: string[],
  count: number = 5,
): string[] {
  const concepts = getConceptsForChild(child, subject)
  const remaining = concepts.filter((c) => !completedConcepts.includes(c))
  return remaining.slice(0, count)
}

export interface LessonGenerationRequest {
  child: Child
  subject: Subject
  conceptNode: string
  priorLessonSummaries?: string[]
}

export function buildLessonPrompt(req: LessonGenerationRequest): string {
  const { child, subject, conceptNode, priorLessonSummaries } = req
  const attention = getAttentionConfig(child.age)

  const blockMinutes = child.accommodations.shorter_blocks
    ? Math.round(attention.singleBlockMinutes * 0.7)
    : attention.singleBlockMinutes

  const pronouns = child.gender === 'they' ? 'they/them/their' : child.gender === 'he' ? 'he/him/his' : 'she/her/her'

  const ageGuidance = child.age <= 6
    ? `This child is ${child.age}. Write like you're a warm, patient kindergarten teacher sitting on the floor with them. Use simple words (1-2 syllables preferred). Short sentences (5-10 words). Lots of concrete examples they can see, touch, or act out. Use storytelling and imagination ("Pretend you're a..."). Reference things they know: animals, toys, food, family, playground. NEVER use abstract language.`
    : child.age <= 8
    ? `This child is ${child.age}. Write like a favorite 2nd-grade teacher who makes everything an adventure. Sentences can be longer but stay concrete. Use "you" language. Include hands-on activities (draw, count objects, sort things). Light humor is great. They can read simple paragraphs.`
    : child.age <= 10
    ? `This child is ${child.age}. Write like an engaging 4th-grade teacher who treats them as capable thinkers. They can handle multi-step reasoning, longer text, and real-world connections. Challenge them gently. Introduce "why" and "how" questions. They enjoy feeling smart.`
    : `This child is ${child.age}. Write like a respected mentor who takes their thinking seriously. They can handle nuance, debate, and real complexity. Use sophisticated vocabulary (but explain new terms). Connect to current events, technology, and their future. They want to feel like they're learning real, important things — not "kid stuff."`

  const contentAxisGuidance: Record<string, string> = {
    secular: 'Use standard scientific consensus throughout. Present holidays and cultural topics from a cultural/historical lens. No religious framing.',
    faith_neutral: 'Avoid taking positions on creation/origin-of-life topics. Present diverse perspectives respectfully. Include world cultures and holidays broadly.',
    christian: 'Integrate Christian perspective naturally where relevant. In science, present scientific consensus AND acknowledge God as creator ("Many Christians see God\'s design in..."). Reference Biblical stories, values, or principles where they connect to the topic. Include faith-aligned examples. Be respectful and genuine, not preachy.',
    lds: 'Integrate Latter-day Saint perspective. Include Christian framing plus LDS-specific cultural context (Book of Mormon references, LDS values) where age-appropriate and relevant.',
    jewish: 'Integrate Jewish perspective. Reference Tanakh, Hebrew calendar, and Jewish holidays where relevant. Include diaspora history context. Emphasize Jewish values of learning and questioning.',
    other: child.content_axis_notes ? 'Follow these family guidelines: ' + child.content_axis_notes : 'Present topics in a balanced, respectful way.',
  }

  const pedagogyGuidance: Record<string, string> = {
    calm: 'Use a gentle, nature-connected teaching style. Emphasize observation, narration, and living examples. Include nature references and sensory details. Slow pace, no pressure.',
    structured: 'Use clear, logical progression. Define terms precisely. Include structured practice with specific steps. Build mastery through repetition with variation.',
    child_led: 'Frame the lesson as an exploration the child directs. Offer choices. Ask what they want to investigate. Emphasize hands-on discovery and project-based thinking.',
    balanced: 'Blend structured teaching with discovery. Teach core concepts clearly, then let the child explore and apply them creatively.',
  }

  return `You are the world's best ${subject.replace('_', ' ')} teacher, creating a single personalized lesson.

YOUR STUDENT:
- Age: ${child.age} years old
- Pronouns: ${pronouns} (use these if referring to the student in third person, but prefer "you")
- Language: ${child.language === 'en' ? 'English' : child.language}
${Object.entries(child.accommodations).filter(([, v]) => v).map(([k]) => '- Accommodation: ' + k.replace(/_/g, ' ')).join('\n')}

TEACHING STYLE (match this tone):
${pedagogyGuidance[child.pedagogy_lean] ?? pedagogyGuidance.balanced}

CONTENT & VALUES APPROACH (THIS IS IMPORTANT — respect the family's values):
${contentAxisGuidance[child.content_axis] ?? contentAxisGuidance.faith_neutral}

AGE-CALIBRATION (THIS IS CRITICAL):
${ageGuidance}

LESSON TOPIC: ${conceptNode.replace(/-/g, ' ')}
SUBJECT: ${subject.replace('_', ' ')}
TARGET LENGTH: ${blockMinutes} minutes of focused learning

${priorLessonSummaries?.length ? 'PRIOR LESSONS (for continuity):\n' + priorLessonSummaries.join('\n') + '\n' : ''}
LESSON DESIGN — DUOLINGO-INSPIRED, WORLD-CLASS QUALITY:
Structure every lesson as a series of small, rewarding steps. Each step should feel like a mini-win.

1. HOOK — A surprising fact, mystery, or "what if" scenario. Never "Today we'll learn about X."
2. TEACH in tiny bites — Each segment teaches ONE specific thing. Keep it short and punchy. After teaching, IMMEDIATELY give the child something to do with what they just learned.
3. ACTIVITY after every teaching moment — Every content segment MUST have an "instructions" field with a specific, actionable exercise:
   - For ages 5-7: "Clap 3 times, then hold up 5 fingers", "Point to something round", "Say the word out loud 3 times"
   - For ages 8-10: "Write your answer on paper", "Draw a quick sketch", "Explain this to someone near you"
   - For ages 11-13: "Write a 2-sentence response", "Calculate this", "Make a prediction before reading on"
4. MAKE IT TANGIBLE — Use examples from their world. Never abstract.
5. BUILD incrementally — Each step builds on the last. The child should feel themselves getting smarter.
6. END WITH WONDER — A question that sticks with them after the lesson.

MODERN WORLD: Connect naturally to technology, AI, real careers. For 5-7: tablets, robots. For 8-10: coding, data. For 11+: AI, digital ethics, future careers.

OUTPUT — Return ONLY valid JSON, no markdown code blocks:
{
  "title": "A creative, kid-friendly title (no dashes, no subject labels)",
  "hook": "1-2 sentences that spark immediate curiosity",
  "segments": [
    {
      "type": "text",
      "title": "Short step title (3-5 words)",
      "content": "Teach ONE concept clearly. 2-4 sentences for young kids, 4-6 for older. Be specific — real facts, real examples.",
      "instructions": "A specific hands-on activity tied to what was just taught. Make it physical, verbal, or creative — not just 'think about it'."
    }
  ],
  "questions": [
    { "question": "A specific question that tests understanding (not 'what did you learn?')", "answer": "The correct answer", "hint": "A clue that guides without giving away the answer" }
  ],
  "movement_break": {
    "activity": "A specific, fun, ${blockMinutes <= 10 ? '1' : '2'}-minute movement activity appropriate for a ${child.age}-year-old",
    "duration_minutes": ${blockMinutes <= 10 ? 1 : 2}
  }
}

REQUIREMENTS:
- 4-6 segments — more steps with less content each. Like Duolingo: learn a little, practice immediately, repeat
- Every segment MUST have both "content" (teaching) and "instructions" (activity). No segment without an activity
- Keep each segment's content to 2-5 sentences max. Short and punchy beats long and thorough
- Activities must be SPECIFIC and ACTIONABLE — "hold up 3 fingers" not "think about numbers"
- Factually accurate. Warm, encouraging tone. Never condescending
- No pedagogy method names. No gamification language (no points, badges, streaks, XP)
- No violence, romantic content, or scary imagery
- Movement break: specific, fun, and connected to the lesson topic when possible
${child.accommodations.faster_pacing ? '- FASTER PACING: Skip recap, go straight to new material, include challenge extensions' : ''}
${child.accommodations.dyslexia_font ? '- DYSLEXIA SUPPORT: Shorter sentences, simpler vocabulary, more whitespace in content' : ''}
${child.accommodations.shorter_blocks ? '- SHORTER BLOCKS: Compress to essential content only, fewer segments' : ''}`
}

export function buildScheduleForWeek(
  child: Child,
  subject: Subject,
  concepts: string[],
  startDate: Date,
): Partial<Lesson>[] {
  const attention = getAttentionConfig(child.age)
  const blockMinutes = child.accommodations.shorter_blocks
    ? Math.round(attention.singleBlockMinutes * 0.7)
    : attention.singleBlockMinutes

  // 5 lessons per week per subject
  return concepts.slice(0, 5).map((concept, i) => {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    return {
      child_id: child.id,
      subject,
      concept_node: concept,
      pedagogy_source: PEDAGOGY_SOURCES[subject],
      content_axis: child.content_axis,
      language: child.language,
      estimated_minutes: blockMinutes,
      scheduled_for: date.toISOString().split('T')[0],
      status: 'pending' as const,
    }
  })
}
