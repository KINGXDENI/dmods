'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home } from 'lucide-react';
import { CustomAppleIcon, CustomAndroidIcon } from '@/components/CustomIcons';
import { cn } from '@/lib/utils';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/home', label: 'Home', icon: Home },
    { href: '/apps', label: 'IPA Apps', icon: CustomAppleIcon, iconColor: 'text-argent' },
    { href: '/esign', label: 'ESign', icon: CustomAppleIcon, iconColor: 'text-white' },
    { href: '/ksign', label: 'KSign', icon: CustomAppleIcon, iconColor: 'text-white/80' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/40 bg-card/80 backdrop-blur-lg md:hidden">
      <nav className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link 
              key={item.href}
              href={item.href} 
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-16 h-12 rounded-xl transition-all duration-300 relative",
                isActive 
                  ? "text-argent bg-quartz/10" 
                  : "text-muted-foreground hover:text-argent active:text-argent"
              )}
              style={{ minWidth: '44px', minHeight: '44px' }}
            >
              {isActive && (
                <div className="absolute -top-2 w-8 h-1 bg-argent rounded-full shadow-[0_0_12px_#A7A7A7]" />
              )}
              <Icon className={cn("h-5.5 w-5.5 transition-all", isActive ? "scale-110 " + (item.iconColor || "text-white") : "text-argent")} />
              <span className={cn("text-[9px] font-black uppercase tracking-tighter", isActive ? "opacity-100" : "opacity-70")}>
                {item.label.split(' ')[0]} {/* Show only first word on mobile to save space */}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
