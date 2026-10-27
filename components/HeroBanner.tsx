"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ClockIcon, FilmIcon, PlayIcon, StarIcon } from "@/components/Icons";
import type { MovieFull } from "@/types/movie";

const FALLBACK_BACKDROP = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&auto=format&fit=crop&q=80";

interface HeroBannerProps {
  movie: MovieFull;
}

export default function HeroBanner({ movie }: HeroBannerProps) {
  const year = movie.release_date ? movie.release_date.slice(0, 4) : "";
  const [bgSrc, setBgSrc] = useState(movie.backdrop_path || movie.poster_path || FALLBACK_BACKDROP);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-zinc-900 ring-1 ring-white/15 shadow-2xl">
      {/* Cinematic Backdrop Image */}
      <div className="absolute inset-0">
        <Image
          src={bgSrc}
          alt={movie.title}
          fill
          priority
          unoptimized
          onError={() => setBgSrc(FALLBACK_BACKDROP)}
          sizes="100vw"
          className="object-cover object-center opacity-40 brightness-75 scale-105"
        />
      </div>

      {/* Radial and Linear Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d14] via-[#0c0d14]/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0c0d14] via-[#0c0d14]/80 to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-end p-5 sm:p-8 md:p-12 min-h-[380px] sm:min-h-[440px] max-w-3xl">
        {/* Pill Header */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300 ring-1 ring-amber-400/40 backdrop-blur-md">
            <FilmIcon className="size-3.5" />
            <span>Featured Movie</span>
          </span>
          {movie.vote_average > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-bold text-amber-300 ring-1 ring-white/15 backdrop-blur-md">
              <StarIcon className="size-3 text-amber-400" />
              <span>{movie.vote_average.toFixed(1)}</span>
            </span>
          )}
          {movie.runtime && (
            <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white/70 ring-1 ring-white/15 backdrop-blur-md">
              <ClockIcon className="size-3" />
              <span>{movie.runtime} min</span>
            </span>
          )}
          {year && (
            <span className="rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white/70 ring-1 ring-white/15 backdrop-blur-md">
              {year}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-md">
          {movie.title}
        </h1>

        {/* Tagline */}
        {movie.tagline && (
          <p className="mt-1 text-xs sm:text-sm font-semibold italic text-amber-300/80">
            &ldquo;{movie.tagline}&rdquo;
          </p>
        )}

        {/* Synopsis */}
        <p className="mt-3 line-clamp-2 sm:line-clamp-3 text-xs sm:text-sm leading-relaxed text-white/80 max-w-2xl drop-shadow">
          {movie.overview}
        </p>

        {/* Genres */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {movie.genres.map((g) => (
            <span
              key={g}
              className="rounded-lg bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-white/80 ring-1 ring-white/10"
            >
              {g}
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href={`/movie/${movie.id}`}
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-xs sm:text-sm font-bold text-black shadow-lg shadow-amber-950/60 ring-1 ring-amber-300 transition hover:bg-amber-400 active:scale-95"
          >
            <PlayIcon className="size-4" />
            <span>Watch Full Movie</span>
          </Link>

          <Link
            href={`/movie/${movie.id}`}
            className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-xs sm:text-sm font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/20 active:scale-95 backdrop-blur-md"
          >
            <span>Details & Streaming</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
