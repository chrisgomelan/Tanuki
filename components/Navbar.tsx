"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookmarkIcon, CloseIcon, HomeIcon, SearchIcon, TanukiLogo } from "@/components/Icons";
import LiveSearch from "@/components/LiveSearch";
import { useMovieSavepoints } from "@/lib/savepoints";

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const { ready, savepoints } = useMovieSavepoints();

  const savedCount = ready ? Object.keys(savepoints).length : 0;
  const isHome = pathname === "/";
  const isLibrary = pathname === "/library";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0c0d14]/90 backdrop-blur-xl pt-[env(safe-area-inset-top,0px)]">
      <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8 gap-2">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group transition active:scale-95 shrink-0"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-lg shadow-amber-950/50 ring-1 ring-amber-400/40">
            <TanukiLogo className="size-5 transition group-hover:scale-110" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight text-white group-hover:text-amber-400 transition leading-none">
              Tanuki
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/80 mt-0.5">
              Movies
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links (Handled by MobileBottomNav on small screens) */}
        <nav className="hidden sm:flex items-center gap-1.5 sm:gap-2">
          <Link
            href="/"
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-semibold transition active:scale-95 ${
              isHome
                ? "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30"
                : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            <HomeIcon className="size-4 shrink-0" />
            <span>Home</span>
          </Link>

          <Link
            href="/library"
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-semibold transition active:scale-95 ${
              isLibrary
                ? "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30"
                : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            <BookmarkIcon className="size-4 shrink-0" />
            <span>My Library</span>
            {savedCount > 0 && (
              <span className="rounded-full bg-amber-500/20 px-1.5 py-0.2 text-[10px] font-bold text-amber-300 ring-1 ring-amber-500/30">
                {savedCount}
              </span>
            )}
          </Link>
        </nav>

        {/* Right Section: Desktop LiveSearch / Mobile Search Toggle */}
        <div className="flex items-center gap-2">
          {/* Desktop Search */}
          <div className="hidden sm:block">
            <LiveSearch variant="desktop" />
          </div>

          {/* Mobile Search Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen((prev) => !prev)}
            aria-expanded={isMobileSearchOpen}
            aria-label="Toggle mobile search"
            className="flex sm:hidden h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white/80 ring-1 ring-white/15 transition hover:bg-white/15 hover:text-white active:scale-95"
          >
            {isMobileSearchOpen ? <CloseIcon className="size-4" /> : <SearchIcon className="size-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Search Expandable Drawer */}
      {isMobileSearchOpen && (
        <div className="border-t border-white/10 bg-[#12131d] px-3 py-3 sm:hidden animate-in slide-in-from-top-2 duration-150">
          <LiveSearch
            variant="mobile"
            autoFocus
            onSelect={() => setIsMobileSearchOpen(false)}
          />
        </div>
      )}
    </header>
  );
}
