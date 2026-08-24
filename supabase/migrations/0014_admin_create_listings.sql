-- Lets admins create a listing on behalf of another user — e.g. staff
-- listing items for a seller who dropped off photos via WhatsApp and
-- doesn't want to use the app themselves. The listing is fully owned by
-- the target user from creation (same as if they'd posted it themselves):
-- it shows up in their dashboard, and they can view/edit/delete it exactly
-- like any other listing. No separate "claiming" step.
--
-- A separate, additive policy (not a change to the existing one) — multiple
-- permissive policies for the same command are combined with OR, so this
-- doesn't loosen anything for ordinary users creating their own listings.
-- Mirrors the existing "Admins can update any listing" policy from
-- 0001_init_schema.sql.
create policy "Admins can create listings for any user"
  on public.listings for insert
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Lightweight audit trail — purely for staff visibility ("why does this
-- listing exist, who added it"), never surfaced to buyers or shown on the
-- public listing page. Null for every ordinary, self-posted listing.
alter table public.listings
  add column if not exists created_by_admin_id uuid references public.profiles(id) on delete set null;
