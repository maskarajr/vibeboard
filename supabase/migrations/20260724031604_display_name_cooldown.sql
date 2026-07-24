-- Track username changes and enforce a 14-day cooldown between edits.

alter table public.members
  add column if not exists display_name_changed_at timestamptz;

create or replace function public.enforce_display_name_cooldown()
returns trigger
language plpgsql
as $$
begin
  if new.display_name is distinct from old.display_name then
    if old.display_name_changed_at is not null
       and old.display_name_changed_at > now() - interval '14 days' then
      raise exception 'Username can only be changed every 14 days.';
    end if;
    new.display_name_changed_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists members_display_name_cooldown on public.members;
create trigger members_display_name_cooldown
  before update on public.members
  for each row
  execute function public.enforce_display_name_cooldown();
