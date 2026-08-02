-- Threddo — migration: capture avatar_url on signup (Google OAuth provides
-- one automatically via raw_user_meta_data; email/password signups simply
-- won't have one, which the trigger already handles fine via null).
-- Run this once in the Supabase SQL Editor after 0001-0008.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, whatsapp_number, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'phone',
    -- Google's identity data uses "avatar_url" in some client versions and
    -- "picture" in others (it's the raw OAuth claim name) — try both.
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  );
  return new;
end;
$$;
