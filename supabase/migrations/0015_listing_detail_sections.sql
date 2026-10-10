-- AI-written, collapsible "detail sections" shown on listing pages
-- (About this item, Who is this for, etc.). Stored as
-- [{ "title": "...", "body": "..." }, ...]; null until generated.
alter table public.listings
  add column if not exists detail_sections jsonb;
