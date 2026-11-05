import { NextRequest, NextResponse } from 'next/server';
import { generateCertificateQRCode } from '@/lib/qr';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ certificateId: string }> }
) {
  const { certificateId } = await context.params;
  const decodedId = decodeURIComponent(certificateId);

  try {
    const dataUrl = await generateCertificateQRCode(decodedId);
    // Convert base64 data URL to binary buffer
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const filename = `QR_${decodedId.replace(/[^a-zA-Z0-9]/g, '_')}.png`;

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'QR generation error';
    return new NextResponse(message, { status: 500 });
  }
}

