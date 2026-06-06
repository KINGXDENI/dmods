import { NextRequest, NextResponse } from 'next/server';
import { getAggregatedRepos } from '@/lib/repo-aggregator';

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
    const { searchParams } = new URL(request.url);
    const pageVal = searchParams.get('page') || '1';
    const segment = parseInt(pageVal, 10) || 1;

    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    // Scrape paginated listings (aggregated apps + games)
    const data = await getAggregatedRepos(segment);
    const iosApps = data.ipa || [];

    // Map to AltStore JSON schema
    const altStoreApps = iosApps.map((app) => {
      const cleanTitle = app.title.replace(/\s+/g, ' ').trim();
      const safeId = cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, '');
      const bundleId = `com.dmods.${safeId || 'unknown'}`;
      
      const sizeBytes = parseSizeToBytes(app.size);

      // Create download URL pointing to our proxy redirector
      const downloadRedirectUrl = `${baseUrl}/api/repo/download-redirect?url=${encodeURIComponent(app.detailUrl)}`;
      const cleanVersion = app.version.replace(/^v/i, '') || '1.0.0';
      const versionDate = new Date().toISOString().split('T')[0];
      const desc = app.modFeatures 
        ? `Features: ${app.modFeatures}. Subcategory: ${app.category}.`
        : `Tweaked version of ${cleanTitle}. Category: ${app.category}.`;
      
      const appSubtitle = app.modFeatures || `Tweaked ${app.category || 'iOS App'}`;

      return {
        name: cleanTitle,
        bundleIdentifier: bundleId,
        bundleID: bundleId, // dual-compat
        developerName: 'DMods Team',
        contact: {
          web: baseUrl
        },
        subtitle: appSubtitle,
        version: cleanVersion,
        versionDate: versionDate,
        size: sizeBytes,
        minOSVersion: '15.0',
        changelog: app.modFeatures || 'Initial DMods Release',
        versionDescription: app.modFeatures || 'Initial DMods Release',
        localizedDescription: desc,
        description: desc, // dual-compat
        iconURL: app.iconUrl,
        icon: app.iconUrl, // dual-compat
        tintColor: 'C0C2C0',
        versions: [
          {
            version: cleanVersion,
            date: versionDate,
            localizedDescription: `Release notes: ${app.modFeatures || 'Mod feature injected.'}`,
            downloadURL: downloadRedirectUrl,
            down: downloadRedirectUrl, // dual-compat
            size: sizeBytes,
            minOSVersion: '15.0'
          }
        ],
        // Direct root fields inside app object for Scarlet/ESign
        downloadURL: downloadRedirectUrl,
        down: downloadRedirectUrl
      };
    });

    const repoJSON = {
      name: segment > 1 ? `DMods Repository (Page ${segment})` : 'DMods Repository',
      subtitle: 'Premium Tweaked & Modded iOS IPAs',
      identifier: 'com.kingxdeni.dmods',
      sourceURL: `${baseUrl}/api/repo/altstore?page=${segment}`,
      website: baseUrl,
      iconURL: `${baseUrl}/logo.png`,
      headerURL: `${baseUrl}/logo.png`,
      META: {
        repoName: segment > 1 ? `DMods Repository (Page ${segment})` : 'DMods Repository',
        repoIcon: `${baseUrl}/logo.png`
      },
      apps: altStoreApps,
      Tweaked: altStoreApps // Scarlet compatibility
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
