-- vibeboard schema

create extension if not exists "pgcrypto";

create type public.vote_value as enum ('execute', 'hold');
create type public.decision_value as enum ('execute', 'hold');

create table public.members (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  display_name text not null unique,
  display_name_changed_at timestamptz,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.join_intents (
  email text primary key,
  display_name text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table public.ideas (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.members (id) on delete cascade,
  title text not null,
  description text not null,
  category text not null,
  decision public.decision_value,
  created_at timestamptz not null default now(),
  constraint ideas_title_length check (char_length(title) between 1 and 160),
  constraint ideas_description_length check (char_length(description) between 1 and 4000),
  constraint ideas_category_length check (char_length(category) between 1 and 40)
);

create table public.votes (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references public.ideas (id) on delete cascade,
  member_id uuid not null references public.members (id) on delete cascade,
  value public.vote_value not null,
  created_at timestamptz not null default now(),
  unique (idea_id, member_id)
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references public.ideas (id) on delete cascade,
  author_id uuid not null references public.members (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  constraint comments_body_length check (char_length(body) between 1 and 2000)
);

create index ideas_created_at_idx on public.ideas (created_at desc);
create index votes_idea_id_idx on public.votes (idea_id);
create index comments_idea_id_idx on public.comments (idea_id, created_at);

alter table public.members enable row level security;
alter table public.join_intents enable row level security;
alter table public.ideas enable row level security;
alter table public.votes enable row level security;
alter table public.comments enable row level security;

-- members: authenticated users can read all; insert/update only own row
create policy "members_select_authenticated"
  on public.members for select
  to authenticated
  using (true);

create policy "members_insert_own"
  on public.members for insert
  to authenticated
  with check (auth.uid() = id);

create policy "members_update_own"
  on public.members for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- join_intents: no direct client access (service role only)
-- ideas
create policy "ideas_select_authenticated"
  on public.ideas for select
  to authenticated
  using (exists (select 1 from public.members m where m.id = auth.uid()));

create policy "ideas_insert_authenticated"
  on public.ideas for insert
  to authenticated
  with check (
    author_id = auth.uid()
    and exists (select 1 from public.members m where m.id = auth.uid())
  );

create policy "ideas_update_own"
  on public.ideas for update
  to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

create policy "ideas_delete_own"
  on public.ideas for delete
  to authenticated
  using (author_id = auth.uid());

-- votes
create policy "votes_select_authenticated"
  on public.votes for select
  to authenticated
  using (exists (select 1 from public.members m where m.id = auth.uid()));

create policy "votes_insert_own"
  on public.votes for insert
  to authenticated
  with check (
    member_id = auth.uid()
    and exists (select 1 from public.members m where m.id = auth.uid())
  );

create policy "votes_update_own"
  on public.votes for update
  to authenticated
  using (member_id = auth.uid())
  with check (member_id = auth.uid());

create policy "votes_delete_own"
  on public.votes for delete
  to authenticated
  using (member_id = auth.uid());

-- comments
create policy "comments_select_authenticated"
  on public.comments for select
  to authenticated
  using (exists (select 1 from public.members m where m.id = auth.uid()));

create policy "comments_insert_own"
  on public.comments for insert
  to authenticated
  with check (
    author_id = auth.uid()
    and exists (select 1 from public.members m where m.id = auth.uid())
  );

create policy "comments_update_own"
  on public.comments for update
  to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

create policy "comments_delete_own"
  on public.comments for delete
  to authenticated
  using (author_id = auth.uid());

-- Data API grants (required when "Automatically expose new tables" is off)
grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update on public.members to authenticated;
grant all on public.members to service_role;

grant all on public.join_intents to service_role;

grant select, insert, update, delete on public.ideas to authenticated;
grant all on public.ideas to service_role;

grant select, insert, update, delete on public.votes to authenticated;
grant all on public.votes to service_role;

grant select, insert, update, delete on public.comments to authenticated;
grant all on public.comments to service_role;

grant usage on type public.vote_value to authenticated, service_role;
grant usage on type public.decision_value to authenticated, service_role;

create or replace function public.enforce_member_profile_guards()
returns trigger
language plpgsql
as $$
declare
  expected_avatar_prefix text;
begin
  if new.display_name is distinct from old.display_name then
    if old.display_name_changed_at is not null
       and old.display_name_changed_at > now() - interval '14 days' then
      raise exception 'Username can only be changed every 14 days.';
    end if;
    new.display_name_changed_at := now();
  elsif new.display_name_changed_at is distinct from old.display_name_changed_at then
    raise exception 'display_name_changed_at cannot be updated directly.';
  end if;

  if new.avatar_url is distinct from old.avatar_url and new.avatar_url is not null then
    if auth.uid() is null or auth.uid() is distinct from new.id then
      raise exception 'Invalid avatar update.';
    end if;

    expected_avatar_prefix :=
      '/storage/v1/object/public/avatars/' || new.id::text || '/';

    if position(expected_avatar_prefix in new.avatar_url) = 0 then
      raise exception 'avatar_url must reference your uploaded avatar.';
    end if;
  end if;

  return new;
end;
$$;

create trigger members_profile_guards
  before update on public.members
  for each row
  execute function public.enforce_member_profile_guards();
