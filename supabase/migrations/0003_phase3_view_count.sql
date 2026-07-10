-- Threddo — Phase 3 migration: view-count increment helper.
-- Run this once in the Supabase SQL Editor after 0001 and 0002.

create or replace function public.increment_listing_views(listing_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.listings set view_count = view_count + 1 where id = listing_id and status = 'approved';
$$;

-- Anyone (including anonymous visitors) can call this — it only ever touches
-- the view_count column on an approved listing, nothing sensitive.
grant execute on function public.increment_listing_views(uuid) to anon, authenticated;
