'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Smartphone, Monitor, Cpu, Sparkles, RefreshCw, Check, 
  AlertTriangle, HelpCircle, ShieldCheck, Activity, QrCode, 
  Laptop, Tablet, ExternalLink, Wifi, ShieldAlert, CheckCircle2
} from 'lucide-react';
import { CustomAppleIcon, CustomAndroidIcon } from '@/components/CustomIcons';
import { cn } from '@/lib/utils';

interface DeviceSpecs {
  os: 'iOS' | 'Android' | 'macOS' | 'Windows' | 'Linux' | 'Unknown';
  osVersion: string;
  browser: 'Safari' | 'Chrome' | 'Firefox' | 'Edge' | 'Opera' | 'Samsung Browser' | 'Unknown';
  resolution: string;
  pixelRatio: number;
  touchSupport: boolean;
  onlineStatus: boolean;
  cores: number | string;
  isMobile: boolean;
}

interface SmartDeviceDetectProps {
  variant?: 'navbar' | 'card';
  onDetect?: (os: 'ios' | 'android' | 'all') => void;
}

export default function SmartDeviceDetect({ variant = 'navbar', onDetect }: SmartDeviceDetectProps) {
  const [mounted, setMounted] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [specs, setSpecs] = useState<DeviceSpecs | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Run device detection
  const detectDevice = () => {
    if (typeof window === 'undefined') return;

    const ua = window.navigator.userAgent;
    const uaLower = ua.toLowerCase();
    
    // 1. Detect OS
    let os: DeviceSpecs['os'] = 'Unknown';
    let osVersion = 'Unknown';
    let isMobile = false;

    if (/iphone|ipad|ipod/.test(uaLower)) {
      os = 'iOS';
      isMobile = true;
      const match = ua.match(/OS (\d+)_(\d+)_?(\d+)?/);
      if (match) {
        osVersion = `iOS ${match[1]}.${match[2]}` + (match[3] ? `.${match[3]}` : '');
      } else {
        osVersion = 'iOS (Version Unknown)';
      }
    } else if (/android/.test(uaLower)) {
      os = 'Android';
      isMobile = true;
      const match = ua.match(/Android\s([0-9\.]+)/);
      if (match) {
        osVersion = `Android ${match[1]}`;
      } else {
        osVersion = 'Android (Version Unknown)';
      }
    } else if (/macintosh|mac os x/.test(uaLower)) {
      os = 'macOS';
      const match = ua.match(/Mac OS X\s([0-9_\.]+)/);
      if (match) {
        osVersion = `macOS ${match[1].replace(/_/g, '.')}`;
      } else {
        osVersion = 'macOS (Version Unknown)';
      }
    } else if (/windows/.test(uaLower)) {
      os = 'Windows';
      const match = ua.match(/Windows NT\s([0-9\.]+)/);
      if (match) {
        const verMap: Record<string, string> = {
          '10.0': '10/11',
          '6.3': '8.1',
          '6.2': '8',
          '6.1': '7'
        };
        osVersion = `Windows ${verMap[match[1]] || match[1]}`;
      } else {
        osVersion = 'Windows (Version Unknown)';
      }
    } else if (/linux/.test(uaLower)) {
      os = 'Linux';
      osVersion = 'Linux OS';
    }

    // 2. Detect Browser
    let browser: DeviceSpecs['browser'] = 'Unknown';
    if (/samsungbrowser/.test(uaLower)) {
      browser = 'Samsung Browser';
    } else if (/opr\/|opera/.test(uaLower)) {
      browser = 'Opera';
    } else if (/edg/.test(uaLower)) {
      browser = 'Edge';
    } else if (/firefox|iceweasel|fxios/.test(uaLower)) {
      browser = 'Firefox';
    } else if (/chrome|crios/.test(uaLower)) {
      browser = 'Chrome';
    } else if (/safari/.test(uaLower) && !/chrome|crios|android/.test(uaLower)) {
      browser = 'Safari';
    }

    // 3. Screen Specs
    const width = window.screen.width * window.devicePixelRatio;
    const height = window.screen.height * window.devicePixelRatio;
    const resolution = `${window.screen.width}x${window.screen.height} (Physical: ${width}x${height})`;
    
    const pixelRatio = window.devicePixelRatio || 1;
    const touchSupport = navigator.maxTouchPoints > 0;
    const onlineStatus = navigator.onLine;
    const cores = navigator.hardwareConcurrency || 'N/A';

    const detectedSpecs: DeviceSpecs = {
      os,
      osVersion,
      browser,
      resolution,
      pixelRatio,
      touchSupport,
      onlineStatus,
      cores,
      isMobile
    };

    setSpecs(detectedSpecs);

    // Dispatch detection event for ListingView integration
    const normalizedOS = os === 'iOS' ? 'ios' : os === 'Android' ? 'android' : 'all';
    
    // Trigger callback if provided
    if (onDetect) {
      onDetect(normalizedOS);
    }

    // Trigger custom event
    const event = new CustomEvent('device-detected', { detail: { os: normalizedOS } });
    window.dispatchEvent(event);
  };

  useEffect(() => {
    setMounted(true);
    detectDevice();

    // Listen to network changes
    const handleOnline = () => setSpecs(prev => prev ? { ...prev, onlineStatus: true } : null);
    const handleOffline = () => setSpecs(prev => prev ? { ...prev, onlineStatus: false } : null);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Click outside to close dropdown
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleRescan = () => {
    setScanning(true);
    setTimeout(() => {
      detectDevice();
      setScanning(false);
    }, 1500);
  };

  if (!mounted || !specs) {
    return variant === 'navbar' ? (
      <div className="h-9 w-28 rounded-full bg-quartz/10 border border-quartz/30 animate-pulse shrink-0" />
    ) : (
      <div className="w-full h-48 rounded-[2.5rem] bg-charleston/20 border border-quartz/20 animate-pulse flex items-center justify-center text-muted-foreground text-xs font-semibold">
        Detecting Intelligent System Environment...
      </div>
    );
  }

  // Calculate Sideload Compatibility Score
  let score = 30; // base score for desktop / others
  let statusText = 'Low Compatibility';
  let statusColor = 'text-red-500';
  let scoreColor = 'stroke-red-500';

  if (specs.os === 'Android') {
    score = 95;
    statusText = 'High (Native Side-Loading)';
    statusColor = 'text-matcha';
    scoreColor = 'stroke-matcha';
  } else if (specs.os === 'iOS') {
    score = 80;
    statusText = 'Optimized (ESign/KSign Required)';
    statusColor = 'text-almond';
    scoreColor = 'stroke-almond';
  } else if (specs.os === 'macOS') {
    score = 50;
    statusText = 'Moderate (Decrypted Tools)';
    statusColor = 'text-amber-500';
    scoreColor = 'stroke-amber-500';
  }

  // Current page URL for QR Code generator
  const currentUrl = typeof window !== 'undefined' ? window.location.origin + '/home' : '';

  // Get OS Icon
  const getOSIcon = (osName: DeviceSpecs['os'], sizeClass = "h-4 w-4") => {
    switch(osName) {
      case 'iOS':
        return <CustomAppleIcon className={sizeClass} />;
      case 'Android':
        return <CustomAndroidIcon className={sizeClass} />;
      case 'macOS':
        return <CustomAppleIcon className={sizeClass} />;
      case 'Windows':
        return <Monitor className={sizeClass} />;
      case 'Linux':
        return <Laptop className={sizeClass} />;
      default:
        return <Smartphone className={sizeClass} />;
    }
  };

  // Renders the compact Navbar indicator pill
  if (variant === 'navbar') {
    return (
      <div className="relative shrink-0" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] border transition-all cursor-pointer select-none",
            specs.os === 'iOS' 
              ? "bg-matcha/10 text-matcha border-matcha/30 hover:bg-matcha/20" 
              : specs.os === 'Android'
                ? "bg-almond/10 text-almond border-almond/30 hover:bg-almond/20"
                : "bg-quartz/10 text-argent border-quartz/30 hover:bg-quartz/20"
          )}
        >
          <div className="relative flex h-1.5 w-1.5">
            <span className={cn(
              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
              specs.os === 'iOS' ? "bg-matcha" : specs.os === 'Android' ? "bg-almond" : "bg-argent"
            )}></span>
            <span className={cn(
              "relative inline-flex rounded-full h-1.5 w-1.5",
              specs.os === 'iOS' ? "bg-matcha" : specs.os === 'Android' ? "bg-almond" : "bg-argent"
            )}></span>
          </div>
          {getOSIcon(specs.os, "h-3.5 w-3.5")}
          <span>{specs.os === 'iOS' || specs.os === 'Android' ? `${specs.os} Detected` : 'Device Intel'}</span>
        </button>

        {/* Dropdown panel */}
        {isOpen && (
          <div className="absolute right-0 mt-2.5 w-72 origin-top-right rounded-3xl border border-quartz/40 bg-jet/95 backdrop-blur-2xl p-5 shadow-2xl transition-all duration-300 z-50 flex flex-col gap-4 text-left">
            <div className="flex items-center justify-between border-b border-quartz/20 pb-3">
              <span className="text-[10px] uppercase font-black tracking-widest text-dimgray">Smart Device Detect</span>
              <span className={cn("text-[9px] font-black uppercase tracking-wider", specs.onlineStatus ? "text-matcha" : "text-red-500")}>
                {specs.onlineStatus ? 'Online' : 'Offline'}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                {getOSIcon(specs.os, "h-5 w-5 text-foreground")}
                <span className="font-black text-foreground text-sm uppercase leading-none">{specs.osVersion}</span>
              </div>
              <span className="text-[10px] text-dimgray font-medium pl-7">Browser: {specs.browser}</span>
            </div>

            <div className="flex flex-col gap-2 p-3 rounded-2xl bg-charleston/45 border border-quartz/20">
              <span className="text-[9px] font-black text-dimgray uppercase tracking-wider">Sideload Compatibility</span>
              <div className="flex items-center justify-between">
                <span className={cn("text-xs font-black uppercase", statusColor)}>{score}% - {specs.os === 'iOS' || specs.os === 'Android' ? 'Ready' : 'Limited'}</span>
              </div>
            </div>

            <div className="text-[10px] leading-relaxed text-dimgray font-medium bg-card/10 p-3 rounded-2xl border border-quartz/10">
              {specs.os === 'iOS' && "Recommended: Explore iOS IPA catalogs. Use KSign or ESign tool to sideload applications."}
              {specs.os === 'Android' && "Recommended: Direct download APK files. Ensure 'Install from Unknown Sources' is toggled in Android system settings."}
              {!(specs.os === 'iOS' || specs.os === 'Android') && "Recommended: Scan QR code or visit from iOS/Android mobile browser for immediate app ingestion."}
            </div>

            <button
              onClick={() => {
                setIsOpen(false);
                // Scroll to the device card component if it exists on page
                const el = document.getElementById('device-intel-dashboard');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl bg-quartz/10 border border-quartz/30 text-[10px] font-black uppercase tracking-widest text-argent hover:bg-quartz/20 transition-all cursor-pointer"
            >
              <span>View Full Analytics</span>
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // Renders the detailed Card Dashboard view
  return (
    <div 
      id="device-intel-dashboard"
      className="w-full rounded-[2.5rem] border border-quartz/30 bg-charleston/25 backdrop-blur-xl p-6 md:p-8 flex flex-col lg:flex-row items-stretch gap-8 relative overflow-hidden transition-all duration-300"
    >
      {/* Absolute radar sweep glow when scanning */}
      {scanning && (
        <div className="absolute inset-0 bg-gradient-to-r from-matcha/5 via-almond/5 to-matcha/5 animate-pulse pointer-events-none" />
      )}

      {/* 1. COMPATIBILITY CIRCLE SCORER */}
      <div className="flex flex-col items-center justify-center text-center p-4 bg-card/20 border border-quartz/20 rounded-[2rem] min-w-[200px] shrink-0">
        <span className="text-[10px] text-dimgray uppercase font-black tracking-widest mb-4">Sideload Rating</span>
        
        {/* Ring Gauge Container */}
        <div className="relative flex items-center justify-center h-28 w-28">
          {scanning ? (
            // Scanning spinner radar
            <div className="absolute inset-0 rounded-full border-4 border-dashed border-argent/20 animate-spin" style={{ animationDuration: '6s' }} />
          ) : (
            <svg className="absolute inset-0 h-full w-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background Circle */}
              <circle 
                className="stroke-quartz/20" 
                strokeWidth="8" 
                fill="transparent" 
                r="40" 
                cx="50" 
                cy="50" 
              />
              {/* Colored Gauge Ring */}
              <circle 
                className={cn("transition-all duration-1000 ease-out", scoreColor)}
                strokeWidth="8" 
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - score / 100)}`}
                strokeLinecap="round"
                fill="transparent" 
                r="40" 
                cx="50" 
                cy="50" 
              />
            </svg>
          )}

          {/* Core Status Content */}
          <div className="flex flex-col items-center justify-center">
            {scanning ? (
              <Activity className="h-8 w-8 text-argent animate-pulse" />
            ) : (
              <>
                <span className="text-3xl font-black text-foreground tracking-tight">{score}%</span>
                <span className="text-[8px] font-black uppercase text-dimgray tracking-wider mt-0.5">SCORE</span>
              </>
            )}
          </div>
        </div>

        <span className={cn("text-[11px] font-black uppercase tracking-wider mt-5 leading-none", statusColor)}>
          {scanning ? 'Computing System...' : statusText}
        </span>
      </div>

      {/* 2. SPECIFICATION MATRIX */}
      <div className="flex-1 flex flex-col justify-between gap-6">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-quartz/25 pb-3.5 mb-4">
            <div className="flex items-center gap-2.5">
              <Cpu className="h-5 w-5 text-argent" />
              <div>
                <h3 className="font-black text-foreground uppercase tracking-wider leading-none text-base">Smart Device Detect</h3>
                <span className="text-[9px] text-dimgray font-semibold uppercase tracking-widest mt-1 block">Live Environment Analytics</span>
              </div>
            </div>
            
            <button
              disabled={scanning}
              onClick={handleRescan}
              className={cn(
                "flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-quartz/40 bg-card/30 text-[10px] font-black uppercase tracking-widest text-foreground hover:bg-quartz/15 transition-all select-none",
                scanning && "opacity-50 cursor-not-allowed"
              )}
            >
              <RefreshCw className={cn("h-3.5 w-3.5", scanning && "animate-spin")} />
              <span>{scanning ? 'Scanning...' : 'Re-Scan System'}</span>
            </button>
          </div>

          {/* Tech Matrix Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            <div className="flex justify-between items-center py-1.5 border-b border-quartz/10 text-xs">
              <span className="text-dimgray font-semibold uppercase tracking-wider text-[10px]">Operating System</span>
              <span className="font-black text-foreground uppercase">{scanning ? '...' : specs.osVersion}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-quartz/10 text-xs">
              <span className="text-dimgray font-semibold uppercase tracking-wider text-[10px]">Client Browser</span>
              <span className="font-black text-foreground uppercase">{scanning ? '...' : specs.browser}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-quartz/10 text-xs">
              <span className="text-dimgray font-semibold uppercase tracking-wider text-[10px]">Screen Viewport</span>
              <span className="font-black text-foreground uppercase">{scanning ? '...' : specs.resolution}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-quartz/10 text-xs">
              <span className="text-dimgray font-semibold uppercase tracking-wider text-[10px]">Touch Interface</span>
              <span className="font-black text-foreground uppercase">{scanning ? '...' : (specs.touchSupport ? 'Enabled (Mobile)' : 'Disabled (Cursor)')}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-quartz/10 text-xs">
              <span className="text-dimgray font-semibold uppercase tracking-wider text-[10px]">CPU Core Count</span>
              <span className="font-black text-foreground uppercase">{scanning ? '...' : specs.cores} Threads</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-quartz/10 text-xs">
              <span className="text-dimgray font-semibold uppercase tracking-wider text-[10px]">Network Status</span>
              <span className={cn("font-black uppercase", specs.onlineStatus ? "text-matcha" : "text-red-500")}>
                {scanning ? '...' : (specs.onlineStatus ? 'Online/Fast' : 'Offline')}
              </span>
            </div>
          </div>
        </div>

        {/* 3. DYNAMIC ACTIONS & GUIDES */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch bg-card/25 border border-quartz/20 rounded-[2rem] p-5">
          <div className="flex-1 flex flex-col gap-2.5">
            <span className="text-[10px] text-dimgray uppercase font-black tracking-widest flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-argent animate-pulse" />
              <span>Platform Intelligence Recommendations</span>
            </span>

            {scanning ? (
              <div className="space-y-2 py-1">
                <div className="h-3 w-3/4 rounded bg-quartz/10 animate-pulse" />
                <div className="h-3 w-1/2 rounded bg-quartz/10 animate-pulse" />
              </div>
            ) : (
              <ul className="space-y-1.5 text-xs text-muted-foreground font-medium">
                {specs.os === 'iOS' && (
                  <>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-matcha shrink-0" />
                      <span>Auto-focused Mod catalog on **iOS IPA** apps & games.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-matcha shrink-0" />
                      <span>Use our **KSign** or **ESign** remote signer tools.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-argent shrink-0" />
                      <span>Supports AltStore, Scarlet, or direct TrollStore installation.</span>
                    </li>
                  </>
                )}
                {specs.os === 'Android' && (
                  <>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-matcha shrink-0" />
                      <span>Auto-focused Mod catalog on **Android APK** files.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-matcha shrink-0" />
                      <span>Modified packages compile with standard Android package installers.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-argent shrink-0" />
                      <span>Toggle on **"Install Unknown Sources"** in Android Settings.</span>
                    </li>
                  </>
                )}
                {!(specs.os === 'iOS' || specs.os === 'Android') && (
                  <>
                    <li className="flex items-center gap-2">
                      <ShieldAlert className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      <span>Desktop workstation detected. Sideload tools cannot install directly here.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-argent shrink-0" />
                      <span>Use this desktop view to search & download IPA/APK packages offline.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-almond shrink-0" />
                      <span>Scan the QR code to sign & install directly onto your mobile.</span>
                    </li>
                  </>
                )}
              </ul>
            )}
          </div>

          {/* QR Code Container for Desktop users */}
          {!(specs.os === 'iOS' || specs.os === 'Android') && !scanning && (
            <div className="flex items-center gap-4 p-3 rounded-2xl bg-jet/60 border border-quartz/30 self-center md:self-stretch shrink-0">
              <div className="relative bg-white p-1.5 rounded-xl border border-quartz/40 flex items-center justify-center shrink-0">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&color=212121&data=${encodeURIComponent(currentUrl)}`} 
                  alt="Desktop to Mobile Sync QR Code"
                  className="h-20 w-20 object-contain"
                  loading="lazy"
                />
              </div>
              <div className="flex flex-col justify-center max-w-[120px]">
                <div className="flex items-center gap-1.5 text-foreground font-black text-[9px] uppercase tracking-widest leading-none mb-1">
                  <QrCode className="h-3.5 w-3.5 text-almond" />
                  <span>Sync Mobile</span>
                </div>
                <p className="text-[9px] leading-normal text-dimgray font-semibold uppercase">
                  Scan code to shift to phone browser
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
