-- Private storage bucket for transfer receipts.
-- Uploads should be performed from Next.js server routes with the service role key.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'receipts',
  'receipts',
  false,
  10485760,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- The bucket is intentionally private. The service role key bypasses RLS and
-- can upload/read files from server routes. Admin views should generate signed
-- URLs instead of exposing the bucket publicly.
