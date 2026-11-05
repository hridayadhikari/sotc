import QRCode from 'qrcode';

/**
 * Returns the public root URL.
 * In production, it uses NEXT_PUBLIC_SITE_URL or verify.streetsoftripura.org.
 * In development, defaults to current host or localhost.
 */
export function getBaseVerificationUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return 'https://verify.streetsoftripura.org';
}

/**
 * Generates the full public verification URL for a given certificate reference ID.
 * Properly handles URL encoding of slashes (`/` -> `%2F`).
 */
export function getVerificationUrl(certificateId: string): string {
  const baseUrl = getBaseVerificationUrl();
  const encodedId = encodeURIComponent(certificateId);
  return `${baseUrl}/verify/${encodedId}`;
}

/**
 * Generates a high-resolution PNG data URL for a certificate QR code.
 */
export async function generateCertificateQRCode(certificateId: string): Promise<string> {
  const targetUrl = getVerificationUrl(certificateId);
  return await QRCode.toDataURL(targetUrl, {
    errorCorrectionLevel: 'H',
    margin: 2,
    scale: 10,
    color: {
      dark: '#111827',
      light: '#ffffff',
    },
  });
}

