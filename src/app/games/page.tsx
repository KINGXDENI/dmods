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
    ? 'All iOS Games' 
    : `${category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ')} Games`;
    
  return constructMetadata({
    title: `${catTitle} – DMods`,
    description: `Browse ${catTitle.toLowerCase()} in the decrypted iOS games catalog. Sideload and play tweaked games instantly.`,
    path: `/games?category=${category}&page=${pageNum}`,
    ogParams: {
      title: catTitle,
      subtitle: `Browse decrypted iOS IPA game packages, tweaked games, and emulators. Page ${pageNum}.`,
      badge: "iOS Games",
      type: "home"
    }
  });
}

export default async function GamesListingPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const category = params.category || 'all';
  const pageNum = parseInt(params.page || '1', 10) || 1;

  try {
    const data = await scrapeListingPage('games', category, pageNum);

    return (
      <main className="flex-1 bg-background">
        <PaginatedListingView
          type="games"
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
            We encountered an error loading the games library. Please try again or return home.
          </p>
        </div>
      </main>
    );
  }
}
