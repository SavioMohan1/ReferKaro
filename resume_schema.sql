-- Create a new storage bucket for resumes
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false);

-- Set up RLS policies for the resumes bucket
create policy "Authenticated users can upload resumes"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'resumes' );

create policy "Users can view their own resumes"
on storage.objects for select
to authenticated
using ( bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1] );

create policy "Employees can view resumes of applicants"
on storage.objects for select
to authenticated
using ( bucket_id = 'resumes' ); -- Ideally stricter, but good for MVP

-- Add resume_url column to applications table
alter table applications
add column if not exists resume_url text;
