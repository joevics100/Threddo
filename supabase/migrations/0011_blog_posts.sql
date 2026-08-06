-- Threddo — migration: blog_posts table.
-- Run this once in the Supabase SQL Editor after 0001-0010 (0004's reports
-- table was already applied live directly via MCP — see git history).

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null,
  content text not null, -- markdown
  cover_image_url text,
  tags text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'published')),
  seo_title text,
  seo_description text,
  author_id uuid references public.profiles (id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_posts_status_published_idx
  on public.blog_posts (status, published_at desc);
create index if not exists blog_posts_slug_idx on public.blog_posts (slug);
create index if not exists blog_posts_tags_idx on public.blog_posts using gin (tags);

drop trigger if exists blog_posts_set_updated_at on public.blog_posts;
create trigger blog_posts_set_updated_at
  before update on public.blog_posts
  for each row execute function public.set_updated_at();

alter table public.blog_posts enable row level security;

drop policy if exists "Published posts are publicly readable" on public.blog_posts;
create policy "Published posts are publicly readable"
  on public.blog_posts for select
  using (status = 'published');

drop policy if exists "Admins can view all posts" on public.blog_posts;
create policy "Admins can view all posts"
  on public.blog_posts for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "Admins can insert posts" on public.blog_posts;
create policy "Admins can insert posts"
  on public.blog_posts for insert
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "Admins can update posts" on public.blog_posts;
create policy "Admins can update posts"
  on public.blog_posts for update
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "Admins can delete posts" on public.blog_posts;
create policy "Admins can delete posts"
  on public.blog_posts for delete
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
