-- Comments: track edits
alter table public.comments
  add column if not exists updated_at timestamptz;

-- Only idea authors can update (final decision) or delete ideas
drop policy if exists "ideas_update_authenticated" on public.ideas;
create policy "ideas_update_own"
  on public.ideas for update
  to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

drop policy if exists "ideas_delete_authenticated" on public.ideas;
create policy "ideas_delete_own"
  on public.ideas for delete
  to authenticated
  using (author_id = auth.uid());

-- Comment authors can update their comments
create policy "comments_update_own"
  on public.comments for update
  to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

grant update on public.comments to authenticated;
