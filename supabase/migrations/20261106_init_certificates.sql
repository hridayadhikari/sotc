-- Supabase Schema for Streets of Tripura Universal Certificate Verification System

-- 1. Certificates Table
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_id TEXT NOT NULL UNIQUE,
    certificate_type TEXT NOT NULL DEFAULT 'Internship Completion',
    certificate_title TEXT DEFAULT 'Certificate of Internship',
    recipient_name TEXT NOT NULL,
    role TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    issuing_org TEXT NOT NULL DEFAULT 'Streets of Tripura',
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL CHECK (status IN ('valid', 'revoked')) DEFAULT 'valid',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Backward compatibility columns in case table already exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='certificates' AND column_name='intern_name') THEN
        ALTER TABLE public.certificates RENAME COLUMN intern_name TO recipient_name;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='certificates' AND column_name='certificate_type') THEN
        ALTER TABLE public.certificates ADD COLUMN certificate_type TEXT NOT NULL DEFAULT 'Internship Completion';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='certificates' AND column_name='certificate_title') THEN
        ALTER TABLE public.certificates ADD COLUMN certificate_title TEXT DEFAULT 'Certificate of Internship';
    END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_certificates_cert_id ON public.certificates (certificate_id);
CREATE INDEX IF NOT EXISTS idx_certificates_recipient_name ON public.certificates (recipient_name);
CREATE INDEX IF NOT EXISTS idx_certificates_type ON public.certificates (certificate_type);
CREATE INDEX IF NOT EXISTS idx_certificates_status ON public.certificates (status);

-- 2. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_id TEXT NOT NULL,
    admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    admin_email TEXT,
    action TEXT NOT NULL CHECK (action IN ('issued', 'updated', 'revoked', 'restored')),
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_cert_id ON public.audit_logs (certificate_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs (created_at DESC);

-- 3. Public Verification View (Strictly whitelisted fields, no private recipient data)
CREATE OR REPLACE VIEW public.public_certificates AS
SELECT
    certificate_id,
    certificate_type,
    certificate_title,
    recipient_name,
    role,
    start_date,
    end_date,
    issuing_org,
    issue_date,
    status,
    created_at
FROM public.certificates;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Security Policies for certificates:
DROP POLICY IF EXISTS "Allow public read-only access to certificates" ON public.certificates;
CREATE POLICY "Allow public read-only access to certificates"
ON public.certificates
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert certificates" ON public.certificates;
CREATE POLICY "Allow authenticated users to insert certificates"
ON public.certificates
FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to update certificates" ON public.certificates;
CREATE POLICY "Allow authenticated users to update certificates"
ON public.certificates
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to delete certificates" ON public.certificates;
CREATE POLICY "Allow authenticated users to delete certificates"
ON public.certificates
FOR DELETE
TO authenticated
USING (true);

-- Security Policies for audit_logs:
DROP POLICY IF EXISTS "Allow authenticated users to select audit logs" ON public.audit_logs;
CREATE POLICY "Allow authenticated users to select audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert audit logs" ON public.audit_logs;
CREATE POLICY "Allow authenticated users to insert audit logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_certificates_updated_at ON public.certificates;
CREATE TRIGGER trigger_set_certificates_updated_at
BEFORE UPDATE ON public.certificates
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 5. Seed All Official Intern Certificates
INSERT INTO public.certificates (
    certificate_id,
    recipient_name,
    certificate_type,
    certificate_title,
    role,
    issuing_org,
    start_date,
    end_date,
    issue_date,
    status
) VALUES
(
    'CN/SOT/INT/072026/001',
    'Anwesha Saha',
    'Internship Completion',
    'Certificate of Internship',
    'Video Editor',
    'Streets of Tripura',
    '2026-07-16',
    '2026-10-15',
    '2026-10-15',
    'valid'
),
(
    'CN/SOT/INT/072026/002',
    'Nandan Das',
    'Internship Completion',
    'Certificate of Internship',
    'Social Media Manager',
    'Streets of Tripura',
    '2026-07-16',
    '2026-10-15',
    '2026-10-15',
    'valid'
),
(
    'CN/SOT/INT/072026/003',
    'Rishibjeet Kaur',
    'Internship Completion',
    'Certificate of Internship',
    'Graphic Designer',
    'Streets of Tripura',
    '2026-07-16',
    '2026-10-15',
    '2026-10-15',
    'valid'
),
(
    'CN/SOT/INT/072026/004',
    'Prince Garg',
    'Internship Completion',
    'Certificate of Internship',
    'Social Media Manager',
    'Streets of Tripura',
    '2026-07-16',
    '2026-10-15',
    '2026-10-15',
    'valid'
),
(
    'CN/SOT/INT/072026/005',
    'Shubham Mishra',
    'Internship Completion',
    'Certificate of Internship',
    'Video Editor',
    'Streets of Tripura',
    '2026-07-16',
    '2026-10-15',
    '2026-10-15',
    'valid'
),
(
    'CN/SOT/INT/072026/006',
    'Bhaskar Debnath',
    'Internship Completion',
    'Certificate of Internship',
    'Graphic Designer',
    'Streets of Tripura',
    '2026-07-16',
    '2026-10-15',
    '2026-10-15',
    'valid'
),
(
    'CN/SOT/INT/072026/008',
    'Kanika Bera',
    'Internship Completion',
    'Certificate of Internship',
    'Graphic Designer',
    'Streets of Tripura',
    '2026-07-16',
    '2026-10-15',
    '2026-10-15',
    'valid'
),
(
    'CN/SOT/INT/072026/011',
    'Shivam Mishra',
    'Internship Completion',
    'Certificate of Internship',
    'Graphic Designer',
    'Streets of Tripura',
    '2026-07-21',
    '2026-10-21',
    '2026-10-21',
    'valid'
)
ON CONFLICT (certificate_id) DO UPDATE SET
    recipient_name = EXCLUDED.recipient_name,
    certificate_type = EXCLUDED.certificate_type,
    certificate_title = EXCLUDED.certificate_title,
    role = EXCLUDED.role,
    issuing_org = EXCLUDED.issuing_org,
    start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date,
    issue_date = EXCLUDED.issue_date,
    status = EXCLUDED.status;
