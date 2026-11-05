'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ShieldCheck, CheckCircle2, QrCode, Award, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const [certInput, setCertInput] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certInput.trim()) return;
    const encoded = encodeURIComponent(certInput.trim());
    router.push(`/verify/${encoded}`);
  };

  return (
    <div className="py-8 sm:py-20 px-3.5 sm:px-6">
      <div className="max-w-3xl mx-auto text-center">
        {/* Verification Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] sm:text-xs font-semibold text-slate-700 mb-4 sm:mb-6 shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Official Verification Registry</span>
        </div>

        {/* Heading */}
        <h1 className="text-2xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Verify Streets of Tripura Credentials
        </h1>

        <p className="mt-2.5 sm:mt-4 text-xs sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed px-1">
          Verify the authenticity of official certificates issued by Streets of Tripura
          using the unique reference ID or by scanning the certificate QR code.
        </p>

        {/* Verification Search Bar (Mobile optimized) */}
        <form onSubmit={handleSearch} className="mt-6 sm:mt-8 max-w-xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <div className="absolute left-3.5 top-3.5 sm:top-4 text-slate-400">
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <input
                type="text"
                placeholder="Enter Certificate Reference ID..."
                value={certInput}
                onChange={(e) => setCertInput(e.target.value)}
                className="w-full pl-10 pr-3 py-3 sm:py-3.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-slate-800 shadow-xs transition-all"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-semibold hover:bg-slate-800 transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
            >
              <span>Verify Certificate</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="mt-2 text-[10px] sm:text-xs text-slate-500 text-center sm:text-left pl-1">
            Standard format: <code className="text-slate-700 bg-slate-100 px-1 py-0.5 rounded font-mono">CN/SOT/INT/072026/001</code>
          </p>
        </form>

        {/* Feature Highlights */}
        <div className="mt-10 sm:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 text-left">
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center mb-2.5">
              <QrCode className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-slate-900 text-xs sm:text-sm">QR Code Authenticated</h4>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-relaxed">
              Every certificate carries an authentic QR linking directly to official verification.
            </p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center mb-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <h4 className="font-semibold text-slate-900 text-xs sm:text-sm">Real-time Validation</h4>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-relaxed">
              Immediate status display showing whether the credential is authentic or revoked.
            </p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center mb-2.5">
              <Award className="w-4 h-4 text-blue-600" />
            </div>
            <h4 className="font-semibold text-slate-900 text-xs sm:text-sm">Official SOT Registry</h4>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-relaxed">
              Tamper-proof verifiable credentials for Streets of Tripura team members and interns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
