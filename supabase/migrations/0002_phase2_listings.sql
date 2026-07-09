-- Threddo — Phase 2 migration: category taxonomy, new listing fields, storage bucket.
-- Run this once in the Supabase SQL Editor after 0001_init_schema.sql.

-- ────────────────────────────────────────────────────────────────────────────
-- Categories: replace the old 6-category seed with the real taxonomy.
-- Safe to re-run: existing top-level rows are matched by slug and kept (their
-- ids are stable), only subcategories are (re)inserted.
-- ────────────────────────────────────────────────────────────────────────────
insert into public.categories (name, slug) values
  ('Clothing', 'clothing'),
  ('Shoes', 'shoes'),
  ('Bags & Purses', 'bags-purses'),
  ('Jewellery', 'jewellery'),
  ('Accessories', 'accessories'),
  ('Hair', 'hair'),
  ('Other', 'other')
on conflict (slug) do nothing;

-- Rename the old Phase 1 placeholder categories that are being replaced/merged.
-- 'clothes' and 'bags' become 'clothing' and 'bags-purses' above; if any
-- listings already reference the old rows, point them at the new ones, then
-- remove the old rows. Safe no-op if the old rows were never created.
do $$
declare
  old_clothes uuid;
  new_clothing uuid;
  old_bags uuid;
  new_bags uuid;
begin
  select id into old_clothes from public.categories where slug = 'clothes';
  select id into new_clothing from public.categories where slug = 'clothing';
  select id into old_bags from public.categories where slug = 'bags';
  select id into new_bags from public.categories where slug = 'bags-purses';

  if old_clothes is not null and new_clothing is not null then
    update public.listings set category_id = new_clothing where category_id = old_clothes;
    update public.categories set parent_id = new_clothing where parent_id = old_clothes;
    delete from public.categories where id = old_clothes;
  end if;

  if old_bags is not null and new_bags is not null then
    update public.listings set category_id = new_bags where category_id = old_bags;
    update public.categories set parent_id = new_bags where parent_id = old_bags;
    delete from public.categories where id = old_bags;
  end if;
end $$;

-- Helper to insert subcategories under a parent slug, skipping duplicates.
create or replace function public.seed_subcategories(parent_slug text, subcategory_names text[])
returns void
language plpgsql
as $$
declare
  parent uuid;
  name text;
begin
  select id into parent from public.categories where slug = parent_slug;
  if parent is null then
    raise exception 'Parent category with slug % not found', parent_slug;
  end if;

  foreach name in array subcategory_names loop
    insert into public.categories (name, slug, parent_id)
    values (
      name,
      parent_slug || '-' || regexp_replace(lower(name), '[^a-z0-9]+', '-', 'g'),
      parent
    )
    on conflict (slug) do nothing;
  end loop;
end;
$$;

select public.seed_subcategories('clothing', array[
  'Tops', 'Shirts', 'Blouses/Dresses', 'Skirts', 'Trousers', 'Jeans & Shorts',
  'Jumpsuits', 'Jackets & Coats', 'Native Wear', 'Corporate Wear', 'Sleepwear',
  'Underwear', 'Maternity Wear'
]);

select public.seed_subcategories('shoes', array[
  'Sneakers (Canvas)', 'Sandals', 'Slippers', 'Formal Shoes', 'Casual Shoes',
  'Boots', 'Loafers', 'Heels', 'Flats', 'Wedges', 'Sports Shoes', 'Traditional Footwear'
]);

select public.seed_subcategories('bags-purses', array[
  'Handbags', 'Laptop Bags', 'Travel Bags', 'Backpacks', 'Shoulder Bags', 'Totes', 'Clutches & Wallets'
]);

select public.seed_subcategories('jewellery', array[
  'Necklaces', 'Earrings', 'Bracelets', 'Rings', 'Anklets', 'Brooches', 'Beads',
  'Traditional Jewellery', 'Sets', 'Tribal Necklaces'
]);

select public.seed_subcategories('accessories', array[
  'Belts', 'Sunglasses', 'Hats & Caps', 'Scarves & Shawls', 'Hair Accessories',
  'Wristwatches', 'Ties & Bows', 'Socks & Hosiery', 'Gloves', 'Face Masks', 'Fashion Pins'
]);

-- Hair had no supplied subcategory list — drafted a sensible starter set, easy to edit later.
select public.seed_subcategories('hair', array[
  'Wigs', 'Human Hair Extensions', 'Closures & Frontals', 'Braiding Hair',
  'Wig Caps & Nets', 'Hair Care Products', 'Natural/Afro Hair Pieces', 'Ponytails & Clip-ins'
]);

select public.seed_subcategories('other', array[
  'Unique Items', 'Costumes', 'DIY Fashion', 'Gift Combos', 'Clothing Storage', 'Vintage Collectibles'
]);

drop function public.seed_subcategories(text, text[]);

-- ────────────────────────────────────────────────────────────────────────────
-- listings: new fields from the Phase 2 posting form
-- ────────────────────────────────────────────────────────────────────────────
alter table public.listings
  add column if not exists suitable_for text check (suitable_for in ('unisex', 'male', 'female', 'kids')),
  add column if not exists brand text,
  add column if not exists color text,
  add column if not exists material text,
  add column if not exists delivery_method text check (delivery_method in ('pickup', 'delivery', 'meet_up')),
  add column if not exists allow_calls boolean not null default false;

-- Widen the condition options to match the posting form (New / Like New / Gently Used / Needs Fixing).
alter table public.listings drop constraint if exists listings_condition_check;
alter table public.listings add constraint listings_condition_check
  check (condition in ('new', 'like_new', 'gently_used', 'needs_fixing'));

-- ────────────────────────────────────────────────────────────────────────────
-- Storage: a public bucket for listing photos, uploaded under the owner's
-- user-id folder (enforced by policy, mirrors auth.uid() = user_id on listings).
-- ────────────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('listings', 'listings', true)
on conflict (id) do nothing;

create policy "Listing photos are publicly readable"
  on storage.objects for select
  using (bucket_id = 'listings');

create policy "Users can upload their own listing photos"
  on storage.objects for insert
  with check (
    bucket_id = 'listings'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update their own listing photos"
  on storage.objects for update
  using (
    bucket_id = 'listings'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own listing photos"
  on storage.objects for delete
  using (
    bucket_id = 'listings'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
