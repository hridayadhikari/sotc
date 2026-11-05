import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
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
            <span className="font-bold text-gray-900 tracking-tight text-base sm:text-lg block leading-none">
              Streets of Tripura
            </span>
            <span className="text-xs text-gray-500 font-medium tracking-wide">
              Official Credential Verification
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Verify Certificate
          </Link>
        </div>
      </div>
    </header>
  );
}
