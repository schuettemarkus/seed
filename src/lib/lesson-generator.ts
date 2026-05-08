import { supabase } from './supabase'
import { getConceptsForChild, getNextConcepts } from './curriculum-engine'
import { getAttentionConfig } from './attention-spans'
import type { Child, Subject, LessonSegment } from '@/types'

function fmt(concept: string): string {
  return concept.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function seg(type: LessonSegment['type'], title: string, content: string, instructions: string): LessonSegment {
  return { type, title, content, instructions }
}

function movementBreak(age: number) {
  const activity = age <= 7
    ? 'Stand up and do 10 jumping jacks, then take 3 deep breaths.'
    : 'Stand up, stretch your arms high, then touch your toes 5 times. Shake out your hands.'
  return { activity, duration_minutes: 2 }
}

function buildMathLesson(concept: string, child: Child, minutes: number) {
  const t = fmt(concept)
  const tl = t.toLowerCase()
  return {
    subject: 'math' as const,
    concept_node: concept,
    title: t + ' \u2014 Math Explorer',
    hook: 'What if numbers could tell a story? Today we discover something amazing about ' + tl + '.',
    segments: [
      seg('text', 'Discover', 'Let\u2019s explore ' + tl + '. In Singapore Math, we use pictures and models to make numbers come alive. Think about what you already know \u2014 what patterns do you notice?', 'Read carefully and think about what you already know about this topic.'),
      seg('interactive', 'Try It', 'Now it\u2019s your turn to work with ' + tl + '. Remember: there\u2019s no rush. Take your time and think step by step.', 'Practice ' + tl + ' with these examples. Use a bar model to help you visualize.'),
      seg('text', 'Connect', t + ' shows up everywhere in real life \u2014 from counting steps to splitting snacks fairly. Scientists and engineers use these same ideas when they build apps, design buildings, and even teach computers to learn.', 'Think about where you see this concept in your everyday life.'),
    ],
    questions: [
      { question: 'Can you explain ' + tl + ' in your own words?', hint: 'Think about what makes it different from what you learned before.' },
      { question: 'Where might you use this in real life?', hint: 'Think about cooking, building, or playing games.' },
    ],
    movement_break: movementBreak(child.age),
    estimated_minutes: minutes,
    pedagogy_source: 'Singapore Math + Shanghai variation theory',
    content_axis: child.content_axis,
    language: child.language,
    status: 'pending' as const,
    scheduled_for: null as string | null,
  }
}

function buildLALesson(concept: string, child: Child, minutes: number) {
  const t = fmt(concept)
  const tl = t.toLowerCase()
  return {
    subject: 'language_arts' as const,
    concept_node: concept,
    title: t + ' \u2014 Word Workshop',
    hook: 'Words have power \u2014 they can paint pictures in your mind, make you laugh, or help you understand the world. Today we explore ' + tl + '.',
    segments: [
      seg('text', 'Read & Listen', 'Great readers and writers have always used ' + tl + ' as a building block. Charlotte Mason believed the best way to learn is through living examples \u2014 real stories, real ideas, not just rules.', 'Read this passage carefully. What stands out to you?'),
      seg('interactive', 'Your Turn', 'Now let\u2019s practice ' + tl + ' together. There\u2019s no single right answer \u2014 what matters is your thinking.', 'Try creating your own example of ' + tl + '.'),
      seg('text', 'Why It Matters', t + ' is a skill that writers, journalists, and even people who create AI chatbots use every day. Clear communication is one of the most important skills in the modern world.', 'Think about how you use this skill when texting, writing, or talking to friends.'),
    ],
    questions: [
      { question: 'What\u2019s one thing you learned about ' + tl + ' today?', hint: 'Think about what surprised you.' },
    ],
    movement_break: { activity: 'Take a walk around the room. Look out a window and describe 3 things you see \u2014 out loud or in your head.', duration_minutes: 2 },
    estimated_minutes: minutes,
    pedagogy_source: 'Charlotte Mason living books + Classical Trivium',
    content_axis: child.content_axis,
    language: child.language,
    status: 'pending' as const,
    scheduled_for: null as string | null,
  }
}

function buildScienceLesson(concept: string, child: Child, minutes: number) {
  const t = fmt(concept)
  const tl = t.toLowerCase()
  return {
    subject: 'science' as const,
    concept_node: concept,
    title: t + ' \u2014 Science Lab',
    hook: 'Scientists start with a question and then investigate. Today\u2019s question: What can we discover about ' + tl + '?',
    segments: [
      seg('text', 'Observe', 'In Finnish science education, every lesson starts with a real phenomenon \u2014 something you can see, touch, or wonder about. ' + t + ' is all around us. Let\u2019s look closer.', 'Read and think: what do you already know about this topic? What questions do you have?'),
      seg('interactive', 'Investigate', 'Time to think like a scientist! Let\u2019s explore ' + tl + ' through a hands-on activity. The Japanese lesson study method says the best learning happens when you struggle a little before finding the answer.', 'Design a simple experiment or observation about ' + tl + '. What would you test?'),
      seg('text', 'Discover', 'Here\u2019s what scientists have learned about ' + tl + '. Today, researchers use computers, AI, and advanced sensors to study topics like this in ways that were impossible just 10 years ago.', 'What surprised you? What would you want to investigate further?'),
    ],
    questions: [
      { question: 'If you could ask a scientist one question about ' + tl + ', what would it be?', hint: 'Think about what still puzzles you.' },
      { question: 'How could technology help us learn more about this topic?', hint: 'Think about tools, computers, or experiments.' },
    ],
    movement_break: movementBreak(child.age),
    estimated_minutes: minutes,
    pedagogy_source: 'Finnish phenomenon-based + Japanese lesson study',
    content_axis: child.content_axis,
    language: child.language,
    status: 'pending' as const,
    scheduled_for: null as string | null,
  }
}

function buildSSLesson(concept: string, child: Child, minutes: number) {
  const t = fmt(concept)
  const tl = t.toLowerCase()
  return {
    subject: 'social_studies' as const,
    concept_node: concept,
    title: t + ' \u2014 World Explorer',
    hook: 'Every person, community, and civilization has a story. Today we explore ' + tl + ' \u2014 and discover how it connects to your world.',
    segments: [
      seg('text', 'Explore', t + ' is part of how human societies work. Using the IB inquiry approach, we start with a big question: Why does this matter? How does it affect people\u2019s lives?', 'Read and think about how this topic connects to your own community or family.'),
      seg('interactive', 'Investigate', 'Let\u2019s dig deeper into ' + tl + '. In Estonian education, students learn to think computationally \u2014 breaking big ideas into smaller parts and finding patterns.', 'What are the most important parts of ' + tl + '? Try to list 3 key ideas.'),
      seg('text', 'Connect to Today', t + ' isn\u2019t just history \u2014 it shapes the world you live in right now. Technology, the internet, and AI are changing how societies organize, communicate, and solve problems together.', 'How does this topic show up in the news or in your daily life?'),
    ],
    questions: [
      { question: 'Why do you think ' + tl + ' matters today?', hint: 'Think about how it affects real people.' },
    ],
    movement_break: { activity: 'Stand up and stretch. Then walk to a different room and back. Notice something you have not noticed before.', duration_minutes: 2 },
    estimated_minutes: minutes,
    pedagogy_source: 'Estonian computational thinking + IB inquiry',
    content_axis: child.content_axis,
    language: child.language,
    status: 'pending' as const,
    scheduled_for: null as string | null,
  }
}

type LessonData = {
  subject: Subject
  concept_node: string
  title: string
  hook: string
  segments: LessonSegment[]
  questions: { question: string; hint: string }[]
  movement_break: { activity: string; duration_minutes: number }
  estimated_minutes: number
  pedagogy_source: string
  content_axis: string
  language: string
  status: 'pending'
  scheduled_for: string | null
}

const BUILDERS: Record<Subject, (concept: string, child: Child, minutes: number) => LessonData> = {
  math: buildMathLesson,
  language_arts: buildLALesson,
  science: buildScienceLesson,
  social_studies: buildSSLesson,
}

/**
 * Generate today's lessons for a child if none exist yet.
 * Creates one lesson per subject, scheduled for today.
 */
export async function generateTodayLessons(child: Child): Promise<void> {
  const today = new Date().toISOString().split('T')[0]

  // Check if lessons already exist for today
  const { data: existing } = await supabase
    .from('lessons')
    .select('id')
    .eq('child_id', child.id)
    .eq('scheduled_for', today)
    .limit(1)

  if (existing && existing.length > 0) return

  // Get completed concepts to avoid repeats
  const { data: mastery } = await supabase
    .from('mastery_state')
    .select('concept_node')
    .eq('child_id', child.id)

  const completedConcepts = (mastery ?? []).map((m: { concept_node: string }) => m.concept_node)
  const attention = getAttentionConfig(child.age)
  const blockMinutes = child.accommodations.shorter_blocks
    ? Math.round(attention.singleBlockMinutes * 0.7)
    : attention.singleBlockMinutes

  const lessonsToInsert = child.subjects.map((subject) => {
    const concepts = getNextConcepts(child, subject, completedConcepts, 1)
    const concept = concepts[0] ?? getConceptsForChild(child, subject)[0]
    const builder = BUILDERS[subject]
    const lesson = builder(concept, child, blockMinutes)

    return {
      ...lesson,
      child_id: child.id,
      scheduled_for: today,
    }
  })

  const { error } = await supabase
    .from('lessons')
    .insert(lessonsToInsert)

  if (error) {
    console.error('Failed to generate lessons:', error)
  }
}
