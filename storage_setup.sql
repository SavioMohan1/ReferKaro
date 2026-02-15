-- Create a new storage bucket for verification documents
insert into storage.buckets (id, name, public)
values ('verification-documents', 'verification-documents', true);

-- Policy: Allow authenticated users to upload files
create policy "Authenticated users can upload verification docs"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'verification-documents' );

-- Policy: Allow public to view (or restrict to admin if strict, but public is easier for MVP)
create policy "Public can view verification docs"
  on storage.objects for select
  to public
  using ( bucket_id = 'verification-documents' );

-- Policy: Allow users to update/delete their own files (Optional)
create policy "Users can update their own verification docs"
  on storage.objects for update
  to authenticated
  using ( bucket_id = 'verification-documents' and owner = auth.uid() );
