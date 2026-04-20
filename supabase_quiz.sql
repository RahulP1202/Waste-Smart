-- Run in Supabase SQL Editor
create table if not exists quiz_scores (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  user_name text,
  score integer not null,
  total integer not null,
  quiz_date date default current_date not null,
  time_taken integer, -- seconds
  created_at timestamptz default now()
);

alter table quiz_scores enable row level security;

create policy "Anyone can view scores" on quiz_scores for select using (true);
create policy "Users insert own scores" on quiz_scores for insert with check (auth.uid() = user_id);

-- Index for leaderboard queries
create index if not exists quiz_scores_date_idx on quiz_scores(quiz_date);
create index if not exists quiz_scores_score_idx on quiz_scores(score desc);
