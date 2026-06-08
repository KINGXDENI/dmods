'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Zap, ArrowRight, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import AppIcon from '@/components/AppIcon';

export default function SearchOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
      setQuery('');
      setResults([]);
      setError(null);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setError(null);
      try {
        const res = await fetch(`/api/scrape-search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.success) {
          setResults(data.data || []);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError('Failed to fetch repository results.');
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (detailUrl: string) => {
    const cleanUrl = detailUrl.replace('https://ipaomtk.com/', '').replace(/\/$/, '');
    router.push(`/app/${cleanUrl}`);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4 sm:pt-40">
      <div 
        className="absolute inset-0 bg-thamar/90 backdrop-blur-xl animate-in fade-in duration-300"
        onClick={() => setIsOpen(false)}
      />
      
      <div className="relative w-full max-w-2xl animate-in zoom-in-95 slide-in-from-top-10 duration-300">
        <div className="bg-jet border border-quartz/50 rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] overflow-hidden">
          <div className="relative flex items-center p-6 border-b border-quartz/30">
            <Search className="h-6 w-6 text-argent absolute left-10" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for APK or IPA packages..."
              className="w-full bg-transparent pl-16 pr-10 py-4 text-xl font-bold text-foreground placeholder:text-dimgray focus:outline-none"
            />
            {query && (
              <button 
                type="button" 
                onClick={() => setQuery('')}
                className="absolute right-10 text-dimgray hover:text-argent transition-colors"
              >
                {isSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : <X className="h-5 w-5" />}
              </button>
            )}
          </div>

          <div className="max-h-[60vh] overflow-y-auto scrollbar-hide">
            {!query ? (
              <div className="flex flex-col gap-6 p-6 text-center py-12">
                <div className="flex justify-center gap-4">
                  <div className="px-3 py-1.5 rounded-xl bg-quartz/20 border border-quartz/30 text-[10px] font-black uppercase tracking-widest text-argent">Press ESC to exit</div>
                  <div className="px-3 py-1.5 rounded-xl bg-quartz/20 border border-quartz/30 text-[10px] font-black uppercase tracking-widest text-argent">CMD + K to toggle</div>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Popular Ingestions</h3>
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    {['Spotify', 'Minecraft', 'Instagram', 'YouTube', 'Clash Mod'].map(tag => (
                      <button 
                        key={tag}
                        onClick={() => setQuery(tag)}
                        className="px-4 py-2 rounded-full bg-thamar border border-quartz/40 text-[11px] font-bold text-argent hover:border-argent/50 transition-all active:scale-95"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : isSearching && results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-10 w-10 text-argent animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-dimgray animate-pulse">Scanning Remote Repository...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-destructive">
                <AlertCircle className="h-10 w-10 opacity-50" />
                <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
              </div>
            ) : results.length > 0 ? (
              <div className="flex flex-col p-2 gap-1">
                <div className="px-6 py-2">
                  <p className="text-[9px] font-black text-dimgray uppercase tracking-[0.3em]">Found {results.length} Package Matches</p>
                </div>
                {results.map((app, idx) => (
                  <div 
                    key={idx}
                    onClick={() => handleSelect(app.detailUrl)}
                    className="flex items-center gap-4 px-6 py-4 rounded-3xl bg-thamar/40 hover:bg-thamar border border-transparent hover:border-quartz/40 transition-all cursor-pointer group animate-in slide-in-from-bottom-2 fade-in duration-300"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="h-12 w-12 rounded-2xl overflow-hidden border border-quartz/30 bg-jet shrink-0">
                      <AppIcon 
                        src={app.iconUrl} 
                        alt={app.title}
                        platform={app.platform}
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-foreground text-sm truncate">{app.title}</h4>
                        <span className={cn(
                          "text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full border",
                          app.platform === 'ios' ? "text-argent border-argent/30 bg-argent/5" : "text-dimgray border-dimgray/30 bg-dimgray/5"
                        )}>
                          {app.platform === 'ios' ? 'IPA' : 'APK'}
                        </span>
                      </div>
                      <p className="text-[10px] text-dimgray font-bold uppercase tracking-tight truncate">{app.category} • {app.size || app.version}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-dimgray group-hover:translate-x-1 group-hover:text-argent transition-all" />
                  </div>
                ))}
              </div>
            ) : !isSearching && (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-dimgray">
                <Sparkles className="h-10 w-10 opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] italic">No local matching payload found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
