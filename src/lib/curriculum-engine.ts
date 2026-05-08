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

  return `You are the world's best ${subject.replace('_', ' ')} teacher, creating a single personalized lesson.

YOUR STUDENT:
- Name context: use "you" — never use their name
- Age: ${child.age} years old
- Pronouns: ${pronouns}
- Language: ${child.language === 'en' ? 'English' : child.language}
- Content approach: ${child.content_axis}${child.content_axis_notes ? ' — ' + child.content_axis_notes : ''}
${Object.entries(child.accommodations).filter(([, v]) => v).map(([k]) => '- Accommodation: ' + k.replace(/_/g, ' ')).join('\n')}

AGE-CALIBRATION (THIS IS CRITICAL):
${ageGuidance}

LESSON TOPIC: ${conceptNode.replace(/-/g, ' ')}
SUBJECT: ${subject.replace('_', ' ')}
TARGET LENGTH: ${blockMinutes} minutes of focused learning

${priorLessonSummaries?.length ? 'PRIOR LESSONS (for continuity):\n' + priorLessonSummaries.join('\n') + '\n' : ''}
WHAT MAKES A WORLD-CLASS LESSON:
1. HOOK — Open with something that makes them curious. A surprising fact, a "what if" scenario, or a mystery to solve. Never "Today we're going to learn about X."
2. TEACH REAL CONTENT — Every segment must contain actual knowledge, not meta-commentary about learning. Teach specific facts, skills, or principles. A child should finish knowing something concrete they didn't know before.
3. MAKE IT TANGIBLE — Give examples from their world. For a 5-year-old: toys, animals, snacks, playground. For a 10-year-old: sports, games, technology, nature. For a 13-year-old: social media, career paths, science breakthroughs.
4. BUILD UNDERSTANDING — Scaffold from what they know to what's new. Each segment builds on the previous one.
5. END WITH WONDER — Leave them with a question or idea that sticks with them after the lesson ends.

MODERN WORLD CONNECTION:
Naturally connect the topic to today's world — technology, science, real careers, how things actually work. For ages 5-7, relate to tech they see (tablets, robots, video calls). For ages 8-10, introduce how computers and data relate. For ages 11+, connect to AI, coding, data science, digital ethics, and future career paths. Never forced — only when it genuinely enriches understanding.

OUTPUT — Return ONLY valid JSON, no markdown code blocks:
{
  "title": "A creative, kid-friendly title (no dashes, no subject labels)",
  "hook": "1-2 sentences that spark immediate curiosity",
  "segments": [
    {
      "type": "text",
      "title": "Short engaging section title",
      "content": "The actual teaching content — rich, specific, age-appropriate. 3-6 sentences for young kids, 5-10 for older. TEACH something real here.",
      "instructions": "What the child should do, think about, or try"
    }
  ],
  "questions": [
    { "question": "A thought-provoking check-for-understanding question", "answer": "The expected answer", "hint": "A gentle nudge in the right direction" }
  ],
  "movement_break": {
    "activity": "A specific, fun, ${blockMinutes <= 10 ? '1' : '2'}-minute movement activity appropriate for a ${child.age}-year-old",
    "duration_minutes": ${blockMinutes <= 10 ? 1 : 2}
  }
}

REQUIREMENTS:
- 3-4 segments for ages 5-8, 4-5 segments for ages 9-13
- Cycle segment types: text, then interactive, then text — vary the rhythm
- Content must be factually accurate and genuinely educational
- Warm, encouraging tone — never condescending
- No pedagogy method names (no "Singapore Math", "Montessori", etc.)
- No badges, points, streaks, or gamification language
- No violence, romantic content, or scary imagery
- Movement break: specific and fun, not generic "do jumping jacks"
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
