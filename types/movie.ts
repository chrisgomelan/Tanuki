export interface MovieBase {
  id: number;
  imdb_id?: string | null;
  title: string;
  original_title?: string;
  overview: string;
  poster_path: string;
  backdrop_path?: string | null;
  release_date: string;
  vote_average: number;
  runtime?: number | null; // in minutes
  genres: string[];
  tagline?: string | null;
}

export interface MovieFull extends MovieBase {
  budget?: number;
  revenue?: number;
  status: string;
  director?: string;
  cast?: string[];
  trailer_url?: string | null;
}

export type WatchStatus = "watching" | "plan_to_watch" | "completed" | "dropped";

export interface MovieSavepoint {
  id: number;
  imdb_id?: string | null;
  title: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  status: WatchStatus;
  timestamp: number; // in seconds
  duration: number; // in seconds
  lastWatched: number; // unix timestamp
}
