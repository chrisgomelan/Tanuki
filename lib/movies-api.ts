import { MOVIES } from "@/lib/movies-data";
import type { MovieBase, MovieFull } from "@/types/movie";

export async function getFeaturedMovie(): Promise<MovieFull> {
  return MOVIES[0]; // Oppenheimer or Dune 2
}

export async function getTrendingMovies(limit = 12): Promise<MovieBase[]> {
  return MOVIES.slice(0, limit);
}

export async function getTopRatedMovies(limit = 12): Promise<MovieBase[]> {
  return [...MOVIES]
    .sort((a, b) => b.vote_average - a.vote_average)
    .slice(0, limit);
}

export async function getMoviesByGenre(genre: string, limit = 18): Promise<MovieBase[]> {
  if (!genre || genre === "All") {
    return MOVIES.slice(0, limit);
  }
  const g = genre.toLowerCase();
  return MOVIES.filter((m) =>
    m.genres.some((item) => item.toLowerCase() === g)
  ).slice(0, limit);
}

export async function getMovieById(id: number): Promise<MovieFull | null> {
  const found = MOVIES.find((m) => m.id === id);
  return found ?? null;
}

export async function searchMovies(query: string, limit = 12): Promise<MovieBase[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return MOVIES.filter(
    (m) =>
      m.title.toLowerCase().includes(q) ||
      (m.original_title ?? "").toLowerCase().includes(q) ||
      m.genres.some((g) => g.toLowerCase().includes(q)) ||
      (m.director ?? "").toLowerCase().includes(q) ||
      (m.cast ?? []).some((c) => c.toLowerCase().includes(q))
  ).slice(0, limit);
}
