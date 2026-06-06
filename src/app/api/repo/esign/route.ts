import { NextRequest, NextResponse } from 'next/server';
import { scrapeHomepage } from '@/lib/scraper';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    // Scrape homepage data
    const data = await scrapeHomepage();
    const iosApps = data.ipa || [];

    // Map to ESign JSON schema
    const esignApps = iosApps.map((app) => {
      const cleanTitle = app.title.replace(/\s+/g, ' ').trim();
      const safeId = cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, '');
      const bundleId = `com.dmods.${safeId || 'unknown'}`;
      
      // Create download URL pointing to our proxy redirector
      const downloadRedirectUrl = `${baseUrl}/api/repo/download-redirect?url=${encodeURIComponent(app.detailUrl)}`;

      return {
        name: cleanTitle,
        version: app.version.replace(/^v/i, '') || '1.0.0',
        down: downloadRedirectUrl,
        icon: app.iconUrl,
        description: app.modFeatures 
          ? `Features: ${app.modFeatures}. Subcategory: ${app.category}.`
          : `Tweaked version of ${cleanTitle}. Category: ${app.category}.`,
        bundleID: bundleId
      };
    });

    const repoJSON = {
      name: 'DMods ESign/KSign Repository',
      identifier: 'com.kingxdeni.dmods.esign',
      apps: esignApps
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
      { error: error.message || 'Failed to generate ESign repository' },
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
