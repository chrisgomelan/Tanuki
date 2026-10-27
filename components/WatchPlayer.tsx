"use client";

import { useEffect, useState } from "react";
import { useMovieSavepoints } from "@/lib/savepoints";
import {
  BookmarkIcon,
  CheckIcon,
  ChevronDownIcon,
  ExternalLinkIcon,
  MiniPlayerIcon,
} from "@/components/Icons";
import type { MovieFull } from "@/types/movie";

interface WatchPlayerProps {
  movie: MovieFull;
}

const SERVERS = [
  {
    id: "vidlink",
    name: "VidLink (HD Movie)",
    getUrl: (id: string | number, _imdb: string | null | undefined) =>
      `https://vidlink.pro/movie/${id}?primaryColor=f59e0b&secondaryColor=d97706`,
  },
  {
    id: "vidsrc-me",
    name: "VidSrc Stream",
    getUrl: (id: string | number, imdb: string | null | undefined) =>
      imdb ? `https://vidsrc.me/embed/movie?imdb=${imdb}` : `https://vidsrc.me/embed/movie?tmdb=${id}`,
  },
  {
    id: "autoembed",
    name: "AutoEmbed (Multi-Source)",
    getUrl: (id: string | number, _imdb: string | null | undefined) =>
      `https://player.autoembed.cc/embed/movie/${id}`,
  },
  {
    id: "vidsrc-cc",
    name: "VidSrc CC (Sub & Dub)",
    getUrl: (id: string | number, _imdb: string | null | undefined) =>
      `https://vidsrc.cc/v2/embed/movie/${id}`,
  },
  {
    id: "multiembed",
    name: "MultiEmbed Stream",
    getUrl: (id: string | number, imdb: string | null | undefined) =>
      `https://multiembed.mov/?video_id=${imdb || id}`,
  },
  {
    id: "embedsu",
    name: "Embed.su (Fast)",
    getUrl: (id: string | number, _imdb: string | null | undefined) =>
      `https://embed.su/embed/movie/${id}`,
  },
  {
    id: "videasy",
    name: "Videasy Server",
    getUrl: (id: string | number, _imdb: string | null | undefined) =>
      `https://player.videasy.to/movie/${id}`,
  },
  {
    id: "twoembed",
    name: "2Embed Player",
    getUrl: (id: string | number, imdb: string | null | undefined) =>
      `https://www.2embed.cc/embed/${imdb || id}`,
  },
  {
    id: "smashystream",
    name: "SmashyStream",
    getUrl: (id: string | number, _imdb: string | null | undefined) =>
      `https://embed.smashystream.com/playere.php?tmdb=${id}`,
  },
];

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

export default function WatchPlayer({ movie }: WatchPlayerProps) {
  const { ready, get, upsert } = useMovieSavepoints();
  const current = get(movie.id);

  const [server, setServer] = useState(SERVERS[0].id);
  const [savedTime, setSavedTime] = useState<number>(current?.timestamp ?? 0);
  const [minutesInput, setMinutesInput] = useState<string>("");
  const [secondsInput, setSecondsInput] = useState<string>("");
  const [saveToast, setSaveToast] = useState<string | null>(null);

  useEffect(() => {
    if (ready && current) {
      if (current.timestamp !== undefined) {
        setSavedTime(current.timestamp);
        const m = Math.floor(current.timestamp / 60);
        const s = current.timestamp % 60;
        setMinutesInput(String(m));
        setSecondsInput(String(s));
      }
    }
  }, [ready, current]);

  const activeServer = SERVERS.find((s) => s.id === server) ?? SERVERS[0];
  const playerUrl = activeServer.getUrl(movie.id, movie.imdb_id);

  const handleSaveTimestamp = () => {
    const mins = parseInt(minutesInput || "0", 10);
    const secs = parseInt(secondsInput || "0", 10);
    const totalSecs = Math.max(0, mins * 60 + secs);

    setSavedTime(totalSecs);
    upsert(movie, "watching", totalSecs, (movie.runtime ?? 120) * 60);
    showToast(`Saved resume point: ${formatTime(totalSecs)}`);
  };

  const showToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3000);
  };

  return (
    <div className="relative mt-8 space-y-4 rounded-2xl bg-white/[0.03] p-3.5 sm:space-y-5 sm:rounded-3xl sm:p-6 ring-1 ring-white/10 backdrop-blur-sm">
      {/* Toast notification */}
      {saveToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 sm:bottom-6 left-1/2 z-50 flex items-center gap-1.5 -translate-x-1/2 rounded-full bg-amber-500 px-5 py-2.5 text-xs font-bold text-black shadow-xl shadow-amber-950/80 ring-1 ring-white/30 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <CheckIcon className="size-4 shrink-0 text-black" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Header Info */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
            </span>
            <h2 className="text-base sm:text-xl font-bold text-white">Watch Full Movie</h2>
            <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-semibold text-amber-300 ring-1 ring-amber-500/30">
              HD
            </span>
          </div>
          <p className="mt-1 text-xs text-white/50">
            {savedTime > 0 ? (
              <>
                Saved resume point:{" "}
                <span className="font-semibold text-amber-400">{formatTime(savedTime)}</span>
              </>
            ) : (
              "Select from multiple high-availability free streaming servers"
            )}
          </p>
        </div>

        {/* Server & Actions */}
        <div className="flex items-center gap-2">
          {/* Server Select Dropdown */}
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={server}
              onChange={(e) => setServer(e.target.value)}
              aria-label="Streaming Server"
              className="h-11 sm:h-9 w-full rounded-xl bg-white/10 pl-3 pr-8 text-xs font-semibold text-white/90 ring-1 ring-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer appearance-none transition hover:bg-white/15"
            >
              {SERVERS.map((srv) => (
                <option key={srv.id} value={srv.id} className="bg-zinc-900 text-white">
                  {srv.name}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-white/50">
              <ChevronDownIcon className="size-3" />
            </span>
          </div>

          {/* New tab button */}
          <a
            href={playerUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in new window"
            className="flex h-11 sm:h-9 items-center justify-center gap-1.5 rounded-xl bg-white/10 px-3 text-xs font-semibold text-white/80 transition hover:bg-white/20 active:scale-95 shrink-0"
          >
            <ExternalLinkIcon className="size-3.5" />
            <span className="hidden xs:inline">New Tab</span>
          </a>

          {/* Float Mini Player */}
          <button
            type="button"
            onClick={() => {
              window.open(
                playerUrl,
                "TanukiFloatPlayer",
                "width=854,height=480,left=100,top=100,resizable=yes,scrollbars=no,status=no,toolbar=no,menubar=no"
              );
            }}
            title="Pop out a floating mini-player"
            className="hidden sm:inline-flex h-9 items-center gap-1.5 rounded-xl bg-amber-500/20 px-3 text-xs font-semibold text-amber-200 ring-1 ring-amber-500/40 transition hover:bg-amber-500 hover:text-black active:scale-95 shrink-0"
          >
            <MiniPlayerIcon className="size-3.5" />
            <span>Mini Player</span>
          </button>
        </div>
      </div>

      {/* Embedded Video Player */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-2xl ring-1 ring-white/10 sm:rounded-2xl">
        <iframe
          key={`${activeServer.id}-${movie.id}`}
          src={playerUrl}
          title={movie.title}
          className="h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen
        />
      </div>

      {/* Timestamp Bookmark & Resume Controller */}
      <div className="rounded-xl bg-white/[0.04] p-3 sm:p-4 ring-1 ring-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookmarkIcon className="size-4 text-amber-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white">Save Exact Playback Timestamp</h4>
              <p className="text-[11px] text-white/50">
                Paused the movie? Bookmark your minute and second to resume next time.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2">
            <div className="flex items-center gap-1 bg-black/40 rounded-xl px-3 py-2 sm:px-2.5 sm:py-1.5 ring-1 ring-white/15">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={3}
                placeholder="MM"
                value={minutesInput}
                onChange={(e) => setMinutesInput(e.target.value.replace(/\D/g, ""))}
                className="w-10 sm:w-12 bg-transparent text-center text-sm sm:text-xs font-bold text-white focus:outline-none placeholder-white/30"
              />
              <span className="text-xs text-white/40">:</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={2}
                placeholder="SS"
                value={secondsInput}
                onChange={(e) => setSecondsInput(e.target.value.replace(/\D/g, ""))}
                className="w-8 sm:w-10 bg-transparent text-center text-sm sm:text-xs font-bold text-white focus:outline-none placeholder-white/30"
              />
            </div>

            <button
              type="button"
              onClick={handleSaveTimestamp}
              className="flex min-h-[40px] sm:min-h-[36px] items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-black transition hover:bg-amber-400 active:scale-95 cursor-pointer"
            >
              <CheckIcon className="size-3.5 text-black" />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
