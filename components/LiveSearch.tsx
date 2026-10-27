"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRightIcon, CloseIcon, SearchIcon, StarIcon } from "@/components/Icons";
import type { MovieBase } from "@/types/movie";

interface LiveSearchProps {
  variant?: "desktop" | "mobile";
  onSelect?: () => void;
  autoFocus?: boolean;
}

export default function LiveSearch({
  variant = "desktop",
  onSelect,
  autoFocus = false,
}: LiveSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MovieBase[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const cacheRef = useRef<Map<string, MovieBase[]>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced AJAX search effect
  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setResults([]);
      setIsLoading(false);
      setHasSearched(false);
      setIsOpen(false);
      return;
    }

    // Check memory cache first
    const cached = cacheRef.current.get(trimmed.toLowerCase());
    if (cached) {
      setResults(cached);
      setIsLoading(false);
      setHasSearched(true);
      setIsOpen(true);
      return;
    }

    setIsLoading(true);
    setIsOpen(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        const items: MovieBase[] = data.results ?? [];

        cacheRef.current.set(trimmed.toLowerCase(), items);
        setResults(items);
        setHasSearched(true);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        setResults([]);
        setHasSearched(true);
      } finally {
        setIsLoading(false);
      }
    }, 280);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setIsOpen(false);
    onSelect?.();
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleSelectMovie = (id: string | number) => {
    setIsOpen(false);
    onSelect?.();
    router.push(`/movie/${id}`);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const isMobile = variant === "mobile";

  return (
    <div ref={containerRef} className={`relative ${isMobile ? "w-full" : "w-48 md:w-60 lg:w-72"}`}>
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <label htmlFor={`live-search-${variant}`} className="sr-only">
          Search movies
        </label>
        <div className="relative w-full">
          <input
            ref={inputRef}
            id={`live-search-${variant}`}
            type="text"
            inputMode="search"
            autoFocus={autoFocus}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (query.trim().length >= 2) {
                setIsOpen(true);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setIsOpen(false);
              }
            }}
            placeholder="Search movie title, director…"
            autoComplete="off"
            className={`w-full rounded-xl bg-white/10 text-xs text-white placeholder-white/40 ring-1 ring-white/15 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden [&::-ms-clear]:hidden ${
              isMobile ? "h-10 pl-3.5 pr-10 text-sm" : "h-9 pl-3.5 pr-8 focus:w-72 lg:focus:w-80"
            }`}
          />

          {/* Right indicator: spinner or clear button */}
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {isLoading ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
            ) : query.length > 0 ? (
              <button
                type="button"
                onClick={handleClear}
                className="text-white/40 hover:text-white transition"
                aria-label="Clear search input"
              >
                <CloseIcon className="size-3" />
              </button>
            ) : (
              <SearchIcon className="size-3.5 text-white/30 pointer-events-none" />
            )}
          </div>
        </div>
      </form>

      {/* Live Results Dropdown */}
      {isOpen && query.trim().length >= 2 && (
        <div
          role="listbox"
          className={`absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl bg-[#141520]/95 backdrop-blur-xl ring-1 ring-white/15 shadow-2xl shadow-black/80 animate-in fade-in zoom-in-95 duration-150 ${
            isMobile ? "w-full" : "min-w-[320px] max-w-[380px]"
          }`}
        >
          {results.length > 0 ? (
            <div className="max-h-80 overflow-y-auto divide-y divide-white/5 py-1 scrollbar-thin">
              <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-400/80">
                Live Movie Matches
              </div>
              {results.map((movie) => {
                const year = movie.release_date?.slice(0, 4);
                return (
                  <button
                    key={movie.id}
                    type="button"
                    onClick={() => handleSelectMovie(movie.id)}
                    className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition hover:bg-white/10 active:bg-amber-500/20"
                  >
                    <div className="relative h-12 w-9 flex-shrink-0 overflow-hidden rounded-md bg-white/5 ring-1 ring-white/10">
                      {movie.poster_path ? (
                        <Image
                          src={movie.poster_path}
                          alt={movie.title}
                          fill
                          sizes="36px"
                          className="object-cover"
                        />
                      ) : null}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="truncate text-xs font-semibold text-white">
                        {movie.title}
                      </h4>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-white/50">
                        {year && <span>{year}</span>}
                        {movie.runtime && <span>• {movie.runtime} min</span>}
                        {movie.genres?.[0] && <span>• {movie.genres[0]}</span>}
                      </div>
                    </div>

                    {movie.vote_average > 0 && (
                      <div className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-bold text-amber-300 ring-1 ring-amber-500/30 shrink-0">
                        <StarIcon className="size-2.5 text-amber-400" />
                        <span>{movie.vote_average.toFixed(1)}</span>
                      </div>
                    )}
                  </button>
                );
              })}

              <Link
                href={`/search?q=${encodeURIComponent(query.trim())}`}
                onClick={() => {
                  setIsOpen(false);
                  onSelect?.();
                }}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition"
              >
                <span>View all results for &quot;{query}&quot;</span>
                <ChevronRightIcon className="size-3.5" />
              </Link>
            </div>
          ) : hasSearched && !isLoading ? (
            <div className="px-4 py-6 text-center">
              <p className="text-xs font-medium text-white/60">
                No movies found for &quot;{query}&quot;
              </p>
              <button
                type="button"
                onClick={handleSubmit}
                className="mt-2 text-xs font-semibold text-amber-400 hover:underline"
              >
                Press Enter to search
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
