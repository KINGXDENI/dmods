'use client';

import React, { useState } from 'react';
import { 
  Search, 
  ShieldCheck, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  FileArchive, 
  Info,
  Layers,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { CustomAppleIcon } from '@/components/CustomIcons';
import type { KsignScrapedData, KsignCertificate } from '@/lib/scraper';

interface KsignClientViewProps {
  scrapedData: KsignScrapedData;
}

export default function KsignClientView({ scrapedData }: KsignClientViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter certificates based on search query
  const filteredCertificates = scrapedData.certificates.filter(cert => {
    const query = searchQuery.toLowerCase();
    const matchesName = cert.certName.toLowerCase().includes(query);
    const matchesTitle = cert.details?.appTitle?.toLowerCase().includes(query) || false;
    const matchesBundle = cert.details?.bundleIdentifier?.toLowerCase().includes(query) || false;
    return matchesName || matchesTitle || matchesBundle;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 flex flex-col gap-10">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-border/40 bg-card/40 p-8 sm:p-10 flex flex-col gap-4 shadow-sm">
        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
          <CustomAppleIcon className="h-48 w-48 text-argent" />
        </div>
        <div className="flex items-center gap-2 text-argent font-bold text-xs uppercase tracking-[0.2em]">
          <Sparkles className="h-4 w-4 text-argent animate-pulse" />
          <span>iOS Sideloading Hub</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-foreground max-w-2xl leading-none">
          KSign <span className="text-argent">Signer</span> Hub
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-2xl leading-relaxed">
          The ultimate iOS application signer. Sideload and install customizable IPA packages directly on your iPhone or iPad with certificate management and anti-revoke DNS security.
        </p>
      </section>

      {/* 2. Quick Tools Grid */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xs uppercase font-black tracking-widest text-dimgray">
          Required Sideloading Tools
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Tool 1: Anti-Revoke DNS Profile */}
          <div className="group relative overflow-hidden rounded-3xl border border-border/30 bg-card p-6 flex flex-col justify-between h-56 hover:border-argent/40 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-quartz/20 border border-border/20 text-argent">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <span className="text-[9px] uppercase font-black tracking-widest text-argent px-2 py-0.5 rounded bg-quartz/20 border border-border/10">
                DNS Profile
              </span>
            </div>
            <div className="mt-4 flex-1">
              <h3 className="font-bold text-foreground text-lg leading-tight group-hover:text-argent transition-colors">
                KSign Anti-Revoke DNS
              </h3>
              <p className="text-muted-foreground text-xs mt-2 line-clamp-2">
                Download the configuration profile to block Apple's OCSP server endpoints and extend your sideloaded apps' lifespan.
              </p>
            </div>
            <a 
              href={scrapedData.dnsProfile}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-xs font-bold text-thamar bg-argent hover:bg-white px-4 py-2.5 rounded-full transition-all duration-300 w-full mt-4 active:scale-95"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Install DNS Profile</span>
            </a>
          </div>

          {/* Tool 2: Certificates ZIP */}
          <div className="group relative overflow-hidden rounded-3xl border border-border/30 bg-card p-6 flex flex-col justify-between h-56 hover:border-argent/40 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-quartz/20 border border-border/20 text-argent">
                <FileArchive className="h-6 w-6" />
              </div>
              <span className="text-[9px] uppercase font-black tracking-widest text-argent px-2 py-0.5 rounded bg-quartz/20 border border-border/10">
                ZIP Archive
              </span>
            </div>
            <div className="mt-4 flex-1">
              <h3 className="font-bold text-foreground text-lg leading-tight group-hover:text-argent transition-colors">
                All Certificates ZIP
              </h3>
              <p className="text-muted-foreground text-xs mt-2 line-clamp-2">
                Download all p12 keys and mobileprovision pairing profiles combined in a single zip file for manual imports.
              </p>
            </div>
            <a 
              href={scrapedData.certsZip}
              className="flex items-center justify-center gap-2 text-xs font-bold text-argent bg-charleston border border-border/40 hover:bg-quartz/20 px-4 py-2.5 rounded-full transition-all duration-300 w-full mt-4 active:scale-95"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download ZIP</span>
            </a>
          </div>

        </div>
      </section>

      {/* 3. Step-by-Step Installation Guide */}
      <section className="rounded-3xl border border-border/30 bg-card/20 p-6 flex flex-col gap-6">
        <div className="flex items-center gap-2 border-b border-border/10 pb-4">
          <Info className="h-5 w-5 text-argent" />
          <h3 className="font-bold uppercase tracking-wider text-sm text-foreground">
            KSign Sideload Guide &amp; Extraction
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-quartz/30 border border-border/20 text-xs font-black text-foreground">
              1
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="text-xs font-bold text-foreground">Anti-Revoke DNS</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Download the anti-revoke profile and configure it in iOS settings first.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-quartz/30 border border-border/20 text-xs font-black text-foreground">
              2
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="text-xs font-bold text-foreground">Install KSign</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Select an **Active** certificate below and click "Direct Install".
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-quartz/30 border border-border/20 text-xs font-black text-foreground">
              3
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="text-xs font-bold text-foreground">Trust Certificate</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Trust the profile in iOS Settings &gt; General &gt; VPN &amp; Device Management.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-quartz/30 border border-border/20 text-xs font-black text-foreground">
              4
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="text-xs font-bold text-foreground">Extract Certificates</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Download the ZIP archive and extract it in the Files app to import matching profiles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Certificates Section */}
      <section className="flex flex-col gap-6">
        
        {/* Search & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-black uppercase tracking-wider text-foreground">
              KSign Signing Certificates
            </h2>
            <p className="text-xs text-muted-foreground">
              Directly install KSign signed with any active enterprise certificates below.
            </p>
          </div>
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search certificates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-11 pr-4 rounded-xl bg-card/40 border border-border/40 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-argent focus:border-argent text-sm transition-all"
            />
          </div>
        </div>

        {/* Certificate Cards List */}
        {filteredCertificates.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border/30 rounded-3xl bg-card/10">
            <CustomAppleIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="font-bold text-foreground text-sm">No Certificates Found</h3>
            <p className="text-xs text-muted-foreground mt-1">Try modifying your search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCertificates.map((cert, index) => {
              const directInstallUrl = cert.details?.plistUrl 
                ? `itms-services://?action=download-manifest&url=${encodeURIComponent(cert.details.plistUrl)}`
                : cert.shortUrl;

              const isRevoked = !cert.resolved && cert.error?.includes('revoked');

              return (
                <div 
                  key={cert.certName + index}
                  className={`rounded-3xl border bg-card p-6 flex flex-col justify-between gap-6 transition-all duration-300 ${
                    isRevoked 
                      ? 'border-red-950/40 opacity-70 hover:opacity-100 hover:border-red-900/60' 
                      : 'border-border/30 hover:border-argent/40'
                  }`}
                >
                  <div className="flex gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-argent ${
                      isRevoked ? 'bg-red-950/20 border-red-900/40 text-red-400' : 'bg-quartz/20 border-border/20'
                    }`}>
                      <CustomAppleIcon className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {isRevoked ? (
                          <>
                            <AlertTriangle className="h-3 w-3 text-red-500" />
                            <span className="text-[10px] font-black uppercase tracking-wider text-red-500">
                              Revoked / Expired
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10B981]" />
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500">
                              Signed &amp; Active
                            </span>
                          </>
                        )}
                      </div>
                      <h3 className="font-bold text-foreground text-sm leading-tight break-words pr-2">
                        {cert.certName}
                      </h3>
                      {cert.resolved && cert.details && (
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[10px] font-semibold text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Layers className="h-3 w-3 shrink-0" />
                            ID: <code className="bg-charleston px-1 py-0.5 rounded text-[9px] text-argent border border-border/10 font-mono">{cert.details.bundleIdentifier}</code>
                          </span>
                          <span>•</span>
                          <span>Version: {cert.details.bundleVersion}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border/10">
                    
                    {/* Direct Install */}
                    <a 
                      href={directInstallUrl}
                      onClick={(e) => {
                        if (isRevoked) {
                          e.preventDefault();
                          alert('This certificate has been revoked and cannot be installed.');
                        }
                      }}
                      className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full transition-all active:scale-95 ${
                        isRevoked 
                          ? 'bg-charleston text-muted-foreground cursor-not-allowed border border-border/10' 
                          : 'bg-argent text-thamar hover:bg-white'
                      }`}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>{isRevoked ? 'Unavailable' : 'Direct Install'}</span>
                    </a>

                    {/* Copy PLIST link / Get IPA */}
                    <div className="flex gap-2">
                      {cert.resolved && cert.details?.ipaUrl && (
                        <a 
                          href={cert.details.ipaUrl}
                          title="Download Raw IPA file"
                          className="flex items-center justify-center h-9 w-9 rounded-full bg-charleston border border-border/40 text-argent hover:bg-quartz/20 transition-all active:scale-95 shrink-0"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      )}
                      
                      <button
                        onClick={() => handleCopy(cert.details?.plistUrl || cert.shortUrl, cert.certName + index)}
                        disabled={isRevoked}
                        title="Copy Manifest PLIST Link"
                        className="flex items-center justify-center h-9 w-9 rounded-full bg-charleston border border-border/40 text-argent hover:bg-quartz/20 transition-all active:scale-95 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {copiedId === cert.certName + index ? (
                          <Check className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </section>

    </div>
  );
}
