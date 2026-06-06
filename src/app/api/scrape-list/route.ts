import { NextRequest, NextResponse } from 'next/server';
import { scrapeListingPage } from '@/lib/scraper';

// Force dynamic execution so that requests aren't cached statically at build time
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'apps';
    const category = searchParams.get('category') || 'all';
    const pageVal = searchParams.get('page') || '1';
    const page = parseInt(pageVal, 10) || 1;

    if (type !== 'apps' && type !== 'games' && type !== 'apk-apps' && type !== 'apk-game') {
      return NextResponse.json(
        { success: false, error: 'Query parameter "type" must be "apps", "games", "apk-apps" or "apk-game"' },
        { status: 400 }
      );
    }

    const data = await scrapeListingPage(type, category, page);
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      type,
      category,
      page,
      data
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An error occurred during scraping the listing page'
      },
      { status: 500 }
    );
  }
}
