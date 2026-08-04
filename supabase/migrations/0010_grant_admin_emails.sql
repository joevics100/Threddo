-- Threddo — migration: grant admin access to specific emails.
-- Run this once in the Supabase SQL Editor after 0001-0009.

-- 1) Promote these emails right now, if they've already signed up.
update public.profiles
set role = 'admin'
where id in (
  select id from auth.users
  where email in (
    'nahimah.gift@gmail.com',
    'joevics100@gmail.com',
    'joevicscrew@gmail.com',
    'joevicstown@gmail.com'
  )
);

-- 2) Auto-promote the same emails going forward, in case any of them
-- haven't signed up yet — handle_new_user() now checks against this list
-- at account-creation time instead of needing a second manual step later.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_emails text[] := array[
    'nahimah.gift@gmail.com',
    'joevics100@gmail.com',
    'joevicscrew@gmail.com',
    'joevicstown@gmail.com'
  ];
begin
  insert into public.profiles (id, full_name, phone, whatsapp_number, avatar_url, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'phone',
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture'),
    case when lower(new.email) = any(admin_emails) then 'admin' else 'user' end
  );
  return new;
end;
$$;
