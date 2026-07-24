-- Harden member profile updates against direct API bypasses:
-- 1) display_name_changed_at cannot be cleared/backdated without a username change
-- 2) avatar_url must be null or a public Storage URL under the caller's avatars folder

create or replace function public.enforce_member_profile_guards()
returns trigger
language plpgsql
as $$
declare
  expected_avatar_prefix text;
begin
  -- Username cooldown + ownership of display_name_changed_at
  if new.display_name is distinct from old.display_name then
    if old.display_name_changed_at is not null
       and old.display_name_changed_at > now() - interval '14 days' then
      raise exception 'Username can only be changed every 14 days.';
    end if;
    new.display_name_changed_at := now();
  elsif new.display_name_changed_at is distinct from old.display_name_changed_at then
    raise exception 'display_name_changed_at cannot be updated directly.';
  end if;

  -- Avatar URLs must point at this member's public avatars object (or be cleared)
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

drop trigger if exists members_display_name_cooldown on public.members;
drop trigger if exists members_profile_guards on public.members;
drop function if exists public.enforce_display_name_cooldown();

create trigger members_profile_guards
  before update on public.members
  for each row
  execute function public.enforce_member_profile_guards();
