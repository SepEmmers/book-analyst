# Database Update: Profiles & Triggers

Run this SQL code in Supabase to add user profiles.

```sql
-- 1. Create a table for public profiles using the auth.users table
create table public.profiles (
  id uuid not null references auth.users(id) on delete cascade primary key,
  updated_at timestamp with time zone,
  username text unique,
  avatar_url text
);

-- 2. Enable RLS
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- 3. Setup a trigger to automatically create a profile when a new user signs up
-- function to handle new user
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data ->> 'username');
  return new;
end;
$$;

-- trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```
