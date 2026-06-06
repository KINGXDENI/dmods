import * as cheerio from 'cheerio';

export interface ScrapedApp {
  title: string;
  version: string;
  size: string;
  category: string;
  platform: 'ios' | 'android';
  modFeatures: string;
  iconUrl: string;
  detailUrl: string;
  badge: string;
  status: string;
}

export interface ScrapeResult {
  ipa: ScrapedApp[];
  apk: ScrapedApp[];
}

export interface AppDetail {
  appName: string;
  version: string;
  updated: string;
  publisher: string;
  size: string;
  platform: string;
  category: string;
  categoryUrl: string;
  getItOn: string;
  getItOnUrl: string;
  downloadUrl: string;
  descriptionHtml: string;
  descriptionText: string;
  iconUrl?: string;
}

/**
 * Scrapes the home page of https://ipaomtk.com/
 * Parses and separates the applications into iOS (IPA) and Android (APK) lists.
 */
export async function scrapeHomepage(): Promise<ScrapeResult> {
  const url = 'https://ipaomtk.com/';
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      next: { revalidate: 3600 } // Next.js Cache validation for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch homepage from ipaomtk.com: Status ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const ipa: ScrapedApp[] = [];
    const apk: ScrapedApp[] = [];

    $('.ipaomtk-app-card').each((_, element) => {
      const $el = $(element);

      // Extract general metadata
      const detailUrl = $el.attr('href') || '';
      const title = $el.find('.ipaomtk-card-title').text().replace(/\s+/g, ' ').trim();
      const status = $el.find('.ipaomtk-status-pill').text().replace(/\s+/g, ' ').trim();
      const badge = $el.find('.liquid-mod-badge').text().replace(/\s+/g, ' ').trim();

      // Extract icon URL
      const iconUrl = $el.find('img.ipaomtk-card-icon').attr('src') || '';

      // Extract category & size
      const metaSpans = $el.find('.ipaomtk-card-meta span');
      const category = $(metaSpans[0]).text().replace(/\s+/g, ' ').trim();
      const size = $(metaSpans[1]).text().replace(/\s+/g, ' ').trim();

      // Extract version & mod features
      const version = $el.find('.ipaomtk-card-detail > span').first().text().replace(/\s+/g, ' ').trim();
      const modFeatures = $el.find('.ipaomtk-card-mod').text().replace(/\s+/g, ' ').trim();

      // Determine platform based on platform-specific icon classes
      let platform: 'ios' | 'android' = 'ios';
      if ($el.find('.liquid-platform-icon.ios').length > 0) {
        platform = 'ios';
      } else if ($el.find('.liquid-platform-icon.android').length > 0) {
        platform = 'android';
      } else if (detailUrl.includes('/apk/') || category.toLowerCase().includes('apk')) {
        platform = 'android';
      }

      const appData: ScrapedApp = {
        title,
        version,
        size,
        category,
        platform,
        modFeatures,
        iconUrl,
        detailUrl,
        badge,
        status
      };

      if (platform === 'ios') {
        ipa.push(appData);
      } else {
        apk.push(appData);
      }
    });

    return { ipa, apk };
  } catch (error) {
    console.error('Error during scraping ipaomtk.com:', error);
    throw error;
  }
}

/**
 * Scrapes a detailed application page from https://ipaomtk.com/
 * Extracts download links, metadata grids, and description content.
 */
export async function scrapeDetailPage(url: string): Promise<AppDetail> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      next: { revalidate: 3600 } // Next.js Cache validation for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch detail page from ${url}: Status ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Parse Metadata Cards (.glass-card)
    const metadata: Record<string, { value: string; url?: string }> = {};
    $('.glass-card').each((_, el) => {
      const $card = $(el);
      const label = $card.find('p.text-xs').text().replace(/\s+/g, ' ').trim();
      const $valElement = $card.find('p.font-bold, a.font-bold');
      const value = $valElement.text().replace(/\s+/g, ' ').trim();
      const link = $valElement.attr('href') || undefined;

      if (label) {
        metadata[label.toLowerCase()] = { value, url: link };
      }
    });

    // Parse Download URL (looking for a.btn-liquid containing "/download/")
    let downloadUrl = '';
    const $downloadBtn = $('a.btn-liquid[href*="/download/"]').first();
    if ($downloadBtn.length > 0) {
      downloadUrl = $downloadBtn.attr('href') || '';
    } else {
      // Fallback: search for any anchor link containing "/download/"
      $('a').each((_, el) => {
        const $link = $(el);
        const href = $link.attr('href') || '';
        const text = $link.text().toLowerCase();
        if (
          (href.includes('/download/') || text.includes('download')) &&
          !href.startsWith('#') &&
          !downloadUrl
        ) {
          downloadUrl = href;
        }
      });
    }

    // Parse Description Content
    const $contentArea = $('.content-area');
    const descriptionHtml = $contentArea.html() || '';
    const descriptionText = $contentArea.text().trim();
    const iconUrl = $('img.w-48.h-48').first().attr('src') || '';

    return {
      appName: metadata['app name']?.value || metadata['name']?.value || '',
      version: metadata['version']?.value || '',
      updated: metadata['updated']?.value || '',
      publisher: metadata['publisher']?.value || '',
      size: metadata['size']?.value || '',
      platform: metadata['platform']?.value || '',
      category: metadata['category']?.value || '',
      categoryUrl: metadata['category']?.url || '',
      getItOn: metadata['get it on']?.value || '',
      getItOnUrl: metadata['get it on']?.url || '',
      downloadUrl,
      descriptionHtml,
      descriptionText,
      iconUrl
    };
  } catch (error) {
    console.error(`Error during scraping detail page ${url}:`, error);
    throw error;
  }
}

export interface DownloadOption {
  optionNumber: string;
  title: string;
  subTitle: string;
  version: string;
  fileSize: string;
  fileType: string;
  downloadUrl: string;
  openInAppUrl: string;
  certificateUrl: string;
  autoSignParams?: {
    ipaUrl: string;
    appName: string;
    startUrl: string;
    statusUrl: string;
    mergeUrl: string;
  };
}

export interface DownloadPageData {
  appName: string;
  introText: string;
  downloadOptions: DownloadOption[];
  iconUrl?: string;
}

/**
 * Scrapes a download options page from https://ipaomtk.com/
 * Resolves all direct file download packages, auto-signing configurations, and meta info.
 */
export async function scrapeDownloadPage(url: string): Promise<DownloadPageData> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      next: { revalidate: 3600 } // Next.js Cache validation for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch download page from ${url}: Status ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const appName = $('.ipaomtk-download-list__head h2').text().replace(/\s+/g, ' ').trim();
    const introText = $('.ipaomtk-download-list__head p').text().replace(/\s+/g, ' ').trim();
    const iconUrl = $('.ipaomtk-download-hero__icon img').first().attr('src') || '';

    const downloadOptions: DownloadOption[] = [];

    $('.ipaomtk-download-card').each((_, card) => {
      const $card = $(card);
      const optionNumber = $card.find('.ipaomtk-download-card__number').text().trim();
      const title = $card.find('.ipaomtk-download-card__title h3').text().replace(/\s+/g, ' ').trim();
      const subTitle = $card.find('.ipaomtk-download-card__title span').text().replace(/\s+/g, ' ').trim();

      const chips = $card.find('.ipaomtk-download-card__chips span');
      const version = $(chips[0]).text().trim();
      const fileSize = $(chips[1]).text().trim();
      const fileType = $(chips[2]).text().trim();

      const downloadUrl = $card.find('a.ipaomtk-final-download').attr('href') || '';
      const openInAppUrl = $card.find('a.ipaomtk-app-open').attr('href') || '';
      const certificateUrl = $card.find('a[data-ipaomtk-download-cert]').attr('href') || '';

      const $autoSignBtn = $card.find('.ipaomtk-auto-sign-btn');
      let autoSignParams: DownloadOption['autoSignParams'] | undefined = undefined;

      if ($autoSignBtn.length > 0) {
        autoSignParams = {
          ipaUrl: $autoSignBtn.attr('data-ipa-url') || '',
          appName: $autoSignBtn.attr('data-app-name') || '',
          startUrl: $autoSignBtn.attr('data-start-url') || '',
          statusUrl: $autoSignBtn.attr('data-status-url') || '',
          mergeUrl: $autoSignBtn.attr('data-merge-url') || ''
        };
      }

      downloadOptions.push({
        optionNumber,
        title,
        subTitle,
        version,
        fileSize,
        fileType,
        downloadUrl,
        openInAppUrl,
        certificateUrl,
        autoSignParams
      });
    });

    return {
      appName,
      introText,
      downloadOptions,
      iconUrl
    };
  } catch (error) {
    console.error(`Error during scraping download page ${url}:`, error);
    throw error;
  }
}

export interface ScrapedListing {
  apps: ScrapedApp[];
  currentPage: number;
  totalPages: number;
  categories: { text: string; slug: string }[];
}

/**
 * Scrapes a paginated listing page (e.g. apps or games) from ipaomtk.com
 * Supports optional category slug and pagination.
 */
export async function scrapeListingPage(
  type: 'apps' | 'games' | 'apk-apps' | 'apk-game',
  category?: string,
  page: number = 1
): Promise<ScrapedListing> {
  let url = `https://ipaomtk.com/${type}/`;
  if (category && category !== 'all') {
    url += `${category}/`;
  }
  if (page > 1) {
    url += `page/${page}/`;
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch listing page from ${url}: Status ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const apps: ScrapedApp[] = [];
    $('.ipaomtk-app-card').each((_, element) => {
      const $el = $(element);
      const detailUrl = $el.attr('href') || '';
      const title = $el.find('.ipaomtk-card-title').text().replace(/\s+/g, ' ').trim();
      const status = $el.find('.ipaomtk-status-pill').text().replace(/\s+/g, ' ').trim();
      const badge = $el.find('.liquid-mod-badge').text().replace(/\s+/g, ' ').trim();
      const iconUrl = $el.find('img.ipaomtk-card-icon').attr('src') || '';

      const metaSpans = $el.find('.ipaomtk-card-meta span');
      const itemCategory = $(metaSpans[0]).text().replace(/\s+/g, ' ').trim();
      const size = $(metaSpans[1]).text().replace(/\s+/g, ' ').trim();

      const version = $el.find('.ipaomtk-card-detail > span').first().text().replace(/\s+/g, ' ').trim();
      const modFeatures = $el.find('.ipaomtk-card-mod').text().replace(/\s+/g, ' ').trim();

      // Determine platform
      let platform: 'ios' | 'android' = 'ios';
      if (type === 'apk-apps' || type === 'apk-game') {
        platform = 'android';
      } else if ($el.find('.liquid-platform-icon.ios').length > 0) {
        platform = 'ios';
      } else if ($el.find('.liquid-platform-icon.android').length > 0) {
        platform = 'android';
      } else if (detailUrl.includes('/apk/') || itemCategory.toLowerCase().includes('apk')) {
        platform = 'android';
      }

      apps.push({
        title,
        version,
        size,
        category: itemCategory,
        platform,
        modFeatures,
        iconUrl,
        detailUrl,
        badge,
        status
      });
    });

    let totalPages = 1;
    $('.page-btn').each((_, el) => {
      const text = $(el).text().trim();
      const num = parseInt(text, 10);
      if (!isNaN(num) && num > totalPages) {
        totalPages = num;
      }
    });

    const categories: { text: string; slug: string }[] = [];
    $('.filter-chip').each((_, el) => {
      const text = $(el).text().trim();
      const href = $(el).attr('href') || '';
      
      let slug = '';
      if (href) {
        const cleanHref = href.replace(/\/$/, '');
        const segments = cleanHref.split('/');
        slug = segments[segments.length - 1];
        if (slug === type) {
          slug = 'all';
        }
      }
      
      if (text && slug) {
        categories.push({ text, slug });
      }
    });

    return {
      apps,
      currentPage: page,
      totalPages,
      categories
    };
  } catch (error) {
    console.error(`Error during scraping listing page ${url}:`, error);
    throw error;
  }
}

/**
 * Scrapes ALL search results from https://ipaomtk.com/?s=[query]
 * Automatically follows pagination to aggregate every single result.
 */
export async function scrapeSearch(query: string): Promise<ScrapedApp[]> {
  const getPageUrl = (q: string, p: number) => 
    p === 1 ? `https://ipaomtk.com/?s=${encodeURIComponent(q)}` : `https://ipaomtk.com/page/${p}/?s=${encodeURIComponent(q)}`;

  try {
    // 1. Fetch the first page to get initial data and total pages
    const firstPageRes = await fetch(getPageUrl(query, 1), {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
      next: { revalidate: 300 }
    });

    if (!firstPageRes.ok) throw new Error(`Search failed: ${firstPageRes.status}`);
    
    const html = await firstPageRes.text();
    const $ = cheerio.load(html);
    
    let allApps: ScrapedApp[] = [];
    
    // Helper to parse apps from a page
    const parseApps = (pageHtml: string) => {
      const pageSelector = cheerio.load(pageHtml);
      const apps: ScrapedApp[] = [];
      pageSelector('.ipaomtk-app-card').each((_, element) => {
        const $el = pageSelector(element);
        const detailUrl = $el.attr('href') || '';
        const title = $el.find('.ipaomtk-card-title').text().replace(/\s+/g, ' ').trim();
        const status = $el.find('.ipaomtk-status-pill').text().replace(/\s+/g, ' ').trim();
        const badge = $el.find('.liquid-mod-badge').text().replace(/\s+/g, ' ').trim();
        const iconUrl = $el.find('img.ipaomtk-card-icon').attr('src') || '';
        const metaSpans = $el.find('.ipaomtk-card-meta span');
        const category = $(metaSpans[0]).text().replace(/\s+/g, ' ').trim();
        const size = $(metaSpans[1]).text().replace(/\s+/g, ' ').trim();
        const version = $el.find('.ipaomtk-card-detail > span').first().text().replace(/\s+/g, ' ').trim();
        const modFeatures = $el.find('.ipaomtk-card-mod').text().replace(/\s+/g, ' ').trim();

        let platform: 'ios' | 'android' = 'ios';
        if ($el.find('.liquid-platform-icon.ios').length > 0) platform = 'ios';
        else if ($el.find('.liquid-platform-icon.android').length > 0) platform = 'android';
        else if (detailUrl.includes('/apk/') || category.toLowerCase().includes('apk')) platform = 'android';

        apps.push({ title, version, size, category, platform, modFeatures, iconUrl, detailUrl, badge, status });
      });
      return apps;
    };

    // Add apps from first page
    allApps = parseApps(html);

    // 2. Detect total pages
    let totalPages = 1;
    $('.page-btn').each((_, el) => {
      const text = $(el).text().trim();
      const num = parseInt(text, 10);
      if (!isNaN(num) && num > totalPages) totalPages = num;
    });

    // 3. If there are more pages, fetch them all in parallel (limit to reasonable amount for speed)
    if (totalPages > 1) {
      const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
      // We'll limit it to max 10 pages for search to keep it fast, but you can increase this
      const pagesToFetch = remainingPages.slice(0, 9); 
      
      const pageResults = await Promise.all(
        pagesToFetch.map(async (p) => {
          try {
            const res = await fetch(getPageUrl(query, p), {
              headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
              next: { revalidate: 300 }
            });
            if (res.ok) return parseApps(await res.text());
            return [];
          } catch { return []; }
        })
      );
      
      pageResults.forEach(apps => {
        allApps = [...allApps, ...apps];
      });
    }

    return allApps;
  } catch (error) {
    console.error(`Error during deep search scraping for "${query}":`, error);
    throw error;
  }
}

export interface EsignCertificate {
  certName: string;
  shortUrl: string;
  resolved: boolean;
  error?: string;
  details?: {
    appTitle: string;
    bundleIdentifier: string;
    bundleVersion: string;
    ipaUrl: string;
    plistUrl: string;
  };
}

export interface EsignScrapedData {
  noLogsIpa: string;
  dnsProfile: string;
  certsZip: string;
  certificates: EsignCertificate[];
}

export interface KsignCertificate {
  certName: string;
  shortUrl: string;
  resolved: boolean;
  error?: string;
  details?: {
    appTitle: string;
    bundleIdentifier: string;
    bundleVersion: string;
    ipaUrl: string;
    plistUrl: string;
  };
}

export interface KsignScrapedData {
  dnsProfile: string;
  certsZip: string;
  certificates: KsignCertificate[];
}

/**
 * Decrypts a base64 string using a custom XOR key.
 */
function decryptXOR(base64Data: string, key: string): string {
  const data = Buffer.from(base64Data, 'base64');
  const keyBuf = Buffer.from(key, 'utf8');
  const decrypted = Buffer.alloc(data.length);
  
  for (let i = 0; i < data.length; i++) {
    decrypted[i] = data[i] ^ keyBuf[i % keyBuf.length];
  }
  
  return decrypted.toString('utf8');
}

/**
 * Fetches and decrypts ESign and KSign database listings directly from the official https://khoindvn.io.vn/
 */
export async function scrapeKhoindvnData(): Promise<{ ksign: any[]; esign: any[] }> {
  const rootUrl = 'https://khoindvn.io.vn/';
  try {
    const res = await fetch(rootUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      next: { revalidate: 3600 } // Cache HTML for 1 hour
    });
    
    if (!res.ok) throw new Error(`Failed to fetch khoindvn.io.vn: Status ${res.status}`);
    const html = await res.text();
    
    // Find Astro hoisted module script URL
    const scriptMatch = html.match(/src="(\/_astro\/hoisted\.[^"]+\.js)"/);
    if (!scriptMatch) {
      throw new Error("Could not find Astro hoisted module script inside HTML!");
    }
    
    const scriptUrl = rootUrl + scriptMatch[1].substring(1);
    
    const scriptRes = await fetch(scriptUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      next: { revalidate: 3600 } // Cache script for 1 hour
    });
    
    if (!scriptRes.ok) throw new Error(`Failed to fetch Astro hoisted script: Status ${scriptRes.status}`);
    const scriptText = await scriptRes.text();
    
    // Extract base64 encrypted payload
    const longStringRegex = /"([A-Za-z0-9+/=]{2000,})"/;
    const payloadMatch = scriptText.match(longStringRegex);
    if (!payloadMatch) {
      throw new Error("Could not find the long encrypted payload inside script!");
    }
    
    const key = "vuvankhoi-esign-ksign-secure-key-2026_khoindvn.io.vn";
    const decryptedText = decryptXOR(payloadMatch[1], key);
    
    return JSON.parse(decryptedText);
  } catch (err) {
    console.error("Error scraping khoindvn.io.vn payload:", err);
    return { ksign: [], esign: [] };
  }
}

/**
 * Scrapes and resolves ESign certificates and tools from the official khoindvn.io.vn data
 */
export async function scrapeEsignPage(): Promise<EsignScrapedData> {
  try {
    const rawData = await scrapeKhoindvnData();
    const noLogsIpa = 'https://techybuff.com/wp-content/uploads/2025/08/eSignV5.0_NOLogs_v1.1.ipa';
    const dnsProfile = 'https://github.com/dns-khoindvn/oci-auto-vm/releases/download/DNS/khoindvn.mobileconfig';
    const certsZip = 'https://techybuff.com/wp-content/uploads/2026/03/Certificates-TA.zip';

    const resolvedCertificates: EsignCertificate[] = await Promise.all(
      rawData.esign.map(async (cert: any) => {
        try {
          // Resolve redirect
          const rRes = await fetch(cert.url, {
            method: 'GET',
            redirect: 'manual',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            next: { revalidate: 86400 } // Cache redirect location for 24 hours
          });

          const redirectLocation = rRes.headers.get('location');
          if (!redirectLocation) {
            throw new Error('No redirect location header found');
          }

          // If it redirects to the fallback home page, the certificate link is revoked/expired
          if (redirectLocation.includes('khoindvn.io.vn') && !redirectLocation.includes('.plist')) {
            throw new Error('Certificate link has expired or been revoked');
          }

          const plistUrlMatch = redirectLocation.match(/url=([^&]+)/);
          if (!plistUrlMatch) {
            throw new Error('Could not parse plist URL from redirect location');
          }

          const plistUrl = decodeURIComponent(plistUrlMatch[1]);

          // Fetch Plist content
          const plistRes = await fetch(plistUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            next: { revalidate: 86400 } // Cache plist content for 24 hours
          });

          if (!plistRes.ok) {
            throw new Error(`Failed to fetch plist: ${plistRes.statusText}`);
          }

          const plistText = await plistRes.text();

          const titleMatch = plistText.match(/<key>title<\/key>\s*<string>([^<]+)<\/string>/);
          const bundleIdMatch = plistText.match(/<key>bundle-identifier<\/key>\s*<string>([^<]+)<\/string>/);
          const bundleVersionMatch = plistText.match(/<key>bundle-version<\/key>\s*<string>([^<]+)<\/string>/);
          const ipaUrlMatch = plistText.match(/<key>url<\/key>\s*<string>([^<]+\.ipa[^<]*)<\/string>/);

          return {
            certName: cert.descriptions || cert.name,
            shortUrl: cert.url,
            resolved: true,
            details: {
              appTitle: titleMatch ? titleMatch[1].trim() : cert.name || 'ESign',
              bundleIdentifier: bundleIdMatch ? bundleIdMatch[1].trim() : 'com.esign.app',
              bundleVersion: bundleVersionMatch ? bundleVersionMatch[1].trim() : '1.0',
              ipaUrl: ipaUrlMatch ? ipaUrlMatch[1].trim() : '',
              plistUrl: plistUrl
            }
          };
        } catch (err: any) {
          return {
            certName: cert.descriptions || cert.name,
            shortUrl: cert.url,
            resolved: false,
            error: err.message || 'Unknown resolution error'
          };
        }
      })
    );

    return {
      noLogsIpa,
      dnsProfile,
      certsZip,
      certificates: resolvedCertificates
    };
  } catch (error) {
    console.error('Error during scraping and resolving ESign page:', error);
    throw error;
  }
}

/**
 * Scrapes and resolves KSign certificates and tools from the official khoindvn.io.vn data
 */
export async function scrapeKsignPage(): Promise<KsignScrapedData> {
  try {
    const rawData = await scrapeKhoindvnData();
    const dnsProfile = 'https://github.com/dns-khoindvn/oci-auto-vm/releases/download/DNS/khoindvn.mobileconfig';
    const certsZip = 'https://techybuff.com/wp-content/uploads/2026/03/Certificates-TA.zip';

    const resolvedCertificates: KsignCertificate[] = await Promise.all(
      rawData.ksign.map(async (cert: any) => {
        try {
          // Resolve redirect
          const rRes = await fetch(cert.url, {
            method: 'GET',
            redirect: 'manual',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            next: { revalidate: 86400 } // Cache redirect location for 24 hours
          });

          const redirectLocation = rRes.headers.get('location');
          if (!redirectLocation) {
            throw new Error('No redirect location header found');
          }

          // If it redirects to the fallback home page, the certificate link is revoked/expired
          if (redirectLocation.includes('khoindvn.io.vn') && !redirectLocation.includes('.plist')) {
            throw new Error('Certificate link has expired or been revoked');
          }

          const plistUrlMatch = redirectLocation.match(/url=([^&]+)/);
          if (!plistUrlMatch) {
            throw new Error('Could not parse plist URL from redirect location');
          }

          const plistUrl = decodeURIComponent(plistUrlMatch[1]);

          // Fetch Plist content
          const plistRes = await fetch(plistUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            next: { revalidate: 86400 } // Cache plist content for 24 hours
          });

          if (!plistRes.ok) {
            throw new Error(`Failed to fetch plist: ${plistRes.statusText}`);
          }

          const plistText = await plistRes.text();

          const titleMatch = plistText.match(/<key>title<\/key>\s*<string>([^<]+)<\/string>/);
          const bundleIdMatch = plistText.match(/<key>bundle-identifier<\/key>\s*<string>([^<]+)<\/string>/);
          const bundleVersionMatch = plistText.match(/<key>bundle-version<\/key>\s*<string>([^<]+)<\/string>/);
          const ipaUrlMatch = plistText.match(/<key>url<\/key>\s*<string>([^<]+\.ipa[^<]*)<\/string>/);

          return {
            certName: cert.descriptions || cert.name,
            shortUrl: cert.url,
            resolved: true,
            details: {
              appTitle: titleMatch ? titleMatch[1].trim() : cert.name || 'KSign',
              bundleIdentifier: bundleIdMatch ? bundleIdMatch[1].trim() : 'com.ksign.app',
              bundleVersion: bundleVersionMatch ? bundleVersionMatch[1].trim() : '1.0',
              ipaUrl: ipaUrlMatch ? ipaUrlMatch[1].trim() : '',
              plistUrl: plistUrl
            }
          };
        } catch (err: any) {
          return {
            certName: cert.descriptions || cert.name,
            shortUrl: cert.url,
            resolved: false,
            error: err.message || 'Unknown resolution error'
          };
        }
      })
    );

    return {
      dnsProfile,
      certsZip,
      certificates: resolvedCertificates
    };
  } catch (error) {
    console.error('Error during scraping and resolving KSign page:', error);
    throw error;
  }
}



