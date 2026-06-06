import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : process.env.VERCEL_PROJECT_PRODUCTION_URL 
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` 
  : process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : 'http://localhost:3000';

export function constructMetadata({
  title = "DMods – Premium IPA & APK Hub",
  description = "Find and download tweaked iOS IPA files and modified Android APK apps safely with high-speed secure links.",
  image,
  ogType = "website",
  path = "",
  ogParams = {}
}: {
  title?: string;
  description?: string;
  image?: string;
  ogType?: string;
  path?: string;
  ogParams?: {
    title?: string;
    subtitle?: string;
    badge?: string;
    version?: string;
    size?: string;
    platform?: 'ios' | 'android' | 'cross';
    icon?: string;
    type?: 'app' | 'list' | 'home';
  };
} = {}): Metadata {
  const cleanSiteUrl = siteUrl.replace(/\/$/, '');
  const url = `${cleanSiteUrl}/${path.replace(/^\//, '')}`;
  
  // Construct dynamic OG image URL
  let ogImageUrl = image;
  if (!ogImageUrl) {
    const ogUrl = new URL(`${cleanSiteUrl}/api/og`);
    
    // Add default values to prevent blank cards if parameters are omitted
    const paramsToSet: Record<string, string> = {
      title: ogParams.title || title,
      subtitle: ogParams.subtitle || description,
      badge: ogParams.badge || '',
      version: ogParams.version || '',
      size: ogParams.size || '',
      platform: ogParams.platform || 'cross',
      type: ogParams.type || 'home',
    };
    
    if (ogParams.icon) {
      paramsToSet.icon = ogParams.icon;
    }
    
    Object.entries(paramsToSet).forEach(([key, val]) => {
      if (val) ogUrl.searchParams.set(key, val);
    });
    
    ogImageUrl = ogUrl.toString();
  }

  return {
    metadataBase: new URL(cleanSiteUrl),
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "DMods",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
        },
      ],
      locale: "en_US",
      type: ogType as any,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}
