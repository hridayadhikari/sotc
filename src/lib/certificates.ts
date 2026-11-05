import { createClient } from '@/lib/supabase/server';
import { PublicCertificate } from '@/types/certificate';

/**
 * Public Verification Query
 * Strictly extracts only public verification fields.
 * Does not expose sensitive user data.
 */
export async function getCertificateForVerification(
  certificateId: string
): Promise<PublicCertificate | null> {
  const normalizedId = decodeURIComponent(certificateId).trim();

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('certificates')
      .select('certificate_id, certificate_type, certificate_title, recipient_name, role, start_date, end_date, issuing_org, issue_date, status, created_at')
      .eq('certificate_id', normalizedId)
      .maybeSingle();

    if (!error && data) {
      return data as PublicCertificate;
    }
  } catch {
    // Return null if database is unreachable
  }

  return null;
}
