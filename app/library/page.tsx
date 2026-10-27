"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BookmarkIcon, CloseIcon, PlayIcon, StarIcon, FilmIcon } from "@/components/Icons";
import { useMovieSavepoints } from "@/lib/savepoints";
import type { WatchStatus } from "@/types/movie";

const TABS: { key: "all" | WatchStatus; label: string }[] = [
  { key: "all", label: "All Movies" },
  { key: "watching", label: "Watching" },
  { key: "plan_to_watch", label: "Plan to Watch" },
  { key: "completed", label: "Completed" },
];

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

export default function LibraryPage() {
  const { ready, list, remove } = useMovieSavepoints();
  const [activeTab, setActiveTab] = useState<"all" | WatchStatus>("all");

  const movies = ready ? list() : [];
  const filtered = activeTab === "all" ? movies : movies.filter((m) => m.status === activeTab);

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BookmarkIcon className="size-5 text-amber-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white">My Library</h1>
          </div>
          <p className="mt-1 text-xs text-white/50">
            Track movies, saved timestamps, and your custom watchlist. Saved locally in your browser.
          </p>
        </div>

        {/* Tab Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {TABS.map(({ key, label }) => {
            const isActive = activeTab === key;
            const count = key === "all" ? movies.length : movies.filter((m) => m.status === key).length;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold whitespace-nowrap transition active:scale-95 ${
                  isActive
                    ? "bg-amber-500 text-black shadow-md shadow-amber-950/40 ring-1 ring-amber-300"
                    : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white ring-1 ring-white/10"
                }`}
              >
                <span>{label}</span>
                <span className="rounded-full bg-black/20 px-1.5 py-0.2 text-[10px]">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Movies Grid or Empty State */}
      {!ready ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] w-full animate-pulse rounded-2xl bg-white/5 ring-1 ring-white/10" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 py-20 text-center">
          <FilmIcon className="mx-auto size-10 text-white/20" />
          <h3 className="mt-3 text-sm font-bold text-white">No movies saved in this section</h3>
          <p className="mt-1 text-xs text-white/40 max-w-sm mx-auto">
            Browse trending and top-rated movies to add titles to your watchlist.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-black transition hover:bg-amber-400 active:scale-95"
          >
            <PlayIcon className="size-3.5" />
            <span>Discover Movies</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl bg-white/[0.04] p-2 ring-1 ring-white/10 transition hover:bg-white/[0.08]"
            >
              <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-zinc-900">
                {item.poster_path ? (
                  <Image
                    src={item.poster_path}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : null}

                {/* Score badge */}
                {item.vote_average > 0 && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[11px] font-bold text-amber-300 backdrop-blur-md ring-1 ring-amber-500/40">
                    <StarIcon className="size-2.5 text-amber-400" />
                    <span>{item.vote_average.toFixed(1)}</span>
                  </div>
                )}

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  title="Remove from library"
                  className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white/70 hover:bg-red-600 hover:text-white transition backdrop-blur-md ring-1 ring-white/20"
                >
                  <CloseIcon className="size-3" />
                </button>

                {/* Resume Play Overlay */}
                <Link
                  href={`/movie/${item.id}`}
                  className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition duration-200"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-500 text-black shadow-lg">
                    <PlayIcon className="size-5 ml-0.5" />
                  </div>
                </Link>
              </div>

              <div className="mt-2.5 px-1 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="line-clamp-1 text-xs sm:text-sm font-bold text-white">
                    {item.title}
                  </h3>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-white/50">
                    <span className="capitalize">{item.status.replace(/_/g, " ")}</span>
                    {item.timestamp > 0 && (
                      <span className="font-semibold text-amber-400">
                        {formatTime(item.timestamp)}
                      </span>
                    )}
                  </div>
                </div>

                <Link
                  href={`/movie/${item.id}`}
                  className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg bg-amber-500/20 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500 hover:text-black transition"
                >
                  <span>Watch</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
