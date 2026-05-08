# 🌱 SEED — Personalized Homeschool Learning Platform

> A world-class homeschool platform that builds customized learning paths for kids ages 5–13 using the best principles from leading education systems worldwide. Calm, beautiful, parent-friendly, tablet-first, and genuinely loved by families.

**Tagline**: *"A calm, curious place to grow."*

---

## 📑 TABLE OF CONTENTS

1. Project Vision
2. Tech Stack
3. Design Principles
4. User Roles
5. Authentication & COPPA Consent
6. Child Profile Setup
7. The Seed Curriculum Engine
8. The 13 Magical Features
9. Platform Foundations (Non-Negotiable)
10. Database Schema
11. File Structure
12. Environment Variables
13. v1 Sprint Plan (Sprints 0–8)
14. v2 Sprint Plan (Sprints 9–14)
15. Acceptance Criteria
16. Safety & Guardrails
17. Build Instructions for Claude Code

---

## 🎯 1. PROJECT VISION

Seed is a complete homeschool learning platform — not a curriculum matcher, not a recommendation engine, but the actual place where kids learn every day. Each child gets a personalized curriculum synthesized from the world's best educational systems (Singapore Math, Finnish phenomenon-based science, Classical writing, Japanese lesson structure, Montessori self-direction, Charlotte Mason living books). Lessons are calibrated to developmental attention spans, paced with movement breaks, and delivered through a calm Google-inspired interface designed to spark curiosity rather than dopamine loops.

Parents add their kids in 90 seconds, set preferences, and Seed handles the rest: daily lesson plans, mastery progression, AI guidance, progress reports, and state compliance documentation.

---

## 🛠️ 2. TECH STACK

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| Styling | TailwindCSS + shadcn/ui |
| Backend | Supabase (Auth, Postgres, Storage, RLS, Realtime) |
| AI | Anthropic API (Claude Sonnet 4) — server-side only |
| Hosting | Vercel |
| Email | Resend (weekly parent reports, invites) |
| Charts | Recharts |
| Icons | Lucide React |
| Fonts | Fraunces (display), Inter (body), OpenDyslexic (a11y) |
| Analytics | PostHog (privacy-respecting; parent-only events) |
| Errors | Sentry |
| Payments | Stripe |
| PDF | react-pdf for print exports |

---

## 🎨 3. DESIGN PRINCIPLES (NON-NEGOTIABLE)

1. **Tablet-first, not desktop-first.** Primary canvas is iPad portrait + landscape. Desktop is secondary. Phone is parent-progress-only.
2. **Calm over stimulating.** No badges, no streaks, no points, no confetti, no XP. Learning is the reward.
3. **One primary action per screen.** The next step is always obvious. No menus inside lessons.
4. **Whitespace as a feature.** Generous padding, max 2 fonts, max 3 accent colors visible at once.
5. **Touch-first.** All targets ≥44px. Drag-drop tested with finger, not mouse.
6. **Sound off by default.** Optional subtle haptic on completion.
7. **No tech savviness required.** A grandparent should be able to add a kid and start a lesson.
8. **Beautiful, not childish.** Sophisticated, warm, gallery-quality. Inspired by Headspace, Apple Health, Linear, Notion Calendar.
9. **Reading-first typography.** Lesson body text 18–20px, line-height 1.7.
10. **Accessibility is built in, not bolted on.** Dyslexia font, reduced motion, extended time, larger text — toggleable per child.

### Color Palette
```
Background:    #FAFAF7  warm off-white
Surface:       #FFFFFF
Text Primary:  #1A1A1A
Text Muted:    #6B6B66
Sage:          #87A878  primary accent — progress, growth
Terracotta:    #C97C5D  warm accent — celebration moments
Sky:           #7A9CC6  secondary accent — info, links
Soft Border:   #E8E6DF
Success:       #87A878
```

### Typography
- **Display**: `Fraunces` — warm serif (headings, kid names, lesson titles)
- **Body**: `Inter` — clean, highly legible
- **Accessibility alt**: `OpenDyslexic` — togglable per child
- Body lesson text: 18–20px, line-height 1.7

---

## 👥 4. USER ROLES

1. **Parent (account owner)** — signs up, manages billing, adds children, views progress, configures preferences, invites other adults.
2. **Co-Parent / Guest Adult** — invited by parent. Roles: `co_parent` (full edit), `grandparent` / `tutor` (view + comment), `viewer` (view-only).
3. **Child (profile under parent)** — has their own dashboard, daily path, and personalized curriculum. **No login of their own**; child profile is selected from the family home screen. Parent is always the data controller (COPPA-required).

---

## 🔐 5. AUTHENTICATION & COPPA CONSENT

### Auth Provider
Supabase Auth.

### Methods
- Email + password
- Google OAuth
- Magic link (email)

### Signup Flow
1. Landing page → "Get Started" CTA
2. Parent signs up (email + password OR Google)
3. Email verification (auto-skipped for OAuth)
4. **COPPA Consent Screen** *(legally required before any child profile)*:
   - Plain-English explanation of what data is collected and why
   - Privacy Policy + Terms of Service links (both must be acknowledged)
   - Verifiable parental consent checkbox: *"I am the parent or legal guardian. I consent to Seed collecting and processing my child's data as described."*
   - Logged to `parental_consents` table with timestamp, IP, user agent, consent version, policy version
5. Parent onboarding (name, timezone)
6. Per-child setup wizard
7. Land on Family Home

### Session Persistence
Supabase session in secure cookie; auto-refresh on load.

### Row Level Security
**EVERY** table enforces `parent_id = auth.uid()` (or descends through `child_id → parent_id`). Parents can only ever see/modify their own family's data. Guest adults inherit scoped access via `family_invites`.

### Re-consent on Policy Updates
Any change to data practices requires re-consent before the parent can continue using Seed.

---

## 👶 6. CHILD PROFILE SETUP

Per-child setup wizard (≤ 90 seconds, 8 steps):

1. **Name** — first name only
2. **Age** — 5 to 13 (drives lesson length, content depth, pedagogy weighting)
3. **Gender / Pronouns** — He / She / They (used in AI companion responses, lesson framing, portfolio narration). Default: They.
4. **Language** — English, Spanish, Mandarin, French, German (lesson UI + AI companion language at MVP)
5. **Subjects** — multi-select: Math, Language Arts, Science, Social Studies (all on by default)
6. **Pedagogy lean** — *Calm & nature-based* (Charlotte Mason / Waldorf) / *Structured & rigorous* (Classical / Singapore) / *Child-led & project-based* (Montessori / Reggio) / *Balanced blend* (default)
7. **Content axis** *(critical segmentation)* — *Secular* / *Faith-neutral* / *Christian* / *Latter-day Saint* / *Jewish* / *Other / Custom*. Affects history framing, science narration (evolution, age of earth), reading lists, holidays. Default: *Faith-neutral*.
8. **Accommodations** — togglable: *Dyslexia-friendly font*, *Reduced motion*, *Extended time*, *Larger text*, *Shorter blocks (ADHD)*, *Faster pacing (gifted)*. All off by default.

Output: a personalized `curriculum_profile` written to Supabase, then a 12-month curriculum scaffolded by the **Seed Curriculum Engine**.

---

## 🌍 7. THE SEED CURRICULUM ENGINE

The differentiator. Every lesson is generated/selected by blending the strongest method for each subject:

| Subject | Primary Methodology | Why |
|---|---|---|
| Math | **Singapore (mastery + bar models)** + **Shanghai (variation theory)** | Highest math outcomes globally |
| Language Arts (Reading) | **Charlotte Mason (living books)** + **Finnish (phonemic depth)** | Builds deep readers |
| Language Arts (Writing) | **Classical Trivium** (grammar → logic → rhetoric) | Time-tested progression |
| Science | **Finnish phenomenon-based** + **Japanese lesson study structure** | Inquiry + craftsmanship |
| Social Studies | **Estonian computational thinking** + **IB inquiry** | Critical, global citizens |
| Whole Child | **Montessori** + **Waldorf** + **Reggio Emilia** | Calm, curious humans |

### Attention-Span Calibration

| Age | Single Block | Daily Total | Movement Break |
|---|---|---|---|
| 5–6 | 10 min | 60–75 min | Every 10 min |
| 7–8 | 15 min | 90 min | Every 15 min |
| 9–10 | 20 min | 2 hr | Every 20 min |
| 11–13 | 25–30 min | 2.5 hr | Every 25 min |

### Content Axis Logic
The `content_axis` setting modulates lesson generation:
- **Secular**: Standard scientific consensus (evolution, ~13.8B-year universe). Holidays from a cultural lens. Reading lists from broad canon.
- **Faith-neutral**: Avoids creation/origin claims either direction. Diverse reading lists. Holidays from world cultures.
- **Christian**: Bible-integrated history and reading. Origin-of-life lessons present scientific consensus *and* Christian framings respectfully. Includes faith-aligned classics.
- **Latter-day Saint**: Christian framing + LDS-specific history and Book of Mormon cultural context where age-appropriate.
- **Jewish**: Tanakh-integrated history and reading. Hebrew calendar + holidays. Diaspora history emphasis.
- **Other / Custom**: Parent-supplied notes inform the lesson generation prompt.

### Lesson Generation
Lessons generated by Claude (Anthropic API, server-side) at scaffold time and stored in Supabase. The generation prompt receives:
- Child's age, gender pronouns, language, pedagogy lean, content axis, accommodations
- Subject + current concept node in mastery graph
- Prior lesson summaries for continuity
- Required output: title, hook (1–2 sentences of curiosity), 3–5 interactive segments, 2 check-for-understanding questions, suggested movement break, optional Wonder prompt

Lessons cycle through interaction modes (drag-drop, draw, voice answer, click-to-explore, simulation) so no two consecutive lessons feel the same.

### Lazy Generation (Cost Discipline)
Generate next 2 weeks of lessons at a time. Refill on completion. Never scaffold 12 months upfront. Token cost is logged to `usage_logs` per child.

---

## 🌟 8. THE 13 MAGICAL FEATURES

### 1. Global Best-Of Curriculum Engine
Each lesson uses the strongest pedagogy for that subject. Family is never locked into one school of thought.

### 2. Age-Calibrated Lesson Blocks
Lesson length auto-tuned to developmental attention windows. Hard cap on block length per age.

### 3. Brain Breaks & Movement Prompts
2–5 min movement, breathing, or sensory activity between blocks. AI-generated based on age, time of day, energy level. Visual + audio guided.

### 4. Guided "Today" Path
Kid logs in to ONE screen showing today's flow as a vertical timeline: lesson → break → lesson → project → done. No menus. No choice paralysis.

### 5. Mastery Progression (No Grades)
Concept-by-concept advancement using a spiral curriculum. Framing is always "ready for next" — never "behind." Mastery graph visualized for parents.

### 6. AI Learning Companion (Socratic, Kid-Safe)
Anthropic-API-powered tutor that asks guiding questions, never gives direct answers. Strict content guardrails. Speaks in the child's selected language and gendered pronouns.

### 7. Interactive Multi-Modal Lessons
Drag-drop, draw canvas, voice answer, simulations, click-to-explore, digital manipulatives. Each lesson cycles 2–3 modes.

### 8. Parent Progress Hub (30-second glance)
Per-child weekly view: plain-English summary, per-lesson progress bars, subject mastery map, engagement heatmap, time spent per subject.

### 9. Family Rhythm Planner
Weekly view inspired by Waldorf/Charlotte Mason: morning meeting, subject blocks, nature time, read-aloud, handicrafts. Pre-built pedagogy templates + drag-drop custom builder.

### 10. State Compliance Auto-Reports
One-click attendance logs, portfolios, hour tracking, evaluation summaries — formatted per US state requirements. **MVP states**: TX, FL, NC, GA, VA, CA, MI, PA, TN, OH (top 10 by homeschool population).

### 11. ✨ Wonder Wall
During any lesson, kid can ask "why?" (typed or voice). Question is captured. Next morning, that question becomes a 5-minute bonus curiosity lesson built specifically for them. Parents see a live feed of their child's curiosities.

### 12. ✨ Memory Keepsake
Auto-generated visual portfolio — drawings, voice answers, breakthrough moments, lesson highlights, parent-favorited moments. End-of-year printable PDF book at MVP. (Hardcover print-on-demand in v2.)

### 13. ✨ Family Together Time
One lesson per week designed for parent + child as a duo (kitchen chemistry, backyard ecology, read-aloud with discussion prompts). Parents feel meaningfully involved without planning a thing.

---

## 🧱 9. PLATFORM FOUNDATIONS (NON-NEGOTIABLE)

These aren't marketing features — they're the table stakes that make Seed a serious product, legally compliant, and trustworthy.

### A. COPPA Compliance & Privacy
- Verifiable parental consent before any child profile
- Privacy Policy + ToS (lawyer-reviewed before public launch)
- Data deletion on request (parent can delete child profile + all associated data)
- No behavioral ads, ever
- Voice recordings auto-deleted after 90 days unless parent-favorited
- Re-consent on any policy change

### B. Tablet-First Responsive Design
- Primary: iPad portrait + landscape (1024×768 → 1366×1024)
- Secondary: Desktop (≥1280px wide)
- Tertiary: Phone, parent-progress views only (kid lesson player blocked under 768px with helpful redirect)
- Every interactive element ≥44×44px touch target
- PWA-installable (homescreen icon, offline shell)

### C. Accommodations System
Per-child toggles surfaced both at setup and in settings:
- Dyslexia-friendly font (OpenDyslexic) — applies to all lesson body text
- Reduced motion — disables all animations beyond fades
- Extended time — adds 50% to any timed exercise
- Larger text — bumps body text +2 sizes
- Shorter blocks — clips lesson length by 30%
- Faster pacing — skips intro recaps, surfaces challenge variants

### D. Content Axis Setting
See section 7. Per-family default + per-child override available.

### E. Print-Friendly Outputs
- Every lesson: "Print this lesson" → clean PDF (no UI chrome, generous margins, B&W friendly)
- Weekly schedule print
- Compliance reports (already covered)
- Worksheets and lab sheets when relevant
- Coloring pages for younger ages

### F. Lesson Feedback Loop
Parent thumbs-up / thumbs-down on every completed lesson with one-tap reasons:
- Down: *Too hard, too easy, boring, off-topic, factual error, tone issue, other*
- Up: *Loved it, perfect difficulty, sparked curiosity, other*
- Feedback feeds into a `lesson_feedback` table; aggregated weekly to refine generation prompt
- Without this loop, bad lessons compound silently

### G. Cost Guardrails
- Anthropic API calls only via server-side Vercel function (`/api/claude`)
- Per-child monthly token budget; throttle on free tier
- All API usage logged to `usage_logs` (input/output tokens, cost in USD)
- Parent dashboard shows current month's AI usage (transparency + trust)

### H. Multi-Adult Access
- `family_invites` table; email-based invite with role
- Roles: `co_parent` (full edit), `grandparent` / `tutor` (view + comment), `viewer` (view-only)
- Co-parent invite works for divorced co-parents, two-parent households, blended families
- Each invited adult has their own auth session; RLS enforces scoped access via invite linkage

### I. Observability
- Sentry: error monitoring with PII scrubbed (no kid data)
- PostHog: privacy-respecting product analytics, *parent-only events*. Kid lesson behavior is **never** tracked at the analytics layer (only inside Supabase for parent-facing reports).

### J. Backups & Data Export
- Supabase nightly backups (7-day retention)
- Parent can export full family data as JSON anytime
- Parent can request full deletion (COPPA right)

---

## 🗂️ 10. DATABASE SCHEMA (Supabase / Postgres)

```sql
-- ============ AUTH ============
-- handled by Supabase auth.users

-- ============ PARENTS ============
create table parents (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  full_name text,
  timezone text default 'America/Denver',
  subscription_tier text default 'free' check (subscription_tier in ('free','solo','family')),
  stripe_customer_id text,
  default_content_axis text default 'faith_neutral',
  created_at timestamptz default now()
);

-- ============ CHILDREN ============
create table children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references parents(id) on delete cascade,
  name text not null,
  age int not null check (age between 5 and 13),
  gender text default 'they' check (gender in ('he','she','they')),
  language text default 'en' check (language in ('en','es','zh','fr','de')),
  subjects text[] default array['math','language_arts','science','social_studies'],
  pedagogy_lean text default 'balanced' check (pedagogy_lean in ('calm','structured','child_led','balanced')),
  content_axis text default 'faith_neutral' check (content_axis in ('secular','faith_neutral','christian','lds','jewish','other')),
  content_axis_notes text,
  accommodations jsonb default '{
    "dyslexia_font": false,
    "reduced_motion": false,
    "extended_time": false,
    "larger_text": false,
    "shorter_blocks": false,
    "faster_pacing": false
  }'::jsonb,
  avatar_color text default '#87A878',
  created_at timestamptz default now()
);

-- ============ PARENTAL CONSENTS (COPPA) ============
create table parental_consents (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references parents(id) on delete cascade,
  child_id uuid references children(id) on delete cascade,
  consented_at timestamptz default now(),
  ip_address inet,
  user_agent text,
  consent_version text not null,
  privacy_policy_version text not null,
  tos_version text not null
);

-- ============ FAMILY INVITES (multi-adult access) ============
create table family_invites (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references parents(id) on delete cascade,
  email text not null,
  role text not null check (role in ('co_parent','grandparent','tutor','viewer')),
  status text default 'pending' check (status in ('pending','accepted','revoked')),
  invite_token text unique not null,
  invited_user_id uuid references auth.users,
  created_at timestamptz default now(),
  accepted_at timestamptz
);

-- ============ CURRICULA ============
create table curricula (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references children(id) on delete cascade,
  subject text not null,
  generated_at timestamptz default now(),
  spec jsonb not null
);

-- ============ LESSONS ============
create table lessons (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references children(id) on delete cascade,
  curriculum_id uuid references curricula(id) on delete cascade,
  subject text not null,
  concept_node text not null,
  title text not null,
  hook text,
  segments jsonb not null,
  questions jsonb,
  movement_break jsonb,
  estimated_minutes int,
  pedagogy_source text,
  content_axis text,
  language text,
  status text default 'pending' check (status in ('pending','in_progress','completed','skipped')),
  scheduled_for date,
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- ============ LESSON PROGRESS ============
create table lesson_progress (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references lessons(id) on delete cascade,
  child_id uuid references children(id) on delete cascade,
  segment_index int,
  response jsonb,
  correct boolean,
  time_spent_seconds int,
  created_at timestamptz default now()
);

-- ============ LESSON FEEDBACK ============
create table lesson_feedback (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references lessons(id) on delete cascade,
  child_id uuid references children(id) on delete cascade,
  parent_id uuid references parents(id) on delete cascade,
  rating int check (rating in (-1, 1)),
  reason text,
  notes text,
  created_at timestamptz default now()
);

-- ============ MASTERY ============
create table mastery_state (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references children(id) on delete cascade,
  subject text not null,
  concept_node text not null,
  level text default 'introduced' check (level in ('introduced','practicing','proficient','mastered')),
  last_seen_at timestamptz default now(),
  unique(child_id, concept_node)
);

-- ============ WONDER WALL ============
create table wonder_questions (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references children(id) on delete cascade,
  parent_lesson_id uuid references lessons(id) on delete set null,
  question_text text not null,
  status text default 'pending' check (status in ('pending','answered','dismissed')),
  bonus_lesson_id uuid references lessons(id) on delete set null,
  created_at timestamptz default now()
);

-- ============ KEEPSAKE / PORTFOLIO ============
create table portfolio_entries (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references children(id) on delete cascade,
  lesson_id uuid references lessons(id) on delete set null,
  entry_type text check (entry_type in ('drawing','voice','text','milestone','parent_favorite')),
  title text,
  storage_path text,
  caption text,
  is_parent_favorite boolean default false,
  created_at timestamptz default now()
);

-- ============ FAMILY RHYTHM ============
create table family_rhythm (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references parents(id) on delete cascade,
  schedule jsonb not null,
  template text,
  updated_at timestamptz default now()
);

-- ============ COMPLIANCE ============
create table compliance_logs (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references children(id) on delete cascade,
  date date not null,
  hours_logged numeric,
  subjects_covered text[],
  notes text,
  created_at timestamptz default now(),
  unique(child_id, date)
);

-- ============ USAGE LOGS (cost guardrails) ============
create table usage_logs (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references parents(id) on delete cascade,
  child_id uuid references children(id) on delete cascade,
  endpoint text not null,
  input_tokens int,
  output_tokens int,
  cost_usd numeric,
  created_at timestamptz default now()
);

-- ============ RLS POLICIES ============
-- Enable RLS on every table.
alter table parents enable row level security;
alter table children enable row level security;
alter table parental_consents enable row level security;
alter table family_invites enable row level security;
alter table curricula enable row level security;
alter table lessons enable row level security;
alter table lesson_progress enable row level security;
alter table lesson_feedback enable row level security;
alter table mastery_state enable row level security;
alter table wonder_questions enable row level security;
alter table portfolio_entries enable row level security;
alter table family_rhythm enable row level security;
alter table compliance_logs enable row level security;
alter table usage_logs enable row level security;

-- Parent owns their own row.
create policy "parents_self" on parents
  for all using (id = auth.uid());

-- Parent owns their children.
create policy "parents_own_children" on children
  for all using (parent_id = auth.uid());

-- (Mirror for every other table via parent_id or child_id → parent ownership chain.
-- For invited adults, expand policies via family_invites linkage.)
```

---

## 📂 11. FILE STRUCTURE

```
seed/
├── public/
│   ├── fonts/
│   └── manifest.json                    # PWA
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── anthropic.ts                 # client wrapper around /api/claude
│   │   ├── curriculum-engine.ts
│   │   ├── attention-spans.ts
│   │   ├── content-axis.ts
│   │   ├── accommodations.ts
│   │   ├── coppa.ts
│   │   ├── i18n.ts
│   │   ├── pronouns.ts
│   │   ├── print.ts
│   │   └── usage-tracker.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useChild.ts
│   │   ├── useTodayPath.ts
│   │   ├── useMastery.ts
│   │   └── useAccommodations.ts
│   ├── components/
│   │   ├── ui/                          # shadcn primitives
│   │   ├── layout/
│   │   │   ├── ParentShell.tsx
│   │   │   └── ChildShell.tsx
│   │   ├── lesson/
│   │   │   ├── LessonPlayer.tsx
│   │   │   ├── DragDropSegment.tsx
│   │   │   ├── DrawCanvasSegment.tsx
│   │   │   ├── VoiceAnswerSegment.tsx
│   │   │   ├── ClickExploreSegment.tsx
│   │   │   ├── SimulationSegment.tsx
│   │   │   ├── MovementBreak.tsx
│   │   │   ├── AICompanion.tsx
│   │   │   ├── FeedbackButton.tsx
│   │   │   └── PrintLessonButton.tsx
│   │   ├── parent/
│   │   │   ├── ProgressHub.tsx
│   │   │   ├── MasteryMap.tsx
│   │   │   ├── EngagementHeatmap.tsx
│   │   │   ├── WeeklyReport.tsx
│   │   │   ├── ComplianceReport.tsx
│   │   │   ├── UsageMeter.tsx
│   │   │   └── AdultInvites.tsx
│   │   ├── wonder/
│   │   │   ├── WonderWallFeed.tsx
│   │   │   └── AskWonderButton.tsx
│   │   ├── keepsake/
│   │   │   ├── PortfolioGallery.tsx
│   │   │   └── KeepsakePDFExport.tsx
│   │   ├── rhythm/
│   │   │   └── RhythmPlanner.tsx
│   │   └── consent/
│   │       └── COPPAConsentScreen.tsx
│   ├── pages/
│   │   ├── Landing.tsx
│   │   ├── SignUp.tsx
│   │   ├── SignIn.tsx
│   │   ├── COPPAConsent.tsx
│   │   ├── ParentOnboarding.tsx
│   │   ├── ChildSetup.tsx
│   │   ├── FamilyHome.tsx
│   │   ├── ChildToday.tsx
│   │   ├── LessonView.tsx
│   │   ├── ParentDashboard.tsx
│   │   ├── WonderWall.tsx
│   │   ├── Keepsake.tsx
│   │   ├── Rhythm.tsx
│   │   ├── Compliance.tsx
│   │   ├── PrintView.tsx
│   │   ├── InviteAccept.tsx
│   │   ├── Settings.tsx
│   │   ├── PrivacyPolicy.tsx
│   │   └── TermsOfService.tsx
│   ├── api/                             # Vercel serverless functions
│   │   ├── claude.ts                    # all Anthropic API calls go here
│   │   ├── stripe-webhook.ts
│   │   ├── send-invite.ts
│   │   └── weekly-report.ts             # cron
│   ├── styles/
│   │   └── globals.css
│   └── types/
│       └── index.ts
├── supabase/
│   ├── migrations/
│   │   └── 0001_init.sql
│   └── seed.sql
├── legal/
│   ├── privacy-policy.md
│   ├── terms-of-service.md
│   └── consent-language.md
├── .env.example
├── tailwind.config.ts
├── vite.config.ts
├── package.json
└── README.md
```

---

## 🔑 12. ENVIRONMENT VARIABLES

```bash
# .env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_POSTHOG_KEY=
VITE_SENTRY_DSN=

# Server-side only (Vercel functions)
ANTHROPIC_API_KEY=
RESEND_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
SUPABASE_SERVICE_ROLE_KEY=
```

> **Important**: Anthropic API calls go through a Vercel serverless function (`/api/claude`) — never expose the key to the client.

---

## 🚀 13. v1 SPRINT PLAN (Sprints 0–8)

### Sprint 0 — Legal & Foundation
- Vite + React + TS + Tailwind + shadcn/ui scaffold
- Fraunces + Inter + OpenDyslexic fonts wired
- Supabase project + migrations 0001 (all tables + RLS)
- Sentry + PostHog wired (parent-only events)
- Draft Privacy Policy, ToS, COPPA consent language (placeholder; flag for lawyer review before public launch)
- PWA manifest + service worker shell

### Sprint 1 — Auth + COPPA Consent + Parent Onboarding
- Auth flow (email/password + Google OAuth + magic link)
- COPPA consent screen with versioned consent logging
- Landing page (calm, beautiful, "Get Started")
- Parent onboarding (name, timezone, default content axis)
- ParentShell layout (tablet-first)

### Sprint 2 — Child Setup + Family Home
- Child setup wizard (8 steps incl. content axis + accommodations)
- FamilyHome page (parent's hub: "Pick a child" tile grid)
- Add/edit/delete children
- Settings page (account, kids, language, gender, content axis, accommodations, subscription)
- i18n scaffolding for 5 languages

### Sprint 3 — Curriculum Engine + Today Path
- `curriculum-engine.ts`: lazy 2-week scaffold per child
- `/api/claude` Vercel function for lesson generation with content axis + accommodations + pedagogy weighting
- `usage_logs` writes on every API call
- ChildToday page: vertical timeline for the day
- Daily path generator

> ✅ **Checkpoint**: After this sprint, generate one real lesson and share it with Claude (in chat) to harden the generation prompt against blandness before building Sprint 4.

### Sprint 4 — Lesson Player (Multi-Modal)
- LessonPlayer shell with segment renderer
- DragDrop, DrawCanvas, VoiceAnswer, ClickExplore, Simulation segments
- MovementBreak component (calm, age-appropriate)
- Per-segment progress persistence
- Lesson completion → `mastery_state` update + `portfolio_entry` capture
- Print Lesson button → clean PDF
- Feedback Button (👍 / 👎 + reason)
- Accommodations applied at runtime (font, motion, text size, time)

### Sprint 5 — AI Companion + Wonder Wall
- AICompanion floating button (kid-safe, Socratic, language- and pronoun-aware)
- Strict guardrails (system prompt + content filter)
- AskWonderButton in lessons → captures to `wonder_questions`
- Vercel cron: turn pending Wonder questions into bonus mini-lessons overnight
- WonderWall page (parent feed of curiosities)

### Sprint 6 — Parent Progress Hub + Feedback Loop
- ProgressHub: per-child weekly summary (AI-generated plain English)
- MasteryMap (concept graph, Recharts)
- EngagementHeatmap
- WeeklyReport email via Resend (Sundays)
- Per-lesson progress bars + completion indicators
- UsageMeter (current month's AI cost — transparency)
- Feedback aggregation dashboard (internal, for prompt-tuning)

### Sprint 7 — Memory Keepsake + Family Rhythm + Together Time
- Portfolio capture pipeline (drawings, voice clips → Supabase Storage)
- PortfolioGallery (parent + child views)
- Parent "favorite" toggle
- Keepsake PDF export (year-in-review book layout)
- RhythmPlanner with templates (Charlotte Mason, Classical, Custom)
- Family Together lesson generator (1/week, parent + child)

### Sprint 8 — Compliance + Multi-Adult + Stripe + Polish + Launch
- Compliance reports for top 10 states (TX, FL, NC, GA, VA, CA, MI, PA, TN, OH)
- Hour logging auto-tracked from `lesson_progress`
- Family invites flow (co-parent, grandparent, tutor, viewer roles + accept page)
- Stripe billing (Free / Solo $19/mo / Family $29/mo) with 14-day trial
- Data export + deletion endpoints
- Onboarding polish, empty states, loading states, error states
- Performance pass, accessibility pass (WCAG AA)
- Lawyer-reviewed legal docs locked in
- Vercel production deploy

---

## 🌱 14. v2 SPRINT PLAN (Sprints 9–14)

These are scoped but explicitly *not* required for launch. Build only after v1 is stable and you have real-user signal.

### Sprint 9 — Co-op / Pod Features
- Multi-family "pods" (homeschool co-ops): a parent can join or create a pod
- Shared lessons across pod kids (same age, same subject)
- Pod-level chat (parents only)
- Shared field-trip planning
- Pod admin role
- New tables: `pods`, `pod_memberships`, `shared_lessons`

### Sprint 10 — Native iPad App
- Capacitor wrap of existing PWA (fastest path)
- Native iPad gestures (Apple Pencil for DrawCanvas, haptics)
- Offline mode for already-generated lessons
- App Store listing + COPPA-compliant kids-category submission
- Push notifications (parent-only) for weekly reports + Wonder feed digests

### Sprint 11 — Print-on-Demand Keepsake Books
- Lulu / Blurb API integration
- One-tap order from Keepsake page
- Dynamic layout engine (drawings, voice transcripts, milestones, parent notes)
- Year-in-review hardcover, softcover, and digital options
- Stripe charges + shipping
- Gift order flow (grandparents)

### Sprint 12 — Foreign Language Learning (Subject)
- Language as a *subject*, not just UI translation
- Languages: Spanish, Mandarin, French, German, Latin, ASL
- Methodology blend: Comprehensible Input (Krashen) + spaced repetition + Charlotte Mason narration
- Voice-input pronunciation feedback (Web Speech API or Whisper API)
- Daily practice integrated into Today Path

### Sprint 13 — Advanced Learning Differences
- Dyslexia screener (parent-administered, evidence-based)
- ADHD-aware pacing (Pomodoro variants, energy-level check-ins)
- Gifted enrichment lessons (faster, deeper, lateral)
- Autism-friendly mode (sensory-light, predictable structure, social-story integration)
- Twice-exceptional (2e) support
- IEP-style goal tracking parents can manage themselves
- New table: `learning_profiles`

### Sprint 14 — International Expansion + GDPR
- GDPR compliance (EU + UK)
- Country-specific homeschool legal compliance (UK, Canada, Australia, NZ, Germany hardest)
- Local payment methods (SEPA, BACS, etc.)
- Currency localization
- Additional languages (Italian, Portuguese, Dutch, Japanese)
- Country-specific curriculum standards alignment (UK National Curriculum, Australian Curriculum, etc.)

---

## ✅ 15. ACCEPTANCE CRITERIA (v1)

A new parent can:
1. Sign up in under 60 seconds (email or Google)
2. Read clear COPPA consent language and provide verifiable consent (logged)
3. Add a child in under 90 seconds with content axis + accommodations
4. Land on the child's "Today" path with 3–5 personalized lessons ready to go
5. Watch their child complete a lesson with mixed interaction modes — comfortably on iPad
6. Toggle dyslexia-friendly font and watch the lesson re-render instantly
7. Print any lesson as a clean PDF
8. Thumbs-down a bad lesson with a one-tap reason
9. See a clear, plain-English progress summary that same evening
10. Open the Wonder Wall and read what their child asked today
11. Export a beautiful keepsake PDF anytime
12. Switch a child's language or pronouns and see the AI companion respect it instantly
13. Generate a state compliance report in one click (any of top 10 states)
14. Invite a co-parent or grandparent with appropriate access
15. See their current month's AI usage transparently
16. Export or delete all family data on demand
17. Feel calm, never overwhelmed, and proud of their child's growth

---

## 🛡️ 16. SAFETY & GUARDRAILS

### AI Companion System Prompt
- Socratic only — never give direct answers
- Age-appropriate language (system prompt receives child's age + reading level)
- Never collect PII; if a child shares it, gently redirect
- Refuse off-topic questions kindly and steer back to learning
- No opinions on contested topics; surface multiple perspectives where relevant
- Honor the child's content axis setting
- Honor pronouns + language

### Content Generation Guardrails
- All generated content passes through a server-side safety filter
- Parent can flag any content; flagged content auto-escalates to a review queue
- Generation prompt explicitly bans: violence, romantic content, scary imagery, ads, brands, links

### Data Handling
- Voice recordings: Supabase Storage, RLS, auto-delete after 90 days unless parent-favorited
- No social features, no public profiles, no ads
- Strict CSP headers, HTTPS only, secure cookies
- COPPA-compliant: kids never have direct accounts; parent is always the data controller
- All API routes rate-limited
- All file uploads scanned + size-limited

---

## 🎬 17. BUILD INSTRUCTIONS FOR CLAUDE CODE

1. **Read this entire spec twice** before writing any code.
2. Initialize the project (`npm create vite@latest seed -- --template react-ts`), install dependencies, wire Tailwind + shadcn/ui + Fraunces/Inter/OpenDyslexic.
3. Set up Supabase locally (`supabase init`), create migration `0001_init.sql` from the schema in section 10, run it.
4. Build sprint-by-sprint, in order, starting with Sprint 0. Do not skip ahead.
5. After each sprint:
   - Commit with message `Sprint N: <summary>`
   - Run `tsc --noEmit` and `eslint .`
   - Verify the sprint's acceptance criteria
   - Take a screenshot of the new screens for the changelog
6. **At the end of Sprint 3**, generate one real lesson and surface it in chat for prompt hardening before continuing to Sprint 4.
7. Treat the design principles in section 3 as load-bearing — if a UI choice violates them, redo it.
8. Default to calm, generous spacing, warm color palette. When uncertain, choose simpler.
9. Test every screen at iPad portrait (768×1024), iPad landscape (1024×768), and desktop (1440×900). Phone gets a parent-only experience.
10. The parent must always feel: *"This is taking care of us."*
11. The child must always feel: *"This is just for me."*

Build with care. This is a tool families will use every day for years.

🌱
