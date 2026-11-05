'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ShieldCheck, CheckCircle2, QrCode, Award } from 'lucide-react';

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
    <div className="py-12 sm:py-20 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 mb-6 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Official Verification Registry</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Verify Streets of Tripura Credentials
        </h1>

        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
          Verify the authenticity of official certificates issued by Streets of Tripura
          using the unique certificate reference ID or by scanning the certificate QR code.
        </p>

        {/* Verification Search Bar */}
        <form onSubmit={handleSearch} className="mt-8 max-w-xl mx-auto">
          <div className="relative flex items-center">
            <div className="absolute left-4 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Enter Certificate Reference ID..."
              value={certInput}
              onChange={(e) => setCertInput(e.target.value)}
              className="w-full pl-12 pr-32 py-4 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-slate-800 shadow-sm transition-all"
            />
            <button
              type="submit"
              className="absolute right-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
            >
              Verify
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-500 text-left pl-2">
            Enter the unique ID printed on the certificate or encoded in its QR code.
          </p>
        </form>

        {/* Feature Highlights */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center mb-3">
              <QrCode className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-slate-900 text-sm">QR Code Authenticated</h4>
            <p className="text-xs text-slate-500 mt-1">
              Every certificate carries an authentic QR linking directly to official verification.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <h4 className="font-semibold text-slate-900 text-sm">Real-time Validation</h4>
            <p className="text-xs text-slate-500 mt-1">
              Immediate status display showing whether the credential is valid or revoked.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center mb-3">
              <Award className="w-4 h-4 text-blue-600" />
            </div>
            <h4 className="font-semibold text-slate-900 text-sm">Universal Credential Registry</h4>
            <p className="text-xs text-slate-500 mt-1">
              Supports recognition, internships, appreciation, participation, and achievement awards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
