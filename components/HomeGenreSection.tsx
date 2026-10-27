"use client";

import { useRef, useState } from "react";
import MovieCard from "@/components/MovieCard";
import { FlameIcon, StarIcon } from "@/components/Icons";
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
  const [genreMovies, setGenreMovies] = useState<MovieBase[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const cacheRef = useRef<Map<string, MovieBase[]>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSelectGenre = async (genre: string) => {
    setSelectedGenre(genre);

    if (genre === "All") {
      setGenreMovies([]);
      setIsLoading(false);
      return;
    }

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
      const res = await fetch(`/api/genre?name=${encodeURIComponent(genre)}`, {
        signal: controller.signal,
      });
      if (res.ok) {
        const data = await res.json();
        const results: MovieBase[] = data.results ?? [];
        cacheRef.current.set(genre, results);
        setGenreMovies(results);
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

  return (
    <div className="space-y-8 sm:space-y-12">
      {/* Category / Genre Filter Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-white/60">
          <span>Movie Categories & Genres</span>
          {selectedGenre !== "All" && (
            <button
              type="button"
              onClick={() => handleSelectGenre("All")}
              className="text-amber-400 hover:underline"
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
                className={`h-9 px-4 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
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
        <>
          {/* Trending Movies Section */}
          <section aria-labelledby="trending-heading">
            <div className="mb-3.5 flex items-center gap-2">
              <FlameIcon className="size-5 text-amber-400" />
              <h2 id="trending-heading" className="text-lg sm:text-xl font-bold text-white">
                Trending Movies
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {initialTrending.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </section>

          {/* Top Rated Movies Section */}
          <section aria-labelledby="top-rated-heading">
            <div className="mb-3.5 flex items-center gap-2">
              <StarIcon className="size-5 text-amber-400" />
              <h2 id="top-rated-heading" className="text-lg sm:text-xl font-bold text-white">
                Top Rated Classics & Masterpieces
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {initialTopRated.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </section>
        </>
      ) : (
        /* Specific Genre View */
        <section aria-labelledby="genre-heading" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
              <h2 id="genre-heading" className="text-lg sm:text-xl font-bold text-white">
                {selectedGenre} Movies
              </h2>
            </div>
            {!isLoading && (
              <span className="text-xs font-semibold text-white/40">
                {genreMovies.length} {genreMovies.length === 1 ? "movie" : "movies"}
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
                className="mt-3 text-xs font-semibold text-amber-400 hover:underline"
              >
                Back to All Movies
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {genreMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
