export type CertificateStatus = 'valid' | 'revoked';

export interface Certificate {
  id: string; // UUID primary key
  certificate_id: string; // e.g. CN/SOT/INT/072026/001
  certificate_type: string; // e.g. "Internship Completion"
  certificate_title?: string | null; // e.g. "Certificate of Internship"
  recipient_name: string; // Recipient full name
  role: string; // Role or designation
  start_date?: string | null; // Optional start date YYYY-MM-DD
  end_date?: string | null; // Optional end date YYYY-MM-DD
  issuing_org: string; // "Streets of Tripura"
  issue_date: string; // YYYY-MM-DD
  status: CertificateStatus;
  created_at: string;
  updated_at: string;
}

export type PublicCertificate = Pick<
  Certificate,
  | 'certificate_id'
  | 'certificate_type'
  | 'certificate_title'
  | 'recipient_name'
  | 'role'
  | 'start_date'
  | 'end_date'
  | 'issuing_org'
  | 'issue_date'
  | 'status'
  | 'created_at'
>;

export interface AuditLog {
  id: string;
  certificate_id: string;
  admin_id: string | null;
  admin_email: string | null;
  action: 'issued' | 'updated' | 'revoked' | 'restored';
  details: Record<string, unknown>;
  created_at: string;
}
