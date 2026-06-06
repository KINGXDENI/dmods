'use client';

import { useState, useEffect } from 'react';
import { Download, ShieldCheck, Cpu, Terminal, Loader2, Check, PenTool, Trash2, UploadCloud, ShieldAlert, Globe, FileCode, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RemoteSignerClient() {
  const [ipaUrl, setIpaUrl] = useState('');
  const [appName, setAppName] = useState('');

  // Signing states
  const [serverCerts, setServerCerts] = useState<any[]>([]);
  const [selectedCert, setSelectedCert] = useState('');
  const [certMode, setCertMode] = useState<'server' | 'saved' | 'upload'>('server');
  const [savedToken, setSavedToken] = useState<string | null>(null);

  // File uploads
  const [p12File, setP12File] = useState<File | null>(null);
  const [provisionFile, setProvisionFile] = useState<File | null>(null);
  const [certPassword, setCertPassword] = useState('');
  const [saveTokenOption, setSaveTokenOption] = useState(true);

  // Job progress
  const [signStatus, setSignStatus] = useState<'idle' | 'signing' | 'done' | 'error'>('idle');
  const [signProgress, setSignProgress] = useState('');
  const [signedOtaLink, setSignedOtaLink] = useState('');
  const [errMessage, setErrMessage] = useState('');

  useEffect(() => {
    // Load stored certificate token
    const token = localStorage.getItem('saved_cert_token');
    const expires = localStorage.getItem('saved_cert_expires_at');
    if (token && expires && new Date(expires) > new Date()) {
      setSavedToken(token);
      setCertMode('saved');
    } else {
      localStorage.removeItem('saved_cert_token');
      localStorage.removeItem('saved_cert_expires_at');
    }

    // Fetch active enterprise certs
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
        console.error("Failed to load certificates", err);
      });
  }, []);

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

  const handleExecuteSigning = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ipaUrl) return;
    
    setSignStatus('signing');
    setSignProgress('Validating connection payload...');
    setErrMessage('');
    setSignedOtaLink('');

    try {
      if (certMode === 'server' || certMode === 'saved') {
        const formData = new FormData();
        formData.append('ipa_url', ipaUrl);
        formData.append('app_name', appName || 'Signed App');
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
        formData.append('ipa_url', ipaUrl);
        formData.append('app_name', appName || 'Signed App');

        setSignProgress('Uploading certificates to compilation workspace...');

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

  return (
    <main className="flex-1 bg-background text-foreground flex flex-col relative overflow-hidden pb-24 pt-8 px-4 sm:px-6">
      {/* Abstract glow overlays */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(167,167,167,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(167,167,167,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute top-1/4 left-1/3 w-[450px] h-[450px] bg-argent/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="mx-auto max-w-2xl w-full flex flex-col gap-8 relative z-10">
        
        {/* Title Header */}
        <div className="text-center sm:text-left flex flex-col gap-2">
          <div className="flex items-center justify-center sm:justify-start gap-2.5 px-3 py-1 bg-quartz/10 border border-quartz/30 rounded-full w-fit mx-auto sm:mx-0">
            <PenTool className="h-3.5 w-3.5 text-argent" />
            <span className="text-[10px] uppercase font-black tracking-widest text-argent">In-Browser IPA Signer</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase text-foreground">Remote Signer</h1>
          <p className="text-muted-foreground text-sm font-medium leading-relaxed max-w-lg">
            Sideload any IPA package via link directly on your iOS device. Bypasses computer connections with instant OTA installation.
          </p>
        </div>

        {/* Main interactive panel */}
        <form onSubmit={handleExecuteSigning} className="rounded-[3rem] border border-quartz/30 bg-jet/20 backdrop-blur-xl p-1.5 sm:p-2 shadow-2xl">
          <div className="bg-charleston/30 rounded-[2.5rem] p-6 sm:p-8 flex flex-col gap-6">
            
            {/* IPA Download URL Input */}
            <div className="flex flex-col gap-2">
              <label className="text-dimgray font-black text-[9px] uppercase tracking-widest">IPA Package URL</label>
              <div className="relative flex items-center">
                <Globe className="absolute left-4 h-4 w-4 text-dimgray" />
                <input 
                  type="url"
                  required
                  placeholder="https://example.com/payload.ipa"
                  value={ipaUrl}
                  disabled={signStatus === 'signing'}
                  onChange={(e) => setIpaUrl(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 rounded-2xl bg-jet/70 border border-quartz/40 text-argent text-xs font-semibold focus:outline-none focus:border-argent/50 disabled:opacity-50"
                />
              </div>
            </div>

            {/* App Display Name Input */}
            <div className="flex flex-col gap-2">
              <label className="text-dimgray font-black text-[9px] uppercase tracking-widest">App Display Name (Optional)</label>
              <div className="relative flex items-center">
                <FileCode className="absolute left-4 h-4 w-4 text-dimgray" />
                <input 
                  type="text"
                  placeholder="Sideloaded App"
                  value={appName}
                  disabled={signStatus === 'signing'}
                  onChange={(e) => setAppName(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 rounded-2xl bg-jet/70 border border-quartz/40 text-argent text-xs font-semibold focus:outline-none focus:border-argent/50 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Certificate configuration panel */}
            <div className="flex flex-col gap-4 p-5 sm:p-6 rounded-[2rem] bg-jet/50 border border-quartz/20 shadow-inner">
              <div className="flex items-center gap-2 border-b border-quartz/20 pb-3">
                <ShieldCheck className="h-4.5 w-4.5 text-argent" />
                <span className="text-[10px] font-black text-argent uppercase tracking-[0.15em]">Sideload Certificate</span>
              </div>

              {/* Mode Tabs */}
              <div className="flex gap-2 p-1 bg-jet/80 border border-quartz/35 rounded-xl">
                <button
                  type="button"
                  disabled={signStatus === 'signing'}
                  onClick={() => setCertMode('server')}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer",
                    certMode === 'server' ? "bg-argent text-thamar font-black" : "text-dimgray hover:text-argent",
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
                      "flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer",
                      certMode === 'saved' ? "bg-argent text-thamar font-black" : "text-dimgray hover:text-argent",
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
                    "flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer",
                    certMode === 'upload' ? "bg-argent text-thamar font-black" : "text-dimgray hover:text-argent",
                    signStatus === 'signing' && "opacity-50 cursor-not-allowed"
                  )}
                >
                  Upload Custom
                </button>
              </div>

              {/* Server Certificates */}
              {certMode === 'server' && (
                <div className="flex flex-col gap-2 mt-1">
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
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-dimgray select-none">
                          <ChevronLeft className="h-3 w-3 -rotate-90" />
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-3 bg-jet/30 border border-quartz/20 rounded-xl text-dimgray text-[10px] font-bold uppercase tracking-wider">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-argent" />
                        Loading Active Certs...
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Saved Token */}
              {certMode === 'saved' && savedToken && (
                <div className="flex flex-col gap-3 p-4 bg-jet/40 border border-quartz/30 rounded-xl mt-1">
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
                      className="text-red-500 hover:text-red-400 p-1 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-55"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-[9px] text-dimgray font-mono truncate bg-black/30 p-2 rounded-lg border border-quartz/20">{savedToken}</p>
                  <span className="text-[8px] text-dimgray uppercase font-bold tracking-widest">Saved in local browser cache. Ready to sign.</span>
                </div>
              )}

              {/* Upload Certificate */}
              {certMode === 'upload' && (
                <div className="flex flex-col gap-3 mt-1">
                  {/* .p12 File */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-dimgray font-black text-[9px] uppercase tracking-widest">P12 Certificate Binary</label>
                    <div className="relative flex items-center justify-between bg-jet/85 border border-quartz/40 rounded-xl p-3 hover:border-argent/30 transition-colors">
                      <span className="text-[10px] text-argent font-bold truncate max-w-[280px]">
                        {p12File ? p12File.name : 'Select .p12 file'}
                      </span>
                      <label className="flex items-center gap-1.5 px-3 py-1.5 bg-quartz/20 hover:bg-quartz/45 border border-quartz/30 rounded-lg text-[9px] font-black uppercase tracking-wider text-argent cursor-pointer transition-all">
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

                  {/* .mobileprovision File */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-dimgray font-black text-[9px] uppercase tracking-widest">Provisioning Profile (.mobileprovision)</label>
                    <div className="relative flex items-center justify-between bg-jet/85 border border-quartz/40 rounded-xl p-3 hover:border-argent/30 transition-colors">
                      <span className="text-[10px] text-argent font-bold truncate max-w-[280px]">
                        {provisionFile ? provisionFile.name : 'Select .mobileprovision'}
                      </span>
                      <label className="flex items-center gap-1.5 px-3 py-1.5 bg-quartz/20 hover:bg-quartz/45 border border-quartz/30 rounded-lg text-[9px] font-black uppercase tracking-wider text-argent cursor-pointer transition-all">
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

                  {/* Password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-dimgray font-black text-[9px] uppercase tracking-widest">Certificate Password</label>
                    <input 
                      type="password"
                      placeholder="Password (leave blank if none)"
                      value={certPassword}
                      disabled={signStatus === 'signing'}
                      onChange={(e) => setCertPassword(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl bg-jet/80 border border-quartz/40 text-argent text-xs font-bold focus:outline-none focus:border-argent/50"
                    />
                  </div>

                  {/* Save checkbox */}
                  <label className="flex items-center gap-2 mt-1 select-none cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={saveTokenOption}
                      disabled={signStatus === 'signing'}
                      onChange={(e) => setSaveTokenOption(e.target.checked)}
                      className="accent-argent h-3.5 w-3.5 border border-quartz/30 bg-jet rounded"
                    />
                    <span className="text-[9px] text-dimgray font-bold uppercase tracking-wider">Save Token in Browser Cache</span>
                  </label>
                </div>
              )}
            </div>

            {/* Execute Button */}
            {signStatus === 'signing' ? (
              <button 
                type="button" 
                disabled 
                className="flex items-center justify-center gap-3 w-full py-5 bg-quartz/10 border border-quartz/20 rounded-2xl text-xs font-black uppercase tracking-widest text-dimgray cursor-not-allowed italic"
              >
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Injecting Signature...</span>
              </button>
            ) : (
              <button 
                type="submit"
                disabled={!ipaUrl}
                className="flex items-center justify-center gap-3 w-full py-5 bg-argent rounded-2xl text-xs font-black uppercase tracking-widest text-thamar transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_15px_30px_-5px_rgba(167,167,167,0.25)] cursor-pointer"
              >
                <PenTool className="h-5 w-5" />
                <span>Start Remote Sideload</span>
              </button>
            )}

            {/* Output log panel */}
            {signStatus !== 'idle' && (
              <div className={cn(
                "p-5 rounded-2xl border flex flex-col gap-3 relative z-10 transition-all duration-300",
                signStatus === 'signing' ? "bg-quartz/10 border-quartz/30" : 
                signStatus === 'done' ? "bg-green-500/10 border-green-500/30" : 
                "bg-red-500/10 border-red-500/30"
              )}>
                <div className="flex items-center gap-3">
                  {signStatus === 'signing' ? (
                    <Loader2 className="h-4.5 w-4.5 animate-spin text-argent" />
                  ) : signStatus === 'done' ? (
                    <Check className="h-4.5 w-4.5 text-green-500" />
                  ) : (
                    <ShieldAlert className="h-4.5 w-4.5 text-red-500" />
                  )}
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest",
                    signStatus === 'signing' ? "text-argent" :
                    signStatus === 'done' ? "text-green-500" : "text-red-500"
                  )}>
                    {signStatus === 'signing' ? 'Sideload Progress' :
                     signStatus === 'done' ? 'Signing Completed!' : 'Operation Failed'}
                  </span>
                </div>
                
                {/* Retro terminal output */}
                <div className="font-mono text-[10px] text-lightgray bg-black/50 p-4 rounded-xl border border-quartz/20 flex flex-col gap-1.5 max-h-48 overflow-y-auto">
                  <div className="flex items-center gap-1 text-dimgray select-none">
                    <Terminal className="h-3 w-3" />
                    <span>console_log_output:</span>
                  </div>
                  <p className="text-argent font-bold">&gt; {signStatus === 'signing' ? signProgress : 
                     signStatus === 'done' ? 'Compilation success. Manifest generated.' :
                     errMessage}</p>
                </div>

                {signStatus === 'done' && signedOtaLink && (
                  <div className="flex flex-col gap-2.5 mt-1">
                    <a
                      href={signedOtaLink}
                      className="flex items-center justify-center gap-2 py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-[0.98] shadow-md shadow-green-950/50"
                    >
                      <Download className="h-4 w-4" />
                      Install Signed App
                    </a>
                    <span className="text-[8px] text-dimgray uppercase font-bold text-center tracking-widest mt-1">
                      Click the installation button above if installer did not open automatically.
                    </span>
                  </div>
                )}
              </div>
            )}
            
          </div>
        </form>

        {/* Informative Security Panel */}
        <section className="rounded-[3rem] border border-quartz/30 bg-jet/10 backdrop-blur-md p-8 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-argent/10 border border-argent/20 rounded-xl">
              <ShieldCheck className="h-5 w-5 text-argent" />
            </div>
            <div>
              <h3 className="font-black text-foreground text-sm uppercase tracking-wide">Security & Verification</h3>
              <p className="text-dimgray text-[8px] font-bold uppercase tracking-widest">Zero Client Retention</p>
            </div>
          </div>
          <p className="text-muted-foreground text-xs leading-relaxed font-medium">
            All remote signing compilation directories are run in isolated container runtimes. Certificate passwords and binaries are processed on-demand and are not archived. Your client token acts as a hash key that lives exclusively in your browser's <span className="text-argent font-bold">Local Storage</span> cache.
          </p>
        </section>

      </div>
    </main>
  );
}
