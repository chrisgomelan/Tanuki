import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ClockIcon,
  FilmIcon,
  StarIcon,
} from "@/components/Icons";
import SaveButton from "@/components/SaveButton";
import WatchPlayer from "@/components/WatchPlayer";
import { getMovieById, getMoviesByGenre } from "@/lib/movies-api";
import MovieCard from "@/components/MovieCard";

interface MoviePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: MoviePageProps) {
  const { id } = await params;
  const movie = await getMovieById(Number(id));
  if (!movie) return { title: "Movie Not Found — Tanuki" };

  return {
    title: `${movie.title} — Watch on Tanuki`,
    description: movie.overview,
  };
}

export default async function MovieDetailsPage({ params }: MoviePageProps) {
  const { id } = await params;
  const movie = await getMovieById(Number(id));

  if (!movie) {
    notFound();
  }

  const primaryGenre = movie.genres?.[0] ?? "Action";
  const relatedMovies = (await getMoviesByGenre(primaryGenre, 7)).filter(
    (m) => m.id !== movie.id
  ).slice(0, 6);

  const year = movie.release_date ? movie.release_date.slice(0, 4) : "";

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Back Link */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-xl bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white transition active:scale-95 ring-1 ring-white/10"
        >
          <ChevronLeftIcon className="size-4" />
          <span>Back to Movies</span>
        </Link>
      </div>

      {/* Movie Details Header Card */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-zinc-900/60 p-3.5 sm:p-8 ring-1 ring-white/10 backdrop-blur-xl">
        {movie.backdrop_path && (
          <div className="absolute inset-0 -z-10">
            <Image unoptimized src={movie.backdrop_path}
              alt={movie.title}
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-25 brightness-50"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d14] via-[#0c0d14]/80 to-transparent" />
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-5 sm:gap-8 items-start">
          {/* Poster */}
          <div className="relative aspect-[2/3] w-36 sm:w-52 md:w-64 shrink-0 overflow-hidden rounded-xl sm:rounded-2xl bg-zinc-900 ring-1 ring-white/20 shadow-2xl mx-auto md:mx-0">
            {movie.poster_path ? (
              <Image unoptimized src={movie.poster_path}
                alt={movie.title}
                fill
                priority
                sizes="(max-width: 768px) 160px, 256px"
                className="object-cover"
              />
            ) : null}
          </div>

          {/* Metadata Specs & Overview */}
          <div className="flex-1 space-y-3.5 sm:space-y-4 w-full">
            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                {movie.genres.map((g) => (
                  <span
                    key={g}
                    className="rounded-lg bg-amber-500/20 px-2 sm:px-2.5 py-0.5 text-[11px] sm:text-xs font-bold text-amber-300 ring-1 ring-amber-500/30"
                  >
                    {g}
                  </span>
                ))}
                {movie.status && (
                  <span className="rounded-lg bg-white/10 px-2 py-0.5 text-[11px] sm:text-xs font-semibold text-white/70 ring-1 ring-white/15">
                    {movie.status}
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-white break-words">
                {movie.title}
              </h1>

              {movie.tagline && (
                <p className="mt-1 text-xs sm:text-sm font-semibold italic text-amber-300/80">
                  &ldquo;{movie.tagline}&rdquo;
                </p>
              )}
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div className="rounded-xl bg-white/5 p-2 sm:p-2.5 ring-1 ring-white/10">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-white/40 block">
                  Score
                </span>
                <div className="mt-0.5 flex items-center gap-1 font-bold text-amber-400 text-xs sm:text-sm">
                  <StarIcon className="size-3 sm:size-3.5" />
                  <span>{movie.vote_average.toFixed(1)} / 10</span>
                </div>
              </div>

              <div className="rounded-xl bg-white/5 p-2 sm:p-2.5 ring-1 ring-white/10">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-white/40 block">
                  Duration
                </span>
                <div className="mt-0.5 flex items-center gap-1 font-bold text-white text-xs sm:text-sm">
                  <ClockIcon className="size-3 sm:size-3.5 text-white/50" />
                  <span>{movie.runtime ? `${movie.runtime}m` : "N/A"}</span>
                </div>
              </div>

              <div className="rounded-xl bg-white/5 p-2 sm:p-2.5 ring-1 ring-white/10">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-white/40 block">
                  Year
                </span>
                <div className="mt-0.5 flex items-center gap-1 font-bold text-white text-xs sm:text-sm">
                  <CalendarIcon className="size-3 sm:size-3.5 text-white/50" />
                  <span>{year || "N/A"}</span>
                </div>
              </div>

              <div className="rounded-xl bg-white/5 p-2 sm:p-2.5 ring-1 ring-white/10">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-white/40 block">
                  Format
                </span>
                <div className="mt-0.5 flex items-center gap-1 font-bold text-white text-xs sm:text-sm">
                  <FilmIcon className="size-3 sm:size-3.5 text-white/50" />
                  <span>Movie</span>
                </div>
              </div>
            </div>

            {/* Synopsis */}
            <div>
              <h2 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white/40 mb-1">
                Storyline
              </h2>
              <p className="text-xs sm:text-sm leading-relaxed text-white/80">
                {movie.overview}
              </p>
            </div>

            {/* Cast & Director */}
            {(movie.director || movie.cast) && (
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-white/60 pt-1">
                {movie.director && (
                  <div>
                    <span className="font-bold text-white/90">Director: </span>
                    <span>{movie.director}</span>
                  </div>
                )}
                {movie.cast && movie.cast.length > 0 && (
                  <div>
                    <span className="font-bold text-white/90">Cast: </span>
                    <span>{movie.cast.join(", ")}</span>
                  </div>
                )}
              </div>
            )}

            {/* Save to Watchlist Button */}
            <div className="pt-2 max-w-none sm:max-w-md">
              <SaveButton movie={movie} />
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Streaming Video Player */}
      <WatchPlayer movie={movie} />

      {/* Related Movies Section */}
      {relatedMovies.length > 0 && (
        <section aria-labelledby="related-heading" className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 id="related-heading" className="text-base sm:text-xl font-bold text-white">
              More {primaryGenre} Movies
            </h2>
            <Link
              href="/"
              className="text-xs font-semibold text-amber-400 hover:underline"
            >
              Explore All
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {relatedMovies.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
