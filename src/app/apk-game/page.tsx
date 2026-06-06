import { scrapeListingPage } from '@/lib/scraper';
import PaginatedListingView from '@/components/PaginatedListingView';
import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/metadata';

export const revalidate = 3600; // Cache pages for 1 hour

interface PageProps {
  searchParams: Promise<{
    category?: string;
    page?: string;
  }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const category = params.category || 'all';
  const pageNum = parseInt(params.page || '1', 10) || 1;
  
  const catTitle = category === 'all' 
    ? 'All Android Games' 
    : `${category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ')} Android Games`;
    
  return constructMetadata({
    title: `${catTitle} – DMods`,
    description: `Browse ${catTitle.toLowerCase()} in the modified Android games library. Safe, high-speed verified APK downloads.`,
    path: `/apk-game?category=${category}&page=${pageNum}`,
    ogParams: {
      title: catTitle,
      subtitle: `Browse premium modified Android games, mods, and hacks. Page ${pageNum}.`,
      badge: "Android Games",
      platform: "android",
      type: "home"
    }
  });
}

export default async function ApkGameListingPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const category = params.category || 'all';
  const pageNum = parseInt(params.page || '1', 10) || 1;

  try {
    const data = await scrapeListingPage('apk-game', category, pageNum);

    return (
      <main className="flex-1 bg-background">
        <PaginatedListingView
          type="apk-game"
          apps={data.apps}
          currentPage={data.currentPage}
          totalPages={data.totalPages}
          categories={data.categories}
          selectedCategory={category}
        />
      </main>
    );
  } catch (error: any) {
    return (
      <main className="flex-1 bg-background flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
        <div className="max-w-md p-8 rounded-3xl border border-zinc-800 bg-zinc-900/30 text-zinc-300">
          <h2 className="text-xl font-bold text-zinc-400 mb-2">Library Unavailable</h2>
          <p className="text-sm text-zinc-500 leading-relaxed">
            We encountered an error loading the APK games library. Please try again or return home.
          </p>
        </div>
      </main>
    );
  }
}
