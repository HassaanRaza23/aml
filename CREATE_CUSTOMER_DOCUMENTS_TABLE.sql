-- Table to store metadata for customer-related documents used in AML / KYC

CREATE TABLE IF NOT EXISTS public.customer_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Link to the customer
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,

  -- Storage location (Supabase Storage bucket + object path)
  bucket TEXT NOT NULL,
  object_path TEXT NOT NULL,

  -- Metadata
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size_bytes BIGINT,
  category TEXT,           -- e.g. ID, Passport, License, Proof of Address, Corporate Docs, Other
  description TEXT,

  uploaded_by UUID,        -- optional: reference to users table if you have one
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_documents_customer_id
  ON public.customer_documents (customer_id, created_at DESC);

-- Enable Row Level Security on the table
ALTER TABLE public.customer_documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage customer documents" ON public.customer_documents;
DROP POLICY IF EXISTS "Anyone can manage customer documents" ON public.customer_documents;

-- Create RLS policies for the table
-- NOTE: This allows anonymous access - suitable for development but NOT recommended for production
-- No role specified means it applies to all users (authenticated and anonymous)
CREATE POLICY "Anyone can manage customer documents"
ON public.customer_documents
FOR ALL
USING (true)
WITH CHECK (true);

-- Create the storage bucket
-- Note: You need to be a superuser or have the right permissions to insert into storage.buckets
-- If this fails, create the bucket via Supabase Dashboard:
-- 1. Go to Storage in your Supabase Dashboard
-- 2. Click "New bucket"
-- 3. Name: customer_documents
-- 4. Public: No (private bucket)
-- 5. File size limit: 50MB (or your preference)
-- 6. Allowed MIME types: Leave empty to allow all types

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('customer_documents', 'customer_documents', false, 52428800, NULL)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket policies (RLS for storage)
-- NOTE: These policies allow anonymous access - suitable for development but NOT recommended for production

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update documents" ON storage.objects;
DROP POLICY IF EXISTS "Anonymous users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Anonymous users can read documents" ON storage.objects;
DROP POLICY IF EXISTS "Anonymous users can delete documents" ON storage.objects;
DROP POLICY IF EXISTS "Anonymous users can update documents" ON storage.objects;

-- Policy: Allow anonymous users to upload files
CREATE POLICY "Anonymous users can upload documents"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (bucket_id = 'customer_documents');

-- Policy: Allow anonymous users to read files
CREATE POLICY "Anonymous users can read documents"
ON storage.objects
FOR SELECT
TO anon
USING (bucket_id = 'customer_documents');

-- Policy: Allow anonymous users to delete files
CREATE POLICY "Anonymous users can delete documents"
ON storage.objects
FOR DELETE
TO anon
USING (bucket_id = 'customer_documents');

-- Policy: Allow anonymous users to update file metadata
CREATE POLICY "Anonymous users can update documents"
ON storage.objects
FOR UPDATE
TO anon
USING (bucket_id = 'customer_documents')
WITH CHECK (bucket_id = 'customer_documents');

-- ALTERNATIVE: If the above policies still don't work, you can disable RLS entirely for development:
-- (Uncomment the line below to disable RLS - NOT recommended for production)
-- ALTER TABLE public.customer_documents DISABLE ROW LEVEL SECURITY;

