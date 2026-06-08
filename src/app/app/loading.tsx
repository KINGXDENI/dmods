'use client';

import SkeletonDetail from '@/components/SkeletonDetail';

export default function AppDetailLoading() {
  return (
    <main className="flex-1 flex flex-col bg-background pb-20 pt-8">
      <SkeletonDetail />
    </main>
  );
}
