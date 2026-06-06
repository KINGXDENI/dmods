import fs from 'fs';
import path from 'path';
import os from 'os';
import { scrapeListingPage, ScrapedApp } from './scraper';

/**
 * Fetches multiple pages of a listing in parallel.
 */
async function fetchMultiPages(
  type: 'apps' | 'games',
  startPage: number,
  endPage: number
): Promise<ScrapedApp[]> {
  if (startPage > endPage) return [];
  
  const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  const results = await Promise.all(
    pages.map(async (page) => {
      try {
        const listing = await scrapeListingPage(type, 'all', page);
        return listing.apps || [];
      } catch (err) {
        console.error(`Error scraping page ${page} of ${type}:`, err);
        return [];
      }
    })
  );
  return results.flat();
}

/**
 * Aggregates paginated apps and games in segments of 10 pages each.
 * Uses disk cache in the system temp directory to guarantee fast loading.
 */
export async function getAggregatedRepos(
  segment: number = 1
): Promise<{ ipa: ScrapedApp[] }> {
  const pagesPerSegment = 10;
  const startPage = (segment - 1) * pagesPerSegment + 1;
  const endPage = segment * pagesPerSegment;

  const cacheDir = os.tmpdir();
  const cacheFile = path.join(cacheDir, `dmods-repo-cache-seg-${segment}.json`);
  const cacheDurationMs = 3600 * 1000; // 1 hour cache duration

  // Check if cache exists and is fresh
  try {
    if (fs.existsSync(cacheFile)) {
      const stats = fs.statSync(cacheFile);
      const ageMs = Date.now() - stats.mtimeMs;
      
      if (ageMs < cacheDurationMs) {
        const cachedData = fs.readFileSync(cacheFile, 'utf8');
        return JSON.parse(cachedData);
      }
    }
  } catch (err) {
    console.error('Failed to read repository cache file:', err);
  }

  // Fetch apps and games
  try {
    // 1. Fetch page 1 of both apps and games to determine maximum limits
    const [appsPage1, gamesPage1] = await Promise.all([
      scrapeListingPage('apps', 'all', 1),
      scrapeListingPage('games', 'all', 1)
    ]);

    const appsTotalPages = appsPage1.totalPages || 1;
    const gamesTotalPages = gamesPage1.totalPages || 1;

    // Calculate actual bounds for this segment
    const appsEndPage = Math.min(endPage, appsTotalPages);
    const gamesEndPage = Math.min(endPage, gamesTotalPages);

    const appsStartPage = Math.min(startPage, appsTotalPages);
    const gamesStartPage = Math.min(startPage, gamesTotalPages);

    // Fetch lists in parallel
    const [appsList, gamesList] = await Promise.all([
      fetchMultiPages('apps', appsStartPage, appsEndPage),
      fetchMultiPages('games', gamesStartPage, gamesEndPage)
    ]);

    // Merge and deduplicate
    const mergedIpa = [...appsList, ...gamesList];
    const seenUrls = new Set<string>();
    const uniqueIpa = mergedIpa.filter((app) => {
      if (!app.detailUrl || seenUrls.has(app.detailUrl)) {
        return false;
      }
      seenUrls.add(app.detailUrl);
      return true;
    });

    const result = { ipa: uniqueIpa };

    // Write to cache asynchronously so we don't hold up the API response
    fs.writeFile(cacheFile, JSON.stringify(result), 'utf8', (err) => {
      if (err) console.error('Failed to write repository cache file:', err);
    });

    return result;
  } catch (error) {
    console.error('Failed to aggregate pages for repository:', error);
    // If scraping fails (network timeout / DNS error), fallback to stale cache if it exists
    try {
      if (fs.existsSync(cacheFile)) {
        const cachedData = fs.readFileSync(cacheFile, 'utf8');
        return JSON.parse(cachedData);
      }
    } catch (fallbackErr) {
      console.error('Failed to load stale cache fallback:', fallbackErr);
    }
    throw error;
  }
}
