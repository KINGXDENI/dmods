import type { Metadata } from 'next';
import { scrapeEsignPage } from '@/lib/scraper';
import EsignClientView from './EsignClientView';

// Revalidate the ESign scraping page cache every 1 hour
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'ESign iOS Signer Hub – DMods',
  description: 'Download and install ESign directly on your iOS device using active enterprise signing certificates. Secure config profiles, DNS anti-revokes, and direct IPA downloads.',
  openGraph: {
    title: 'ESign iOS Signer Hub – DMods',
    description: 'Download and install ESign directly on your iOS device using active enterprise signing certificates.',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'ESign iOS Hub'
      }
    ]
  }
};

export default async function EsignPage() {
  let scrapedData = {
    noLogsIpa: 'https://techybuff.com/wp-content/uploads/2025/08/eSignV5.0_NOLogs_v1.1.ipa',
    dnsProfile: 'https://wsfteam.xyz/files/configurationprofiles/CFDNS-CP144.mobileconfig',
    certsZip: 'https://techybuff.com/wp-content/uploads/2026/03/Certificates-TA.zip',
    certificates: [] as any[]
  };

  try {
    scrapedData = await scrapeEsignPage();
  } catch (err) {
    console.error('Failed to scrape ESign data in Server Component:', err);
  }

  return (
    <main className="min-h-screen bg-background text-foreground pb-20 pt-4">
      <EsignClientView scrapedData={scrapedData} />
    </main>
  );
}
