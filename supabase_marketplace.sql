create table if not exists marketplace_listings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  seller_name text,
  title text not null,
  material_type text not null,
  quantity_kg numeric,
  price_per_kg numeric,
  total_price numeric,
  negotiable boolean default true,
  condition text default 'good',
  description text,
  location_area text,
  location_city text default 'Bengaluru',
  contact_phone text,
  contact_whatsapp text,
  image_url text,
  status text default 'active',
  views integer default 0,
  created_at timestamptz default now()
);

alter table marketplace_listings enable row level security;
create policy "Anyone can view active listings" on marketplace_listings for select using (status = 'active');
create policy "Users create own listings" on marketplace_listings for insert with check (auth.uid() = user_id);
create policy "Users update own listings" on marketplace_listings for update using (auth.uid() = user_id);
create policy "Users delete own listings" on marketplace_listings for delete using (auth.uid() = user_id);
