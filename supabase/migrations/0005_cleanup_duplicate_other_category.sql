-- Threddo — cleanup migration: the original Phase 1 seed included an
-- "Others" category (slug 'others'). Phase 2's migration replaced it with a
-- new "Other" category (slug 'other', with real subcategories) but only
-- handled merging 'clothes' -> 'clothing' and 'bags' -> 'bags-purses' — the
-- old 'others' row was left behind as a stray duplicate. This merges any
-- listings pointing at the old row into the new one, then removes it.
-- Safe to re-run; a no-op if 'others' was never created or already removed.

do $$
declare
  old_others uuid;
  new_other uuid;
begin
  select id into old_others from public.categories where slug = 'others';
  select id into new_other from public.categories where slug = 'other';

  if old_others is not null and new_other is not null then
    update public.listings set category_id = new_other where category_id = old_others;
    update public.categories set parent_id = new_other where parent_id = old_others;
    delete from public.categories where id = old_others;
  end if;
end $$;
