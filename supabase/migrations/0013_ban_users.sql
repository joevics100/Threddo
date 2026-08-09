-- Threddo — admin ability to ban users.

alter table public.profiles add column if not exists is_banned boolean not null default false;
alter table public.profiles add column if not exists banned_at timestamptz;

comment on column public.profiles.is_banned is 'Set by an admin. Banned users are signed out on their next request and cannot create listings.';

-- Defense-in-depth: even if a banned user's session is somehow still live,
-- RLS blocks them from creating new listings.
drop policy if exists "Users can create their own listings" on public.listings;
create policy "Users can create their own listings"
  on public.listings for insert
  with check (
    user_id = auth.uid()
    and not coalesce((select is_banned from public.profiles where id = auth.uid()), false)
  );
