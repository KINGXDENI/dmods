'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search } from 'lucide-react';
import { CustomAppleIcon, CustomAndroidIcon } from '@/components/CustomIcons';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/home', label: 'Home', icon: Home },
    { href: '/apps', label: 'IPA Apps', icon: CustomAppleIcon, iconColor: 'text-argent' },
    { href: '/games', label: 'IPA Games', icon: CustomAppleIcon, iconColor: 'text-dimgray' },
    { href: '/apk-apps', label: 'APK Apps', icon: CustomAndroidIcon, iconColor: 'text-argent' },
    { href: '/apk-game', label: 'APK Games', icon: CustomAndroidIcon, iconColor: 'text-dimgray' },
    { href: '/esign', label: 'ESign iOS', icon: CustomAppleIcon, iconColor: 'text-white' },
    { href: '/ksign', label: 'KSign iOS', icon: CustomAppleIcon, iconColor: 'text-white/80' },
  ];

  const triggerSearch = () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-card/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-xl font-black tracking-tight text-foreground group">
            <img 
              src="/logo.png" 
              alt="DMods Logo" 
              className="h-7 w-7 object-contain group-hover:scale-105 transition-transform" 
              style={{ filter: 'brightness(0) invert(0.655)' }}
            />
            <span className="font-black tracking-tight">DMods</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-1 text-sm font-semibold text-muted-foreground">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-2 transition-all duration-300 relative group",
                    isActive 
                      ? "text-foreground bg-quartz/20 shadow-inner" 
                      : "hover:bg-quartz/10 hover:text-foreground"
                  )}
                >
                  <Icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", isActive ? (item.iconColor || "text-white") : "text-argent")} />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-argent rounded-full shadow-[0_0_8px_#C0C2C0]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {/* Search Trigger */}
          <button 
            onClick={triggerSearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-quartz/10 border border-quartz/30 text-argent hover:bg-quartz/20 transition-all group"
            title="Search (CMD+K)"
          >
            <Search className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Search</span>
            <kbd className="hidden sm:flex h-5 items-center gap-1 rounded border border-quartz/40 bg-jet px-1.5 font-mono text-[9px] font-medium text-dimgray">
              <span className="text-[10px]">⌘</span>K
            </kbd>
          </button>

          <a
            href="/api/scrape"
            target="_blank"
            className="flex items-center gap-2 rounded-full bg-argent/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-argent border border-argent/25 hover:bg-argent/20 transition-all hover:shadow-[0_0_20px_rgba(192,194,192,0.15)] active:scale-95"
          >
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-argent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-argent shadow-[0_0_8px_#C0C2C0]"></span>
            </div>
            <span>Scrape Live</span>
          </a>
        </div>
      </div>
    </header>
  );
}
