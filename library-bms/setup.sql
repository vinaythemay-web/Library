-- ═══════════════════════════════════════════════════════════════════
--  LibraryMS — Supabase Database Setup
--  Run this in: Supabase → SQL Editor → New Query → Run
-- ═══════════════════════════════════════════════════════════════════


-- ── 1. Profiles (extends Supabase auth.users) ──────────────────────
create table if not exists profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  name        text not null,
  email       text,
  role        text not null default 'member' check (role in ('admin', 'member')),
  member_id   text unique,
  phone       text,
  joined_at   timestamptz default now()
);


-- ── 2. Books ────────────────────────────────────────────────────────
create table if not exists books (
  id                uuid default gen_random_uuid() primary key,
  title             text not null,
  author            text not null,
  genre             text default 'General',
  isbn              text,
  total_copies      integer not null default 1 check (total_copies >= 1),
  available_copies  integer not null default 1 check (available_copies >= 0),
  added_at          timestamptz default now()
);


-- ── 3. Lendings ─────────────────────────────────────────────────────
create table if not exists lendings (
  id           uuid default gen_random_uuid() primary key,
  book_id      uuid references books(id)    on delete restrict not null,
  member_id    uuid references profiles(id) on delete restrict not null,
  lent_at      timestamptz default now(),
  due_date     date not null,
  returned_at  timestamptz,
  fine_amount  numeric(8,2) default 0,
  status       text not null default 'active' check (status in ('active', 'returned', 'overdue'))
);


-- ── 4. Row Level Security ────────────────────────────────────────────
alter table profiles enable row level security;
alter table books     enable row level security;
alter table lendings  enable row level security;

-- Profiles: everyone logged in can read, users can manage their own
create policy "read profiles"   on profiles for select using (auth.role() = 'authenticated');
create policy "insert profile"  on profiles for insert with check (auth.uid() = id);
create policy "update profile"  on profiles for update using (auth.uid() = id);

-- Books: all authenticated users can read; insert/update/delete open to all authenticated
-- (for production, restrict these to admins using profiles.role check)
create policy "read books"   on books for select using (auth.role() = 'authenticated');
create policy "insert books" on books for insert with check (auth.role() = 'authenticated');
create policy "update books" on books for update using (auth.role() = 'authenticated');
create policy "delete books" on books for delete using (auth.role() = 'authenticated');

-- Lendings: all authenticated users can read and manage
create policy "read lendings"   on lendings for select using (auth.role() = 'authenticated');
create policy "insert lendings" on lendings for insert with check (auth.role() = 'authenticated');
create policy "update lendings" on lendings for update using (auth.role() = 'authenticated');


-- ── 5. Sample seed data (optional — delete if not needed) ───────────
insert into books (title, author, genre, isbn, total_copies, available_copies) values
  ('To Kill a Mockingbird',    'Harper Lee',          'Fiction',     '978-0061935466', 3, 3),
  ('A Brief History of Time',  'Stephen Hawking',     'Science',     '978-0553380163', 2, 2),
  ('Sapiens',                  'Yuval Noah Harari',   'History',     '978-0062316097', 4, 4),
  ('Clean Code',               'Robert C. Martin',   'Technology',  '978-0132350884', 2, 2),
  ('The Alchemist',            'Paulo Coelho',        'Fiction',     '978-0062315007', 5, 5),
  ('Introduction to Algorithms','Thomas H. Cormen',  'Mathematics', '978-0262033848', 2, 2),
  ('1984',                     'George Orwell',       'Fiction',     '978-0451524935', 3, 3),
  ('The Art of War',           'Sun Tzu',             'History',     '978-1590302255', 2, 2),
  ('Python Crash Course',      'Eric Matthes',        'Technology',  '978-1718502703', 3, 3),
  ('The Great Gatsby',         'F. Scott Fitzgerald', 'Literature',  '978-0743273565', 2, 2);


-- ── Done! ─────────────────────────────────────────────────────────────
-- After running this SQL:
-- 1. Open js/config.js in your project
-- 2. Replace YOUR_SUPABASE_PROJECT_URL with your project URL
-- 3. Replace YOUR_SUPABASE_ANON_KEY with your anon/public key
-- Both are found at: Supabase → Settings → API
