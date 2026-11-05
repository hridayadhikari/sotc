import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-3.5 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3">
          <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden shrink-0">
            <Image
              src="/assets/logo.png"
              alt="Streets of Tripura Logo"
              width={40}
              height={40}
              className="object-contain w-full h-full"
              priority
            />
          </div>
          <div>
            <span className="font-bold text-gray-900 tracking-tight text-sm sm:text-lg block leading-none">
              Streets of Tripura
            </span>
            <span className="text-[10px] sm:text-xs text-gray-500 font-medium tracking-wide block mt-0.5">
              Official Credential Verification
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-[11px] sm:text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-2 py-1 rounded-md"
          >
            Verify
          </Link>
        </div>
      </div>
    </header>
  );
}
