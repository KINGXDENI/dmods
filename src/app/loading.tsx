'use client';

import SkeletonCatalog from '@/components/SkeletonCatalog';

export default function RootLoading() {
  return (
    <main className="flex-1 flex flex-col bg-background pb-20">
      <SkeletonCatalog showFeatured={true} />
    </main>
  );
}
