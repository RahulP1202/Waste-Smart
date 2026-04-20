-- Community tables
create table if not exists communities (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  type text default 'general', -- school, apartment, office, general
  created_by uuid references auth.users(id) on delete cascade,
  join_code text unique not null,
  member_count integer default 1,
  total_scans integer default 0,
  total_carbon_saved numeric default 0,
  avatar_color text default '#10b981',
  created_at timestamptz default now()
);

create table if not exists community_members (
  id uuid default gen_random_uuid() primary key,
  community_id uuid references communities(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  user_name text,
  role text default 'member', -- admin, member
  scans_count integer default 0,
  carbon_saved numeric default 0,
  points integer default 0,
  joined_at timestamptz default now(),
  unique(community_id, user_id)
);

create table if not exists community_challenges (
  id uuid default gen_random_uuid() primary key,
  community_id uuid references communities(id) on delete cascade,
  title text not null,
  description text,
  target_scans integer default 50,
  current_scans integer default 0,
  start_date date default current_date,
  end_date date,
  status text default 'active',
  created_at timestamptz default now()
);

-- RLS
alter table communities enable row level security;
alter table community_members enable row level security;
alter table community_challenges enable row level security;

create policy "Anyone can view communities" on communities for select using (true);
create policy "Auth users create communities" on communities for insert with check (auth.uid() = created_by);
create policy "Admins update communities" on communities for update using (auth.uid() = created_by);

create policy "Anyone can view members" on community_members for select using (true);
create policy "Users join communities" on community_members for insert with check (auth.uid() = user_id);
create policy "Users update own membership" on community_members for update using (auth.uid() = user_id);
create policy "Users leave communities" on community_members for delete using (auth.uid() = user_id);

create policy "Anyone can view challenges" on community_challenges for select using (true);
create policy "Members create challenges" on community_challenges for insert with check (true);

-- Posts & Comments (social feed)
create table if not exists community_posts (
  id uuid default gen_random_uuid() primary key,
  community_id uuid references communities(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  user_name text,
  user_color text default '#10b981',
  content text not null,
  image_url text,
  post_type text default 'update',
  reactions jsonb default '{}',
  comment_count integer default 0,
  created_at timestamptz default now()
);
alter table community_posts enable row level security;
create policy "Anyone can view posts" on community_posts for select using (true);
create policy "Members post" on community_posts for insert with check (auth.uid() = user_id);
create policy "Authors update posts" on community_posts for update using (auth.uid() = user_id);

create table if not exists community_comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references community_posts(id) on delete cascade,
  community_id uuid references communities(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  user_name text,
  user_color text default '#6366f1',
  content text not null,
  created_at timestamptz default now()
);
alter table community_comments enable row level security;
create policy "Anyone can view comments" on community_comments for select using (true);
create policy "Members comment" on community_comments for insert with check (auth.uid() = user_id);

create table if not exists community_reactions (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references community_posts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  emoji text not null,
  created_at timestamptz default now(),
  unique(post_id, user_id, emoji)
);
alter table community_reactions enable row level security;
create policy "Anyone can view reactions" on community_reactions for select using (true);
create policy "Members react" on community_reactions for insert with check (auth.uid() = user_id);
