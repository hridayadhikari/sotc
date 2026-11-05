'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { certificateSchema, updateCertificateSchema, loginSchema } from '@/lib/validations';
import { Certificate, CertificateStatus, AuditLog } from '@/types/certificate';

function hasSupabaseConfig(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// -------------------------------------------------------------
// Authentication Actions
// -------------------------------------------------------------

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const parsed = loginSchema.safeParse({ email, password });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid input credentials' };
  }

  if (!hasSupabaseConfig()) {
    return { error: 'Database configuration missing in environment variables.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin');
  redirect('/admin');
}

export async function logoutAction() {
  if (hasSupabaseConfig()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  revalidatePath('/');
  redirect('/login');
}

// -------------------------------------------------------------
// Certificate Query Actions (Admin Dashboard)
// -------------------------------------------------------------

export async function getAdminDashboardData() {
  if (!hasSupabaseConfig()) {
    return {
      user: null,
      certificates: [] as Certificate[],
      auditLogs: [] as AuditLog[],
      stats: { total: 0, valid: 0, revoked: 0 },
    };
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: certificates } = await supabase
      .from('certificates')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: auditLogs } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    const certList = (certificates || []).map((c: Record<string, unknown>) => ({
      ...c,
      recipient_name: (c.recipient_name || c.intern_name || '') as string,
      certificate_type: (c.certificate_type || 'Internship Completion') as string,
      certificate_title: (c.certificate_title || 'Certificate of Internship') as string,
    })) as Certificate[];

    const total = certList.length;
    const valid = certList.filter((c) => c.status === 'valid').length;
    const revoked = certList.filter((c) => c.status === 'revoked').length;

    return {
      user: user ? { email: user.email, id: user.id } : null,
      certificates: certList,
      auditLogs: (auditLogs || []) as AuditLog[],
      stats: { total, valid, revoked },
    };
  } catch {
    return {
      user: null,
      certificates: [] as Certificate[],
      auditLogs: [] as AuditLog[],
      stats: { total: 0, valid: 0, revoked: 0 },
    };
  }
}

// -------------------------------------------------------------
// Certificate Management Actions
// -------------------------------------------------------------

export async function issueCertificateAction(rawInput: unknown) {
  const parsed = certificateSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Validation failed' };
  }

  const certData = parsed.data;

  if (!hasSupabaseConfig()) {
    return { error: 'Supabase configuration missing.' };
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized: Admin session required' };
    }

    const { data: existing } = await supabase
      .from('certificates')
      .select('certificate_id')
      .eq('certificate_id', certData.certificate_id)
      .maybeSingle();

    if (existing) {
      return { error: `Certificate ID ${certData.certificate_id} already exists!` };
    }

    const { data, error } = await supabase
      .from('certificates')
      .insert({
        certificate_id: certData.certificate_id,
        certificate_type: certData.certificate_type,
        certificate_title: certData.certificate_title || 'Certificate of Internship',
        recipient_name: certData.recipient_name,
        role: certData.role,
        start_date: certData.start_date || null,
        end_date: certData.end_date || null,
        issuing_org: certData.issuing_org,
        issue_date: certData.issue_date,
        status: certData.status,
      })
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    await supabase.from('audit_logs').insert({
      certificate_id: certData.certificate_id,
      admin_id: user.id,
      admin_email: user.email,
      action: 'issued',
      details: {
        certificate_type: certData.certificate_type,
        certificate_title: certData.certificate_title,
        recipient_name: certData.recipient_name,
        role: certData.role,
      },
    });

    revalidatePath('/admin');
    revalidatePath(`/verify/${encodeURIComponent(certData.certificate_id)}`);
    return { success: true, certificate: data };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'Database operation failed' };
  }
}

export async function updateCertificateAction(certificateId: string, rawInput: unknown) {
  const parsed = updateCertificateSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Validation failed' };
  }

  if (!hasSupabaseConfig()) {
    return { error: 'Supabase configuration missing.' };
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized: Admin session required' };
    }

    const { data: currentCert, error: fetchErr } = await supabase
      .from('certificates')
      .select('*')
      .eq('certificate_id', certificateId)
      .single();

    if (fetchErr || !currentCert) {
      return { error: 'Certificate not found' };
    }

    const { reason, ...updates } = parsed.data;

    const { error: updateErr } = await supabase
      .from('certificates')
      .update({
        ...updates,
        start_date: updates.start_date || null,
        end_date: updates.end_date || null,
      })
      .eq('certificate_id', certificateId);

    if (updateErr) {
      return { error: updateErr.message };
    }

    await supabase.from('audit_logs').insert({
      certificate_id: certificateId,
      admin_id: user.id,
      admin_email: user.email,
      action: 'updated',
      details: {
        changes: updates,
        reason: reason || 'Information update',
      },
    });

    revalidatePath('/admin');
    revalidatePath(`/verify/${encodeURIComponent(certificateId)}`);
    return { success: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'Update failed' };
  }
}

export async function setCertificateStatusAction(
  certificateId: string,
  newStatus: CertificateStatus,
  reason?: string
) {
  if (!hasSupabaseConfig()) {
    return { error: 'Supabase configuration missing.' };
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized: Admin session required' };
    }

    const { error: updateErr } = await supabase
      .from('certificates')
      .update({ status: newStatus })
      .eq('certificate_id', certificateId);

    if (updateErr) {
      return { error: updateErr.message };
    }

    const action = newStatus === 'revoked' ? 'revoked' : 'restored';

    await supabase.from('audit_logs').insert({
      certificate_id: certificateId,
      admin_id: user.id,
      admin_email: user.email,
      action,
      details: {
        reason: reason || (newStatus === 'revoked' ? 'Administrative revocation' : 'Certificate restored to valid'),
      },
    });

    revalidatePath('/admin');
    revalidatePath(`/verify/${encodeURIComponent(certificateId)}`);
    return { success: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'Status update failed' };
  }
}
