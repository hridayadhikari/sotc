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
  ShieldCheck,
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
      <div className="py-8 sm:py-16 px-3.5 sm:px-6">
        <div className="max-w-xl mx-auto bg-white rounded-2xl border border-rose-200 p-5 sm:p-8 text-center shadow-xs">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3.5 border border-rose-100">
            <ShieldAlert className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-100/70 px-2.5 py-0.5 rounded-full inline-block">
            Certificate Not Found
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-3">
            Invalid or Unrecognized Certificate
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            No official record was found for the reference ID:
          </p>
          <div className="my-3.5 p-3 bg-slate-100 rounded-xl font-mono text-xs sm:text-sm font-semibold text-slate-800 break-all select-all">
            {decodedId}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Please make sure the complete reference number was scanned or entered accurately. If you believe this is an error, please reach out to Streets of Tripura.
          </p>

          <div className="mt-6 flex justify-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors active:scale-95"
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
    <div className="py-6 sm:py-14 px-3 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Search Certificate</span>
          </Link>
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Official Registry
          </span>
        </div>

        {/* Main Certificate Verification Card */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          {/* Header Banner */}
          <div
            className={`p-4 sm:p-7 border-b ${
              isValid ? 'bg-emerald-50/70 border-emerald-100' : 'bg-rose-50/70 border-rose-100'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                    isValid ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                  }`}
                >
                  {isValid ? (
                    <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7" />
                  ) : (
                    <XCircle className="w-6 h-6 sm:w-7 sm:h-7" />
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span
                      className={`text-[10px] sm:text-xs font-extrabold tracking-wider uppercase px-2 sm:px-2.5 py-0.5 rounded-full ${
                        isValid
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}
                    >
                      {isValid ? 'Authentic & Valid' : 'Revoked'}
                    </span>
                    <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded bg-white/80 border border-slate-200 text-slate-700">
                      {cert.certificate_title || cert.certificate_type || 'Certificate of Internship'}
                    </span>
                  </div>

                  <h1 className="text-lg sm:text-2xl font-bold text-slate-900 mt-1 sm:mt-1.5 leading-snug">
                    {isValid
                      ? `${cert.certificate_title || 'Certificate'} Verified`
                      : 'This Certificate Has Been Revoked'}
                  </h1>
                </div>
              </div>

              {/* SOT Logo */}
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden border border-slate-200 bg-white p-0.5 shrink-0 shadow-xs">
                <Image
                  src="/assets/logo.png"
                  alt="Streets of Tripura Logo"
                  width={48}
                  height={48}
                  className="object-contain w-full h-full"
                />
              </div>
            </div>
          </div>

          {/* Verification Details */}
          <div className="p-4 sm:p-7 space-y-4 sm:space-y-6">
            {/* Reference ID Callout */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div>
                <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Certificate Reference ID
                </span>
                <span className="font-mono text-sm sm:text-base font-bold text-slate-900 select-all break-all">
                  {cert.certificate_id}
                </span>
              </div>
              <div className="text-[11px] sm:text-xs text-slate-500">
                Issued on <strong className="text-slate-700">{cert.issue_date}</strong>
              </div>
            </div>

            {/* Credential Data Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="p-3.5 sm:p-4 rounded-xl border border-slate-100 bg-slate-50/50 sm:bg-white shadow-xs">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <User className="w-3.5 h-3.5 text-slate-600" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Recipient Name
                  </span>
                </div>
                <p className="text-base sm:text-lg font-bold text-slate-900">{cert.recipient_name}</p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-xl border border-slate-100 bg-slate-50/50 sm:bg-white shadow-xs">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Award className="w-3.5 h-3.5 text-slate-600" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Role / Purpose
                  </span>
                </div>
                <p className="text-base sm:text-lg font-bold text-slate-900">{cert.role}</p>
              </div>

              {cert.start_date && cert.end_date && (
                <div className="p-3.5 sm:p-4 rounded-xl border border-slate-100 bg-slate-50/50 sm:bg-white shadow-xs">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-600" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Period / Tenure
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-900">
                    {cert.start_date} &rarr; {cert.end_date}
                  </p>
                </div>
              )}

              <div className="p-3.5 sm:p-4 rounded-xl border border-slate-100 bg-slate-50/50 sm:bg-white shadow-xs">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-600" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Issuing Organization
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-900">{cert.issuing_org}</p>
              </div>
            </div>

            {/* QR Code and Verification Info */}
            <div className="pt-4 sm:pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="p-2 bg-white border border-slate-200 rounded-xl shadow-xs shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrCodeDataUrl}
                  alt="Certificate QR Verification Code"
                  width={96}
                  height={96}
                  className="rounded-lg w-20 h-20 sm:w-24 sm:h-24"
                />
              </div>
              <div className="text-center sm:text-left">
                <span className="text-xs sm:text-sm font-bold text-slate-800 block">
                  Scan to Verify Authenticity
                </span>
                <span className="text-[11px] sm:text-xs text-slate-500 block max-w-sm mt-0.5 leading-relaxed">
                  Cryptographic QR code points directly to this official Streets of Tripura verification record.
                </span>
                <a
                  href={`/api/certificates/${encodeURIComponent(cert.certificate_id)}/qr`}
                  download
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 hover:text-slate-950 mt-2.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download QR Code (PNG)</span>
                </a>
              </div>
            </div>

            {/* Public Disclosure Notice */}
            <div className="pt-3 border-t border-slate-100 text-[10px] sm:text-xs text-slate-400 text-center leading-relaxed">
              Streets of Tripura Official Credential Registry &bull; Personal identity data is strictly protected.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
