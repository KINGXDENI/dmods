import { NextResponse } from 'next/server';
import { scrapeHomepage } from '@/lib/scraper';

// Force dynamic execution so that requests aren't cached statically at build time
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await scrapeHomepage();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      counts: {
        ipa: data.ipa.length,
        apk: data.apk.length,
        total: data.ipa.length + data.apk.length
      },
      data
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An error occurred during scraping'
      },
      { status: 500 }
    );
  }
}
