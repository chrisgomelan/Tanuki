"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookmarkIcon, PlayIcon, StarIcon } from "@/components/Icons";
import { useMovieSavepoints } from "@/lib/savepoints";
import type { MovieBase } from "@/types/movie";

const FALLBACK_POSTER = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80";

interface MovieCardProps {
  movie: MovieBase;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const { ready, get } = useMovieSavepoints();
  const saved = ready ? get(movie.id) : undefined;
  const year = movie.release_date ? movie.release_date.slice(0, 4) : "";
  const [imgSrc, setImgSrc] = useState(movie.poster_path || FALLBACK_POSTER);

  return (
    <Link
      href={`/movie/${movie.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white/[0.04] p-2 ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.08] hover:ring-amber-500/50 hover:shadow-xl hover:shadow-amber-950/30"
    >
      {/* Poster Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-zinc-900">
        <Image
          src={imgSrc}
          alt={movie.title}
          fill
          unoptimized
          onError={() => setImgSrc(FALLBACK_POSTER)}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Hover Gradient Overlay & Quick Play */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-500 text-black shadow-lg shadow-amber-950/80 transition-transform duration-300 group-hover:scale-110">
            <PlayIcon className="size-5 ml-0.5" />
          </div>
        </div>

        {/* Score Badge */}
        {movie.vote_average > 0 && (
          <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[11px] font-bold text-amber-300 backdrop-blur-md ring-1 ring-amber-500/40">
            <StarIcon className="size-2.5 text-amber-400" />
            <span>{movie.vote_average.toFixed(1)}</span>
          </div>
        )}

        {/* Saved Watchlist Bookmark Chip */}
        {saved && (
          <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-black shadow-md ring-1 ring-white/40">
            <BookmarkIcon className="size-3 fill-current" />
          </div>
        )}

        {/* Runtime Badge */}
        {movie.runtime && (
          <div className="absolute bottom-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white/80 backdrop-blur-md ring-1 ring-white/10">
            {movie.runtime}m
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="mt-2.5 flex flex-1 flex-col justify-between px-1">
        <div>
          <h3 className="line-clamp-1 text-xs sm:text-sm font-bold text-white group-hover:text-amber-400 transition">
            {movie.title}
          </h3>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-white/50">
            {year && <span>{year}</span>}
            {movie.genres?.[0] && (
              <>
                <span>•</span>
                <span className="truncate">{movie.genres[0]}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
