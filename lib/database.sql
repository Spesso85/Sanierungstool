-- ============================================================
-- SANIERUNGS-COCKPIT — Datenbankschema für Supabase
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- USERS (profiles, erweitert Supabase auth.users)
-- ============================================================
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null default '',
  email text not null default '',
  role text not null default 'viewer' check (role in ('admin', 'editor', 'viewer')),
  created_at timestamptz default now()
);

alter table public.users enable row level security;

create policy "Users can read all profiles" on public.users
  for select using (auth.role() = 'authenticated');

create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

create policy "Admins can manage users" on public.users
  for all using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    'editor'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- ROOMS (Räume)
-- ============================================================
create table public.rooms (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  created_at timestamptz default now()
);

alter table public.rooms enable row level security;

create policy "Authenticated users can read rooms" on public.rooms
  for select using (auth.role() = 'authenticated');

create policy "Editors and admins can manage rooms" on public.rooms
  for all using (
    exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'editor'))
  );

-- ============================================================
-- TRADES (Gewerke)
-- ============================================================
create table public.trades (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  created_at timestamptz default now()
);

alter table public.trades enable row level security;

create policy "Authenticated users can read trades" on public.trades
  for select using (auth.role() = 'authenticated');

create policy "Editors and admins can manage trades" on public.trades
  for all using (
    exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'editor'))
  );

-- ============================================================
-- CONTRACTORS (Handwerker/Firmen)
-- ============================================================
create table public.contractors (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  company text,
  phone text,
  email text,
  notes text,
  created_at timestamptz default now()
);

alter table public.contractors enable row level security;

create policy "Authenticated users can read contractors" on public.contractors
  for select using (auth.role() = 'authenticated');

create policy "Editors and admins can manage contractors" on public.contractors
  for all using (
    exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'editor'))
  );

-- ============================================================
-- TASKS (Aufgaben)
-- ============================================================
create table public.tasks (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  room_id uuid references public.rooms(id) on delete set null,
  trade_id uuid references public.trades(id) on delete set null,
  contractor_id uuid references public.contractors(id) on delete set null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'blocked', 'done')),
  due_date date,
  start_date date,
  end_date date,
  duration_days integer,
  blocked_reason text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.tasks enable row level security;

create policy "Authenticated users can read tasks" on public.tasks
  for select using (auth.role() = 'authenticated');

create policy "Editors and admins can manage tasks" on public.tasks
  for all using (
    exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'editor'))
  );

create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tasks_updated_at
  before update on public.tasks
  for each row execute procedure public.update_updated_at();

-- ============================================================
-- TASK DEPENDENCIES
-- ============================================================
create table public.task_dependencies (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid not null references public.tasks(id) on delete cascade,
  depends_on_task_id uuid not null references public.tasks(id) on delete cascade,
  unique(task_id, depends_on_task_id)
);

alter table public.task_dependencies enable row level security;

create policy "Authenticated users can read dependencies" on public.task_dependencies
  for select using (auth.role() = 'authenticated');

create policy "Editors and admins can manage dependencies" on public.task_dependencies
  for all using (
    exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'editor'))
  );

-- ============================================================
-- DOCUMENTS
-- ============================================================
create table public.documents (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  file_url text not null,
  file_type text,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

alter table public.documents enable row level security;

create policy "Authenticated users can read documents" on public.documents
  for select using (auth.role() = 'authenticated');

create policy "Editors and admins can manage documents" on public.documents
  for all using (
    exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'editor'))
  );

-- ============================================================
-- DOCUMENT LINKS
-- ============================================================
create table public.document_links (
  id uuid default uuid_generate_v4() primary key,
  document_id uuid not null references public.documents(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete cascade,
  trade_id uuid references public.trades(id) on delete cascade,
  room_id uuid references public.rooms(id) on delete cascade
);

alter table public.document_links enable row level security;

create policy "Authenticated users can read document links" on public.document_links
  for select using (auth.role() = 'authenticated');

create policy "Editors and admins can manage document links" on public.document_links
  for all using (
    exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'editor'))
  );

-- ============================================================
-- SHOPPING ITEMS
-- ============================================================
create table public.shopping_items (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  quantity numeric not null default 1,
  unit text,
  category text,
  store text,
  purchased boolean not null default false,
  linked_task_id uuid references public.tasks(id) on delete set null,
  created_at timestamptz default now()
);

alter table public.shopping_items enable row level security;

create policy "Authenticated users can read shopping items" on public.shopping_items
  for select using (auth.role() = 'authenticated');

create policy "Editors and admins can manage shopping items" on public.shopping_items
  for all using (
    exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'editor'))
  );

-- ============================================================
-- EXPENSES
-- ============================================================
create table public.expenses (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  amount numeric not null default 0,
  category text,
  paid boolean not null default false,
  document_id uuid references public.documents(id) on delete set null,
  trade_id uuid references public.trades(id) on delete set null,
  created_at timestamptz default now()
);

alter table public.expenses enable row level security;

create policy "Authenticated users can read expenses" on public.expenses
  for select using (auth.role() = 'authenticated');

create policy "Editors and admins can manage expenses" on public.expenses
  for all using (
    exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'editor'))
  );

-- ============================================================
-- CALENDAR EVENTS
-- ============================================================
create table public.calendar_events (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  start_date date not null,
  end_date date,
  related_trade_id uuid references public.trades(id) on delete set null,
  created_at timestamptz default now()
);

alter table public.calendar_events enable row level security;

create policy "Authenticated users can read events" on public.calendar_events
  for select using (auth.role() = 'authenticated');

create policy "Editors and admins can manage events" on public.calendar_events
  for all using (
    exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'editor'))
  );

-- ============================================================
-- STORAGE BUCKET
-- ============================================================
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict do nothing;

create policy "Authenticated users can upload" on storage.objects
  for insert with check (
    bucket_id = 'documents' and auth.role() = 'authenticated'
  );

create policy "Authenticated users can read documents" on storage.objects
  for select using (
    bucket_id = 'documents' and auth.role() = 'authenticated'
  );

create policy "Editors and admins can delete documents" on storage.objects
  for delete using (
    bucket_id = 'documents' and
    exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'editor'))
  );

-- ============================================================
-- SEED DATA (Beispiel-Gewerke & Räume)
-- ============================================================
insert into public.trades (name) values
  ('Elektro'), ('Sanitär'), ('Heizung'), ('Trockenbau'),
  ('Maler'), ('Fliesen'), ('Fenster & Türen'), ('Böden'),
  ('Dach'), ('Fassade'), ('Zimmerei'), ('Abriss')
on conflict do nothing;

insert into public.rooms (name) values
  ('Wohnzimmer'), ('Küche'), ('Bad OG'), ('Bad EG'),
  ('Schlafzimmer'), ('Kinderzimmer'), ('Keller'), ('Dachgeschoss'),
  ('Flur'), ('Garage'), ('Außenbereich')
on conflict do nothing;
