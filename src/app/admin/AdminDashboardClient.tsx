'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Certificate,
  CertificateStatus,
  AuditLog,
} from '@/types/certificate';
import {
  issueCertificateAction,
  updateCertificateAction,
  setCertificateStatusAction,
  logoutAction,
} from '@/actions/certificates';
import {
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  QrCode,
  FileText,
  RotateCcw,
  Edit,
  History,
  LogOut,
  ExternalLink,
  X,
  AlertCircle,
} from 'lucide-react';

interface Props {
  initialCertificates: Certificate[];
  initialStats: { total: number; valid: number; revoked: number };
  initialAuditLogs: AuditLog[];
  adminUser: { email?: string; id?: string } | null;
}

export default function AdminDashboardClient({
  initialCertificates,
  initialStats,
  initialAuditLogs,
  adminUser,
}: Props) {
  const router = useRouter();
  const [certificates, setCertificates] = useState<Certificate[]>(initialCertificates);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);
  const [stats, setStats] = useState(initialStats);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'valid' | 'revoked'>('all');

  // Modals
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Certificate | null>(null);
  const [viewingAuditLogs, setViewingAuditLogs] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form states for New Issue
  const [newCert, setNewCert] = useState({
    certificate_id: '',
    certificate_type: 'Internship Certificate',
    recipient_name: '',
    role: '',
    start_date: '',
    end_date: '',
    issuing_org: 'Streets of Tripura',
    issue_date: new Date().toISOString().split('T')[0],
  });

  // Filtered Certificates
  const filteredCertificates = useMemo(() => {
    return certificates.filter((c) => {
      const recipient = (c.recipient_name || '').toLowerCase();
      const certType = (c.certificate_type || '').toLowerCase();
      const matchesSearch =
        c.certificate_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipient.includes(searchQuery.toLowerCase()) ||
        certType.includes(searchQuery.toLowerCase()) ||
        c.role.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ? true : c.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [certificates, searchQuery, statusFilter]);

  // Handle New Issue Submit
  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setLoading(true);

    const res = await issueCertificateAction({
      ...newCert,
      status: 'valid',
    });

    if (res?.error) {
      setActionError(res.error);
      setLoading(false);
      return;
    }

    const createdCert: Certificate = {
      id: `cert-${newCert.certificate_id}`,
      ...newCert,
      status: 'valid',
      created_at: newCert.issue_date,
      updated_at: newCert.issue_date,
    };

    setCertificates([createdCert, ...certificates]);
    setStats((prev) => ({ ...prev, total: prev.total + 1, valid: prev.valid + 1 }));
    setAuditLogs([
      {
        id: `audit-${newCert.certificate_id}`,
        certificate_id: newCert.certificate_id,
        admin_id: adminUser?.id || null,
        admin_email: adminUser?.email || null,
        action: 'issued',
        details: {
          certificate_type: newCert.certificate_type,
          recipient_name: newCert.recipient_name,
          role: newCert.role,
        },
        created_at: newCert.issue_date,
      },
      ...auditLogs,
    ]);

    setIsIssueModalOpen(false);
    setNewCert({
      certificate_id: '',
      certificate_type: 'Internship Certificate',
      recipient_name: '',
      role: '',
      start_date: '',
      end_date: '',
      issuing_org: 'Streets of Tripura',
      issue_date: new Date().toISOString().split('T')[0],
    });
    setLoading(false);
    router.refresh();
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCert) return;
    setActionError(null);
    setLoading(true);

    const res = await updateCertificateAction(editingCert.certificate_id, {
      certificate_type: editingCert.certificate_type,
      recipient_name: editingCert.recipient_name,
      role: editingCert.role,
      start_date: editingCert.start_date || undefined,
      end_date: editingCert.end_date || undefined,
      issuing_org: editingCert.issuing_org,
      issue_date: editingCert.issue_date,
    });

    if (res?.error) {
      setActionError(res.error);
      setLoading(false);
      return;
    }

    setCertificates(
      certificates.map((c) =>
        c.certificate_id === editingCert.certificate_id ? { ...editingCert, updated_at: editingCert.issue_date } : c
      )
    );

    setAuditLogs([
      {
        id: `audit-edit-${editingCert.certificate_id}-${auditLogs.length}`,
        certificate_id: editingCert.certificate_id,
        admin_id: adminUser?.id || null,
        admin_email: adminUser?.email || null,
        action: 'updated',
        details: { changes: editingCert },
        created_at: editingCert.issue_date,
      },
      ...auditLogs,
    ]);

    setEditingCert(null);
    setLoading(false);
    router.refresh();
  };

  // Handle Revoke / Restore toggle
  const handleToggleStatus = async (cert: Certificate) => {
    const nextStatus: CertificateStatus = cert.status === 'valid' ? 'revoked' : 'valid';
    const confirmMsg =
      nextStatus === 'revoked'
        ? `Are you sure you want to REVOKE certificate ${cert.certificate_id} for ${cert.recipient_name}?`
        : `Are you sure you want to RESTORE certificate ${cert.certificate_id} to valid?`;

    if (!window.confirm(confirmMsg)) return;

    setLoading(true);
    const res = await setCertificateStatusAction(cert.certificate_id, nextStatus);

    if (res?.error) {
      alert(`Action failed: ${res.error}`);
      setLoading(false);
      return;
    }

    setCertificates(
      certificates.map((c) =>
        c.certificate_id === cert.certificate_id ? { ...c, status: nextStatus, updated_at: new Date().toISOString() } : c
      )
    );

    setStats((prev) => ({
      ...prev,
      valid: nextStatus === 'valid' ? prev.valid + 1 : prev.valid - 1,
      revoked: nextStatus === 'revoked' ? prev.revoked + 1 : prev.revoked - 1,
    }));

    const nextId = `audit-${cert.certificate_id}-${auditLogs.length + 1}`;
    setAuditLogs([
      {
        id: nextId,
        certificate_id: cert.certificate_id,
        admin_id: adminUser?.id || null,
        admin_email: adminUser?.email || null,
        action: nextStatus === 'revoked' ? 'revoked' : 'restored',
        details: { note: `Status toggled to ${nextStatus}` },
        created_at: new Date().toISOString(),
      },
      ...auditLogs,
    ]);

    setLoading(false);
    router.refresh();
  };

  return (
    <div className="space-y-8">
      {/* Top Banner with Stats & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Certificate Control Center
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-semibold">
              Admin
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Signed in as <strong className="text-slate-800">{adminUser?.email || 'Administrator'}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setViewingAuditLogs(!viewingAuditLogs)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
          >
            <History className="w-4 h-4 text-slate-500" />
            <span>{viewingAuditLogs ? 'Hide Audit Log' : 'View Audit Log'}</span>
          </button>

          <button
            onClick={() => setIsIssueModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Issue New Certificate</span>
          </button>

          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Certificates Issued
            </span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            {stats.total}
          </div>
          <div className="text-xs text-slate-400 mt-1">Registered in SOT registry</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Active / Valid
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-2">
            {stats.valid}
          </div>
          <div className="text-xs text-emerald-600/70 mt-1">Publicly verifiable</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
              Revoked Certificates
            </span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-700 mt-2">
            {stats.revoked}
          </div>
          <div className="text-xs text-rose-600/70 mt-1">Marked invalid in registry</div>
        </div>
      </div>

      {/* Audit Logs Drawer */}
      {viewingAuditLogs && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Administrative Audit Trail</h2>
              <p className="text-xs text-slate-500">
                Tamper-resistant log recording issuance, updates, and status revocations.
              </p>
            </div>
            <button
              onClick={() => setViewingAuditLogs(false)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 text-xs">
            {auditLogs.length === 0 ? (
              <p className="py-4 text-slate-400 text-center">No audit logs recorded yet.</p>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="py-2.5 flex items-start justify-between gap-4">
                  <div>
                    <span className="font-mono font-bold text-slate-800">{log.certificate_id}</span>
                    <span
                      className={`ml-2 px-2 py-0.5 rounded uppercase font-semibold text-[10px] ${log.action === 'issued'
                          ? 'bg-blue-100 text-blue-800'
                          : log.action === 'updated'
                            ? 'bg-amber-100 text-amber-800'
                            : log.action === 'revoked'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                        }`}
                    >
                      {log.action}
                    </span>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      by {log.admin_email || 'Authorized Administrator'}
                    </p>
                  </div>
                  <div className="text-right text-slate-400 font-mono text-[11px]">
                    {new Date(log.created_at).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID, Recipient, Type, or Role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-slate-400">Status:</span>
          {(['all', 'valid', 'revoked'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize cursor-pointer transition-colors ${statusFilter === filter
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Certificates Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">Reference ID</th>
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5">Recipient</th>
                <th className="px-5 py-3.5">Role / Purpose</th>
                <th className="px-5 py-3.5">Period</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCertificates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                    No certificates found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredCertificates.map((cert) => {
                  const isValid = cert.status === 'valid';
                  const encodedId = encodeURIComponent(cert.certificate_id);

                  return (
                    <tr key={cert.certificate_id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {cert.certificate_id}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                          {cert.certificate_type || 'Recognition'}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-800 whitespace-nowrap">
                        {cert.recipient_name}
                      </td>
                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                        {cert.role}
                      </td>
                      <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                        {cert.start_date && cert.end_date
                          ? `${cert.start_date} → ${cert.end_date}`
                          : cert.issue_date}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] tracking-wide uppercase ${isValid
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                            }`}
                        >
                          {isValid ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <XCircle className="w-3 h-3 text-rose-600" />
                          )}
                          {cert.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            href={`/verify/${encodedId}`}
                            target="_blank"
                            title="Open Public Verification Link"
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          <a
                            href={`/api/certificates/${encodedId}/qr`}
                            download
                            title="Download Verification QR (PNG)"
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                          >
                            <QrCode className="w-4 h-4" />
                          </a>

                          <button
                            onClick={() => setEditingCert(cert)}
                            title="Edit Certificate Details"
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(cert)}
                            title={isValid ? 'Revoke Certificate' : 'Restore Certificate'}
                            className={`p-1.5 rounded transition-colors cursor-pointer ${isValid
                                ? 'text-rose-600 hover:bg-rose-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                              }`}
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Issue Certificate */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Issue New Certificate</h3>
                <p className="text-xs text-slate-500">
                  Register any certificate kind (Internship, Appreciation, Recognition, Participation, etc.)
                </p>
              </div>
              <button
                onClick={() => setIsIssueModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <form onSubmit={handleIssueSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    Certificate Reference ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SOT/CERT/2026/001"
                    value={newCert.certificate_id}
                    onChange={(e) => setNewCert({ ...newCert, certificate_id: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    Certificate Kind / Type
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Internship, Appreciation, Award"
                    value={newCert.certificate_type}
                    onChange={(e) => setNewCert({ ...newCert, certificate_type: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Recipient Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={newCert.recipient_name}
                  onChange={(e) => setNewCert({ ...newCert, recipient_name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Role / Contribution / Achievement
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Graphic Designer / Volunteer / Winner"
                  value={newCert.role}
                  onChange={(e) => setNewCert({ ...newCert, role: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    Start Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={newCert.start_date}
                    onChange={(e) => setNewCert({ ...newCert, start_date: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={newCert.end_date}
                    onChange={(e) => setNewCert({ ...newCert, end_date: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Issue Date
                </label>
                <input
                  type="date"
                  required
                  value={newCert.issue_date}
                  onChange={(e) => setNewCert({ ...newCert, issue_date: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-800"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Issuing...' : 'Issue Certificate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Certificate */}
      {editingCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Edit Certificate</h3>
                <p className="text-xs text-slate-500 font-mono">
                  {editingCert.certificate_id}
                </p>
              </div>
              <button
                onClick={() => setEditingCert(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Certificate Type / Kind
                </label>
                <input
                  type="text"
                  required
                  value={editingCert.certificate_type || ''}
                  onChange={(e) => setEditingCert({ ...editingCert, certificate_type: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Recipient Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editingCert.recipient_name}
                  onChange={(e) => setEditingCert({ ...editingCert, recipient_name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Role / Contribution
                </label>
                <input
                  type="text"
                  required
                  value={editingCert.role}
                  onChange={(e) => setEditingCert({ ...editingCert, role: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    Start Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={editingCert.start_date || ''}
                    onChange={(e) => setEditingCert({ ...editingCert, start_date: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={editingCert.end_date || ''}
                    onChange={(e) => setEditingCert({ ...editingCert, end_date: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Issue Date
                </label>
                <input
                  type="date"
                  required
                  value={editingCert.issue_date}
                  onChange={(e) => setEditingCert({ ...editingCert, issue_date: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-800"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCert(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
