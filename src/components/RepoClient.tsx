'use client';

import { useState, useEffect } from 'react';
import { Copy, Check, ExternalLink, ShieldCheck, Database, Layers, Rss, ArrowRight, BookOpen } from 'lucide-react';
import { CustomAppleIcon } from '@/components/CustomIcons';
import { cn } from '@/lib/utils';

export default function RepoClient() {
  const [origin, setOrigin] = useState('https://dmods.app');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const repos = [
    {
      name: 'AltStore / SideStore',
      id: 'altstore',
      description: 'Standard source repository for AltStore, SideStore, and compatible iOS sideloaders.',
      icon: Layers,
      color: 'from-amber-500/20 to-orange-500/20 border-orange-500/30 text-orange-500',
      url: `${origin}/api/repo/altstore`,
      deepLink: `altstore://source?url=${encodeURIComponent(`${origin}/api/repo/altstore`)}`,
      oneClickText: 'Add to AltStore',
      steps: [
        'Tap the "Add to AltStore" button above (or copy the URL manually).',
        'Open AltStore and navigate to the "Sources" tab.',
        'Tap the "+" icon in the top-left corner.',
        'Enter the copied URL and tap "Add Source".'
      ]
    },
    {
      name: 'Scarlet Repo',
      id: 'scarlet',
      description: 'Optimized catalog feed for the Scarlet iOS Installer with category grouping.',
      icon: Rss,
      color: 'from-red-500/20 to-rose-500/20 border-rose-500/30 text-rose-500',
      url: `${origin}/api/repo/scarlet`,
      deepLink: `scarlet://repo-add?url=${encodeURIComponent(`${origin}/api/repo/scarlet`)}`,
      oneClickText: 'Add to Scarlet',
      steps: [
        'Copy the Scarlet repository URL (or tap "Add to Scarlet" to attempt deep linking).',
        'Open Scarlet and go to the search tab (or tap the bottom center button).',
        'Long-press the "Install" button in the top-right corner to open menu.',
        'Select "Add Repo" and paste the URL.'
      ]
    },
    {
      name: 'ESign / KSign Source',
      id: 'esign',
      description: 'Custom app-source feed for ESign, KSign, and on-device enterprise signers.',
      icon: Database,
      color: 'from-blue-500/20 to-cyan-500/20 border-cyan-500/30 text-cyan-500',
      url: `${origin}/api/repo/esign`,
      deepLink: null,
      oneClickText: null,
      steps: [
        'Copy the ESign/KSign repository URL above.',
        'Open the ESign app and tap the "AppStore" tab at the bottom.',
        'Tap "App Source" (or settings icon) in the header.',
        'Tap "+" in the top-right, paste the URL, and select "Add".'
      ]
    }
  ];

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-background text-foreground overflow-x-hidden flex flex-col items-center py-12 px-4 sm:px-6">
      {/* Background Radial Glow */}
      <div className="absolute top-[-20%] left-[10%] w-[80%] h-[60%] rounded-full bg-radial from-quartz/10 to-transparent pointer-events-none blur-[120px] z-0" />

      <div className="max-w-5xl w-full flex flex-col gap-10 relative z-10">
        
        {/* Header */}
        <header className="flex flex-col items-center text-center gap-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-argent/10 border border-argent/20 rounded-full shadow-[0_0_15px_rgba(192,194,192,0.1)]">
            <CustomAppleIcon className="h-3.5 w-3.5 text-argent animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-argent">iOS Sideloading</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-foreground via-argent to-white">
            Repo Integration
          </h1>
          <p className="max-w-2xl text-xs sm:text-sm text-dimgray font-medium leading-relaxed">
            Add DMods directly as a repository source in your favorite iOS installer app. 
            Enjoy our full catalog of premium tweaked IPA apps with on-device updates and no computer needed.
          </p>
        </header>

        {/* Grid Layout of Repo Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {repos.map((repo, idx) => {
            const Icon = repo.icon;
            const isCopied = copiedIndex === idx;

            return (
              <div 
                key={repo.id}
                className="flex flex-col rounded-[2.5rem] border border-quartz/30 bg-jet/20 backdrop-blur-xl p-6 relative group transition-all duration-300 hover:border-quartz/60 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40"
              >
                {/* Header Icon + Info */}
                <div className="flex items-center gap-3.5 mb-4">
                  <div className={cn("p-2.5 rounded-2xl border bg-gradient-to-br flex items-center justify-center shrink-0", repo.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-black text-sm uppercase tracking-wide text-foreground">{repo.name}</h2>
                    <span className="text-[9px] font-black uppercase tracking-widest text-argent bg-quartz/15 px-2 py-0.5 rounded-full">
                      Source Feed
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-dimgray leading-relaxed mb-6 font-medium">
                  {repo.description}
                </p>

                {/* Input with Copy Control */}
                <div className="flex flex-col gap-2.5 mb-6 mt-auto">
                  <span className="text-[8px] font-black uppercase tracking-wider text-dimgray select-none">
                    Repository Address URL:
                  </span>
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-quartz/20">
                    <input 
                      type="text" 
                      readOnly 
                      value={repo.url} 
                      className="bg-transparent text-[9px] font-mono px-2 py-1 text-lightgray flex-1 outline-none select-all"
                    />
                    <button
                      onClick={() => handleCopy(repo.url, idx)}
                      className={cn(
                        "p-2 rounded-lg transition-all active:scale-95 cursor-pointer shrink-0 border",
                        isCopied 
                          ? "bg-green-500/20 border-green-500/40 text-green-500" 
                          : "bg-quartz/10 border-quartz/20 text-argent hover:bg-quartz/20"
                      )}
                      title="Copy URL"
                    >
                      {isCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                </div>

                {/* One Click Install Button */}
                {repo.deepLink && (
                  <a
                    href={repo.deepLink}
                    className="flex items-center justify-center gap-2 py-3.5 bg-argent hover:bg-white text-thamar rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-[0.98] shadow-md shadow-black/30 mb-6"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    {repo.oneClickText}
                  </a>
                )}

                {/* Instruction Steps */}
                <div className="border-t border-quartz/20 pt-4 flex flex-col gap-3">
                  <div className="flex items-center gap-1.5 text-dimgray select-none">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-wider">Installation steps:</span>
                  </div>
                  <ol className="flex flex-col gap-2.5">
                    {repo.steps.map((step, sIdx) => (
                      <li key={sIdx} className="flex gap-2 text-[10px] leading-relaxed text-dimgray font-medium">
                        <span className="font-mono text-argent font-black select-none">{sIdx + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            );
          })}
        </section>

        {/* Security & Updates Disclaimer */}
        <footer className="rounded-[3rem] border border-quartz/30 bg-jet/10 backdrop-blur-md p-8 flex flex-col sm:flex-row items-center gap-6">
          <div className="p-3 bg-argent/10 border border-argent/20 rounded-2xl shrink-0">
            <ShieldCheck className="h-6 w-6 text-argent" />
          </div>
          <div className="flex flex-col gap-1.5 text-center sm:text-left">
            <h3 className="font-black text-foreground text-sm uppercase tracking-wide">Dynamic redirectional links</h3>
            <p className="text-[11px] text-dimgray leading-relaxed font-medium">
              We resolve the original file mirrors and auto-signing links dynamically in real-time when your installer initiates a download. 
              This ensures your device fetches the freshest certificates without clogging the client app's repo fetches.
            </p>
          </div>
        </footer>

      </div>
    </div>
  );
}
