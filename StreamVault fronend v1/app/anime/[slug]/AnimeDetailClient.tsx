"use client";

import Link from "next/link";
import { useUserData } from "@/contexts/UserDataContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { Anime, Episode } from "@/lib/types";

export function AnimeDetailClient({
  anime,
  episodes,
}: {
  anime: Anime;
  episodes: Episode[];
}) {
  const { isInWatchlist, toggleWatchlist } = useUserData();
  const inList = isInWatchlist(anime.id);

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-white">Episodes</h2>
        <Button
          variant={inList ? "secondary" : "outline"}
          size="sm"
          onClick={() => toggleWatchlist(anime.id)}
        >
          {inList ? "✓ In watchlist" : "+ Add to watchlist"}
        </Button>
      </div>
      <ul className="mt-4 divide-y divide-zinc-800 rounded-xl border border-zinc-800">
        {episodes.map((ep) => (
          <li key={ep.id}>
            <Link
              href={`/watch/${anime.id}/${ep.id}`}
              className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-zinc-900"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ep.thumbnailUrl}
                alt=""
                className="h-14 w-24 shrink-0 rounded object-cover"
                width={96}
                height={56}
                loading="lazy"
              />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-white">
                  {ep.number}. {ep.title}
                </p>
                <p className="text-xs text-zinc-500">{ep.duration}</p>
              </div>
              {ep.isPremium && <Badge variant="premium">Premium</Badge>}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
