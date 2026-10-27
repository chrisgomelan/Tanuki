import { NextResponse } from "next/server";
import { searchMovies } from "@/lib/movies-api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await searchMovies(q, 10);
    return NextResponse.json({ results });
  } catch (err) {
    console.warn("[api/search] Error searching movies:", err);
    return NextResponse.json({ results: [] });
  }
}
