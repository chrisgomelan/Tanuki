import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import ScrollToTop from "@/components/ScrollToTop";
import { TanukiLogo } from "@/components/Icons";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tanuki — Free Movie Streaming & Tracking",
  description: "Watch free movies with zero ads, multiple high-speed streaming servers, and instant timestamp savepoints. No account required.",
};

export const viewport: Viewport = {
  themeColor: "#0c0d14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="flex min-h-screen flex-col bg-[#0c0d14] text-[#f5f5f7] antialiased selection:bg-amber-500/30 selection:text-amber-200">
        <Navbar />
        <main className="flex-1 pb-16 sm:pb-0">{children}</main>
        <MobileBottomNav />
        <ScrollToTop />

        {/* Global Footer */}
        <footer className="mt-12 sm:mt-16 border-t border-white/10 bg-[#090a0f] py-8 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] sm:pb-8 text-center sm:text-left text-xs text-white/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-black shrink-0">
                <TanukiLogo className="size-4" />
              </div>
              <span className="font-bold text-white">Tanuki Movies</span>
              <span className="text-white/30">•</span>
              <span>100% Free Streaming</span>
            </div>
            <p className="text-white/40 max-w-md text-center sm:text-right">
              Tanuki does not host any media files on its servers. All content is provided by non-affiliated third parties.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
