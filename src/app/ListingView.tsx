'use client';

import { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, Download, ShieldCheck, Flame, Cpu, Compass } from 'lucide-react';
import { CustomAppleIcon, CustomAndroidIcon } from '@/components/CustomIcons';
import type { ScrapeResult } from '@/lib/scraper';
import SmartDeviceDetect from '@/components/SmartDeviceDetect';
import { cn } from '@/lib/utils';

interface ListingViewProps {
  initialData: ScrapeResult;
}

export default function ListingView({ initialData }: ListingViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'ios' | 'android'>('all');
  const [isPending, startTransition] = useTransition();

  // Automatically detect device platform client-side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = window.navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(ua)) {
        setActiveTab('ios');
      } else if (/android/.test(ua)) {
        setActiveTab('android');
      }
    }

    // Listen to device intelligence scan updates
    const handleDeviceDetected = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.os) {
        setActiveTab(customEvent.detail.os);
      }
    };

    window.addEventListener('device-detected', handleDeviceDetected);
    return () => {
      window.removeEventListener('device-detected', handleDeviceDetected);
    };
  }, []);

  // Helper to extract relative path from absolute URL
  const getLocalPath = (url: string) => {
    if (!url) return '#';
    const relative = url.replace('https://ipaomtk.com/', '').replace(/\/$/, '');
    return `/app/${relative}`;
  };

  // Combine both IPA and APK apps for "all" listing
  const allApps = [
    ...initialData.ipa.map(app => ({ ...app, platformType: 'ios' as const })),
    ...initialData.apk.map(app => ({ ...app, platformType: 'android' as const }))
  ];

  // Pick top 3 apps for Featured section (GTA, Spotify, TikTok or first 3)
  const featuredApps = allApps.filter(app => 
    app.title.toLowerCase().includes('gta') || 
    app.title.toLowerCase().includes('spotify') || 
    app.title.toLowerCase().includes('tiktok') ||
    app.title.toLowerCase().includes('car parking')
  ).slice(0, 3);

  // Fallback if no specific apps match
  const finalFeatured = featuredApps.length > 0 ? featuredApps : allApps.slice(0, 3);

  // Filter apps based on search and tab
  const filteredApps = allApps.filter(app => {
    const matchesSearch = app.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          app.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'ios') return matchesSearch && app.platformType === 'ios';
    if (activeTab === 'android') return matchesSearch && app.platformType === 'android';
    return matchesSearch;
  });

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 flex flex-col gap-10">
      
      {/* Smart Device Intelligence Dashboard */}
      {searchQuery === '' && (
        <section className="flex flex-col gap-3 animate-in fade-in duration-500">
          <div className="flex items-center gap-2 text-almond font-bold text-sm uppercase tracking-wider">
            <Cpu className="h-4 w-4 text-almond" />
            <span>Device Intelligence</span>
          </div>
          <SmartDeviceDetect variant="card" />
        </section>
      )}

      {/* 1. Hero / Featured Section */}
      {searchQuery === '' && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-almond font-bold text-sm uppercase tracking-wider">
            <Flame className="h-4 w-4 animate-bounce text-almond" />
            <span>Featured Mods</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {finalFeatured.map((app, index) => (
              <div 
                key={app.detailUrl + index}
                className="group relative overflow-hidden rounded-3xl border border-border/30 bg-card p-6 flex flex-col justify-between h-64 hover:border-almond/40 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-black/40"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-border/40 bg-card shadow-lg">
                      {app.iconUrl ? (
                        <img 
                          src={app.iconUrl} 
                          alt={app.title}
                          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-card text-muted-foreground">
                          {app.platformType === 'ios' ? <CustomAppleIcon className="h-8 w-8 text-matcha" /> : <CustomAndroidIcon className="h-8 w-8 text-almond" />}
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-black text-almond px-2.5 py-0.5 rounded-full bg-forest/40 border border-matcha/40">
                        {app.badge || 'MOD'}
                      </span>
                      <h3 className="font-bold text-foreground text-lg leading-tight mt-1 group-hover:text-almond transition-colors">
                        {app.title}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <p className="text-muted-foreground text-xs line-clamp-2">
                    {app.modFeatures || 'Explore premium features, custom UI enhancements, and ad-free experience.'}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-semibold">
                    <span>{app.version}</span>
                    <span>•</span>
                    <span>{app.size}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border/20 pt-4 mt-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    {app.platformType === 'ios' ? (
                      <span className="flex items-center gap-1"><CustomAppleIcon className="h-3.5 w-3.5 text-matcha" /> iOS IPA</span>
                    ) : (
                      <span className="flex items-center gap-1"><CustomAndroidIcon className="h-3.5 w-3.5 text-almond" /> Android APK</span>
                    )}
                  </div>
                  <Link 
                    href={getLocalPath(app.detailUrl)}
                    className="flex items-center gap-1 text-xs font-bold text-foreground bg-card border border-border/50 hover:bg-almond hover:text-eclipse px-3.5 py-1.5 rounded-full transition-all duration-300"
                  >
                    <span>Download</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 2. Search & Controls */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search mods, games, and apps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-11 pr-4 rounded-xl bg-card/40 border border-border/40 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-almond focus:border-almond text-sm transition-all"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex items-center bg-card/30 p-1.5 rounded-xl border border-border/40 w-fit">
          <button
            onClick={() => startTransition(() => setActiveTab('all'))}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'all' 
                ? 'bg-almond text-eclipse shadow-md font-bold' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            style={{ minWidth: '80px', minHeight: '36px' }}
          >
            <Compass className="h-3.5 w-3.5" />
            <span>All</span>
          </button>
          <button
            onClick={() => startTransition(() => setActiveTab('ios'))}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ios' 
                ? 'bg-almond text-eclipse shadow-md font-bold' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            style={{ minWidth: '80px', minHeight: '36px' }}
          >
            <CustomAppleIcon className="h-3.5 w-3.5" />
            <span>iOS IPA</span>
          </button>
          <button
            onClick={() => startTransition(() => setActiveTab('android'))}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'android' 
                ? 'bg-almond text-eclipse shadow-md font-bold' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            style={{ minWidth: '80px', minHeight: '36px' }}
          >
            <CustomAndroidIcon className="h-3.5 w-3.5" />
            <span>Android APK</span>
          </button>
        </div>
      </section>

      {/* 3. Main Listing Grid */}
      <section className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span>Browse Library</span>
            <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-md bg-card border border-border/40">
              {filteredApps.length} mods
            </span>
          </h2>
        </div>

        {filteredApps.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border/40 rounded-3xl bg-card/5">
            <p className="text-muted-foreground text-sm">No applications found matching "{searchQuery}"</p>
          </div>
        ) : (
          <div className={cn(
            "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 transition-all duration-300",
            isPending ? "opacity-50 scale-[0.99]" : "opacity-100 scale-100"
          )}>
            {filteredApps.map((app, index) => (
              <Link
                key={app.detailUrl + '-' + index}
                href={getLocalPath(app.detailUrl)}
                className="group flex flex-col justify-between rounded-2xl border border-border/30 bg-card/25 p-3 hover:border-border/70 hover:bg-card/65 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-black/30"
              >
                <div className="flex flex-col gap-3">
                  {/* App Icon Container */}
                  <div className="relative h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-2xl border border-border/40 bg-card shadow-md flex-shrink-0">
                    {app.iconUrl ? (
                      <img 
                        src={app.iconUrl} 
                        alt={app.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-card text-muted-foreground">
                        {app.platformType === 'ios' ? <CustomAppleIcon className="h-8 w-8 text-matcha" /> : <CustomAndroidIcon className="h-8 w-8 text-almond" />}
                      </div>
                    )}
                    
                    {/* Platform Tag */}
                    <div className="absolute right-1 top-1 rounded-full p-1 bg-white dark:bg-[#181818] border border-border/50 dark:border-border/30 shadow-sm flex items-center justify-center">
                      {app.platformType === 'ios' ? (
                        <CustomAppleIcon className="h-2.5 w-2.5 text-[#181818] dark:text-[#A7A7A7]" />
                      ) : (
                        <CustomAndroidIcon className="h-2.5 w-2.5 text-[#181818] dark:text-[#A7A7A7]" />
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

                {/* Footer specs inside card */}
                <div className="border-t border-border/20 pt-2 mt-3 flex items-center justify-between px-1 text-[11px]">
                  <span className="text-muted-foreground font-medium">{app.version || 'vLast'}</span>
                  <span className="text-muted-foreground font-semibold">{app.size || 'N/A'}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 4. About Section (#about) */}
      <section id="about" className="border-t border-border/40 pt-16 pb-8 flex flex-col gap-6 scroll-mt-20">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-almond" />
            <span>About DMods Platform</span>
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed mt-4">
            DMods is a premium, open-source mobile-first aggregator web hub for customized applications. 
            All listing data is dynamically parsed from verified community archives to provide you with the most up-to-date versions of tweak packages, modifications, sideloading certificates, and IPA/APK apps.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="md:h-48 w-full flex flex-col gap-2 p-5 rounded-2xl bg-card/30 border border-border/40">
              <ShieldCheck className="h-6 w-6 text-almond" />
              <h4 className="font-bold text-foreground text-sm mt-1">Safe Downloads</h4>
              <p className="text-muted-foreground text-xs leading-normal">
                Direct access to CDNs and developer repos. We show certificate verification status.
              </p>
            </div>
            <div className="md:h-48 w-full flex flex-col gap-2 p-5 rounded-2xl bg-card/30 border border-border/40">
              <Cpu className="h-6 w-6 text-almond" />
              <h4 className="font-bold text-foreground text-sm mt-1">Auto-Sign Services</h4>
              <p className="text-muted-foreground text-xs leading-normal">
                Features automatic remote signing APIs for iOS installations right from your mobile browser.
              </p>
            </div>
            <div className="md:h-48 w-full flex flex-col gap-2 p-5 rounded-2xl bg-card/30 border border-border/40">
              <CustomAndroidIcon className="h-6 w-6 text-almond" />
              <h4 className="font-bold text-foreground text-sm mt-1">Mobile First</h4>
              <p className="text-muted-foreground text-xs leading-normal">
                Responsively tailored interface for single-thumb scrolling, touch targets, and offline compatibility.
              </p>
            </div>
          </div>
        </div>
      </section>
      
    </div>
  );
}
