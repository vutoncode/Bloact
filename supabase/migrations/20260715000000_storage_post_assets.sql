-- 1. Create the 'post-assets' bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('post-assets', 'post-assets', true)
on conflict (id) do nothing;

-- 3. Policy: Allow public read access to the 'post-assets' bucket
create policy "Allow public read access to post-assets"
on storage.objects for select
using ( bucket_id = 'post-assets' );

-- 4. Policy: Allow authenticated users to upload files to their own folder inside 'post-assets'
create policy "Allow authenticated users to upload to post-assets"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'post-assets'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. Policy: Allow users to update or delete their own uploaded files
create policy "Allow users to manage their own post-assets"
on storage.objects for all
to authenticated
using (
  bucket_id = 'post-assets'
  and (storage.foldername(name))[1] = auth.uid()::text
);
