import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft, Link as LinkIcon } from 'lucide-react';
import { scrapeDetailPage, scrapeDownloadPage } from '@/lib/scraper';
import InteractiveAppDetail from '@/components/InteractiveAppDetail';

export const revalidate = 3600; // Cache pages for 1 hour

interface PageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const lastSegment = slug.length > 0 ? slug[slug.length - 1] : '';
  const isDownloadPage =
    lastSegment === 'download' ||
    lastSegment.startsWith('get') ||
    (slug.length === 3 && slug[0] === 'apk') ||
    (slug.length === 2 && slug[0] !== 'apk');

  const targetPath = isDownloadPage ? slug.slice(0, -1).join('/') : slug.join('/');
  const targetUrl = `https://ipaomtk.com/${targetPath}/`;

  try {
    const data = await scrapeDetailPage(targetUrl);
    const title = `${data.appName} ${data.version ? `v${data.version}` : ''} - DMods`;
    const description = `Download ${data.appName} premium mod for ${targetPath.startsWith('apk') ? 'Android' : 'iOS'}. ${data.descriptionText.slice(0, 150)}...`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: data.iconUrl ? [{ url: data.iconUrl }] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: data.iconUrl ? [data.iconUrl] : [],
      }
    };
  } catch (err) {
    return {
      title: 'App Detail - DMods',
    };
  }
}

export default async function AppCatchAllPage({ params }: PageProps) {
  const { slug } = await params;

  // Detect if the request is for the download page
  const lastSegment = slug.length > 0 ? slug[slug.length - 1] : '';
  const isDownloadPage =
    lastSegment === 'download' ||
    lastSegment.startsWith('get') ||
    (slug.length === 3 && slug[0] === 'apk') ||
    (slug.length === 2 && slug[0] !== 'apk');

  const targetPath = isDownloadPage ? slug.slice(0, -1).join('/') : slug.join('/');
  let targetUrl = isDownloadPage 
    ? `https://ipaomtk.com/${targetPath}/${lastSegment}/`
    : `https://ipaomtk.com/${targetPath}/`;

  try {
    let data;
    if (isDownloadPage) {
        if (lastSegment === 'download') {
            try {
              const detailData = await scrapeDetailPage(`https://ipaomtk.com/${targetPath}/`);
              if (detailData.downloadUrl) {
                targetUrl = detailData.downloadUrl;
              }
            } catch (detailErr) {
              console.warn(`Failed to pre-resolve downloadUrl:`, detailErr);
            }
        }
        
        try {
          data = await scrapeDownloadPage(targetUrl);
        } catch (err: any) {
          const detailData = await scrapeDetailPage(`https://ipaomtk.com/${targetPath}/`);
          if (detailData.downloadUrl && detailData.downloadUrl !== targetUrl) {
            data = await scrapeDownloadPage(detailData.downloadUrl);
          } else {
            throw err;
          }
        }
    } else {
        data = await scrapeDetailPage(targetUrl);
    }

    return (
      <InteractiveAppDetail 
        data={data} 
        targetPath={targetPath} 
        isDownloadPage={isDownloadPage} 
      />
    );

  } catch (err: any) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] p-6 text-center bg-thamar relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(167,167,167,0.05),transparent)]" />
        <div className="max-w-md p-10 rounded-[3rem] border border-quartz/40 bg-jet/30 text-foreground backdrop-blur-2xl shadow-2xl">
          <div className="w-16 h-16 bg-quartz/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-quartz/40 shadow-inner"><LinkIcon className="h-8 w-8 text-argent" /></div>
          <h2 className="text-2xl font-black text-foreground mb-3 tracking-tight">Access Restricted</h2>      
          <p className="text-sm text-dimgray mb-8 font-medium leading-relaxed">Remote repository synchronization failed for path <span className="text-argent font-bold">{targetPath}</span>.</p>
          <Link href="/" className="w-full flex items-center justify-center gap-2 py-4 bg-argent text-thamar font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-white transition-all shadow-xl shadow-black/20 hover:scale-[1.02] active:scale-[0.98]">Go back to Library</Link>
        </div>
      </div>
    );
  }
}
