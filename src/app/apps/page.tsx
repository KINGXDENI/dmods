import { scrapeListingPage } from '@/lib/scraper';
import PaginatedListingView from '@/components/PaginatedListingView';

export const revalidate = 3600; // Cache pages for 1 hour

interface PageProps {
  searchParams: Promise<{
    category?: string;
    page?: string;
  }>;
}

export default async function AppsListingPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const category = params.category || 'all';
  const pageNum = parseInt(params.page || '1', 10) || 1;

  try {
    const data = await scrapeListingPage('apps', category, pageNum);

    return (
      <main className="flex-1 bg-background">
        <PaginatedListingView
          type="apps"
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
            We encountered an error loading the applications library. Please try again or return home.
          </p>
        </div>
      </main>
    );
  }
}
