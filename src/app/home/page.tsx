import { scrapeHomepage } from "@/lib/scraper";
import ListingView from "../ListingView";
import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/metadata';

export const revalidate = 3600; // Revalidate cache every hour (Incremental Static Regeneration)

export const metadata: Metadata = constructMetadata({
  title: "Mod Directory – DMods",
  description: "Browse the absolute database of tweaked iOS IPA packages and Android APK apps. Direct sideload certificates and status verification.",
  path: "/home",
  ogParams: {
    title: "Mod Directory",
    subtitle: "Explore decrypted iOS apps, tweaked games, and Android packages. Fully searchable offline-cached archive.",
    badge: "Repository Index",
    type: "home"
  }
});

export default async function Home() {
  try {
    // Fetch listings server-side
    const initialData = await scrapeHomepage();

    return (
      <main className="flex-1 flex flex-col bg-background pb-20">
        <ListingView initialData={initialData} />
      </main>
    );
  } catch (err: any) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center min-h-[80vh] p-6 text-center bg-background relative overflow-hidden">
        <div className="max-w-md p-10 rounded-[3rem] border border-quartz/40 bg-charleston/30 text-foreground backdrop-blur-2xl shadow-2xl">
          <h2 className="text-2xl font-black text-foreground mb-3 tracking-tight uppercase">Sync Failure</h2>
          <p className="text-sm text-dimgray mb-8 font-medium leading-relaxed">
            We encountered a connection issue syncing application catalogs from the remote repository.
          </p>
          <a 
            href="/home"
            className="w-full flex items-center justify-center gap-2 py-4 bg-argent text-thamar font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-white transition-all shadow-xl shadow-black/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            Retry Connection
          </a>
        </div>
      </main>
    );
  }
}
