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
  const pedagogy = PEDAGOGY_SOURCES[subject]

  const blockMinutes = child.accommodations.shorter_blocks
    ? Math.round(attention.singleBlockMinutes * 0.7)
    : attention.singleBlockMinutes

  return `You are Seed's curriculum engine. Generate a single lesson for a ${child.age}-year-old child.

CHILD PROFILE:
- Age: ${child.age}
- Pronouns: ${child.gender}
- Language: ${child.language}
- Pedagogy lean: ${child.pedagogy_lean}
- Content axis: ${child.content_axis}${child.content_axis_notes ? ` (Notes: ${child.content_axis_notes})` : ''}
- Accommodations: ${Object.entries(child.accommodations).filter(([, v]) => v).map(([k]) => k).join(', ') || 'none'}

LESSON PARAMETERS:
- Subject: ${subject}
- Concept: ${conceptNode}
- Pedagogy source: ${pedagogy}
- Max block length: ${blockMinutes} minutes
- Estimated total: ${blockMinutes} minutes

${priorLessonSummaries?.length ? `PRIOR LESSON CONTEXT:\n${priorLessonSummaries.join('\n')}\n` : ''}

OUTPUT FORMAT (JSON):
{
  "title": "engaging lesson title",
  "hook": "1-2 sentences of curiosity to open the lesson",
  "segments": [
    {
      "type": "text|drag_drop|draw|voice|click_explore|simulation|interactive",
      "title": "segment title",
      "content": "the actual learning content — age-appropriate, warm, clear",
      "instructions": "what the child does in this segment",
      "data": {} // optional structured data for interactive segments
    }
  ],
  "questions": [
    { "question": "check-for-understanding question", "answer": "expected answer", "hint": "gentle hint" }
  ],
  "movement_break": {
    "activity": "age-appropriate movement or breathing activity",
    "duration_minutes": 2
  },
  "wonder_prompt": "an optional 'I wonder...' question to spark curiosity"
}

STEM & MODERN WORLD INTEGRATION:
Seed is the most modern learning platform — every lesson should feel connected to today's world.
- Weave STEM thinking (engineering design, scientific method, data reasoning) into every subject naturally
- Connect concepts to real technology, AI, coding, data, and modern innovation where relevant
- For younger kids (5-7): relate to technology they see (robots, voice assistants, tablets, sensors)
- For middle kids (8-10): introduce computational thinking, how data/algorithms work, coding concepts
- For older kids (11-13): AI/ML foundations, data science, digital ethics, prompt engineering, future of work
- Always frame technology as a tool humans direct — emphasize critical thinking about tech, not blind adoption

RULES:
- 3-5 segments that cycle through different interaction modes
- Content must be accurate, age-appropriate, and warm
- Use ${child.gender === 'they' ? 'they/them' : child.gender === 'he' ? 'he/him' : 'she/her'} pronouns in any narrative
- Honor the content axis: ${child.content_axis}
- No badges, points, or gamification language
- No violence, romantic content, scary imagery, ads, brands, or links
- Socratic tone — guide discovery, don't lecture
- Movement break should be calm and age-appropriate
${child.accommodations.faster_pacing ? '- Skip intro recaps, surface challenge variants' : ''}
${child.accommodations.dyslexia_font ? '- Use shorter sentences, simpler vocabulary where possible' : ''}`
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
