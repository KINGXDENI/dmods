'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    if (theme === 'dark') {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setTheme('light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setTheme('dark');
    }
  };

  // Avoid hydration mismatch by rendering a skeleton or placeholder before mount
  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-xl bg-quartz/10 border border-quartz/30 animate-pulse shrink-0" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="flex h-9 w-9 items-center justify-center rounded-xl bg-quartz/10 border border-quartz/30 text-argent hover:bg-quartz/20 transition-all cursor-pointer active:scale-95 shrink-0 focus:outline-none focus-visible:outline-none"
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="h-4.5 w-4.5 text-argent animate-in spin-in-12 duration-300" />
      ) : (
        <Moon className="h-4.5 w-4.5 text-argent animate-in spin-in-12 duration-300" />
      )}
    </button>
  );
}
