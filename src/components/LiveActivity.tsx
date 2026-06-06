'use client';

import { useState, useEffect } from 'react';
import { Download, Zap, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Activity {
  id: number;
  user: string;
  app: string;
  platform: 'iOS' | 'Android';
}

const APPS = [
  'Spotify Premium', 'Minecraft PE', 'Instagram Rocket', 'YouTube ReVanced', 
  'WhatsApp Gold', 'TikTok Plus', 'Snapchat Falcon', 'CapCut Pro',
  'Lightroom Mobile', 'Clash of Clans Mod', 'Subway Surfers Mod', 'Roblox Mod'
];

const USERS = [
  'Anonymous', 'User77', 'Kaito', 'ZeroDay', 'Neo', 'Guest_99', 
  'Shadow', 'R00t', 'Specter', 'Alpha', 'Ghost'
];

export default function LiveActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newActivity: Activity = {
        id: Date.now(),
        user: USERS[Math.floor(Math.random() * USERS.length)],
        app: APPS[Math.floor(Math.random() * APPS.length)],
        platform: Math.random() > 0.5 ? 'iOS' : 'Android'
      };

      setActivities((prev) => [newActivity, ...prev].slice(0, 1)); // Show only latest
      
      // Auto remove after 5 seconds
      setTimeout(() => {
        setActivities((prev) => prev.filter(a => a.id !== newActivity.id));
      }, 5000);

    }, Math.random() * 10000 + 10000); // Every 10-20 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-2 pointer-events-none sm:bottom-6 sm:right-6">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className={cn(
            "pointer-events-auto flex items-center gap-4 p-4 rounded-2xl bg-thamar/80 backdrop-blur-2xl border border-quartz/40 shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all duration-500 animate-in slide-in-from-right-10 fade-in",
          )}
        >
          <div className="h-10 w-10 rounded-xl bg-argent/10 flex items-center justify-center text-argent shadow-inner">
            <Download className="h-5 w-5 animate-bounce" />
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-argent">{activity.user}</span>
              <span className="text-[9px] text-dimgray font-bold uppercase tracking-tighter">just ingested</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-foreground">{activity.app}</span>
              <span className={cn(
                "text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full border",
                activity.platform === 'iOS' ? "text-argent border-argent/30 bg-argent/5" : "text-dimgray border-dimgray/30 bg-dimgray/5"
              )}>
                {activity.platform}
              </span>
            </div>
          </div>
          <button 
            onClick={() => setActivities([])}
            className="ml-2 text-dimgray hover:text-foreground transition-colors p-1"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
