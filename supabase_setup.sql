-- ============================================================
--  ScoreUp Elite Academy — Database setup
--  Paste this WHOLE file into Supabase → SQL Editor → Run.
--  It creates the tables and adds your starter students + homework.
-- ============================================================

-- ---------- STUDENTS ----------
create table if not exists students (
  id text primary key,
  name text not null,
  "group" text not null,
  pin text not null,
  parent_name text,
  parent_whatsapp text
);

-- ---------- HOMEWORK ----------
create table if not exists homework (
  id text primary key,
  title text not null,
  "group" text not null,
  subject text,
  skill text,
  difficulty text,
  due date,
  mode text default 'quiz',          -- 'quiz' or 'upload'
  instructions text,
  questions jsonb default '[]'::jsonb -- [{q, a}, ...]
);

-- ---------- SUBMISSIONS ----------
create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  student_id text references students(id),
  hw_id text references homework(id),
  "group" text,
  answers jsonb,
  photo_url text,
  note text,
  score numeric,                     -- 0..1, null = ungraded
  submitted_at timestamptz default now(),
  unique (student_id, hw_id)         -- one submission per student per HW (resubmit updates)
);

-- ---------- TEACHER (single login) ----------
create table if not exists staff (
  id serial primary key,
  password text not null
);

-- ============================================================
--  Open access for the app (anon key). Simple model for a pilot:
--  the app reads/writes with the public anon key.
-- ============================================================
alter table students    enable row level security;
alter table homework    enable row level security;
alter table submissions enable row level security;
alter table staff       enable row level security;

-- allow the anon role to read/write (pilot-friendly).
do $$
begin
  -- students
  begin create policy "anon all students" on students for all using (true) with check (true); exception when duplicate_object then null; end;
  -- homework
  begin create policy "anon all homework" on homework for all using (true) with check (true); exception when duplicate_object then null; end;
  -- submissions
  begin create policy "anon all submissions" on submissions for all using (true) with check (true); exception when duplicate_object then null; end;
  -- staff
  begin create policy "anon read staff" on staff for select using (true); exception when duplicate_object then null; end;
end $$;

-- ============================================================
--  SEED DATA — edit names/PINs to your real class later.
-- ============================================================
insert into staff (password) values ('admin') on conflict do nothing;

insert into students (id, name, "group", pin, parent_name, parent_whatsapp) values
  ('s1','Ahmed Al Mansoori','SAT-A','1234','Mr. Al Mansoori','+971501112233'),
  ('s2','Sara Khan','SAT-A','1234','Mrs. Khan','+971502223344'),
  ('s3','Yousef Ali','SAT-A','1234','Mr. Ali','+971503334455'),
  ('s4','Omar Haddad','SAT-B','1234','Mr. Haddad','+971504445566'),
  ('s5','Layla Hassan','SAT-B','1234','Mrs. Hassan','+971505556677'),
  ('s6','Mariam Saleh','SAT-B','1234','Mr. Saleh','+971506667788')
on conflict (id) do nothing;

insert into homework (id, title, "group", subject, skill, difficulty, due, mode, instructions, questions) values
  ('HW-001','Linear Equations','SAT-A','Math','Algebra','Medium','2026-06-16','quiz',
   'Solve each equation for x. Show your reasoning.',
   '[{"q":"Solve: 3x + 7 = 22","a":"5"},{"q":"Solve: 2(x - 4) = 10","a":"9"},{"q":"Solve: 5x - 3 = 2x + 9","a":"4"}]'::jsonb),
  ('HW-002','Subject-Verb Agreement','SAT-B','English','Grammar','Easy','2026-06-15','quiz',
   'Choose the correct verb form.',
   '[{"q":"The team (is / are) winning.","a":"is"},{"q":"Neither of the boys (was / were) ready.","a":"was"}]'::jsonb),
  ('HW-003','Author''s Purpose','SAT-A','English','Reading-Inference','Hard','2026-06-17','upload',
   'Read the passage in your packet. Write a paragraph on the author''s purpose and photograph your work.',
   '[]'::jsonb)
on conflict (id) do nothing;

-- ============================================================
--  PHOTO STORAGE — run this to allow photo uploads.
-- ============================================================
insert into storage.buckets (id, name, public)
values ('submissions','submissions', true)
on conflict (id) do nothing;

do $$
begin
  begin create policy "anon upload" on storage.objects for insert to anon with check (bucket_id = 'submissions'); exception when duplicate_object then null; end;
  begin create policy "anon read"   on storage.objects for select to anon using (bucket_id = 'submissions'); exception when duplicate_object then null; end;
end $$;

-- Done. Your database is ready.
