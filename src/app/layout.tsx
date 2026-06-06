import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import LiveActivity from "@/components/LiveActivity";
import SearchOverlay from "@/components/SearchOverlay";

const productionUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : process.env.VERCEL_PROJECT_PRODUCTION_URL 
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` 
  : process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(productionUrl),
  title: "DMods – Premium IPA & APK Hub",
  description: "Find and download tweaked iOS IPA files and modified Android APK apps safely with high-speed secure links.",
  openGraph: {
    title: "DMods – Premium IPA & APK Hub",
    description: "The ultimate platform for modified iOS and Android applications.",
    url: "https://dmods.app", // Adjust if needed
    siteName: "DMods",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DMods – Premium IPA & APK Hub",
    description: "Premium modified apps for iOS and Android.",
    images: ["/logo.png"],
  },
};

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
