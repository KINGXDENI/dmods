'use client';

import Link from 'next/link';
import { FileQuestion, ChevronRight, Home } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* 1. Header Navbar so user has full navigation */}
      <Navbar />

      {/* Abstract Grid background overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(90,90,90,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(90,90,90,0.04)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(167,167,167,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(167,167,167,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-argent/5 blur-[120px] rounded-full pointer-events-none" />

      {/* 2. Main 404 Content Area */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="max-w-md w-full p-8 sm:p-10 rounded-[3rem] border border-quartz/30 bg-charleston/10 backdrop-blur-xl text-center shadow-2xl animate-in fade-in zoom-in-95 duration-300">
          
          {/* Animated icon circle */}
          <div className="w-16 h-16 bg-quartz/15 border border-quartz/30 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner animate-bounce">
            <FileQuestion className="h-8 w-8 text-argent" />
          </div>

          <span className="text-[10px] text-dimgray uppercase font-black tracking-[0.25em] block mb-2">Error 404</span>
          
          <h2 className="text-3xl font-black text-foreground mb-4 tracking-tight uppercase leading-none">
            INDEX NOT FOUND
          </h2>
          
          <p className="text-xs sm:text-sm text-dimgray mb-8 font-medium leading-relaxed">
            The requested package path or resource is not registered in our local sideload index. It may have been relocated or deprecated.
          </p>

          <div className="flex flex-col gap-3">
            <Link 
              href="/home"
              className="w-full flex items-center justify-center gap-2 py-4 bg-foreground text-background font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-foreground/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/10"
            >
              <Home className="h-3.5 w-3.5" />
              <span>Explore Library</span>
            </Link>

            <Link 
              href="/"
              className="w-full flex items-center justify-center gap-2 py-4 bg-charleston/60 text-argent border border-quartz/60 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-quartz/15 transition-all"
            >
              <span>Back to Landing</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
