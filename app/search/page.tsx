import Link from "next/link";
import { ChevronLeftIcon, SearchIcon } from "@/components/Icons";
import MovieCard from "@/components/MovieCard";
import LiveSearch from "@/components/LiveSearch";
import { searchMovies } from "@/lib/movies-api";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const results = query ? await searchMovies(query, 36) : [];

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-xl bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white transition active:scale-95 ring-1 ring-white/10"
        >
          <ChevronLeftIcon className="size-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Header & Direct Search Bar */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30 shrink-0">
            <SearchIcon className="size-4" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              {query ? `Search Results for "${query}"` : "Search Movies"}
            </h1>
            <p className="text-xs text-white/50">
              {results.length} {results.length === 1 ? "movie" : "movies"} found
            </p>
          </div>
        </div>

        {/* Search Input on page for easy mobile access */}
        <div className="max-w-xl">
          <LiveSearch variant="mobile" autoFocus={!query} />
        </div>
      </div>

      {/* Results Grid */}
      {results.length === 0 ? (
        <div className="rounded-2xl sm:rounded-3xl border border-dashed border-white/10 py-16 sm:py-20 text-center px-4">
          <p className="text-sm font-semibold text-white/60">
            {query
              ? `No movies found matching "${query}".`
              : "Type a title, actor, or genre above to discover movies."}
          </p>
          <p className="mt-1 text-xs text-white/40">
            Instant search updates as you type with real-time suggestions.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-black transition hover:bg-amber-400 active:scale-95"
          >
            <span>Back to Browse</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {results.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
}
