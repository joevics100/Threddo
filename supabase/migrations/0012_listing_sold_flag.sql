-- Threddo — migration: is_sold flag for listings.
-- Orthogonal to `status` (moderation state) — a sold listing stays
-- status='approved' so it still appears in listings/search, just marked.
-- Run this once in the Supabase SQL Editor after 0001-0011.

alter table public.listings
  add column if not exists is_sold boolean not null default false;

create index if not exists listings_is_sold_idx on public.listings (is_sold);
