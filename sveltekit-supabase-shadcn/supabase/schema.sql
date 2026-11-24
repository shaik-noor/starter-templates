-- =============================================================================
-- SvelteKit + Supabase starter — database schema
-- Run this in the Supabase SQL Editor (or `supabase db execute -f supabase/schema.sql`).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- profiles
-- One row per auth user. Kept in sync with `auth.users` via the trigger below.
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
	id uuid primary key references auth.users (id) on delete cascade,
	username text unique,
	full_name text,
	avatar_url text,
	website text,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Public profile data for each auth user.';

-- -----------------------------------------------------------------------------
-- Keep `updated_at` fresh on every write.
-- -----------------------------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
	new.updated_at = now();
	return new;
end;
$$;

drop trigger if exists on_profiles_updated on public.profiles;
create trigger on_profiles_updated
	before update on public.profiles
	for each row
	execute function public.handle_updated_at();

-- -----------------------------------------------------------------------------
-- Auto-create a profile whenever a new user signs up.
-- `security definer` lets the trigger write to `public.profiles` regardless of
-- the inserting role; the search_path is pinned to prevent hijacking.
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
	insert into public.profiles (id, full_name, avatar_url)
	values (
		new.id,
		coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
		new.raw_user_meta_data ->> 'avatar_url'
	)
	on conflict (id) do nothing;

	return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
	after insert on auth.users
	for each row
	execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- Row Level Security
-- Strict by default: a user may only read and mutate their own profile.
-- To expose profiles publicly, add a policy such as:
--   create policy "Profiles are viewable by everyone"
--     on public.profiles for select using (true);
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
	on public.profiles
	for select
	to authenticated
	using ((select auth.uid()) = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
	on public.profiles
	for insert
	to authenticated
	with check ((select auth.uid()) = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
	on public.profiles
	for update
	to authenticated
	using ((select auth.uid()) = id)
	with check ((select auth.uid()) = id);

drop policy if exists "Users can delete their own profile" on public.profiles;
create policy "Users can delete their own profile"
	on public.profiles
	for delete
	to authenticated
	using ((select auth.uid()) = id);
