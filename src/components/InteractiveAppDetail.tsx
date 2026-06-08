'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, Download, ShieldCheck, Calendar, Cpu, HardDrive, User, Tag, ExternalLink, PenTool, Share2, Terminal, Loader2, Check, Sparkles, Link as LinkIcon, Trash2, UploadCloud, ShieldAlert } from 'lucide-react';
import { CustomAndroidIcon } from '@/components/CustomIcons';
import { cn } from '@/lib/utils';
import AppIcon from '@/components/AppIcon';

interface InteractiveAppDetailProps {
  data: any;
  targetPath: string;
  isDownloadPage?: boolean;
}

export default function InteractiveAppDetail({ data, targetPath, isDownloadPage }: InteractiveAppDetailProps) {
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptStep, setDecryptStep] = useState(0);
  const [pendingUrl, setPendingUrl] = useState('');
  const [showShareToast, setShowShareToast] = useState(false);

  // Auto-signing States
  const [serverCerts, setServerCerts] = useState<any[]>([]);
  const [selectedCert, setSelectedCert] = useState('');
  const [certMode, setCertMode] = useState<'server' | 'saved' | 'upload'>('server');
  const [savedToken, setSavedToken] = useState<string | null>(null);

  const [p12File, setP12File] = useState<File | null>(null);
  const [provisionFile, setProvisionFile] = useState<File | null>(null);
  const [certPassword, setCertPassword] = useState('');
  const [saveTokenOption, setSaveTokenOption] = useState(true);

  const [signStatus, setSignStatus] = useState<'idle' | 'signing' | 'done' | 'error'>('idle');
  const [signProgress, setSignProgress] = useState('');
  const [signedOtaLink, setSignedOtaLink] = useState('');
  const [errMessage, setErrMessage] = useState('');

  const decryptMessages = [
    "Establishing secure handshake...",
    "Bypassing checksum validation...",
    "Injecting temporary certificates...",
    "Decrypting payload segments...",
    "Finalizing secure link redirection..."
  ];

  useEffect(() => {
    if (isDecrypting) {
      const interval = setInterval(() => {
        setDecryptStep((prev) => {
          if (prev >= decryptMessages.length - 1) {
            clearInterval(interval);
            setTimeout(() => {
              window.location.href = pendingUrl;
              setIsDecrypting(false);
            }, 800);
            return prev;
          }
          return prev + 1;
        });
      }, 700);
      return () => clearInterval(interval);
    }
  }, [isDecrypting, pendingUrl]);

  useEffect(() => {
    if (isDownloadPage) {
      // Load saved token from localStorage
      const token = localStorage.getItem('saved_cert_token');
      const expires = localStorage.getItem('saved_cert_expires_at');
      if (token && expires && new Date(expires) > new Date()) {
        setSavedToken(token);
        setCertMode('saved');
      } else {
        localStorage.removeItem('saved_cert_token');
        localStorage.removeItem('saved_cert_expires_at');
      }

      // Fetch active enterprise certificates
      fetch('/api/sign-proxy?action=certs')
        .then(res => res.json())
        .then(resData => {
          const certsList = resData.certificates || resData.certs || [];
          if (Array.isArray(certsList)) {
            const mappedCerts = certsList.map((c: any) => ({
              text: c.name || c.text || '',
              value: c.id || c.file || c.value || ''
            }));
            setServerCerts(mappedCerts);
            if (mappedCerts.length > 0) {
              setSelectedCert(mappedCerts[0].value);
            }
          }
        })
        .catch(err => {
          console.error("Failed to load signing certificates", err);
        });
    }
  }, [isDownloadPage]);

  const pollSignStatus = (jobId: string) => {
    let attempts = 0;
    const maxAttempts = 120; // 5 minutes max
    
    const interval = setInterval(async () => {
      attempts++;
      if (attempts > maxAttempts) {
        clearInterval(interval);
        setSignStatus('error');
        setErrMessage('Signing process timed out. Please try again.');
        return;
      }

      try {
        const res = await fetch(`/api/sign-proxy?action=status&job=${jobId}`);
        const data = await res.json();
        
        if (!data.ok) {
          clearInterval(interval);
          setSignStatus('error');
          setErrMessage(data.error || 'Polling status error.');
          return;
        }

        if (data.status === 'done') {
          clearInterval(interval);
          setSignStatus('done');
          setSignProgress('Signing completed successfully!');
          if (data.link) {
            setSignedOtaLink(data.link);
            window.location.href = data.link;
          } else {
            setErrMessage('No installation manifest generated.');
            setSignStatus('error');
          }
        } else if (data.status === 'error') {
          clearInterval(interval);
          setSignStatus('error');
          setErrMessage(data.progress || 'An error occurred during signing.');
        } else {
          setSignProgress(data.progress || 'Signing in progress...');
        }
      } catch (err: any) {
        console.warn("Polling status error:", err);
      }
    }, 2500);
  };

  const handleExecuteSigning = async (option: any) => {
    if (!option.autoSignParams) return;
    
    setSignStatus('signing');
    setSignProgress('Initializing connection to signer...');
    setErrMessage('');
    setSignedOtaLink('');

    try {
      if (certMode === 'server' || certMode === 'saved') {
        const formData = new FormData();
        formData.append('ipa_url', option.autoSignParams.ipaUrl);
        formData.append('app_name', option.autoSignParams.appName);
        formData.append('certificate_mode', certMode);
        formData.append('bundle', 'com.ipaomtk.auto');
        
        if (certMode === 'server') {
          formData.append('server_certificate', selectedCert);
        } else if (certMode === 'saved' && savedToken) {
          formData.append('saved_cert_token', savedToken);
        }

        const startRes = await fetch('/api/sign-proxy?action=start', {
          method: 'POST',
          body: formData
        });
        
        const startData = await startRes.json();
        if (!startData.ok) {
          throw new Error(startData.error || 'Failed to start signing process.');
        }

        const jobId = startData.jobId;
        setSignProgress('Job queued. Waiting in line...');
        pollSignStatus(jobId);
      } else {
        if (!p12File || !provisionFile) {
          throw new Error('Please upload both .p12 and .mobileprovision files.');
        }

        const formData = new FormData();
        formData.append('certificate_mode', 'upload');
        formData.append('p12', p12File);
        formData.append('mobileprovision', provisionFile);
        formData.append('password', certPassword);
        formData.append('save_certificate', saveTokenOption ? '1' : '0');
        formData.append('bundle', 'com.ipaomtk.auto');
        formData.append('mode', 'remote_ipa');
        formData.append('ipa_url', option.autoSignParams.ipaUrl);
        formData.append('app_name', option.autoSignParams.appName);

        setSignProgress('Uploading certificates and compiling signed package...');

        const mergeRes = await fetch('/api/sign-proxy?action=merge', {
          method: 'POST',
          body: formData
        });

        const mergeData = await mergeRes.json();
        if (!mergeData.ok) {
          throw new Error(mergeData.error || 'Failed to sign with uploaded certificate.');
        }

        if (saveTokenOption && mergeData.savedCertToken) {
          localStorage.setItem('saved_cert_token', mergeData.savedCertToken);
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 5);
          localStorage.setItem('saved_cert_expires_at', expiryDate.toISOString());
          setSavedToken(mergeData.savedCertToken);
        }

        const installUrl = mergeData.link || (mergeData.app && mergeData.app.installUrl);
        if (installUrl) {
          setSignedOtaLink(installUrl);
          setSignStatus('done');
          setSignProgress('Signing complete! Redirecting to installer...');
          window.location.href = installUrl;
        } else {
          throw new Error('Installer URL not returned by signing server.');
        }
      }
    } catch (err: any) {
      console.error(err);
      setSignStatus('error');
      setErrMessage(err.message || 'Signature injection failed.');
    }
  };

  const handleDownloadClick = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    if (url.startsWith('https://ipaomtk.com/download/')) {
        // Let normal navigation happen for download page links
        return;
    }
    e.preventDefault();
    setPendingUrl(url);
    setIsDecrypting(true);
    setDecryptStep(0);
  };

  const handleShare = async () => {
    const shareData = {
      title: `Get ${data.appName} Mod on DMods`,
      text: `🔥 Download ${data.appName} ${data.version ? `(v${data.version})` : ''} - Premium Unlocked on DMods. Secure & High Speed.`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text}\n\nLink: ${shareData.url}`);
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 3000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const isAndroid = targetPath.startsWith('apk') || (data.category && data.category.toLowerCase().includes('apk')) || (data.getItOn && data.getItOn.toLowerCase().includes('google'));
  const platformLabel = isAndroid ? 'Android' : 'iOS';

  return (
    <div className="relative min-h-screen">
      {/* Adaptive Background Glow */}
      {data.iconUrl && (
        <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
          <img
            src={data.iconUrl}
            alt=""
            className="h-full w-full object-cover blur-[140px] opacity-[0.2] scale-150"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-thamar/60 backdrop-blur-[4px]" />
        </div>
      )}

      {/* Decryption Overlay */}
      {isDecrypting && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-thamar/90 backdrop-blur-2xl animate-in fade-in duration-500">
          <div className="w-full max-w-md p-10 flex flex-col gap-8 text-center">
            <div className="relative mx-auto">
              <div className="h-24 w-24 rounded-[2.2rem] border-2 border-argent/20 flex items-center justify-center bg-jet shadow-[0_0_50px_rgba(167,167,167,0.1)]">
                <Terminal className="h-10 w-10 text-argent animate-pulse" />
              </div>
              <div className="absolute inset-0 h-24 w-24 border-2 border-argent rounded-[2.2rem] animate-ping opacity-20" />
            </div>
            
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-black text-foreground uppercase tracking-widest">Protocol Active</h2>
              <div className="h-1.5 w-full bg-jet rounded-full overflow-hidden border border-quartz/30">
                <div 
                  className="h-full bg-argent transition-all duration-700 ease-out shadow-[0_0_15px_#A7A7A7]" 
                  style={{ width: `${((decryptStep + 1) / decryptMessages.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 min-h-[80px]">
              {decryptMessages.map((msg, idx) => (
                <p 
                  key={idx} 
                  className={cn(
                    "text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300",
                    idx === decryptStep ? "text-argent opacity-100 scale-105" : "text-dimgray opacity-40 scale-95"
                  )}
                  style={{ display: idx <= decryptStep ? 'block' : 'none' }}
                >
                  {idx < decryptStep ? "✓ " : idx === decryptStep ? "> " : ""}{msg}
                </p>
              ))}
            </div>

            <div className="flex items-center justify-center gap-3">
              <Loader2 className="h-4 w-4 text-argent animate-spin" />
              <span className="text-[9px] font-bold text-dimgray uppercase tracking-[0.4em]">Encrypted Handshake in Progress</span>
            </div>
          </div>
        </div>
      )}

      {/* Share Toast */}
      {showShareToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-10 fade-in duration-500">
          <div className="bg-argent text-thamar px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl font-black text-[10px] uppercase tracking-widest">
            <Check className="h-4 w-4" />
            <span>Link Copied to Clipboard</span>
          </div>
        </div>
      )}

      {/* Share Button (Floating) */}
      <button 
        onClick={handleShare}
        className="fixed bottom-24 right-4 sm:bottom-24 sm:right-6 z-40 h-14 w-14 rounded-2xl bg-jet/80 backdrop-blur-md border border-quartz/50 text-argent flex items-center justify-center shadow-2xl hover:bg-quartz/30 hover:scale-110 active:scale-90 transition-all group"
      >
        <Share2 className="h-6 w-6 group-hover:rotate-12 transition-transform" />
      </button>

      {isDownloadPage ? (
        <main className="flex-1 pb-20 px-4 sm:px-6 relative">
          <div className="mx-auto max-w-4xl py-10 flex flex-col gap-10">
            <div className="flex flex-col gap-6">
              <Link
                href={`/app/${targetPath}`}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.1em] text-argent bg-jet/60 backdrop-blur-xl px-5 py-2.5 rounded-full border border-quartz/40 w-fit hover:bg-quartz/30 transition-all active:scale-95 shadow-lg group"
              >
                <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                <span>Back to Details</span>
              </Link>

              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <div className="relative h-24 w-24 overflow-hidden rounded-[2.2rem] border border-quartz/50 bg-jet shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] shrink-0 p-1">
                  <div className="h-full w-full rounded-[1.8rem] overflow-hidden relative">
                    <AppIcon 
                      src={data.iconUrl} 
                      alt={data.appName} 
                      platform={isAndroid ? 'android' : 'ios'} 
                      className="h-full w-full object-cover"
                      textClassName="text-lg"
                    />      
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-argent animate-pulse shadow-[0_0_8px_#A7A7A7]" />  
                    <span className="text-[10px] uppercase font-black tracking-[0.2em] text-dimgray">Verified Packages</span>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tighter leading-none">{data.appName || 'Downloads'}</h1>
                  <p className="text-muted-foreground text-sm font-medium max-w-xl leading-relaxed">{data.introText || 'High-speed secure links for direct installation.'}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-10">
              {data.downloadOptions.map((option: any, index: number) => (
                <div key={option.downloadUrl + '-' + index} className="group rounded-[2.8rem] border border-quartz/30 bg-jet/30 backdrop-blur-xl p-1 md:p-1.5 hover:border-argent/30 transition-all duration-500 overflow-hidden shadow-2xl relative">
                  <div className="bg-jet/40 rounded-[2.2rem] p-6 md:p-10 flex flex-col gap-10 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="flex items-center gap-6">
                        <div className="h-14 w-14 rounded-2xl bg-quartz/20 border border-quartz/40 flex items-center justify-center text-argent font-black text-xl shrink-0 shadow-inner group-hover:bg-quartz/40 transition-all group-hover:scale-110 group-hover:rotate-3">{option.optionNumber || (index + 1)}</div>
                        <div>
                          <span className="text-[10px] text-dimgray font-black uppercase tracking-[0.15em] block mb-1">{option.subTitle || 'Premium Mod'}</span>
                          <h3 className="font-black text-foreground text-xl md:text-2xl tracking-tight">{option.title}</h3>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 text-[9px] font-black uppercase tracking-wider">   
                        {option.version && <span className="px-3 py-1.5 bg-jet/80 backdrop-blur-sm text-argent border border-quartz/50 rounded-full shadow-sm">v{option.version}</span>}
                        {option.fileSize && <span className="px-3 py-1.5 bg-jet/80 backdrop-blur-sm text-argent border border-quartz/50 rounded-full shadow-sm">{option.fileSize}</span>}
                        {option.fileType && <span className="px-3 py-1.5 bg-argent text-thamar rounded-full shadow-[0_0_15px_rgba(167,167,167,0.3)]">{option.fileType}</span>}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-px flex-1 bg-quartz/20" />
                          <h4 className="text-[10px] font-black text-dimgray uppercase tracking-[0.2em] whitespace-nowrap">Quick Download</h4>
                          <div className="h-px flex-1 bg-quartz/20" />
                        </div>
                        {option.downloadUrl ? (
                          <a 
                            href={option.downloadUrl} 
                            onClick={(e) => handleDownloadClick(e, option.downloadUrl)}
                            className="group/btn relative flex items-center justify-center gap-3 w-full py-5 bg-argent rounded-2xl text-xs font-black uppercase tracking-widest text-thamar transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_15px_35px_-5px_rgba(167,167,167,0.3)] overflow-hidden"
                          >
                            <div className="absolute inset-0 bg-white/30 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                            <Download className="h-5 w-5 relative z-10 group-hover/btn:animate-bounce" />
                            <span className="relative z-10">Download Package</span>
                          </a>
                        ) : (
                          <div className="text-[10px] font-bold text-dimgray uppercase tracking-widest p-5 border border-dashed border-quartz/30 rounded-2xl bg-jet/20 text-center">Repository Offline</div>
                        )}
                      </div>
                      <div className="flex flex-col gap-6 p-8 rounded-[2rem] bg-jet/50 border border-quartz/20 shadow-inner backdrop-blur-sm">
                        <div className="flex items-center justify-between text-[10px] font-black text-argent uppercase tracking-[0.2em]">
                          <div className="flex items-center gap-3">
                            <PenTool className="h-4 w-4 text-argent" />
                            <span>Inject Signature</span>
                          </div>
                          {signStatus === 'signing' && (
                            <span className="text-dimgray animate-pulse">Processing...</span>
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-5 text-xs">
                          {/* Tab selectors for certificate source */}
                          <div className="flex gap-2 p-1 bg-jet/60 border border-quartz/20 rounded-xl">
                            <button
                              type="button"
                              disabled={signStatus === 'signing'}
                              onClick={() => setCertMode('server')}
                              className={cn(
                                "flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all",
                                certMode === 'server' ? "bg-argent text-thamar font-black" : "text-dimgray hover:text-argent cursor-pointer",
                                signStatus === 'signing' && "opacity-50 cursor-not-allowed"
                              )}
                            >
                              Enterprise Free
                            </button>
                            {savedToken && (
                              <button
                                type="button"
                                disabled={signStatus === 'signing'}
                                onClick={() => setCertMode('saved')}
                                className={cn(
                                  "flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all",
                                  certMode === 'saved' ? "bg-argent text-thamar font-black" : "text-dimgray hover:text-argent cursor-pointer",
                                  signStatus === 'signing' && "opacity-50 cursor-not-allowed"
                                )}
                              >
                                Stored Token
                              </button>
                            )}
                            <button
                              type="button"
                              disabled={signStatus === 'signing'}
                              onClick={() => setCertMode('upload')}
                              className={cn(
                                "flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all",
                                certMode === 'upload' ? "bg-argent text-thamar font-black" : "text-dimgray hover:text-argent cursor-pointer",
                                signStatus === 'signing' && "opacity-50 cursor-not-allowed"
                              )}
                            >
                              Upload Custom
                            </button>
                          </div>

                          {/* Dynamic Inputs according to Selected Mode */}
                          {certMode === 'server' && (
                            <div className="flex flex-col gap-2">
                              <label className="text-dimgray font-black text-[9px] uppercase tracking-widest">Select Certificate</label>
                              <div className="relative">
                                {serverCerts.length > 0 ? (
                                  <>
                                    <select 
                                      value={selectedCert}
                                      disabled={signStatus === 'signing'}
                                      onChange={(e) => setSelectedCert(e.target.value)}
                                      className="w-full h-11 px-4 pr-10 rounded-xl bg-jet/80 border border-quartz/40 text-argent text-xs font-bold focus:outline-none focus:border-argent/50 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {serverCerts.map((cert) => (
                                        <option key={cert.value} value={cert.value}>
                                          {cert.text}
                                        </option>
                                      ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-dimgray">
                                      <ChevronLeft className="h-3 w-3 -rotate-90" />
                                    </div>
                                  </>
                                ) : (
                                  <div className="flex items-center gap-2 px-4 py-3 bg-jet/30 border border-quartz/20 rounded-xl text-dimgray text-[10px] font-bold uppercase tracking-wider">
                                    <Loader2 className="h-3.5 w-3.5 animate-spin text-argent" />
                                    Loading Enterprise Certs...
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {certMode === 'saved' && savedToken && (
                            <div className="flex flex-col gap-3 p-4 bg-jet/40 border border-quartz/30 rounded-xl relative">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-argent uppercase tracking-widest">Active Certificate Token</span>
                                <button 
                                  type="button" 
                                  disabled={signStatus === 'signing'}
                                  onClick={() => {
                                    localStorage.removeItem('saved_cert_token');
                                    localStorage.removeItem('saved_cert_expires_at');
                                    setSavedToken(null);
                                    setCertMode('server');
                                  }}
                                  className="text-red-500 hover:text-red-400 p-1 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-55 disabled:cursor-not-allowed"
                                  title="Forget Saved Token"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              <p className="text-[9px] text-dimgray font-mono truncate bg-black/30 p-2 rounded-lg border border-quartz/20">{savedToken}</p>
                              <span className="text-[8px] text-dimgray uppercase font-bold tracking-widest">Cached for 5 days. Ready to sign.</span>
                            </div>
                          )}

                          {certMode === 'upload' && (
                            <div className="flex flex-col gap-3">
                              {/* .p12 File Upload */}
                              <div className="flex flex-col gap-1.5">
                                <label className="text-dimgray font-black text-[9px] uppercase tracking-widest">P12 Certificate</label>
                                <div className="relative flex items-center justify-between bg-jet/85 border border-quartz/40 rounded-xl p-3 hover:border-argent/30 transition-colors">
                                  <span className="text-[10px] text-argent font-bold truncate max-w-[190px]">
                                    {p12File ? p12File.name : 'Select .p12 file'}
                                  </span>
                                  <label className="flex items-center gap-1.5 px-3 py-1.5 bg-quartz/20 hover:bg-quartz/40 border border-quartz/30 rounded-lg text-[9px] font-black uppercase tracking-wider text-argent cursor-pointer transition-all">
                                    <UploadCloud className="h-3.5 w-3.5" />
                                    Browse
                                    <input 
                                      type="file" 
                                      accept=".p12"
                                      disabled={signStatus === 'signing'}
                                      onChange={(e) => setP12File(e.target.files?.[0] || null)}
                                      className="hidden" 
                                    />
                                  </label>
                                </div>
                              </div>

                              {/* .mobileprovision File Upload */}
                              <div className="flex flex-col gap-1.5">
                                <label className="text-dimgray font-black text-[9px] uppercase tracking-widest">Provisioning Profile</label>
                                <div className="relative flex items-center justify-between bg-jet/85 border border-quartz/40 rounded-xl p-3 hover:border-argent/30 transition-colors">
                                  <span className="text-[10px] text-argent font-bold truncate max-w-[190px]">
                                    {provisionFile ? provisionFile.name : 'Select .mobileprovision'}
                                  </span>
                                  <label className="flex items-center gap-1.5 px-3 py-1.5 bg-quartz/20 hover:bg-quartz/40 border border-quartz/30 rounded-lg text-[9px] font-black uppercase tracking-wider text-argent cursor-pointer transition-all">
                                    <UploadCloud className="h-3.5 w-3.5" />
                                    Browse
                                    <input 
                                      type="file" 
                                      accept=".mobileprovision"
                                      disabled={signStatus === 'signing'}
                                      onChange={(e) => setProvisionFile(e.target.files?.[0] || null)}
                                      className="hidden" 
                                    />
                                  </label>
                                </div>
                              </div>

                              {/* Password input */}
                              <div className="flex flex-col gap-1.5">
                                <label className="text-dimgray font-black text-[9px] uppercase tracking-widest">Certificate Password</label>
                                <input 
                                  type="password"
                                  placeholder="P12 password (leave blank if none)"
                                  value={certPassword}
                                  disabled={signStatus === 'signing'}
                                  onChange={(e) => setCertPassword(e.target.value)}
                                  className="w-full h-11 px-4 rounded-xl bg-jet/80 border border-quartz/40 text-argent text-xs font-bold focus:outline-none focus:border-argent/50 disabled:opacity-50"
                                />
                              </div>

                              {/* Store credentials token option */}
                              <label className="flex items-center gap-2 mt-1 select-none cursor-pointer">
                                <input 
                                  type="checkbox"
                                  checked={saveTokenOption}
                                  disabled={signStatus === 'signing'}
                                  onChange={(e) => setSaveTokenOption(e.target.checked)}
                                  className="accent-argent h-3.5 w-3.5 border border-quartz/30 bg-jet rounded disabled:opacity-50"
                                />
                                <span className="text-[9px] text-dimgray font-bold uppercase tracking-wider">Save Token in Browser Storage</span>
                              </label>
                            </div>
                          )}

                          {/* Action Button */}
                          {option.autoSignParams ? (
                            signStatus === 'signing' ? (
                              <button 
                                type="button" 
                                disabled 
                                className="flex items-center justify-center gap-3 w-full py-4 bg-quartz/10 border border-quartz/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-dimgray cursor-not-allowed italic"
                              >
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Compiling Package...</span>
                              </button>
                            ) : (
                              <button 
                                type="button" 
                                onClick={() => handleExecuteSigning(option)}
                                className="flex items-center justify-center gap-3 w-full py-4 bg-quartz/30 hover:bg-quartz/50 border border-quartz/40 rounded-xl text-[10px] font-black uppercase tracking-widest text-argent transition-all active:scale-[0.97] group/sign"
                              >
                                <PenTool className="h-4 w-4 group-hover/sign:rotate-12 transition-transform" />
                                <span>Execute Signing</span>
                              </button>
                            )
                          ) : (
                            <div className="flex items-center justify-center gap-3 w-full py-4 bg-jet/50 text-dimgray border border-quartz/20 rounded-xl text-[9px] font-black uppercase tracking-widest cursor-not-allowed italic">
                              <span>Signer Unreachable</span>
                            </div>
                          )}

                          {/* Signing status & feedback log panel */}
                          {signStatus !== 'idle' && (
                            <div className={cn(
                              "p-4 rounded-xl border flex flex-col gap-2 relative z-10 transition-all duration-300",
                              signStatus === 'signing' ? "bg-quartz/10 border-quartz/30" : 
                              signStatus === 'done' ? "bg-green-500/10 border-green-500/30" : 
                              "bg-red-500/10 border-red-500/30"
                            )}>
                              <div className="flex items-center gap-3">
                                {signStatus === 'signing' ? (
                                  <Loader2 className="h-4 w-4 animate-spin text-argent" />
                                ) : signStatus === 'done' ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <ShieldAlert className="h-4 w-4 text-red-500" />
                                )}
                                <span className={cn(
                                  "text-[9px] font-black uppercase tracking-widest",
                                  signStatus === 'signing' ? "text-argent" :
                                  signStatus === 'done' ? "text-green-500" : "text-red-500"
                                )}>
                                  {signStatus === 'signing' ? 'Injecting signature...' :
                                   signStatus === 'done' ? 'Signing Successful!' : 'Signing Failed'}
                                </span>
                              </div>
                              
                              <p className="text-[10px] font-semibold text-dimgray font-mono bg-black/20 p-2.5 rounded-lg border border-quartz/10 truncate">
                                {signStatus === 'signing' ? signProgress : 
                                 signStatus === 'done' ? 'Package prepared. iOS OTA download triggered.' :
                                 errMessage}
                              </p>

                              {signStatus === 'done' && signedOtaLink && (
                                <div className="flex flex-col gap-2 mt-2">
                                  <a
                                    href={signedOtaLink}
                                    className="flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-[0.98] shadow-md shadow-green-950"
                                  >
                                    <Download className="h-3.5 w-3.5" />
                                    Install Signed App
                                  </a>
                                  <span className="text-[8px] text-dimgray uppercase font-bold text-center tracking-widest mt-1">
                                    Tap above if installation dialog did not open automatically.
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <section className="rounded-[3rem] border border-quartz/30 bg-jet/40 backdrop-blur-2xl p-10 flex flex-col gap-8 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-24 -right-24 h-64 w-64 bg-argent/5 blur-[80px] rounded-full pointer-events-none" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="p-3 bg-argent/10 rounded-2xl border border-argent/20"><ShieldCheck className="h-6 w-6 text-argent" /></div>
                <div><h3 className="font-black text-foreground text-xl tracking-tight">Security Protocol</h3><p className="text-dimgray text-[10px] font-bold uppercase tracking-widest">Installation Methods</p></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                <div className="flex flex-col gap-3 group">
                  <span className="font-black text-argent text-[11px] uppercase tracking-widest flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-argent shadow-[0_0_8px_#A7A7A7]" />TrollStore (Zero Revoke)</span>
                  <p className="text-muted-foreground text-xs leading-relaxed font-medium pl-3.5 border-l border-quartz/30 group-hover:border-argent/50 transition-all group-hover:pl-5">The ultimate installation method. Direct file injection bypassing all Apple signing limits. No expiration.</p>
                </div>
                <div className="flex flex-col gap-3 group">
                  <span className="font-black text-argent text-[11px] uppercase tracking-widest flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-argent shadow-[0_0_8px_#A7A7A7]" />Desktop Sideload</span>
                  <p className="text-muted-foreground text-xs leading-relaxed font-medium pl-3.5 border-l border-quartz/30 group-hover:border-argent/50 transition-all group-hover:pl-5">Standard protocol using AltStore or Sideloadly. Requires USB connection and recurring 7-day re-signing.</p>
                </div>
              </div>
            </section>
          </div>
        </main>
      ) : (
        <main className="flex-1 pb-20 relative">
          <div className="relative h-72 w-full overflow-hidden border-b border-quartz/30 bg-jet/40 backdrop-blur-md">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(167,167,167,0.1),transparent)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(24,24,24,0.9))]" /> 
            <div className="mx-auto max-w-6xl h-full flex items-end px-6 pb-12 relative z-10">
              <Link href="/" className="absolute top-8 left-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-argent bg-jet/80 backdrop-blur-xl px-5 py-2.5 rounded-full border border-quartz/40 hover:bg-quartz/30 transition-all shadow-2xl group">
                <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                <span>Library</span>
              </Link>
            </div>
          </div>

          <div className="mx-auto max-w-6xl px-6 -mt-20 relative z-20">
            <div className="flex flex-col lg:flex-row gap-10 items-start">
              <div className="group relative h-44 w-44 md:h-52 md:w-52 overflow-hidden rounded-[3.5rem] border border-quartz/60 bg-jet shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] shrink-0 p-1.5 transition-all duration-700 hover:scale-[1.05] hover:rotate-2">
                <div className="h-full w-full rounded-[3rem] overflow-hidden bg-jet flex items-center justify-center relative">
                  <div className="absolute top-4 right-4 z-10"><div className="px-3 py-1 rounded-full bg-jet/80 backdrop-blur-md border border-quartz/40 shadow-xl"><span className="text-[10px] font-black uppercase tracking-widest text-argent">{isAndroid ? 'APK' : 'IPA'}</span></div></div>
                  <AppIcon 
                    src={data.iconUrl} 
                    alt={data.appName} 
                    platform={isAndroid ? 'android' : 'ios'} 
                    className="h-full w-full object-cover" 
                    textClassName="text-5xl md:text-7xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/10 pointer-events-none" />
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-6 pt-6 lg:pt-24 text-center lg:text-left">
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-argent/10 border border-argent/30 shadow-inner backdrop-blur-md"><div className="w-2 h-2 rounded-full bg-argent animate-pulse shadow-[0_0_10px_#A7A7A7]" /><span className="text-[10px] uppercase font-black tracking-[0.2em] text-argent">Premium MOD</span></div>
                  {data.updated && <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-dimgray bg-jet/60 backdrop-blur-sm px-4 py-1.5 rounded-full border border-quartz/20"><Sparkles className="h-3 w-3 text-argent" /><span>LIVE SYNC</span></div>}
                </div>
                <h1 className="text-4xl md:text-7xl font-black text-foreground tracking-tighter leading-[0.9] max-w-3xl drop-shadow-2xl">{data.appName}</h1>
                <div className="flex flex-wrap justify-center lg:justify-start gap-x-8 gap-y-3 text-sm font-bold text-dimgray uppercase tracking-widest items-center">
                  <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-quartz shadow-sm" /><span>Version {data.version || 'Build.01'}</span></div>
                  <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-quartz shadow-sm" /><span>{data.size || 'Unknown Size'}</span></div>
                  <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-quartz shadow-sm" /><span className="text-argent font-black">{platformLabel} Platform</span></div>
                </div>
              </div>
              <div className="w-full lg:w-auto pt-4 lg:pt-28 flex justify-center">
                <Link 
                    href={data.downloadUrl ? `/app/${data.downloadUrl.replace('https://ipaomtk.com/', '').replace(/\/$/, '')}` : `/app/${targetPath}/download`} 
                    className="group relative w-full lg:w-auto flex items-center justify-center gap-4 px-14 py-6 bg-argent rounded-[2.5rem] text-thamar font-black uppercase tracking-[0.2em] text-sm shadow-[0_25px_60px_-10px_rgba(167,167,167,0.4)] transition-all hover:scale-[1.08] active:scale-[0.95] overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/40 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                  <Download className="h-6 w-6 relative z-10 group-hover:animate-bounce" /><span className="relative z-10">Download Now</span>
                </Link>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-24">
              <div className="lg:col-span-8 flex flex-col gap-10">
                <div className="flex flex-col gap-8 bg-jet/30 backdrop-blur-2xl border border-quartz/30 rounded-[3.5rem] p-10 md:p-16 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-argent/5 blur-[100px] rounded-full -translate-y-32 translate-x-32 pointer-events-none" />
                  <div className="flex items-center gap-4 mb-2 relative z-10"><div className="h-px flex-1 bg-quartz/20" /><h2 className="text-[11px] font-black text-dimgray uppercase tracking-[0.4em] whitespace-nowrap px-4">App Intel & Specifications</h2><div className="h-px flex-1 bg-quartz/20" /></div>
                  {data.descriptionHtml ? (
                    <div className="content-area industrial-content relative z-10" dangerouslySetInnerHTML={{ __html: data.descriptionHtml }} />
                  ) : (
                    <div className="text-center py-24 bg-jet/20 rounded-[2.5rem] border border-dashed border-quartz/20">
                      <p className="text-dimgray text-[10px] font-black uppercase tracking-[0.3em] italic">No description available for this build.</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="lg:col-span-4 flex flex-col gap-8">
                <div className="rounded-[3rem] border border-quartz/40 bg-jet/50 backdrop-blur-3xl p-10 flex flex-col gap-8 shadow-2xl relative overflow-hidden group/card">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-argent/10 blur-[60px] rounded-full translate-x-16 -translate-y-16 group-hover/card:bg-argent/20 transition-all duration-700" />
                  <h3 className="font-black text-foreground text-lg uppercase tracking-[0.2em] border-b border-quartz/30 pb-5 flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-argent rounded-full" />
                    Data Metadata
                  </h3>
                  <div className="flex flex-col gap-8">
                    <div className="flex items-center gap-5 group"><div className="h-14 w-14 rounded-2xl bg-quartz/15 border border-quartz/30 flex items-center justify-center text-argent shrink-0 group-hover:bg-quartz/30 group-hover:scale-110 transition-all shadow-inner"><Cpu className="h-6 w-6" /></div><div className="flex flex-col gap-0.5"><span className="text-[10px] text-dimgray uppercase font-black tracking-widest">Build Version</span><span className="font-bold text-foreground text-base tracking-tight">{data.version || 'Internal'}</span></div></div>
                    <div className="flex items-center gap-5 group"><div className="h-14 w-14 rounded-2xl bg-quartz/15 border border-quartz/30 flex items-center justify-center text-argent shrink-0 group-hover:bg-quartz/30 group-hover:scale-110 transition-all shadow-inner"><HardDrive className="h-6 w-6" /></div><div className="flex flex-col gap-0.5"><span className="text-[10px] text-dimgray uppercase font-black tracking-widest">File Size</span><span className="font-bold text-foreground text-base tracking-tight">{data.size || 'N/A'}</span></div></div>
                    <div className="flex items-center gap-5 group"><div className="h-14 w-14 rounded-2xl bg-quartz/15 border border-quartz/30 flex items-center justify-center text-argent shrink-0 group-hover:bg-quartz/30 group-hover:scale-110 transition-all shadow-inner"><Calendar className="h-6 w-6" /></div><div className="flex flex-col gap-0.5"><span className="text-[10px] text-dimgray uppercase font-black tracking-widest">Sync Timeline</span><span className="font-bold text-foreground text-base tracking-tight">{data.updated || 'Recent'}</span></div></div>
                    <div className="flex items-center gap-5 group"><div className="h-14 w-14 rounded-2xl bg-quartz/15 border border-quartz/30 flex items-center justify-center text-argent shrink-0 group-hover:bg-quartz/30 group-hover:scale-110 transition-all shadow-inner"><User className="h-6 w-6" /></div><div className="flex flex-col gap-0.5"><span className="text-[10px] text-dimgray uppercase font-black tracking-widest">Architect</span><span className="font-bold text-foreground text-base truncate max-w-[180px] tracking-tight">{data.publisher || 'Verified Team'}</span></div></div>
                    <div className="flex items-center gap-5 group"><div className="h-14 w-14 rounded-2xl bg-quartz/15 border border-quartz/30 flex items-center justify-center text-argent shrink-0 group-hover:bg-quartz/30 group-hover:scale-110 transition-all shadow-inner"><Tag className="h-6 w-6" /></div><div className="flex flex-col gap-0.5"><span className="text-[10px] text-dimgray uppercase font-black tracking-widest">Taxonomy</span>{data.categoryUrl ? <a href={data.categoryUrl} target="_blank" className="font-black text-argent hover:text-white flex items-center gap-2 text-base transition-colors tracking-tight"><span>{data.category}</span><ExternalLink className="h-4 w-4" /></a> : <span className="font-bold text-foreground text-base tracking-tight">{data.category || 'App'}</span>}</div></div>
                  </div>
                  {data.getItOn && (
                    <div className="border-t border-quartz/30 pt-8 mt-4 flex flex-col gap-4">
                      <span className="text-[10px] text-dimgray font-black uppercase tracking-[0.3em]">External Repository</span>
                      {data.getItOnUrl ? (
                        <a href={data.getItOnUrl} target="_blank" className="flex items-center justify-center gap-3 w-full py-5 bg-jet/80 border border-quartz/50 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-argent transition-all hover:bg-quartz/20 hover:shadow-xl hover:-translate-y-1">
                          <span>Market Origin</span>
                          <ExternalLink className="h-4 w-4 text-dimgray" />
                        </a>
                      ) : (
                        <span className="text-argent font-black text-xs uppercase tracking-[0.2em] bg-jet/40 px-4 py-3 rounded-xl border border-quartz/20 text-center">{data.getItOn}</span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="group rounded-[3rem] border border-quartz/40 bg-jet/40 p-10 flex flex-col gap-6 shadow-xl transition-all hover:border-argent/40 backdrop-blur-md relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-argent/5 to-transparent pointer-events-none" />
                  <div className="flex items-center gap-3 text-argent font-black text-[11px] uppercase tracking-[0.3em] relative z-10">
                    <ShieldCheck className="h-6 w-6 shadow-[0_0_10px_rgba(167,167,167,0.3)]" />
                    <span>DMods Verified</span>
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed font-medium relative z-10">This build has been audited for structural integrity. Encrypted signatures are processed in secure environments. Recommended installation: <span className="text-argent font-bold">TrollStore Protocol</span> for iOS environments.</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
