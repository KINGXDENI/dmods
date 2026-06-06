import { NextRequest, NextResponse } from 'next/server';
import { scrapeHomepage } from '@/lib/scraper';

export const dynamic = 'force-dynamic';

function parseSizeToBytes(sizeStr: string): number {
  if (!sizeStr) return 0;
  const match = sizeStr.match(/([\d.]+)\s*(kb|mb|gb|b)?/i);
  if (!match) return 0;
  const value = parseFloat(match[1]);
  const unit = (match[2] || 'mb').toLowerCase();
  switch (unit) {
    case 'gb': return Math.round(value * 1024 * 1024 * 1024);
    case 'mb': return Math.round(value * 1024 * 1024);
    case 'kb': return Math.round(value * 1024);
    default: return Math.round(value);
  }
}

export async function GET(request: NextRequest) {
  try {
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    // Scrape homepage data
    const data = await scrapeHomepage();
    const iosApps = data.ipa || [];

    // Map to AltStore JSON schema
    const altStoreApps = iosApps.map((app) => {
      const cleanTitle = app.title.replace(/\s+/g, ' ').trim();
      const safeId = cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, '');
      const bundleId = `com.dmods.${safeId || 'unknown'}`;
      
      const sizeBytes = parseSizeToBytes(app.size);

      // Create download URL pointing to our proxy redirector
      const downloadRedirectUrl = `${baseUrl}/api/repo/download-redirect?url=${encodeURIComponent(app.detailUrl)}`;

      return {
        name: cleanTitle,
        bundleIdentifier: bundleId,
        developerName: 'DMods Team',
        localizedDescription: app.modFeatures 
          ? `Features: ${app.modFeatures}. Subcategory: ${app.category}.`
          : `Tweaked version of ${cleanTitle}. Category: ${app.category}.`,
        iconURL: app.iconUrl,
        tintColor: '#C0C2C0',
        versions: [
          {
            version: app.version.replace(/^v/i, '') || '1.0.0',
            date: new Date().toISOString(),
            localizedDescription: `Release notes: ${app.modFeatures || 'Mod feature injected.'}`,
            downloadURL: downloadRedirectUrl,
            size: sizeBytes
          }
        ]
      };
    });

    const repoJSON = {
      name: 'DMods AltStore Repository',
      identifier: 'com.kingxdeni.dmods',
      sourceURL: `${baseUrl}/api/repo/altstore`,
      apps: altStoreApps
    };

    return NextResponse.json(repoJSON, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to generate AltStore repository' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
