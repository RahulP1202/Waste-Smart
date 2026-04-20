-- ── Eco Shop & Vendor Portal Tables ──────────────────────────────────────
-- Run this in Supabase SQL Editor (separate from existing tables)

-- Vendor accounts (separate from regular users)
create table if not exists vendors (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade unique,
  business_name text not null,
  description text,
  category text default 'eco_products', -- eco_products, recycled_goods, organic_food, upcycled, services
  logo_url text,
  banner_url text,
  website text,
  contact_email text,
  contact_phone text,
  location_city text default 'Bengaluru',
  location_state text default 'Karnataka',
  status text default 'pending', -- pending, approved, rejected, suspended
  is_featured boolean default false,
  total_products integer default 0,
  total_orders integer default 0,
  rating numeric default 0,
  review_count integer default 0,
  applied_at timestamptz default now(),
  approved_at timestamptz,
  created_at timestamptz default now()
);

alter table vendors enable row level security;
create policy "Anyone can view approved vendors" on vendors for select using (status = 'approved' or auth.uid() = user_id);
create policy "Users create own vendor profile" on vendors for insert with check (auth.uid() = user_id);
create policy "Vendors update own profile" on vendors for update using (auth.uid() = user_id);

-- Products listed by vendors
create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  vendor_id uuid references vendors(id) on delete cascade,
  name text not null,
  description text,
  price numeric not null,
  original_price numeric,
  category text,
  tags text[],
  images text[],
  stock_quantity integer default 0,
  unit text default 'piece', -- piece, kg, litre, pack
  eco_certified boolean default false,
  eco_label text, -- e.g. "100% Recycled", "Organic", "Zero Waste"
  carbon_saved_kg numeric default 0,
  status text default 'active', -- active, out_of_stock, inactive
  views integer default 0,
  orders_count integer default 0,
  rating numeric default 0,
  review_count integer default 0,
  created_at timestamptz default now()
);

alter table products enable row level security;
create policy "Anyone can view active products" on products for select using (status = 'active');
create policy "Vendors manage own products" on products for insert with check (
  auth.uid() = (select user_id from vendors where id = vendor_id)
);
create policy "Vendors update own products" on products for update using (
  auth.uid() = (select user_id from vendors where id = vendor_id)
);
create policy "Vendors delete own products" on products for delete using (
  auth.uid() = (select user_id from vendors where id = vendor_id)
);

-- Product reviews
create table if not exists product_reviews (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references products(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  user_name text,
  rating integer check (rating between 1 and 5),
  review text,
  created_at timestamptz default now(),
  unique(product_id, user_id)
);

alter table product_reviews enable row level security;
create policy "Anyone can view reviews" on product_reviews for select using (true);
create policy "Users write own reviews" on product_reviews for insert with check (auth.uid() = user_id);

-- Collaboration / sponsorship requests (brands wanting to feature in Tips/Community)
create table if not exists collaboration_requests (
  id uuid default gen_random_uuid() primary key,
  vendor_id uuid references vendors(id) on delete cascade,
  type text not null, -- sponsored_tip, community_challenge_sponsor, reward_sponsor, banner_ad
  title text not null,
  description text,
  budget_inr numeric,
  duration_days integer,
  target_section text, -- tips, community, shop, all
  status text default 'pending', -- pending, approved, active, completed, rejected
  admin_notes text,
  created_at timestamptz default now()
);

alter table collaboration_requests enable row level security;
create policy "Vendors view own requests" on collaboration_requests for select using (
  auth.uid() = (select user_id from vendors where id = vendor_id)
);
create policy "Vendors create requests" on collaboration_requests for insert with check (
  auth.uid() = (select user_id from vendors where id = vendor_id)
);

-- Rewards catalog (gifts/discounts offered by vendors for point redemption)
create table if not exists rewards (
  id uuid default gen_random_uuid() primary key,
  vendor_id uuid references vendors(id) on delete cascade,
  title text not null,
  description text,
  image_url text,
  points_required integer not null,
  reward_type text default 'discount', -- discount, free_product, gift, lucky_draw
  discount_percent integer,
  coupon_code text,
  total_available integer,
  claimed_count integer default 0,
  valid_until date,
  status text default 'active',
  created_at timestamptz default now()
);

alter table rewards enable row level security;
create policy "Anyone can view active rewards" on rewards for select using (status = 'active');
create policy "Vendors manage own rewards" on rewards for insert with check (
  auth.uid() = (select user_id from vendors where id = vendor_id)
);

-- User reward claims
create table if not exists reward_claims (
  id uuid default gen_random_uuid() primary key,
  reward_id uuid references rewards(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  user_name text,
  points_spent integer,
  coupon_code text,
  status text default 'claimed', -- claimed, used, expired
  claimed_at timestamptz default now(),
  unique(reward_id, user_id)
);

alter table reward_claims enable row level security;
create policy "Users view own claims" on reward_claims for select using (auth.uid() = user_id);
create policy "Users create claims" on reward_claims for insert with check (auth.uid() = user_id);

-- Monthly impact winners
create table if not exists impact_winners (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  user_name text,
  month date not null, -- first day of the month
  total_scans integer,
  total_carbon_saved numeric,
  total_points integer,
  prize_description text,
  sponsor_vendor_id uuid references vendors(id),
  announced boolean default false,
  created_at timestamptz default now()
);

alter table impact_winners enable row level security;
create policy "Anyone can view winners" on impact_winners for select using (true);

-- Indexes
create index if not exists vendors_status_idx on vendors(status);
create index if not exists products_vendor_idx on products(vendor_id);
create index if not exists products_status_idx on products(status);
create index if not exists rewards_status_idx on rewards(status);
