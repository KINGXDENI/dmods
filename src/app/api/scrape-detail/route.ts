import { NextRequest, NextResponse } from 'next/server';
import { scrapeDetailPage } from '@/lib/scraper';

// Force dynamic execution so that requests aren't cached statically at build time
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl) {
      return NextResponse.json(
        { success: false, error: 'Query parameter "url" is required' },
        { status: 400 }
      );
    }

    // Basic safety validation to ensure we only hit the target domain
    if (!targetUrl.startsWith('https://ipaomtk.com/')) {
      return NextResponse.json(
        { success: false, error: 'Only URLs starting with https://ipaomtk.com/ are supported' },
        { status: 400 }
      );
    }

    const data = await scrapeDetailPage(targetUrl);
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      url: targetUrl,
      data
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An error occurred during scraping the detail page'
      },
      { status: 500 }
    );
  }
}
