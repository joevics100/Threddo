-- Threddo — migration: quantity field on listings.
-- Run this once in the Supabase SQL Editor after 0001-0007.

alter table public.listings add column if not exists quantity integer not null default 1;
alter table public.listings drop constraint if exists listings_quantity_check;
alter table public.listings add constraint listings_quantity_check check (quantity >= 1);
