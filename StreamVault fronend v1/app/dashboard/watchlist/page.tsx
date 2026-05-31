"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { VideoCard } from "@/components/video/VideoCard";
import { useAuth } from "@/contexts/AuthContext";
import { useUserData } from "@/contexts/UserDataContext";
import { hasPremiumAccess } from "@/lib/access";
import { fetchCatalogAnime, getCatalogAnime } from "@/lib/catalog";
import type { Anime } from "@/lib/types";

export default function WatchlistPage() {
  const { user } = useAuth();
  const { watchlist } = useUserData();
  const canUseWatchlist = hasPremiumAccess(user);
  const [catalog, setCatalog] = useState<Anime[]>(() => getCatalogAnime());
  const watchlistIds = useMemo(() => new Set(watchlist), [watchlist]);
  const shows = useMemo(
    () => catalog.filter((a) => watchlistIds.has(a.id)),
    [catalog, watchlistIds]
  );

  useEffect(() => {
    if (!canUseWatchlist) return;

    let active = true;
    void fetchCatalogAnime()
      .then((items) => {
        if (active) setCatalog(items);
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [canUseWatchlist]);

  if (!canUseWatchlist) {
    return (
      <div>
        <h2 className="text-lg font-semibold text-white">Watchlist / favourites</h2>
        <div className="mt-8 rounded-xl border border-amber-500/30 bg-amber-500/10 p-6">
          <p className="font-medium text-white">Watchlist is a Premium feature.</p>
          <p className="mt-2 text-sm text-zinc-300">
            Upgrade to Premium to save shows and sync your watchlist.
          </p>
          <Link
            href="/dashboard/subscription"
            className="mt-4 inline-block text-sm font-medium text-[var(--sv-orange)]"
          >
            Upgrade to Premium {"->"}
          </Link>
        </div>
      </div>
    );
  }

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
