"use client";

import Link from "next/link";
import { useUserData } from "@/contexts/UserDataContext";
import { getCatalogAnime, getEpisodesForAnime } from "@/lib/catalog";

export default function HistoryPage() {
  const { history } = useUserData();
  const all = getCatalogAnime();

  return (
    <div>
      <h2 className="text-lg font-semibold text-white">Watch history</h2>
      {history.length === 0 ? (
        <p className="mt-8 text-center text-zinc-500">
          No history yet. Start watching an episode!
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-zinc-800">
          {history.map((h) => {
            const anime = all.find((a) => a.id === h.animeId);
            const ep = getEpisodesForAnime(h.animeId).find((e) => e.id === h.episodeId);
            if (!anime || !ep) return null;
            return (
              <li key={`${h.animeId}-${h.episodeId}-${h.watchedAt}`}>
                <Link
                  href={`/watch/${anime.id}/${ep.id}`}
                  className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between hover:text-[var(--sv-orange)]"
                >
                  <span className="font-medium text-white">
                    {anime.title} — Episode {ep.number}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {Math.round(h.progress)}% · {new Date(h.watchedAt).toLocaleDateString()}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
