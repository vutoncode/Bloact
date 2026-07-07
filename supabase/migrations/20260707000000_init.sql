create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  display_name text,
  avatar_url text,
  bio text,
  role text default 'user' check (role in ('user', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.posts (
  id uuid default gen_random_uuid() primary key,
  author_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  slug text not null,
  content text,
  excerpt text,
  cover_image_url text,
  status text default 'draft' check (status in ('draft', 'published', 'hidden')),
  seo_title text,
  seo_description text,
  view_count integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  published_at timestamp with time zone,
  unique (author_id, slug)
);

create table public.moderation_logs (
  id uuid default gen_random_uuid() primary key,
  admin_id uuid references public.profiles(id) on delete cascade not null,
  action text not null,
  target_id uuid not null,
  target_type text not null check (target_type in ('profile', 'post')),
  reason text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.moderation_logs enable row level security;

create policy "public_read_profiles" on public.profiles
  for select using (true);

create policy "user_update_own_profile" on public.profiles
  for update using (auth.uid() = id);

create policy "admin_all_profiles" on public.profiles
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "public_read_published_posts" on public.posts
  for select using (status = 'published');

create policy "author_read_own_posts" on public.posts
  for select using (auth.uid() = author_id);

create policy "author_all_own_posts" on public.posts
  for all using (auth.uid() = author_id);

create policy "admin_all_posts" on public.posts
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "admin_all_moderation_logs" on public.moderation_logs
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    'user'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
