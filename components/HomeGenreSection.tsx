"use client";

import { useEffect, useRef, useState } from "react";
import MovieCard from "@/components/MovieCard";
import { FlameIcon, StarIcon, ChevronDownIcon, FilmIcon } from "@/components/Icons";
import type { MovieBase } from "@/types/movie";

const GENRES = [
  "All",
  "Action",
  "Sci-Fi",
  "Adventure",
  "Animation",
  "Comedy",
  "Drama",
  "Horror",
  "Romance",
  "Thriller",
  "Crime",
  "Mystery",
];

interface HomeGenreSectionProps {
  initialTrending: MovieBase[];
  initialTopRated: MovieBase[];
}

export default function HomeGenreSection({
  initialTrending,
  initialTopRated,
}: HomeGenreSectionProps) {
  const [selectedGenre, setSelectedGenre] = useState("All");

  // State for "All" tab infinite load
  const [allMovies, setAllMovies] = useState<MovieBase[]>(() => {
    const seen = new Set<string>();
    const list: MovieBase[] = [];
    for (const m of [...initialTrending, ...initialTopRated]) {
      const id = String(m.id);
      if (!seen.has(id)) {
        seen.add(id);
        list.push(m);
      }
    }
    return list;
  });
  const [allPage, setAllPage] = useState(1);
  const [hasMoreAll, setHasMoreAll] = useState(true);

  // State for specific genre view
  const [genreMovies, setGenreMovies] = useState<MovieBase[]>([]);
  const [genrePage, setGenrePage] = useState(1);
  const [hasMoreGenre, setHasMoreGenre] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const cacheRef = useRef<Map<string, MovieBase[]>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSelectGenre = async (genre: string) => {
    setSelectedGenre(genre);

    if (genre === "All") {
      setIsLoading(false);
      return;
    }

    setGenrePage(1);
    setHasMoreGenre(true);

    const cached = cacheRef.current.get(genre);
    if (cached) {
      setGenreMovies(cached);
      setIsLoading(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/genre?name=${encodeURIComponent(genre)}&page=1`, {
        signal: controller.signal,
      });
      if (res.ok) {
        const data = await res.json();
        const results: MovieBase[] = data.results ?? [];
        cacheRef.current.set(genre, results);
        setGenreMovies(results);
        setHasMoreGenre(results.length >= 18);
      } else {
        setGenreMovies([]);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }
      setGenreMovies([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load More handler (works for both "All" and specific genres!)
  const handleLoadMore = async () => {
    if (isLoadingMore) return;

    if (selectedGenre === "All") {
      if (!hasMoreAll) return;
      const nextPage = allPage + 1;
      setIsLoadingMore(true);

      try {
        const res = await fetch(`/api/genre?name=All&page=${nextPage}`);
        if (res.ok) {
          const data = await res.json();
          const nextResults: MovieBase[] = data.results ?? [];
          if (nextResults.length === 0) {
            setHasMoreAll(false);
          } else {
            setAllMovies((prev) => {
              const seen = new Set(prev.map((m) => String(m.id)));
              const unique = nextResults.filter((m) => !seen.has(String(m.id)));
              return [...prev, ...unique];
            });
            setAllPage(nextPage);
            if (nextResults.length < 18) setHasMoreAll(false);
          }
        }
      } catch (err) {
        console.warn("Load more all movies error:", err);
      } finally {
        setIsLoadingMore(false);
      }
      return;
    }

    // Load more for specific genre
    if (!hasMoreGenre) return;
    const nextPage = genrePage + 1;
    setIsLoadingMore(true);

    try {
      const res = await fetch(`/api/genre?name=${encodeURIComponent(selectedGenre)}&page=${nextPage}`);
      if (res.ok) {
        const data = await res.json();
        const nextResults: MovieBase[] = data.results ?? [];
        if (nextResults.length === 0) {
          setHasMoreGenre(false);
        } else {
          setGenreMovies((prev) => {
            const seen = new Set(prev.map((m) => String(m.id)));
            const unique = nextResults.filter((m) => !seen.has(String(m.id)));
            const updated = [...prev, ...unique];
            cacheRef.current.set(selectedGenre, updated);
            return updated;
          });
          setGenrePage(nextPage);
          if (nextResults.length < 18) setHasMoreGenre(false);
        }
      }
    } catch (err) {
      console.warn("Load more genre movies error:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <div className="space-y-8 sm:space-y-12">
      {/* Category / Genre Filter Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-white/60">
          <div className="flex items-center gap-2">
            <FilmIcon className="size-4 text-amber-400" />
            <span>Movie Categories & Genres</span>
          </div>
          {selectedGenre !== "All" && (
            <button
              type="button"
              onClick={() => handleSelectGenre("All")}
              className="text-amber-400 hover:underline cursor-pointer"
            >
              Reset to All
            </button>
          )}
        </div>

        {/* Scrollable genre pills container */}
        <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
          {GENRES.map((genre) => {
            const isActive = selectedGenre === genre;
            return (
              <button
                key={genre}
                type="button"
                onClick={() => handleSelectGenre(genre)}
                aria-pressed={isActive}
                className={`h-9 px-4 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 cursor-pointer ${
                  isActive
                    ? "bg-amber-500 text-black shadow-lg shadow-amber-950/60 ring-1 ring-amber-300 scale-[1.02]"
                    : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white ring-1 ring-white/10"
                }`}
              >
                {genre}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Rendering: All Mode vs Specific Genre View */}
      {selectedGenre === "All" ? (
        <div className="space-y-8">
          {/* Trending & All Movies Combined Feed */}
          <section aria-labelledby="all-movies-heading" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FlameIcon className="size-5 text-amber-400" />
                <h2 id="all-movies-heading" className="text-lg sm:text-xl font-bold text-white">
                  All Trending & Popular Movies
                </h2>
              </div>
              <span className="text-xs text-white/40 font-semibold">
                {allMovies.length} movies loaded
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {allMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>

            {/* Load More Button for All Movies */}
            {hasMoreAll && (
              <div className="flex justify-center pt-4">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="flex items-center gap-2 rounded-xl bg-amber-500/20 px-8 py-3 text-xs font-bold text-amber-300 ring-1 ring-amber-500/40 transition hover:bg-amber-500 hover:text-black active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isLoadingMore ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
                  ) : (
                    <ChevronDownIcon className="size-4" />
                  )}
                  <span>{isLoadingMore ? "Loading more movies…" : "Load More Movies"}</span>
                </button>
              </div>
            )}
          </section>
        </div>
      ) : (
        /* Specific Genre View */
        <section aria-labelledby="genre-heading" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
              <h2 id="genre-heading" className="text-lg sm:text-xl font-bold text-white">
                {selectedGenre} Movies
              </h2>
            </div>
            {!isLoading && (
              <span className="text-xs font-semibold text-white/40">
                {genreMovies.length} movies loaded
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {Array.from({ length: 12 }).map((_, idx) => (
                <div
                  key={idx}
                  className="aspect-[2/3] w-full animate-pulse rounded-2xl bg-white/5 ring-1 ring-white/10"
                />
              ))}
            </div>
          ) : genreMovies.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center">
              <p className="text-sm text-white/50">
                No movies found in category &quot;{selectedGenre}&quot;.
              </p>
              <button
                type="button"
                onClick={() => handleSelectGenre("All")}
                className="mt-3 text-xs font-semibold text-amber-400 hover:underline cursor-pointer"
              >
                Back to All Movies
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {genreMovies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>

              {/* Load More Button for Genre */}
              {hasMoreGenre && (
                <div className="flex justify-center pt-4">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="flex items-center gap-2 rounded-xl bg-amber-500/20 px-8 py-3 text-xs font-bold text-amber-300 ring-1 ring-amber-500/40 transition hover:bg-amber-500 hover:text-black active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {isLoadingMore ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
                    ) : (
                      <ChevronDownIcon className="size-4" />
                    )}
                    <span>{isLoadingMore ? "Loading more movies…" : `Load More ${selectedGenre} Movies`}</span>
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      )}
    </div>
  );
}
