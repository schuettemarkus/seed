import { supabase } from './supabase'
import { getConceptsForChild, getNextConcepts } from './curriculum-engine'
import { buildLessonPrompt } from './curriculum-engine'
import { getAttentionConfig } from './attention-spans'
import type { Child, Subject, LessonSegment } from '@/types'

// Always try AI generation — the server-side proxy/function handles the API key
const AI_ENABLED = true

function fmt(concept: string): string {
  return concept.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function seg(type: LessonSegment['type'], title: string, content: string, instructions: string): LessonSegment {
  return { type, title, content, instructions }
}

function buildMathLesson(concept: string, child: Child, minutes: number) {
  const t = fmt(concept)
  const tl = t.toLowerCase()
  const young = child.age <= 7
  return {
    subject: 'math' as const,
    concept_node: concept,
    title: young ? 'The ' + t + ' Adventure' : t + ': Patterns and Power',
    hook: young
      ? 'Close your eyes and imagine a world made entirely of numbers. What would ' + tl + ' look like if you could hold it in your hands?'
      : 'Every building, every app, every rocket launch depends on the idea we\u2019re exploring today: ' + tl + '.',
    segments: [
      seg('text', young ? 'The Story' : 'The Big Idea',
        young
          ? 'Imagine you have a basket of apples. ' + t + ' helps us understand how many, how to share, and how to get more. Numbers are like a secret code for the world around you!'
          : t + ' is one of the foundational ideas in mathematics. It shows up in architecture, computer science, sports statistics, and even music. Let\u2019s build a deep understanding of how it works and why it matters.',
        young ? 'Can you find something near you to count right now?' : 'Think about where you\u2019ve already seen this concept in your life.'),
      seg('interactive', young ? 'Your Turn' : 'Practice Lab',
        young
          ? 'Now you try! Use your fingers, draw circles, or grab some small objects. See if you can show ' + tl + ' with things you can touch.'
          : 'Work through this step by step. If you get stuck, try drawing a picture or diagram \u2014 making math visible is how the best problem solvers think.',
        young ? 'Use toys, snacks, or your fingers to practice ' + tl + '.' : 'Solve these problems. Try at least two different approaches.'),
      seg('text', young ? 'Math Is Everywhere!' : 'Real-World Connection',
        young
          ? 'You just used ' + tl + '! Guess what \u2014 you do this every day. When you share crackers with a friend, pick teams, or set the table, you\u2019re using math. Even robots need ' + tl + ' to work!'
          : t + ' powers real things: engineers use it to design bridges, game developers use it to create physics engines, and data scientists use it to find patterns in millions of data points. This isn\u2019t just school math \u2014 it\u2019s how the world runs.',
        young ? 'Tell someone at home one cool thing you learned about numbers today!' : 'Write down one way this concept connects to something you care about.'),
    ],
    questions: young
      ? [{ question: 'If you had 5 apples and gave 2 to a friend, how many would you have? Show with your fingers!', hint: 'Start with 5 fingers up, then put 2 down.', answer: '3' }]
      : [
        { question: 'Explain ' + tl + ' to someone who has never heard of it. Use an example from real life.', hint: 'Think of a concrete situation where this shows up.', answer: '' },
        { question: 'What would happen if this concept didn\u2019t exist? What would be harder?', hint: 'Think about building, cooking, or technology.', answer: '' },
      ],
    movement_break: young
      ? { activity: 'Jump up! Count to 10 as loud as you can while hopping on one foot. Then switch feet and count backwards from 10!', duration_minutes: 1 }
      : { activity: 'Stand up and stretch. Touch something in the room and estimate its length. Now measure it with your hand-spans. How close was your guess?', duration_minutes: 2 },
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
  const young = child.age <= 7
  return {
    subject: 'language_arts' as const,
    concept_node: concept,
    title: young ? 'The Magic of ' + t : t + ': Words That Work',
    hook: young
      ? 'Did you know that every story you\u2019ve ever loved started with someone who knew about ' + tl + '? Today you\u2019ll learn their secret!'
      : 'The most powerful people in history \u2014 leaders, inventors, storytellers \u2014 all mastered ' + tl + '. Here\u2019s how you can too.',
    segments: [
      seg('text', young ? 'Listen to This' : 'The Craft',
        young
          ? 'Words are like building blocks. ' + t + ' is one of the most important blocks! When you know how ' + tl + ' works, you can build stories, songs, and even secret messages.'
          : t + ' is the backbone of powerful communication. Every great book, speech, and even the best social media posts use ' + tl + ' deliberately. Understanding it gives you a superpower: the ability to make people listen, feel, and think.',
        young ? 'Listen to the sounds in the words around you. What do you notice?' : 'Read this carefully \u2014 notice how the best writers use this technique.'),
      seg('interactive', young ? 'Play With Words' : 'Your Workshop',
        young
          ? 'Now it\u2019s your turn to play! Can you find words that start with the same sound? Try saying them out loud \u2014 be silly, be loud, have fun!'
          : 'Create your own example of ' + tl + '. There\u2019s no wrong answer. Write two versions: one plain, one using what you just learned. Feel the difference?',
        young ? 'Say 3 words that start with the same sound. Bonus: make up a silly sentence!' : 'Write a short paragraph using ' + tl + '. Read it out loud \u2014 how does it sound?'),
      seg('text', young ? 'You\u2019re a Word Builder!' : 'Why This Matters Now',
        young
          ? 'Amazing! You just practiced ' + tl + '! Every time you talk, read a book, or tell a joke, you\u2019re using these skills. Even people who build voice assistants like Siri and Alexa need to understand how words work!'
          : t + ' isn\u2019t just for English class. Journalists use it to uncover truth. Programmers use clear language to write code that works. AI researchers study ' + tl + ' to teach computers to understand human language. Your words shape your world.',
        young ? 'Tell someone a silly word story before bed tonight!' : 'Find an example of ' + tl + ' in something you read today \u2014 a text, a website, anything.'),
    ],
    questions: young
      ? [{ question: 'What sound does the word "sun" start with? Can you think of 2 more words with the same sound?', hint: 'Ssssss... what else starts like that?', answer: 'S sound \u2014 snake, sand, star, etc.' }]
      : [{ question: 'Why do you think ' + tl + ' makes writing stronger? Give a specific example.', hint: 'Think about the difference between boring and interesting writing.', answer: '' }],
    movement_break: young
      ? { activity: 'Stand up and act out 3 animals \u2014 but only use sounds, no words! Can someone guess which animals you are?', duration_minutes: 1 }
      : { activity: 'Walk around the room and find 5 objects. Describe each one in exactly 3 words. Challenge: make your descriptions poetic.', duration_minutes: 2 },
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
  const young = child.age <= 7
  return {
    subject: 'science' as const,
    concept_node: concept,
    title: young ? 'Discovering ' + t : t + ': How It Really Works',
    hook: young
      ? 'Have you ever wondered why ' + tl + ' happens? Today you get to be a scientist and find out!'
      : 'What you think you know about ' + tl + ' might be wrong. Let\u2019s look at what\u2019s really going on \u2014 the answer is more amazing than you\u2019d guess.',
    segments: [
      seg('text', young ? 'Look Closely' : 'The Phenomenon',
        young
          ? t + ' is happening all around you, every single day! Look outside \u2014 can you spot it? Scientists are people who look at the world and ask "why?" and "how?" That\u2019s exactly what you\u2019re going to do right now.'
          : t + ' is one of the most fascinating phenomena in nature. Scientists have spent centuries studying it, and we\u2019re still making new discoveries. Here\u2019s what we know so far \u2014 and what makes it so remarkable.',
        young ? 'Look around you right now. What do you notice about ' + tl + '?' : 'Before reading on, write down what you think you already know about ' + tl + '. We\u2019ll check at the end.'),
      seg('interactive', young ? 'Be a Scientist' : 'Investigation',
        young
          ? 'Time for an experiment! You don\u2019t need a lab \u2014 just your eyes, ears, and curiosity. Go find something related to ' + tl + ' in your house or yard. Observe it closely for 30 seconds. What do you notice?'
          : 'Here\u2019s your challenge: design a simple test related to ' + tl + '. What would you change? What would you measure? What do you predict will happen? Real scientists always start with a prediction.',
        young ? 'Find something related to ' + tl + ' near you. Draw what you see!' : 'Write out your hypothesis and experiment design. What\u2019s your prediction?'),
      seg('text', young ? 'Wow, Did You Know?' : 'The Bigger Picture',
        young
          ? 'Here\u2019s something amazing: ' + tl + ' is connected to everything! Animals depend on it, plants need it, and scientists use special tools \u2014 even satellites in space \u2014 to study it. You\u2019re learning the same things real scientists study!'
          : 'Today, researchers use AI, satellite imagery, sensors, and computer models to study ' + tl + ' in ways that were impossible a decade ago. This field connects to climate science, medicine, engineering, and technology. The discoveries being made right now will shape your generation\u2019s world.',
        young ? 'What\u2019s one amazing thing you learned? Tell someone!' : 'Look back at what you wrote earlier. Did anything change? What surprised you?'),
    ],
    questions: young
      ? [{ question: 'What\u2019s one thing about ' + tl + ' that surprised you today?', hint: 'Think about something you didn\u2019t know before!', answer: '' }]
      : [
        { question: 'Explain ' + tl + ' to a younger kid. What would you say?', hint: 'Use simple words and a real example.', answer: '' },
        { question: 'What\u2019s one question about ' + tl + ' that scientists still haven\u2019t answered?', hint: 'Think about the edges of what we know.', answer: '' },
      ],
    movement_break: young
      ? { activity: 'Pretend you\u2019re a tiny seed growing into a giant tree! Start curled up small, then slowly stretch up tall, spread your branches, and sway in the wind.', duration_minutes: 1 }
      : { activity: 'Go outside or to a window. Take 5 slow breaths. Find one thing in nature related to what you just learned. Observe it for 30 seconds without talking.', duration_minutes: 2 },
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
  const young = child.age <= 7
  return {
    subject: 'social_studies' as const,
    concept_node: concept,
    title: young ? 'All About ' + t : t + ': Your World, Your Story',
    hook: young
      ? 'Did you know that you\u2019re part of something much bigger than you can see? Let\u2019s explore ' + tl + ' and find out how you\u2019re connected to people everywhere!'
      : 'The world you live in didn\u2019t happen by accident. ' + t + ' helps explain why things are the way they are \u2014 and what you can do about it.',
    segments: [
      seg('text', young ? 'Your World' : 'The Big Picture',
        young
          ? 'Look around you \u2014 your family, your home, your neighborhood. ' + t + ' is about understanding the people and places that make up your world. Every family is different, and that\u2019s what makes our world so interesting!'
          : t + ' is one of the fundamental forces shaping human civilization. Understanding it helps you make sense of the news, your community, and your own life. Let\u2019s break down what\u2019s really going on.',
        young ? 'Think about your family. What makes your family special?' : 'What do you already know about ' + tl + '? What have you heard about it?'),
      seg('interactive', young ? 'Draw and Tell' : 'Think Deeper',
        young
          ? 'Draw a picture of ' + tl + ' in your life! It could be your family, your neighborhood, or your favorite community helper. Add labels if you can!'
          : 'Here\u2019s a challenge: look at ' + tl + ' from two different perspectives. How might someone in another country, another time period, or another situation see this differently? Being able to see multiple sides is one of the most valuable skills you can develop.',
        young ? 'Draw a picture and tell someone about it!' : 'Write down two different perspectives on ' + tl + '. Which one surprised you more?'),
      seg('text', young ? 'People Are Amazing' : 'Connected to Your Future',
        young
          ? 'People all over the world care about ' + tl + '. When we understand each other, we can help each other. Even kids like you can make a difference in their community! Some kids use tablets and video calls to connect with friends in other countries.'
          : t + ' connects to real careers: diplomats, urban planners, data analysts, journalists, nonprofit leaders, and technologists all work with these ideas daily. The internet and AI are creating new ways for people to organize, protest, create, and govern. Your generation will reshape ' + tl + ' with tools that don\u2019t even exist yet.',
        young ? 'What\u2019s one kind thing you could do for someone in your community this week?' : 'If you could change one thing about how ' + tl + ' works in your community, what would it be?'),
    ],
    questions: young
      ? [{ question: 'Who are 3 important people in your community? Why are they important?', hint: 'Think about people who help, teach, or take care of others.', answer: '' }]
      : [{ question: 'How has technology changed ' + tl + ' compared to 50 years ago? Is the change good, bad, or both?', hint: 'Think about communication, transportation, and information.', answer: '' }],
    movement_break: young
      ? { activity: 'Walk around your home and wave to everyone you see. Give someone a high five! If you\u2019re alone, wave to yourself in a mirror and make a funny face.', duration_minutes: 1 }
      : { activity: 'Go to a window or step outside. Look at your neighborhood for 1 minute. Count how many different things you can see that were built or created by people working together.', duration_minutes: 2 },
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
export interface GenerationProgress {
  current: number
  total: number
  subject: string
  status: 'generating' | 'done' | 'error'
}

export async function generateTodayLessons(
  child: Child,
  onProgress?: (progress: GenerationProgress) => void,
): Promise<void> {
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

  // Find which subjects still need lessons today
  const { data: existingLessons } = await supabase
    .from('lessons')
    .select('subject')
    .eq('child_id', child.id)
    .eq('scheduled_for', today)

  const existingSubjects = new Set((existingLessons ?? []).map((l: { subject: string }) => l.subject))
  const missingSubjects = child.subjects.filter((s) => !existingSubjects.has(s))

  if (missingSubjects.length === 0) return

  const total = missingSubjects.length
  for (let i = 0; i < missingSubjects.length; i++) {
    const subject = missingSubjects[i]
    const concepts = getNextConcepts(child, subject, completedConcepts, 1)
    const concept = concepts[0] ?? getConceptsForChild(child, subject)[0]
    const label = subject.replace('_', ' ')

    onProgress?.({ current: i + 1, total, subject: label, status: 'generating' })

    let lesson: LessonData
    if (AI_ENABLED) {
      console.log('[Seed] AI generating:', subject, concept)
      const aiLesson = await generateWithClaude(child, subject, concept, blockMinutes)
      if (aiLesson) {
        console.log('[Seed] AI lesson created:', aiLesson.title)
        lesson = aiLesson
      } else {
        console.warn('[Seed] AI failed, using template for:', subject)
        lesson = BUILDERS[subject](concept, child, blockMinutes)
      }
    } else {
      console.log('[Seed] AI not enabled, using template for:', subject)
      lesson = BUILDERS[subject](concept, child, blockMinutes)
    }

    // Insert each lesson immediately so it appears in the UI right away
    const { error: insertErr } = await supabase
      .from('lessons')
      .insert({
        ...lesson,
        child_id: child.id,
        scheduled_for: today,
      })

    if (insertErr) {
      console.error('Failed to insert lesson:', subject, insertErr)
    }

    onProgress?.({ current: i + 1, total, subject: label, status: 'done' })
  }
}

async function generateWithClaude(
  child: Child,
  subject: Subject,
  concept: string,
  minutes: number,
): Promise<LessonData | null> {
  try {
    const prompt = buildLessonPrompt({ child, subject, conceptNode: concept })

    const res = await fetch('/api/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!res.ok) {
      console.error('Claude API error:', res.status, await res.text())
      return null
    }

    const data = await res.json()
    const text = data.content?.[0]?.text
    if (!text) return null

    // Extract JSON from response (may be wrapped in markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null

    const parsed = JSON.parse(jsonMatch[0])

    // Validate required fields
    if (!parsed.title || !parsed.segments || !Array.isArray(parsed.segments) || parsed.segments.length === 0) {
      if (import.meta.env.DEV) console.warn('[Seed] Claude returned invalid lesson structure:', parsed)
      return null
    }

    // Validate each segment has content
    const validSegments = parsed.segments
      .filter((s: Record<string, string>) => s.content && s.title)
      .map((s: Record<string, string>) => ({
        type: s.type ?? 'text',
        title: s.title,
        content: s.content,
        instructions: s.instructions ?? '',
      }))

    if (validSegments.length === 0) return null

    return {
      subject,
      concept_node: concept,
      title: parsed.title,
      hook: parsed.hook ?? null,
      segments: validSegments,
      questions: Array.isArray(parsed.questions) ? parsed.questions.filter((q: Record<string, string>) => q.question) : [],
      movement_break: parsed.movement_break ?? { activity: 'Take a stretch break!', duration_minutes: 2 },
      estimated_minutes: minutes,
      pedagogy_source: 'claude-ai',
      content_axis: child.content_axis,
      language: child.language,
      status: 'pending' as const,
      scheduled_for: null,
    }
  } catch (e) {
    console.error('Claude generation failed for', subject, concept, e)
    return null
  }
}
