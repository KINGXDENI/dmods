'use client';

export default function SkeletonDetail() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 flex flex-col gap-8 pb-24 animate-pulse">
      
      {/* 1. Back button link */}
      <div className="h-5 w-24 rounded bg-quartz/15" />

      {/* 2. Main App Header card */}
      <div className="rounded-[3rem] border border-quartz/30 bg-charleston/25 p-1.5 sm:p-2 shadow-2xl">
        <div className="bg-charleston/35 rounded-[2.5rem] p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Pulsing app thumbnail */}
          <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-[2rem] bg-quartz/20 border border-quartz/30 shrink-0" />
          
          {/* Pulsing header text details */}
          <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left gap-3 w-full">
            <div className="flex items-center gap-2">
              <div className="h-4 w-16 rounded bg-quartz/10" />
              <div className="h-4.5 w-12 rounded-full bg-quartz/20" />
            </div>
            
            <div className="h-8 w-3/4 rounded bg-quartz/25" />
            <div className="h-4 w-1/2 rounded bg-quartz/15 mt-1" />
            
            {/* Version & Specs blocks */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-2 w-full">
              <div className="h-8 w-24 rounded-xl bg-quartz/15 border border-quartz/10" />
              <div className="h-8 w-24 rounded-xl bg-quartz/15 border border-quartz/10" />
              <div className="h-8 w-24 rounded-xl bg-quartz/15 border border-quartz/10" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Two column details view */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Left column - Description & Changelog */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="rounded-[2.5rem] border border-quartz/30 bg-charleston/20 p-6 sm:p-8 flex flex-col gap-5">
            <div className="h-6 w-36 rounded bg-quartz/25" />
            <div className="space-y-3">
              <div className="h-4 w-full rounded bg-quartz/15" />
              <div className="h-4 w-11/12 rounded bg-quartz/15" />
              <div className="h-4 w-4/5 rounded bg-quartz/15" />
              <div className="h-4 w-full rounded bg-quartz/15" />
              <div className="h-4 w-5/6 rounded bg-quartz/15" />
            </div>
          </div>
        </div>

        {/* Right column - Sideloading & direct installation sidebar */}
        <div className="flex flex-col gap-6">
          <div className="rounded-[2.5rem] border border-quartz/30 bg-charleston/25 p-6 flex flex-col gap-4">
            <div className="h-5 w-32 rounded bg-quartz/20" />
            <div className="h-px bg-quartz/10 w-full" />
            
            <div className="h-12 rounded-xl bg-quartz/15" />
            <div className="h-12 rounded-xl bg-quartz/15 animate-pulse" style={{ animationDelay: '100ms' }} />
            
            <div className="h-20 rounded-xl bg-quartz/10 p-3 flex flex-col gap-2 mt-2">
              <div className="h-3 w-3/4 rounded bg-quartz/15" />
              <div className="h-3 w-1/2 rounded bg-quartz/15" />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
