-- Blog posts table for admin-authored content
create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text not null,
  content text not null default '',
  category text not null default 'Wellbeing',
  emoji text not null default '📝',
  cover_color text not null default 'linear-gradient(135deg,#e0f2e9,#b8dfc8)',
  read_time int not null default 3,
  author_id uuid references auth.users(id) on delete set null,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table blog_posts enable row level security;

-- Anyone can read published posts
create policy "Public read published posts"
  on blog_posts for select
  using (published = true);

-- Admins can do everything
create policy "Admins full access"
  on blog_posts for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );
