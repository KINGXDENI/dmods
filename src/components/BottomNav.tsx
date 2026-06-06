'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PenTool, ChevronUp } from 'lucide-react';
import { CustomAppleIcon, CustomAndroidIcon } from '@/components/CustomIcons';
import { cn } from '@/lib/utils';

export default function BottomNav() {
  const pathname = usePathname();
  const [activeMenu, setActiveMenu] = useState<'ios' | 'android' | 'sign' | null>(null);

  const navItems = [
    { 
      id: 'home', 
      href: '/home', 
      label: 'Home', 
      icon: Home,
      isActive: pathname === '/home'
    },
    { 
      id: 'ios', 
      label: 'iOS IPA', 
      icon: CustomAppleIcon, 
      iconColor: 'text-argent',
      isActive: ['/apps', '/games'].includes(pathname),
      subItems: [
        { href: '/apps', label: 'IPA Apps' },
        { href: '/games', label: 'IPA Games' }
      ]
    },
    { 
      id: 'android', 
      label: 'Android', 
      icon: CustomAndroidIcon, 
      iconColor: 'text-argent',
      isActive: ['/apk-apps', '/apk-game'].includes(pathname),
      subItems: [
        { href: '/apk-apps', label: 'APK Apps' },
        { href: '/apk-game', label: 'APK Games' }
      ]
    },
    { 
      id: 'sign', 
      label: 'Signers', 
      icon: PenTool, 
      iconColor: 'text-white',
      isActive: ['/esign', '/ksign'].includes(pathname),
      subItems: [
        { href: '/esign', label: 'ESign iOS' },
        { href: '/ksign', label: 'KSign iOS' }
      ]
    }
  ];

  return (
    <>
      {/* Backdrop overlay to close submenus when tapping outside */}
      {activeMenu && (
        <div 
          className="fixed inset-0 z-30 bg-black/5 backdrop-blur-[1px] md:hidden"
          onClick={() => setActiveMenu(null)}
        />
      )}

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/40 bg-card/85 backdrop-blur-xl md:hidden">
        <nav className="flex h-16 items-center justify-around px-2 relative">
          {navItems.map((item) => {
            const isActive = item.isActive;
            const Icon = item.icon;
            
            return (
              <div key={item.id} className="relative flex-1 flex justify-center">
                {/* Floating Hub Submenu */}
                {item.subItems && activeMenu === item.id && (
                  <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-40 bg-card/95 backdrop-blur-2xl border border-quartz/50 rounded-2xl p-2 flex flex-col gap-1 w-32 shadow-[0_15px_30px_rgba(0,0,0,0.6)] animate-in fade-in slide-in-from-bottom-2 duration-200">
                    {/* Small pointer triangle */}
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-card border-r border-b border-quartz/50" />
                    
                    {item.subItems.map((sub) => {
                      const isSubActive = pathname === sub.href;
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={() => setActiveMenu(null)}
                          className={cn(
                            "w-full px-3 py-2.5 rounded-xl text-left text-[9px] font-black uppercase tracking-wider transition-all",
                            isSubActive 
                              ? "bg-argent text-thamar font-black" 
                              : "text-muted-foreground hover:text-argent active:text-white hover:bg-quartz/10"
                          )}
                        >
                          {sub.label}
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* Main Button Trigger */}
                {item.href ? (
                  <Link 
                    href={item.href}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 w-full h-12 rounded-xl transition-all duration-300 relative",
                      isActive 
                        ? "text-argent bg-quartz/10" 
                        : "text-muted-foreground hover:text-argent active:text-argent"
                    )}
                    style={{ minWidth: '44px', minHeight: '44px' }}
                  >
                    {isActive && (
                      <div className="absolute -top-2 w-8 h-1 bg-argent rounded-full shadow-[0_0_12px_#A7A7A7]" />
                    )}
                    <Icon className={cn("h-5 w-5 transition-all", isActive ? "scale-110" : "text-argent")} />
                    <span className={cn("text-[9px] font-black uppercase tracking-tighter", isActive ? "opacity-100" : "opacity-70")}>
                      {item.label}
                    </span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveMenu(activeMenu === item.id ? null : (item.id as any))}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 w-full h-12 rounded-xl transition-all duration-300 relative cursor-pointer",
                      isActive 
                        ? "text-argent bg-quartz/10" 
                        : "text-muted-foreground hover:text-argent active:text-argent"
                    )}
                    style={{ minWidth: '44px', minHeight: '44px' }}
                  >
                    {isActive && (
                      <div className="absolute -top-2 w-8 h-1 bg-argent rounded-full shadow-[0_0_12px_#A7A7A7]" />
                    )}
                    <div className="relative flex items-center justify-center">
                      <Icon className={cn("h-5 w-5 transition-all", isActive ? "scale-110 " + (item.iconColor || "text-white") : "text-argent")} />
                      <ChevronUp className={cn("h-3 w-3 ml-0.5 opacity-60 transition-transform duration-200", activeMenu === item.id && "rotate-180")} />
                    </div>
                    <span className={cn("text-[9px] font-black uppercase tracking-tighter", isActive ? "opacity-100" : "opacity-70")}>
                      {item.label}
                    </span>
                  </button>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </>
  );
}
