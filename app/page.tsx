import HeroBanner from "@/components/HeroBanner";
import HomeGenreSection from "@/components/HomeGenreSection";
import { getFeaturedMovie, getTopRatedMovies, getTrendingMovies } from "@/lib/movies-api";

export const revalidate = 3600;

export default async function HomePage() {
  const [featured, trending, topRated] = await Promise.all([
    getFeaturedMovie(),
    getTrendingMovies(12),
    getTopRatedMovies(12),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-6 space-y-8 sm:space-y-12">
      {/* Hero Featured Movie Banner */}
      {featured && <HeroBanner movie={featured} />}

      {/* Interactive Genre Filters & Movie Grids */}
      <HomeGenreSection
        initialTrending={trending}
        initialTopRated={topRated}
      />
    </div>
  );
}
