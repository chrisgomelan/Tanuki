"use client";

import { BookmarkIcon, CheckIcon } from "@/components/Icons";
import { useMovieSavepoints } from "@/lib/savepoints";
import type { MovieBase, WatchStatus } from "@/types/movie";

interface SaveButtonProps {
  movie: MovieBase;
}

const STATUSES: { key: WatchStatus; label: string }[] = [
  { key: "watching", label: "Watching" },
  { key: "plan_to_watch", label: "Plan to Watch" },
  { key: "completed", label: "Completed" },
];

export default function SaveButton({ movie }: SaveButtonProps) {
  const { ready, get, upsert, remove } = useMovieSavepoints();
  const current = ready ? get(movie.id) : undefined;

  const handleStatusChange = (status: WatchStatus) => {
    if (current?.status === status) {
      remove(movie.id);
    } else {
      upsert(movie, status);
    }
  };

  return (
    <div className="rounded-2xl bg-white/[0.04] p-3 sm:p-4 ring-1 ring-white/10 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookmarkIcon className="size-4 text-amber-400" />
          <span className="text-xs font-bold text-white">Track in My Library</span>
        </div>
        {current && (
          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 ring-1 ring-amber-500/30">
            Saved
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {STATUSES.map(({ key, label }) => {
          const isActive = current?.status === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => handleStatusChange(key)}
              className={`flex min-h-[38px] sm:min-h-[40px] items-center justify-center gap-1 rounded-xl py-1.5 px-1 sm:px-2 text-[10px] xs:text-[11px] sm:text-xs font-bold transition active:scale-95 text-center leading-tight cursor-pointer ${
                isActive
                  ? "bg-amber-500 text-black shadow-md shadow-amber-950/40 ring-1 ring-amber-300"
                  : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white ring-1 ring-white/10"
              }`}
            >
              {isActive && <CheckIcon className="size-3 text-black shrink-0" />}
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
