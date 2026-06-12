-- ============================================================
--  ScoreUp — allow the new Publishable key to read/write
--  Run this ONCE in Supabase → SQL Editor → Run.
--  (Needed because Supabase's new publishable keys use a role
--   that the original policies didn't include.)
-- ============================================================

-- Make the access policies apply to everyone (anon + new keys).
-- Pilot-friendly: the app reads/writes with the public key.

do $$
declare t text;
begin
  foreach t in array array['students','homework','submissions','staff'] loop
    execute format('alter table %I enable row level security;', t);
    -- drop old policies if present, then recreate as PERMISSIVE for all roles
    execute format('drop policy if exists "anon all %1$s" on %1$s;', t);
    execute format('drop policy if exists "public all %1$s" on %1$s;', t);
    if t = 'staff' then
      execute format('create policy "public read %1$s" on %1$s for select using (true);', t);
    else
      execute format('create policy "public all %1$s" on %1$s for all using (true) with check (true);', t);
    end if;
  end loop;
end $$;

-- storage: allow photo upload/read with the public key
do $$
begin
  begin
    drop policy if exists "anon upload" on storage.objects;
    drop policy if exists "anon read" on storage.objects;
  exception when others then null; end;
  begin create policy "public upload" on storage.objects for insert with check (bucket_id = 'submissions'); exception when duplicate_object then null; end;
  begin create policy "public read"   on storage.objects for select using (bucket_id = 'submissions'); exception when duplicate_object then null; end;
end $$;

-- Done. Your app can now read and write with the publishable key.
