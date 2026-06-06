import { NextRequest, NextResponse } from 'next/server';
import { scrapeSearch } from '@/lib/scraper';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    const data = await scrapeSearch(query);
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      query,
      data
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An error occurred during search scraping'
      },
      { status: 500 }
    );
  }
}
