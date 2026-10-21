-- Voca schema
-- Idempotent: safe to re-run in the Supabase SQL editor.
-- session_date is the learner's local calendar date, supplied by the app.

create extension if not exists pgcrypto;

create table if not exists public.vocabulary_words (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users (id) on delete cascade not null,
    term text not null,
    domain text not null default 'Software Engineering',
    level text not null default 'B2/C1',
    status text not null default 'new', -- 'new', 'learning', 'mastered'
    repetitions int not null default 0,
    interval_days int not null default 1,
    ease_factor float not null default 2.5,
    next_review_at timestamptz default now(),
    last_reviewed_at timestamptz,
    mnemonic_hook text,
    system_context text,
    part_of_speech text,
    pronunciation text,
    canonical_definition text,
    created_at timestamptz default now(),
    unique (user_id, term)
);

alter table public.vocabulary_words
  add column if not exists part_of_speech text,
  add column if not exists pronunciation text,
  add column if not exists canonical_definition text;

comment on column public.vocabulary_words.canonical_definition is
  'Grading key. The app does not show this before evaluation.';
comment on column public.vocabulary_words.part_of_speech is
  'Shown on the daily card. Not a spoiler.';
comment on column public.vocabulary_words.pronunciation is
  'IPA hint shown on the daily card.';

alter table public.vocabulary_words drop constraint if exists vocabulary_words_status_check;
alter table public.vocabulary_words
  add constraint vocabulary_words_status_check
  check (status in ('new', 'learning', 'mastered'));

create unique index if not exists vocabulary_words_user_term_lower_idx
  on public.vocabulary_words (user_id, lower(term));

create index if not exists vocabulary_words_user_review_idx
  on public.vocabulary_words (user_id, next_review_at);

create table if not exists public.daily_sessions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users (id) on delete cascade not null,
    session_date date not null default current_date,
    word_ids uuid[] not null,
    raw_transcript text,
    evaluation_result jsonb,
    is_completed boolean not null default false,
    created_at timestamptz default now(),
    unique (user_id, session_date)
);

comment on column public.daily_sessions.session_date is
  'Learner local calendar date (YYYY-MM-DD), not the UTC date of the request.';

alter table public.daily_sessions drop constraint if exists daily_sessions_word_count_check;
alter table public.daily_sessions
  add constraint daily_sessions_word_count_check
  check (coalesce(array_length(word_ids, 1), 0) between 1 and 5);

create index if not exists daily_sessions_user_date_idx
  on public.daily_sessions (user_id, session_date desc);

alter table public.vocabulary_words enable row level security;
alter table public.daily_sessions enable row level security;

drop policy if exists "Users own words" on public.vocabulary_words;
create policy "Users own words"
  on public.vocabulary_words
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users own sessions" on public.daily_sessions;
create policy "Users own sessions"
  on public.daily_sessions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

revoke all on public.vocabulary_words from anon;
revoke all on public.daily_sessions from anon;
grant select, insert, update, delete on public.vocabulary_words to authenticated;
grant select, insert, update, delete on public.daily_sessions to authenticated;
