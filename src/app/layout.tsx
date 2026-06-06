import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import LiveActivity from "@/components/LiveActivity";
import SearchOverlay from "@/components/SearchOverlay";
import { constructMetadata } from "@/lib/metadata";

export const metadata: Metadata = constructMetadata({
  title: "DMods – Premium IPA & APK Hub",
  description: "Find and download tweaked iOS IPA files and modified Android APK apps safely with high-speed secure links.",
  ogParams: {
    title: "DMods – Premium IPA & APK Hub",
    subtitle: "Find and download tweaked iOS IPA files and modified Android APK apps safely with high-speed secure links.",
    badge: "Premium Hub",
    type: "home",
  }
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="dark h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans pb-16 md:pb-0 overflow-x-hidden">
        <Navbar />
        <div className="flex-1 flex flex-col w-full relative">
          {children}
        </div>
        <SearchOverlay />
        <LiveActivity />
        <BottomNav />
      </body>
    </html>
  );
}
