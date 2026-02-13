-- Create table for Folders
create table if not exists folders (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  icon text, -- optional icon name (e.g. lucide icon name)
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create table for Resources (Files, Links, Notes)
create table if not exists resources (
  id uuid default gen_random_uuid() primary key,
  folder_id uuid references folders(id) on delete cascade,
  type text not null check (type in ('file', 'link', 'note')),
  title text not null,
  content text, -- used for notes or descriptions
  url text, -- used for links
  file_path text, -- used for files stored in storage
  file_size bigint, -- specific for files
  mime_type text, -- specific for files
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (Row Level Security)
alter table folders enable row level security;
alter table resources enable row level security;

-- Policies for Folders (Public access since it's a shared app for now, or authenticated)
create policy "Enable all access for authenticated users" 
on folders for all 
using (auth.role() = 'authenticated');

create policy "Enable read access for everyone"
on folders for select
using (true);

-- Policies for Resources
create policy "Enable all access for authenticated users" 
on resources for all 
using (auth.role() = 'authenticated');

create policy "Enable read access for everyone"
on resources for select
using (true);

-- Storage Bucket configuration for 'resources'
insert into storage.buckets (id, name, public) 
values ('resources', 'resources', true)
on conflict (id) do nothing;

create policy "Give users access to own folder 1u7ndz_0" 
on storage.objects for select 
to public 
using (bucket_id = 'resources');

create policy "Give users access to own folder 1u7ndz_1" 
on storage.objects for insert 
to public 
with check (bucket_id = 'resources');

create policy "Give users access to own folder 1u7ndz_2" 
on storage.objects for update 
to public 
using (bucket_id = 'resources');

create policy "Give users access to own folder 1u7ndz_3" 
on storage.objects for delete 
to public 
using (bucket_id = 'resources');
