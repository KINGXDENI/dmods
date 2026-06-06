import { NextRequest, NextResponse } from 'next/server';
import { scrapeDetailPage, scrapeDownloadPage } from '@/lib/scraper';

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

    if (!targetUrl.startsWith('https://ipaomtk.com/')) {
      return NextResponse.json(
        { success: false, error: 'Invalid domain' },
        { status: 400 }
      );
    }

    // 1. Scrape the detail page to get the download options page URL
    const detailData = await scrapeDetailPage(targetUrl);
    const optionsUrl = detailData.downloadUrl;

    if (!optionsUrl) {
      return NextResponse.json(
        { success: false, error: 'No download page URL found for this application' },
        { status: 404 }
      );
    }

    // 2. Scrape the download page to get the direct file links
    const downloadData = await scrapeDownloadPage(optionsUrl);
    if (!downloadData.downloadOptions || downloadData.downloadOptions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No download options available for this application' },
        { status: 404 }
      );
    }

    // 3. Find the best direct .ipa URL
    let directIpaUrl = '';
    
    // Check autoSignParams.ipaUrl first as it is usually the raw direct IPA link
    for (const option of downloadData.downloadOptions) {
      if (option.autoSignParams?.ipaUrl && option.autoSignParams.ipaUrl.toLowerCase().includes('.ipa')) {
        directIpaUrl = option.autoSignParams.ipaUrl;
        break;
      }
    }

    // Fallback to option.downloadUrl if it ends with .ipa or contains .ipa
    if (!directIpaUrl) {
      for (const option of downloadData.downloadOptions) {
        if (option.downloadUrl && (option.downloadUrl.toLowerCase().includes('.ipa') || option.downloadUrl.toLowerCase().includes('/download/'))) {
          directIpaUrl = option.downloadUrl;
          break;
        }
      }
    }

    // Final fallback to the first option's download URL
    if (!directIpaUrl && downloadData.downloadOptions[0]) {
      directIpaUrl = downloadData.downloadOptions[0].autoSignParams?.ipaUrl || downloadData.downloadOptions[0].downloadUrl;
    }

    if (!directIpaUrl) {
      return NextResponse.json(
        { success: false, error: 'Could not resolve direct IPA link' },
        { status: 404 }
      );
    }

    // Respond with a 307 redirect so the client installer downloads the file directly
    return NextResponse.redirect(directIpaUrl, { status: 307 });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to resolve redirect download link'
      },
      { status: 500 }
    );
  }
}
