# Backend Setup Guide (Supabase)

To enable saving analyses, the Community Feed, and Likes, you need to set up a free Supabase project.

## 1. Create Supabase Project
1.  Go to [supabase.com](https://supabase.com/) and click "Start your project".
2.  Sign in with GitHub.
3.  Create a New Project.
    *   **Name**: `BookAnalyst` (or anything you like).
    *   **Database Password**: Generate one and save it (you won't need it for this app though).
    *   **Region**: Choose one close to you (e.g., Frankfurt/London).
4.  Wait for the project to provision.

## 2. Set Up Database Table
1.  Go to the **SQL Editor** (icon on the left used to be a terminal, now standard SQL icon).
2.  Click **New Query**.
3.  Paste the following SQL code and click **Run**:

```sql
-- Create the books table
create table books (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  author text,
  genre text,
  analysis_json jsonb not null,
  likes_count bigint default 0
);

-- Enable Row Level Security (RLS)
alter table books enable row level security;

-- Policy: Allow anyone to READ books
create policy "Enable read access for all users"
on books for select
using (true);

-- Policy: Allow anyone to INSERT (publish) books (Anon/Public)
create policy "Enable insert for all users"
on books for insert
with check (true);

-- Policy: Allow anyone to UPDATE (like) books
-- Note: In a real app you'd want better auth, but for this demo/personal use this is fine.
create policy "Enable update for likes"
on books for update
using (true)
with check (true);
```

## 3. Connect App to Supabase
1.  In Supabase, find **Project Settings** (cog icon) -> **API**.
2.  **Project URL**: Copy the URL (starts with `https://...`).
3.  **API Key**: Copy the **`publishable`** key (starts with `sb_publishable_...`).
    > **IMPORTANT**: Do NOT use the `secret` / `service_role` key. The publishable key is designed to be safe for public apps like this.
4.  In your project folder (`book analyser`), create a file named `.env` (if not exists).
5.  Add the keys like this:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_12345...
```

## 4. Run the App
Restart your dev server:
```bash
npm run dev
```

You should now see the "Community Bibliotheek" on the home page!
