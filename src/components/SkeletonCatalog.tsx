'use client';

import { Cpu } from 'lucide-react';

interface SkeletonCatalogProps {
  showFeatured?: boolean;
}

export default function SkeletonCatalog({ showFeatured = true }: SkeletonCatalogProps) {
  // Array of 10 items for listing grid
  const gridItems = Array.from({ length: 10 });
  // Array of 3 items for featured mods
  const featuredItems = Array.from({ length: 3 });

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 flex flex-col gap-10 animate-pulse">
      
      {/* 1. Header Section */}
      <div className="flex flex-col gap-2.5">
        <div className="h-4 w-36 rounded-md bg-quartz/10 border border-quartz/20" />
        <div className="h-9 w-64 rounded-xl bg-quartz/25" />
        <div className="h-4.5 w-full max-w-xl rounded-md bg-quartz/15" />
      </div>

      {/* 2. Device Intelligence Card Skeleton (if on Home Page) */}
      {showFeatured && (
        <div className="w-full h-48 rounded-[2.5rem] bg-charleston/35 border border-quartz/20 p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-quartz/20 shrink-0" />
            <div className="space-y-2">
              <div className="h-4.5 w-40 rounded bg-quartz/25" />
              <div className="h-3 w-28 rounded bg-quartz/15" />
            </div>
          </div>
          <div className="h-px bg-quartz/10 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-10 rounded-xl bg-quartz/10" />
            <div className="h-10 rounded-xl bg-quartz/10" />
          </div>
        </div>
      )}

      {/* 3. Featured Section */}
      {showFeatured && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-quartz/20 rounded-full" />
            <div className="h-4.5 w-32 rounded bg-quartz/20" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredItems.map((_, idx) => (
              <div 
                key={idx}
                className="rounded-3xl border border-quartz/20 bg-charleston/25 p-6 flex flex-col justify-between h-64"
              >
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-quartz/20 shrink-0" />
                  <div className="space-y-2 w-full">
                    <div className="h-3 w-12 rounded bg-quartz/20" />
                    <div className="h-5 w-3/4 rounded bg-quartz/25" />
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <div className="h-3.5 w-full rounded bg-quartz/15" />
                  <div className="h-3.5 w-5/6 rounded bg-quartz/15" />
                </div>
                <div className="flex justify-between items-center border-t border-quartz/15 pt-4 mt-2">
                  <div className="h-4 w-20 rounded bg-quartz/15" />
                  <div className="h-8 w-24 rounded-full bg-quartz/20" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Search & Controls */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div className="h-11 w-full max-w-md rounded-xl bg-quartz/10 border border-quartz/20" />
        <div className="h-11 w-64 rounded-xl bg-quartz/10 border border-quartz/20" />
      </section>

      {/* 5. Main Catalog Grid */}
      <section className="flex flex-col gap-6">
        <div className="h-6 w-48 rounded bg-quartz/25" />
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {gridItems.map((_, idx) => (
            <div 
              key={idx}
              className="rounded-2xl border border-quartz/15 bg-charleston/15 p-3 flex flex-col gap-4 h-48 justify-between"
            >
              <div className="flex flex-col gap-3">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-quartz/20 shrink-0" />
                <div className="space-y-2">
                  <div className="h-3 w-16 rounded bg-quartz/15" />
                  <div className="h-4.5 w-full rounded bg-quartz/25" />
                </div>
              </div>
              <div className="flex justify-between items-center border-t border-quartz/10 pt-2">
                <div className="h-3 w-12 rounded bg-quartz/10" />
                <div className="h-3 w-12 rounded bg-quartz/10" />
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
