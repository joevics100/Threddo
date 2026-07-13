-- Threddo — migration: negotiable price toggle, verified seller badge.
-- Run this once in the Supabase SQL Editor after 0001-0006.

alter table public.listings add column if not exists is_negotiable boolean not null default false;

-- No self-serve UI for this yet — admins grant it manually, same pattern as
-- profiles.role. e.g.: update public.profiles set is_verified = true where id = '...';
alter table public.profiles add column if not exists is_verified boolean not null default false;
