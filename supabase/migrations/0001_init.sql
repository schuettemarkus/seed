-- ============ PARENTS ============
create table parents (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  full_name text,
  timezone text default 'America/Denver',
  subscription_tier text default 'free' check (subscription_tier in ('free','pro')),
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

-- ============ FAMILY INVITES ============
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

-- ============ USAGE LOGS ============
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

-- ============ RLS ============
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

-- Parent owns their own row
create policy "parents_self" on parents
  for all using (id = auth.uid()) with check (id = auth.uid());

-- Parent owns their children
create policy "parents_own_children" on children
  for all using (parent_id = auth.uid()) with check (parent_id = auth.uid());

-- Parent owns consents
create policy "parents_own_consents" on parental_consents
  for all using (parent_id = auth.uid()) with check (parent_id = auth.uid());

-- Parent owns invites
create policy "parents_own_invites" on family_invites
  for all using (parent_id = auth.uid()) with check (parent_id = auth.uid());

-- Curricula via child ownership
create policy "parents_own_curricula" on curricula
  for all using (child_id in (select id from children where parent_id = auth.uid()))
  with check (child_id in (select id from children where parent_id = auth.uid()));

-- Lessons via child ownership
create policy "parents_own_lessons" on lessons
  for all using (child_id in (select id from children where parent_id = auth.uid()))
  with check (child_id in (select id from children where parent_id = auth.uid()));

-- Lesson progress via child ownership
create policy "parents_own_progress" on lesson_progress
  for all using (child_id in (select id from children where parent_id = auth.uid()))
  with check (child_id in (select id from children where parent_id = auth.uid()));

-- Lesson feedback
create policy "parents_own_feedback" on lesson_feedback
  for all using (parent_id = auth.uid()) with check (parent_id = auth.uid());

-- Mastery via child ownership
create policy "parents_own_mastery" on mastery_state
  for all using (child_id in (select id from children where parent_id = auth.uid()))
  with check (child_id in (select id from children where parent_id = auth.uid()));

-- Wonder questions via child ownership
create policy "parents_own_wonder" on wonder_questions
  for all using (child_id in (select id from children where parent_id = auth.uid()))
  with check (child_id in (select id from children where parent_id = auth.uid()));

-- Portfolio via child ownership
create policy "parents_own_portfolio" on portfolio_entries
  for all using (child_id in (select id from children where parent_id = auth.uid()))
  with check (child_id in (select id from children where parent_id = auth.uid()));

-- Family rhythm
create policy "parents_own_rhythm" on family_rhythm
  for all using (parent_id = auth.uid()) with check (parent_id = auth.uid());

-- Compliance via child ownership
create policy "parents_own_compliance" on compliance_logs
  for all using (child_id in (select id from children where parent_id = auth.uid()))
  with check (child_id in (select id from children where parent_id = auth.uid()));

-- Usage logs
create policy "parents_own_usage" on usage_logs
  for all using (parent_id = auth.uid()) with check (parent_id = auth.uid());

-- ============ INVITED USER POLICIES ============
-- Invitees can read invites addressed to their email
create policy "invitees_read_own" on family_invites
  for select using (lower(email) = lower(auth.jwt() ->> 'email'));

-- Invitees can accept their own pending invites
create policy "invitees_accept" on family_invites
  for update using (
    lower(email) = lower(auth.jwt() ->> 'email')
    and status = 'pending'
  );

-- Invited users can read the inviting parent's profile
create policy "invited_read_parent" on parents
  for select using (
    id in (select parent_id from family_invites where invited_user_id = auth.uid() and status = 'accepted')
  );

-- Invited users can read children of families they belong to
create policy "invited_read_children" on children
  for select using (
    parent_id in (select parent_id from family_invites where invited_user_id = auth.uid() and status = 'accepted')
  );

-- Invited users can read lessons
create policy "invited_read_lessons" on lessons
  for select using (
    child_id in (select id from children where parent_id in (
      select parent_id from family_invites where invited_user_id = auth.uid() and status = 'accepted'
    ))
  );

-- Invited users can read lesson progress
create policy "invited_read_progress" on lesson_progress
  for select using (
    child_id in (select id from children where parent_id in (
      select parent_id from family_invites where invited_user_id = auth.uid() and status = 'accepted'
    ))
  );

-- Invited users can read mastery state
create policy "invited_read_mastery" on mastery_state
  for select using (
    child_id in (select id from children where parent_id in (
      select parent_id from family_invites where invited_user_id = auth.uid() and status = 'accepted'
    ))
  );

-- Invited users can read wonder questions
create policy "invited_read_wonder" on wonder_questions
  for select using (
    child_id in (select id from children where parent_id in (
      select parent_id from family_invites where invited_user_id = auth.uid() and status = 'accepted'
    ))
  );

-- Invited users can read portfolio entries
create policy "invited_read_portfolio" on portfolio_entries
  for select using (
    child_id in (select id from children where parent_id in (
      select parent_id from family_invites where invited_user_id = auth.uid() and status = 'accepted'
    ))
  );

-- Invited users can read compliance logs
create policy "invited_read_compliance" on compliance_logs
  for select using (
    child_id in (select id from children where parent_id in (
      select parent_id from family_invites where invited_user_id = auth.uid() and status = 'accepted'
    ))
  );
