"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookmarkIcon, HomeIcon, SearchIcon } from "@/components/Icons";
import { useMovieSavepoints } from "@/lib/savepoints";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { ready, savepoints } = useMovieSavepoints();
  const savedCount = ready ? Object.keys(savepoints).length : 0;

  const isHome = pathname === "/";
  const isSearch = pathname === "/search";
  const isLibrary = pathname === "/library";

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 sm:hidden border-t border-white/10 bg-[#0c0d14]/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-8px_24px_rgba(0,0,0,0.6)]"
    >
      <div className="grid grid-cols-3 h-14 items-center px-2 max-w-md mx-auto">
        {/* Home Tab */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center gap-1 h-full rounded-xl transition-all duration-150 active:scale-90 ${
            isHome
              ? "text-amber-400 font-bold"
              : "text-white/60 hover:text-white"
          }`}
        >
          <div className="relative">
            <HomeIcon className="size-5" />
            {isHome && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-amber-400 shadow-sm shadow-amber-400" />
            )}
          </div>
          <span className="text-[10px] tracking-tight">Home</span>
        </Link>

        {/* Search Tab */}
        <Link
          href="/search"
          className={`flex flex-col items-center justify-center gap-1 h-full rounded-xl transition-all duration-150 active:scale-90 ${
            isSearch
              ? "text-amber-400 font-bold"
              : "text-white/60 hover:text-white"
          }`}
        >
          <div className="relative">
            <SearchIcon className="size-5" />
            {isSearch && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-amber-400 shadow-sm shadow-amber-400" />
            )}
          </div>
          <span className="text-[10px] tracking-tight">Search</span>
        </Link>

        {/* My Library Tab */}
        <Link
          href="/library"
          className={`flex flex-col items-center justify-center gap-1 h-full rounded-xl transition-all duration-150 active:scale-90 ${
            isLibrary
              ? "text-amber-400 font-bold"
              : "text-white/60 hover:text-white"
          }`}
        >
          <div className="relative">
            <BookmarkIcon className="size-5" />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-extrabold text-black ring-1 ring-[#0c0d14]">
                {savedCount > 99 ? "99+" : savedCount}
              </span>
            )}
            {isLibrary && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-amber-400 shadow-sm shadow-amber-400" />
            )}
          </div>
          <span className="text-[10px] tracking-tight">Library</span>
        </Link>
      </div>
    </nav>
  );
}
