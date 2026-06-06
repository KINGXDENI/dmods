'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { CustomAppleIcon, CustomAndroidIcon } from '@/components/CustomIcons';
import type { ScrapedApp } from '@/lib/scraper';

interface CategoryItem {
  text: string;
  slug: string;
}

interface PaginatedListingViewProps {
  type: 'apps' | 'games' | 'apk-apps' | 'apk-game';
  apps: ScrapedApp[];
  currentPage: number;
  totalPages: number;
  categories: CategoryItem[];
  selectedCategory: string;
}

export default function PaginatedListingView({
  type,
  apps,
  currentPage,
  totalPages,
  categories,
  selectedCategory,
}: PaginatedListingViewProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Handle local searching inside the current page
  const filteredApps = apps.filter(app =>
    app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isAndroid = type.startsWith('apk');
  
  let titleText = 'Mod Library';
  let typeLabel = 'Mods';
  
  if (type === 'apps') {
    titleText = 'IPA Apps Library';
    typeLabel = 'Apps';
  } else if (type === 'games') {
    titleText = 'IPA Games Library';
    typeLabel = 'Games';
  } else if (type === 'apk-apps') {
    titleText = 'APK Apps Library';
    typeLabel = 'APK Apps';
  } else if (type === 'apk-game') {
    titleText = 'APK Games Library';
    typeLabel = 'APK Games';
  }

  // Navigate to a specific category or page
  const navigate = (newCategory: string, newPage: number) => {
    router.push(`/${type}?category=${newCategory}&page=${newPage}`);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 flex flex-col gap-8 pb-24">
      {/* 1. Header Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-almond font-bold text-sm uppercase tracking-wider">
          {isAndroid ? (
            <>
              <CustomAndroidIcon className="h-4 w-4 animate-pulse text-almond" />
              <span>Android Mod Archive</span>
            </>
          ) : (
            <>
              <CustomAppleIcon className="h-4 w-4 animate-pulse text-matcha" />
              <span>iOS Mod Archive</span>
            </>
          )}
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight leading-none">
          {titleText}
        </h1>
        <p className="text-muted-foreground text-xs md:text-sm max-w-xl font-medium">
          Browse our extensive database of modified {typeLabel.toLowerCase()}. Sideload instantly using your choice of developer certificates or direct download packages.
        </p>
      </div>

      {/* 2. Search & Categories Filters */}
      <div className="flex flex-col gap-6 border-b border-border/40 pb-6">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder={`Search ${typeLabel.toLowerCase()} on this page...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-11 pr-4 rounded-xl bg-card/40 border border-border/40 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-almond focus:border-almond text-sm transition-all"
          />
        </div>

        {/* Scrollable Categories List */}
        {categories.length > 1 && (
          <div className="flex flex-col gap-2">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Categories</span>
            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-2 custom-scrollbar">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.slug;
                return (
                  <button
                    key={cat.slug}
                    onClick={() => navigate(cat.slug, 1)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-almond text-eclipse border-almond shadow-md shadow-almond/20'
                        : 'bg-card/30 text-muted-foreground border-border/40 hover:text-foreground hover:border-border/80'
                    }`}
                    style={{ minHeight: '36px' }}
                  >
                    {cat.text}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3. Apps Grid */}
      <div className="flex flex-col gap-6">
        {filteredApps.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border/40 rounded-3xl bg-card/5">
            <p className="text-muted-foreground text-sm">No items found matching your filter or search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredApps.map((app, index) => {
              // Extract the relative path from the absolute URL
              const cleanPath = app.detailUrl
                ? app.detailUrl.replace('https://ipaomtk.com/', '').replace(/\/$/, '')
                : '';
              const localHref = cleanPath ? `/app/${cleanPath}` : '#';

              return (
                <Link
                  key={app.detailUrl + '-' + index}
                  href={localHref}
                  className="group flex flex-col justify-between rounded-2xl border border-border/30 bg-card/25 p-3 hover:border-border/70 hover:bg-card/65 transition-all duration-200"
                >
                  <div className="flex flex-col gap-3">
                    {/* App Icon Container */}
                    <div className="relative h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-2xl border border-border/40 bg-card/80 shadow-md flex-shrink-0">
                      {app.iconUrl ? (
                        <img 
                          src={app.iconUrl} 
                          alt={app.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-card text-muted-foreground">
                          {isAndroid ? <CustomAndroidIcon className="h-8 w-8 text-almond" /> : <CustomAppleIcon className="h-8 w-8 text-matcha" />}
                        </div>
                      )}
                      
                      {/* Platform Tag */}
                      <div className="absolute right-1 top-1 rounded-full p-1 bg-white text-[#181818] border border-border/50 shadow-sm flex items-center justify-center">
                        {isAndroid ? (
                          <CustomAndroidIcon className="h-2.5 w-2.5 text-[#181818]" />
                        ) : (
                          <CustomAppleIcon className="h-2.5 w-2.5 text-[#181818]" />
                        )}
                      </div>
                    </div>

                    {/* App Details */}
                    <div className="flex flex-col gap-1 px-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-[11px] text-muted-foreground font-semibold line-clamp-1">
                          {app.category}
                        </p>
                        {app.badge && (
                          <span className="rounded-md bg-almond px-1.5 py-0.5 text-[9px] font-black uppercase text-eclipse">
                            {app.badge}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-foreground text-sm line-clamp-1 group-hover:text-almond transition-colors leading-tight">
                        {app.title}
                      </h3>
                    </div>
                  </div>

                  {/* Footer Specs inside card */}
                  <div className="border-t border-border/20 pt-2 mt-3 flex items-center justify-between px-1 text-[11px]">
                    <span className="text-muted-foreground font-medium">{app.version || 'vLast'}</span>
                    <span className="text-muted-foreground font-semibold">{app.size || 'N/A'}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 border-t border-border/40 pt-8 mt-4">
          <button
            onClick={() => navigate(selectedCategory, currentPage - 1)}
            disabled={currentPage <= 1}
            className={`flex items-center justify-center gap-1 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              currentPage <= 1
                ? 'opacity-40 bg-card/10 text-muted-foreground/40 border-border/20 cursor-not-allowed'
                : 'bg-card/60 text-foreground border-border/50 hover:bg-card hover:border-border'
            }`}
            style={{ minWidth: '100px', minHeight: '44px' }}
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          <span className="text-xs text-muted-foreground font-bold uppercase">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => navigate(selectedCategory, currentPage + 1)}
            disabled={currentPage >= totalPages}
            className={`flex items-center justify-center gap-1 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              currentPage >= totalPages
                ? 'opacity-40 bg-card/10 text-muted-foreground/40 border-border/20 cursor-not-allowed'
                : 'bg-card/60 text-foreground border-border/50 hover:bg-card hover:border-border'
            }`}
            style={{ minWidth: '100px', minHeight: '44px' }}
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
