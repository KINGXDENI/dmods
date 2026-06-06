import Link from 'next/link';
import { scrapeHomepage } from "@/lib/scraper";
import { CustomAppleIcon, CustomAndroidIcon } from '@/components/CustomIcons';
import { ShieldCheck, Cpu, Terminal, ArrowRight, Activity, ChevronRight } from 'lucide-react';
import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/metadata';

export const revalidate = 3600; // Cache landing page for 1 hour

export const metadata: Metadata = constructMetadata({
  title: "DMods – Premium IPA & APK Hub",
  description: "Find and download tweaked iOS IPA files and modified Android APK apps safely with high-speed secure links.",
  path: "/",
  ogParams: {
    title: "DMods – Premium IPA & APK Hub",
    subtitle: "Automated Sideload Archive & Decrypted Library. Direct sign, TrollStore compatible, and verified direct downloads.",
    badge: "Active Stack",
    type: "home"
  }
});

export default async function LandingPage() {
  let featuredApps: any[] = [];
  
  try {
    const data = await scrapeHomepage();
    const allApps = [
      ...data.ipa.map(app => ({ ...app, platformType: 'ios' as const })),
      ...data.apk.map(app => ({ ...app, platformType: 'android' as const }))
    ];
    // Filter out a few interesting ones or just take top 4
    featuredApps = allApps.slice(0, 4);
  } catch (err) {
    console.error("Failed to scrape featured apps for landing page", err);
  }

  // Helper to extract relative path
  const getLocalPath = (url: string) => {
    if (!url) return '#';
    const relative = url.replace('https://ipaomtk.com/', '').replace(/\/$/, '');
    return `/app/${relative}`;
  };

  return (
    <main className="flex-1 bg-background text-foreground flex flex-col relative overflow-hidden pb-24">
      {/* Abstract Grid background overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(167,167,167,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(167,167,167,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-argent/5 blur-[120px] rounded-full pointer-events-none" />

      {/* 1. HERO SECTION */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 px-6 max-w-6xl mx-auto w-full flex flex-col items-center text-center gap-8">
        <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-argent/10 border border-argent/20 shadow-inner">
          <Activity className="h-3.5 w-3.5 text-argent animate-pulse" />
          <span className="text-[10px] uppercase font-black tracking-[0.25em] text-argent">Platform Active & Online</span>
        </div>

        <div className="flex flex-col gap-4 max-w-4xl items-center">
          <img 
            src="/logo.png" 
            alt="DMods Logo" 
            className="h-24 w-24 object-contain mb-2 animate-fade-in theme-logo" 
          />
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] text-foreground uppercase">
            DMods
          </h1>
          <p className="text-lg md:text-xl font-bold uppercase tracking-[0.18em] text-dimgray max-w-2xl mt-1">
            Automated Sideload Archive & Decrypted Library
          </p>
        </div>

        <p className="text-muted-foreground text-sm md:text-base font-medium max-w-xl leading-relaxed">
          Access decrypted iOS IPA and modified Android APK files. Inject certificates, sign applications directly in your browser, and sideload securely.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto">
          <Link 
            href="/home"
            className="flex items-center justify-center gap-2 px-10 py-5 bg-foreground text-background font-black uppercase tracking-[0.2em] text-[11px] rounded-2xl hover:bg-foreground/90 hover:scale-[1.03] active:scale-[0.97] transition-all shadow-[0_15px_30px_-5px_rgba(167,167,167,0.3)]"
          >
            <span>Explore Mod Library</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
          <Link 
            href="/apk-apps"
            className="flex items-center justify-center gap-2 px-10 py-5 bg-charleston/60 text-argent border border-quartz/60 font-black uppercase tracking-[0.2em] text-[11px] rounded-2xl hover:bg-quartz/20 hover:scale-[1.03] active:scale-[0.97] transition-all"
          >
            <span>APK Library</span>
          </Link>
        </div>
      </section>

      {/* 2. LIVE ARCHIVE PREVIEW */}
      {featuredApps.length > 0 && (
        <section className="max-w-6xl mx-auto w-full px-6 py-12 flex flex-col gap-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-quartz/20 pb-5">
            <div>
              <span className="text-[10px] text-dimgray uppercase font-black tracking-widest block mb-1">Live Database</span>
              <h2 className="text-2xl font-black text-foreground tracking-tight uppercase">Recent Repository Updates</h2>
            </div>
            <Link 
              href="/home" 
              className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-argent hover:text-white transition-colors group"
            >
              <span>View Full Directory</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredApps.map((app: any, idx: number) => (
              <Link
                key={app.detailUrl + '-' + idx}
                href={getLocalPath(app.detailUrl)}
                className="group flex flex-col justify-between rounded-[2rem] border border-quartz/30 bg-charleston/25 p-4 hover:border-argent/40 hover:bg-charleston/45 transition-all duration-300"
              >
                <div className="flex flex-col gap-4">
                  {/* App Icon Container */}
                  <div className="relative h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-[1.25rem] border border-quartz/40 bg-charleston/60 shadow-md flex-shrink-0">
                    {app.iconUrl ? (
                      <img 
                        src={app.iconUrl} 
                        alt={app.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-charleston text-dimgray">
                        {app.platformType === 'ios' ? (
                          <CustomAppleIcon className="h-8 w-8 text-argent" />
                        ) : (
                          <CustomAndroidIcon className="h-8 w-8 text-argent" />
                        )}
                      </div>
                    )}
                    
                    {/* Platform Tag */}
                    <div className="absolute right-1 top-1 rounded-full p-1 bg-card/90 border border-quartz/30 backdrop-blur-md">
                      {app.platformType === 'ios' ? (
                        <CustomAppleIcon className="h-2.5 w-2.5 text-foreground" />
                      ) : (
                        <CustomAndroidIcon className="h-2.5 w-2.5 text-foreground" />
                      )}
                    </div>
                  </div>

                  {/* App Details */}
                  <div className="flex flex-col gap-1 px-1">
                    <h3 className="font-black text-foreground text-base tracking-tight truncate group-hover:text-argent transition-colors leading-tight">
                      {app.title}
                    </h3>
                    <p className="text-[10px] text-dimgray font-black uppercase tracking-widest truncate">
                      {app.category}
                    </p>
                  </div>
                </div>

                {/* Specs Footer */}
                <div className="border-t border-quartz/20 pt-3 mt-4 flex items-center justify-between px-1 text-[10px] font-black uppercase tracking-wider text-dimgray">
                  <span>{app.version || 'vBuild'}</span>
                  <span className="text-argent">{app.size || 'N/A'}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 3. PLATFORM CORE FEATURES */}
      <section className="max-w-6xl mx-auto w-full px-6 py-16 flex flex-col gap-12 mt-8">
        <div className="text-center max-w-xl mx-auto flex flex-col gap-3">
          <span className="text-[10px] text-dimgray uppercase font-black tracking-[0.25em]">Sideloading Stack</span>
          <h2 className="text-3xl font-black text-foreground tracking-tight uppercase leading-none">Security & Infrastructure</h2>
          <p className="text-muted-foreground text-xs font-medium leading-relaxed">
            DMods integrates sideloading workflows directly on the web, optimizing install rates and payload decryptions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col gap-4 p-8 rounded-[2.5rem] bg-charleston/25 border border-quartz/30 relative overflow-hidden group hover:border-argent/30 transition-all duration-300">
            <div className="absolute -top-12 -right-12 h-24 w-24 bg-argent/5 blur-2xl rounded-full" />
            <div className="p-3 bg-argent/10 border border-argent/20 rounded-2xl w-fit">
              <ShieldCheck className="h-6 w-6 text-argent" />
            </div>
            <h4 className="font-black text-foreground text-lg uppercase tracking-wider mt-2">Zero-Revoke Protocol</h4>
            <p className="text-muted-foreground text-xs leading-relaxed font-medium">
              Native implementation references for TrollStore installation. Bypasses Apple ID signing restrictions completely for iOS devices.
            </p>
          </div>

          <div className="flex flex-col gap-4 p-8 rounded-[2.5rem] bg-charleston/25 border border-quartz/30 relative overflow-hidden group hover:border-argent/30 transition-all duration-300">
            <div className="absolute -top-12 -right-12 h-24 w-24 bg-argent/5 blur-2xl rounded-full" />
            <div className="p-3 bg-argent/10 border border-argent/20 rounded-2xl w-fit">
              <Terminal className="h-6 w-6 text-argent" />
            </div>
            <h4 className="font-black text-foreground text-lg uppercase tracking-wider mt-2">Secure Decryption Handshake</h4>
            <p className="text-muted-foreground text-xs leading-relaxed font-medium">
              Simulates secure handshake protocols during repository extraction, ensuring decrypted package payloads are clean, intact, and compiled.
            </p>
          </div>

          <div className="flex flex-col gap-4 p-8 rounded-[2.5rem] bg-charleston/25 border border-quartz/30 relative overflow-hidden group hover:border-argent/30 transition-all duration-300">
            <div className="absolute -top-12 -right-12 h-24 w-24 bg-argent/5 blur-2xl rounded-full" />
            <div className="p-3 bg-argent/10 border border-argent/20 rounded-2xl w-fit">
              <Cpu className="h-6 w-6 text-argent" />
            </div>
            <h4 className="font-black text-foreground text-lg uppercase tracking-wider mt-2">In-Browser Remote Signer</h4>
            <p className="text-muted-foreground text-xs leading-relaxed font-medium">
              Allows credentials injection using custom developer profiles (.p12 files) directly via API endpoints, streamlining installation.
            </p>
          </div>
        </div>
      </section>

      {/* 4. SIDE-LOAD COMPATIBILITY & DISCLOSURE */}
      <section className="max-w-6xl mx-auto w-full px-6 mt-8">
        <div className="rounded-[3rem] border border-quartz/30 bg-charleston/20 p-10 flex flex-col md:flex-row items-center justify-between gap-8 backdrop-blur-md">
          <div className="flex flex-col gap-2 max-w-xl">
            <h3 className="font-black text-foreground text-lg uppercase tracking-wider">Ready to Sideload?</h3>
            <p className="text-muted-foreground text-xs leading-relaxed font-medium">
              Launch our clean, interactive mod index where you can search, browse by category, filter by operating system platform, and access download options.
            </p>
          </div>
          <Link 
            href="/home" 
            className="flex items-center justify-center gap-2 px-8 py-5 bg-foreground text-background font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl hover:bg-foreground/90 hover:scale-[1.03] active:scale-[0.97] transition-all whitespace-nowrap"
          >
            <span>Launch Mod Library</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
