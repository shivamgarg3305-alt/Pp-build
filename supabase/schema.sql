-- P BUILDS: Supabase schema. Safe to re-run.

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text check (category in ('Android Apps', 'AI Tools', 'Web Apps', 'Other')),
  description text,
  tech_stack text[],
  image_url text,
  download_url text,
  website_url text,
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists projects_featured_created_idx
  on public.projects (is_featured desc, created_at desc);

alter table public.projects enable row level security;

drop policy if exists "Public can read projects" on public.projects;
create policy "Public can read projects"
  on public.projects for select
  using (true);

drop policy if exists "Authenticated can insert projects" on public.projects;
create policy "Authenticated can insert projects"
  on public.projects for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated can update projects" on public.projects;
create policy "Authenticated can update projects"
  on public.projects for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated can delete projects" on public.projects;
create policy "Authenticated can delete projects"
  on public.projects for delete
  to authenticated
  using (true);

-- Storage buckets (public)
insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('app-releases', 'app-releases', true)
on conflict (id) do update set public = true;

-- project-images policies
drop policy if exists "Public read project-images" on storage.objects;
create policy "Public read project-images"
  on storage.objects for select
  using (bucket_id = 'project-images');

drop policy if exists "Authenticated insert project-images" on storage.objects;
create policy "Authenticated insert project-images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'project-images');

drop policy if exists "Authenticated update project-images" on storage.objects;
create policy "Authenticated update project-images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'project-images')
  with check (bucket_id = 'project-images');

drop policy if exists "Authenticated delete project-images" on storage.objects;
create policy "Authenticated delete project-images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'project-images');

-- app-releases policies
drop policy if exists "Public read app-releases" on storage.objects;
create policy "Public read app-releases"
  on storage.objects for select
  using (bucket_id = 'app-releases');

drop policy if exists "Authenticated insert app-releases" on storage.objects;
create policy "Authenticated insert app-releases"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'app-releases');

drop policy if exists "Authenticated update app-releases" on storage.objects;
create policy "Authenticated update app-releases"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'app-releases')
  with check (bucket_id = 'app-releases');

drop policy if exists "Authenticated delete app-releases" on storage.objects;
create policy "Authenticated delete app-releases"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'app-releases');

-- Seed data (only if the table is empty)
insert into public.projects
  (title, category, description, tech_stack, download_url, website_url, is_featured)
select * from (
  values
    (
      'Fitness Tracker',
      'Android Apps',
      'A clean workout and habit tracker with offline-first logging, weekly progress charts and a Material 3 interface.',
      array['Kotlin', 'Jetpack Compose', 'Room', 'Material 3']::text[],
      'https://example.com/downloads/fitness-tracker.apk',
      null::text,
      true
    ),
    (
      'Personal AI Assistant',
      'AI Tools',
      'A fast, private assistant that helps with notes, drafting and daily planning, powered by modern language models.',
      array['Next.js', 'OpenAI API', 'Supabase', 'Tailwind']::text[],
      null::text,
      'https://example.com',
      false
    )
) as seed(title, category, description, tech_stack, download_url, website_url, is_featured)
where not exists (select 1 from public.projects);
