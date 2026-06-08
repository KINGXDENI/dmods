'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PenTool, ChevronDown, Database } from 'lucide-react';
import { CustomAppleIcon, CustomAndroidIcon } from '@/components/CustomIcons';
import { cn } from '@/lib/utils';
import ThemeToggle from '@/components/ThemeToggle';
import SmartDeviceDetect from '@/components/SmartDeviceDetect';

export default function Navbar() {
  const pathname = usePathname();
  const [isIpaOpen, setIsIpaOpen] = useState(false);
  const [isApkOpen, setIsApkOpen] = useState(false);
  const [isSignersOpen, setIsSignersOpen] = useState(false);

  const ipaRef = useRef<HTMLDivElement>(null);
  const apkRef = useRef<HTMLDivElement>(null);
  const signersRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (ipaRef.current && !ipaRef.current.contains(target)) {
        setIsIpaOpen(false);
      }
      if (apkRef.current && !apkRef.current.contains(target)) {
        setIsApkOpen(false);
      }
      if (signersRef.current && !signersRef.current.contains(target)) {
        setIsSignersOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const ipaItems = [
    { href: '/apps', label: 'IPA Apps', description: 'Decrypted iOS application database', icon: CustomAppleIcon },
    { href: '/games', label: 'IPA Games', description: 'Tweaked iOS games & mod overlays', icon: CustomAppleIcon },
  ];

  const apkItems = [
    { href: '/apk-apps', label: 'APK Apps', description: 'Modified Android apps & premium tools', icon: CustomAndroidIcon },
    { href: '/apk-game', label: 'APK Games', description: 'Android games with unlimited features', icon: CustomAndroidIcon },
  ];

  const signerItems = [
    { href: '/signer', label: 'Remote Signer', description: 'Sideload iOS IPA by download URL', icon: PenTool },
    { href: '/esign', label: 'ESign iOS', description: 'On-device enterprise signing app', icon: CustomAppleIcon },
    { href: '/ksign', label: 'KSign iOS', description: 'Alternative certificate IPA signer', icon: CustomAppleIcon },
    { href: '/repo', label: 'Repo Sources', description: 'AltStore, ESign & KSign repositories', icon: Database },
  ];

  const isIpaActive = ipaItems.some(item => pathname === item.href);
  const isApkActive = apkItems.some(item => pathname === item.href);
  const isSignersActive = signerItems.some(item => pathname === item.href);

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
              className="h-7 w-7 object-contain group-hover:scale-105 transition-transform theme-logo" 
            />
            <span className="font-black tracking-tight">DMods</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-1 text-sm font-semibold text-muted-foreground">
            {/* Home link */}
            <Link
              href="/home"
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-2 transition-all duration-300 relative group text-sm font-semibold",
                pathname === '/home' 
                  ? "text-foreground bg-quartz/20 shadow-inner" 
                  : "hover:bg-quartz/10 text-muted-foreground hover:text-foreground"
              )}
            >
              <Home className={cn("h-4 w-4 transition-transform group-hover:scale-110", pathname === '/home' ? "text-foreground" : "text-argent group-hover:text-foreground")} />
              <span>Home</span>
              {pathname === '/home' && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-argent rounded-full shadow-[0_0_8px_#C0C2C0]" />
              )}
            </Link>

            {/* iOS IPA Dropdown */}
            <div 
              ref={ipaRef}
              className="relative"
              onMouseEnter={() => setIsIpaOpen(true)}
              onMouseLeave={() => setIsIpaOpen(false)}
            >
              <button
                onClick={() => setIsIpaOpen(!isIpaOpen)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-2 transition-all duration-300 relative group cursor-pointer text-sm font-semibold focus:outline-none focus-visible:outline-none",
                  isIpaActive 
                    ? "text-foreground bg-quartz/20 shadow-inner" 
                    : "hover:bg-quartz/10 text-muted-foreground hover:text-foreground"
                )}
              >
                <CustomAppleIcon className={cn("h-4 w-4 transition-transform group-hover:scale-110", isIpaActive ? "text-foreground" : "text-argent group-hover:text-foreground")} />
                <span>iOS IPA</span>
                <ChevronDown className={cn("h-3 w-3 transition-transform duration-300 text-argent group-hover:text-foreground", isIpaActive && "text-foreground", isIpaOpen && "rotate-180")} />
                {isIpaActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-argent rounded-full shadow-[0_0_8px_#C0C2C0]" />
                )}
              </button>

              {/* Dropdown Menu Card */}
              <div
                className={cn(
                  "absolute left-0 mt-1 w-64 origin-top-left rounded-2xl border border-quartz/40 bg-jet/95 backdrop-blur-xl p-2.5 shadow-2xl transition-all duration-200 z-50 flex flex-col gap-1",
                  isIpaOpen 
                    ? "opacity-100 translate-y-0 scale-100 visible" 
                    : "opacity-0 -translate-y-2 scale-95 invisible pointer-events-none"
                )}
              >
                {ipaItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsIpaOpen(false)}
                      className={cn(
                        "flex items-start gap-3 rounded-xl p-2 transition-all duration-200 hover:bg-quartz/15 group text-left",
                        isActive ? "bg-quartz/10 text-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <div className={cn(
                        "p-2 rounded-lg bg-quartz/10 border border-quartz/20 group-hover:bg-quartz/20 transition-all shrink-0",
                        isActive ? "border-argent text-foreground" : "text-argent group-hover:text-foreground"
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="font-bold text-xs text-foreground group-hover:text-foreground transition-colors truncate">{item.label}</span>
                        <span className="text-[10px] leading-normal text-dimgray group-hover:text-muted-foreground transition-colors line-clamp-2">{item.description}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Android APK Dropdown */}
            <div 
              ref={apkRef}
              className="relative"
              onMouseEnter={() => setIsApkOpen(true)}
              onMouseLeave={() => setIsApkOpen(false)}
            >
              <button
                onClick={() => setIsApkOpen(!isApkOpen)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-2 transition-all duration-300 relative group cursor-pointer text-sm font-semibold focus:outline-none focus-visible:outline-none",
                  isApkActive 
                    ? "text-foreground bg-quartz/20 shadow-inner" 
                    : "hover:bg-quartz/10 text-muted-foreground hover:text-foreground"
                )}
              >
                <CustomAndroidIcon className={cn("h-4 w-4 transition-transform group-hover:scale-110", isApkActive ? "text-foreground" : "text-argent group-hover:text-foreground")} />
                <span>Android APK</span>
                <ChevronDown className={cn("h-3 w-3 transition-transform duration-300 text-argent group-hover:text-foreground", isApkActive && "text-foreground", isApkOpen && "rotate-180")} />
                {isApkActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-argent rounded-full shadow-[0_0_8px_#C0C2C0]" />
                )}
              </button>

              {/* Dropdown Menu Card */}
              <div
                className={cn(
                  "absolute left-0 mt-1 w-64 origin-top-left rounded-2xl border border-quartz/40 bg-jet/95 backdrop-blur-xl p-2.5 shadow-2xl transition-all duration-200 z-50 flex flex-col gap-1",
                  isApkOpen 
                    ? "opacity-100 translate-y-0 scale-100 visible" 
                    : "opacity-0 -translate-y-2 scale-95 invisible pointer-events-none"
                )}
              >
                {apkItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsApkOpen(false)}
                      className={cn(
                        "flex items-start gap-3 rounded-xl p-2 transition-all duration-200 hover:bg-quartz/15 group text-left",
                        isActive ? "bg-quartz/10 text-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <div className={cn(
                        "p-2 rounded-lg bg-quartz/10 border border-quartz/20 group-hover:bg-quartz/20 transition-all shrink-0",
                        isActive ? "border-argent text-foreground" : "text-argent group-hover:text-foreground"
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="font-bold text-xs text-foreground group-hover:text-foreground transition-colors truncate">{item.label}</span>
                        <span className="text-[10px] leading-normal text-dimgray group-hover:text-muted-foreground transition-colors line-clamp-2">{item.description}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Dropdown item for Signers */}
            <div 
              ref={signersRef}
              className="relative"
              onMouseEnter={() => setIsSignersOpen(true)}
              onMouseLeave={() => setIsSignersOpen(false)}
            >
              <button
                onClick={() => setIsSignersOpen(!isSignersOpen)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-2 transition-all duration-300 relative group cursor-pointer text-sm font-semibold focus:outline-none focus-visible:outline-none",
                  isSignersActive 
                    ? "text-foreground bg-quartz/20 shadow-inner" 
                    : "hover:bg-quartz/10 text-muted-foreground hover:text-foreground"
                )}
              >
                <PenTool className={cn("h-4 w-4 transition-transform group-hover:scale-110", isSignersActive ? "text-foreground" : "text-argent group-hover:text-foreground")} />
                <span>Signers</span>
                <ChevronDown className={cn("h-3 w-3 transition-transform duration-300 text-argent group-hover:text-foreground", isSignersActive && "text-foreground", isSignersOpen && "rotate-180")} />
                {isSignersActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-argent rounded-full shadow-[0_0_8px_#C0C2C0]" />
                )}
              </button>

              {/* Dropdown Menu Card */}
              <div
                className={cn(
                  "absolute left-0 mt-1 w-64 origin-top-left rounded-2xl border border-quartz/40 bg-jet/95 backdrop-blur-xl p-2.5 shadow-2xl transition-all duration-200 z-50 flex flex-col gap-1",
                  isSignersOpen 
                    ? "opacity-100 translate-y-0 scale-100 visible" 
                    : "opacity-0 -translate-y-2 scale-95 invisible pointer-events-none"
                )}
              >
                {signerItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsSignersOpen(false)}
                      className={cn(
                        "flex items-start gap-3 rounded-xl p-2 transition-all duration-200 hover:bg-quartz/15 group text-left",
                        isActive ? "bg-quartz/10 text-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <div className={cn(
                        "p-2 rounded-lg bg-quartz/10 border border-quartz/20 group-hover:bg-quartz/20 transition-all shrink-0",
                        isActive ? "border-argent text-foreground" : "text-argent group-hover:text-foreground"
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="font-bold text-xs text-foreground group-hover:text-foreground transition-colors truncate">{item.label}</span>
                        <span className="text-[10px] leading-normal text-dimgray group-hover:text-muted-foreground transition-colors line-clamp-2">{item.description}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
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

          {/* Theme Toggle Switcher */}
          <ThemeToggle />

          {/* Smart Device Detect / Intelligence */}
          <SmartDeviceDetect variant="navbar" />
        </div>
      </div>
    </header>
  );
}
