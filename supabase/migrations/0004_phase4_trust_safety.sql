-- Threddo — Phase 4 migration: reports table, review de-duplication.
-- Run this once in the Supabase SQL Editor after 0001, 0002, and 0003.

-- ────────────────────────────────────────────────────────────────────────────
-- reports — "Report listing" button
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reason text not null check (
    reason in ('scam', 'inappropriate', 'wrong_category', 'sold_elsewhere', 'other')
  ),
  details text,
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz not null default now()
);

create index if not exists reports_listing_id_idx on public.reports (listing_id);
create index if not exists reports_status_idx on public.reports (status);

alter table public.reports enable row level security;

create policy "Users can create their own reports"
  on public.reports for insert
  with check (reporter_id = auth.uid());

create policy "Reporters can view their own reports"
  on public.reports for select
  using (reporter_id = auth.uid());

create policy "Admins can view all reports"
  on public.reports for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Admins can update reports"
  on public.reports for update
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ────────────────────────────────────────────────────────────────────────────
-- reviews — one review per (reviewer, listing) to prevent spamming a seller.
-- Reviews not tied to a specific listing (listing_id is null) are unaffected.
-- ────────────────────────────────────────────────────────────────────────────
create unique index if not exists reviews_reviewer_listing_unique
  on public.reviews (reviewer_id, listing_id)
  where listing_id is not null;
