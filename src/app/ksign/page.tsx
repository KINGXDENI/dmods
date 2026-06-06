import type { Metadata } from 'next';
import { scrapeKsignPage } from '@/lib/scraper';
import KsignClientView from './KsignClientView';

// Revalidate the KSign scraping page cache every 1 hour
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'KSign iOS Signer Hub – DMods',
  description: 'Download and install KSign directly on your iOS device using active enterprise signing certificates. Secure config profiles, DNS anti-revokes, and direct IPA downloads.',
  openGraph: {
    title: 'KSign iOS Signer Hub – DMods',
    description: 'Download and install KSign directly on your iOS device using active enterprise signing certificates.',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'KSign iOS Hub'
      }
    ]
  }
};

export default async function KsignPage() {
  let scrapedData = {
    dnsProfile: 'https://wsfteam.xyz/files/configurationprofiles/CFDNS-CP144.mobileconfig',
    certsZip: 'https://techybuff.com/wp-content/uploads/2026/03/Certificates-TA.zip',
    certificates: [] as any[]
  };

  try {
    scrapedData = await scrapeKsignPage();
  } catch (err) {
    console.error('Failed to scrape KSign data in Server Component:', err);
  }

  return (
    <main className="min-h-screen bg-background text-foreground pb-20 pt-4">
      <KsignClientView scrapedData={scrapedData} />
    </main>
  );
}
