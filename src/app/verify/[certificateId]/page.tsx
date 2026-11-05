import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getCertificateForVerification } from '@/lib/certificates';
import { generateCertificateQRCode } from '@/lib/qr';
import {
  CheckCircle2,
  XCircle,
  Download,
  ShieldAlert,
  ArrowLeft,
  Calendar,
  Building2,
  User,
  Award,
} from 'lucide-react';

interface VerifyPageProps {
  params: Promise<{ certificateId: string }>;
}

export async function generateMetadata({ params }: VerifyPageProps): Promise<Metadata> {
  const { certificateId } = await params;
  const decodedId = decodeURIComponent(certificateId);
  return {
    title: `Verify ${decodedId} | Streets of Tripura`,
    description: `Official authenticity verification for certificate ${decodedId}`,
  };
}

export default async function VerifyCertificatePage({ params }: VerifyPageProps) {
  const { certificateId } = await params;
  const decodedId = decodeURIComponent(certificateId);

  const cert = await getCertificateForVerification(decodedId);

  if (!cert) {
    return (
      <div className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-xl mx-auto bg-white rounded-2xl border border-rose-200 p-8 text-center shadow-sm">
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-100/60 px-3 py-1 rounded-full">
            Certificate Not Found
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-4">
            Invalid or Unrecognized Certificate
          </h1>
          <p className="text-sm text-slate-600 mt-2">
            No official record was found for the reference ID:
          </p>
          <div className="my-4 p-3 bg-slate-100 rounded-lg font-mono text-sm font-semibold text-slate-800 break-all select-all">
            {decodedId}
          </div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Please ensure you have entered or scanned the full reference number correctly. If you believe this is an error, contact Streets of Tripura administration.
          </p>

          <div className="mt-8 flex justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Search</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isValid = cert.status === 'valid';
  const qrCodeDataUrl = await generateCertificateQRCode(cert.certificate_id);

  return (
    <div className="py-10 sm:py-16 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Search Another Certificate</span>
          </Link>
          <span className="text-xs text-slate-400 font-mono">
            Official SOT Registry
          </span>
        </div>

        {/* Main Certificate Verification Card */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {/* Header Banner */}
          <div
            className={`p-6 sm:p-8 border-b ${isValid ? 'bg-emerald-50/70 border-emerald-100' : 'bg-rose-50/70 border-rose-100'
              }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${isValid ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                    }`}
                >
                  {isValid ? (
                    <CheckCircle2 className="w-7 h-7" />
                  ) : (
                    <XCircle className="w-7 h-7" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-extrabold tracking-wider uppercase px-2.5 py-0.5 rounded-full ${isValid
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                    >
                      {isValid ? 'Authentic & Valid' : 'Revoked Certificate'}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {cert.certificate_title || cert.certificate_type || 'Certificate of Internship'}
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                    {isValid
                      ? `${cert.certificate_title || 'Certificate'} Verified Officially`
                      : 'This Certificate Has Been Revoked'}
                  </h1>
                </div>
              </div>

              {/* Status Note & Logo */}
              <div className="flex items-center gap-3 self-start sm:self-auto sm:text-right">
                <div className="hidden sm:block">
                  <span className="text-xs text-slate-500 block">Verification Authority</span>
                  <span className="text-xs font-bold text-slate-800 block">
                    Streets of Tripura
                  </span>
                </div>
                <div className="relative w-11 h-11 rounded-lg overflow-hidden border border-slate-200 bg-white p-0.5 shrink-0 shadow-xs">
                  <Image
                    src="/assets/logo.png"
                    alt="Streets of Tripura Logo"
                    width={44}
                    height={44}
                    className="object-contain w-full h-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Verification Details */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Reference ID Callout */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
                  Certificate Reference ID
                </span>
                <span className="font-mono text-base sm:text-lg font-bold text-slate-900 select-all">
                  {cert.certificate_id}
                </span>
              </div>
              <div className="text-xs text-slate-500">
                Issued on <strong className="text-slate-700">{cert.issue_date}</strong>
              </div>
            </div>

            {/* Credential Data Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-100 bg-white shadow-xs">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <User className="w-4 h-4 text-slate-600" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Recipient Name
                  </span>
                </div>
                <p className="text-base font-bold text-slate-900">{cert.recipient_name}</p>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 bg-white shadow-xs">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Award className="w-4 h-4 text-slate-600" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Role / Purpose
                  </span>
                </div>
                <p className="text-base font-bold text-slate-900">{cert.role}</p>
              </div>

              {cert.start_date && cert.end_date && (
                <div className="p-4 rounded-xl border border-slate-100 bg-white shadow-xs">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Calendar className="w-4 h-4 text-slate-600" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Period / Tenure
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">
                    {cert.start_date} &rarr; {cert.end_date}
                  </p>
                </div>
              )}

              <div className="p-4 rounded-xl border border-slate-100 bg-white shadow-xs">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Building2 className="w-4 h-4 text-slate-600" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Issuing Organization
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-900">{cert.issuing_org}</p>
              </div>
            </div>

            {/* QR Code and Verification Info */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white border border-slate-200 rounded-xl shadow-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrCodeDataUrl}
                    alt="Certificate QR Verification Code"
                    width={88}
                    height={88}
                    className="rounded-lg"
                  />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Scan to Verify Authenticity
                  </span>
                  <span className="text-xs text-slate-500 block max-w-sm mt-0.5">
                    Direct public verification link pointing to official Streets of Tripura credentials.
                  </span>
                  <a
                    href={`/api/certificates/${encodeURIComponent(cert.certificate_id)}/qr`}
                    download
                    className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-slate-900 mt-2 underline"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download QR (PNG)
                  </a>
                </div>
              </div>
            </div>

            {/* Public Disclosure Notice */}
            <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 text-center">
              Streets of Tripura Verification Protocol &bull; Personal data is protected and never displayed publicly.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
