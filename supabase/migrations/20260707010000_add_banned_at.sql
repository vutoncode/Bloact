alter table public.profiles add column banned_at timestamp with time zone;
alter table public.profiles add column email text;

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url, role, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    'user',
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id;
