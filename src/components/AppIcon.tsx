'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface AppIconProps {
  src?: string;
  alt?: string;
  platform?: 'ios' | 'android' | string;
  className?: string;
  textClassName?: string;
}

export default function AppIcon({ src, alt, platform = 'ios', className, textClassName }: AppIconProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const isAndroid = 
    platform?.toLowerCase() === 'android' || 
    platform?.toLowerCase() === 'apk' ||
    platform?.toLowerCase()?.includes('android') ||
    platform?.toLowerCase()?.includes('apk');

  const labelText = isAndroid ? 'APK' : 'IPA';

  if (!src || hasError) {
    return (
      <div 
        className={cn(
          "flex h-full w-full items-center justify-center bg-quartz/10 text-argent select-none font-black transition-all border border-quartz/30 rounded-2xl",
          className
        )}
      >
        <span className={cn("text-xs font-black uppercase tracking-wider text-argent", textClassName)}>
          {labelText}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || ''}
      onError={() => setHasError(true)}
      className={cn("h-full w-full object-cover", className)}
    />
  );
}
