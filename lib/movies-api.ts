import { MOVIES } from "@/lib/movies-data";
import type { MovieBase, MovieFull } from "@/types/movie";

const CINEMETA_BASE = "https://v3-cinemeta.strem.io";

function parseCinemetaMeta(item: any): MovieBase {
  const imdbId = String(item.id ?? "");
  const runtimeMin = typeof item.runtime === "string" ? parseInt(item.runtime, 10) : item.runtime;
  const genres =
    Array.isArray(item.genres) && item.genres.length > 0
      ? item.genres
      : Array.isArray(item.genre)
      ? item.genre
      : [];

  return {
    id: imdbId,
    imdb_id: imdbId.startsWith("tt") ? imdbId : null,
    title: item.name ?? "Untitled Movie",
    original_title: item.name ?? "Untitled Movie",
    overview: item.description ?? "No synopsis available.",
    poster_path: item.poster ?? "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80",
    backdrop_path: item.background ?? item.poster ?? null,
    release_date: item.releaseInfo ?? item.year ? String(item.releaseInfo ?? item.year) : "2024",
    vote_average: typeof item.imdbRating === "string" ? parseFloat(item.imdbRating) || 7.5 : (item.imdbRating || 7.5),
    runtime: !isNaN(runtimeMin) && runtimeMin > 0 ? runtimeMin : 120,
    genres,
    tagline: null,
  };
}

export async function getFeaturedMovie(): Promise<MovieFull> {
  return MOVIES[0];
}

export async function getTrendingMovies(limit = 24): Promise<MovieBase[]> {
  try {
    const res = await fetch(`${CINEMETA_BASE}/catalog/movie/top.json`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.metas) && data.metas.length > 0) {
        const live = data.metas.map(parseCinemetaMeta);
        const merged = [...MOVIES.slice(0, 12), ...live];
        const seen = new Set();
        return merged.filter((m: MovieBase) => {
          const key = m.title.toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        }).slice(0, limit);
      }
    }
  } catch (err) {
    console.warn("[api] Cinemeta trending fetch fallback:", err);
  }
  return MOVIES.slice(0, limit);
}

export async function getTopRatedMovies(limit = 24): Promise<MovieBase[]> {
  const sorted = [...MOVIES].sort((a, b) => b.vote_average - a.vote_average);
  return sorted.slice(0, limit);
}

export function matchesYear(releaseDate: string | undefined | null, yearFilter: string): boolean {
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

export async function getMoviesByGenre(
  genre: string,
  page = 1,
  limit = 24,
  year?: string
): Promise<MovieBase[]> {
  const isAll = !genre || genre === "All";
  const hasYear = Boolean(year && year !== "All");
  const skip = (page - 1) * limit;
  const isSingleYear = hasYear && /^\d{4}$/.test(year!);

  let url: string;
  if (isSingleYear && isAll) {
    url =
      skip > 0
        ? `${CINEMETA_BASE}/catalog/movie/year/genre=${year}/skip=${skip}.json`
        : `${CINEMETA_BASE}/catalog/movie/year/genre=${year}.json`;
  } else if (isAll) {
    url =
      skip > 0
        ? `${CINEMETA_BASE}/catalog/movie/top/skip=${skip}.json`
        : `${CINEMETA_BASE}/catalog/movie/top.json`;
  } else {
    url =
      skip > 0
        ? `${CINEMETA_BASE}/catalog/movie/top/genre=${encodeURIComponent(genre)}/skip=${skip}.json`
        : `${CINEMETA_BASE}/catalog/movie/top/genre=${encodeURIComponent(genre)}.json`;
  }

  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.metas) && data.metas.length > 0) {
        let live = data.metas.map(parseCinemetaMeta);
        if (hasYear && !isSingleYear) {
          live = live.filter((m: MovieBase) => matchesYear(m.release_date, year!));
        }

        if (isAll) {
          let localBatch = page === 1 ? MOVIES : [];
          if (hasYear) {
            localBatch = localBatch.filter((m) => matchesYear(m.release_date, year!));
          }
          const combined = [...localBatch, ...live];
          const seen = new Set();
          return combined
            .filter((m: MovieBase) => {
              const key = m.title.toLowerCase();
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            })
            .slice(0, limit);
        }

        const g = genre.toLowerCase();
        let localMatches = MOVIES.filter((m) =>
          m.genres.some((item) => item.toLowerCase() === g)
        );
        if (hasYear) {
          localMatches = localMatches.filter((m) => matchesYear(m.release_date, year!));
        }
        const combined = page === 1 ? [...localMatches, ...live] : live;
        const seen = new Set();
        return combined
          .filter((m: MovieBase) => {
            const key = m.title.toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          })
          .slice(0, limit);
      }
    }
  } catch (err) {
    console.warn(`[api] Cinemeta genre (${genre}) fallback:`, err);
  }

  // Local fallback
  let fallbackList = isAll
    ? MOVIES
    : MOVIES.filter((m) => m.genres.some((item) => item.toLowerCase() === genre.toLowerCase()));
  if (hasYear) {
    fallbackList = fallbackList.filter((m) => matchesYear(m.release_date, year!));
  }
  return fallbackList.slice(skip, skip + limit);
}

export async function getMovieById(id: string | number): Promise<MovieFull | null> {
  const strId = String(id);

  // Check local database first
  const found = MOVIES.find((m) => String(m.id) === strId || m.imdb_id === strId);
  if (found) return found;

  // Query Cinemeta's live metadata API for any IMDb ID (tt...)
  if (strId.startsWith("tt")) {
    try {
      let res = await fetch(`${CINEMETA_BASE}/meta/movie/${strId}.json`, {
        next: { revalidate: 86400 },
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) {
        res = await fetch(`${CINEMETA_BASE}/meta/series/${strId}.json`, {
          next: { revalidate: 86400 },
          signal: AbortSignal.timeout(5000),
        });
      }

      if (res.ok) {
        const data = await res.json();
        if (data.meta) {
          const item = data.meta;
          const base = parseCinemetaMeta(item);
          const trailerYtId =
            item.trailer ??
            item.trailerStreams?.[0]?.ytId ??
            (Array.isArray(item.trailers) ? item.trailers[0]?.source : null);

          return {
            ...base,
            status: "Released",
            director: Array.isArray(item.director)
              ? item.director.join(", ")
              : (item.director ?? undefined),
            cast: Array.isArray(item.cast) ? item.cast : [],
            trailer_url: trailerYtId ? `https://www.youtube.com/watch?v=${trailerYtId}` : null,
          };
        }
      }
    } catch (err) {
      console.warn(`[api] Cinemeta meta fetch error (${strId}):`, err);
    }
  }

  return null;
}

export async function searchMovies(query: string, limit = 18): Promise<MovieBase[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const localMatches = MOVIES.filter(
    (m) =>
      m.title.toLowerCase().includes(q) ||
      (m.original_title ?? "").toLowerCase().includes(q) ||
      m.genres.some((g) => g.toLowerCase().includes(q)) ||
      (m.director ?? "").toLowerCase().includes(q) ||
      (m.cast ?? []).some((c) => c.toLowerCase().includes(q))
  );

  try {
    const res = await fetch(
      `${CINEMETA_BASE}/catalog/movie/top/search=${encodeURIComponent(query.trim())}.json`,
      { next: { revalidate: 300 }, signal: AbortSignal.timeout(5000) }
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.metas)) {
        const liveMatches = data.metas.map(parseCinemetaMeta);
        const merged = [...localMatches, ...liveMatches];
        const seen = new Set();
        return merged.filter((m: MovieBase) => {
          const key = m.title.toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        }).slice(0, limit);
      }
    }
  } catch (err) {
    console.warn("[api] Cinemeta live search fallback:", err);
  }

  return localMatches.slice(0, limit);
}
