-- Threddo — migration: phone number at signup, saved listings ("bottom nav" work).
-- Run this once in the Supabase SQL Editor after 0001-0005.

-- ────────────────────────────────────────────────────────────────────────────
-- Capture phone number (used as the default listing WhatsApp number) at signup.
-- ────────────────────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, whatsapp_number)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'phone'
  );
  return new;
end;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Bugfix: the "use a different number for this listing" override was
-- validated on the post form but never actually persisted anywhere — the
-- listing detail page fell back to the seller's profile number regardless.
-- Give listings their own contact number column; falls back to the seller's
-- profile number (via join) for older rows created before this column existed.
-- ────────────────────────────────────────────────────────────────────────────
alter table public.listings add column if not exists whatsapp_number text;

-- ────────────────────────────────────────────────────────────────────────────
-- saved_listings — "Saved" bottom-nav tab
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.saved_listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, listing_id)
);

create index if not exists saved_listings_user_id_idx on public.saved_listings (user_id);

alter table public.saved_listings enable row level security;

create policy "Users can view their own saved listings"
  on public.saved_listings for select
  using (user_id = auth.uid());

create policy "Users can save listings for themselves"
  on public.saved_listings for insert
  with check (user_id = auth.uid());

create policy "Users can remove their own saved listings"
  on public.saved_listings for delete
  using (user_id = auth.uid());
