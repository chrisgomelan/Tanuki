"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import MovieCard from "@/components/MovieCard";
import {
  CalendarIcon,
  ChevronDownIcon,
  CloseIcon,
  FilmIcon,
  FlameIcon,
  SearchIcon,
  SlidersIcon,
  StarIcon,
} from "@/components/Icons";
import type { MovieBase } from "@/types/movie";

const GENRES = [
  "All",
  "Action",
  "Sci-Fi",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Drama",
  "Fantasy",
  "Horror",
  "Mystery",
  "Romance",
  "Thriller",
  "History",
  "Family",
];

const YEARS = [
  { value: "All", label: "All Years" },
  { value: "2025", label: "2025" },
  { value: "2024", label: "2024" },
  { value: "2023", label: "2023" },
  { value: "2022", label: "2022" },
  { value: "2021", label: "2021" },
  { value: "2020", label: "2020" },
  { value: "2010s", label: "2010s (2010–2019)" },
  { value: "2000s", label: "2000s (2000–2009)" },
  { value: "classic", label: "Classics (Pre-2000)" },
];

const RATINGS = [
  { value: 0, label: "Any Rating" },
  { value: 8, label: "★ 8.0+ Exceptional" },
  { value: 7, label: "★ 7.0+ Great" },
  { value: 6, label: "★ 6.0+ Good" },
];

const SORTS = [
  { value: "trending", label: "Popular / Trending" },
  { value: "rating", label: "Highest Rated" },
  { value: "newest", label: "Newest Release" },
  { value: "oldest", label: "Oldest Release" },
  { value: "title", label: "Title (A – Z)" },
];

function matchesYearLocal(releaseDate: string | undefined | null, yearFilter: string): boolean {
  if (!yearFilter || yearFilter === "All") return true;
  if (!releaseDate) return false;
  const y = parseInt(releaseDate.slice(0, 4), 10);
  if (isNaN(y)) return false;

  if (/^\d{4}$/.test(yearFilter)) {
    return y === parseInt(yearFilter, 10);
  }
  if (yearFilter === "2020s") return y >= 2020 && y <= 2029;
  if (yearFilter === "2010s") return y >= 2010 && y <= 2019;
  if (yearFilter === "2000s") return y >= 2000 && y <= 2009;
  if (yearFilter === "classic") return y < 2000;
  return true;
}

interface HomeGenreSectionProps {
  initialTrending: MovieBase[];
  initialTopRated: MovieBase[];
}

export default function HomeGenreSection({
  initialTrending,
  initialTopRated,
}: HomeGenreSectionProps) {
  // Primary Filter State
  const [selectedGenre, setSelectedGenre] = useState<string>("All");
  const [selectedYear, setSelectedYear] = useState<string>("All");
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedSort, setSelectedSort] = useState<string>("trending");
  const [searchFilter, setSearchFilter] = useState<string>("");

  // Base raw movie pool for current [genre, year]
  const [rawMovies, setRawMovies] = useState<MovieBase[]>(() => {
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

  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  const cacheRef = useRef<Map<string, MovieBase[]>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize cache with default All + All
  useEffect(() => {
    cacheRef.current.set("All___All", rawMovies);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch movies when genre or year changes
  const fetchCategoryMovies = async (genre: string, year: string) => {
    const cacheKey = `${genre}___${year}`;
    setPage(1);
    setHasMore(true);

    const cached = cacheRef.current.get(cacheKey);
    if (cached) {
      setRawMovies(cached);
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
      const res = await fetch(
        `/api/genre?name=${encodeURIComponent(genre)}&year=${encodeURIComponent(year)}&page=1`,
        { signal: controller.signal }
      );
      if (res.ok) {
        const data = await res.json();
        const results: MovieBase[] = data.results ?? [];
        cacheRef.current.set(cacheKey, results);
        setRawMovies(results);
        setHasMore(results.length >= 18);
      } else {
        setRawMovies([]);
        setHasMore(false);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }
      setRawMovies([]);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenreChange = (newGenre: string) => {
    setSelectedGenre(newGenre);
    fetchCategoryMovies(newGenre, selectedYear);
  };

  const handleYearChange = (newYear: string) => {
    setSelectedYear(newYear);
    fetchCategoryMovies(selectedGenre, newYear);
  };

  const handleResetFilters = () => {
    setSelectedGenre("All");
    setSelectedYear("All");
    setMinRating(0);
    setSelectedSort("trending");
    setSearchFilter("");
    fetchCategoryMovies("All", "All");
  };

  const hasActiveFilters =
    selectedGenre !== "All" ||
    selectedYear !== "All" ||
    minRating > 0 ||
    selectedSort !== "trending" ||
    searchFilter.trim() !== "";

  // Load More Handler for current genre + year
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    const nextPage = page + 1;
    setIsLoadingMore(true);

    try {
      const res = await fetch(
        `/api/genre?name=${encodeURIComponent(selectedGenre)}&year=${encodeURIComponent(
          selectedYear
        )}&page=${nextPage}`
      );
      if (res.ok) {
        const data = await res.json();
        const nextResults: MovieBase[] = data.results ?? [];
        if (nextResults.length === 0) {
          setHasMore(false);
        } else {
          setRawMovies((prev) => {
            const seen = new Set(prev.map((m) => String(m.id)));
            const unique = nextResults.filter((m) => !seen.has(String(m.id)));
            const updated = [...prev, ...unique];
            const cacheKey = `${selectedGenre}___${selectedYear}`;
            cacheRef.current.set(cacheKey, updated);
            return updated;
          });
          setPage(nextPage);
          if (nextResults.length < 18) setHasMore(false);
        }
      }
    } catch (err) {
      console.warn("Load more movies error:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Filter & Sort Pipeline
  const filteredMovies = useMemo(() => {
    let result = [...rawMovies];

    // Filter by Year
    if (selectedYear !== "All") {
      result = result.filter((m) => matchesYearLocal(m.release_date, selectedYear));
    }

    // Filter by Minimum Rating
    if (minRating > 0) {
      result = result.filter((m) => m.vote_average >= minRating);
    }

    // Filter by Search Query
    const q = searchFilter.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          (m.original_title ?? "").toLowerCase().includes(q) ||
          m.genres.some((g) => g.toLowerCase().includes(q))
      );
    }

    // Sort Pipeline
    if (selectedSort === "rating") {
      result.sort((a, b) => b.vote_average - a.vote_average);
    } else if (selectedSort === "newest") {
      result.sort((a, b) => (b.release_date || "").localeCompare(a.release_date || ""));
    } else if (selectedSort === "oldest") {
      result.sort((a, b) => (a.release_date || "").localeCompare(b.release_date || ""));
    } else if (selectedSort === "title") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }
    // "trending": preserve API default order

    return result;
  }, [rawMovies, selectedYear, minRating, searchFilter, selectedSort]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Filter Hub Card */}
      <section
        aria-label="Movie Filters and Discovery"
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-zinc-900/60 p-3.5 sm:p-6 ring-1 ring-white/10 backdrop-blur-xl shadow-2xl space-y-4"
      >
        {/* Header row with Title & Quick Reset */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30">
              <SlidersIcon className="size-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                Discover & Filter Movies
                <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              </h2>
              <p className="text-[11px] sm:text-xs text-white/50">
                Filter by genre, release year, score, or sort by preference
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-white/5 px-2.5 py-1 text-[11px] sm:text-xs font-semibold text-white/70 ring-1 ring-white/10">
              {filteredMovies.length} {filteredMovies.length === 1 ? "movie" : "movies"}
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 rounded-lg bg-amber-500/20 px-2.5 py-1 text-[11px] sm:text-xs font-bold text-amber-300 ring-1 ring-amber-500/30 hover:bg-amber-500 hover:text-black transition active:scale-95 cursor-pointer"
              >
                <CloseIcon className="size-3" />
                <span>Reset All</span>
              </button>
            )}
          </div>
        </div>

        {/* Primary Controls Grid */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-5">
          {/* Genre Dropdown */}
          <div className="relative">
            <label htmlFor="filter-genre" className="sr-only">
              Filter by Genre
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-amber-400/80">
                <FilmIcon className="size-3.5" />
              </span>
              <select
                id="filter-genre"
                value={selectedGenre}
                onChange={(e) => handleGenreChange(e.target.value)}
                className="h-10 w-full appearance-none rounded-xl bg-white/5 pl-8 pr-8 text-xs font-bold text-white ring-1 ring-white/10 transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer"
              >
                {GENRES.map((g) => (
                  <option key={g} value={g} className="bg-zinc-900 text-white">
                    {g === "All" ? "All Genres" : g}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40">
                <ChevronDownIcon className="size-3" />
              </span>
            </div>
          </div>

          {/* Year Dropdown */}
          <div className="relative">
            <label htmlFor="filter-year" className="sr-only">
              Filter by Year
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-amber-400/80">
                <CalendarIcon className="size-3.5" />
              </span>
              <select
                id="filter-year"
                value={selectedYear}
                onChange={(e) => handleYearChange(e.target.value)}
                className="h-10 w-full appearance-none rounded-xl bg-white/5 pl-8 pr-8 text-xs font-bold text-white ring-1 ring-white/10 transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer"
              >
                {YEARS.map((y) => (
                  <option key={y.value} value={y.value} className="bg-zinc-900 text-white">
                    {y.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40">
                <ChevronDownIcon className="size-3" />
              </span>
            </div>
          </div>

          {/* Min Rating Dropdown */}
          <div className="relative">
            <label htmlFor="filter-rating" className="sr-only">
              Filter by Minimum Rating
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-amber-400">
                <StarIcon className="size-3.5" />
              </span>
              <select
                id="filter-rating"
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="h-10 w-full appearance-none rounded-xl bg-white/5 pl-8 pr-8 text-xs font-bold text-white ring-1 ring-white/10 transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer"
              >
                {RATINGS.map((r) => (
                  <option key={r.value} value={r.value} className="bg-zinc-900 text-white">
                    {r.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40">
                <ChevronDownIcon className="size-3" />
              </span>
            </div>
          </div>

          {/* Sort By Dropdown */}
          <div className="relative">
            <label htmlFor="filter-sort" className="sr-only">
              Sort Movies
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-amber-400/80">
                <FlameIcon className="size-3.5" />
              </span>
              <select
                id="filter-sort"
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="h-10 w-full appearance-none rounded-xl bg-white/5 pl-8 pr-8 text-xs font-bold text-white ring-1 ring-white/10 transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value} className="bg-zinc-900 text-white">
                    {s.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40">
                <ChevronDownIcon className="size-3" />
              </span>
            </div>
          </div>

          {/* Search Filter Input (Full width on mobile, 5th col on desktop) */}
          <div className="col-span-2 sm:col-span-4 lg:col-span-1 relative">
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                <SearchIcon className="size-3.5" />
              </span>
              <input
                type="text"
                placeholder="Filter titles..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="h-10 w-full rounded-xl bg-white/5 pl-8 pr-8 text-xs font-semibold text-white placeholder-white/35 ring-1 ring-white/10 transition hover:bg-white/10 focus:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              />
              {searchFilter && (
                <button
                  type="button"
                  onClick={() => setSearchFilter("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition"
                  title="Clear filter text"
                >
                  <CloseIcon className="size-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Genre Pills (Instant 1-tap switching) */}
        <div className="pt-1">
          <div className="-mx-3.5 px-3.5 sm:mx-0 sm:px-0 flex gap-1.5 overflow-x-auto pb-1 no-scrollbar touch-scroll">
            {GENRES.map((g) => {
              const isActive = selectedGenre === g;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => handleGenreChange(g)}
                  aria-pressed={isActive}
                  className={`h-8 px-3.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all active:scale-95 cursor-pointer shrink-0 ${
                    isActive
                      ? "bg-amber-500 text-black shadow-md shadow-amber-950/60 ring-1 ring-amber-300"
                      : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white ring-1 ring-white/10"
                  }`}
                >
                  {g === "All" ? "All Genres" : g}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Filter Chips Row */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] border-t border-white/5">
            <span className="font-semibold text-white/40 mr-1">Active Filters:</span>

            {selectedGenre !== "All" && (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-0.5 font-bold text-amber-300 ring-1 ring-amber-500/30">
                Genre: {selectedGenre}
                <button
                  type="button"
                  onClick={() => handleGenreChange("All")}
                  className="hover:text-white ml-0.5 cursor-pointer"
                  title="Remove genre filter"
                >
                  <CloseIcon className="size-2.5" />
                </button>
              </span>
            )}

            {selectedYear !== "All" && (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-0.5 font-bold text-amber-300 ring-1 ring-amber-500/30">
                Year: {YEARS.find((y) => y.value === selectedYear)?.label || selectedYear}
                <button
                  type="button"
                  onClick={() => handleYearChange("All")}
                  className="hover:text-white ml-0.5 cursor-pointer"
                  title="Remove year filter"
                >
                  <CloseIcon className="size-2.5" />
                </button>
              </span>
            )}

            {minRating > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-0.5 font-bold text-amber-300 ring-1 ring-amber-500/30">
                Rating: {minRating}.0+
                <button
                  type="button"
                  onClick={() => setMinRating(0)}
                  className="hover:text-white ml-0.5 cursor-pointer"
                  title="Remove rating filter"
                >
                  <CloseIcon className="size-2.5" />
                </button>
              </span>
            )}

            {selectedSort !== "trending" && (
              <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-0.5 font-semibold text-white/80 ring-1 ring-white/15">
                Sort: {SORTS.find((s) => s.value === selectedSort)?.label}
                <button
                  type="button"
                  onClick={() => setSelectedSort("trending")}
                  className="hover:text-white ml-0.5 cursor-pointer"
                  title="Reset sort"
                >
                  <CloseIcon className="size-2.5" />
                </button>
              </span>
            )}

            {searchFilter.trim() && (
              <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-0.5 font-semibold text-white/80 ring-1 ring-white/15">
                Keyword: &ldquo;{searchFilter}&rdquo;
                <button
                  type="button"
                  onClick={() => setSearchFilter("")}
                  className="hover:text-white ml-0.5 cursor-pointer"
                  title="Clear keyword"
                >
                  <CloseIcon className="size-2.5" />
                </button>
              </span>
            )}
          </div>
        )}
      </section>

      {/* Movies Grid & States */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 12 }).map((_, idx) => (
            <div
              key={idx}
              className="aspect-[2/3] w-full animate-pulse rounded-2xl bg-white/5 ring-1 ring-white/10"
            />
          ))}
        </div>
      ) : filteredMovies.length === 0 ? (
        <div className="rounded-2xl sm:rounded-3xl border border-dashed border-white/10 py-16 text-center px-4 space-y-3">
          <p className="text-base font-bold text-white">No movies match your current criteria</p>
          <p className="text-xs text-white/50 max-w-md mx-auto">
            Try adjusting your genre, year, minimum score, or clear the search query to see more
            titles.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-black transition hover:bg-amber-400 active:scale-95 cursor-pointer shadow-lg shadow-amber-950/50"
          >
            <span>Reset All Filters</span>
          </button>
        </div>
      ) : (
        <section aria-label="Filtered Movie Results" className="space-y-6">
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {filteredMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-amber-500/20 px-8 py-3.5 text-xs font-bold text-amber-300 ring-1 ring-amber-500/40 transition hover:bg-amber-500 hover:text-black active:scale-95 disabled:opacity-50 cursor-pointer shadow-lg shadow-amber-950/30"
              >
                {isLoadingMore ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
                ) : (
                  <ChevronDownIcon className="size-4" />
                )}
                <span>
                  {isLoadingMore
                    ? "Loading more movies…"
                    : `Load More ${selectedGenre !== "All" ? selectedGenre : ""} Movies`}
                </span>
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
