"use client";

import { VideoCard } from "@/components/video/VideoCard";
import { useUserData } from "@/contexts/UserDataContext";
import { getCatalogAnime } from "@/lib/catalog";

export default function WatchlistPage() {
  const { watchlist } = useUserData();
  const shows = getCatalogAnime().filter((a) => watchlist.includes(a.id));

  return (
    <div>
      <h2 className="text-lg font-semibold text-white">Watchlist / favourites</h2>
      {shows.length === 0 ? (
        <p className="mt-8 text-center text-zinc-500">
          Your watchlist is empty. Add shows from their detail page.
        </p>
      ) : (
        <div className="mt-6 flex flex-wrap gap-4">
          {shows.map((a) => (
            <VideoCard key={a.id} anime={a} />
          ))}
        </div>
      )}
    </div>
  );
}
