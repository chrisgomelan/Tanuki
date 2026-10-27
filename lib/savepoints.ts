"use client";

import { useEffect, useState } from "react";
import type { MovieBase, MovieSavepoint, WatchStatus } from "@/types/movie";

const STORAGE_KEY = "tanuki_movie_savepoints_v1";

export function useMovieSavepoints() {
  const [savepoints, setSavepoints] = useState<Record<number, MovieSavepoint>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setSavepoints(JSON.parse(raw));
      }
    } catch (e) {
      console.warn("Failed to read Tanuki savepoints:", e);
    } finally {
      setReady(true);
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && event.newValue) {
        try {
          setSavepoints(JSON.parse(event.newValue));
        } catch {
          // ignore corrupted data
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const persist = (data: Record<number, MovieSavepoint>) => {
    setSavepoints(data);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("Failed to write Tanuki savepoints:", e);
    }
  };

  const get = (id: number): MovieSavepoint | undefined => savepoints[id];

  const upsert = (
    movie: MovieBase,
    status: WatchStatus = "watching",
    timestamp: number = 0,
    duration: number = (movie.runtime ?? 120) * 60
  ) => {
    const existing = savepoints[movie.id];
    const updated: MovieSavepoint = {
      id: movie.id,
      imdb_id: movie.imdb_id ?? existing?.imdb_id,
      title: movie.title,
      poster_path: movie.poster_path,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      status,
      timestamp: timestamp > 0 ? timestamp : (existing?.timestamp ?? 0),
      duration: duration > 0 ? duration : (existing?.duration ?? (movie.runtime ?? 120) * 60),
      lastWatched: Date.now(),
    };

    const next = { ...savepoints, [movie.id]: updated };
    persist(next);
  };

  const remove = (id: number) => {
    const next = { ...savepoints };
    delete next[id];
    persist(next);
  };

  const list = (): MovieSavepoint[] => {
    return Object.values(savepoints).sort((a, b) => b.lastWatched - a.lastWatched);
  };

  return { ready, savepoints, get, upsert, remove, list };
}
