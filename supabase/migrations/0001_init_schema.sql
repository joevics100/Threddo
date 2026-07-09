-- Threddo — Phase 1 schema: profiles, categories, listings, reviews
-- Run this once in the Supabase SQL Editor (or via `supabase db push` once linked).

-- ────────────────────────────────────────────────────────────────────────────
-- Extensions
-- ────────────────────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ────────────────────────────────────────────────────────────────────────────
-- profiles
-- One row per auth.users row. Created automatically on signup via trigger below.
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  whatsapp_number text,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'Public profile data for each authenticated user.';

-- Auto-create a profile row whenever a new auth.users row is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ────────────────────────────────────────────────────────────────────────────
-- categories
-- Self-referencing for category → subcategory (parent_id null = top-level).
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  parent_id uuid references public.categories (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists categories_parent_id_idx on public.categories (parent_id);

-- ────────────────────────────────────────────────────────────────────────────
-- listings
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete restrict,
  title text not null,
  description text,
  price numeric(12, 2),
  is_free boolean not null default false,
  condition text not null check (condition in ('new', 'like_new', 'fairly_used')),
  size text,
  state text,
  lga text,
  town text,
  images text[] not null default '{}',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  rejection_reason text,
  view_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint price_required_unless_free check (is_free or price is not null)
);

create index if not exists listings_status_idx on public.listings (status);
create index if not exists listings_category_id_idx on public.listings (category_id);
create index if not exists listings_user_id_idx on public.listings (user_id);
create index if not exists listings_state_idx on public.listings (state);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists listings_set_updated_at on public.listings;
create trigger listings_set_updated_at
  before update on public.listings
  for each row execute function public.set_updated_at();

-- ────────────────────────────────────────────────────────────────────────────
-- reviews
-- Buyer → seller reviews, optionally tied to the listing that prompted them.
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings (id) on delete set null,
  reviewer_id uuid not null references public.profiles (id) on delete cascade,
  seller_id uuid not null references public.profiles (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  constraint reviewer_not_seller check (reviewer_id <> seller_id)
);

create index if not exists reviews_seller_id_idx on public.reviews (seller_id);

-- ────────────────────────────────────────────────────────────────────────────
-- Row Level Security
-- ────────────────────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.listings enable row level security;
alter table public.reviews enable row level security;

-- profiles: publicly readable (seller name/phone need to show on listing pages),
-- but only the owner can modify their own row.
create policy "Profiles are publicly readable"
  on public.profiles for select
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- categories: publicly readable. Writes are admin-only (via service role — no
-- insert/update/delete policy for regular users is intentional).
create policy "Categories are publicly readable"
  on public.categories for select
  using (true);

-- listings: public can see approved listings; owners can always see their own;
-- admins can see everything.
create policy "Approved listings are publicly readable"
  on public.listings for select
  using (
    status = 'approved'
    or user_id = auth.uid()
    or exists (
      select 1 from public.profiles where id = auth.uid() and role = 'admin'
    )
  );

create policy "Users can create their own listings"
  on public.listings for insert
  with check (user_id = auth.uid());

create policy "Users can update their own listings"
  on public.listings for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Admins can update any listing"
  on public.listings for update
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Users can delete their own listings"
  on public.listings for delete
  using (user_id = auth.uid());

-- reviews: publicly readable, only the reviewer can write their own review.
create policy "Reviews are publicly readable"
  on public.reviews for select
  using (true);

create policy "Users can create reviews as themselves"
  on public.reviews for insert
  with check (reviewer_id = auth.uid());

create policy "Users can update their own reviews"
  on public.reviews for update
  using (reviewer_id = auth.uid());

create policy "Users can delete their own reviews"
  on public.reviews for delete
  using (reviewer_id = auth.uid());

-- ────────────────────────────────────────────────────────────────────────────
-- Seed: top-level categories (subcategories can be added later via dashboard)
-- ────────────────────────────────────────────────────────────────────────────
insert into public.categories (name, slug) values
  ('Clothes', 'clothes'),
  ('Shoes', 'shoes'),
  ('Bags', 'bags'),
  ('Accessories', 'accessories'),
  ('Hair', 'hair'),
  ('Others', 'others')
on conflict (slug) do nothing;
