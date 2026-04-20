-- Run this in Supabase SQL Editor
create table if not exists scan_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  scanned_at timestamptz default now() not null,
  image_url text,
  waste_type text,
  waste_subtype text,
  bin text,
  sustainability_score integer,
  carbon_footprint_kg numeric,
  carbon_saved_if_recycled_kg numeric,
  recyclability integer,
  compostable boolean,
  reuse_potential integer,
  decomposition_time text,
  can_sell boolean,
  sell_price text,
  points_earned integer,
  full_result jsonb,
  demo_mode boolean default false
);

-- Enable Row Level Security
alter table scan_history enable row level security;

-- Users can only see their own scans
create policy "Users see own scans" on scan_history
  for select using (auth.uid() = user_id);

create policy "Users insert own scans" on scan_history
  for insert with check (auth.uid() = user_id);

create policy "Users delete own scans" on scan_history
  for delete using (auth.uid() = user_id);

-- Complaints table
create table if not exists complaints (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  reporter_name text,
  type text not null,
  title text not null,
  description text not null,
  location_text text not null,
  location_lat numeric,
  location_lng numeric,
  severity text default 'medium',
  status text default 'pending',
  upvotes integer default 0,
  photo_url text,
  contact_phone text,
  created_at timestamptz default now()
);
alter table complaints enable row level security;
create policy "Anyone can view complaints" on complaints for select using (true);
create policy "Users insert own complaints" on complaints for insert with check (auth.uid() = user_id);
create policy "Users update upvotes" on complaints for update using (true);
