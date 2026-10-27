import { NextResponse } from "next/server";
import { getMoviesByGenre } from "@/lib/movies-api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name")?.trim();
  const page = parseInt(searchParams.get("page") || "1", 10);

  if (!name || name === "All") {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await getMoviesByGenre(name, page, 24);
    return NextResponse.json({ results: results || [] });
  } catch (err) {
    console.warn("[api/genre] Error fetching genre movies:", err);
    return NextResponse.json({ results: [] });
  }
}
